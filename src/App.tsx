import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SuggestionButtons from './components/SuggestionButtons';
import Footer from './components/Footer';
import ChatView from './components/ChatView';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ChatSidebar from './components/sidebar/ChatSidebar';
import EnhancedSidebar from './components/sidebar/EnhancedSidebar';
import { ChatMessage } from './types';
import { streamChatCompletion } from './services/groqService';
import ChatProvider from './contexts/ChatContext';

// Define the chat style type
export type ChatStyle = 'minimal' | 'compact';

// Models available
export const availableModels = [
  { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
  { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B' },
  { id: 'mistral-saba-24b', name: 'Mistral Saba 24B' }
];

// Settings interface
export interface UserSettings {
  chatStyle: ChatStyle;
  theme: 'dark' | 'light' | 'system';
  showTimestamps: boolean;
  groupMessagesByDate: boolean;
  autoRefreshContent: boolean;
  fontSize: 'small' | 'medium' | 'large';
  model: string;
  useEnhancedSidebar: boolean;
}

// Default settings
const defaultSettings: UserSettings = {
  chatStyle: 'minimal',
  theme: 'dark',
  showTimestamps: true,
  groupMessagesByDate: true,
  autoRefreshContent: true,
  fontSize: 'medium',
  model: 'llama3-8b-8192',
  useEnhancedSidebar: false
};

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<'chat' | 'profile' | 'settings'>('chat');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>(defaultSettings.theme as 'dark' | 'light');
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const [appReady, setAppReady] = useState(false);
  
  // Initialize sidebar to be open on desktop and closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if window exists (for SSR safety)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // Open by default on desktop (md breakpoint)
    }
    return false;
  });
  
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        applyTheme(parsedSettings.theme);
      } catch (error) {
        console.error('Failed to parse settings:', error);
        // If parsing fails, use default settings
        setSettings(defaultSettings);
        applyTheme(defaultSettings.theme);
      }
    }
    
    // Add a slight delay to ensure smooth initial rendering
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Apply theme based on settings
  const applyTheme = (themeSetting: 'dark' | 'light' | 'system') => {
    let themeToApply: 'dark' | 'light' = 'dark';
    
    if (themeSetting === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = prefersDark ? 'dark' : 'light';
    } else {
      themeToApply = themeSetting as 'dark' | 'light';
    }
    
    if (themeToApply !== currentTheme) {
      setThemeTransitioning(true);
      setTimeout(() => {
        setCurrentTheme(themeToApply);
        setTimeout(() => setThemeTransitioning(false), 300);
      }, 50);
    } else {
      setCurrentTheme(themeToApply);
    }
    
    // Listen for system theme changes if set to system
    if (themeSetting === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setThemeTransitioning(true);
        setTimeout(() => {
          setCurrentTheme(e.matches ? 'dark' : 'light');
          setTimeout(() => setThemeTransitioning(false), 300);
        }, 50);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  };

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    applyTheme(settings.theme);
  }, [settings]);

  // Update a specific setting
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Show toast notification
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} updated`);
      return newSettings;
    });
  };

  // Clear conversation history
  const clearConversation = () => {
    setMessages([]);
    setChatStarted(false);
    toast.success('Conversation cleared');
  };

  const handleSendMessage = async (content: string, useReasoning: boolean = false) => {
    // Create a new user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now()
    };
    
    // Update messages state with user message
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setChatStarted(true);
    
    try {
      // Prepare messages for API in the format Groq expects
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({
        role: 'user',
        content
      });
      
      // Create a placeholder message for streaming
      const streamingMessageId = uuidv4();
      const assistantMessage: ChatMessage = {
        id: streamingMessageId,
        content: '',
        role: 'assistant',
        timestamp: Date.now(),
        reasoning: useReasoning ? '' : undefined
      };
      
      // Add empty assistant message that will be updated during streaming
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setStreamingMessageId(streamingMessageId);
      setIsStreaming(true);
      setIsLoading(false);
      
      // Start streaming response with the currently selected model
      await streamChatCompletion(
        messageHistory,
        // On each chunk, update the message content
        (chunk) => {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === streamingMessageId 
                ? { ...msg, content: msg.content + chunk } 
                : msg
            )
          );
        },
        // On complete, mark streaming as done
        () => {
          setIsStreaming(false);
          setStreamingMessageId(null);
        },
        // Pass the selected model
        settings.model
      );
    } catch (error) {
      console.error('Error during chat:', error);
      
      // Add an error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "I'm having trouble connecting. Please try again later.",
        role: 'assistant',
        timestamp: Date.now()
      };
      
      setMessages(prevMessages => {
        // If we have a streaming message, remove it and add the error
        if (streamingMessageId) {
          const filteredMessages = prevMessages.filter(msg => msg.id !== streamingMessageId);
          return [...filteredMessages, errorMessage];
        }
        return [...prevMessages, errorMessage];
      });
      
      setIsStreaming(false);
      setStreamingMessageId(null);
      
      // Show error toast
      toast.error("Connection error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateMessage = (messageId: string) => {
    // Find message that needs to be regenerated
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
      // Get the user message that preceded this assistant message
      const userMessageIndex = messageIndex - 1;
      
      if (userMessageIndex >= 0 && messages[userMessageIndex].role === 'user') {
        // Remove the current assistant message
        const updatedMessages = messages.slice(0, messageIndex);
        setMessages(updatedMessages);
        
        // Resend the user message to generate a new response
        // Check if the message had reasoning previously
        const hasReasoning = messages[messageIndex].reasoning !== undefined;
        handleSendMessage(messages[userMessageIndex].content, hasReasoning);
        
        toast.success('Regenerating response...');
      } else {
        toast.error('Cannot regenerate this message');
      }
    }
  };

  const handleCopyMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
      toast.success('Message copied to clipboard');
    }
  };

  const handleModelChange = (model: string) => {
    updateSetting('model', model);
    toast.success(`Model changed to ${availableModels.find(m => m.id === model)?.name || model}`);
  };

  const handleCreateNewChat = () => {
    setMessages([]);
    setChatStarted(false);
    setCurrentChatId(undefined);
    
    // Only close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    // In a real app, you would load the chat history based on the chatId
    // For now, we'll just set the current chat ID and close the sidebar on mobile
    setCurrentChatId(chatId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    setChatStarted(true);
    toast.success('Chat loaded');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'profile':
        return (
          <ProfilePage 
            onBack={() => setActivePage('chat')} 
            onOpenSettings={() => setActivePage('settings')}
            theme={currentTheme}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            onBack={() => setActivePage('profile')}
            settings={settings}
            updateSetting={updateSetting}
            clearConversation={clearConversation}
            theme={currentTheme}
          />
        );
      default:
        return (
          <>
            {!chatStarted ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                  What can I help with?
                </h1>
                
                <SearchBar 
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading || isStreaming}
                  theme={currentTheme}
                />
                <SuggestionButtons theme={currentTheme} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <ChatView 
                  messages={messages}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  streamingMessageId={streamingMessageId}
                  chatStyle={settings.chatStyle}
                  showTimestamps={settings.showTimestamps}
                  groupByDate={settings.groupMessagesByDate}
                  onRegenerate={handleRegenerateMessage}
                  onCopyMessage={handleCopyMessage}
                  theme={currentTheme}
                />
                <div className="sticky bottom-12 w-full px-4 z-10">
                  <SearchBar 
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading || isStreaming}
                    theme={currentTheme}
                  />
                </div>
              </div>
            )}
          </>
        );
    }
  };

  if (!appReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme === 'light' ? 'bg-gray-100' : 'bg-[#0F0F0F]'}`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <svg width="64" height="64" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="42" height="42" rx="8" fill="#10A37F" />
              <path
                d="M22.2819 10.1819C21.2347 9.18482 19.6324 9.18482 18.5851 10.1819L10.1538 18.1395C9.15301 19.1366 9.15301 20.8634 10.1538 21.8605L18.5851 29.818C19.6324 30.8152 21.2347 30.8152 22.2819 29.818L30.7132 21.8605C31.714 20.8634 31.714 19.1366 30.7132 18.1395L22.2819 10.1819Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="mt-4 text-lg font-medium text-gray-400">Loading Atheris...</div>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className={`min-h-screen flex flex-col theme-transition ${themeTransitioning ? 'opacity-95' : 'opacity-100'} ${currentTheme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-[#0F0F0F] text-white'}`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Choose between regular or enhanced sidebar based on settings */}
          <AnimatePresence>
            {sidebarOpen && (
              settings.useEnhancedSidebar ? (
                <EnhancedSidebar onNewChat={handleCreateNewChat} />
              ) : (
                <ChatSidebar 
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  onCreateNewChat={handleCreateNewChat}
                  theme={currentTheme}
                />
              )
            )}
          </AnimatePresence>
          
          {/* Main content - Center when sidebar is closed */}
          <div 
            className="flex-1 flex flex-col overflow-hidden transition-all duration-300 content-shift"
            style={{
              // Center content when sidebar is closed
              margin: sidebarOpen && window.innerWidth >= 768 
                ? '0 0 0 288px' // Sidebar open: Only left margin
                : '0 auto', // Sidebar closed: Center content
              width: sidebarOpen && window.innerWidth >= 768 
                ? 'calc(100% - 288px)' // Sidebar open: Adjust width
                : !sidebarOpen && window.innerWidth >= 1024
                  ? '80%' // Large screen with closed sidebar: Limit width 
                  : '100%' // Mobile or sidebar open on mobile: Full width
            }}
          >
            <Header 
              onProfileClick={() => setActivePage('profile')}
              onHomeClick={() => setActivePage('chat')}
              activePage={activePage}
              theme={currentTheme}
              selectedModel={settings.model}
              onModelChange={handleModelChange}
              availableModels={availableModels}
              onToggleSidebar={toggleSidebar}
              isSidebarOpen={sidebarOpen}
            />
            
            <main className="flex-1 flex flex-col overflow-y-auto">
              {renderContent()}
            </main>
            
            <Footer theme={currentTheme} />
          </div>
        </div>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: currentTheme === 'light' ? '#fff' : '#222',
              color: currentTheme === 'light' ? '#333' : '#fff',
              fontSize: '14px',
              borderRadius: '8px',
              boxShadow: currentTheme === 'light' 
                ? '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)' 
                : '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10A37F',
                secondary: currentTheme === 'light' ? '#fff' : '#222',
              },
              style: {
                borderLeft: '4px solid #10A37F',
              }
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#E53E3E',
                secondary: currentTheme === 'light' ? '#fff' : '#222',
              },
              style: {
                borderLeft: '4px solid #E53E3E',
              }
            },
          }}
        />
      </div>
    </ChatProvider>
  );
}

export default App;