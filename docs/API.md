# Memory Assistant API Documentation

## Overview

The Memory Assistant API is a backend service for managing content. It allows users to store, organize, and retrieve different types of content, including text, files, and web pages.

## Base URL

`http://localhost:8000`

## Authentication

Currently, the API does not require authentication.

## Rate Limiting

The API limits requests to 60 per minute from a single IP address.

## Endpoints

### Health Check

#### GET /

Get basic information about the API.

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

Check the status of the database and vector store.

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

#### POST /api/v1/memory/from-file

Upload a file to create a memory.

**Request:** Multipart form data with a `file` field.

#### POST /api/v1/memory/from-url

Create a memory from a web URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

#### GET /api/v1/memory/

Get all memories, with optional filtering.

**Query Parameters:**
-   `source_type` (optional): Filter by source type (e.g., text, file).
-   `favorites_only` (optional): Show only favorite items.
-   `category_id` (optional): Filter by a category ID.
-   `skip` (optional): Number of records to skip.
-   `limit` (optional): Maximum number of records to return.

#### GET /api/v1/memory/{memory_id}

Get a specific memory by its ID.

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

#### DELETE /api/v1/memory/{memory_id}

Delete a memory.

### Search

#### GET /api/v1/search/

Search for memories.

**Query Parameters:**
-   `q` (required): The search query.
-   `search_type` (optional): "hybrid", "semantic", or "keyword".

### Categories

#### GET /api/v1/categories/

Get all categories.

#### POST /api/v1/categories/

Create a new category.

**Request Body:**
```json
{
  "name": "New Category"
}
```

#### GET /api/v1/categories/{category_id}

Get a category and its associated memories.

#### PUT /api/v1/categories/{category_id}

Update a category.

**Request Body:**
```json
{
  "name": "Updated Category Name"
}
```

#### DELETE /api/v1/categories/{category_id}

Delete a category.