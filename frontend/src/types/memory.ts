export interface Tag {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
  memory_count?: number
}

export interface Memory {
  id: string
  title: string
  content: string
  summary: string | null
  source_type: "text" | "file" | "url" | "image"
  source_url: string | null
  file_path: string | null
  mime_type: string | null
  status: "processing" | "complete"
  is_favorite: boolean
  created_at: string
  tags: Tag[]
  category: Category | null
  preview_image_path?: string
  processing_step: string
  content_hash?: string
  updated_at?: string
  is_archived?: boolean
}

export interface SearchResult {
  memory: Memory
  score: number
}

export interface MemoryFilters {
  sourceType: string | null
  favoritesOnly: boolean
  categoryId: number | null
  searchType: "hybrid" | "semantic" | "keyword"
}
