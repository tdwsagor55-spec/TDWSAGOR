import React from 'react';
import { Sparkles, Globe, Smartphone, Monitor, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAndroidFrame: boolean;
  setIsAndroidFrame: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAndroidFrame,
  setIsAndroidFrame,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, setShowAuthModal, setAuthModalMode } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0d0c15]/90 backdrop-blur-xl border-b border-purple-900/30 px-3 py-2.5 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/25">
            <div className="w-full h-full bg-[#0a0a12] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                MAGIC
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              {language === 'bn' ? 'ফটো ও ভিডিও স্টুডিও' : 'Photo & Video Editor'}
            </p>
          </div>
        </div>

        {/* Center/Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Frame Toggle (Android device mockup vs responsive fullscreen) */}
          <button
            onClick={() => setIsAndroidFrame(!isAndroidFrame)}
            className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors"
            title={isAndroidFrame ? t.fullScreen : t.androidFrame}
          >
            {isAndroidFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.fullScreen}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.androidFrame}</span>
              </>
            )}
          </button>

          {/* Language Toggle: EN / বাংলা */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/60 hover:to-indigo-900/60 text-purple-200 border border-purple-700/40 transition-all shadow-sm active:scale-95"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* User Profile / Sign in */}
          {isAuthenticated && user ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-full transition-all border ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/50 text-slate-200'
              }`}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-500/50"
              />
              <span className="text-xs font-medium max-w-[80px] truncate hidden sm:inline">
                {user.name.split(' ')[0]}
              </span>
              {user.isPro && (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('signin');
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
