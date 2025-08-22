import { Link } from "react-router-dom"
import { Brain, TimerIcon as Timeline, FolderOpen, Search, Zap, Database } from "lucide-react"

export const Home = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} />
            <span>AI-Powered Memory Platform</span>
          </div>

          <h1 className="hero-title">
            Your Digital
            <span className="text-neon"> Memory Vault</span>
          </h1>

          <p className="hero-description">
            Store, organize, and retrieve your digital memories with AI-powered search and intelligent categorization.
            Never lose track of important information again.
          </p>

          <div className="hero-actions">
            <Link to="/timeline" className="btn btn-primary btn-large">
              <Timeline size={20} />
              Explore Timeline
            </Link>
            <Link to="/create" className="btn btn-secondary btn-large">
              <Brain size={20} />
              Add Memory
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-section">
        <div className="section-header">
          <h2 className="section-title">Features</h2>
          <p className="section-description">Everything you need to manage your memories</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Timeline size={24} />
            </div>
            <h3 className="feature-title">Timeline View</h3>
            <p className="feature-description">
              Browse all your memories in chronological order with advanced filtering
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FolderOpen size={24} />
            </div>
            <h3 className="feature-title">Smart Categories</h3>
            <p className="feature-description">Organize memories with intelligent categorization and custom tags</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Search size={24} />
            </div>
            <h3 className="feature-title">AI Search</h3>
            <p className="feature-description">Find anything instantly with semantic search and content analysis</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Database size={24} />
            </div>
            <h3 className="feature-title">Multi-Format</h3>
            <p className="feature-description">Store text, images, files, and URLs in one unified platform</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Brain size={24} />
            </div>
            <h3 className="feature-title">AI Summaries</h3>
            <p className="feature-description">Get instant AI-generated summaries of your stored content</p>
          </div>
        </div>
      </div>
    </div>
  )
}
