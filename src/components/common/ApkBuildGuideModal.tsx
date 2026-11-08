import React, { useState } from 'react';
import { X, Smartphone, Terminal, Copy, Check, ExternalLink, ShieldCheck, Download, Code2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ApkBuildGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkBuildGuideModal: React.FC<ApkBuildGuideModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: language === 'bn' ? '১. ক্যাপাসিটর ইনস্টল করুন' : '1. Install Capacitor for Android',
      desc: language === 'bn' ? 'টার্মিনালে ক্যাপাসিটর প্যাকেজ ইনস্টল করুন:' : 'Install the official Capacitor CLI and Android runtime:',
      cmd: 'npm install @capacitor/core @capacitor/cli @capacitor/android',
    },
    {
      title: language === 'bn' ? '২. ক্যাপাসিটর কনফিগার করুন' : '2. Initialize Capacitor Project',
      desc: language === 'bn' ? 'অ্যাপের নাম ও প্যাকেজ আইডি দিন:' : 'Set your application name and Android package ID:',
      cmd: 'npx cap init "Magic Photo & Video Editor" "com.magic.editor.app" --web-dir="dist"',
    },
    {
      title: language === 'bn' ? '৩. ওয়েব বিল্ড তৈরি করুন' : '3. Build Web Bundle',
      desc: language === 'bn' ? 'প্রজেক্টের প্রোডাকশন বিল্ড করুন:' : 'Generate the optimized production assets:',
      cmd: 'npm run build',
    },
    {
      title: language === 'bn' ? '৪. অ্যান্ড্রয়েড প্ল্যাটফর্ম যোগ করুন' : '4. Add Android Platform',
      desc: language === 'bn' ? 'অ্যান্ড্রয়েড প্রজেক্ট ফাইল তৈরি করুন:' : 'Scaffold the native Android Studio project:',
      cmd: 'npx cap add android',
    },
    {
      title: language === 'bn' ? '৫. সিঙ্ক করুন' : '5. Sync Assets',
      desc: language === 'bn' ? 'কোড অ্যান্ড্রয়েড ফোল্ডারে কপি করুন:' : 'Sync web assets and plugins to Android directory:',
      cmd: 'npx cap sync',
    },
    {
      title: language === 'bn' ? '৬. অ্যান্ড্রয়েড স্টুডিওতে খুলুন' : '6. Open in Android Studio',
      desc: language === 'bn' ? 'অ্যান্ড্রয়েড স্টুডিওতে বিল্ড করতে ওপেন করুন:' : 'Launch Android Studio to build APK or run on phone:',
      cmd: 'npx cap open android',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0e0d1b] border border-purple-800/40 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/30 flex items-center justify-between bg-[#121122]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-[1.5px]">
              <div className="w-full h-full bg-[#0e0d1b] rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {language === 'bn' ? 'অ্যান্ড্রয়েড APK তৈরি গাইড' : 'Android APK Build & Install Guide'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'কীভাবে আপনার অ্যান্ড্রয়েড ফোনে APK ইন্সটল করবেন'
                  : 'Step-by-step instructions for Android Studio & APK'}
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Quick PWA Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/30 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                {language === 'bn' ? 'তাৎক্ষণিক মোবাইল ইনস্টলেশন (PWA):' : 'Instant 1-Tap Mobile Install (PWA):'}
              </span>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার অ্যান্ড্রয়েডের Chrome ব্রাউজার থেকে থ্রি-ডট মেনু (⋮) চেপে "Install App" বা "Add to Home screen" নির্বাচন করলে অ্যাপ আইকনসহ নেটিভের মতো কাজ করবে।'
                  : 'On your Android device in Chrome browser, tap the three dots (⋮) and select "Install app" or "Add to Home screen" to run full-screen offline!'}
              </p>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'bn' ? 'নেটিভ APK তৈরির ধাপসমূহ:' : 'Native .APK Compilation Steps:'}
          </h3>

          {/* Steps list */}
          <div className="space-y-3">
            {steps.map((st, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-200">{st.title}</div>
                <div className="text-[11px] text-slate-400">{st.desc}</div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/60 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  <span className="truncate mr-2">{st.cmd}</span>
                  <button
                    onClick={() => copyCommand(st.cmd, idx)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Step 7: How to generate APK inside Android Studio */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/30 space-y-1.5">
            <div className="font-bold text-indigo-200">
              {language === 'bn' ? '৭. অ্যান্ড্রয়েড স্টুডিওতে APK এক্সপোর্ট:' : '7. Generate APK in Android Studio:'}
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
              <li>In Android Studio, click <strong>Build</strong> in the top menu bar.</li>
              <li>Select <strong>Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
              <li>When the notification appears, click <strong>locate</strong> to find the <code>app-debug.apk</code> file.</li>
              <li>Transfer the <code>.apk</code> to your Android phone via USB, WhatsApp, or Drive.</li>
              <li>Tap the file to install (allow "Install from Unknown Sources" if prompted).</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-purple-900/30 bg-[#0c0b17] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            {language === 'bn' ? 'বুঝেছি' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
