import React from 'react';

interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  theme?: 'dark' | 'light';
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onClick,
  icon,
  label,
  theme = 'dark'
}) => {
  return (
    <button 
      className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
        theme === 'light' 
          ? isActive ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-100' 
          : isActive ? 'border-blue-500 bg-blue-900 bg-opacity-20 text-blue-400' : 'border-white/10 hover:bg-white/10'
        }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default ToggleButton;