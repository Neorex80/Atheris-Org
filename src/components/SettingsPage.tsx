import React from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Layout, Eye, RefreshCw, AlignLeft, Menu, Cpu, Sidebar } from 'lucide-react';
import { UserSettings } from '../App';
import { toast } from 'react-hot-toast';
import { availableModels } from '../App';

interface SettingsPageProps {
  onBack: () => void;
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  clearConversation: () => void;
  theme?: 'dark' | 'light';
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  settings,
  updateSetting,
  clearConversation,
  theme = 'dark'
}) => {
  const handleClearConversation = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      clearConversation();
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6">
      <div className="flex items-center mb-6">
        <button 
          className={`p-2 mr-2 rounded-full ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
          }`}
          onClick={onBack}
        >
          <ArrowLeft size={20} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
        </button>
        <h1 className={`text-xl font-medium ${theme === 'light' ? 'text-gray-900' : ''}`}>Settings</h1>
      </div>
      
      {/* Model Section */}
      <div className="mb-8">
        <h2 className={`text-lg font-medium mb-4 ${theme === 'light' ? 'text-gray-900' : ''}`}>AI Model</h2>
        
        <div className="space-y-2">
          <p className={`text-sm mb-3 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>Choose which model to use for generating responses</p>
          
          <div className="grid grid-cols-1 gap-2">
            {availableModels.map(model => (
              <button 
                key={model.id}
                className={`border rounded-lg p-3 flex justify-between items-center ${
                  settings.model === model.id 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#1A1A1A]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#1A1A1A]'
                }`}
                onClick={() => updateSetting('model', model.id)}
              >
                <div className="flex items-center gap-3">
                  <Cpu size={18} className={settings.model === model.id ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                  <div className="text-left">
                    <span className={`text-sm font-medium ${
                      settings.model === model.id 
                        ? theme === 'light' ? "text-blue-600" : "text-white" 
                        : theme === 'light' ? "text-gray-700" : "text-gray-300"
                    }`}>{model.name}</span>
                    <p className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>{model.id}</p>
                  </div>
                </div>
                {settings.model === model.id && (
                  <div className={`h-2 w-2 rounded-full ${
                    theme === 'light' ? 'bg-blue-600' : 'bg-blue-400'
                  }`}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Theme Section */}
      <div className="mb-8">
        <h2 className={`text-lg font-medium mb-4 ${theme === 'light' ? 'text-gray-900' : ''}`}>Appearance</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-sm font-medium mb-3 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              <button 
                className={`border rounded-lg p-4 flex flex-col items-center gap-2 ${
                  settings.theme === 'dark' 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#0F0F0F]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#0F0F0F]'
                }`}
                onClick={() => updateSetting('theme', 'dark')}
              >
                <Moon size={20} className={settings.theme === 'dark' ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                <span className={`text-sm ${
                  settings.theme === 'dark' 
                    ? theme === 'light' ? "text-blue-600" : "text-white" 
                    : theme === 'light' ? "text-gray-500" : "text-gray-400"
                }`}>Dark</span>
              </button>
              <button 
                className={`border rounded-lg p-4 flex flex-col items-center gap-2 ${
                  settings.theme === 'light' 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#1A1A1A]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#1A1A1A]'
                }`}
                onClick={() => updateSetting('theme', 'light')}
              >
                <Sun size={20} className={settings.theme === 'light' ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                <span className={`text-sm ${
                  settings.theme === 'light' 
                    ? theme === 'light' ? "text-blue-600" : "text-white" 
                    : theme === 'light' ? "text-gray-500" : "text-gray-400"
                }`}>Light</span>
              </button>
              <button 
                className={`border rounded-lg p-4 flex flex-col items-center gap-2 ${
                  settings.theme === 'system' 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#1A1A1A]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#1A1A1A]'
                }`}
                onClick={() => updateSetting('theme', 'system')}
              >
                <Monitor size={20} className={settings.theme === 'system' ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                <span className={`text-sm ${
                  settings.theme === 'system' 
                    ? theme === 'light' ? "text-blue-600" : "text-white" 
                    : theme === 'light' ? "text-gray-500" : "text-gray-400"
                }`}>System</span>
              </button>
            </div>
          </div>
          
          {/* Sidebar Style Section */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>Sidebar Style</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`border rounded-lg p-4 flex flex-col items-center gap-2 ${
                  !settings.useEnhancedSidebar 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#1A1A1A]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#1A1A1A]'
                }`}
                onClick={() => updateSetting('useEnhancedSidebar', false)}
              >
                <Sidebar size={20} className={!settings.useEnhancedSidebar ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                <span className={`text-sm ${
                  !settings.useEnhancedSidebar 
                    ? theme === 'light' ? "text-blue-600" : "text-white" 
                    : theme === 'light' ? "text-gray-500" : "text-gray-400"
                }`}>Standard</span>
              </button>
              <button 
                className={`border rounded-lg p-4 flex flex-col items-center gap-2 ${
                  settings.useEnhancedSidebar 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#1A1A1A]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#1A1A1A]'
                }`}
                onClick={() => updateSetting('useEnhancedSidebar', true)}
              >
                <Sidebar size={20} className={settings.useEnhancedSidebar ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                <span className={`text-sm ${
                  settings.useEnhancedSidebar 
                    ? theme === 'light' ? "text-blue-600" : "text-white" 
                    : theme === 'light' ? "text-gray-500" : "text-gray-400"
                }`}>Enhanced</span>
              </button>
            </div>
          </div>
          
          {/* Chat Style Section */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>Chat Style</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`border rounded-lg p-4 flex flex-col items-center gap-2 ${
                  settings.chatStyle === 'minimal' 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#1A1A1A]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#1A1A1A]'
                }`}
                onClick={() => updateSetting('chatStyle', 'minimal')}
              >
                <AlignLeft size={20} className={settings.chatStyle === 'minimal' ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                <span className={`text-sm ${
                  settings.chatStyle === 'minimal' 
                    ? theme === 'light' ? "text-blue-600" : "text-white" 
                    : theme === 'light' ? "text-gray-500" : "text-gray-400"
                }`}>Minimal</span>
              </button>
              <button 
                className={`border rounded-lg p-4 flex flex-col items-center gap-2 ${
                  settings.chatStyle === 'compact' 
                    ? theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-[#1A1A1A]'
                    : theme === 'light' ? 'border-gray-300 hover:border-gray-400 bg-white' : 'border-gray-700 hover:border-gray-500 bg-[#1A1A1A]'
                }`}
                onClick={() => updateSetting('chatStyle', 'compact')}
              >
                <Menu size={20} className={settings.chatStyle === 'compact' ? theme === 'light' ? "text-blue-600" : "text-white" : theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                <span className={`text-sm ${
                  settings.chatStyle === 'compact' 
                    ? theme === 'light' ? "text-blue-600" : "text-white" 
                    : theme === 'light' ? "text-gray-500" : "text-gray-400"
                }`}>Compact</span>
              </button>
            </div>
          </div>
          
          {/* Font Size */}
          <div>
            <div className="flex justify-between mb-3">
              <h3 className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>Font Size</h3>
              <span className={`text-sm capitalize ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>{settings.fontSize}</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            }`}>
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ 
                  width: settings.fontSize === 'small' ? '25%' : 
                         settings.fontSize === 'medium' ? '50%' : '75%' 
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <button 
                className={settings.fontSize === 'small' ? 'text-blue-500' : theme === 'light' ? 'text-gray-500' : 'text-gray-500'}
                onClick={() => updateSetting('fontSize', 'small')}
              >
                Small
              </button>
              <button 
                className={settings.fontSize === 'medium' ? 'text-blue-500' : theme === 'light' ? 'text-gray-500' : 'text-gray-500'}
                onClick={() => updateSetting('fontSize', 'medium')}
              >
                Medium
              </button>
              <button 
                className={settings.fontSize === 'large' ? 'text-blue-500' : theme === 'light' ? 'text-gray-500' : 'text-gray-500'}
                onClick={() => updateSetting('fontSize', 'large')}
              >
                Large
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Settings */}
      <div className="mb-8">
        <h2 className={`text-lg font-medium mb-4 ${theme === 'light' ? 'text-gray-900' : ''}`}>Advanced</h2>
        
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'bg-gray-100' : 'bg-white/5'
          }`}>
            <div className="flex items-center gap-3">
              <RefreshCw size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
              <span>Auto-refresh content</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.autoRefreshContent} 
                onChange={() => updateSetting('autoRefreshContent', !settings.autoRefreshContent)}
                className="sr-only peer" 
              />
              <div className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${
                theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'
              }`}></div>
            </label>
          </div>
          
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'bg-gray-100' : 'bg-white/5'
          }`}>
            <div className="flex items-center gap-3">
              <Eye size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
              <span>Show timestamps</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.showTimestamps} 
                onChange={() => updateSetting('showTimestamps', !settings.showTimestamps)}
                className="sr-only peer" 
              />
              <div className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${
                theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'
              }`}></div>
            </label>
          </div>
          
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'bg-gray-100' : 'bg-white/5'
          }`}>
            <div className="flex items-center gap-3">
              <Layout size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
              <span>Group messages by date</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.groupMessagesByDate} 
                onChange={() => updateSetting('groupMessagesByDate', !settings.groupMessagesByDate)}
                className="sr-only peer" 
              />
              <div className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${
                theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'
              }`}></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Clear Data Section */}
      <div>
        <h2 className={`text-lg font-medium mb-4 ${theme === 'light' ? 'text-gray-900' : ''}`}>Data</h2>
        
        <button 
          className={`w-full p-3 rounded-lg ${
            theme === 'light'
              ? 'bg-red-50 hover:bg-red-100 border border-red-300 text-red-600'
              : 'bg-red-900 bg-opacity-30 hover:bg-opacity-50 border border-red-800 text-red-400'
          }`}
          onClick={handleClearConversation}
        >
          Clear conversation history
        </button>
        
        <button 
          className={`w-full mt-4 p-3 rounded-lg ${
            theme === 'light'
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
          onClick={() => {
            localStorage.clear();
            toast.success('All user data cleared');
            // Reload the page to reset everything
            setTimeout(() => window.location.reload(), 1500);
          }}
        >
          Reset all settings to default
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;