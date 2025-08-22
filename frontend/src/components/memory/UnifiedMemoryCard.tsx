"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Star,
  Folder,
  Edit,
  BrainCircuit,
  Trash2,
  Loader,
  FileText,
  Globe,
  ImageIcon,
  Video,
  Music,
  Archive,
  Code,
  X,
  Download,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react"

import type { Memory } from "../../types/memory"

interface UnifiedMemoryCardProps {
  memory: Memory
  onDelete?: (memoryId: string) => void
  onSummarize?: (memoryId: string) => Promise<void>
  onToggleFavorite?: (memory: Memory) => void
  onEdit?: (memory: Memory) => void
}

// File service functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

const getFileUrl = (memory: Memory): string => {
  if (!memory.file_path) return ""
  return `${API_BASE_URL}/api/v1/memory/${memory.id}/file`
}

const getFileExtension = (filename: string) => {
  return filename.split(".").pop()?.toLowerCase() || ""
}

const getFileType = (mimeType: string, filename: string) => {
  if (!mimeType && !filename) return "unknown"

  const ext = getFileExtension(filename)

  if (mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return "image"
  }
  if (mimeType?.startsWith("video/") || ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) {
    return "video"
  }
  if (mimeType?.startsWith("audio/") || ["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) {
    return "audio"
  }
  if (mimeType?.includes("pdf") || ext === "pdf") {
    return "pdf"
  }
  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) {
    return "document"
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return "archive"
  }
  if (["js", "ts", "html", "css", "json", "xml", "py", "java", "cpp"].includes(ext)) {
    return "code"
  }

  return "file"
}

const getFileIcon = (fileType: string, size = 16) => {
  const iconProps = { size }

  switch (fileType) {
    case "image":
      return <ImageIcon {...iconProps} className="text-green-400" />
    case "video":
      return <Video {...iconProps} className="text-purple-400" />
    case "audio":
      return <Music {...iconProps} className="text-pink-400" />
    case "pdf":
      return <FileText {...iconProps} className="text-red-400" />
    case "document":
      return <FileText {...iconProps} className="text-blue-400" />
    case "archive":
      return <Archive {...iconProps} className="text-yellow-400" />
    case "code":
      return <Code {...iconProps} className="text-orange-400" />
    default:
      return <FileText {...iconProps} className="text-blue-400" />
  }
}

const getFileName = (memory: Memory): string => {
  if (memory.source_url && memory.source_type !== "url") {
    return memory.source_url.split("/").pop() || "Unknown file"
  }
  if (memory.file_path) {
    const ext = getFileExtension(memory.file_path)
    return `${memory.title}.${ext}` || memory.file_path
  }
  return "Unknown file"
}

// Tooltip component for better UX
const Tooltip: React.FC<{ children: React.ReactNode; content: string; disabled?: boolean }> = ({
  children,
  content,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  if (disabled) return <>{children}</>

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 border border-gray-600">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export const UnifiedMemoryCard: React.FC<UnifiedMemoryCardProps> = ({
  memory,
  onDelete,
  onSummarize,
  onToggleFavorite,
  onEdit,
}) => {
  const [isTextExpanded, setIsTextExpanded] = useState(false)
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
  const [isTextOverflowing, setIsTextOverflowing] = useState(false)
  const [isSummaryOverflowing, setIsSummaryOverflowing] = useState(false)

  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const textContentRef = useRef<HTMLParagraphElement>(null)
  const summaryContentRef = useRef<HTMLParagraphElement>(null)

  const isProcessing = memory.processing_step !== "complete"

  // File information using corrected service
  const fileUrl = getFileUrl(memory)
  const fileType = getFileType(memory.mime_type || "", memory.file_path || "")
  const fileName = getFileName(memory)
  const fileExtension = fileName ? getFileExtension(fileName) : ""

  // Check if content is overflowing
  useEffect(() => {
    const textElement = textContentRef.current
    if (textElement) {
      const isOverflowing = textElement.scrollHeight > textElement.clientHeight
      setIsTextOverflowing(isOverflowing)
    }

    const summaryElement = summaryContentRef.current
    if (summaryElement) {
      const isOverflowing = summaryElement.scrollHeight > summaryElement.clientHeight
      setIsSummaryOverflowing(isOverflowing)
    }
  }, [memory.content, memory.summary])

  const iconMap: { [key: string]: React.ReactNode } = {
    text: <FileText size={14} />,
    file: <FileText size={14} />,
    url: <Globe size={14} />,
    image: <ImageIcon size={14} />,
  }

  const getProcessingMessage = (step: string) => {
    const messages: { [key: string]: string } = {
      pending: "Waiting...",
      generating_title: "Generating Title...",
      generating_tags: "Creating Tags...",
      generating_summary: "Summarizing...",
      categorizing: "Categorizing...",
      embedding: "Indexing...",
      error: "Failed",
    }
    return messages[step] || "Processing..."
  }

  // Enhanced summary button state logic
  const getSummaryButtonState = () => {
    const contentWordCount = memory.content ? memory.content.split(" ").length : 0

    // Content is too short (less than 10 words)
    if (contentWordCount < 10) {
      return {
        text: "Content Too Short",
        icon: Info,
        color: "text-gray-500",
        disabled: true,
        tooltip: `Content is too short for summarization.`,
      }
    }

    // Check for error markers in summary
    if (memory.summary === "TOO_SHORT") {
      return {
        text: "Content Too Short",
        icon: AlertTriangle,
        color: "text-amber-500",
        disabled: true,
        tooltip: `Previous attempt found content too short for meaningful summary (${contentWordCount} words)`,
      }
    }

    if (memory.summary === "ERROR_GENERATED") {
      return {
        text: "Summary Failed",
        icon: AlertCircle,
        color: "text-red-500",
        disabled: true,
        tooltip: "Previous summary generation failed. Content may be unsuitable for summarization.",
      }
    }

    // Normal states
    if (!memory.summary) {
      return {
        text: "Generate Summary",
        icon: BrainCircuit,
        color: "text-gray-500 hover:text-blue-400",
        disabled: false,
        tooltip: `Generate AI summary for this content (${contentWordCount} words)`,
      }
    }

    return {
      text: "Regenerate Summary",
      icon: BrainCircuit,
      color: "text-blue-400 hover:text-blue-300",
      disabled: false,
      tooltip: "Regenerate AI summary",
    }
  }

  // Enhanced edit button state logic
  const getEditButtonState = () => {
    if (memory.source_type === "text") {
      return {
        text: "Edit Memory",
        icon: Edit,
        color: "text-gray-500 hover:text-green-400",
        disabled: false,
        tooltip: "Edit this text memory",
      }
    }

    // For non-text source types
    const sourceTypeLabels: { [key: string]: string } = {
      image: "image",
      file: "file",
      url: "URL",
    }

    const sourceLabel = sourceTypeLabels[memory.source_type] || memory.source_type

    return {
      text: "Cannot Edit",
      icon: Edit,
      color: "text-gray-500",
      disabled: true,
      tooltip: `Cannot edit ${sourceLabel} memories. Only text memories can be edited.`,
    }
  }

  const summaryButtonState = getSummaryButtonState()
  const editButtonState = getEditButtonState()

  const handleSummarize = async () => {
    if (!onSummarize || summaryButtonState.disabled || isSummarizing) return

    setIsSummarizing(true)
    setSummaryError(null)

    try {
      await onSummarize(memory.id)
    } catch (error: any) {
      console.error("Summarize error:", error)

      // Handle different error types from the API
      if (error.detail?.error === "CONTENT_TOO_SHORT") {
        setSummaryError(`Content is too short (${error.detail.word_count} words)`)
      } else if (error.detail?.error === "SUMMARY_GENERATION_FAILED") {
        setSummaryError("Failed to generate meaningful summary")
      } else {
        setSummaryError("Failed to generate summary")
      }
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleEdit = () => {
    if (!onEdit || editButtonState.disabled) return
    onEdit(memory)
  }

  const renderFileViewer = () => {
    if (!isFileViewerOpen || !fileUrl) return null

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative max-w-7xl max-h-screen w-full h-full p-4">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <a
              href={fileUrl}
              download={fileName}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              title="Download file"
            >
              <Download size={20} />
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </a>
            <button
              onClick={() => setIsFileViewerOpen(false)}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="w-full h-full flex items-center justify-center">
            {fileType === "image" && (
              <img
                src={fileUrl || "/placeholder.svg"}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onError={() => {
                  console.log("Image load error:", fileUrl)
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", fileUrl)
                }}
              />
            )}

            {fileType === "video" && (
              <video
                src={fileUrl}
                controls
                className="max-w-full max-h-full"
                onError={() => {
                  console.log("Video load error:", fileUrl)
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}

            {fileType === "audio" && (
              <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-pink-500/20 rounded-full">
                    <Music size={32} className="text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{fileName}</h3>
                    <p className="text-gray-400">{fileExtension?.toUpperCase()} Audio File</p>
                  </div>
                </div>
                <audio
                  src={fileUrl}
                  controls
                  className="w-full"
                  onError={() => {
                    console.log("Audio load error:", fileUrl)
                  }}
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}

            {fileType === "pdf" && (
              <iframe
                src={fileUrl}
                className="w-full h-full border-0 rounded-lg"
                title={fileName}
                onError={() => {
                  console.log("PDF load error:", fileUrl)
                }}
              />
            )}

            {!["image", "video", "audio", "pdf"].includes(fileType) && (
              <div className="bg-gray-800 rounded-xl p-8 text-center shadow-xl">
                <div className="p-6 bg-gray-700/50 rounded-full mx-auto mb-4 w-fit">{getFileIcon(fileType, 48)}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{fileName}</h3>
                <p className="text-gray-400 mb-4">{fileExtension?.toUpperCase()} File</p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Globe size={16} />
                    Open File
                  </a>
                  <a
                    href={fileUrl}
                    download={fileName}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderFilePreview = () => {
    // For images, use the API endpoint for consistent access
    if (memory.source_type === "image" && fileUrl) {
      return (
        <img
          src={fileUrl}
          alt={memory.title || "Image"}
          className="rounded-lg mb-4 cursor-pointer max-h-60 object-contain shadow"
          onClick={() => setIsFileViewerOpen(true)}
          onError={() => {
            console.log("Image preview load error:", fileUrl)
          }}
        />
      )
    }

    // For other file types, try the original preview logic
    const originalExt = memory.source_url?.split(".").pop()?.toLowerCase()
    if (!originalExt) return null

    const filePath = `${memory.id}.${originalExt}`
    const fileUrl2 = `${API_BASE_URL}/content/${filePath}`

    if (["png", "jpg", "jpeg", "gif", "webp"].includes(originalExt)) {
      return (
        <img
          src={fileUrl2 || "/placeholder.svg"}
          alt={memory.title || "Image"}
          className="rounded-lg mb-4 cursor-pointer max-h-60 object-contain shadow"
          onClick={() => setIsFileViewerOpen(true)}
        />
      )
    }

    if (originalExt === "pdf") {
      return (
        <div
          onClick={() => window.open(fileUrl2, "_blank")}
          className="flex items-center gap-3 p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 transition"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
            <FileText className="text-red-500" size={28} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-200">{memory.title || "PDF Document"}</p>
            <p className="text-sm text-gray-400">{memory.source_url}</p>
          </div>
          <span className="text-sm text-blue-400">Open</span>
        </div>
      )
    }

    return (
      <div
        className="border border-gray-600 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-700/50"
        onClick={() => window.open(fileUrl2, "_blank")}
      >
        <span className="text-gray-300">📎 {memory.source_url}</span>
      </div>
    )
  }

  const renderSummarySection = () => {
    const hasSummary =
      memory.summary && memory.summary.trim() && memory.summary !== "TOO_SHORT" && memory.summary !== "ERROR_GENERATED"

    // Don't show summary section if there's no valid summary
    if (!hasSummary) {
      return null
    }

    return (
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={14} className="text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Summary</span>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-md">
          <p
            ref={summaryContentRef}
            className={`text-sm text-gray-200 leading-relaxed ${isSummaryExpanded ? "" : "line-clamp-3"}`}
          >
            {memory.summary}
          </p>

          {isSummaryOverflowing && (
            <button
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2 transition-colors"
            >
              {isSummaryExpanded ? (
                <>
                  <ChevronUp size={14} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Show more
                </>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderTextContent = () => {
    // Only show text content for source_type="text" or when content is meaningful text
    if (memory.source_type !== "text") return null

    const content = memory.content?.trim()
    if (!content) return null

    return (
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-400">Content</span>
        </div>

        <div className="bg-gray-800/30 border border-gray-600/30 p-3 rounded-md">
          <p
            ref={textContentRef}
            className={`text-sm text-gray-200 leading-relaxed whitespace-pre-wrap ${isTextExpanded ? "" : "line-clamp-4"}`}
          >
            {content}
          </p>

          {isTextOverflowing && (
            <button
              onClick={() => setIsTextExpanded(!isTextExpanded)}
              className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 mt-2 transition-colors"
            >
              {isTextExpanded ? (
                <>
                  <ChevronUp size={14} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Show more
                </>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (memory.source_type) {
      case "text":
        return (
          <>
            {/* Show summary section first (only if summary exists) */}
            {renderSummarySection()}

            {/* Show the actual text content */}
            {renderTextContent()}
          </>
        )

      case "image":
      case "file":
        return (
          <>
            {/* Show summary section first (only if summary exists) */}
            {renderSummarySection()}

            {/* Show the actual file/image */}
            {renderFilePreview()}
          </>
        )

      case "url":
        return (
          <>
            {/* Show summary section first (only if summary exists) */}
            {renderSummarySection()}

            <div className="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-md">
              <div className="flex items-center text-green-400 mb-2">
                <Globe size={14} className="mr-2" />
                <span className="font-medium">Source:</span>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-md border border-gray-600/30">
                <a
                  href={memory.source_url || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors break-all inline-flex items-center gap-1"
                >
                  {memory.source_url}
                  <Globe size={12} />
                </a>
              </div>
            </div>
          </>
        )

      default:
        return (
          <>
            {/* Show summary section first (only if summary exists) */}
            {renderSummarySection()}

            {/* Show the actual text content for any other type that might have content */}
            {renderTextContent()}
          </>
        )
    }
  }

  return (
    <>
      {renderFileViewer()}

      <div
        className={`bg-gray-800 p-4 rounded-lg shadow transition-all duration-300 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-green-500/10 ${
          isProcessing ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-grow mr-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-green-400 flex items-center">
                {isProcessing && <Loader size={18} className="animate-spin mr-2" />}
                {memory.title}
              </h3>
              {isProcessing && (
                <span className="text-xs text-amber-400 font-mono">{getProcessingMessage(memory.processing_step)}</span>
              )}
            </div>

            {/* Show summary error if any */}
            {summaryError && (
              <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded-md flex items-center gap-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-300">{summaryError}</span>
                <button onClick={() => setSummaryError(null)} className="ml-auto text-red-400 hover:text-red-300">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="mb-3">{renderContent()}</div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-xs mb-3">
              {memory.category && (
                <div className="flex items-center text-green-400">
                  <Folder size={14} className="mr-1.5" />
                  <span>{memory.category.name}</span>
                </div>
              )}

              {memory.processing_step === "generating_tags" ? (
                <div className="flex items-center flex-wrap gap-2 text-gray-500 italic">
                  <span>Generating tags...</span>
                </div>
              ) : (
                memory.tags &&
                memory.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <span key={tag.id} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                {iconMap[memory.source_type]}
                <span className="ml-1.5 truncate">
                  {memory.source_type === "file" || memory.source_type === "image"
                    ? fileName
                    : memory.source_url || memory.source_type}
                </span>
              </div>

              {fileUrl && (memory.source_type === "file" || memory.source_type === "image") && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFileViewerOpen(true)
                    }}
                    className="p-2 text-gray-500 hover:text-green-400 hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="View file"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <a
                    href={fileUrl}
                    download={fileName}
                    className="p-2 text-gray-500 hover:text-green-400 hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Download file"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Download size={18} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2 flex-shrink-0 ml-2">
            {/* Show edit button for all source types but disable for non-text */}
            {onEdit && (
              <Tooltip content={editButtonState.tooltip} disabled={!editButtonState.disabled}>
                <button
                  onClick={handleEdit}
                  className={`p-2 hover:bg-gray-700 rounded-full transition-colors ${
                    editButtonState.disabled || isProcessing
                      ? "cursor-not-allowed opacity-50"
                      : editButtonState.color
                  }`}
                  disabled={editButtonState.disabled || isProcessing}
                  aria-label={editButtonState.text}
                  title={editButtonState.disabled ? editButtonState.tooltip : undefined}
                >
                  <editButtonState.icon size={18} />
                </button>
              </Tooltip>
            )}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(memory)}
                className="p-2 text-gray-500 hover:text-amber-400 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Toggle favorite"
              >
                <Star size={18} className={`${memory.is_favorite ? "text-amber-400 fill-current" : ""}`} />
              </button>
            )}
            {onSummarize && (
              <Tooltip content={summaryButtonState.tooltip} disabled={!summaryButtonState.disabled && !summaryError}>
                <button
                  onClick={handleSummarize}
                  className={`p-2 hover:bg-gray-700 rounded-full transition-colors relative ${
                    summaryButtonState.disabled || isSummarizing
                      ? "cursor-not-allowed opacity-50"
                      : summaryButtonState.color
                  }`}
                  disabled={summaryButtonState.disabled || isProcessing || isSummarizing}
                  aria-label={summaryButtonState.text}
                  title={summaryButtonState.disabled ? summaryButtonState.tooltip : undefined}
                >
                  {isSummarizing ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <summaryButtonState.icon size={18} />
                  )}
                </button>
              </Tooltip>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(memory.id)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Delete memory"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}