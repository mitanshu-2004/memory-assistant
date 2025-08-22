import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Memory, Category } from '../../types/memory';
import { useMemoryStore } from '../../store/memoryStore';
import { useUIStore } from '../../store/uiStore';
import apiClient from '../../services/api';

interface EditMemoryModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMemoryModal: React.FC<EditMemoryModalProps> = ({ memory, isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const { updateMemory } = useMemoryStore();
  const { showNotification } = useUIStore();

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setContent(memory.content);
      setCategoryId(memory.category?.id ?? null);
      setTags(memory.tags.map(t => t.name).join(', '));
    }
    const fetchCategories = async () => {
      const response = await apiClient.get<Category[]>('/categories/');
      setAllCategories(response.data);
    };
    fetchCategories();
  }, [memory]);

  const handleSave = async () => {
    if (!memory) return;
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await updateMemory(memory.id, { title, content, category_id: categoryId, tags: tagList });
      showNotification('Memory updated successfully.', 'success');
      onClose();
    } catch (error) {
      showNotification('Failed to update memory.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Memory">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1">Content</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">Category</label>
          <select id="category" value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
            <option value="">Uncategorized</option>
            {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-1">Tags (comma-separated)</label>
          <input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg">Save Changes</button>
        </div>
      </div>
    </Modal>
  );
};