import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Brain } from 'lucide-react';

interface ReasoningSectionProps {
  reasoning: string | undefined;
  isStreaming?: boolean;
  theme?: 'dark' | 'light';
  markdownComponents?: any;
}

const ReasoningSection: React.FC<ReasoningSectionProps> = ({
  reasoning,
  isStreaming = false,
  theme = 'dark',
  markdownComponents
}) => {
  const [showReasoning, setShowReasoning] = useState(false);
  
  // If no reasoning is provided, don't render anything
  if (reasoning === undefined) return null;
  
  const toggleReasoning = () => {
    setShowReasoning(!showReasoning);
  };
  
  const isReasoningEmpty = !reasoning || reasoning.trim() === '';
  
  return (
    <div className={`mt-3 mb-4 rounded-lg overflow-hidden border ${
      theme === 'light' 
        ? 'border-blue-100 shadow-sm' 
        : 'border-blue-900/50 bg-gradient-to-b from-blue-950/30 to-blue-950/10'
    } relative group/container transition-all duration-300`}>
      {/* Glow effect (dark mode only) */}
      {theme !== 'light' && (
        <div className="absolute inset-0 rounded-lg bg-blue-500/5 group-hover/container:bg-blue-500/10 transition-all duration-300 pointer-events-none" />
      )}

      {/* Header Section */}
      <div 
        className={`flex items-center justify-between px-3 py-2.5 ${
          theme === 'light' 
            ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
            : 'bg-gradient-to-r from-blue-900/30 to-blue-900/10'
        } cursor-pointer transition-colors`}
        onClick={toggleReasoning}
      >
        <div className="flex items-center gap-2">
          {/* Animated Brain Icon */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full ${
              theme === 'light' 
                ? 'bg-blue-200' 
                : 'bg-blue-500/20'
            } animate-ping`} />
            <Brain 
              size={16} 
              className={`relative ${
                theme === 'light' 
                  ? 'text-blue-600' 
                  : 'text-blue-400'
              } transition-transform ${showReasoning ? 'rotate-0' : '-rotate-45'}`} 
            />
          </div>
          <span className={`text-sm font-semibold tracking-tight ${
            theme === 'light' 
              ? 'text-blue-700' 
              : 'text-blue-300'
          }`}>
            Thought Process
          </span>
        </div>

        {/* Animated Chevron */}
        <div className={`transform transition-transform duration-300 ${
          showReasoning ? 'rotate-180' : ''
        }`}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            className={theme === 'light' ? 'text-blue-600' : 'text-blue-400'}
          >
            <path 
              fill="currentColor" 
              d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
            />
          </svg>
        </div>
      </div>

      {/* Loading State */}
      {isStreaming && isReasoningEmpty && (
        <div className={`px-3 py-3 ${
          theme === 'light' 
            ? 'bg-white' 
            : 'bg-gradient-to-b from-blue-950/20 to-blue-950/10'
        }`}>
          <div className="flex space-x-2 justify-start">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className={`h-2 w-2 rounded-full ${
                  theme === 'light' 
                    ? 'bg-blue-200' 
                    : 'bg-blue-700'
                } animate-bounce`} 
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content Section */}
      {showReasoning && !isReasoningEmpty && (
        <div className={`px-3 py-2.5 ${
          theme === 'light' 
            ? 'bg-white' 
            : 'bg-gradient-to-b from-blue-950/20 to-blue-950/10'
        }`}>
          <div className={`prose max-w-none ${
            theme === 'light' 
              ? 'prose-slate' 
              : 'prose-invert prose-blue'
          } text-sm leading-relaxed`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ...markdownComponents,
                // Add custom code block styling
                code: ({ node, inline, className, children, ...props }: any) => (
                  <code
                    className={`px-1.5 py-0.5 rounded-md ${
                      theme === 'light'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-blue-900/30 text-blue-300'
                    } ${className}`}
                    {...props}
                  >
                    {children}
                  </code>
                )
              }}
            >
              {reasoning}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReasoningSection;