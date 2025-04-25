import React from 'react';
import { Copy, FileText } from 'lucide-react';

interface MessageActionsProps {
  onRegenerate?: () => void;
  onCopy?: () => void;
  theme?: 'dark' | 'light';
  isStreaming?: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  onRegenerate,
  onCopy,
  theme = 'dark',
  isStreaming = false
}) => {
  if (isStreaming) return null;
  
  return (
    <div className="flex gap-2 mt-2 text-xs">
      {onRegenerate && (
        <button 
          onClick={onRegenerate}
          className={`flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors ${
            theme === 'light' 
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 10C2 10 4.00498 7.26822 5.63384 5.63824C7.26269 4.00827 9.5136 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.89691 21 4.43492 18.2543 3.35177 14.5M2 10V4M2 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Regenerate
        </button>
      )}
      <button 
        onClick={onCopy}
        className={`flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors ${
          theme === 'light' 
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <Copy size={12} />
        Copy
      </button>
      <button 
        className={`flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors ${
          theme === 'light' 
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <FileText size={12} />
        Save
      </button>
    </div>
  );
};

export default MessageActions;