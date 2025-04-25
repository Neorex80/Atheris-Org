import React from 'react';
import { ArrowLeft, User, Settings, LogOut, KeyRound, Bell, Shield, Mail, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProfilePageProps {
  onBack: () => void;
  onOpenSettings: () => void;
  theme?: 'dark' | 'light';
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onBack, 
  onOpenSettings,
  theme = 'dark'
}) => {
  const handleNotImplemented = () => {
    toast.error('This feature is not implemented yet');
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
        <h1 className={`text-xl font-medium ${theme === 'light' ? 'text-gray-900' : ''}`}>Profile</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
          }`}>
            <User size={32} className={theme === 'light' ? 'text-gray-600' : 'text-white'} />
          </div>
          <div>
            <h2 className={`text-lg font-medium ${theme === 'light' ? 'text-gray-900' : ''}`}>Guest User</h2>
            <p className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Free Plan</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              theme === 'light'
                ? 'bg-gray-100 hover:bg-gray-200'
                : 'bg-white/5 hover:bg-white/10'
            }`}
            onClick={handleNotImplemented}
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
              <span>Log in</span>
            </div>
            <span className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Save your history</span>
          </button>
          
          <button 
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              theme === 'light'
                ? 'bg-blue-50 hover:bg-blue-100'
                : 'bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => toast('Upgrade feature coming soon!')}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">+</div>
              <span>Upgrade to Atheris Pro</span>
            </div>
            <span className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>$20/month</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-1 mb-8">
        <h3 className={`text-xs uppercase font-medium mb-2 px-3 ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        }`}>Account</h3>
        
        <button 
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
          }`}
          onClick={onOpenSettings}
        >
          <div className="flex items-center gap-3">
            <Settings size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
            <span>Settings</span>
          </div>
          <ChevronIcon theme={theme} />
        </button>
        
        <button 
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
          }`}
          onClick={handleNotImplemented}
        >
          <div className="flex items-center gap-3">
            <KeyRound size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
            <span>Privacy & Data</span>
          </div>
          <ChevronIcon theme={theme} />
        </button>
        
        <button 
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
          }`}
          onClick={handleNotImplemented}
        >
          <div className="flex items-center gap-3">
            <Bell size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
            <span>Notifications</span>
          </div>
          <ChevronIcon theme={theme} />
        </button>
      </div>
      
      <div className="space-y-1">
        <h3 className={`text-xs uppercase font-medium mb-2 px-3 ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        }`}>Support</h3>
        
        <button 
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
          }`}
          onClick={handleNotImplemented}
        >
          <div className="flex items-center gap-3">
            <HelpCircle size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
            <span>Help & FAQ</span>
          </div>
          <ChevronIcon theme={theme} />
        </button>
        
        <button 
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
          }`}
          onClick={handleNotImplemented}
        >
          <div className="flex items-center gap-3">
            <Shield size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
            <span>Privacy Policy</span>
          </div>
          <ChevronIcon theme={theme} />
        </button>
        
        <button 
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
          }`}
          onClick={handleNotImplemented}
        >
          <div className="flex items-center gap-3">
            <Mail size={18} className={theme === 'light' ? 'text-gray-700' : 'text-white'} />
            <span>Contact Us</span>
          </div>
          <ChevronIcon theme={theme} />
        </button>
      </div>
      
      <div className={`mt-8 text-center text-xs ${
        theme === 'light' ? 'text-gray-500' : 'text-gray-500'
      }`}>
        <p>Version 1.0.0</p>
        <p className="mt-1">© 2024 Atheris AI. All rights reserved.</p>
      </div>
    </div>
  );
};

const ChevronIcon = ({ theme = 'dark' }: { theme?: 'dark' | 'light' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default ProfilePage;