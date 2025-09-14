#!/bin/bash

# Create required dirs
mkdir -p /app/models /app/data/vectors /app/content_store /app/database

# Download model only if not already present
if [ ! -f /app/models/Phi-3-mini-4k-instruct-q4.gguf ]; then
    apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
    wget -O /app/models/Phi-3-mini-4k-instruct-q4.gguf \
    https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf
fi

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port 8000
