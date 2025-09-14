FROM python:3.9-slim

WORKDIR /app

COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

COPY ./app /app/app
COPY render-startup.sh .
RUN chmod +x render-startup.sh

EXPOSE 8000

ENV DATABASE_URL="sqlite:////app/database/memory.db"
ENV MODEL_PATH="/app/models/Phi-3-mini-4k-instruct-q4.gguf"
ENV VECTOR_STORE_PATH="/app/data/vectors"
ENV CONTENT_STORE_PATH="/app/content_store"

CMD ["./render-startup.sh"]
