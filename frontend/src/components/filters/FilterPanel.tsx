"use client"

import type React from "react"
import { Star, FileText, Globe, ImageIcon, Type, Brain, Search } from "lucide-react"
import type { MemoryFilters } from "../../types/memory"

interface FilterPanelProps {
  filters: MemoryFilters
  onFilterChange: (filters: MemoryFilters) => void
  sourceTypes: string[]
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, sourceTypes }) => {
  const handleSourceTypeChange = (sourceType: string) => {
    onFilterChange({ ...filters, sourceType: filters.sourceType === sourceType ? null : sourceType })
  }

  const handleFavoritesToggle = () => {
    onFilterChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
  }

  const handleSearchTypeChange = (type: MemoryFilters["searchType"]) => {
    onFilterChange({ ...filters, searchType: type })
  }

  const iconMap: { [key: string]: React.ReactNode } = {
    text: <Type size={14} />,
    file: <FileText size={14} />,
    url: <Globe size={14} />,
    image: <ImageIcon size={14} />,
  }

  return (
    <div className="bg-gradient-to-r from-gray-900/60 to-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-green-400 rounded-full"></div>
            <span className="text-sm font-semibold text-green-400 tracking-wide">SEARCH</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSearchTypeChange("hybrid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filters.searchType === "hybrid"
                  ? "bg-green-500/25 text-green-300 border border-green-400/40 shadow-sm shadow-green-500/20"
                  : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-green-400 border border-gray-700/50"
              }`}
            >
              <Brain size={12} />
              Hybrid
            </button>
            <button
              onClick={() => handleSearchTypeChange("semantic")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filters.searchType === "semantic"
                  ? "bg-green-500/25 text-green-300 border border-green-400/40 shadow-sm shadow-green-500/20"
                  : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-green-400 border border-gray-700/50"
              }`}
            >
              <Brain size={12} />
              Semantic
            </button>
            <button
              onClick={() => handleSearchTypeChange("keyword")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filters.searchType === "keyword"
                  ? "bg-green-500/25 text-green-300 border border-green-400/40 shadow-sm shadow-green-500/20"
                  : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-green-400 border border-gray-700/50"
              }`}
            >
              <Search size={12} />
              Keyword
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-green-400 rounded-full"></div>
            <span className="text-sm font-semibold text-green-400 tracking-wide">TYPE</span>
          </div>
          <div className="flex gap-2">
            {sourceTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleSourceTypeChange(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  filters.sourceType === type
                    ? "bg-green-500/25 text-green-300 border border-green-400/40 shadow-sm shadow-green-500/20"
                    : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-green-400 border border-gray-700/50"
                }`}
              >
                {iconMap[type]}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleFavoritesToggle}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
            filters.favoritesOnly
              ? "bg-green-500/25 text-green-300 border border-green-400/40 shadow-sm shadow-green-500/20"
              : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-green-400 border border-gray-700/50"
          }`}
        >
          <Star size={12} className={filters.favoritesOnly ? "fill-current" : ""} />
          Favorites
        </button>
      </div>
    </div>
  )
}
