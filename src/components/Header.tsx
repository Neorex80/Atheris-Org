import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, SquarePen, MoreHorizontal, User, MenuIcon } from 'lucide-react';

interface HeaderProps {
  onProfileClick: () => void;
  onHomeClick: () => void;
  activePage: 'chat' | 'profile' | 'settings';
  theme?: 'dark' | 'light';
  selectedModel: string;
  onModelChange: (model: string) => void;
  availableModels: Array<{id: string, name: string}>;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onProfileClick, 
  onHomeClick,
  activePage,
  theme = 'dark',
  selectedModel,
  onModelChange,
  availableModels,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimer, setScrollTimer] = useState<number | null>(null);
  const [dropdownAnimation, setDropdownAnimation] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Get selected model name
  const getSelectedModelName = () => {
    const model = availableModels.find(m => m.id === selectedModel);
    return model ? model.name : selectedModel;
  };

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear previous timeout
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
      
      // Set new timeout to detect when scrolling stops
      const timer = window.setTimeout(() => {
        setIsScrolling(false);
      }, 200);
      
      setScrollTimer(timer);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
    };
  }, [scrollTimer]);

  // Close model menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (modelMenuOpen && modelMenuRef.current && !modelMenuRef.current.contains(target)) {
        closeModelMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelMenuOpen]);

  // Handle dropdown animation
  useEffect(() => {
    if (modelMenuOpen) {
      setDropdownAnimation(true);
    }
  }, [modelMenuOpen]);

  const openModelMenu = () => {
    setModelMenuOpen(true);
  };

  const closeModelMenu = () => {
    setDropdownAnimation(false);
    setTimeout(() => {
      setModelMenuOpen(false);
    }, 200); // Match this with CSS animation duration
  };

  // Used to adjust header position based on screen size and sidebar state
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const headerStyle = isSidebarOpen && !isMobile 
    ? { width: 'calc(100% - 288px)' } 
    : { width: '100%' };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 flex items-center justify-between py-2 px-3 z-20 theme-transition header-blur ${
        theme === 'light' 
          ? 'text-gray-800 header-gradient-light' 
          : 'text-white header-gradient-dark'
      } ${isScrolling ? 'header-transparent' : ''} transition-all duration-300`}
      style={{
        ...(isSidebarOpen && !isMobile ? { marginLeft: '288px' } : {}),
        ...headerStyle
      }}
    >
      <div className="flex items-center cursor-pointer">
        {/* Sidebar Button */}
        <button 
          className={`p-1.5 mr-1 rounded-full button-pop ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
          }`}
          onClick={onToggleSidebar}
        >
          <MenuIcon size={20} className={`${theme === 'light' ? 'text-gray-700' : 'text-white'} ${isSidebarOpen ? 'transform rotate-90' : ''} transition-transform duration-300`} />
        </button>

        <button className={`p-1.5 mr-1 rounded-full ${
          theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
        } button-pop`}>
          <SquarePen size={16} className={theme === 'light' ? 'text-gray-700' : 'text-white/80'} />
        </button>
        <div 
          className="model-menu-container relative"
          ref={modelMenuRef}
        >
          <div 
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
              modelMenuOpen 
                ? theme === 'light' ? 'bg-gray-100' : 'bg-white/10'
                : 'hover:bg-gray-100/50 dark:hover:bg-white/5'
            }`}
            onClick={(e) => {
              e.stopPropagation(); 
              modelMenuOpen ? closeModelMenu() : openModelMenu();
            }}
          >
            <svg width="24" height="24" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-glow">
              <rect width="42" height="42" rx="8" fill="#10A37F" />
              <path
                d="M22.2819 10.1819C21.2347 9.18482 19.6324 9.18482 18.5851 10.1819L10.1538 18.1395C9.15301 19.1366 9.15301 20.8634 10.1538 21.8605L18.5851 29.818C19.6324 30.8152 21.2347 30.8152 22.2819 29.818L30.7132 21.8605C31.714 20.8634 31.714 19.1366 30.7132 18.1395L22.2819 10.1819Z"
                fill="white"
              />
            </svg>
            <span className={`ml-1 font-semibold text-sm ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Atheris</span>
            <ChevronDown 
              className={`ml-0.5 ${theme === 'light' ? 'text-gray-600' : 'text-white'} transition-transform duration-200 ${modelMenuOpen ? 'transform rotate-180' : ''}`} 
              size={16} 
            />
          </div>
          
          {/* Models dropdown menu */}
          {modelMenuOpen && (
            <div 
              className={`absolute left-0 mt-2 w-72 rounded-md shadow-lg py-1 z-30 
                ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'}
                transition-opacity duration-200 ${dropdownAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                transform menu-animation
              `}
            >
              <div className={`px-4 py-2 border-b ${
                theme === 'light' ? 'border-gray-200 text-gray-700' : 'border-gray-700 text-gray-300'  
              }`}>
                <p className="text-xs font-medium uppercase">Current Model: {getSelectedModelName()}</p>
              </div>
              <div className="max-h-80 overflow-y-auto py-1 custom-scrollbar">
                {availableModels.map((model, index) => (
                  <button 
                    key={model.id}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center 
                      transition-colors duration-150
                      ${selectedModel === model.id
                        ? theme === 'light' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-blue-900 bg-opacity-30 text-blue-200'
                        : theme === 'light' 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-white hover:bg-gray-700'
                      }`}
                    onClick={() => {
                      onModelChange(model.id);
                      closeModelMenu();
                    }}
                    style={{
                      animation: `menuItemFadeIn 150ms ${index * 30}ms forwards`,
                      opacity: 0,
                      transform: 'translateY(8px)'
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className={`text-xs mt-0.5 ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      }`}>{model.id}</div>
                    </div>
                    {selectedModel === model.id && (
                      <div className={`h-2 w-2 rounded-full ${
                        theme === 'light' ? 'bg-blue-600' : 'bg-blue-400'
                      }`}></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Three dots button */}
        <div className="relative">
          <button 
            className={`p-1.5 rounded-full ${
              theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
            } button-pop`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={16} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
          </button>
          
          {menuOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-20 menu-animation ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}>
              <button 
                className={`w-full text-left px-4 py-2 text-sm ${
                  theme === 'light' 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-gray-700'
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  onProfileClick();
                }}
              >
                My Profile
              </button>
              <button 
                className={`w-full text-left px-4 py-2 text-sm ${
                  theme === 'light' 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-gray-700'
                }`}
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                Help & FAQ
              </button>
              <button 
                className={`w-full text-left px-4 py-2 text-sm ${
                  theme === 'light' 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-gray-700'
                }`}
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                Keyboard shortcuts
              </button>
            </div>
          )}
        </div>
        
        {/* User Icon */}
        <button 
          className={`flex items-center p-1.5 rounded-full button-pop ${
            activePage === 'profile' || activePage === 'settings' 
              ? theme === 'light' ? 'bg-gray-200' : 'bg-white/20'
              : theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
          }`}
          onClick={onProfileClick}
        >
          {/* Custom Neon Profile Icon (Hollow Circle) */}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            className={theme === 'light' ? 'text-gray-700' : 'text-white'}
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="1.5"
              fill="none"
              filter="url(#neon-glow)"
            />
            <defs>
              <filter id="neon-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </svg>
        </button>
      </div>

      <style jsx>{`
        .menu-animation {
          animation: menuFadeIn 0.2s ease-out forwards;
        }
        
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes menuItemFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${theme === 'light' ? 'rgba(156, 163, 175, 0.5)' : 'rgba(75, 85, 99, 0.5)'};
          border-radius: 20px;
        }
      `}</style>
    </header>
  );
};

export default Header;