import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';
import { 
  Bot, MessageSquare, Plus, Star, Menu, X, Loader, 
  Trash2, Search, Tag, Folder, Settings, Moon, Sun
} from 'lucide-react';
import Button from '../common/Button';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface SidebarProps {
  onNewChat: () => void;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  starred: boolean;
  tags?: string[];
  category?: string;
}

export default function EnhancedSidebar({ onNewChat }: SidebarProps) {
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    deleteConversation,
    starConversation,
    updateConversationTitle,
    isLoading
  } = useChat();
  
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Effect to auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Filter conversations based on search, stars and category
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchTerm || conv.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStarFilter = !showStarredOnly || conv.starred;
    const matchesCategory = !activeCategory || conv.category === activeCategory;
    return matchesSearch && matchesStarFilter && matchesCategory;
  });

  // Get unique categories from conversation objects (if they have category property)
  const categories = Array.from(new Set(
    conversations
      .map(conv => (conv as any).category)
      .filter(Boolean)
  ));
  
  // Sort and group
  const starred = filteredConversations.filter(c => c.starred).sort((a,b) => b.updatedAt - a.updatedAt);
  const recent = filteredConversations.filter(c => !c.starred).sort((a,b) => b.updatedAt - a.updatedAt);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime())/(1000*60*60*24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString();
  };

  const toggleStar = (id: string, isStarred: boolean) => {
    starConversation(id, !isStarred);
  };

  const onToggleStar = (id: string, isStarred: boolean) => {
    starConversation(id, !isStarred);
  };

  // Mock updateConversation function since it's referenced but not in the current context
  const updateConversation = (id: string, data: any) => {
    console.log('Updating conversation:', id, data);
    // This would be implemented in the ChatContext
  };

  return (
    <motion.aside
      initial={{ width: isMobile ? 72 : 300 }}
      animate={{ width: collapsed ? 72 : 300 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`${darkMode ? 'bg-gray-900' : 'bg-gray-800'} h-screen flex flex-col shadow-2xl rounded-r-2xl transition-colors duration-300`}
    >
      {/* Top Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-semibold text-white flex items-center"
          >
            <Bot className="mr-2 text-blue-400" />
            Chats
          </motion.h2>
        )}
        <div className="flex items-center space-x-2">
          {!collapsed && (
            <Button
              variant="ghost"
              className="p-1 hover:bg-gray-700 rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-300" />}
            </Button>
          )}
          <Button
            variant="ghost"
            className="p-1 hover:bg-gray-700 rounded-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          variant="primary"
          fullWidth={!collapsed}
          className={`flex items-center justify-center ${collapsed ? 'w-12 h-12 mx-auto rounded-full' : 'rounded-xl'} bg-blue-600 hover:bg-blue-700 transition-all duration-200`}
          onClick={onNewChat}
        >
          <Plus size={18} />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className="px-4 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      {!collapsed && (
        <div className="px-4 mb-4 flex items-center">
          <button 
            className={`flex items-center text-sm mr-3 px-2 py-1 rounded ${showStarredOnly ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setShowStarredOnly(!showStarredOnly)}
          >
            <Star size={14} className={showStarredOnly ? 'text-yellow-400' : ''} />
            <span className="ml-1">Starred</span>
          </button>
          
          {activeCategory && (
            <button 
              className="flex items-center text-sm px-2 py-1 rounded bg-blue-500/20 text-blue-300"
              onClick={() => setActiveCategory(null)}
            >
              <Tag size={14} />
              <span className="ml-1">{activeCategory}</span>
              <X size={12} className="ml-1" />
            </button>
          )}
        </div>
      )}

      {/* Categories (if not collapsed) */}
      {!collapsed && categories.length > 0 && (
        <div className="px-4 mb-4 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map(category => (
              category && (
                <button
                  key={category} 
                  className={`flex items-center text-xs px-2 py-1 rounded whitespace-nowrap ${
                    activeCategory === category 
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                >
                  <Folder size={12} className="mr-1" />
                  {category}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {/* Conversation Sections */}
      <div className="flex-1 overflow-y-auto space-y-4 px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-600">
        {starred.length > 0 && (
          <Section
            title="Starred"
            items={starred}
            collapsed={collapsed}
            currentId={currentConversationId}
            onSelect={setCurrentConversationId}
            onDelete={deleteConversation}
            onToggleStar={toggleStar}
            formatDate={formatDate}
            icon={<Star size={16} className="text-yellow-400" />}
            accentColor="yellow"
          />
        )}
        <Section
          title="Recent"
          items={recent}
          collapsed={collapsed}
          currentId={currentConversationId}
          onSelect={setCurrentConversationId}
          onDelete={deleteConversation}
          onToggleStar={toggleStar}
          formatDate={formatDate}
          icon={<MessageSquare size={16} className="text-blue-400" />}
          accentColor="blue"
        />
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg mx-4 mb-4 flex items-center justify-center shadow-lg`}
          >
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            {!collapsed && <span className="ml-3 text-sm text-gray-300">AI is thinking...</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings button */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center text-gray-400 hover:text-white transition-colors w-full py-2 px-3 rounded-lg hover:bg-gray-700">
            <Settings size={18} />
            <span className="ml-2 text-sm">Settings</span>
          </button>
        </div>
      )}
    </motion.aside>
  );
}

interface SectionProps {
  title: string;
  items: Conversation[];
  collapsed: boolean;
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string, isStarred: boolean) => void;
  formatDate: (ts: number) => string;
  icon: React.ReactNode;
  accentColor: 'blue' | 'yellow' | 'green' | 'purple';
}

function Section({ 
  title, 
  items, 
  collapsed, 
  currentId, 
  onSelect, 
  onDelete, 
  onToggleStar,
  formatDate, 
  icon,
  accentColor
}: SectionProps) {
  if (!items.length) return null;
  
  // Get accent color class
  const getAccentClass = () => {
    switch(accentColor) {
      case 'yellow': return 'border-yellow-500';
      case 'green': return 'border-green-500';
      case 'purple': return 'border-purple-500';
      default: return 'border-blue-500';
    }
  };
  
  return (
    <div>
      {!collapsed && (
        <div className={`flex items-center text-gray-400 uppercase text-xs mb-2 border-l-2 pl-2 ${getAccentClass()}`}>
          {icon}
          <span className="ml-1">{title}</span>
          <span className="ml-2 bg-gray-700 text-xs px-1.5 rounded-full">{items.length}</span>
        </div>
      )}
      <ul className="space-y-2">
        <AnimatePresence>
          {items.map(conv => (
            <motion.li
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileHover={{ x: collapsed ? 0 : 4 }}
              className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                currentId === conv.id 
                  ? `bg-gray-700 ${!collapsed ? `border-l-4 ${getAccentClass()}` : ''}`
                  : 'hover:bg-gray-700/70'
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex items-center overflow-hidden">
                <Bot size={18} className={accentColor === 'blue' ? 'text-blue-400' : accentColor === 'yellow' ? 'text-yellow-400' : 'text-gray-400'} />
                {!collapsed && (
                  <div className="ml-3 truncate flex-1">
                    <p className="truncate text-sm font-medium text-white">{conv.title}</p>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500">{formatDate(conv.updatedAt)}</p>
                      
                      {/* Tags */}
                      {conv.tags && conv.tags.length > 0 && (
                        <div className="flex ml-2 space-x-1">
                          {conv.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs px-1.5 rounded-full bg-gray-600 text-gray-300">
                              {tag}
                            </span>
                          ))}
                          {conv.tags.length > 2 && (
                            <span className="text-xs px-1.5 rounded-full bg-gray-600 text-gray-300">
                              +{conv.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {!collapsed && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); onToggleStar(conv.id, conv.starred); }}
                    className="p-1 rounded hover:bg-gray-600"
                  >
                    <Star size={16} className={conv.starred ? "text-yellow-400" : "text-gray-500"} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                    className="p-1 rounded hover:bg-gray-600 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}