import React from 'react';
import { Sparkles, HelpCircle, LightbulbIcon, FileText, Image, MoreHorizontal } from 'lucide-react';

// Suggestion data with button text and input text
const suggestionData = [
  {
    icon: <Sparkles size={16} className="text-blue-400" />,
    buttonText: "Surprise me",
    inputText: "Surprise me with something interesting"
  },
  {
    icon: <HelpCircle size={16} className="text-green-400" />,
    buttonText: "Get advice",
    inputText: "Help me with some advice about"
  },
  {
    icon: <LightbulbIcon size={16} className="text-yellow-400" />,
    buttonText: "Brainstorm",
    inputText: "Help me brainstorm ideas for"
  },
  {
    icon: <FileText size={16} className="text-orange-400" />,
    buttonText: "Summarize text",
    inputText: "Summarize the following text:"
  },
  {
    icon: <Image size={16} className="text-purple-400" />,
    buttonText: "Analyze images",
    inputText: "Analyze this image for me"
  },
  {
    icon: <MoreHorizontal size={16} className="text-gray-400" />,
    buttonText: "More",
    inputText: "I need help with"
  }
];

interface SuggestionButtonProps {
  icon: React.ReactNode;
  text: string;
  inputText: string;
  theme?: 'dark' | 'light';
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ 
  icon, 
  text, 
  inputText,
  theme = 'dark'
}) => {
  const handleClick = () => {
    // Call the global method exposed by SearchBar component
    if (window.setSuggestionText) {
      window.setSuggestionText(inputText);
    }
  };

  return (
    <button 
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full ${
        theme === 'light'
          ? 'bg-white shadow-sm hover:shadow-md text-gray-700 hover:bg-gray-50'
          : 'bg-[#1A1A1A] shadow-md hover:shadow-lg text-white/80 hover:bg-[#222222]'
      }`}
      onClick={handleClick}
    >
      {icon}
      <span className="text-sm">{text}</span>
    </button>
  );
};

const SuggestionButtons: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      {suggestionData.map((item, index) => (
        <SuggestionButton 
          key={index}
          icon={item.icon}
          text={item.buttonText}
          inputText={item.inputText}
          theme={theme}
        />
      ))}
    </div>
  );
};

// Add global type declaration for window
declare global {
  interface Window {
    setSuggestionText?: (text: string) => void;
  }
}

export default SuggestionButtons;