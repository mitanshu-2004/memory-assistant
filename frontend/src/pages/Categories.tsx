"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import apiClient from "../services/api"
import type { Category } from "../types/memory"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { CreateCategoryModal } from "../components/categories/CreateCategoryModal"
import { Trash2, PlusCircle, FolderOpen, Sparkles } from "lucide-react"
import { useUIStore } from "../store/uiStore"

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { showNotification } = useUIStore()

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<Category[]>("/categories/")
      setCategories(response.data)
    } catch (error) {
      console.error("Failed to fetch categories", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete the "${category.name}" category? This cannot be undone.`)) {
      try {
        await apiClient.delete(`/categories/${category.id}`)
        showNotification("Category deleted successfully.", "success")
        fetchCategories()
      } catch (error) {
        showNotification("Failed to delete category.", "error")
      }
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
        <p className="mt-6 text-gray-400 animate-pulse">Loading your categories...</p>
      </div>
    )
  }

  return (
    <>
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCategoryCreated={fetchCategories}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="relative mb-12">
          <div className="absolute top-0 left-0 w-32 h-32 bg-green-400/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-8 right-8 w-24 h-24 bg-green-300/10 rounded-full blur-2xl -z-10"></div>

          <header className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-400/20 to-green-500/20 border border-green-400/30">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                  Categories
                </h1>
              </div>

              
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 
                         hover:from-green-400 hover:to-emerald-400 rounded-2xl font-semibold text-white
                         transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/25
                         hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <PlusCircle
                size={20}
                className="relative z-10 group-hover:rotate-180 transition-transform duration-300"
              />
              <span className="relative z-10">Create Category</span>
            </button>
          </header>
        </div>

        {/* Category Grid */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-green-400/10 blur-2xl"></div>
              </div>
              <div className="relative p-6 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                <FolderOpen size={48} className="text-gray-500" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-gray-300">No categories yet</h3>
              <p className="text-gray-500 max-w-md">
                Start organizing your memories by creating your first category. Group related thoughts and experiences
                together.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/20 hover:bg-green-500/30 
                           border border-green-500/30 hover:border-green-400/50 rounded-xl text-green-400 
                           hover:text-green-300 transition-all duration-200 font-medium"
              >
                <PlusCircle size={16} />
                Create your first category
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className="group relative animate-fadeSlideIn"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {/* Hover glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400/50 to-emerald-400/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div
                  className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm 
                                border border-gray-700/50 group-hover:border-green-400/30 rounded-2xl 
                                shadow-lg hover:shadow-2xl hover:shadow-green-500/10 overflow-hidden 
                                transition-all duration-500 hover:-translate-y-2"
                >
                  <Link to={`/category/${cat.id}`} className="block p-6 h-full">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div
                          className="p-3 rounded-xl bg-gradient-to-br from-green-400/10 to-green-500/5 
                                      group-hover:from-green-400/20 group-hover:to-green-500/10 
                                      border border-green-400/20 group-hover:border-green-400/40 
                                      transition-all duration-300"
                        >
                          <FolderOpen
                            size={24}
                            className="text-green-400 group-hover:text-green-300 transition-colors duration-300"
                          />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div
                              className="px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 
                                          group-hover:bg-green-400/20 group-hover:border-green-400/30 transition-all duration-300"
                            >
                              <span className="text-xs font-medium text-green-400 group-hover:text-green-300">
                                {cat.memory_count} memories
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteCategory(cat)
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 
                                         hover:border-red-400/40 text-red-400 hover:text-red-300 
                                         transition-all duration-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                              title="Delete category"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3
                          className="text-xl font-bold text-green-400 group-hover:text-green-300 
                                     transition-all duration-300 line-clamp-2"
                        >
                          {cat.name}
                        </h3>
                      </div>

                      <div
                        className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-green-400 to-emerald-400 
                                    rounded-full transition-all duration-500 ease-out"
                      ></div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
