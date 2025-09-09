# Memory Assistant

<div align="center">

![Memory Assistant](https://img.shields.io/badge/Memory%20Assistant-v1.0.0-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)
![License](https://img.shields.io/badge/License-MIT-yellow)

**AI-powered memory management system with semantic search and intelligent categorization**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Deployment](#deployment) • [Contributing](#contributing)

</div>

## Overview

Memory Assistant is a sophisticated AI-powered memory management application that helps you capture, organize, and retrieve your digital memories. Built with privacy in mind, it uses local AI models to provide intelligent content processing without sending your data to external services.

### Key Features

- 🧠 **AI-Powered Processing**: Automatic title generation, summarization, and categorization
- 🔍 **Semantic Search**: Find content by meaning, not just keywords
- 📁 **Multi-Format Support**: Store text, files, images, and web pages
- 🏷️ **Smart Organization**: Automatic tagging and category suggestions
- 📊 **Timeline View**: Chronological memory organization
- 🔒 **Privacy-First**: All processing happens locally
- ⚡ **Real-Time**: Instant search and filtering
- 🎨 **Modern UI**: Beautiful, responsive interface

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database
- **ChromaDB**: Vector database for semantic search
- **Phi-3**: Local LLM for text generation
- **Sentence Transformers**: Embedding generation
- **Pydantic**: Data validation and settings management

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **Axios**: HTTP client

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

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **4GB+ RAM** (for AI models)
- **2GB+ free disk space**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/memory-assistant.git
   cd memory-assistant
   ```

2. **Setup Backend:**
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
   
   Backend will be available at `http://localhost:8000`

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

### First Steps

1. **Open the application** at `http://localhost:5173`
2. **Create your first memory** by clicking "Add Memory"
3. **Try the search** to find your memories
4. **Explore the timeline** to see your memories chronologically

## Documentation

- 📚 **[API Documentation](docs/API.md)** - Complete API reference
- 🏗️ **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and components
- 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

## Features in Detail

### AI-Powered Processing
- **Automatic Title Generation**: Creates descriptive titles from content
- **Smart Summarization**: Generates concise summaries of long content
- **Intelligent Tagging**: Automatically suggests relevant tags
- **Category Classification**: Suggests appropriate categories

### Search Capabilities
- **Semantic Search**: Find content by meaning using vector embeddings
- **Keyword Search**: Traditional text-based search
- **Hybrid Search**: Combines semantic and keyword search for best results
- **Real-time Filtering**: Instant search results as you type

### Content Management
- **Multi-format Support**: Text, files, images, and web pages
- **File Processing**: Extract text from PDFs, Word docs, and images
- **Web Scraping**: Save content from any web page
- **Timeline Organization**: View memories chronologically

### Privacy & Security
- **Local Processing**: All AI processing happens on your machine
- **No External APIs**: Your data never leaves your system
- **Local Storage**: All data stored locally in SQLite and ChromaDB
- **Rate Limiting**: Built-in protection against abuse

## Deployment

### Docker Deployment (Recommended)
```bash
# Clone and build
git clone https://github.com/your-username/memory-assistant.git
cd memory-assistant

# Start with Docker Compose
docker-compose up -d
```

### Manual Deployment
See the [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions on:
- Server setup and configuration
- SSL/HTTPS setup
- Production optimizations
- Monitoring and maintenance

## Development

### Setting up Development Environment
```bash
# Backend development
cd backend
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
uvicorn app.main:app --reload

# Frontend development
cd frontend
npm install
npm run dev
```

### Code Quality
- **Backend**: Uses black, flake8, and mypy for code quality
- **Frontend**: Uses ESLint, Prettier, and TypeScript for code quality
- **Testing**: pytest for backend, Jest for frontend

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version (3.8+ required)
- Verify all dependencies are installed
- Check if AI model file exists in `backend/models/`

**AI features not working:**
- Ensure Phi-3 model is downloaded and in correct location
- Check available RAM (4GB+ recommended)
- Verify model file permissions

**Frontend build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (16+ required)
- Verify environment variables

**Database issues:**
- Check database file permissions
- Ensure sufficient disk space
- Verify SQLite installation

## Performance Tips

### For Better Performance
- **RAM**: 8GB+ recommended for smooth AI processing
- **Storage**: Use SSD for better database performance
- **CPU**: Multi-core processor recommended for AI models
- **Network**: Stable connection for web scraping features

### Optimization Settings
- Adjust `RATE_LIMIT_PER_MINUTE` based on your needs
- Configure `MAX_FILE_SIZE` for file upload limits
- Set appropriate `LOG_LEVEL` for production

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Microsoft Phi-3**: For the local LLM model
- **Hugging Face**: For the sentence transformers model
- **FastAPI**: For the excellent web framework
- **React**: For the frontend framework
- **ChromaDB**: For vector storage capabilities

## Support

- 📖 **Documentation**: Check the [docs/](docs/) directory
- 🐛 **Issues**: Report bugs on [GitHub Issues](https://github.com/your-username/memory-assistant/issues)
- 💬 **Discussions**: Join the [GitHub Discussions](https://github.com/your-username/memory-assistant/discussions)
- 📧 **Contact**: [your-email@example.com](mailto:your-email@example.com)

---

<div align="center">

**Made with ❤️ for better memory management**

[⭐ Star this repo](https://github.com/your-username/memory-assistant) • [🐛 Report Bug](https://github.com/your-username/memory-assistant/issues) • [💡 Request Feature](https://github.com/your-username/memory-assistant/issues)

</div>

