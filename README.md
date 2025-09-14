# Memory Assistant

## Overview

Memory Assistant is a program for managing digital information. It helps you save, organize, and find your content. The system uses local AI models to process information, so your data is not sent to external services.

### Key Features

-   **AI Processing**: Automatically creates titles, summaries, and categories for your content.
-   **Semantic Search**: Find content based on its meaning, not just keywords.
-   **Multi-Format Support**: Store text, files, images, and web pages.
-   **Smart Organization**: Get suggestions for tags and categories.
-   **Timeline View**: See your saved items in the order they were created.
-   **Privacy-Focused**: All processing is done on your local machine.
-   **Real-Time**: Get instant search and filtering results.
-   **Modern UI**: A clean and responsive user interface.

## Technology Stack

### Backend
-   **FastAPI**: A web framework for building APIs.
-   **SQLAlchemy**: A SQL toolkit and Object-Relational Mapper.
-   **SQLite**: A lightweight database.
-   **ChromaDB**: A vector database for semantic search.
-   **Phi-3**: A local language model for text generation.
-   **Sentence Transformers**: A library for creating text embeddings.
-   **Pydantic**: A library for data validation.

### Frontend
-   **React 18**: A JavaScript library for building user interfaces.
-   **TypeScript**: A typed superset of JavaScript.
-   **Vite**: A build tool and development server.
-   **Tailwind CSS**: A utility-first CSS framework.
-   **Zustand**: A state management library.
-   **React Router**: A library for routing in React applications.
-   **Axios**: A library for making HTTP requests.

## Project Structure

```
memory-assistant/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # AI processing logic
│   │   ├── database/       # Database models and connection
│   │   ├── models/         # Pydantic models
│   │   ├── utils/          # Utility functions
│   │   ├── config.py       # Configuration management
│   │   └── main.py         # FastAPI application
│   ├── models/             # AI model files
│   ├── data/               # Vector store data
│   ├── content_store/      # Uploaded files
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
├── docs/                   # Documentation
└── README.md              # This file
```

## Quick Start

### Prerequisites

-   **Python 3.8+** with pip
-   **Node.js 16+** with npm
-   **4GB+ RAM** (for AI models)
-   **2GB+** free disk space

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/memory-assistant.git
    cd memory-assistant
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    
    # Install Python dependencies
    pip install -r requirements.txt
    
    # Download AI model (required for AI features)
    mkdir -p models
    wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf -O models/Phi-3-mini-4k-instruct-q4.gguf
    
    # Start the backend server
    uvicorn app.main:app --reload
    ```
    
    The backend will be available at `http://localhost:8000`.

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    
    # Install dependencies
    npm install
    
    # Start development server
    npm run dev
    ```
    
    The frontend will be available at `http://localhost:5173`.

### First Steps

1.  **Open the application** at `http://localhost:5173`.
2.  **Create your first memory** by clicking "Add Memory".
3.  **Try the search** to find your saved items.
4.  **Explore the timeline** to see your items in chronological order.

## Deployment

### Frontend (Vercel)

The frontend is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push your code** to a Git repository (GitHub, GitLab, or Bitbucket).
2.  **Create a new project** on Vercel and import your Git repository.
3.  **Configure the build settings:**
    -   **Framework Preset:** `Vite`
    -   **Build Command:** `npm run build`
    -   **Output Directory:** `dist`
4.  **Add Environment Variables:**
    -   `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., your Render service URL).
5.  **Deploy!**

### Backend (Render)

The backend is set up for deployment on [Render](https://render.com/) using Docker.

1.  **Push your code** to a Git repository.
2.  **Create a new Web Service** on Render and connect it to your Git repository.
3.  **Configure the service:**
    -   **Environment:** `Docker`
    -   **Root Directory:** `backend`
    -   **DockerfilePath:** `Dockerfile` (should be detected automatically)
4.  **Add a Persistent Disk:**
    -   **Mount Path:** `/app/models`
    -   **Size:** Choose a size large enough to store the AI model (e.g., 5 GB).
5.  **Add Environment Variables:**
    -   `DATABASE_URL`: `sqlite:////var/lib/sqlite/memory.db` (Render provides a managed SQLite service)
    -   `MODEL_PATH`: `/app/models/Phi-3-mini-4k-instruct-q4.gguf`
    -   `VECTOR_STORE_PATH`: `/app/data/vectors`
    -   `CONTENT_STORE_PATH`: `/app/content_store`
6.  **Deploy!**

The first deployment will take some time as it needs to download the AI model. Subsequent deployments will be faster as the model will be persisted on the disk.

## Documentation

-   **[API Documentation](docs/API.md)** - A complete reference for the API.
-   **[Architecture Guide](docs/ARCHITECTURE.md)** - Information about the system's design and components.
-   **[Deployment Guide](docs/DEPLOYMENT.md)** - Instructions for deploying the application.

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Application
APP_NAME=AI Memory Assistant
DEBUG=false

# Database
DATABASE_URL=sqlite:///./database/memory.db

# AI Models
MODEL_PATH=./models/Phi-3-mini-4k-instruct-q4.gguf
EMBEDDING_MODEL=all-MiniLM-L6-v2

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/new-feature`).
3.  Commit your changes (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature/new-feature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.