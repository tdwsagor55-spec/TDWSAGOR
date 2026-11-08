import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  FolderKanban,
  Image,
  Video,
  Download,
  Trash2,
  Settings,
  Globe,
  HelpCircle,
  Smartphone,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code2,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { ActiveTab, SavedProject } from '../../types';

interface UserDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenApkGuide: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  setActiveTab,
  onOpenApkGuide,
}) => {
  const { user, isAuthenticated, signOut, setShowAuthModal, setAuthModalMode } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { projects, savedPhotos, savedVideos, deleteProject } = useProjects();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'photos' | 'videos' | 'history' | 'settings'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const displayedList =
    activeSubTab === 'photos'
      ? savedPhotos
      : activeSubTab === 'videos'
      ? savedVideos
      : projects;

  return (
    <div className="flex flex-col h-full bg-[#07070d] text-white pb-24 overflow-y-auto px-3.5 sm:px-6 pt-3 space-y-4">
      {/* User Profile Card */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#151326] via-[#100f1e] to-[#0b0a14] border border-purple-800/40 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt="Profile"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/50 shadow-lg shadow-purple-600/30"
              />
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 ring-2 ring-black">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {user ? user.name : 'Magic Creator'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.proMember}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {user ? user.email : 'guest@magiceditor.ai'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApkGuide}
              className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK Guide</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                title={t.signOut}
              >
                <LogOut className="w-4 h-4 text-red-400" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('signin');
                  setShowAuthModal(true);
                }}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                {t.signIn}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-purple-900/30 text-center">
          <div className="p-2 rounded-xl bg-purple-950/20">
            <div className="text-base sm:text-lg font-black text-purple-300">
              {user ? user.projectsCount : projects.length}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              {t.projectsSaved}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-indigo-950/20">
            <div className="text-base sm:text-lg font-black text-indigo-300">
              {savedPhotos.length}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              {t.photosCount}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-cyan-950/20">
            <div className="text-base sm:text-lg font-black text-cyan-300">
              {savedVideos.length}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              {t.videosCount}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60">
            <div className="text-base sm:text-lg font-black text-emerald-400">
              {user ? user.storageUsedMB : 18.2} MB
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              {t.storageUsed}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs: All Projects, Saved Photos, Saved Videos, Settings */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: language === 'bn' ? 'সব প্রজেক্ট' : 'All Projects', icon: FolderKanban },
          { id: 'photos', label: language === 'bn' ? 'সংরক্ষিত ছবি' : 'Saved Photos', icon: Image },
          { id: 'videos', label: language === 'bn' ? 'সংরক্ষিত ভিডিও' : 'Saved Videos', icon: Video },
          { id: 'settings', label: language === 'bn' ? 'সেটিংস ও ভাষা' : 'Settings & Language', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Projects List Gallery */}
      {activeSubTab !== 'settings' && (
        <div className="space-y-3">
          {displayedList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <FolderKanban className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">{t.noProjectsYet}</p>
              <button
                onClick={() => setActiveTab('photo')}
                className="py-1.5 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Create Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayedList.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden bg-[#121122] border border-purple-900/30 hover:border-purple-600/60 transition-all flex flex-col shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold uppercase text-purple-300">
                        {item.type}
                      </span>
                    </div>

                    {/* Quick download & delete overlays */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={item.thumbnailUrl}
                        download={`Magic_${item.type}_${item.id}`}
                        className="p-1 rounded-md bg-black/70 hover:bg-black text-cyan-400"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => deleteProject(item.id)}
                        className="p-1 rounded-md bg-black/70 hover:bg-red-600 text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>{item.createdAt}</span>
                      <span>{item.sizeMB} MB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings & Language Tab */}
      {activeSubTab === 'settings' && (
        <div className="space-y-4">
          {/* Language Selection */}
          <div className="p-4 rounded-2xl bg-[#111020] border border-purple-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t.language}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  language === 'en'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <span>English (US)</span>
                {language === 'en' && <Check className="w-4 h-4 text-purple-400" />}
              </button>

              <button
                onClick={() => setLanguage('bn')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  language === 'bn'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <span>বাংলা (Bengali)</span>
                {language === 'bn' && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Android APK Build Quick Launcher */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {t.apkInstructions}
                </h3>
              </div>
              <button
                onClick={onOpenApkGuide}
                className="py-1 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold"
              >
                View Guide
              </button>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'bn'
                ? 'ক্যাপাসিটর (Capacitor) এবং অ্যান্ড্রয়েড স্টুডিও দিয়ে সহজে নিজস্ব .apk ফাইল তৈরি করুন।'
                : 'Turn this app into a native Android APK using Capacitor and Android Studio.'}
            </p>
          </div>

          {/* Help & Support FAQ */}
          <div className="p-4 rounded-2xl bg-[#111020] border border-purple-900/40 space-y-2.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t.helpSupport}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="font-bold text-white mb-0.5">
                  Q: How to export photos in HD?
                </div>
                <div className="text-slate-400 text-[11px]">
                  Tap the "Save in HD" button in the Photo Editor to export uncompressed PNG directly to your gallery.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="font-bold text-white mb-0.5">
                  Q: Can I edit offline?
                </div>
                <div className="text-slate-400 text-[11px]">
                  Yes! All canvas filters, adjustments, trimming, speed, and stickers work directly in your mobile browser without an internet connection.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
