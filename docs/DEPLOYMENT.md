# Memory Assistant Deployment Guide

## Overview

This guide covers deploying the Memory Assistant application in various environments, from local development to production deployment.

## Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16 or higher (LTS recommended)
- **Memory**: 4GB RAM minimum (8GB recommended for AI models)
- **Storage**: 2GB free space minimum
- **OS**: Windows, macOS, or Linux

### Required Software
- Python package manager (pip)
- Node.js package manager (npm or yarn)
- Git (for cloning the repository)

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
Download the Phi-3 model file:
```bash
# Create models directory
mkdir -p models

# Download the model (replace with actual download URL)
wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf -O models/Phi-3-mini-4k-instruct-q4.gguf
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
# Application settings
APP_NAME=AI Memory Assistant
APP_VERSION=1.0.0
DEBUG=true

# Database
DATABASE_URL=sqlite:///./database/memory.db

# AI Models
MODEL_PATH=./models/Phi-3-mini-4k-instruct-q4.gguf
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Storage paths
VECTOR_STORE_PATH=./data/vectors
CONTENT_STORE_PATH=./content_store

# CORS settings
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Rate limiting
RATE_LIMIT_PER_MINUTE=60

# File upload settings
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=text/plain,text/markdown,application/pdf,image/jpeg,image/png,image/gif,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

#### Start the Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

#### Start the Frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Production Deployment

### Option 1: Docker Deployment

#### Create Dockerfile for Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p database data/vectors content_store models

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Create Dockerfile for Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    environment:
      - DATABASE_URL=sqlite:///./database/memory.db
      - MODEL_PATH=./models/Phi-3-mini-4k-instruct-q4.gguf
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Server Deployment

#### Server Setup (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and Node.js
sudo apt install python3 python3-pip python3-venv nodejs npm nginx -y

# Install additional dependencies for AI models
sudo apt install build-essential -y
```

#### Backend Deployment
```bash
# Create application directory
sudo mkdir -p /opt/memory-assistant
sudo chown $USER:$USER /opt/memory-assistant
cd /opt/memory-assistant

# Clone repository
git clone https://github.com/your-username/memory-assistant.git .

# Setup Python environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Download AI model
mkdir -p models
wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf -O models/Phi-3-mini-4k-instruct-q4.gguf

# Create systemd service
sudo tee /etc/systemd/system/memory-assistant.service > /dev/null <<EOF
[Unit]
Description=Memory Assistant Backend
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/memory-assistant/backend
Environment=PATH=/opt/memory-assistant/backend/venv/bin
ExecStart=/opt/memory-assistant/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable memory-assistant
sudo systemctl start memory-assistant
```

#### Frontend Deployment
```bash
# Build frontend
cd /opt/memory-assistant/frontend
npm install
npm run build

# Configure Nginx
sudo tee /etc/nginx/sites-available/memory-assistant > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /opt/memory-assistant/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/memory-assistant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Cloud Deployment

#### AWS EC2 Deployment
1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Select t3.medium or larger (for AI models)
   - Configure security groups (ports 22, 80, 443)

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip nodejs npm nginx git -y
   ```

3. **Deploy Application**
   - Follow manual deployment steps above
   - Configure domain name and SSL certificate

#### DigitalOcean App Platform
1. **Create App Spec**
   ```yaml
   name: memory-assistant
   services:
   - name: backend
     source_dir: backend
     github:
       repo: your-username/memory-assistant
       branch: main
     run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
     environment_slug: python
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: DATABASE_URL
       value: sqlite:///./database/memory.db
   
   - name: frontend
     source_dir: frontend
     github:
       repo: your-username/memory-assistant
       branch: main
     build_command: npm install && npm run build
     run_command: npx serve -s dist -l 8080
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
   ```

2. **Deploy**
   - Connect GitHub repository
   - Deploy from App Platform dashboard

## Environment Configuration

### Production Environment Variables

#### Backend (.env)
```env
# Application
APP_NAME=AI Memory Assistant
APP_VERSION=1.0.0
DEBUG=false

# Database
DATABASE_URL=sqlite:///./database/memory.db

# AI Models
MODEL_PATH=./models/Phi-3-mini-4k-instruct-q4.gguf
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Storage
VECTOR_STORE_PATH=./data/vectors
CONTENT_STORE_PATH=./content_store

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Security
RATE_LIMIT_PER_MINUTE=30

# Logging
LOG_LEVEL=WARNING
LOG_FORMAT=json
```

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-domain.com
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare
1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption mode
4. Configure page rules for caching

## Monitoring and Maintenance

### Log Management
```bash
# View backend logs
sudo journalctl -u memory-assistant -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Log rotation
sudo logrotate -f /etc/logrotate.d/nginx
```

### Backup Strategy
```bash
#!/bin/bash
# backup.sh - Daily backup script

BACKUP_DIR="/opt/backups/memory-assistant"
APP_DIR="/opt/memory-assistant"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database and data
tar -czf $BACKUP_DIR/memory-assistant-$(date +%Y%m%d).tar.gz \
    $APP_DIR/backend/database \
    $APP_DIR/backend/data \
    $APP_DIR/backend/content_store

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Health Monitoring
```bash
#!/bin/bash
# health-check.sh - Simple health check

# Check backend
curl -f http://localhost:8000/health || exit 1

# Check frontend
curl -f http://localhost/ || exit 1

# Check disk space
df -h | awk '$5 > 90 {print "Disk space warning: " $0}'

# Check memory usage
free -m | awk 'NR==2{printf "Memory usage: %.2f%%\n", $3*100/$2}'
```

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
sudo journalctl -u memory-assistant -n 50

# Check Python environment
source /opt/memory-assistant/backend/venv/bin/activate
python -c "import app.main"

# Check dependencies
pip list | grep -E "(fastapi|uvicorn|sqlalchemy)"
```

#### AI Models Not Loading
```bash
# Check model file
ls -la /opt/memory-assistant/backend/models/

# Check permissions
sudo chown -R www-data:www-data /opt/memory-assistant/backend/models/

# Test model loading
python -c "from app.core.ai_processor import initialize_llm; print(initialize_llm())"
```

#### Frontend Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env

# Test build
npm run build
```

#### Database Issues
```bash
# Check database file
ls -la /opt/memory-assistant/backend/database/

# Test database connection
python -c "from app.database.connection import test_database_connection; print(test_database_connection())"

# Recreate database (WARNING: This will delete all data)
rm /opt/memory-assistant/backend/database/memory.db
```

### Performance Optimization

#### Backend Optimization
```python
# In app/main.py - Add these settings for production
app = FastAPI(
    title=settings.app_name,
    description="AI-powered memory management system",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)
```

#### Frontend Optimization
```bash
# Build with optimizations
npm run build

# Enable gzip compression in Nginx
sudo tee -a /etc/nginx/nginx.conf > /dev/null <<EOF
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
EOF
```

## Security Considerations

### Production Security Checklist
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Regular security updates
- [ ] Firewall configuration
- [ ] Backup strategy implemented
- [ ] Log monitoring enabled
- [ ] File upload restrictions
- [ ] Input validation enabled

### Firewall Configuration
```bash
# UFW setup
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 8000/tcp  # Block direct backend access
```

This deployment guide provides comprehensive instructions for deploying the Memory Assistant application in various environments. Choose the deployment method that best fits your needs and infrastructure requirements.
