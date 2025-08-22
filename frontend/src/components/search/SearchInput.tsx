"use client"

import type React from "react"
import { Search, Sparkles } from "lucide-react"

interface SearchInputProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
      </div>
      <input
        type="search"
        placeholder="Search by meaning, keywords, or content..."
        className="w-full pl-12 pr-16 py-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 text-lg hover:bg-gray-900/70"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <Sparkles className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  )
}
