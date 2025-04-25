import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface FooterProps {
  theme?: 'dark' | 'light';
}

const Footer: React.FC<FooterProps> = ({ theme = 'dark' }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimer, setScrollTimer] = useState<number | null>(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear previous timeout
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
      
      // Set new timeout to detect when scrolling stops
      const timer = window.setTimeout(() => {
        setIsScrolling(false);
      }, 200);
      
      setScrollTimer(timer);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
    };
  }, [scrollTimer]);

  return (
    <footer className={`fixed bottom-0 left-0 right-0 py-1 flex justify-center items-center text-[10px] footer-blur ${
      theme === 'light' 
        ? 'text-gray-500 footer-gradient-light' 
        : 'text-white/40 footer-gradient-dark'
      } ${isScrolling ? 'footer-transparent' : ''}`}>
      <div className="flex items-center justify-center">
        <p className="text-[10px]">
          By messaging Atheris, you agree to our{' '}
          <a href="#" className={`underline ${theme === 'light' ? 'hover:text-gray-800' : 'hover:text-white/80'} transition-colors`}>Terms</a>
          {' '}&{' '}
          <a href="#" className={`underline ${theme === 'light' ? 'hover:text-gray-800' : 'hover:text-white/80'} transition-colors`}>Privacy</a>
        </p>
      </div>
      <div className="fixed bottom-1 right-1.5">
        <button className={`p-1 rounded-full ${
          theme === 'light' 
            ? 'bg-gray-200 hover:bg-gray-300' 
            : 'bg-white/10 hover:bg-white/15'
        } transition-colors`}>
          <HelpCircle size={14} className={theme === 'light' ? 'text-gray-600' : 'text-white/70'} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;