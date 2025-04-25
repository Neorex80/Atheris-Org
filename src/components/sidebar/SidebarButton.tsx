import React from 'react';
import { MenuIcon } from 'lucide-react';

interface SidebarButtonProps {
  isOpen: boolean;
  onClick: () => void;
  theme?: 'dark' | 'light';
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ 
  isOpen, 
  onClick, 
  theme = 'dark' 
}) => {
  return (
    <button
      className={`fixed md:hidden top-2 left-2 z-50 p-2 rounded-full transition-all ${
        isOpen 
          ? 'translate-x-64' 
          : 'translate-x-0'
      } ${
        theme === 'light'
          ? 'bg-white text-gray-800 shadow-md hover:bg-gray-100'
          : 'bg-gray-800 text-white shadow-md hover:bg-gray-700'
      }`}
      onClick={onClick}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <MenuIcon size={20} />
    </button>
  );
};

export default SidebarButton;