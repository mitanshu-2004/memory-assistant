# Memory Assistant

Memory Assistant is a personal AI-powered memory assistant designed to help you capture, organize, and retrieve your thoughts, ideas, and experiences. It leverages advanced AI models to process and understand your inputs, making it easier to recall information when you need it most.

## Features

- **Capture Memories:** Easily record notes, ideas, and experiences.
- **AI-Powered Organization:** Automatically categorize and link related memories.
- **Intelligent Search:** Quickly find information using natural language queries.
- **Timeline View:** Visualize your memories in a chronological order.
- **Categorization:** Organize memories into custom categories for better management.
- **Web Scraping:** Extract content from web pages to save as memories.
- **Image Processing:** Analyze and extract information from images.
- **Local AI Model Integration:** Utilizes local AI models for enhanced privacy and offline capabilities.

## Project Structure

The project is divided into two main parts: `backend` and `frontend`.

### Backend

The `backend` is built with FastAPI and Python, providing the core API for managing memories, AI processing, and data storage.

- `app/api/v1`: Contains the API endpoints for memories, categories, and search.
- `app/core`: Houses the AI processing logic and vector store integration.
- `app/database`: Manages the database connection and models (SQLite).
- `app/models`: Defines the data models for the application.
- `app/utils`: Includes utilities for image processing, text extraction, and web scraping.
- `memory.db`: The SQLite database file (located in `backend/database/`).
- `requirements.txt`: Python dependencies.

### Frontend

The `frontend` is a React application built with Vite, providing a user-friendly interface for interacting with the backend.

- `src/components`: Reusable UI components.
- `src/pages`: Different views/pages of the application.
- `src/services`: API service integrations.
- `src/store`: Zustand store for state management.
- `src/styles`: Global styles.
- `src/types`: TypeScript type definitions.
- `public`: Static assets.
- `package.json`: Frontend dependencies and scripts.

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js (LTS)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/memory-assistant.git
    cd memory-assistant
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    # Run database migrations if any (not explicitly defined in current structure, but good practice)
    # python -m app.database.connection # or similar command to initialize db

    # AI Model Setup:
    # Download the Phi-3-mini-4k-instruct-q4.gguf model from:
    # https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/blob/main/Phi-3-mini-4k-instruct-q4.gguf
    # And place it in the `backend/models` folder.

    uvicorn app.main:app --reload
    ```
    The backend will run on `http://127.0.0.1:8000` by default.

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install # or yarn install

    # Configuration:
    # Create a `.env` file in the `frontend` directory.
    # Add the backend API URL (e.g., VITE_API_URL=http://127.0.0.1:8000).
    # Also, add the frontend URL(s) for allowed origins (e.g., VITE_ALLOWED_ORIGINS=http://localhost:5173 or VITE_ALLOWED_ORIGINS=http://localhost:5173,http://your-other-domain.com).

    npm run dev # or yarn dev
    ```
    The frontend will run on `http://localhost:5173` by default.

## Usage

Once both the backend and frontend are running, you can access the Memory Assistant in your web browser at `http://localhost:5173`.

-   **Capture Memories:** Use the "Create Memory" section to add new notes, text, or web content.
-   **Organize:** Assign categories to your memories.
-   **Search:** Use the search bar to find specific memories.
-   **Timeline:** View your memories chronologically.

