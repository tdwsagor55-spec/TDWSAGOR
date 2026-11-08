import React from 'react';
import { Home, Image, Video, Sparkles, FolderKanban } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const navItems: { tab: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'home', label: t.navHome, icon: Home },
    { tab: 'photo', label: t.navPhoto, icon: Image },
    { tab: 'video', label: t.navVideo, icon: Video },
    { tab: 'ai', label: t.navAi, icon: Sparkles },
    { tab: 'dashboard', label: t.navProjects, icon: FolderKanban },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0c15]/95 backdrop-blur-2xl border-t border-purple-900/30 px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Highlight background pill */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/25 to-indigo-600/10 rounded-xl border border-purple-500/30 -z-10" />
              )}
              
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : ''
                  }`}
                />
                {item.tab === 'ai' && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-tight mt-1 truncate max-w-[65px] ${
                isActive ? 'text-purple-200 font-bold' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
