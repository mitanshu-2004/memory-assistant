import chromadb
from pathlib import Path
import logging
from .ai_processor import generate_embedding

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Always use local storage
VECTOR_PATH = Path("./data/vectors")
VECTOR_PATH.mkdir(parents=True, exist_ok=True)

# Persistent client (saves embeddings to disk locally)
client = chromadb.PersistentClient(path=str(VECTOR_PATH))

# Collection for all embeddings
memory_collection = client.get_or_create_collection(name="memories")


def add_embedding(memory_id: str, embedding):
    """Add an embedding to the 'memories' collection."""
    try:
        memory_collection.add(
            ids=[str(memory_id)],
            embeddings=[embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)]
        )
        logger.info(f"Added embedding for memory {memory_id}")
    except Exception as e:
        logger.error(f"Error adding embedding for memory {memory_id}: {e}")


def query_embeddings(embedding, n_results: int = 5):
    """Query the most similar embeddings."""
    try:
        results = memory_collection.query(
            query_embeddings=[embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)],
            n_results=n_results
        )
        return results.get("ids", [[]])[0]
    except Exception as e:
        logger.error(f"Error querying embeddings: {e}")
        return []


def delete_embedding(memory_id: str):
    """Delete an embedding by memory ID."""
    try:
        memory_collection.delete(ids=[str(memory_id)])
        logger.info(f"Deleted embedding for memory {memory_id}")
    except Exception as e:
        logger.error(f"Error deleting embedding for memory {memory_id}: {e}")


def search(query: str, top_k: int = 5):
    """Search for similar memories using query text."""
    try:
        query_embedding = generate_embedding(query)
        results = memory_collection.query(
            query_embeddings=[query_embedding.tolist() if hasattr(query_embedding, "tolist") else list(query_embedding)],
            n_results=top_k
        )

        hits = []
        ids = results.get("ids", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for i, memory_id in enumerate(ids):
            score = 1.0 - distances[i] if i < len(distances) else 0.5
            hits.append({"id": memory_id, "score": max(0.0, score)})

        return hits
    except Exception as e:
        logger.error(f"Error in vector search: {e}")
        return []


def get_collection_info():
    """Return collection info."""
    try:
        return {
            "count": memory_collection.count(),
            "path": str(VECTOR_PATH)
        }
    except Exception as e:
        logger.error(f"Error getting collection info: {e}")
        return {"error": str(e), "path": str(VECTOR_PATH)}
