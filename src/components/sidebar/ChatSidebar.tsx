import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Folder, FolderPlus, ChevronDown, Trash2, 
  Settings, Star, MessageSquare, MessageSquarePlus,
  MoreVertical, Edit, Archive, Bookmark, Pin, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useChat, Conversation, ChatFolder } from '../../contexts/ChatContext';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewChat: () => void;
  theme: 'dark' | 'light';
}

const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: "-100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

const backdropVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onCreateNewChat,
  theme 
}) => {
  // Use the chat context
  const { 
    conversations, 
    folders,
    currentConversationId, 
    setCurrentConversationId,
    deleteConversation,
    starConversation,
    updateConversationTitle,
    moveConversationToFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    toggleFolderExpanded
  } = useChat();

  // Local state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  // Focus on new folder input when creating
  useEffect(() => {
    if (isCreatingFolder && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [isCreatingFolder]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !((event.target as Element).closest('.chat-dropdown'))) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdownId]);

  // Sort and group conversations
  const starredConversations = conversations.filter(c => c.starred && !c.folderId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  
  const recentConversations = conversations.filter(c => !c.starred && !c.folderId)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // Get conversations by folder
  const getConversationsInFolder = (folderId: string) => {
    return conversations.filter(c => c.folderId === folderId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  };

  // Filter conversations and folders based on search term
  const filteredContent = () => {
    const term = searchTerm.toLowerCase();
    
    if (!term) {
      return { 
        starredConversations, 
        recentConversations, 
        folders
      };
    }
    
    const filteredStarred = starredConversations.filter(
      convo => convo.title.toLowerCase().includes(term) || 
               convo.lastMessage?.toLowerCase().includes(term)
    );
    
    const filteredRecent = recentConversations.filter(
      convo => convo.title.toLowerCase().includes(term) || 
               convo.lastMessage?.toLowerCase().includes(term)
    );
    
    const filteredFolders = folders.map(folder => {
      // Get conversations in this folder
      const folderConversations = getConversationsInFolder(folder.id);
      
      // Filter those conversations
      const matchingConversations = folderConversations.filter(
        convo => convo.title.toLowerCase().includes(term) || 
                 convo.lastMessage?.toLowerCase().includes(term)
      );
      
      // Include folder if name matches or any conversation inside matches
      if (folder.name.toLowerCase().includes(term) || matchingConversations.length > 0) {
        return {
          ...folder,
          isExpanded: matchingConversations.length > 0 ? true : folder.isExpanded,
          matchingConversations
        };
      }
      return null;
    }).filter(Boolean) as (ChatFolder & { matchingConversations?: Conversation[] })[];
    
    return { 
      starredConversations: filteredStarred, 
      recentConversations: filteredRecent, 
      folders: filteredFolders 
    };
  };

  const { 
    starredConversations: filteredStarred, 
    recentConversations: filteredRecent, 
    folders: filteredFolders 
  } = filteredContent();

  // Create new folder
  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
  };

  const submitNewFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    } else {
      setIsCreatingFolder(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dayDiff === 1) {
      return 'Yesterday';
    } else if (dayDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Handle chat hover for preview
  const handleItemHover = (id: string) => {
    if (hoverTimer) clearTimeout(hoverTimer);
    
    const timer = setTimeout(() => {
      setHoveredItemId(id);
    }, 500); // Show preview after 500ms hover
    
    setHoverTimer(timer as unknown as NodeJS.Timeout);
  };

  const handleItemHoverEnd = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setHoveredItemId(null);
  };

  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setIsDragging(true);
    setDraggedItemId(id);
    
    // Set a ghost image
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('drag-ghost');
    ghostElement.innerHTML = "Moving conversation...";
    document.body.appendChild(ghostElement);
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    // Cleanup ghost after drag ends
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItemId(null);
    setDropTargetId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (targetId !== dropTargetId) {
      setDropTargetId(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    if (!draggedItemId) return;
    
    // Move conversation to the folder
    moveConversationToFolder(draggedItemId, folderId);
    handleDragEnd();
  };

  // Render conversation item
  const renderConversationItem = (conversation: Conversation) => (
    <motion.div 
      key={conversation.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative group py-2 px-3 rounded-lg mb-1 cursor-pointer flex items-start transition-all ${
        currentConversationId === conversation.id 
          ? theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/20'
          : theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
      }`}
      onClick={() => setCurrentConversationId(conversation.id)}
      draggable
      onDragStart={(e) => handleDragStart(e, conversation.id)}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => handleItemHover(conversation.id)}
      onMouseLeave={handleItemHoverEnd}
    >
      <div className="mr-2 mt-1">
        <MessageSquare size={18} className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-medium truncate text-sm">
            {conversation.title || 'New Conversation'}
          </h3>
          <span className={`text-xs ml-1 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {formatTimestamp(conversation.updatedAt)}
          </span>
        </div>
        <p className={`text-xs truncate mt-0.5 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {conversation.lastMessage || 'No messages yet'}
        </p>
      </div>
      
      {/* Indicators */}
      <div className="absolute right-1 top-1 flex gap-1">
        {conversation.starred && (
          <Star size={12} className="text-yellow-500" />
        )}
      </div>
      
      {/* Action buttons on hover */}
      <div className={`absolute right-2 top-2 hidden group-hover:flex gap-1 p-0.5 rounded ${
        theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-900/60 backdrop-blur-sm'
      }`}>
        <button 
          className={`p-1 rounded-full ${
            theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            starConversation(conversation.id, !conversation.starred);
          }}
          title={conversation.starred ? "Unstar" : "Star"}
        >
          <Star size={14} className={conversation.starred ? "text-yellow-500" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
        </button>
        <div className="relative chat-dropdown">
          <button 
            className={`p-1 rounded-full ${
              theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdownId(activeDropdownId === conversation.id ? null : conversation.id);
            }}
            title="More options"
          >
            <MoreVertical size={14} className={theme === 'light' ? "text-gray-500" : "text-gray-400"} />
          </button>
          
          {activeDropdownId === conversation.id && (
            <div className={`absolute right-0 mt-1 w-40 rounded-md shadow-lg py-1 z-20 ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
            }`}>
              <button 
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${
                  theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdownId(null);
                  const newTitle = prompt('Enter new conversation title', conversation.title);
                  if (newTitle && newTitle.trim() !== conversation.title) {
                    updateConversationTitle(conversation.id, newTitle.trim());
                  }
                }}
              >
                <Edit size={14} />
                <span>Rename</span>
              </button>
              <button 
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-red-500 ${
                  theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdownId(null);
                  if (confirm('Are you sure you want to delete this conversation?')) {
                    deleteConversation(conversation.id);
                  }
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Chat preview on hover */}
      {hoveredItemId === conversation.id && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`absolute left-full ml-2 mt-0 w-64 p-3 rounded-lg shadow-lg z-30 ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-gray-800 border border-gray-700'
          }`}
          style={{ top: '0' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
            <h3 className="font-medium text-sm">{conversation.title || 'New Conversation'}</h3>
          </div>
          <p className={`text-xs mb-2 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {conversation.lastMessage || 'No messages yet'}
          </p>
          <div className={`text-xs ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Last updated: {new Date(conversation.updatedAt).toLocaleString()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Render folder
  const renderFolder = (folder: ChatFolder & { matchingConversations?: Conversation[] }) => {
    const folderConversations = folder.matchingConversations || 
      getConversationsInFolder(folder.id);
      
    return (
      <motion.div 
        key={folder.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`mb-2 rounded-lg overflow-hidden ${
          isDragging && dropTargetId === folder.id
            ? theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/20'
            : 'bg-transparent'
        }`}
        onDragOver={(e) => handleDragOver(e, folder.id)}
        onDrop={(e) => handleDrop(e, folder.id)}
      >
        <div 
          className={`flex items-center justify-between py-2 px-3 cursor-pointer ${
            theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
          }`}
          onClick={() => toggleFolderExpanded(folder.id)}
        >
          <div className="flex items-center">
            <motion.div
              initial={false}
              animate={{ rotate: folder.isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
            </motion.div>
            <Folder size={16} className={`ml-1 mr-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
            <span className="font-medium text-sm">{folder.name}</span>
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              theme === 'light' ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-400'
            }`}>
              {folderConversations.length}
            </span>
          </div>
          <div className="relative chat-dropdown">
            <button 
              className={`p-1 rounded-full ${
                theme === 'light' ? 'hover:bg-gray-300' : 'hover:bg-gray-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdownId(activeDropdownId === folder.id ? null : folder.id);
              }}
            >
              <MoreVertical size={14} className={theme === 'light' ? "text-gray-500" : "text-gray-400"} />
            </button>
            
            {activeDropdownId === folder.id && (
              <div className={`absolute right-0 mt-1 w-40 rounded-md shadow-lg py-1 z-20 ${
                theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
              }`}>
                <button 
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${
                    theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdownId(null);
                    const newName = prompt('Enter new folder name', folder.name);
                    if (newName && newName.trim() !== folder.name) {
                      renameFolder(folder.id, newName.trim());
                    }
                  }}
                >
                  <Edit size={14} />
                  <span>Rename</span>
                </button>
                <button 
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-red-500 ${
                    theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdownId(null);
                    if (confirm('Are you sure you want to delete this folder and move all conversations to recent?')) {
                      deleteFolder(folder.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Folder contents */}
        <AnimatePresence>
          {folder.isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`pl-7 ${
                isDragging ? 'min-h-8' : ''
              }`}
            >
              {folderConversations.length > 0 ? (
                folderConversations.map(conversation => renderConversationItem(conversation))
              ) : (
                <div className={`text-xs py-2 px-3 italic ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  No conversations in this folder
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Different behavior for desktop and mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Backdrop for mobile only */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div 
            key="backdrop"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Fixed width sidebar for desktop, slide-in for mobile */}
      <motion.div 
        ref={sidebarRef}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`${isMobile ? 'fixed' : 'fixed md:sticky'} top-0 left-0 h-screen z-40 md:z-10`}
        style={{ 
          width: '288px', 
          height: '100vh',
          boxShadow: isOpen ? (theme === 'light' ? '0 0 15px rgba(0,0,0,0.1)' : '0 0 15px rgba(0,0,0,0.5)') : 'none'
        }}
      >
        <div 
          className={`h-full overflow-hidden flex flex-col w-full py-4 ${
            theme === 'light' 
              ? 'bg-white border-r border-gray-200' 
              : 'bg-[#1A1A1A] border-r border-gray-800'
          }`}
        >
          {/* Header */}
          <div className="px-4 flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold tracking-tight ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>
              Conversations
            </h2>
            <div className="flex gap-1">
              <button 
                className={`p-1.5 rounded-full transition-colors button-pop ${
                  theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
                }`}
                onClick={onCreateNewChat}
                title="New Chat"
              >
                <MessageSquarePlus size={18} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />
              </button>
              <button 
                className={`p-1.5 rounded-full transition-colors button-pop ${
                  theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
                }`}
                onClick={handleCreateFolder}
                title="New Folder"
              >
                <FolderPlus size={18} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />
              </button>
              <button 
                className={`p-1.5 rounded-full transition-colors md:hidden button-pop ${
                  theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
                }`}
                onClick={onClose}
                title="Close Sidebar"
              >
                <X size={18} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />
              </button>
            </div>
          </div>
          
          {/* Search input */}
          <div className="px-4 mb-4">
            <div className={`flex items-center px-3 py-1.5 rounded-md ${
              theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
            }`}>
              <Search size={16} className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations"
                className={`ml-2 bg-transparent border-none focus:outline-none text-sm w-full ${
                  theme === 'light' ? 'text-gray-800 placeholder-gray-500' : 'text-white placeholder-gray-400'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`p-0.5 rounded-full ${
                    theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'
                  }`}
                >
                  <X size={14} className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'} />
                </button>
              )}
            </div>
          </div>
          
          {/* New folder input */}
          <AnimatePresence>
            {isCreatingFolder && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 mb-4"
              >
                <div className={`flex items-center rounded-md ${
                  theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
                }`}>
                  <Folder size={16} className={`ml-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    ref={newFolderInputRef}
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className={`ml-2 py-1.5 bg-transparent border-none focus:outline-none text-sm w-full ${
                      theme === 'light' ? 'text-gray-800 placeholder-gray-500' : 'text-white placeholder-gray-400'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        submitNewFolder();
                      } else if (e.key === 'Escape') {
                        setIsCreatingFolder(false);
                        setNewFolderName('');
                      }
                    }}
                    onBlur={submitNewFolder}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
            {/* Starred chats */}
            {filteredStarred.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center px-2 mb-1">
                  <Star size={14} className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'} />
                  <h3 className={`ml-1 text-xs font-medium uppercase tracking-wider ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Starred
                  </h3>
                </div>
                {filteredStarred.map(conversation => renderConversationItem(conversation))}
              </div>
            )}
            
            {/* Folders */}
            {filteredFolders.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center px-2 mb-1">
                  <Folder size={14} className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'} />
                  <h3 className={`ml-1 text-xs font-medium uppercase tracking-wider ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Folders
                  </h3>
                </div>
                {filteredFolders.map(folder => renderFolder(folder))}
              </div>
            )}
            
            {/* Recent chats */}
            {filteredRecent.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center px-2 mb-1">
                  <Clock size={14} className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'} />
                  <h3 className={`ml-1 text-xs font-medium uppercase tracking-wider ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Recent
                  </h3>
                </div>
                {filteredRecent.map(conversation => renderConversationItem(conversation))}
              </div>
            )}
            
            {/* No results state */}
            {filteredStarred.length === 0 && filteredFolders.length === 0 && filteredRecent.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-40 px-4"
              >
                {searchTerm ? (
                  <>
                    <Search size={24} className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
                    <p className={`mt-2 text-sm text-center ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      No conversations found
                    </p>
                    <button 
                      className={`mt-2 px-3 py-1 text-xs rounded-md ${
                        theme === 'light' 
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                      onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <MessageSquare size={24} className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
                    <p className={`mt-2 text-sm text-center ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      No conversations yet
                    </p>
                    <button 
                      className={`mt-2 px-3 py-1 text-xs rounded-md ${
                        theme === 'light' 
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                          : 'bg-blue-900/30 hover:bg-blue-800/40 text-blue-300'
                      }`}
                      onClick={onCreateNewChat}
                    >
                      Start new chat
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>
          
          {/* Footer */}
          <div className={`mt-auto pt-2 px-3 flex justify-between items-center ${
            theme === 'light' ? 'border-t border-gray-200' : 'border-t border-gray-800'
          }`}>
            <button 
              className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
              }`}
              title="Settings"
            >
              <Settings size={16} className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
              <span className="text-sm">Settings</span>
            </button>
            
            <button 
              className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
              }`}
              title="Starred conversations"
            >
              <Star size={16} className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'} />
              <span className="text-sm">Starred</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChatSidebar;