import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft, Home, Square } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, enabled }) => {
  if (!enabled) {
    return <div className="min-h-screen bg-[#07070d]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#040407] flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Realistic Android Phone Bezel */}
      <div className="relative w-full max-w-[430px] h-[92vh] max-h-[920px] bg-[#090812] rounded-[48px] p-3 shadow-[0_0_50px_rgba(124,58,237,0.25)] border-[8px] border-[#1e1c2e] flex flex-col overflow-hidden">
        {/* Top Punch Hole Camera & Speaker */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
          <div className="w-12 h-1 bg-slate-800 rounded-full mb-1" />
        </div>

        {/* Android Status Bar */}
        <div className="w-full h-8 px-6 pt-1 flex items-center justify-between text-[11px] font-semibold text-slate-300 select-none z-50 shrink-0">
          <span>11:05</span>
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-slate-800/80 mx-auto" />
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span>98%</span>
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Screen Content Container with inner scroll */}
        <div className="relative flex-1 w-full rounded-[36px] overflow-hidden bg-[#07070d] flex flex-col">
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>
        </div>

        {/* Android Gesture Bar */}
        <div className="h-5 flex items-center justify-center select-none pt-1 shrink-0">
          <div className="w-32 h-1 bg-slate-500/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};
