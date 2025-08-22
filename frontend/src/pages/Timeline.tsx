"use client"

import { useState, useEffect, useMemo } from "react"
import { useMemoryStore } from "../store/memoryStore"
import type { Memory, MemoryFilters } from "../types/memory"
import { formatTimelineDate, formatMemoryTime } from "../utils/formatters"
import { UnifiedMemoryCard } from "../components/memory/UnifiedMemoryCard"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { SearchInput } from "../components/search/SearchInput"
import { FilterPanel } from "../components/filters/FilterPanel"
import { EditMemoryModal } from "../components/memory/EditMemoryModal"
import { Modal } from "../components/ui/Modal"
import apiClient from "../services/api"
import type { SearchResult } from "../types/memory"
import { Clock } from "lucide-react"

interface GroupedMemories {
  [date: string]: Memory[]
}

const getDateLabel = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return dateStr
    if (diffInDays < 30) return dateStr
    return dateStr
  } catch (error) {
    return dateStr
  }
}

export const Timeline = () => {
  const { memories, fetchAllMemories, deleteMemory, toggleFavorite, summarizeMemory } = useMemoryStore()
  const [isLoading, setIsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState("Loading timeline...")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [filters, setFilters] = useState<MemoryFilters>({
    sourceType: null,
    favoritesOnly: false,
    categoryId: null,
    searchType: "hybrid",
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [memoryToEdit, setMemoryToEdit] = useState<Memory | null>(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [summaryContent] = useState("")
  const [isSummarizing] = useState(false)

  useEffect(() => {
    const loadMemories = async () => {
      if (searchQuery.trim()) return
      setIsLoading(true)
      setStatusMessage("Loading timeline...")
      try {
        await fetchAllMemories(filters)
        setStatusMessage("Timeline loaded successfully.")
      } catch (error) {
        console.error("Error fetching memories:", error)
        setStatusMessage("Error: Could not load timeline.")
      } finally {
        setIsLoading(false)
      }
    }
    loadMemories()
  }, [fetchAllMemories, filters, searchQuery])

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === "") {
        const filteredMemories = memories.filter((memory) => {
          if (filters.favoritesOnly && !memory.is_favorite) return false
          if (filters.sourceType && memory.source_type !== filters.sourceType) return false
          if (filters.categoryId && memory.category?.id !== filters.categoryId) return false
          return true
        })
        setSearchResults(filteredMemories.map((memory) => ({ memory, score: 1 })))
        return
      }

      setIsLoading(true)
      try {
        const queryParams = new URLSearchParams({
          q: searchQuery,
          search_type: filters.searchType,
          ...(filters.favoritesOnly && { favorites_only: "true" }),
          ...(filters.sourceType && { source_type: filters.sourceType }),
          ...(filters.categoryId && { category_id: filters.categoryId.toString() }),
        })

        const response = await apiClient.get<{ results: SearchResult[] }>(`/search/?${queryParams.toString()}`)
        setSearchResults(response.data.results)
      } catch (error) {
        console.error("Error searching memories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    const debounceSearch = setTimeout(() => {
      performSearch()
    }, 300)
    return () => clearTimeout(debounceSearch)
  }, [searchQuery, memories, filters])

  const availableSourceTypes = useMemo(() => {
    const types = new Set(memories.map((m) => m.source_type))
    return Array.from(types)
  }, [memories])

  const displayMemories = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults.map((result) => result.memory)
    }
    return searchResults.map((result) => result.memory)
  }, [searchResults, searchQuery])

  const groupedMemories = useMemo(() => {
    if (!displayMemories || !Array.isArray(displayMemories)) return {}

    const grouped = displayMemories.reduce((acc: GroupedMemories, memory) => {
      if (!memory?.created_at) return acc

      try {
        const dateKey = formatTimelineDate(memory.created_at)
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(memory)
      } catch (error) {
        console.warn("Error formatting date for memory:", memory.id, error)
      }
      return acc
    }, {})

    return Object.keys(grouped)
      .sort((a, b) => {
        try {
          return new Date(b).getTime() - new Date(a).getTime()
        } catch {
          return 0
        }
      })
      .reduce((acc: GroupedMemories, date) => {
        acc[date] = grouped[date].sort((a, b) => {
          try {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          } catch {
            return 0
          }
        })
        return acc
      }, {})
  }, [displayMemories])

  const handleEdit = (memory: Memory) => {
    setMemoryToEdit(memory)
    setIsEditModalOpen(true)
  }

  const handleSummarize = async (memoryId: string) => {
    try {
      await summarizeMemory(memoryId)
    } catch (error) {
      console.error("Summary generation error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-black">
        <div className="relative">
          <LoadingSpinner size={48} />
          <div className="absolute inset-0 bg-green-400/10 rounded-full blur-xl animate-pulse"></div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg text-gray-300">{statusMessage}</p>
          <div className="flex items-center justify-center mt-3 space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
            <div
              className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="AI Summary">
        {/* Removed unused variables setSummaryContent and setIsSummarizing */}
        {isSummarizing ? (
          <div className="flex flex-col items-center justify-center h-32">
            <LoadingSpinner size={32} />
            <p className="mt-4 text-gray-400">Generating summary...</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summaryContent}</p>
          </div>
        )}
      </Modal>

      <EditMemoryModal memory={memoryToEdit} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

      <div className="saas-header">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Timeline</h1>
            </div>
          </div>
        </div>

        <div className="search-container">
          <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <div className="mt-4">
            <FilterPanel filters={filters} onFilterChange={setFilters} sourceTypes={availableSourceTypes} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative">
          {Object.keys(groupedMemories).length > 0 ? (
            <div className="space-y-16">
              {Object.keys(groupedMemories).map((date, dateIndex) => (
                <div
                  key={date}
                  className="relative opacity-0 animate-fadeSlideIn"
                  style={{
                    animationDelay: `${dateIndex * 100}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="flex items-center mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-4"></div>
                      <h2 className="text-xl font-light text-white tracking-wide">{getDateLabel(date)}</h2>
                      <div className="ml-4 text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                        {groupedMemories[date].length}
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gray-800 ml-6"></div>
                  </div>

                  <div className="ml-6 space-y-8 relative">
                    <div className="absolute left-[-1.5rem] top-0 bottom-0 w-px bg-gray-800"></div>

                    {groupedMemories[date].map((memory, memoryIndex) => (
                      <div
                        key={memory.id}
                        className="relative opacity-0 animate-fadeSlideIn"
                        style={{
                          animationDelay: `${(dateIndex * 100) + (memoryIndex * 50) + 200}ms`,
                          animationFillMode: "forwards",
                        }}
                      >
                        <div className="absolute left-[-1.625rem] top-8 w-1.5 h-1.5 bg-green-400 rounded-full transition-transform hover:scale-150 z-10"></div>

                        <div className="absolute left-[-6rem] top-6 text-xs text-gray-400 font-mono bg-gray-900/50 px-2 py-1 rounded border border-gray-700/30 min-w-[3rem] text-center">
                          {formatMemoryTime(memory.created_at)}
                        </div>

                        <div className="transform transition-all duration-300 hover:translate-x-2">
                          <UnifiedMemoryCard
                            memory={memory}
                            onDelete={deleteMemory}
                            onSummarize={handleSummarize}
                            onToggleFavorite={toggleFavorite}
                            onEdit={handleEdit}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-light text-gray-300 mb-2">
                {searchQuery || filters.favoritesOnly || filters.sourceType ? "No memories found" : "No memories yet"}
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                {searchQuery || filters.favoritesOnly || filters.sourceType
                  ? "Try adjusting your search or filters"
                  : "Your memories will appear here as you create them"}
              </p>
              {(searchQuery || filters.favoritesOnly || filters.sourceType) && (
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 text-sm transition-colors"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() =>
                      setFilters({ sourceType: null, favoritesOnly: false, categoryId: null, searchType: "hybrid" })
                    }
                    className="px-4 py-2 bg-green-400/10 text-green-400 rounded-lg text-sm hover:bg-green-400/20 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
