# Memory Assistant Architecture

## System Overview

The Memory Assistant is a full-stack application for managing digital information. It combines web technologies with local AI models for content management with a focus on privacy.

## Core Components

### 1. Frontend Architecture

The frontend is a React application that provides the user interface for the Memory Assistant.

#### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Sidebar, Layout)
│   ├── memory/         # Memory-related components
│   ├── search/         # Search components
│   ├── filters/        # Filter components
│   ├── categories/     # Category management
│   ├── upload/         # File upload components
│   └── ui/             # Generic UI components
├── pages/              # Page components
├── services/           # API service layer
├── store/              # State management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

### 2. Backend Architecture

The backend is a FastAPI application that provides the API for the Memory Assistant.

#### API Structure
```
app/
├── api/v1/             # API endpoints
│   ├── memory.py       # Memory CRUD operations
│   ├── search.py       # Search functionality
│   └── categories.py   # Category management
├── core/               # Core business logic
│   ├── ai_processor.py # AI model integration
│   └── vector_store.py # Vector database operations
├── database/           # Database layer
│   ├── connection.py   # Database connection
│   └── models.py       # SQLAlchemy models
├── models/             # Pydantic models
├── utils/              # Utility functions
└── config.py           # Configuration management
```

### 3. Data Flow

#### Memory Creation Flow
1.  A user submits content (text, file, or URL).
2.  The backend validates and stores the raw content.
3.  The AI processor generates metadata (title, tags, category).
4.  The content is embedded and stored in the vector database.
5.  A response is sent to the frontend with the generated metadata.
6.  The frontend updates the UI.

#### Search Flow
1.  A user enters a search query.
2.  The frontend sends a request to the backend.
3.  The backend performs a hybrid search (semantic + keyword).
4.  Results are ranked by a relevance score.
5.  The frontend displays the results.

## Security

### Data Privacy
-   **Local AI Models**: No data is sent to external services.
-   **Local Storage**: All data is stored locally.

### Input Validation
-   **Pydantic Models**: Used for request and response validation.
-   **File Type Checking**: Validates file types.
-   **Size Limits**: Enforces maximum file sizes.

### Rate Limiting
-   **IP-based Limits**: Limits requests to 60 per minute.

## Deployment

### Development
```
Frontend (Vite Dev Server) ──► Backend (Uvicorn) ──► SQLite + ChromaDB
     Port 5173                      Port 8000
```

### Production
```
Frontend (Static Build) ──► Backend (Uvicorn/Gunicorn) ──► SQLite + ChromaDB
     Nginx/Static                    Port 8000
```