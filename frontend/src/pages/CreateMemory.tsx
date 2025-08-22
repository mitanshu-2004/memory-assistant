"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "../store/uiStore"
import apiClient from "../services/api"
import { ArrowLeft, Save, Loader, Sparkles, Type, Clock } from "lucide-react"

export const CreateMemory = () => {
  const navigate = useNavigate()
  const { showNotification } = useUIStore()

  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!content.trim()) {
      showNotification("Content cannot be empty.", "error")
      return
    }

    setIsSaving(true)

    try {
      await apiClient.post("/memory/", {
        content,
      })

      showNotification("Memory saved and processing started!", "success")
      navigate("/timeline") // redirect immediately after save
    } catch (error: any) {
      console.error("Failed to save memory:", error)
      if (error.response?.status === 409) {
        showNotification("This content already exists in your memories.", "error")
      } else {
        showNotification("Failed to save memory.", "error")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const cancelProcessing = () => {
    setIsSaving(false)
    showNotification("Processing cancelled", "error")
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/90 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                disabled={isSaving}
              >
                <ArrowLeft size={20} className="text-gray-400 hover:text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                  <Type className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-white tracking-wide">Create Text Memory</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Processing Loader */}
      {isSaving && (
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="mb-6 p-6 bg-gray-900 rounded-lg border border-gray-700 flex flex-col items-center justify-center space-y-4">
            <Clock size={32} className="text-green-400" />
            <Loader className="animate-spin text-green-400" size={32} />
            <p className="text-white text-lg">Processing your memory...</p>
            <p className="text-gray-400 text-sm text-center">
              This may take a few moments while we assign title and tags to your memory.
            </p>
            <button
              onClick={cancelProcessing}
              className="p-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isSaving && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900 border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="p-8">
              <div className="space-y-6">
                {/* Content Field */}
                <div>
                  <label className="block text-lg font-medium text-gray-300 mb-3">Content *</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all duration-200 resize-none text-white placeholder-gray-500"
                    placeholder="Write your thoughts, notes, or paste content here..."
                    required
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This is the main content that will be processed by AI for summaries and search.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center px-8 py-4 bg-gray-900/50 border-t border-gray-800/50">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>AI will help generate missing metadata</span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
                className="flex items-center px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 text-white font-medium"
              >
                {isSaving ? <Loader className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                <span>{isSaving ? "Processing..." : "Save Memory"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
