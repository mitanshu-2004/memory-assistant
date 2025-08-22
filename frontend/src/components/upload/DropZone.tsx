"use client"

import type React from "react"
import { useCallback } from "react"
import { useDropzone, type Accept } from "react-dropzone"
import { UploadCloud, AlertCircle} from "lucide-react"

interface DropZoneProps {
  onFileUpload: (file: File) => void
  isUploading: boolean
  accept?: Accept
  message?: string
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileUpload,
  isUploading,
  accept = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpeg", ".jpg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "text/plain": [".txt"],
    "text/markdown": [".md"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  message = "Drag 'n' drop files here, or click to select",
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isUploading) {
        onFileUpload(acceptedFiles[0])
      }
    },
    [onFileUpload, isUploading],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    disabled: isUploading,
  })

  const getFileIcon = () => {
    if (isDragActive) return <UploadCloud size={48} className="mb-4 text-emerald-400" />
    return <UploadCloud size={48} className="mb-4 text-gray-400" />
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300
          ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/10 scale-[1.02] shadow-lg shadow-emerald-500/20"
              : "border-gray-600 hover:border-emerald-400 hover:bg-gray-800/30"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-gray-300">
          {getFileIcon()}
          {isUploading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-emerald-400 font-medium">Processing file...</p>
              <p className="text-sm text-gray-400">This may take a few minutes</p>
            </div>
          ) : isDragActive ? (
            <div className="space-y-2">
              <p className="text-emerald-400 font-semibold text-lg">Drop the file here!</p>
              <p className="text-sm text-gray-400">Release to start processing</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-semibold text-lg">{message}</p>
              <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">PDF</span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">Images</span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">Documents</span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">Text Files</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            File rejected:
          </p>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="text-sm text-red-300">
              <p className="font-medium">{file.name}</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                {errors.map((error) => (
                  <li key={error.code}>
                    {error.code === "file-too-large"
                      ? "File is too large (max 10MB)"
                      : error.code === "file-invalid-type"
                        ? "File type not supported"
                        : error.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
