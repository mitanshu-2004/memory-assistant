"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiClient from "../services/api"
import type { Memory, Category } from "../types/memory"
import { UnifiedMemoryCard } from "../components/memory/UnifiedMemoryCard"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { useMemoryStore } from "../store/memoryStore"
import { EditMemoryModal } from "../components/memory/EditMemoryModal"
import { Modal } from "../components/ui/Modal"
import { Trash2, FolderOpen, ArrowLeft, BarChart3, Calendar, Sparkles } from "lucide-react"
import { useUIStore } from "../store/uiStore"

interface CategoryDetailData {
  category: Category
  memories: Memory[]
}

export const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showNotification } = useUIStore()
  const [data, setData] = useState<CategoryDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { deleteMemory, toggleFavorite } = useMemoryStore()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [memoryToEdit, setMemoryToEdit] = useState<Memory | null>(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [summaryContent, setSummaryContent] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)

  const fetchCategoryDetails = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await apiClient.get<CategoryDetailData>(`/categories/${id}`)
      setData(response.data)
    } catch (error) {
      console.error("Failed to fetch category details", error)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoryDetails()
  }, [id])

  const handleEdit = (memory: Memory) => {
    setMemoryToEdit(memory)
    setIsEditModalOpen(true)
  }

  const handleSummarize = async (memoryId: string) => {
    setIsSummaryModalOpen(true)
    setIsSummarizing(true)
    setSummaryContent("")
    try {
      const response = await apiClient.post(`/memory/${memoryId}/generate-summary`)

      // Backend returns the entire Memory object with updated summary field
      if (response.data && response.data.summary) {
        setSummaryContent(response.data.summary)
      } else {
        // If summary field is missing, it's a backend database schema issue
        setSummaryContent(
          "⚠️ Backend Database Issue\n\n" +
            "The summary generation completed successfully, but the 'summary' field is missing from the API response. " +
            "This indicates that the backend database model needs a 'summary' column added to the Memory table.\n\n" +
            "Please add a 'summary' column to your database schema and ensure it's included in the API response model.",
        )
      }
    } catch (error) {
      console.error("Summary generation error:", error)
      setSummaryContent("Failed to generate summary. Please try again.")
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!data) return
    if (
      window.confirm(`Are you sure you want to delete the "${data.category.name}" category? This cannot be undone.`)
    ) {
      try {
        await apiClient.delete(`/categories/${data.category.id}`)
        showNotification("Category deleted successfully.", "success")
        navigate("/")
      } catch (error) {
        showNotification("Failed to delete category.", "error")
      }
    }
  }

  const handleToggleFavorite = async (memory: Memory) => {
    try {
      await toggleFavorite(memory)
      // Update local state to reflect the change immediately
      setData((prevData) => {
        if (!prevData) return prevData
        return {
          ...prevData,
          memories: prevData.memories.map((m) => (m.id === memory.id ? { ...m, is_favorite: !m.is_favorite } : m)),
        }
      })
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      showNotification("Failed to update favorite status.", "error")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[60vh]">
        <div className="relative">
          <LoadingSpinner size={48} />
          <div className="absolute inset-0 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-green-400/20 blur-xl"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-400 animate-pulse">Loading category details...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20">
            <FolderOpen size={48} className="text-red-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-red-400">Category Not Found</h2>
          <p className="text-gray-400">The category you're looking for doesn't exist or failed to load.</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 
                       border border-green-500/30 rounded-xl text-green-400 transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Back to Categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Enhanced Summary Modal */}
      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="AI Summary">
        {isSummarizing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <LoadingSpinner size={32} />
              <div className="absolute inset-0 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-green-400/20 blur-lg"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-400">Generating AI summary...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-400/5 to-green-500/5 border border-green-400/20">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summaryContent}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Memory Modal */}
      <EditMemoryModal
        memory={memoryToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          fetchCategoryDetails()
        }}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Enhanced Header with Background Elements */}
        <div className="relative mb-12">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-green-400/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-12 right-12 w-32 h-32 bg-green-300/8 rounded-full blur-2xl -z-10"></div>

          <header className="relative">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <button
                onClick={() => navigate("/categories")}
                className="flex items-center gap-1 hover:text-green-400 transition-colors duration-200"
              >
                <ArrowLeft size={14} />
                Categories
              </button>
              <span>/</span>
              <span className="text-gray-400">{data.category.name}</span>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                {/* Category Icon and Title */}
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-500/20 border border-green-400/30">
                    <FolderOpen className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                      {data.category.name}
                    </h1>
                    <p className="text-gray-400 mt-1 text-lg">
                      {data.memories.length} {data.memories.length === 1 ? "memory" : "memories"} stored
                    </p>
                  </div>
                </div>

                {/* Category Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                      <BarChart3 size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Memories</p>
                      <p className="text-lg font-semibold text-green-400">{data.memories.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                      <Calendar size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-lg font-semibold text-gray-300">
                        {data.memories.length > 0 ? "Active" : "Empty"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteCategory}
                  className="group relative p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 
                             border border-red-500/20 hover:border-red-400/40 text-red-400 hover:text-red-300 
                             transition-all duration-300 hover:scale-110 active:scale-95"
                  title="Delete category"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Trash2 size={20} className="relative z-10" />
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Enhanced Memory List / Empty State */}
        {data.memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-green-400/10 blur-3xl"></div>
              </div>
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                <FolderOpen size={64} className="text-gray-500" />
              </div>
            </div>
            <div className="text-center space-y-4 max-w-md">
              <h3 className="text-2xl font-bold text-gray-300">No memories yet</h3>
              <p className="text-gray-500 leading-relaxed">
                This category is empty. Start adding memories to build your collection of thoughts and experiences.
              </p>
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                  <Sparkles size={16} />
                  <span className="text-sm">Ready for your first memory</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Memory List Header */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-400/10 border border-green-400/20">
                  <Sparkles size={20} className="text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-200">Your Memories</h2>
                  <p className="text-gray-500">Explore and manage your collection</p>
                </div>
              </div>
            </div>

            {/* Memory List Component */}
            <div className="space-y-6">
              {data.memories.map((memory, index) => (
                <div
                  key={memory.id}
                  className="opacity-0 animate-fadeSlideIn"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <UnifiedMemoryCard
                    memory={memory}
                    onDelete={deleteMemory}
                    onSummarize={handleSummarize}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEdit}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
