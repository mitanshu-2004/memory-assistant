import apiClient from "./api"
import type { Memory } from "../types/memory"

class MemoryService {
  // Get all memories with filters
  async getAllMemories(filters: any = {}): Promise<Memory[]> {
    const response = await apiClient.get("/memory/", { params: filters })
    return response.data
  }

  // Get memory by ID
  async getMemoryById(id: string): Promise<Memory> {
    const response = await apiClient.get(`/memory/${id}`)
    return response.data
  }

  // Create new memory from text
  async createMemory(content: string, categoryId?: number): Promise<Memory> {
    const response = await apiClient.post("/memory/", {
      content,
      category_id: categoryId,
    })
    return response.data
  }

  // Upload file memory
  async uploadMemory(file: File): Promise<Memory> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/memory/from-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }

  // Create memory from URL
  async createMemoryFromUrl(url: string): Promise<Memory> {
    const response = await apiClient.post("/memory/from-url", { url })
    return response.data
  }

  // Create memory from image
  async createMemoryFromImage(file: File): Promise<Memory> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/memory/from-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }

  // Update memory
  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    const response = await apiClient.put(`/memory/${id}`, updates)
    return response.data
  }

  // Delete memory
  async deleteMemory(id: string): Promise<void> {
    await apiClient.delete(`/memory/${id}`)
  }

  async generateSummary(memoryId: string): Promise<Memory> {
    const response = await apiClient.post(`/memory/${memoryId}/summarize`)
    return response.data
  }

  async generateTitle(memoryId: string): Promise<Memory> {
    const response = await apiClient.post(`/memory/${memoryId}/generate-title`)
    return response.data
  }

  async generateTags(memoryId: string): Promise<Memory> {
    const response = await apiClient.post(`/memory/${memoryId}/generate-tags`)
    return response.data
  }

  async generateCategory(memoryId: string): Promise<Memory> {
    const response = await apiClient.post(`/memory/${memoryId}/generate-category`)
    return response.data
  }

  // Get processing status
  async getProcessingStatus(memoryId: string): Promise<any> {
    const response = await apiClient.get(`/memory/${memoryId}/status`)
    return response.data
  }

  // Export memories
  async exportMemories(): Promise<Blob> {
    const response = await apiClient.get("/memory/export", {
      responseType: "blob",
    })
    return response.data
  }
}

// Export singleton instance
export const memoryService = new MemoryService()

// Export the class as well for type checking
export { MemoryService }
