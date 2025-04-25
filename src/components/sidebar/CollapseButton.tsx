import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
  theme?: 'dark' | 'light';
}

const CollapseButton: React.FC<CollapseButtonProps> = ({ 
  isCollapsed, 
  onClick, 
  theme = 'dark' 
}) => {
  return (
    <button
      className={`absolute -right-3 top-20 z-10 p-1 rounded-full transition-all ${
        theme === 'light'
          ? 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-100'
          : 'bg-gray-800 text-gray-300 border border-gray-700 shadow-md hover:bg-gray-700'
      }`}
      onClick={onClick}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {isCollapsed ? (
        <ChevronRight size={16} />
      ) : (
        <ChevronLeft size={16} />
      )}
    </button>
  );
};

export default CollapseButton;