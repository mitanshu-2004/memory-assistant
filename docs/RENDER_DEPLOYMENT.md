
# Backend Deployment on Render

This document outlines the steps to deploy the backend of the Memory Assistant application on Render using Docker. The process has been optimized for performance and stability.

## Key Improvements

### 1. Model Handling

The `Phi-3-mini-4k-instruct-q4.gguf` model is now integrated into the Docker image during the build process. This change eliminates the need to download the model at startup, leading to faster deployments and improved reliability.

## Deployment Steps

To deploy the backend, follow these steps:

1.  Go to the Render Dashboard and click **New > Web Service**.
2.  Select **Build and deploy from a Git repository**.
3.  Connect your Git repository.
4.  Configure the web service:
    -   **Name:** Choose a name for your service (e.g., `memory-assistant-backend`).
    -   **Region:** Choose a region close to you.
    -   **Branch:** Select the branch you want to deploy.
    -   **Root Directory:** `backend`
    -   **Runtime:** `Docker`
    -   **Dockerfile:** `backend/Dockerfile`
    -   **Start Command:** `./render-startup.sh`
5.  Click **Create Web Service** to deploy your application.
