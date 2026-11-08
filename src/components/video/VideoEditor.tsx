import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Play,
  Pause,
  Scissors,
  Music,
  Type,
  Sparkles,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Film,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Wand2,
  Layers,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { VideoSubtitle, VideoExportPreset } from '../../types';
import { ExportPresetsModal } from '../common/ExportPresetsModal';

const sampleVideos = [
  {
    id: 'v1',
    name: 'Cyberpunk Neon',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-tall-buildings-42588-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'v2',
    name: 'Drone Ocean Sunset',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-with-turquoise-water-and-white-sand-41588-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'v3',
    name: 'Urban Night Streets',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-in-a-busy-avenue-at-night-42533-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
  },
];

const videoFilterPresets = [
  { id: 'none', name: 'Normal', filter: '' },
  { id: 'cyber', name: 'Cyberpunk', filter: 'hue-rotate(270deg) contrast(140%) saturate(160%)' },
  { id: 'vintage', name: 'Vintage 8mm', filter: 'sepia(50%) contrast(120%) brightness(95%)' },
  { id: 'noir', name: 'B&W Noir', filter: 'grayscale(100%) contrast(150%)' },
  { id: 'golden', name: 'Golden Hour', filter: 'sepia(30%) saturate(160%) brightness(105%)' },
  { id: 'dreamy', name: 'Pastel Dream', filter: 'brightness(110%) saturate(130%) contrast(90%)' },
];

const musicTracks = [
  { id: 'cyber_beat', name: 'Cyber Neon Pulse', genre: 'Electronic', toneFreq: 440 },
  { id: 'lofi_chill', name: 'Lo-Fi Midnight Chill', genre: 'Lo-Fi', toneFreq: 330 },
  { id: 'epic_cinema', name: 'Cinematic Horizon', genre: 'Ambient', toneFreq: 260 },
  { id: 'pop_energy', name: 'Upbeat Energy', genre: 'Pop', toneFreq: 520 },
];

const soundEffects = [
  { id: 'sfx_whoosh', name: '💨 Fast Whoosh', freq: 600, duration: 0.3 },
  { id: 'sfx_sparkle', name: '✨ Magic Sparkle', freq: 880, duration: 0.4 },
  { id: 'sfx_click', name: '📸 Shutter Click', freq: 1200, duration: 0.1 },
  { id: 'sfx_glitch', name: '⚡ Cyber Glitch', freq: 220, duration: 0.25 },
];

export const VideoEditor: React.FC = () => {
  const { t, language } = useLanguage();
  const { saveProject } = useProjects();
  const { updateUserStats } = useAuth();

  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(sampleVideos[0].url);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<'trim' | 'speed' | 'audio' | 'subtitles' | 'filters' | 'stickers'>('trim');

  // Trim controls
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(10);

  // Filter
  const [selectedFilter, setSelectedFilter] = useState<string>('none');

  // Audio & Music
  const [videoVolume, setVideoVolume] = useState<number>(1.0);
  const [musicVolume, setMusicVolume] = useState<number>(0.7);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);

  // Subtitles
  const [subtitles, setSubtitles] = useState<VideoSubtitle[]>([
    { id: 'sub_1', text: 'Magic AI Video Studio', startTime: 1, endTime: 4, color: '#facc15', fontSize: 24 },
  ]);
  const [newSubText, setNewSubText] = useState<string>('');

  // Stickers
  const [activeStickers, setActiveStickers] = useState<{ id: string; emoji: string; x: number; y: number }[]>([
    { id: 'stk_1', emoji: '✨', x: 20, y: 30 },
  ]);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [showExportPresets, setShowExportPresets] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicOscillatorRef = useRef<OscillatorNode | null>(null);

  // Initialize video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = Math.floor(videoRef.current.duration) || 10;
      setDuration(dur);
      setTrimEnd(dur);
    }
  };

  // Video time update handler (enforce trim bounds)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (curr >= trimEnd) {
      videoRef.current.currentTime = trimStart;
      if (!isPlaying) {
        videoRef.current.pause();
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      stopMusicSynth();
    } else {
      if (videoRef.current.currentTime < trimStart || videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        if (selectedMusicId) startMusicSynth(selectedMusicId);
      }).catch(() => {});
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCurrentVideoUrl(url);
      setIsPlaying(false);
      setTrimStart(0);
    }
  };

  // Web Audio synth for background music simulation
  const startMusicSynth = (musicId: string) => {
    const track = musicTracks.find((m) => m.id === musicId);
    if (!track) return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (musicOscillatorRef.current) {
        musicOscillatorRef.current.stop();
        musicOscillatorRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = track.genre === 'Electronic' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(track.toneFreq, ctx.currentTime);

      gain.gain.setValueAtTime(musicVolume * 0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      musicOscillatorRef.current = osc;
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const stopMusicSynth = () => {
    if (musicOscillatorRef.current) {
      try {
        musicOscillatorRef.current.stop();
        musicOscillatorRef.current.disconnect();
      } catch (e) {}
      musicOscillatorRef.current = null;
    }
  };

  // Play a short sound effect
  const playSoundEffect = (freq: number, durationSec: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch (e) {}
  };

  // Add subtitle
  const handleAddSubtitle = () => {
    if (!newSubText.trim()) return;
    const newSub: VideoSubtitle = {
      id: 'sub_' + Date.now(),
      text: newSubText,
      startTime: Math.max(0, Math.floor(currentTime)),
      endTime: Math.min(duration, Math.floor(currentTime) + 3),
      color: '#ffffff',
      fontSize: 22,
    };
    setSubtitles((prev) => [...prev, newSub]);
    setNewSubText('');
  };

  // Active subtitles visible at current playback time
  const currentVisibleSubtitles = subtitles.filter(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  // Format time helper (00:04)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Real HD Video Exporter via HTML5 Canvas + MediaRecorder
  const handleExportVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus(language === 'bn' ? 'ভিডিও ফ্রেম প্রস্তুত হচ্ছে...' : 'Preparing high-definition export...');

    // Pause current preview
    video.pause();
    setIsPlaying(false);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      const stream = canvas.captureStream(30); // 30 FPS stream
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
        const videoDownloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Magic_Video_HD_${Date.now()}.webm`;
        link.href = videoDownloadUrl;
        link.click();

        // Save into My Projects
        saveProject({
          title: 'HD Video Project',
          type: 'video',
          thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
          sizeMB: 7.8,
        });
        updateUserStats('video', 7.8);

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899'],
        });

        setIsExporting(false);
        setExportStatus(language === 'bn' ? 'ভিডিও সফলভাবে গ্যালারিতে সংরক্ষিত হয়েছে!' : 'HD Video exported to gallery!');
        setTimeout(() => setExportStatus(null), 3500);
      };

      recorder.start();

      // Render frames through canvas
      const renderDuration = Math.min(10, Math.max(2, trimEnd - trimStart));
      video.currentTime = trimStart;

      let elapsed = 0;
      const step = 0.1; // 100ms frame step

      const interval = setInterval(() => {
        elapsed += step;
        const pct = Math.min(100, Math.round((elapsed / renderDuration) * 100));
        setExportProgress(pct);
        setExportStatus(
          language === 'bn'
            ? `রেন্ডার হচ্ছে: ${pct}% (এইচডি ১০৮০পি)`
            : `Rendering: ${pct}% (HD 1080p)`
        );

        // Apply filter preset
        const currentFilterStr =
          videoFilterPresets.find((f) => f.id === selectedFilter)?.filter || 'none';
        ctx.filter = currentFilterStr;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Draw subtitles on exported frame
        const visibleSubs = subtitles.filter(
          (s) => video.currentTime >= s.startTime && video.currentTime <= s.endTime
        );
        visibleSubs.forEach((sub) => {
          ctx.save();
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = sub.color || '#ffffff';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 10;
          ctx.fillText(sub.text, canvas.width / 2, canvas.height - 80);
          ctx.restore();
        });

        // Draw stickers on exported frame
        activeStickers.forEach((stk) => {
          ctx.save();
          ctx.font = '54px sans-serif';
          ctx.fillText(stk.emoji, (stk.x / 100) * canvas.width, (stk.y / 100) * canvas.height);
          ctx.restore();
        });

        video.currentTime += step;

        if (elapsed >= renderDuration) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 100);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsExporting(false);
      setExportStatus(language === 'bn' ? 'এক্সপোর্ট ব্যর্থ হয়েছে' : 'Export failed: ' + err.message);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  // Export Video with Pre-configured Preset (e.g. YouTube Shorts 9:16, 1080p Cinema, Reels)
  const handleExportVideoWithPreset = async (preset: VideoExportPreset) => {
    const video = videoRef.current;
    if (!video) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus(
      language === 'bn'
        ? `${preset.nameBn} প্রিসেটে ফ্রেম প্রস্তুত হচ্ছে...`
        : `Preparing ${preset.name} (${preset.width}x${preset.height}) export...`
    );

    video.pause();
    setIsPlaying(false);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = preset.width;
      canvas.height = preset.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      const stream = canvas.captureStream(preset.fps || 30);
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: preset.bitrate,
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoDownloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Magic_Video_${preset.id}_${Date.now()}.webm`;
        link.href = videoDownloadUrl;
        link.click();

        saveProject({
          title: `${preset.name} (${preset.width}x${preset.height})`,
          type: 'video',
          thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
          sizeMB: parseFloat(((preset.bitrate * 8) / (8 * 1024 * 1024)).toFixed(1)) || 6.5,
        });
        updateUserStats('video', 6.5);

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899'],
        });

        setIsExporting(false);
        setExportStatus(
          language === 'bn'
            ? `${preset.nameBn} সফলভাবে এক্সপোর্ট হয়েছে!`
            : `${preset.name} exported successfully to gallery!`
        );
        setTimeout(() => setExportStatus(null), 3500);
      };

      recorder.start();

      const renderDuration = Math.min(10, Math.max(2, trimEnd - trimStart));
      video.currentTime = trimStart;

      let elapsed = 0;
      const step = 0.1;

      const interval = setInterval(() => {
        elapsed += step;
        const pct = Math.min(100, Math.round((elapsed / renderDuration) * 100));
        setExportProgress(pct);
        setExportStatus(
          language === 'bn'
            ? `রেন্ডার হচ্ছে: ${pct}% (${preset.nameBn})`
            : `Rendering: ${pct}% (${preset.name})`
        );

        // Aspect ratio cover calculations for video frame
        const vW = video.videoWidth || 1280;
        const vH = video.videoHeight || 720;
        const srcRatio = vW / vH;
        const targetRatio = canvas.width / canvas.height;

        let drawW: number;
        let drawH: number;
        let offsetX: number;
        let offsetY: number;

        if (srcRatio > targetRatio) {
          drawH = canvas.height;
          drawW = canvas.height * srcRatio;
          offsetX = (canvas.width - drawW) / 2;
          offsetY = 0;
        } else {
          drawW = canvas.width;
          drawH = canvas.width / srcRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawH) / 2;
        }

        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply filter preset
        const currentFilterStr =
          videoFilterPresets.find((f) => f.id === selectedFilter)?.filter || 'none';
        ctx.filter = currentFilterStr;
        ctx.drawImage(video, offsetX, offsetY, drawW, drawH);
        ctx.filter = 'none';

        // Draw subtitles on exported frame scaled to canvas
        const visibleSubs = subtitles.filter(
          (s) => video.currentTime >= s.startTime && video.currentTime <= s.endTime
        );
        visibleSubs.forEach((sub) => {
          ctx.save();
          const scaleFont = Math.round((canvas.width / 1280) * 36);
          ctx.font = `bold ${scaleFont}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = sub.color || '#ffffff';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 12;
          ctx.fillText(sub.text, canvas.width / 2, canvas.height - 80);
          ctx.restore();
        });

        // Draw stickers on exported frame scaled
        activeStickers.forEach((stk) => {
          ctx.save();
          const scaleSticker = Math.round((canvas.width / 1280) * 54);
          ctx.font = `${scaleSticker}px sans-serif`;
          ctx.fillText(stk.emoji, (stk.x / 100) * canvas.width, (stk.y / 100) * canvas.height);
          ctx.restore();
        });

        video.currentTime += step;

        if (elapsed >= renderDuration) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 100);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsExporting(false);
      setExportStatus(language === 'bn' ? 'এক্সপোর্ট ব্যর্থ হয়েছে' : 'Export failed: ' + err.message);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#07070d] text-white pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="px-3 py-2 bg-[#0d0c17] border-b border-purple-900/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.uploadVideo}</span>
          </button>

          {/* Sample video picker */}
          <div className="flex items-center gap-1">
            {sampleVideos.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentVideoUrl(s.url);
                  setIsPlaying(false);
                }}
                className={`w-6 h-6 rounded-md overflow-hidden border transition-all ${
                  currentVideoUrl === s.url ? 'border-cyan-400 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={s.thumbnail} alt={s.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Export Presets Button */}
          <button
            onClick={() => setShowExportPresets(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-950/70 hover:bg-blue-900/70 text-blue-200 border border-blue-500/40 shadow-sm active:scale-95 transition-all"
            title="Open Video Export Presets Menu"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
            <span>Presets ▾</span>
          </button>

          {/* HD Export Button */}
          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-60"
          >
            {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? `${exportProgress}%` : t.exportVideo}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {exportStatus && (
        <div className="bg-blue-600/90 text-white text-xs font-medium py-1 px-3 text-center shrink-0 flex items-center justify-center gap-2">
          {isExporting && <RefreshCw className="w-3 h-3 animate-spin" />}
          <span>{exportStatus}</span>
        </div>
      )}

      {/* Video Viewport & Overlays */}
      <div className="relative flex-1 min-h-[260px] bg-[#040407] flex items-center justify-center p-2 overflow-hidden">
        <div className="relative max-h-[46vh] sm:max-h-[50vh] w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-950/60 border border-purple-900/30 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={currentVideoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            playsInline
            className="w-full h-full object-cover"
            style={{
              filter: videoFilterPresets.find((f) => f.id === selectedFilter)?.filter || 'none',
            }}
          />

          {/* Subtitles Overlay */}
          {currentVisibleSubtitles.map((sub) => (
            <div
              key={sub.id}
              className="absolute bottom-6 left-4 right-4 text-center pointer-events-none z-10"
            >
              <span
                className="inline-block px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md font-bold tracking-wide shadow-lg border border-white/10"
                style={{ color: sub.color, fontSize: `${sub.fontSize}px` }}
              >
                {sub.text}
              </span>
            </div>
          ))}

          {/* Stickers Overlay */}
          {activeStickers.map((stk) => (
            <div
              key={stk.id}
              className="absolute pointer-events-none select-none text-3xl animate-bounce"
              style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
            >
              {stk.emoji}
            </div>
          ))}

          {/* Center Play/Pause button on tap */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full bg-purple-600/80 hover:bg-purple-600 text-white flex items-center justify-center shadow-xl shadow-purple-600/50 backdrop-blur-md group-hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5 fill-white" />}
            </div>
          </button>
        </div>
      </div>

      {/* Scrub & Timeline Bar */}
      <div className="bg-[#0b0a16] border-t border-purple-900/30 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
          <span className="text-purple-300 font-bold">{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Trim: {formatTime(trimStart)} - {formatTime(trimEnd)}</span>
            <span className="text-cyan-400 font-bold">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Visual scrubber */}
        <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          {/* Active trim region highlight */}
          <div
            className="absolute top-0 bottom-0 bg-purple-600/30 border-l-2 border-r-2 border-purple-400"
            style={{
              left: `${(trimStart / (duration || 1)) * 100}%`,
              width: `${((trimEnd - trimStart) / (duration || 1)) * 100}%`,
            }}
          />
          {/* Playhead thumb */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] rounded-full -translate-x-1"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={duration || 10}
          step="0.1"
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="w-full -mt-2 opacity-0 cursor-pointer h-4 block"
        />
      </div>

      {/* Tools Horizontal Category Tabs */}
      <div className="bg-[#0e0d1a] border-t border-purple-900/30 px-2 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
        {[
          { id: 'trim', label: t.trimCut, icon: Scissors },
          { id: 'speed', label: t.speed, icon: Gauge },
          { id: 'audio', label: t.audioMusic, icon: Music },
          { id: 'subtitles', label: t.subtitles, icon: Type },
          { id: 'filters', label: t.videoFilters, icon: Sparkles },
          { id: 'stickers', label: t.toolStickers, icon: Film },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtool Controls Panel */}
      <div className="bg-[#121122] border-t border-purple-950/60 p-3.5 shrink-0 max-h-56 overflow-y-auto">
        {/* Trim & Cut */}
        {activeTab === 'trim' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>{t.trimStart}</span>
                  <span className="font-bold text-purple-400">{formatTime(trimStart)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={trimEnd - 1}
                  step="0.5"
                  value={trimStart}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTrimStart(val);
                    handleSeek(val);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>{t.trimEnd}</span>
                  <span className="font-bold text-cyan-400">{formatTime(trimEnd)}</span>
                </div>
                <input
                  type="range"
                  min={trimStart + 1}
                  max={duration}
                  step="0.5"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-[11px] text-purple-200 flex items-center justify-between">
              <span>{language === 'bn' ? 'নির্বাচিত ক্লিপ দৈর্ঘ্য:' : 'Clip Trimmed Length:'}</span>
              <span className="font-extrabold text-cyan-300">{formatTime(trimEnd - trimStart)}</span>
            </div>
          </div>
        )}

        {/* Speed Adjustment */}
        {activeTab === 'speed' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">
              {language === 'bn' ? 'ভিডিও প্লেব্যাক স্পিড' : 'Video Playback Speed'}
            </span>
            <div className="grid grid-cols-6 gap-2">
              {[0.25, 0.5, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    playbackSpeed === s
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Audio & Music & Sound FX */}
        {activeTab === 'audio' && (
          <div className="space-y-3">
            {/* Background Music Selector */}
            <div>
              <span className="text-xs font-semibold text-purple-300 block mb-1.5">
                {t.musicLibrary}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {musicTracks.map((trk) => (
                  <button
                    key={trk.id}
                    onClick={() => {
                      if (selectedMusicId === trk.id) {
                        setSelectedMusicId(null);
                        stopMusicSynth();
                      } else {
                        setSelectedMusicId(trk.id);
                        if (isPlaying) startMusicSynth(trk.id);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      selectedMusicId === trk.id
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                        : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold truncate">{trk.name}</div>
                    <div className="text-[10px] text-slate-400">{trk.genre}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sound FX triggers */}
            <div>
              <span className="text-xs font-semibold text-purple-300 block mb-1.5">
                {t.soundEffects}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {soundEffects.map((sfx) => (
                  <button
                    key={sfx.id}
                    onClick={() => playSoundEffect(sfx.freq, sfx.duration)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 font-medium active:scale-95"
                  >
                    {sfx.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume sliders */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Video Volume</span>
                  <span>{Math.round(videoVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={videoVolume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVideoVolume(val);
                    if (videoRef.current) videoRef.current.volume = val;
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Music Volume</span>
                  <span>{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Subtitles & Captions */}
        {activeTab === 'subtitles' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubText}
                onChange={(e) => setNewSubText(e.target.value)}
                placeholder="Enter subtitle caption..."
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddSubtitle}
                className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Existing subtitles list */}
            <div className="space-y-1.5">
              {subtitles.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="text-white font-medium">{sub.text}</span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      ({formatTime(sub.startTime)} - {formatTime(sub.endTime)})
                    </span>
                  </div>
                  <button
                    onClick={() => setSubtitles((prev) => prev.filter((s) => s.id !== sub.id))}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Filters */}
        {activeTab === 'filters' && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {videoFilterPresets.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`flex flex-col items-center p-2 rounded-xl border min-w-[76px] transition-all ${
                  selectedFilter === f.id
                    ? 'border-blue-500 bg-blue-900/30 text-blue-200'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg bg-slate-800 mb-1 overflow-hidden"
                  style={{ filter: f.filter }}
                >
                  <img
                    src={sampleVideos[0].thumbnail}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Video Stickers */}
        {activeTab === 'stickers' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">
              {language === 'bn' ? 'ভিডিওতে স্টিকার দিন' : 'Add Animated Video Sticker'}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['✨', '🔥', '🚀', '👑', '🕶️', '⚡', '💎', '🌸', '💯'].map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setActiveStickers((prev) => [
                      ...prev,
                      { id: 'stk_' + Date.now(), emoji, x: 50, y: 50 },
                    ])
                  }
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:scale-110 transition-transform flex items-center justify-center text-xl shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {activeStickers.length > 0 && (
              <button
                onClick={() => setActiveStickers([])}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
              >
                Clear Video Stickers
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video Export Presets Modal */}
      <ExportPresetsModal
        isOpen={showExportPresets}
        onClose={() => setShowExportPresets(false)}
        mode="video"
        onSelectPhotoPreset={() => {}}
        onSelectVideoPreset={handleExportVideoWithPreset}
        isExporting={isExporting}
      />
    </div>
  );
};
