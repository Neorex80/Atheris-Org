import React from 'react';

interface LoadingIndicatorProps {
  theme?: 'dark' | 'light';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ theme = 'dark' }) => (
  <div className="py-2">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#10A37F]">
          <svg width="14" height="14" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.2819 10.1819C21.2347 9.18482 19.6324 9.18482 18.5851 10.1819L10.1538 18.1395C9.15301 19.1366 9.15301 20.8634 10.1538 21.8605L18.5851 29.818C19.6324 30.8152 21.2347 30.8152 22.2819 29.818L30.7132 21.8605C31.714 20.8634 31.714 19.1366 30.7132 18.1395L22.2819 10.1819Z" fill="white"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className={`text-xs font-medium mb-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Atheris</div>
          <div className="flex space-x-1 items-center">
            <div className="h-2 w-2 rounded-full bg-[#10A37F] animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-[#10A37F] animate-pulse delay-100"></div>
            <div className="h-2 w-2 rounded-full bg-[#10A37F] animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const LoadingSkeleton: React.FC<{ theme?: 'dark' | 'light', lines?: number }> = ({ theme = 'dark', lines = 3 }) => (
  <div className="py-2">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-700 animate-pulse"></div>
        <div className="flex-1">
          <div className={`h-4 w-20 mb-2 rounded ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'} animate-pulse`}></div>
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div 
                key={i} 
                className={`h-4 rounded ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'} animate-pulse`}
                style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const MessageLoadingIndicator: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => (
  <div className="animate-pulse flex space-x-4 mb-4">
    <div className="flex-1 space-y-3 py-1">
      <div className={`h-2 ${
        theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
      } rounded w-3/4`}></div>
      <div className={`h-2 ${
        theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
      } rounded`}></div>
      <div className={`h-2 ${
        theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
      } rounded w-5/6`}></div>
    </div>
  </div>
);