import React from 'react';
import { MessageSquare, AlignLeft, Settings } from 'lucide-react';

export type ChatStyle = 'bubble' | 'minimal' | 'compact';

interface ChatStyleSelectorProps {
  currentStyle: ChatStyle;
  onChange: (style: ChatStyle) => void;
}

const ChatStyleSelector: React.FC<ChatStyleSelectorProps> = ({ 
  currentStyle, 
  onChange 
}) => {
  return (
    <div className="fixed bottom-20 right-4 z-10">
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-2 border-b border-gray-700">
          <h3 className="text-xs font-medium text-gray-400 flex items-center gap-1">
            <Settings size={12} />
            Chat Style
          </h3>
        </div>
        <div className="p-2 flex flex-col gap-1">
          <button
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${
              currentStyle === 'bubble' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => onChange('bubble')}
          >
            <MessageSquare size={16} />
            <span>Bubble</span>
          </button>
          <button
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${
              currentStyle === 'minimal' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => onChange('minimal')}
          >
            <AlignLeft size={16} />
            <span>Minimal</span>
          </button>
          <button
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${
              currentStyle === 'compact' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => onChange('compact')}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="15" y1="12" x2="3" y2="12" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
            <span>Compact</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatStyleSelector;