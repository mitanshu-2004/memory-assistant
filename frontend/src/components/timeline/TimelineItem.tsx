import React, { useState, useEffect, useRef } from 'react';
import { Memory } from '../../types/memory';
import { format } from 'date-fns';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Globe, 
  Image as ImageIcon, 
  Type, 
  Star, 
  Folder,
  Eye,
  Edit,
  Trash2,
  BrainCircuit
} from 'lucide-react';

interface TimelineItemProps {
  memory: Memory;
  showFullDate?: boolean;
  onDelete?: (memoryId: string) => void;
  onSummarize?: (memoryId: string) => void;
  onToggleFavorite?: (memory: Memory) => void;
  onEdit?: (memory: Memory) => void;
  onPreview?: (memory: Memory) => void;
}

const iconMap: { [key: string]: React.ReactNode } = {
  text: <Type size={14} className="text-gray-500" />,
  file: <FileText size={14} className="text-gray-500" />,
  url: <Globe size={14} className="text-gray-500" />,
  image: <ImageIcon size={14} className="text-gray-500" />,
};

export const TimelineItem: React.FC<TimelineItemProps> = ({ 
  memory, 
  onDelete, 
  onSummarize, 
  onToggleFavorite, 
  onEdit, 
  onPreview 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const date = new Date(memory.created_at);

  // Check if content is overflowing
  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setIsContentOverflowing(isOverflowing);
    }
  }, [memory.content]);

  return (
    <div className="card card-hover p-5 group relative">
      {/* Enhanced time and date display */}
      <div className="absolute -left-40 top-6 flex items-center">
        <div className="flex flex-col items-end mr-3">
          <div className="flex items-center bg-gray-800/70 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-gray-700/50 shadow-lg">
            <div className="flex items-center">
              {React.cloneElement(iconMap[memory.source_type] as React.ReactElement, {
                size: 12,
                className: "text-green-400/80"
              })}
              <span className="ml-2 text-xs font-medium">
                <span className="text-green-400">{format(date, 'h:mm')}</span>
                <span className="text-gray-500">{format(date, ' a')}</span>
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">
            {format(date, 'MMMM d, yyyy')}
          </span>
        </div>

        {/* Enhanced timeline connector */}
        <div className="flex items-center">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 ring-4 ring-gray-900 shadow-lg"></div>
            {/* Glowing effect on hover */}
            <div className="absolute inset-0 rounded-full bg-green-400/20 transform scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </div>
          <div className="w-6 h-[2px] bg-gradient-to-r from-green-400/50 to-transparent"></div>
        </div>
      </div>

      <div className="flex items-start mb-4">
        <div className="flex items-center flex-1 gap-2">
          <h3 className="text-lg font-semibold text-white flex items-center line-clamp-2 group-hover:text-green-400 transition-colors">
            {memory.title}
          </h3>
          {memory.category && (
            <div className="flex items-center text-xs text-green-400 bg-gray-800 px-3 py-1 rounded-full border border-green-400/20">
              <Folder size={12} className="mr-1" />
              <span className="font-medium whitespace-nowrap">{memory.category.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <p 
          ref={contentRef}
          className={`text-gray-300 text-sm mb-4 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}
        >
          {memory.content}
        </p>
        {isContentOverflowing && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 mb-2"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show more <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-4">
        {/* Tags moved to footer */}
        <div className="flex items-center gap-2">
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-lg border border-gray-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 ml-4">
          {onPreview && (
            <button
              onClick={() => onPreview(memory)}
              className="p-2 text-gray-500 hover:text-green-400 hover:bg-gray-900 rounded-lg transition-all duration-200"
              title="Preview"
            >
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(memory)}
              className="p-2 text-gray-500 hover:text-white hover:bg-gray-900 rounded-lg transition-all duration-200"
              title="Edit"
            >
              <Edit size={14} />
            </button>
          )}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(memory)}
              className={`p-2 hover:bg-gray-900 rounded-lg transition-all duration-200 ${
                memory.is_favorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
              }`}
              title="Toggle favorite"
            >
              <Star size={14} className={memory.is_favorite ? 'fill-current' : ''} />
            </button>
          )}
          {onSummarize && (
            <button
              onClick={() => onSummarize(memory.id)}
              className="p-2 text-gray-500 hover:text-blue-400 hover:bg-gray-900 rounded-lg transition-all duration-200"
              title="Generate AI Summary"
            >
              <BrainCircuit size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-900 rounded-lg transition-all duration-200"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && memory.summary && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-2">AI Summary</h4>
          <p className="text-sm text-gray-300">{memory.summary}</p>
        </div>
      )}
    </div>
  );
};