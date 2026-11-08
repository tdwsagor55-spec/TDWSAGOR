import React, { useState } from 'react';
import {
  X,
  Download,
  Sparkles,
  Smartphone,
  Video,
  Image as ImageIcon,
  Check,
  Zap,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PhotoExportPreset, VideoExportPreset } from '../../types';
import { photoExportPresets, videoExportPresets } from '../../data/exportPresets';

interface ExportPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'photo' | 'video';
  onSelectPhotoPreset: (preset: PhotoExportPreset) => void;
  onSelectVideoPreset: (preset: VideoExportPreset) => void;
  isExporting?: boolean;
}

export const ExportPresetsModal: React.FC<ExportPresetsModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSelectPhotoPreset,
  onSelectVideoPreset,
  isExporting = false,
}) => {
  const { language } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  if (!isOpen) return null;

  const platforms = [
    { id: 'all', name: language === 'bn' ? 'সবগুলো' : 'All Presets' },
    { id: 'Instagram', name: 'Instagram' },
    { id: 'YouTube', name: 'YouTube' },
    { id: 'Universal', name: 'Universal & 4K' },
  ];

  const filteredPhotoPresets = photoExportPresets.filter(
    (p) => selectedPlatform === 'all' || p.platform === selectedPlatform
  );

  const filteredVideoPresets = videoExportPresets.filter(
    (p) => selectedPlatform === 'all' || p.platform === selectedPlatform
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#0d0c18] border border-purple-800/40 rounded-3xl shadow-2xl shadow-purple-950/70 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/30 flex items-center justify-between bg-[#111022] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-[#0d0c18] rounded-[10px] flex items-center justify-center">
                {mode === 'photo' ? (
                  <ImageIcon className="w-5 h-5 text-purple-300" />
                ) : (
                  <Video className="w-5 h-5 text-cyan-300" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {language === 'bn' ? 'এক্সপোর্ট প্রিসেট মেনু' : 'Export Presets Menu'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase tracking-wider border border-purple-500/30">
                  {mode === 'photo' ? 'Photo Studio' : 'Video Cinema'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'ইনস্টাগ্রাম স্টোরি, ইউটিউব শর্টস ও ১০৮০p এর মতো প্রস্তুত ফরম্যাটে এক্সপোর্ট করুন'
                  : 'Pre-configured output settings for Instagram Story, YouTube Shorts, 1080p and 4K'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Filter Tabs */}
        <div className="px-4 py-2.5 bg-[#0f0e1c] border-b border-purple-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {platforms.map((plat) => (
            <button
              key={plat.id}
              onClick={() => setSelectedPlatform(plat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedPlatform === plat.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {plat.name}
            </button>
          ))}
        </div>

        {/* Presets List Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {mode === 'photo' ? (
            /* PHOTO PRESETS */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPhotoPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelectPhotoPreset(preset);
                    onClose();
                  }}
                  className="group relative rounded-2xl p-3.5 bg-[#131224] hover:bg-[#1a1832] border border-purple-900/30 hover:border-purple-500/60 transition-all cursor-pointer flex flex-col justify-between shadow-md hover:shadow-xl active:scale-[0.98]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {preset.badge}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {preset.width}x{preset.height}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {language === 'bn' ? preset.nameBn : preset.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {language === 'bn' ? preset.descriptionBn : preset.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="uppercase font-semibold">
                      {preset.format === 'image/png' ? 'PNG (Lossless)' : 'JPEG (Optimized)'}
                    </span>
                    <div className="flex items-center gap-1 text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Export</span>
                      <Download className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VIDEO PRESETS */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredVideoPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelectVideoPreset(preset);
                    onClose();
                  }}
                  className="group relative rounded-2xl p-3.5 bg-[#111322] hover:bg-[#16192c] border border-blue-900/30 hover:border-blue-500/60 transition-all cursor-pointer flex flex-col justify-between shadow-md hover:shadow-xl active:scale-[0.98]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {preset.badge}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {preset.width}x{preset.height}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {language === 'bn' ? preset.nameBn : preset.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {language === 'bn' ? preset.descriptionBn : preset.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {Math.round(preset.bitrate / 1000000)} Mbps • {preset.fps} FPS
                    </span>
                    <div className="flex items-center gap-1 text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Export Video</span>
                      <Download className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-purple-900/30 bg-[#0c0b17] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-purple-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {language === 'bn'
                ? '১-ক্লিকে সঠিক রেজোলিউশন ও অ্যাসপেক্ট রেশিও সেট হয়ে ডাউনলোড হবে'
                : '1-Click auto-configured resolution, aspect ratio & bitrate output'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
