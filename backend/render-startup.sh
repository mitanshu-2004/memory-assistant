#!/bin/bash

# Create required dirs
mkdir -p /app/data/vectors /app/content_store /app/database

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port 8000