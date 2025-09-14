# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y wget build-essential tesseract-ocr tesseract-ocr-eng && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (to leverage caching)
COPY ./requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create models directory
RUN mkdir -p /app/models

# Download model
RUN wget -O /app/models/Phi-3-mini-4k-instruct-q4.gguf https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf

# Copy app code
COPY ./app /app/app

# Copy the startup script and fix line endings
COPY render-startup.sh .
RUN sed -i 's/\n$//' render-startup.sh
RUN chmod +x render-startup.sh

# Expose backend port
EXPOSE 8000

# Env vars
ENV DATABASE_URL="sqlite:////app/database/memory.db"
ENV MODEL_PATH="/app/models/Phi-3-mini-4k-instruct-q4.gguf"
ENV VECTOR_STORE_PATH="/app/data/vectors"
ENV CONTENT_STORE_PATH="/app/content_store"

# Start FastAPI
CMD ["./render-startup.sh"]