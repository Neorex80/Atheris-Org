import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Globe, Brain, Mic, ArrowUp } from 'lucide-react';
import ToggleButton from './ui/ToggleButton';

interface SearchBarProps {
  onSendMessage: (message: string, useReasoning?: boolean) => void;
  isLoading: boolean;
  theme?: 'dark' | 'light';
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSendMessage, 
  isLoading,
  theme = 'dark'
}) => {
  const [inputValue, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [reasoningMode, setReasoningMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to calculate proper scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate line height (approx 24px)
      const lineHeight = 24;
      // Limit height to 4 lines max (96px)
      const maxHeight = lineHeight * 4;
      
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim(), reasoningMode);
      setValue('');
      // Reset reasoning mode after sending
      setReasoningMode(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Toggle reasoning mode
  const toggleReasoningMode = () => {
    setReasoningMode(!reasoningMode);
  };

  // Method to be called from outside components (SuggestionButtons)
  const setSuggestionText = (text: string) => {
    setValue(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Expose the method to be accessed via ref
  useEffect(() => {
    if (window) {
      window.setSuggestionText = setSuggestionText;
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className={`relative ${
        theme === 'light' 
          ? 'bg-white border-gray-300 shadow-md' 
          : 'bg-[#2B2B2B] border-white/10 shadow-lg'
        } border ${isFocused ? theme === 'light' ? 'border-gray-400' : 'border-gray-500' : ''} rounded-2xl px-6 pt-4 pb-12`}>
        {/* Input Field with custom scrollbar */}
        <div className="relative custom-scrollbar">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            disabled={isLoading}
            className={`w-full bg-transparent ${
              theme === 'light' 
                ? 'text-gray-800 placeholder-gray-500' 
                : 'text-white placeholder-white/50'
              } text-base outline-none resize-none overflow-y-auto pr-8 scrollbar-thin`}
            style={{ 
              maxHeight: '96px', // 4 lines max
              lineHeight: '24px',
              scrollbarWidth: 'thin',
              scrollbarColor: theme === 'light' ? 'rgba(156, 163, 175, 0.5) transparent' : 'rgba(59, 130, 246, 0.5) transparent',
            }}
          />
        </div>

        {/* Toolbar - bottom left */}
        <div className="absolute bottom-2 left-4 flex items-center gap-1">
          <button className={`p-1 mr-1 rounded-full ${
            theme === 'light' 
              ? 'border-gray-300 hover:bg-gray-100' 
              : 'border-white/10 hover:bg-white/10'
            }`}>
            <Paperclip size={18} className={theme === 'light' ? 'text-gray-600' : 'text-white'} />
          </button>
          
          <ToggleButton 
            isActive={false}
            onClick={() => {}}
            icon={<Globe size={16} className={theme === 'light' ? 'text-gray-600' : 'text-white'} />}
            label="Search"
            theme={theme}
          />
          
          <ToggleButton 
            isActive={reasoningMode}
            onClick={toggleReasoningMode}
            icon={
              <Brain size={16} className={
                reasoningMode 
                  ? theme === 'light' ? 'text-blue-600' : 'text-blue-400' 
                  : theme === 'light' ? 'text-gray-600' : 'text-white'
              } />
            }
            label="Reason"
            theme={theme}
          />
        </div>

        {/* Right-side icons - bottom right */}
        <div className="absolute bottom-2 right-4 flex items-center gap-2">
          <button className={`p-2 rounded-full border ${
            theme === 'light' 
              ? 'border-gray-300 hover:bg-gray-100' 
              : 'border-white/10 hover:bg-white/10'
            }`}>
            <Mic size={18} className={theme === 'light' ? 'text-gray-600' : 'text-white'} />
          </button>
          <button 
            onClick={handleSendMessage}
            className={`p-2 rounded-full ${
              inputValue.trim() && !isLoading
                ? theme === 'light'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-white text-black hover:bg-white/90 shadow-sm'
                : theme === 'light'
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!inputValue.trim() || isLoading}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
      
      {/* Add global styles for the custom scrollbar */}
      <style jsx global>{`
        /* For Webkit browsers like Chrome/Safari/Edge */
        .custom-scrollbar textarea::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar textarea::-webkit-scrollbar-thumb {
          background-color: ${theme === 'light' ? 'rgba(156, 163, 175, 0.5)' : 'rgba(59, 130, 246, 0.5)'};
          border-radius: 20px;
          border: none;
        }
        
        /* Scrollbar only visible on hover */
        .custom-scrollbar textarea::-webkit-scrollbar-thumb {
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .custom-scrollbar textarea:hover::-webkit-scrollbar-thumb {
          opacity: 1;
        }
        
        /* Firefox */
        .custom-scrollbar textarea {
          scrollbar-width: thin;
          scrollbar-color: ${theme === 'light' ? 'rgba(156, 163, 175, 0.5) transparent' : 'rgba(59, 130, 246, 0.5) transparent'};
        }
      `}</style>
    </div>
  );
};

export default SearchBar;