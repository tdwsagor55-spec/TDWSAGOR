import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 12;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#07070c] text-white p-6 cursor-pointer select-none overflow-hidden"
    >
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="pt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-300/80 bg-purple-950/40 px-3.5 py-1.5 rounded-full border border-purple-800/40">
        <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
        <span>Android AI Studio Edition</span>
      </div>

      {/* Center Branding & Logo */}
      <div className="flex flex-col items-center text-center max-w-sm px-4">
        {/* Animated App Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] shadow-2xl shadow-purple-600/40">
            <div className="w-full h-full bg-[#0d0c17] rounded-[22px] flex items-center justify-center">
              <Wand2 className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 via-indigo-300 to-cyan-300 stroke-purple-400 animate-bounce" />
            </div>
          </div>
          {/* Sparkles badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-200 via-indigo-100 to-cyan-200 bg-clip-text text-transparent">
          {t.appName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium leading-relaxed">
          {t.appTagline}
        </p>
      </div>

      {/* Bottom Loading Progress */}
      <div className="w-full max-w-xs pb-10 flex flex-col items-center gap-3">
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-purple-900/40">
          <div
            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(139,92,246,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between w-full text-[11px] text-slate-500 font-medium">
          <span>Initializing AI Models...</span>
          <span className="text-purple-400 font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
