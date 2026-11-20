import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut } from 'lucide-react';
import { useTranslation } from '../store/useSettingsStore';

import Logo from './Logo';

const Sidebar = ({ links }: { links: { name: string; path: string; icon: React.ReactNode }[] }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen glass-card flex flex-col fixed left-0 top-0 border-r border-white/10 z-30 shadow-2xl">
      <div className="p-6 flex items-center justify-center gap-3 border-b border-white/10 bg-white/2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
        <Logo className="w-8 h-8" />
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent tracking-wider font-display">SCTN</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                end={index === 0}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 border ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600/20 to-accent/5 text-primary-400 border-primary-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)] font-bold scale-[1.01]'
                      : 'text-text-muted hover:bg-surface-hover/30 hover:text-text border-transparent'
                  }`
                }
              >
                <span className="mr-3 text-current">{link.icon}</span>
                <span className="text-sm tracking-wide">{t(link.name.toLowerCase().replace(/\s+/g, ''), link.name)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-white/10 bg-white/1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3.5 text-text-muted hover:text-danger hover:bg-danger/15 hover:border-danger/20 border border-transparent rounded-xl transition-all duration-300 cursor-pointer active:scale-98 font-semibold text-sm"
        >
          <LogOut size={18} className="mr-3" />
          <span>{t('logout', 'Logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
