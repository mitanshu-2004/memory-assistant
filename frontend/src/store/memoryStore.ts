import { create } from "zustand"
import type { Memory, MemoryFilters } from "../types/memory"
import { memoryService } from "../services/memory.service.ts"

interface MemoryState {
  memories: Memory[]
  isLoading: boolean
  fetchAllMemories: (filters: MemoryFilters) => Promise<void>
  createMemory: (content: string, source: string, categoryId: number | null) => Promise<void>
  uploadMemory: (file: File) => Promise<void>
  deleteMemory: (memoryId: string) => Promise<void>
  toggleFavorite: (memory: Memory) => Promise<void>
  addMemoryFromUrl: (url: string) => Promise<void>
  addMemoryFromImage: (file: File) => Promise<void>
  updateMemory: (
    id: string,
    data: { title?: string; content?: string; category_id?: number | null; tags?: string[] },
  ) => Promise<void>
  summarizeMemory: (memoryId: string) => Promise<void>
  generateTitle: (memoryId: string) => Promise<void>
  generateTags: (memoryId: string) => Promise<void>
  generateCategory: (memoryId: string) => Promise<void>
}

export const useMemoryStore = create<MemoryState>((set) => ({
  memories: [],
  isLoading: false,

  fetchAllMemories: async (filters) => {
    set({ isLoading: true })
    try {
      const memories = await memoryService.getAllMemories(filters)
      set({
        memories: memories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to fetch memories:", error)
      set({ isLoading: false })
    }
  },

  createMemory: async (content, source, categoryId) => {
    const tempId = `temp-${Date.now()}`
    const optimisticMemory: Memory = {
      id: tempId,
      title: content.substring(0, 75) + (content.length > 75 ? "..." : ""),
      content: content,
      summary: null,
      source_type: source as "text" | "file" | "url" | "image",
      source_url: null,
      file_path: null,
      mime_type: null,
      status: "processing",
      is_favorite: false,
      created_at: new Date().toISOString(),
      tags: [],
      category: null,
      processing_step: "pending",
    }
    set((state) => ({ memories: [optimisticMemory, ...state.memories] }))

    try {
      const memory = await memoryService.createMemory(content, categoryId || undefined)
      set((state) => ({
        memories: state.memories.map((m) => (m.id === tempId ? memory : m)),
      }))
    } catch (error) {
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== tempId),
      }))
      throw error
    }
  },

  uploadMemory: async (file) => {
    try {
      const memory = await memoryService.uploadMemory(file)
      set((state) => ({ memories: [memory, ...state.memories] }))
    } catch (error) {
      console.error("Failed to upload memory:", error)
      throw error
    }
  },

  deleteMemory: async (memoryId) => {
    try {
      await memoryService.deleteMemory(memoryId)
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== memoryId),
      }))
    } catch (error) {
      console.error("Failed to delete memory:", error)
      throw error
    }
  },

  toggleFavorite: async (memory) => {
    set((state) => ({
      memories: state.memories.map((m) => (m.id === memory.id ? { ...m, is_favorite: !m.is_favorite } : m)),
    }))

    try {
      const updatedMemory = await memoryService.updateMemory(memory.id, {
        is_favorite: !memory.is_favorite,
      })
      set((state) => ({
        memories: state.memories.map((m) => (m.id === memory.id ? updatedMemory : m)),
      }))
    } catch (error) {
      set((state) => ({
        memories: state.memories.map((m) => (m.id === memory.id ? { ...m, is_favorite: memory.is_favorite } : m)),
      }))
      console.error("Failed to toggle favorite:", error)
      throw error
    }
  },

  addMemoryFromUrl: async (url) => {
    try {
      const memory = await memoryService.createMemoryFromUrl(url)
      set((state) => ({ memories: [memory, ...state.memories] }))
    } catch (error) {
      console.error("Failed to create memory from URL:", error)
      throw error
    }
  },

  addMemoryFromImage: async (file) => {
    try {
      const memory = await memoryService.createMemoryFromImage(file)
      set((state) => ({ memories: [memory, ...state.memories] }))
    } catch (error) {
      console.error("Failed to create memory from image:", error)
      throw error
    }
  },

  updateMemory: async (id, data) => {
    try {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.map((tagName, index) => ({ id: index + 1, name: tagName })) : undefined,
      }
      const memory = await memoryService.updateMemory(id, processedData)
      set((state) => ({
        memories: state.memories.map((m) => (m.id === id ? memory : m)),
      }))
    } catch (error) {
      console.error("Failed to update memory:", error)
      throw error
    }
  },

  summarizeMemory: async (memoryId) => {
    try {
      const memory = await memoryService.generateSummary(memoryId)
      set((state) => ({
        memories: state.memories.map((m) => (m.id === memoryId ? memory : m)),
      }))
    } catch (error) {
      console.error("Failed to summarize memory:", error)
      throw error
    }
  },

  generateTitle: async (memoryId) => {
    try {
      const memory = await memoryService.generateTitle(memoryId)
      set((state) => ({
        memories: state.memories.map((m) => (m.id === memoryId ? memory : m)),
      }))
    } catch (error) {
      console.error("Failed to generate title:", error)
      throw error
    }
  },

  generateTags: async (memoryId) => {
    try {
      const memory = await memoryService.generateTags(memoryId)
      set((state) => ({
        memories: state.memories.map((m) => (m.id === memoryId ? memory : m)),
      }))
    } catch (error) {
      console.error("Failed to generate tags:", error)
      throw error
    }
  },

  generateCategory: async (memoryId) => {
    try {
      const memory = await memoryService.generateCategory(memoryId)
      set((state) => ({
        memories: state.memories.map((m) => (m.id === memoryId ? memory : m)),
      }))
    } catch (error) {
      console.error("Failed to generate category:", error)
      throw error
    }
  },
}))
