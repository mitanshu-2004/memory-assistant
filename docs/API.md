# Memory Assistant API Documentation

## Overview

The Memory Assistant API is a FastAPI-based backend service that provides AI-powered memory management capabilities. It allows users to store, organize, and retrieve various types of content including text, files, and web pages.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Rate Limit**: 60 requests per minute per IP address
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Endpoints

### Health Check

#### GET /
Get basic API information.

**Response:**
```json
{
  "message": "AI Memory Assistant API",
  "status": "running",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

#### GET /health
Comprehensive health check including database and vector store status.

**Response:**
```json
{
  "status": "healthy",
  "database": "healthy",
  "vector_store": "healthy"
}
```

### Memory Management

#### POST /api/v1/memory/
Create a new text memory.

**Request Body:**
```json
{
  "content": "Your memory content here",
  "category_id": 1,
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "title": "Generated or provided title",
  "content": "Your memory content here",
  "summary": "AI-generated summary",
  "source_type": "text",
  "created_at": "2024-01-01T00:00:00Z",
  "tags": [
    {
      "id": 1,
      "name": "tag1"
    }
  ],
  "category": {
    "id": 1,
    "name": "Category Name"
  }
}
```

#### POST /api/v1/memory/from-file
Upload a file to create a memory.

**Request:** Multipart form data with `file` field

**Response:** Same as POST /api/v1/memory/

#### POST /api/v1/memory/from-url
Create a memory from a web URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:** Same as POST /api/v1/memory/

#### GET /api/v1/memory/
Get all memories with optional filtering.

**Query Parameters:**
- `source_type` (optional): Filter by source type (text, file, url, image)
- `favorites_only` (optional): Show only favorites (true/false)
- `category_id` (optional): Filter by category ID
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records (default: 100)

**Response:**
```json
[
  {
    "id": "uuid-string",
    "title": "Memory Title",
    "content": "Memory content",
    "summary": "AI summary",
    "source_type": "text",
    "created_at": "2024-01-01T00:00:00Z",
    "tags": [...],
    "category": {...}
  }
]
```

#### GET /api/v1/memory/{memory_id}
Get a specific memory by ID.

**Response:** Single memory object (same structure as above)

#### PUT /api/v1/memory/{memory_id}
Update a memory.

**Request Body:**
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "is_favorite": true,
  "category_id": 2,
  "tags": ["new", "tags"]
}
```

**Response:** Updated memory object

#### DELETE /api/v1/memory/{memory_id}
Delete a memory.

**Response:** `204 No Content`

#### POST /api/v1/memory/{memory_id}/summarize
Generate or regenerate AI summary for a memory.

**Response:** Updated memory object with new summary

### Search

#### GET /api/v1/search/
Search memories using semantic and keyword search.

**Query Parameters:**
- `q` (required): Search query string
- `search_type` (optional): Search type - "hybrid", "semantic", or "keyword" (default: "hybrid")

**Response:**
```json
{
  "results": [
    {
      "memory": {
        "id": "uuid-string",
        "title": "Memory Title",
        "content": "Memory content",
        ...
      },
      "score": 0.95
    }
  ]
}
```

### Categories

#### GET /api/v1/categories/
Get all categories with memory counts.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Category Name",
    "memory_count": 5
  }
]
```

#### POST /api/v1/categories/
Create a new category.

**Request Body:**
```json
{
  "name": "New Category"
}
```

**Response:** Created category object

#### GET /api/v1/categories/{category_id}
Get category details with associated memories.

**Response:**
```json
{
  "category": {
    "id": 1,
    "name": "Category Name"
  },
  "memories": [
    {
      "id": "uuid-string",
      "title": "Memory Title",
      ...
    }
  ]
}
```

#### PUT /api/v1/categories/{category_id}
Update a category.

**Request Body:**
```json
{
  "name": "Updated Category Name"
}
```

**Response:** Updated category object

#### DELETE /api/v1/categories/{category_id}
Delete a category.

**Response:** `204 No Content`

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Error description"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 409 Conflict
```json
{
  "detail": "Resource already exists"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "error message",
      "type": "error_type"
    }
  ]
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

## Data Models

### Memory
- `id`: Unique identifier (UUID string)
- `title`: Memory title (string)
- `content`: Memory content (string)
- `summary`: AI-generated summary (string, optional)
- `source_type`: Type of source (text, file, url, image)
- `source_url`: Original URL if applicable (string, optional)
- `file_path`: Path to stored file if applicable (string, optional)
- `mime_type`: MIME type of file if applicable (string, optional)
- `processing_step`: Current processing status (string)
- `created_at`: Creation timestamp (ISO 8601)
- `updated_at`: Last update timestamp (ISO 8601, optional)
- `accessed_at`: Last access timestamp (ISO 8601, optional)
- `access_count`: Number of times accessed (integer)
- `is_favorite`: Whether marked as favorite (boolean)
- `is_archived`: Whether archived (boolean)
- `tags`: Array of associated tags
- `category`: Associated category (optional)

### Tag
- `id`: Unique identifier (integer)
- `name`: Tag name (string)
- `usage_count`: Number of times used (integer)

### Category
- `id`: Unique identifier (integer)
- `name`: Category name (string)
- `memory_count`: Number of memories in category (integer, optional)

## File Upload

When uploading files, the following formats are supported:
- **Text**: `.txt`, `.md`
- **Documents**: `.pdf`, `.doc`, `.docx`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Archives**: `.zip`, `.rar`, `.7z`

Maximum file size: 50MB

## AI Features

The API includes several AI-powered features:

1. **Automatic Title Generation**: Creates descriptive titles from content
2. **Smart Summarization**: Generates concise summaries of long content
3. **Intelligent Tagging**: Automatically suggests relevant tags
4. **Category Classification**: Suggests appropriate categories
5. **Semantic Search**: Find content by meaning, not just keywords

## Web Scraping

When creating memories from URLs, the API:
- Extracts clean text content from web pages
- Removes navigation, ads, and other non-content elements
- Preserves the original URL for reference
- Generates appropriate titles from page content

## Vector Search

The API uses ChromaDB for vector storage and semantic search:
- Embeddings are generated using sentence-transformers
- Supports hybrid search (semantic + keyword)
- Results are ranked by relevance score
- Vector store is persistent and local
