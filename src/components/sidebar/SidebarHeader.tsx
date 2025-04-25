import React from 'react';
import { Plus, X, FolderPlus, Settings } from 'lucide-react';

interface SidebarHeaderProps {
  onNewChat: () => void;
  onCreateFolder: () => void;
  onClose?: () => void;
  onSettings?: () => void;
  theme?: 'dark' | 'light';
  isCollapsed?: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  onNewChat,
  onCreateFolder,
  onClose,
  onSettings,
  theme = 'dark',
  isCollapsed = false
}) => {
  if (isCollapsed) {
    return (
      <div className="py-3 flex flex-col items-center">
        <button
          className={`p-2 rounded-md mb-2 ${
            theme === 'light' 
              ? 'bg-white text-gray-700 hover:bg-gray-100' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          onClick={onNewChat}
          title="New Chat"
        >
          <Plus size={16} />
        </button>
        <button
          className={`p-2 rounded-md ${
            theme === 'light' 
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          onClick={onSettings}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <h2 className="text-lg font-bold">Chats</h2>
      <div className="flex gap-1">
        <button
          className={`p-1.5 rounded-md ${
            theme === 'light' 
              ? 'hover:bg-gray-100' 
              : 'hover:bg-gray-700'
          }`}
          onClick={onNewChat}
          title="New Chat"
        >
          <Plus size={18} />
        </button>
        <button
          className={`p-1.5 rounded-md ${
            theme === 'light' 
              ? 'hover:bg-gray-100' 
              : 'hover:bg-gray-700'
          }`}
          onClick={onCreateFolder}
          title="New Folder"
        >
          <FolderPlus size={18} />
        </button>
        {onClose && (
          <button
            className={`p-1.5 rounded-md md:hidden ${
              theme === 'light' 
                ? 'hover:bg-gray-100' 
                : 'hover:bg-gray-700'
            }`}
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;