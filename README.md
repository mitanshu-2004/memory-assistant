# Memory Assistant

Memory Assistant is a full-stack application designed to help users store, organize, and retrieve their digital memories efficiently. It combines a FastAPI-based backend with a React-based frontend, leveraging local AI models for content processing and a vector database for semantic search, all with a strong focus on privacy.

## Features

*   **Memory Management:** Create, read, update, and delete memories.
*   **Categorization:** Organize memories into custom categories.
*   **Search:** Efficiently search through stored memories using hybrid (semantic + keyword) search.
*   **Local AI Model Integration:** Utilizes local AI models for enhanced memory processing (e.g., text extraction, image analysis, automatic title and summary generation).
*   **Content Ingestion:** Support for text, files, images, and URLs (web scraping).
*   **Timeline View:** Chronological organization of memories.
*   **Data Privacy:** All data is stored locally, and no data is sent to external services.

## Technologies Used

### Backend

*   **Framework:** FastAPI (Python) - For building the RESTful API.
*   **Database:** SQLAlchemy with SQLite - For relational data storage.
*   **AI/ML:** Local AI models (e.g., Phi-3-mini-4k-instruct-gguf) - For content processing, metadata generation, and embeddings.
*   **Vector Database:** ChromaDB - For semantic search capabilities.
*   **Dependencies:** Managed with `pip` and `requirements.txt`.

### Frontend

*   **Framework:** React (TypeScript) - For building the user interface.
*   **Build Tool:** Vite - For fast development and optimized builds.
*   **Styling:** Tailwind CSS - For utility-first CSS styling.
*   **State Management:** Zustand - For managing application state.
*   **Dependencies:** Managed with `npm` and `package.json`.

## Architecture

### System Overview

The Memory Assistant is a full-stack application designed for managing digital information. It integrates web technologies with local AI models to provide a private and efficient content management system.

### Core Components

#### Frontend Architecture

The frontend is a React application responsible for the user interface.

```
src/
├── components/          # Reusable UI components (layout, memory, search, filters, categories, upload, ui)
├── pages/              # Page-level components
├── services/           # API service layer for backend communication
├── store/              # State management using Zustand
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

#### Backend Architecture

The backend is a FastAPI application providing the API.

```
app/
├── api/v1/             # API endpoints (memory, search, categories)
├── core/               # Core business logic (AI processor, vector store)
├── database/           # Database layer (connection, SQLAlchemy models)
├── models/             # Pydantic models for data validation
├── utils/              # Utility functions
└── config.py           # Configuration management
```

### Data Flow

#### Memory Creation Flow

1.  User submits content (text, file, or URL) via the frontend.
2.  The backend validates and stores the raw content.
3.  The AI processor generates metadata (title, tags, category) and embeddings.
4.  The content and its embeddings are stored in the vector database.
5.  A response with generated metadata is sent to the frontend.
6.  The frontend updates the UI to reflect the new memory.

#### Search Flow

1.  User enters a search query in the frontend.
2.  The frontend sends the query to the backend.
3.  The backend performs a hybrid search (semantic + keyword) across the vector database and traditional database.
4.  Results are ranked by relevance.
5.  The frontend displays the search results.

## Getting Started

This guide will help you set up and run the Memory Assistant locally for development.


### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/memory-assistant.git
cd memory-assistant
```

#### 2. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

##### Install Python Dependencies

```bash
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
```

##### Download AI Model

Create a `models` directory and download the AI model. This example uses Phi-3-mini.

```bash
mkdir -p models
wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf -O models/Phi-3-mini-4k-instruct-q4.gguf
```

##### Start the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend will be available at `http://localhost:8000`.

#### 3. Frontend Setup

Navigate to the `frontend` directory:

```bash
cd ../frontend
```

##### Install Dependencies

```bash
npm install
```

##### Start the Frontend

```bash
npm run dev
```
The frontend will be available at `http://localhost:5173` (or another available port).

## API Documentation

### Overview

The Memory Assistant API is a backend service for managing content. It allows users to store, organize, and retrieve different types of content, including text, files, and web pages.

### Base URL

`http://localhost:8000`

### Authentication

Currently, the API does not require authentication.

### Rate Limiting

The API limits requests to 60 per minute from a single IP address.

### Key Endpoints (Summarized)

*   **Health Check:**
    *   `GET /`: Get basic API information.
    *   `GET /health`: Check database and vector store status.
*   **Memory Management (`/api/v1/memory/`)**:
    *   `POST /`: Create a new text memory.
    *   `POST /from-file`: Upload a file to create a memory.
    *   `POST /from-url`: Create a memory from a web URL.
    *   `GET /`: Get all memories with optional filtering.
    *   `GET /{memory_id}`: Get a specific memory by ID.
    *   `PUT /{memory_id}`: Update a memory.
    *   `DELETE /{memory_id}`: Delete a memory.
*   **Search (`/api/v1/search/`)**:
    *   `GET /?q={query}&search_type={type}`: Search for memories using a query and search type ("hybrid", "semantic", or "keyword").
*   **Categories (`/api/v1/categories/`)**:
    *   `GET /`: Get all categories.
    *   `POST /`: Create a new category.
    *   `GET /{category_id}`: Get a category and its associated memories.
    *   `PUT /{category_id}`: Update a category.
    *   `DELETE /{category_id}`: Delete a category.

## Deployment

This section provides a general guide for production deployment. Adapt these steps for your specific environment.

### Backend Deployment

1.  Set up a production-ready server (e.g., using Gunicorn with Uvicorn workers).
2.  Configure environment variables for production (e.g., `DEBUG=false`).
3.  Set up a process manager (e.g., systemd) to run the backend service.

### Frontend Deployment

1.  Build the frontend for production:
    ```bash
    npm run build
    ```
2.  Serve the static files from the `dist` directory using a web server like Nginx.

### Web Server Configuration

Configure your web server to:
1.  Serve the frontend's static files.
2.  Proxy API requests (e.g., `/api/*`) to the backend service.

## Security Considerations

*   **Data Privacy:** Emphasizes local AI models and local data storage to ensure no data leaves the user's system.
*   **Input Validation:** Utilizes Pydantic models for robust request and response validation, file type checking, and size limits.
*   **Rate Limiting:** Implements IP-based rate limiting (60 requests per minute) to prevent abuse.
*   **Production Security:** In production, ensure proper server security, restrict direct backend access, and use HTTPS for encrypted communication.
