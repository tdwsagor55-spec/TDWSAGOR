import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  Play,
  Pause,
  Sliders,
  Type,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Check,
  RefreshCw,
  ExternalLink,
  Layers,
  Palette,
  Camera,
  Film,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { TemplateItem, ActiveTab } from '../../types';

interface TemplateCustomizerModalProps {
  template: TemplateItem | null;
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TemplateCustomizerModal: React.FC<TemplateCustomizerModalProps> = ({
  template,
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const { t, language } = useLanguage();
  const { saveProject } = useProjects();
  const { updateUserStats } = useAuth();

  // Active customization states
  const [activeTab, setActiveTabMode] = useState<'media' | 'text' | 'style'>('media');
  
  // Slots (Photos)
  const [slotImages, setSlotImages] = useState<Record<string, string>>({});
  const [activeSlotIdForUpload, setActiveSlotIdForUpload] = useState<string | null>(null);

  // Video Intro customized video URL
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Text layers
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [customTextColors, setCustomTextColors] = useState<Record<string, string>>({});

  // Styling & Collages
  const [borderSpacing, setBorderSpacing] = useState<number>(8);
  const [borderRadius, setBorderRadius] = useState<number>(12);
  const [canvasBgColor, setCanvasBgColor] = useState<string>('#0a0a10');

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize template state whenever selected template changes
  useEffect(() => {
    if (!template) return;

    // Initialize photo slots
    const initialSlots: Record<string, string> = {};
    if (template.slots) {
      template.slots.forEach((s) => {
        initialSlots[s.id] = s.defaultUrl;
      });
    } else {
      initialSlots['slot_1'] = template.thumbnailUrl;
    }
    setSlotImages(initialSlots);

    // Initialize video
    if (template.videoConfig) {
      setCustomVideoUrl(template.videoConfig.defaultVideoUrl);
    } else {
      setCustomVideoUrl('');
    }

    // Initialize texts
    const initialTexts: Record<string, string> = {};
    const initialColors: Record<string, string> = {};
    if (template.textLayers) {
      template.textLayers.forEach((tl) => {
        initialTexts[tl.id] = language === 'bn' && tl.defaultTextBn ? tl.defaultTextBn : tl.defaultText;
        initialColors[tl.id] = tl.color;
      });
    }
    setCustomTexts(initialTexts);
    setCustomTextColors(initialColors);

    setIsVideoPlaying(false);
  }, [template, language]);

  if (!isOpen || !template) return null;

  // Trigger file upload for a specific slot or video
  const handleTriggerSlotUpload = (slotId: string) => {
    setActiveSlotIdForUpload(slotId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setStatusMessage(language === 'bn' ? 'ভিডিও আপডেট হয়েছে!' : 'Video updated!');
      setTimeout(() => setStatusMessage(null), 2000);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && activeSlotIdForUpload) {
          setSlotImages((prev) => ({
            ...prev,
            [activeSlotIdForUpload]: event.target?.result as string,
          }));
          setStatusMessage(language === 'bn' ? 'ছবি আপডেট হয়েছে!' : 'Photo updated for slot!');
          setTimeout(() => setStatusMessage(null), 2000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Video play toggle
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
    }
  };

  // Export Customized Creation (Canvas generation for photo/collage or MediaRecorder for video intro)
  const handleExportCustomized = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setStatusMessage(language === 'bn' ? 'কাস্টমাইজড ক্রিয়েশন রেন্ডার হচ্ছে...' : 'Rendering high-definition creation...');

    if (template.type === 'video') {
      // Video Intro export
      const video = videoRef.current;
      if (!video) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        const stream = canvas.captureStream(30);
        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4000000 });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `Custom_Intro_${Date.now()}.webm`;
          link.href = url;
          link.click();

          saveProject({
            title: `Intro: ${customTexts['txt_title'] || template.title}`,
            type: 'video',
            thumbnailUrl: template.thumbnailUrl,
            sizeMB: 5.6,
          });
          updateUserStats('video', 5.6);

          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
          setIsExporting(false);
          setStatusMessage(language === 'bn' ? 'ভিডিও সফলভাবে গ্যালারিতে সেভ হয়েছে!' : 'Custom Video Intro saved to gallery!');
          setTimeout(() => setStatusMessage(null), 3000);
        };

        recorder.start();
        video.currentTime = 0;
        video.play();

        let elapsed = 0;
        const totalSecs = template.videoConfig?.duration || 4;
        const step = 0.1;

        const interval = setInterval(() => {
          elapsed += step;
          const pct = Math.min(100, Math.round((elapsed / totalSecs) * 100));
          setExportProgress(pct);

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Draw dark cinematic overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw custom text layers
          if (customTexts['txt_badge']) {
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = customTextColors['txt_badge'] || '#38bdf8';
            ctx.fillText(customTexts['txt_badge'].toUpperCase(), canvas.width / 2, canvas.height / 2 - 60);
          }

          if (customTexts['txt_title']) {
            ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = customTextColors['txt_title'] || '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 15;
            ctx.fillText(customTexts['txt_title'], canvas.width / 2, canvas.height / 2);
          }

          if (customTexts['txt_sub']) {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = customTextColors['txt_sub'] || '#e2e8f0';
            ctx.shadowBlur = 10;
            ctx.fillText(customTexts['txt_sub'], canvas.width / 2, canvas.height / 2 + 50);
          }

          if (elapsed >= totalSecs) {
            clearInterval(interval);
            recorder.stop();
          }
        }, 100);
      } catch (err: any) {
        setIsExporting(false);
        setStatusMessage('Export error: ' + err.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } else {
      // Photo / Collage export via Canvas
      try {
        const canvas = document.createElement('canvas');
        let cw = 1200;
        let ch = 1200;
        if (template.aspectRatio === '9:16') { cw = 1080; ch = 1920; }
        else if (template.aspectRatio === '16:9') { cw = 1920; ch = 1080; }
        else if (template.aspectRatio === '4:5') { cw = 1080; ch = 1350; }

        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        // Draw background
        ctx.fillStyle = canvasBgColor;
        ctx.fillRect(0, 0, cw, ch);

        // Load images helper
        const loadImage = (url: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img); // soft fallback
          });
        };

        const slotsList = template.slots || [{ id: 'slot_1', defaultUrl: template.thumbnailUrl }];
        const loadedImgs = await Promise.all(
          slotsList.map((s) => loadImage(slotImages[s.id] || s.defaultUrl))
        );

        const pad = borderSpacing * 2;

        if (template.type === 'collage' && template.collageLayout === 'split-2' && loadedImgs.length >= 2) {
          // Draw left photo
          const w = (cw - pad * 3) / 2;
          const h = ch - pad * 2;
          ctx.drawImage(loadedImgs[0], pad, pad, w, h);
          ctx.drawImage(loadedImgs[1], pad * 2 + w, pad, w, h);
        } else if (template.type === 'collage' && template.collageLayout === 'grid-4' && loadedImgs.length >= 4) {
          const w = (cw - pad * 3) / 2;
          const h = (ch - pad * 3) / 2;
          ctx.drawImage(loadedImgs[0], pad, pad, w, h);
          ctx.drawImage(loadedImgs[1], pad * 2 + w, pad, w, h);
          ctx.drawImage(loadedImgs[2], pad, pad * 2 + h, w, h);
          ctx.drawImage(loadedImgs[3], pad * 2 + w, pad * 2 + h, w, h);
        } else if (template.type === 'collage' && template.collageLayout === 'featured-3' && loadedImgs.length >= 3) {
          const topH = (ch - pad * 3) * 0.65;
          const botH = (ch - pad * 3) * 0.35;
          const botW = (cw - pad * 3) / 2;
          ctx.drawImage(loadedImgs[0], pad, pad, cw - pad * 2, topH);
          ctx.drawImage(loadedImgs[1], pad, pad * 2 + topH, botW, botH);
          ctx.drawImage(loadedImgs[2], pad * 2 + botW, pad * 2 + topH, botW, botH);
        } else {
          // Single hero social post
          if (loadedImgs[0]) {
            ctx.drawImage(loadedImgs[0], pad, pad, cw - pad * 2, ch - pad * 2);
          }
        }

        // Draw vignette / gradient for text readability
        const grad = ctx.createLinearGradient(0, ch * 0.6, 0, ch);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, ch * 0.5, cw, ch * 0.5);

        // Draw Text Layers
        if (customTexts['txt_badge']) {
          ctx.font = 'bold 26px sans-serif';
          ctx.fillStyle = customTextColors['txt_badge'] || '#38bdf8';
          ctx.textAlign = 'center';
          ctx.fillText(customTexts['txt_badge'].toUpperCase(), cw / 2, ch - 160);
        }

        if (customTexts['txt_title']) {
          ctx.font = 'bold 58px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = customTextColors['txt_title'] || '#ffffff';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 16;
          ctx.textAlign = 'center';
          ctx.fillText(customTexts['txt_title'], cw / 2, ch - 100);
        }

        if (customTexts['txt_sub']) {
          ctx.font = '28px sans-serif';
          ctx.fillStyle = customTextColors['txt_sub'] || '#cbd5e1';
          ctx.shadowBlur = 10;
          ctx.textAlign = 'center';
          ctx.fillText(customTexts['txt_sub'], cw / 2, ch - 50);
        }

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `Custom_${template.id}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        saveProject({
          title: `Custom: ${customTexts['txt_title'] || template.title}`,
          type: 'photo',
          thumbnailUrl: dataUrl,
          sizeMB: 3.8,
        });
        updateUserStats('photo', 3.8);

        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setIsExporting(false);
        setStatusMessage(language === 'bn' ? 'এইচডি ক্রিয়েশন সফলভাবে সেভ হয়েছে!' : 'HD Creation saved to gallery!');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err: any) {
        setIsExporting(false);
        setStatusMessage('Export error: ' + err.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    }
  };

  // Open in full editor
  const handleOpenInFullEditor = () => {
    onClose();
    if (template.type === 'video') {
      setActiveTab('video');
    } else {
      setActiveTab('photo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept={template.type === 'video' ? 'video/*' : 'image/*'}
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative w-full max-w-2xl bg-[#0c0b17] border border-purple-800/40 rounded-3xl shadow-2xl shadow-purple-950/70 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-purple-900/30 flex items-center justify-between bg-[#111022] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px]">
              <div className="w-full h-full bg-[#0c0b17] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                  {language === 'bn' ? template.titleBn : template.title}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                  {template.aspectRatio}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'bn' ? 'নিজের ছবি, ভিডিও ও টেক্সট দিয়ে সাজান' : 'Customize with your media and texts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCustomized}
              disabled={isExporting}
              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95 disabled:opacity-60"
            >
              {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isExporting ? `${exportProgress}%` : t.exportCustomized}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="bg-purple-600/90 text-white text-xs font-medium py-1 px-3 text-center shrink-0 animate-in fade-in">
            {statusMessage}
          </div>
        )}

        {/* Middle Interactive Preview Canvas Container */}
        <div className="relative flex-1 min-h-[260px] sm:min-h-[320px] bg-[#07070d] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          {/* Main Visual Frame matching Template Aspect Ratio */}
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-purple-800/40 flex flex-col justify-end"
            style={{
              aspectRatio:
                template.aspectRatio === '9:16'
                  ? '9/16'
                  : template.aspectRatio === '16:9'
                  ? '16/9'
                  : template.aspectRatio === '4:5'
                  ? '4/5'
                  : '1/1',
              backgroundColor: canvasBgColor,
              padding: `${borderSpacing}px`,
            }}
          >
            {/* VIDEO INTRO PREVIEW */}
            {template.type === 'video' ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={customVideoUrl}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                {/* Animated Intro Text Layers */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                  {customTexts['txt_badge'] && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-2 border border-white/20 bg-black/40 backdrop-blur-md"
                      style={{ color: customTextColors['txt_badge'] || '#38bdf8' }}
                    >
                      {customTexts['txt_badge']}
                    </span>
                  )}
                  {customTexts['txt_title'] && (
                    <h2
                      className="text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-lg"
                      style={{ color: customTextColors['txt_title'] || '#ffffff' }}
                    >
                      {customTexts['txt_title']}
                    </h2>
                  )}
                  {customTexts['txt_sub'] && (
                    <p
                      className="text-xs sm:text-sm font-medium mt-1 drop-shadow-md"
                      style={{ color: customTextColors['txt_sub'] || '#e2e8f0' }}
                    >
                      {customTexts['txt_sub']}
                    </p>
                  )}
                </div>

                {/* Center Play/Pause button */}
                <button
                  onClick={toggleVideoPlay}
                  className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md shadow-lg"
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
              </div>
            ) : template.type === 'collage' ? (
              /* COLLAGE PREVIEW */
              <div className="relative w-full h-full flex flex-col">
                {template.collageLayout === 'split-2' && (
                  <div
                    className="w-full h-full grid grid-cols-2"
                    style={{ gap: `${borderSpacing}px` }}
                  >
                    {(template.slots || []).map((slot, i) => (
                      <div
                        key={slot.id}
                        onClick={() => handleTriggerSlotUpload(slot.id)}
                        className="relative group w-full h-full overflow-hidden cursor-pointer bg-slate-900 border border-white/10"
                        style={{ borderRadius: `${borderRadius}px` }}
                      >
                        <img
                          src={slotImages[slot.id] || slot.defaultUrl}
                          alt={slot.label || `Slot ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white">
                          <Camera className="w-5 h-5 mb-1 text-purple-300" />
                          <span className="text-[10px] font-bold">{t.replacePhoto}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {template.collageLayout === 'grid-4' && (
                  <div
                    className="w-full h-full grid grid-cols-2 grid-rows-2"
                    style={{ gap: `${borderSpacing}px` }}
                  >
                    {(template.slots || []).map((slot, i) => (
                      <div
                        key={slot.id}
                        onClick={() => handleTriggerSlotUpload(slot.id)}
                        className="relative group w-full h-full overflow-hidden cursor-pointer bg-slate-900 border border-white/10"
                        style={{ borderRadius: `${borderRadius}px` }}
                      >
                        <img
                          src={slotImages[slot.id] || slot.defaultUrl}
                          alt={slot.label || `Slot ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center text-white">
                          <Camera className="w-4 h-4 text-purple-300" />
                          <span className="text-[9px] font-bold">Slot {i + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {template.collageLayout === 'featured-3' && (
                  <div
                    className="w-full h-full flex flex-col"
                    style={{ gap: `${borderSpacing}px` }}
                  >
                    {/* Top featured */}
                    <div
                      onClick={() => handleTriggerSlotUpload('slot_1')}
                      className="relative group flex-1 w-full overflow-hidden cursor-pointer bg-slate-900 border border-white/10"
                      style={{ borderRadius: `${borderRadius}px` }}
                    >
                      <img
                        src={slotImages['slot_1'] || template.slots?.[0]?.defaultUrl}
                        alt="Featured"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white">
                        <Camera className="w-5 h-5 text-purple-300" />
                        <span className="text-[10px] font-bold">Replace Featured</span>
                      </div>
                    </div>

                    {/* Bottom dual */}
                    <div
                      className="h-28 w-full grid grid-cols-2"
                      style={{ gap: `${borderSpacing}px` }}
                    >
                      {['slot_2', 'slot_3'].map((sid, idx) => (
                        <div
                          key={sid}
                          onClick={() => handleTriggerSlotUpload(sid)}
                          className="relative group w-full h-full overflow-hidden cursor-pointer bg-slate-900 border border-white/10"
                          style={{ borderRadius: `${borderRadius}px` }}
                        >
                          <img
                            src={slotImages[sid] || template.slots?.[idx + 1]?.defaultUrl}
                            alt={`Detail ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Camera className="w-4 h-4 text-purple-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text overlays on Collage */}
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-black/60 backdrop-blur-md text-center pointer-events-none">
                  {customTexts['txt_title'] && (
                    <h3
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: customTextColors['txt_title'] || '#ffffff' }}
                    >
                      {customTexts['txt_title']}
                    </h3>
                  )}
                  {customTexts['txt_sub'] && (
                    <p
                      className="text-[10px] truncate"
                      style={{ color: customTextColors['txt_sub'] || '#93c5fd' }}
                    >
                      {customTexts['txt_sub']}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* SOCIAL MEDIA POST PREVIEW */
              <div
                onClick={() => handleTriggerSlotUpload('slot_1')}
                className="relative group w-full h-full overflow-hidden cursor-pointer bg-slate-900 flex flex-col justify-end p-4"
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <img
                  src={slotImages['slot_1'] || template.thumbnailUrl}
                  alt="Post Hero"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* Text content */}
                <div className="relative z-10 space-y-1">
                  {customTexts['txt_badge'] && (
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: customTextColors['txt_badge'] || '#06b6d4' }}
                    >
                      {customTexts['txt_badge']}
                    </span>
                  )}
                  {customTexts['txt_title'] && (
                    <h2
                      className="text-lg sm:text-xl font-black leading-tight drop-shadow-md"
                      style={{ color: customTextColors['txt_title'] || '#ffffff' }}
                    >
                      {customTexts['txt_title']}
                    </h2>
                  )}
                  {customTexts['txt_sub'] && (
                    <p
                      className="text-xs font-medium drop-shadow"
                      style={{ color: customTextColors['txt_sub'] || '#e2e8f0' }}
                    >
                      {customTexts['txt_sub']}
                    </p>
                  )}
                </div>

                {/* Tap to replace badge */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-purple-300 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3 h-3" />
                  <span>{t.replacePhoto}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Customization Controls Tabs */}
        <div className="bg-[#100f20] border-t border-purple-900/30 px-3 py-1.5 flex items-center justify-around shrink-0">
          {[
            { id: 'media', label: template.type === 'video' ? 'Video Media' : 'Photos & Slots', icon: ImageIcon },
            { id: 'text', label: t.editText, icon: Type },
            { id: 'style', label: 'Layout & Style', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabMode(tab.id as any)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Sub-panel Editor */}
        <div className="p-3.5 bg-[#141227] border-t border-purple-950/60 max-h-52 overflow-y-auto space-y-3 shrink-0">
          {/* MEDIA REPLACEMENT TAB */}
          {activeTab === 'media' && (
            <div className="space-y-3">
              {template.type === 'video' ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <VideoIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Background Video Clip</div>
                      <div className="text-[10px] text-slate-400">Duration: {template.videoConfig?.duration || 5}s</div>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.replaceVideo}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    {t.tapToUpload}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(template.slots || [{ id: 'slot_1', defaultUrl: template.thumbnailUrl }]).map((slot, idx) => (
                      <div
                        key={slot.id}
                        onClick={() => handleTriggerSlotUpload(slot.id)}
                        className="relative group rounded-xl overflow-hidden border border-purple-500/30 bg-slate-900 cursor-pointer aspect-video flex flex-col justify-end"
                      >
                        <img
                          src={slotImages[slot.id] || slot.defaultUrl}
                          alt={slot.label || `Slot ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="relative z-10 p-1.5 bg-black/70 backdrop-blur-md flex items-center justify-between text-[10px] font-semibold text-white">
                          <span className="truncate">{slot.label || `Slot ${idx + 1}`}</span>
                          <Upload className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEXT EDITING TAB */}
          {activeTab === 'text' && (
            <div className="space-y-2.5">
              {(template.textLayers || []).map((tl) => (
                <div key={tl.id} className="flex items-center gap-2">
                  <div className="w-20 text-[11px] font-semibold text-slate-400 capitalize truncate">
                    {tl.style}:
                  </div>
                  <input
                    type="text"
                    value={customTexts[tl.id] || ''}
                    onChange={(e) =>
                      setCustomTexts({ ...customTexts, [tl.id]: e.target.value })
                    }
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="color"
                    value={customTextColors[tl.id] || tl.color}
                    onChange={(e) =>
                      setCustomTextColors({ ...customTextColors, [tl.id]: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* STYLE & LAYOUT TAB */}
          {activeTab === 'style' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>{t.borderSpacing}</span>
                    <span className="font-bold text-purple-400">{borderSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={borderSpacing}
                    onChange={(e) => setBorderSpacing(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>{t.borderRadius}</span>
                    <span className="font-bold text-purple-400">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Background Color Palette */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                  {t.canvasBg}
                </span>
                <div className="flex items-center gap-2">
                  {['#0a0a10', '#131124', '#1e1b4b', '#064e3b', '#7f1d1d', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCanvasBgColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        canvasBgColor === c ? 'scale-110 border-purple-400 ring-2 ring-purple-500/50' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Open in full studio footer link */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Want multi-layer controls, filters & stickers?</span>
            <button
              onClick={handleOpenInFullEditor}
              className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>{t.openInEditor}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
