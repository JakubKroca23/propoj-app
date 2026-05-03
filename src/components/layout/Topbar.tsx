import React, { useEffect, useRef, useState } from 'react';
import { Bell, Search, User, LogOut, Activity } from 'lucide-react';
import GlitchText from '@/components/ui/GlitchText';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onToggleMonitoring?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleMonitoring }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!avatarRef.current && !menuRef.current) return;
      if (e.target instanceof Node) {
        const insideAvatar = avatarRef.current?.contains(e.target as Node);
        const insideMenu = menuRef.current?.contains(e.target as Node);
        if (!insideAvatar && !insideMenu) setMenuOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-sm flex items-center justify-between px-4 z-50">
      {/* Left: logo */}
      <div className="flex items-center">
        <div className="text-sm leading-none">
          <GlitchText text="PROPOJ.APP" className="gradient-text text-glow block" />
        </div>
      </div>

      {/* Center spacer */}
      <div className="flex-1" />

      {/* User & Alerts */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMonitoring}
          title="System Monitoring"
          aria-label="Toggle system monitoring"
          className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/5 rounded-md group"
        >
          <Activity size={16} className="group-hover:animate-pulse" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        <button
          title="Notifications"
          aria-label="View notifications"
          className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/5 rounded-md"
        >
          <Bell size={16} />
        </button>
        <button
          title="Search"
          aria-label="Open search"
          className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/5 rounded-md"
        >
          <Search size={16} />
        </button>
        <div className="flex items-center pl-3 border-l border-white/10">
          <button
            ref={avatarRef}
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={menuOpen ? 'true' : 'false'}
            title="User menu"
            className="w-7 h-7 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyber-purple"
          >
            <User size={14} className="text-white/60" />
          </button>
          
        </div>
        <div
          ref={menuRef}
          role="menu"
          aria-label="User menu"
          className={`absolute w-44 bg-slate-900/80 backdrop-blur-sm border border-white/5 rounded-md shadow-lg py-1 z-50 transform origin-top-right transition-all duration-150 ${menuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
          style={{ top: '2.5rem', right: '0.5rem' }}
        >
          <button className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-white/5 flex items-center" role="menuitem">
            <span className="inline-flex items-center justify-center w-5 h-5 text-slate-400 mr-3"><User size={14} /></span>
            Profil
          </button>
          
          <div className="border-t border-white/5 my-1" />
          
          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-white/5 flex items-center" 
            role="menuitem"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 text-rose-400 mr-3"><LogOut size={14} /></span>
            Odhlásit se
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
