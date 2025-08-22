"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DropZone } from "../components/upload/DropZone"
import { useUIStore } from "../store/uiStore"
import apiClient from "../services/api"
import { Globe, UploadIcon, Loader, Clock } from "lucide-react"

export const Upload = () => {
  const { showNotification } = useUIStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<"file" | "url">("file")
  const [urlInput, setUrlInput] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const navigate = useNavigate()

  // Validate file
  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "text/plain",
      "text/markdown",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (file.size > maxSize) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`
    }
    if (!allowedTypes.includes(file.type)) {
      return `File type "${file.type}" is not supported.`
    }
    return null
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      showNotification(error, "error")
      return
    }

    setCurrentFile(file)
    setIsProcessing(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      await apiClient.post("/memory/from-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
          }
        },
      })

      showNotification(`Successfully uploaded ${file.name}`, "success")
      navigate("/timeline")
    } catch (err: any) {
      console.error("Upload failed:", err)
      if (err.response?.status === 409) {
        showNotification("This content already exists in your memories.", "error")
      } else {
        showNotification("Failed to upload file.", "error")
      }
    } finally {
      setIsProcessing(false)
      setCurrentFile(null)
      setUploadProgress(0)
    }
  }

  // Handle URL submit
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!urlInput.trim()) {
      showNotification("Please enter a valid URL", "error")
      return
    }

    try {
      new URL(urlInput)
    } catch {
      showNotification("Please enter a valid URL", "error")
      return
    }

    setIsProcessing(true)
    try {
      await apiClient.post("/memory/from-url", { url: urlInput.trim() })
      showNotification("Successfully processed content from URL", "success")
      navigate("/timeline")
    } catch (err: any) {
      console.error("Error processing URL:", err)
      if (err.response?.status === 409) {
        showNotification("This content already exists in your memories.", "error")
      } else {
        showNotification("Failed to process URL.", "error")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const cancelProcessing = () => {
    setIsProcessing(false)
    setUploadProgress(0)
    setCurrentFile(null)
    showNotification("Processing cancelled", "error")
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add New Memory</h1>
        <p className="text-gray-400">Upload a file or extract content from a web URL</p>
      </header>

      {isProcessing && (
        <div className="mb-6 p-6 bg-gray-900 rounded-lg border border-gray-700 flex flex-col items-center justify-center space-y-4">
          <Clock size={32} className="text-green-400" />
          <Loader className="animate-spin text-green-400" size={32} />
          <p className="text-white text-lg">Processing your content...</p>
          {currentFile && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Upload Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={cancelProcessing}
            className="p-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {!isProcessing && (
        <div className="max-w-xl mx-auto">
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === "file" ? "bg-green-500 text-black font-medium" : "text-gray-400 hover:text-white"
              }`}
            >
              <UploadIcon size={18} />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === "url" ? "bg-green-500 text-black font-medium" : "text-gray-400 hover:text-white"
              }`}
            >
              <Globe size={18} />
              Web URL
            </button>
          </div>

          {activeTab === "file" ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Upload a File</h2>
              <DropZone
                onFileUpload={handleFileUpload}
                isUploading={isProcessing}
                accept={{
                  "application/pdf": [".pdf"],
                  "image/jpeg": [".jpeg", ".jpg"],
                  "image/png": [".png"],
                  "image/gif": [".gif"],
                  "image/webp": [".webp"],
                  "text/plain": [".txt"],
                  "text/markdown": [".md"],
                  "application/msword": [".doc"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                }}
                message="Drag 'n' drop a PDF, Image, or Document file here, or click to select"
              />
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Extract from Web URL</h2>
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !urlInput.trim()}
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing Content...
                    </>
                  ) : (
                    <>
                      <Globe size={18} />
                      Process Content
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  )
}
