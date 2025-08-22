from pydantic import BaseModel
from typing import List
from . import memory_item as memory_models

class SearchResultItem(BaseModel):
    """
    Represents a single item in the search results, including its score.
    """
    memory: memory_models.Memory
    score: float

class SearchResults(BaseModel):
    """
    Represents the full search results response.
    """
    results: List[SearchResultItem]