import React, { useState } from 'react';
import {
  Layers,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  ArrowRight,
  Sliders,
  Search,
  Grid,
  Film,
  Share2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { comprehensiveTemplates } from '../../data/templatesData';
import { TemplateCustomizerModal } from './TemplateCustomizerModal';
import { ActiveTab, TemplateItem } from '../../types';

interface TemplatesScreenProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const TemplatesScreen: React.FC<TemplatesScreenProps> = ({ setActiveTab }) => {
  const { t, language } = useLanguage();
  const { setSelectedTemplate } = useProjects();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingTemplate, setCustomizingTemplate] = useState<TemplateItem | null>(null);

  const categories = [
    { id: 'all', name: t.tplAll, icon: Layers },
    { id: 'social', name: t.tplSocialPosts, icon: Share2 },
    { id: 'collage', name: t.tplCollages, icon: Grid },
    { id: 'intro', name: t.tplVideoIntros, icon: Film },
  ];

  const filteredTemplates = comprehensiveTemplates.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenCustomizer = (tpl: TemplateItem) => {
    setSelectedTemplate(tpl);
    setCustomizingTemplate(tpl);
  };

  const handleQuickOpenEditor = (tpl: TemplateItem) => {
    setSelectedTemplate(tpl);
    if (tpl.type === 'video') {
      setActiveTab('video');
    } else {
      setActiveTab('photo');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#07070d] text-white pb-24 overflow-y-auto px-3.5 sm:px-6 pt-3 space-y-4">
      {/* Header Banner */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>{t.tplLibraryTitle}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {language === 'bn' ? 'ক্রিয়েটিভ টেমপ্লেট লাইব্রেরি' : 'Trending Creator Templates'}
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
          {t.tplLibrarySubtitle}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'টেমপ্লেট খুঁজুন (যেমন: কোলাজ, রিলস, ইন্ট্রো)...' : 'Search templates (e.g. collage, intro, sale)...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-purple-900/40 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Count Badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredTemplates.length} customizable templates</span>
        <span className="text-[11px] text-purple-400 font-semibold">100% Free & Customizable</span>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTemplates.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl overflow-hidden bg-[#111020] border border-purple-900/30 hover:border-purple-500/60 transition-all duration-300 flex flex-col shadow-xl hover:shadow-2xl hover:shadow-purple-950/50"
          >
            {/* Visual Thumbnail Preview Container */}
            <div
              onClick={() => handleOpenCustomizer(item)}
              className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-extrabold uppercase text-cyan-300 border border-cyan-500/30">
                  {item.badge || item.type}
                </span>
                <span className="px-1.5 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-purple-300 border border-purple-500/30">
                  {item.aspectRatio}
                </span>
              </div>

              {/* Hover Overlay "Customize" prompt */}
              <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs">
                <Sliders className="w-4 h-4 text-purple-300" />
                <span>{t.customizeTemplate}</span>
              </div>
            </div>

            {/* Template Information & Action Buttons */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                  {language === 'bn' ? item.titleBn : item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {language === 'bn' ? item.descriptionBn : item.description}
                </p>
              </div>

              {/* Action Buttons: Customize (Primary) and Full Editor */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleOpenCustomizer(item)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t.customizeThis}</span>
                </button>

                <button
                  onClick={() => handleQuickOpenEditor(item)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title={t.openInEditor}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Template Customizer Studio Modal */}
      <TemplateCustomizerModal
        template={customizingTemplate}
        isOpen={!!customizingTemplate}
        onClose={() => setCustomizingTemplate(null)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};
