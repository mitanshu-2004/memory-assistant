from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, text
from typing import Dict, List
from collections import defaultdict

from app.database import models
from app.models import memory_item as memory_models
from app.models import search as search_models
from app.core import vector_store
from ..deps import get_db

router = APIRouter()

def _escape_like(s: str) -> str:
    """Escape LIKE wildcards for PostgreSQL"""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

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

    # 2) Keyword search using PostgreSQL full-text search
    if search_type in ("hybrid", "keyword"):
        # PostgreSQL full-text search with tsquery
        try:
            # Clean query for tsquery - remove special characters and prepare
            clean_q = " & ".join(word for word in q.split() if word.isalnum())
            if clean_q:
                fts_results = db.query(
                    models.Memory.id,
                    func.ts_rank(
                        func.to_tsvector('english', 
                                       func.coalesce(models.Memory.title, '') + ' ' + 
                                       func.coalesce(models.Memory.content, '')),
                        func.plainto_tsquery('english', q)
                    ).label('rank')
                ).filter(
                    func.to_tsvector('english', 
                                   func.coalesce(models.Memory.title, '') + ' ' + 
                                   func.coalesce(models.Memory.content, '')).match(
                                       func.plainto_tsquery('english', q)
                                   )
                ).order_by(text('rank DESC')).limit(50).all()
                
                for row in fts_results:
                    # Use PostgreSQL's ts_rank score (normalize to 0-1)
                    fts_score = min(1.0, float(row.rank) * 2)  # Scale ts_rank
                    combined_scores[str(row.id)] = max(combined_scores[str(row.id)], fts_score)
        except Exception as e:
            print(f"FTS search failed: {e}")
        
        # Fallback: ILIKE search with trigrams for fuzzy matching
        try:
            safe = _escape_like(q)
            like_pattern = f"%{safe}%"
            
            # Use similarity for better fuzzy matching if available
            ilike_results = db.query(models.Memory.id, models.Memory.title, models.Memory.content).filter(
                or_(
                    models.Memory.title.ilike(like_pattern),
                    models.Memory.content.ilike(like_pattern)
                )
            ).limit(100).all()
            
            for row in ilike_results:
                # Score based on where match was found and query length
                title_match = q.lower() in (row.title or "").lower()
                content_match = q.lower() in (row.content or "").lower()
                
                if title_match:
                    score = min(1.0, 0.4 + 0.6 * (len(q) / max(1, len(row.title or ""))))
                else:
                    score = min(0.8, 0.2 + 0.6 * (len(q) / max(1, len(row.content or ""))))
                
                combined_scores[str(row.id)] = max(combined_scores[str(row.id)], score)
                
        except Exception as e:
            print(f"ILIKE search failed: {e}")

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