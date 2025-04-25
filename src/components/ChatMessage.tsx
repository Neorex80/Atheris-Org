import React, { useRef, useState } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import MessageContent from './chat/MessageContent';
import MessageActions from './chat/MessageActions';
import ReasoningSection from './chat/ReasoningSection';
import { MessageLoadingIndicator } from './chat/LoadingIndicator';

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  timestamp?: Date;
  onRegenerate?: () => void;
  onCopy?: () => void;
  theme?: 'dark' | 'light';
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isStreaming = false, 
  timestamp, 
  onRegenerate, 
  onCopy,
  theme = 'dark',
  className = ''
}) => {
  const isUser = message.role === 'user';
  const messageRef = useRef<HTMLDivElement>(null);
  
  const copyMessageContent = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.();
  };

  return (
    <div 
      ref={messageRef}
      className={`py-2 ${className}`}
    >
      {isUser ? (
        <div className="max-w-3xl mx-auto px-1">
          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            <div className="flex-1 text-right">
              <div className="flex justify-between items-center mb-0.5 flex-row-reverse">
                <div className={`text-xs font-medium ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  You
                </div>
                {timestamp && (
                  <div className={`text-xs ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {formatTime(timestamp)}
                  </div>
                )}
              </div>
              <MessageContent 
                content={message.content} 
                isStreaming={false} 
                theme={theme} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-1">
          <div className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              theme === 'light' ? 'bg-emerald-600' : 'bg-[#10A37F]'
            }`}>
              <svg width="14" height="14" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2819 10.1819C21.2347 9.18482 19.6324 9.18482 18.5851 10.1819L10.1538 18.1395C9.15301 19.1366 9.15301 20.8634 10.1538 21.8605L18.5851 29.818C19.6324 30.8152 21.2347 30.8152 22.2819 29.818L30.7132 21.8605C31.714 20.8634 31.714 19.1366 30.7132 18.1395L22.2819 10.1819Z" fill="white"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <div className={`text-xs font-medium ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Atheris
                </div>
                {timestamp && (
                  <div className={`text-xs ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {formatTime(timestamp)}
                  </div>
                )}
              </div>
              
              {/* Show reasoning section above the message content */}
              <ReasoningSection 
                reasoning={message.reasoning}
                isStreaming={isStreaming} 
                theme={theme}
              />
              
              {/* Show loading indicator or content */}
              {isStreaming && !message.content.trim() ? (
                <MessageLoadingIndicator theme={theme} />
              ) : (
                <MessageContent 
                  content={message.content} 
                  isStreaming={isStreaming} 
                  theme={theme} 
                />
              )}
              
              {/* Action buttons */}
              <MessageActions 
                onRegenerate={onRegenerate} 
                onCopy={copyMessageContent}
                isStreaming={isStreaming}
                theme={theme} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;