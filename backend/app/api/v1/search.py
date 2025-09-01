from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Dict, List
from collections import defaultdict

from app.database import models
from app.models import memory_item as memory_models
from app.models import search as search_models
from app.core import vector_store
from ..deps import get_db

router = APIRouter()

@router.get("/", response_model=search_models.SearchResults)
def search_memories(
    q: str = Query(..., description="Search query string"),
    search_type: str = Query("hybrid", regex="^(hybrid|semantic|keyword)$"),
    db: Session = Depends(get_db),
):
    q = (q or "").strip()
    if not q:
        return {"results": []}

    combined_scores: Dict[str, float] = defaultdict(float)

    # 1) Semantic search via vector store (if enabled)
    if search_type in ("hybrid", "semantic"):
        try:
            vec_hits = vector_store.search(query=q, top_k=50)
            for hit in vec_hits or []:
                mid = str(hit.get("id"))
                score = float(hit.get("score", 0.0))
                combined_scores[mid] = max(combined_scores[mid], score)
        except Exception as e:
            print(f"Vector search failed: {e}")
            # Continue without vector search

    # 2) Keyword search using SQLite LIKE
    if search_type in ("hybrid", "keyword"):
        try:
            like_pattern = f"%{q}%"
            
            keyword_results = db.query(models.Memory.id, models.Memory.title, models.Memory.content).filter(
                or_(
                    models.Memory.title.like(like_pattern),
                    models.Memory.content.like(like_pattern)
                )
            ).limit(100).all()
            
            for row in keyword_results:
                # Simple scoring for keyword matches
                score = 0.5 # Base score for a keyword match
                if q.lower() in (row.title or "").lower():
                    score += 0.3 # Boost if found in title
                if q.lower() in (row.content or "").lower():
                    score += 0.2 # Boost if found in content
                
                combined_scores[str(row.id)] = max(combined_scores[str(row.id)], score)
                
        except Exception as e:
            print(f"Keyword search failed: {e}")

    if not combined_scores:
        return {"results": []}

    # Get top results and fetch with relationships
    sorted_ids = sorted(combined_scores, key=combined_scores.get, reverse=True)[:50]
    
    try:
        results = (
            db.query(models.Memory)
            .options(
                joinedload(models.Memory.tags),
                joinedload(models.Memory.category)
            )
            .filter(models.Memory.id.in_(sorted_ids))
            .filter(models.Memory.is_archived == False)  # Exclude archived
            .all()
        )
    except Exception as e:
        print(f"Database query failed: {e}")
        return {"results": []}
    
    # Maintain score-based ordering
    results_by_id = {m.id: m for m in results}
    final_results = []
    
    for mid in sorted_ids:
        if mid in results_by_id:
            try:
                memory_obj = memory_models.Memory.from_orm(results_by_id[mid])
                final_results.append(
                    search_models.SearchResultItem(
                        memory=memory_obj,
                        score=float(combined_scores[mid])
                    )
                )
            except Exception as e:
                print(f"Error creating memory object for {mid}: {e}")
                continue
    
    return {"results": final_results}