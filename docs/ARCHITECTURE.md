# Memory Assistant Architecture

## System Overview

The Memory Assistant is a full-stack AI-powered memory management application designed to help users capture, organize, and retrieve their digital memories. The system combines modern web technologies with local AI models to provide privacy-focused intelligent content management.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Models     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Local)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   SQLite DB     │    │  ChromaDB       │
│   Storage       │    │   (Memories)    │    │  (Vectors)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Custom components with Lucide React icons

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: SQLite with SQLAlchemy ORM
- **Vector Store**: ChromaDB
- **AI Models**: 
  - Phi-3-mini-4k-instruct (Local LLM)
  - all-MiniLM-L6-v2 (Sentence Transformers)
- **File Processing**: PyPDF2, python-docx, Pillow, pytesseract
- **Web Scraping**: BeautifulSoup4, requests
- **Rate Limiting**: slowapi
- **Logging**: structlog

## Core Components

### 1. Frontend Architecture

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

#### State Management
- **Zustand Store**: Centralized state for memories, UI state
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Caching**: Client-side caching of API responses

#### Key Features
- **Responsive Design**: Desktop-first with mobile considerations
- **Real-time Updates**: Live search and filtering
- **File Upload**: Drag-and-drop with progress indicators
- **Timeline View**: Chronological memory organization
- **Semantic Search**: AI-powered content discovery

### 2. Backend Architecture

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

#### Database Schema
```sql
-- Core tables
memories (id, title, content, summary, source_type, created_at, ...)
categories (id, name)
tags (id, name, usage_count)

-- Association tables
item_categories (item_id, category_id)
item_tags (item_id, tag_id)
```

#### AI Integration
- **Local LLM**: Phi-3 model for text generation
- **Embeddings**: Sentence transformers for semantic search
- **Fallback Strategies**: Rule-based alternatives when AI unavailable
- **Batch Processing**: Efficient handling of multiple operations

### 3. Data Flow

#### Memory Creation Flow
1. User submits content (text/file/URL)
2. Backend validates and stores raw content
3. AI processor generates metadata (title, tags, category)
4. Content is embedded and stored in vector database
5. Response sent to frontend with generated metadata
6. Frontend updates UI optimistically

#### Search Flow
1. User enters search query
2. Frontend debounces and sends request
3. Backend performs hybrid search (semantic + keyword)
4. Results ranked by relevance score
5. Frontend displays results with highlighting

#### File Processing Flow
1. File uploaded via multipart form
2. Backend extracts text based on file type
3. AI processes extracted content
4. Original file stored for download
5. Thumbnails generated for images

## Security Considerations

### Data Privacy
- **Local AI Models**: No data sent to external services
- **Local Storage**: All data stored locally
- **No Authentication**: Simplified for single-user deployment
- **File Validation**: Type and size restrictions

### Input Validation
- **Pydantic Models**: Request/response validation
- **File Type Checking**: MIME type validation
- **Size Limits**: Maximum file size enforcement
- **SQL Injection**: SQLAlchemy ORM protection

### Rate Limiting
- **IP-based Limits**: 60 requests per minute
- **SlowAPI Integration**: Automatic rate limiting
- **Graceful Degradation**: Clear error messages

## Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Debounced Search**: Reduced API calls
- **Optimistic Updates**: Immediate UI feedback

### Backend
- **Connection Pooling**: Efficient database connections
- **Caching**: LRU cache for AI models
- **Batch Operations**: Bulk embedding generation
- **Async Processing**: Non-blocking file operations

### Database
- **Indexes**: Optimized queries on common fields
- **Pagination**: Limit result sets
- **Lazy Loading**: On-demand relationship loading

## Deployment Architecture

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

## Scalability Considerations

### Current Limitations
- **Single User**: No multi-user support
- **SQLite**: Limited concurrent writes
- **Local Storage**: File system dependencies
- **Memory Usage**: AI models loaded in memory

### Future Enhancements
- **PostgreSQL**: Better concurrent access
- **Redis**: Caching layer
- **S3/MinIO**: Object storage
- **Kubernetes**: Container orchestration
- **Microservices**: Service decomposition

## Monitoring and Logging

### Logging Strategy
- **Structured Logging**: JSON format with structlog
- **Log Levels**: DEBUG, INFO, WARNING, ERROR
- **Context**: Request IDs, user actions, errors
- **Performance**: Timing information

### Health Checks
- **Database**: Connection testing
- **Vector Store**: Collection status
- **AI Models**: Availability checking
- **File System**: Storage accessibility

## Error Handling

### Frontend
- **Error Boundaries**: React error boundaries
- **Toast Notifications**: User-friendly error messages
- **Retry Logic**: Automatic retry for failed requests
- **Fallback UI**: Graceful degradation

### Backend
- **Exception Handlers**: Global error handling
- **Validation Errors**: Detailed field-level errors
- **HTTP Status Codes**: Appropriate status responses
- **Logging**: Comprehensive error logging

## Configuration Management

### Environment Variables
- **Database URL**: Connection string
- **Model Paths**: AI model locations
- **CORS Origins**: Allowed frontend URLs
- **Rate Limits**: Request limits
- **File Limits**: Upload restrictions

### Configuration Files
- **config.py**: Centralized settings
- **.env**: Environment-specific values
- **requirements.txt**: Python dependencies
- **package.json**: Node.js dependencies

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: User workflow testing
- **Visual Tests**: UI regression testing

### Backend Testing
- **Unit Tests**: Function and class testing
- **API Tests**: Endpoint testing with pytest
- **Database Tests**: Model and query testing
- **AI Tests**: Model integration testing

## Development Workflow

### Local Development
1. **Backend**: `uvicorn app.main:app --reload`
2. **Frontend**: `npm run dev`
3. **Database**: Auto-created on first run
4. **AI Models**: Download and place in models/ directory

### Code Quality
- **Linting**: ESLint (frontend), flake8 (backend)
- **Formatting**: Prettier (frontend), black (backend)
- **Type Checking**: TypeScript, mypy
- **Pre-commit**: Automated quality checks

## Future Roadmap

### Short Term
- **Authentication**: User management system
- **API Keys**: External API access
- **Export/Import**: Data portability
- **Mobile App**: React Native version

### Long Term
- **Multi-user**: Shared memory spaces
- **Collaboration**: Real-time editing
- **Advanced AI**: Custom model training
- **Integrations**: Third-party service connections
