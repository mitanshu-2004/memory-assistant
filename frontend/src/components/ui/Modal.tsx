"use client"

import type React from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center border-b border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-xl transition-all duration-200"
          >
            <X size={20} />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
