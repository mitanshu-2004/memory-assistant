# Memory Assistant Deployment Guide

## Overview

This guide explains how to deploy the Memory Assistant application.

## Prerequisites

### System Requirements
-   **Python**: 3.8 or higher
-   **Node.js**: 16 or higher
-   **Memory**: 4GB RAM minimum (8GB recommended for AI models)
-   **Storage**: 2GB free space minimum

### Required Software
-   pip (Python package installer)
-   npm (Node.js package manager)
-   Git

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/memory-assistant.git
cd memory-assistant
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Download AI Model
```bash
mkdir -p models
wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf -O models/Phi-3-mini-4k-instruct-q4.gguf
```

#### Start the Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Start the Frontend
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Production Deployment

This section provides a general guide for production deployment. You may need to adapt the steps for your specific environment.

### Backend Deployment

1.  Set up a production-ready server (e.g., using Gunicorn).
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

-   Ensure that your production environment is properly secured.
-   Restrict direct access to the backend service.
-   Set up HTTPS to encrypt traffic between the client and the server.