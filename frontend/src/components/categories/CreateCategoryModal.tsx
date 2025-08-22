import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import apiClient from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { FolderPlus, Sparkles } from 'lucide-react';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: () => void; 
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, onClose, onCategoryCreated }) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { showNotification } = useUIStore();

  const handleCreate = async () => {
    if (!name.trim()) {
      showNotification('Category name cannot be empty.', 'error');
      return;
    }
    
    setIsCreating(true);
    try {
      await apiClient.post('/categories/', { name });
      showNotification(`Category '${name}' created successfully.`, 'success');
      onCategoryCreated(); // Trigger refresh
      onClose();
      setName('');
    } catch (error) {
      console.error("Failed to create category:", error);
      showNotification('Failed to create category. It may already exist.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreate();
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
      setName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Category">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-400/20 to-green-500/20 border border-green-400/30">
            <FolderPlus className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">New Category</h3>
            <p className="text-sm text-gray-400">Organize your memories into a custom group</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <label htmlFor="category-name" className="block text-sm font-medium text-gray-300">
            Category Name
          </label>
          <div className="relative">
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isCreating}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl 
                         focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none
                         transition-all duration-200 text-gray-200 placeholder-gray-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g., Project Ideas, Travel Memories, Daily Thoughts..."
              autoFocus
            />
            {name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Character count */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">
              {name.length > 0 && `${name.length} characters`}
            </span>
            <span className={`transition-colors duration-200 ${
              name.length > 50 ? 'text-yellow-400' : 
              name.length > 30 ? 'text-green-400' : 'text-gray-500'
            }`}>
              {name.length > 0 && (name.length <= 50 ? '✓ Good length' : 'Consider shorter name')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            onClick={handleClose}
            disabled={isCreating}
            className="px-5 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 
                       hover:border-gray-500/50 rounded-xl text-gray-300 hover:text-gray-200 
                       transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 
                       hover:from-green-400 hover:to-emerald-400 rounded-xl font-medium text-white
                       transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/25
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                       hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            {isCreating ? (
              <>
                <div className="relative z-10 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="relative z-10">Creating...</span>
              </>
            ) : (
              <>
                <FolderPlus size={16} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Create Category</span>
              </>
            )}
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-6 p-4 rounded-xl bg-green-400/5 border border-green-400/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-400">Pro Tips</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Use descriptive names that reflect the content theme</li>
                <li>• Keep names concise but meaningful (under 30 characters)</li>
                <li>• Categories help you quickly find related memories</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};