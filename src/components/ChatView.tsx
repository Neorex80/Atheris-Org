import React, { useRef, useEffect, useState, useMemo } from 'react';
import ChatMessage from './ChatMessage';
import { ChatMessage as ChatMessageType } from '../types';
import { ChevronDown, ArrowDown, Calendar } from 'lucide-react';
import { LoadingIndicator, LoadingSkeleton } from './chat/LoadingIndicator';

interface ChatViewProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  isStreaming?: boolean;
  streamingMessageId?: string | null;
  onRegenerate?: (messageId: string) => void;
  onCopyMessage?: (messageId: string) => void;
  theme?: 'dark' | 'light';
  showTimestamps?: boolean;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  isScrollAtBottom?: boolean;
  groupByDate?: boolean;
  chatStyle?: 'minimal' | 'compact';
}

// Format date for grouping messages
const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Return formatted date for other days
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  }).format(date);
};

// Component for date separator
const DateSeparator = ({ date, theme = 'dark' }: { date: string, theme?: 'dark' | 'light' }) => (
  <div className="flex items-center justify-center my-2">
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
      theme === 'light' 
        ? 'bg-gray-200 text-gray-700' 
        : 'bg-gray-800 text-gray-300'
    }`}>
      <Calendar size={10} />
      {date}
    </div>
  </div>
);

const ChatView: React.FC<ChatViewProps> = ({ 
  messages, 
  isLoading, 
  isStreaming = false, 
  streamingMessageId = null,
  onRegenerate,
  onCopyMessage,
  theme = 'dark',
  showTimestamps = true,
  onScroll,
  isScrollAtBottom = true,
  groupByDate = true,
  chatStyle = 'minimal'
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [highlightedMessage, setHighlightedMessage] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const [showAnimatedSkeleton, setShowAnimatedSkeleton] = useState(false);
  
  // Show skeleton loader after a short delay to prevent flicker for quick responses
  useEffect(() => {
    let timer: number;
    
    if (isLoading) {
      timer = window.setTimeout(() => {
        setShowAnimatedSkeleton(true);
      }, 300);
    } else {
      setShowAnimatedSkeleton(false);
    }
    
    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading]);
  
  // Handle scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      onScroll(e);
    }
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // Update auto-scroll based on user's scroll position
    setAutoScroll(isBottom);
    
    // Show/hide scroll to bottom button
    setShowScrollButton(!isBottom);
    
    // Update scrolling state for header/footer effect
    setIsUserScrolling(true);
    
    // Clear previous timeout
    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }
    
    // Set new timeout to detect when scrolling stops
    const timer = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 200);
    
    scrollTimerRef.current = timer;
  };
  
  // Cleanup scroll timer
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'auto' });
      setShowScrollButton(false);
      setAutoScroll(true);
    }
  };
  
  // Scroll to bottom when messages change or during streaming
  useEffect(() => {
    if (endOfMessagesRef.current && autoScroll) {
      // Use instant scroll during streaming for better performance
      endOfMessagesRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, isStreaming, autoScroll]);
  
  // Handle message highlighting (for search or jumping to specific messages)
  useEffect(() => {
    if (highlightedMessage) {
      const timer = setTimeout(() => {
        setHighlightedMessage(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedMessage]);
  
  // Get appropriate CSS class based on chat style
  const getMessageStyles = (isUser: boolean) => {
    switch (chatStyle) {
      case 'minimal':
        return isUser 
          ? theme === 'light'
            ? "my-3 max-w-full text-right" 
            : "my-3 max-w-full text-right"
          : theme === 'light'
            ? "my-4 max-w-full" 
            : "my-4 max-w-full";
      case 'compact':
        return isUser 
          ? theme === 'light'
            ? "my-2 max-w-full text-right" 
            : "my-2 max-w-full text-right"
          : theme === 'light'
            ? "my-2 max-w-full" 
            : "my-2 max-w-full";
      default:
        return "";
    }
  };
  
  // Group messages by date if enabled
  const groupedMessages = useMemo(() => {
    if (!groupByDate || !messages.length) return [];
    
    const groups: { date: string, messages: ChatMessageType[] }[] = [];
    let currentDate = '';
    
    messages.forEach(message => {
      // Use message timestamp or fallback to current date
      const messageDate = message.timestamp 
        ? formatDate(new Date(message.timestamp)) 
        : formatDate(new Date());
      
      if (messageDate !== currentDate) {
        groups.push({ date: messageDate, messages: [message] });
        currentDate = messageDate;
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  }, [messages, groupByDate]);
  
  // If no messages and not loading, show empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <div className="text-center p-4">
          <div className="mb-4 flex justify-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'
            }`}>
              <svg width="24" height="24" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2819 10.1819C21.2347 9.18482 19.6324 9.18482 18.5851 10.1819L10.1538 18.1395C9.15301 19.1366 9.15301 20.8634 10.1538 21.8605L18.5851 29.818C19.6324 30.8152 21.2347 30.8152 22.2819 29.818L30.7132 21.8605C31.714 20.8634 31.714 19.1366 30.7132 18.1395L22.2819 10.1819Z" fill={theme === 'light' ? "#9CA3AF" : "#4B5563"}/>
              </svg>
            </div>
          </div>
          <h3 className={`text-base font-medium mb-1 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>No messages yet</h3>
          <p className={`text-xs ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>Start a conversation with Atheris</p>
        </div>
      </div>
    );
  }
  
  // Render messages with date grouping if enabled
  const renderMessages = () => {
    if (groupByDate && groupedMessages.length) {
      return groupedMessages.map((group, index) => (
        <div key={`date-group-${index}`}>
          <DateSeparator date={group.date} theme={theme} />
          {group.messages.map(message => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isStreaming={isStreaming && streamingMessageId === message.id}
              timestamp={showTimestamps && message.timestamp ? new Date(message.timestamp) : undefined}
              onRegenerate={onRegenerate ? () => onRegenerate(message.id) : undefined}
              onCopy={onCopyMessage ? () => onCopyMessage(message.id) : undefined}
              theme={theme}
              className={`${highlightedMessage === message.id ? (theme === 'light' ? 'bg-blue-100' : 'bg-blue-900 bg-opacity-20') : ''} ${getMessageStyles(message.role === 'user')}`}
            />
          ))}
        </div>
      ));
    } else {
      return messages.map(message => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          isStreaming={isStreaming && streamingMessageId === message.id}
          timestamp={showTimestamps && message.timestamp ? new Date(message.timestamp) : undefined}
          onRegenerate={onRegenerate ? () => onRegenerate(message.id) : undefined}
          onCopy={onCopyMessage ? () => onCopyMessage(message.id) : undefined}
          theme={theme}
          className={`${highlightedMessage === message.id ? (theme === 'light' ? 'bg-blue-100' : 'bg-blue-900 bg-opacity-20') : ''} ${getMessageStyles(message.role === 'user')}`}
        />
      ));
    }
  };

  return (
    <div 
      ref={chatContainerRef}
      className="w-full mt-1 overflow-y-auto relative flex flex-col px-4"
      style={{ height: 'calc(100vh - 150px)' }}
      onScroll={handleScroll}
    >
      <div className="flex-1">
        {renderMessages()}
        
        {isLoading && (
          showAnimatedSkeleton ? (
            <>
              <LoadingSkeleton theme={theme} lines={3} />
              <LoadingSkeleton theme={theme} lines={1} />
            </>
          ) : (
            <LoadingIndicator theme={theme} />
          )
        )}
        
        {/* Unread messages indicator */}
        {!autoScroll && messages.length > 0 && !showScrollButton && (
          <div 
            className={`sticky bottom-20 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 cursor-pointer shadow-md ${
              theme === 'light'
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            onClick={scrollToBottom}
          >
            <ChevronDown size={12} />
            New messages
          </div>
        )}
        
        <div ref={endOfMessagesRef} className="h-20" />
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          className={`fixed bottom-24 right-4 p-2 rounded-full shadow-lg z-10 ${
            theme === 'light'
              ? 'bg-white text-gray-700 hover:bg-gray-100'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
};

export default ChatView;