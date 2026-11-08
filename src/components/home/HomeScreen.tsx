import React from 'react';
import {
  Image,
  Video,
  Sparkles,
  Scissors,
  Smile,
  Layers,
  Wand2,
  FolderKanban,
  Play,
  ArrowRight,
  TrendingUp,
  Download,
  Smartphone,
  Star,
  Camera,
  Paintbrush,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { ActiveTab } from '../../types';

interface HomeScreenProps {
  setActiveTab: (tab: ActiveTab) => void;
  openToolWithMode: (tab: ActiveTab, subTool?: string) => void;
  onOpenApkGuide: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setActiveTab,
  openToolWithMode,
  onOpenApkGuide,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { projects } = useProjects();

  const toolCards = [
    {
      id: 'photo',
      title: t.toolPhotoEditor,
      desc: t.toolPhotoEditorDesc,
      icon: Image,
      gradient: 'from-purple-600 to-indigo-600',
      shadow: 'shadow-purple-600/30',
      action: () => setActiveTab('photo'),
    },
    {
      id: 'video',
      title: t.toolVideoEditor,
      desc: t.toolVideoEditorDesc,
      icon: Video,
      gradient: 'from-blue-600 to-cyan-600',
      shadow: 'shadow-blue-600/30',
      action: () => setActiveTab('video'),
    },
    {
      id: 'ai-photo',
      title: t.toolAiPhoto,
      desc: t.toolAiPhotoDesc,
      icon: Sparkles,
      gradient: 'from-fuchsia-600 to-pink-600',
      shadow: 'shadow-pink-600/30',
      badge: 'GEMINI AI',
      action: () => openToolWithMode('ai', 'photo'),
    },
    {
      id: 'ai-video',
      title: t.toolAiVideo,
      desc: t.toolAiVideoDesc,
      icon: Wand2,
      gradient: 'from-indigo-600 to-purple-600',
      shadow: 'shadow-indigo-600/30',
      badge: 'OMNI MOTION',
      action: () => openToolWithMode('ai', 'video'),
    },
    {
      id: 'bg-remover',
      title: t.toolBgRemover,
      desc: t.toolBgRemoverDesc,
      icon: Scissors,
      gradient: 'from-cyan-600 to-teal-600',
      shadow: 'shadow-cyan-600/30',
      action: () => openToolWithMode('photo', 'bg'),
    },
    {
      id: 'face-editor',
      title: t.toolFaceEditor,
      desc: t.toolFaceEditorDesc,
      icon: Smile,
      gradient: 'from-violet-600 to-purple-700',
      shadow: 'shadow-violet-600/30',
      action: () => openToolWithMode('photo', 'face'),
    },
    {
      id: 'cartoon-maker',
      title: t.toolCartoonMaker,
      desc: t.toolCartoonMakerDesc,
      icon: Paintbrush,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-orange-600/30',
      action: () => openToolWithMode('photo', 'cartoon'),
    },
    {
      id: 'stickers',
      title: t.toolStickers,
      desc: t.toolStickersDesc,
      icon: Star,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-600/30',
      action: () => openToolWithMode('photo', 'stickers'),
    },
    {
      id: 'templates',
      title: t.toolTemplates,
      desc: t.toolTemplatesDesc,
      icon: Layers,
      gradient: 'from-emerald-600 to-cyan-600',
      shadow: 'shadow-emerald-600/30',
      action: () => setActiveTab('templates'),
    },
    {
      id: 'projects',
      title: t.toolMyProjects,
      desc: t.toolMyProjectsDesc,
      icon: FolderKanban,
      gradient: 'from-slate-700 to-slate-900',
      shadow: 'shadow-slate-800/40',
      action: () => setActiveTab('dashboard'),
    },
  ];

  return (
    <div className="min-h-full pb-24 px-3.5 sm:px-5 pt-3 space-y-6">
      {/* Top Welcome Strip */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-purple-400">
              {language === 'bn' ? 'স্বাগতম' : 'Welcome back'},
            </span>
            <span className="text-xs font-bold text-white">
              {user ? user.name.split(' ')[0] : 'Creator'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {language === 'bn' ? 'আজ কী তৈরি করবেন?' : 'What will you create today?'}
          </h2>
        </div>

        <button
          onClick={onOpenApkGuide}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-500/30 transition-all active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>APK Guide</span>
        </button>
      </div>

      {/* Hero Banner with Instant Launch */}
      <div className="relative rounded-3xl overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-purple-900/60 via-indigo-950/70 to-[#0d0c18] border border-purple-500/30 shadow-2xl shadow-purple-950/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 via-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-bold tracking-wider uppercase mb-2.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI Studio 3.8 Powered</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {t.heroTitle}
          </h1>
          <p className="text-xs text-slate-300 mt-1.5 mb-4 leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('photo')}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/40 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Image className="w-4 h-4 text-purple-200" />
              <span>{t.createPhoto}</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/40 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Video className="w-4 h-4 text-cyan-200" />
              <span>{t.createVideo}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 10 Required Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              {t.quickTools}
            </h3>
          </div>
          <span className="text-[11px] text-purple-400 font-medium">10 Tools</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.action}
                className="relative group flex flex-col p-3.5 rounded-2xl bg-[#12111f]/90 hover:bg-[#18162b] border border-purple-900/30 hover:border-purple-600/50 transition-all duration-200 text-left active:scale-[0.98] shadow-md hover:shadow-xl"
              >
                {tool.badge && (
                  <span className="absolute top-2.5 right-2.5 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {tool.badge}
                  </span>
                )}

                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.gradient} p-0.5 mb-2.5 shadow-md ${tool.shadow} flex items-center justify-center group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  {tool.title}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium leading-tight">
                  {tool.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trendy AI Art Styles Inspiration Carousel */}
      <div className="bg-[#0f0e1c]/80 border border-purple-900/30 rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {language === 'bn' ? 'ট্রেন্ডিং এআই ফিল্টার ও স্টাইল' : 'Trending AI Art Styles'}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('ai')}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div
            onClick={() => openToolWithMode('ai', 'photo')}
            className="relative rounded-xl overflow-hidden cursor-pointer group aspect-square border border-purple-500/20"
          >
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80"
              alt="Anime 3D"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
              <span className="text-[10px] font-bold text-white">Anime 3D</span>
            </div>
          </div>

          <div
            onClick={() => openToolWithMode('ai', 'photo')}
            className="relative rounded-xl overflow-hidden cursor-pointer group aspect-square border border-purple-500/20"
          >
            <img
              src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80"
              alt="Cyberpunk"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
              <span className="text-[10px] font-bold text-white">Cyberpunk</span>
            </div>
          </div>

          <div
            onClick={() => openToolWithMode('ai', 'video')}
            className="relative rounded-xl overflow-hidden cursor-pointer group aspect-square border border-purple-500/20"
          >
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80"
              alt="Cinemagraph"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
              <span className="text-[10px] font-bold text-white">Cinematic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Template Library Spotlight: Social, Collages, Video Intros */}
      <div className="bg-gradient-to-br from-[#121024] to-[#0c0b16] border border-purple-900/30 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'bn' ? 'টেমপ্লেট লাইব্রেরি: সোশ্যাল, কোলাজ ও ইন্ট্রো' : 'Templates: Social, Collages & Intros'}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('templates')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Social Post */}
          <div
            onClick={() => setActiveTab('templates')}
            className="relative rounded-xl overflow-hidden cursor-pointer group bg-slate-900 border border-purple-500/30 flex flex-col"
          >
            <div className="aspect-[4/3] w-full overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80"
                alt="Social Posts"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[8px] font-bold text-cyan-300">
                POSTS
              </span>
            </div>
            <div className="p-1.5 text-center">
              <span className="text-[10px] font-bold text-slate-200 block truncate">Social Media</span>
              <span className="text-[8px] text-purple-400 font-semibold">1:1 & 9:16</span>
            </div>
          </div>

          {/* Collages */}
          <div
            onClick={() => setActiveTab('templates')}
            className="relative rounded-xl overflow-hidden cursor-pointer group bg-slate-900 border border-emerald-500/30 flex flex-col"
          >
            <div className="aspect-[4/3] w-full overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80"
                alt="Collages"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[8px] font-bold text-emerald-300">
                COLLAGES
              </span>
            </div>
            <div className="p-1.5 text-center">
              <span className="text-[10px] font-bold text-slate-200 block truncate">2-4 Photo Grid</span>
              <span className="text-[8px] text-emerald-400 font-semibold">Multi-Photo</span>
            </div>
          </div>

          {/* Video Intros */}
          <div
            onClick={() => setActiveTab('templates')}
            className="relative rounded-xl overflow-hidden cursor-pointer group bg-slate-900 border border-blue-500/30 flex flex-col"
          >
            <div className="aspect-[4/3] w-full overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80"
                alt="Video Intros"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[8px] font-bold text-blue-300">
                INTROS
              </span>
            </div>
            <div className="p-1.5 text-center">
              <span className="text-[10px] font-bold text-slate-200 block truncate">Video Intros</span>
              <span className="text-[8px] text-cyan-400 font-semibold">16:9 & 9:16</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Creations */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            {t.recentProjects}
          </h3>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
          >
            {t.viewAll}
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            {t.noProjectsYet}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {projects.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'video') setActiveTab('video');
                  else setActiveTab('photo');
                }}
                className="group relative rounded-xl overflow-hidden bg-[#131221] border border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900 relative">
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
                </div>
                <div className="p-2">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {item.title}
                  </h4>
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
    </div>
  );
};
