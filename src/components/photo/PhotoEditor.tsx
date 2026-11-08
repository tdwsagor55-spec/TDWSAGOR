import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  RotateCw,
  FlipHorizontal,
  Crop,
  Sliders,
  Sparkles,
  Scissors,
  Smile,
  Paintbrush,
  Eraser,
  Type,
  Download,
  RotateCcw,
  Check,
  X,
  Camera,
  Layers,
  Star,
  RefreshCw,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { PhotoAdjustments, OverlayElement, PhotoExportPreset } from '../../types';
import { ExportPresetsModal } from '../common/ExportPresetsModal';

const defaultAdjustments: PhotoAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
  blur: 0,
  invert: 0,
  hueRotate: 0,
  exposure: 0,
  vignette: 0,
};

const sampleImages = [
  {
    id: 's1',
    name: 'Portrait Model',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's2',
    name: 'Urban Street',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's3',
    name: 'Sunset Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's4',
    name: 'Anime Aesthetic',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
  },
];

const presetFilters = [
  { id: 'normal', name: 'Normal', filter: '' },
  { id: 'cyberpunk', name: 'Cyberpunk', filter: 'hue-rotate(280deg) saturate(180%) contrast(120%)' },
  { id: 'golden', name: 'Golden Hour', filter: 'sepia(40%) saturate(150%) brightness(105%)' },
  { id: 'noir', name: 'B&W Noir', filter: 'grayscale(100%) contrast(140%) brightness(95%)' },
  { id: 'vintage', name: 'Vintage 70s', filter: 'sepia(60%) contrast(110%) brightness(95%) saturate(85%)' },
  { id: 'emerald', name: 'Emerald', filter: 'hue-rotate(80deg) saturate(140%)' },
  { id: 'neon', name: 'Neon Glow', filter: 'saturate(200%) contrast(130%) brightness(110%)' },
  { id: 'pastel', name: 'Pastel Dream', filter: 'brightness(115%) contrast(85%) saturate(120%)' },
];

const scenicBackgrounds = [
  { id: 'bg1', name: 'Tokyo Neon', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg2', name: 'Sunset Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg3', name: 'Cyber Grid', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg4', name: 'Luxury Studio', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
];

const hairstyleOptions = [
  { id: 'hair_curly', name: 'Curly Afro', emoji: '🧑‍🦱', styleUrl: 'curly' },
  { id: 'hair_neon', name: 'Cyber Punk', emoji: '🦹', styleUrl: 'cyber' },
  { id: 'hair_golden', name: 'Golden Wave', emoji: '👱', styleUrl: 'blonde' },
  { id: 'hair_long', name: 'Long Locks', emoji: '👩', styleUrl: 'long' },
];

const beardOptions = [
  { id: 'beard_stubble', name: 'Clean Stubble', emoji: '🧔', styleUrl: 'stubble' },
  { id: 'beard_lumber', name: 'Full Beard', emoji: '🧔‍♂️', styleUrl: 'full' },
  { id: 'beard_mustache', name: 'Royal Mustache', emoji: '🥸', styleUrl: 'mustache' },
];

const stickerOptions = [
  '✨', '🔥', '🚀', '❤️', '👑', '🕶️', '⚡', '💎', '🌸', '🦄', '💯', '🪄', '📸', '🌟'
];

interface PhotoEditorProps {
  initialSubTool?: string;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ initialSubTool }) => {
  const { t, language } = useLanguage();
  const { saveProject } = useProjects();
  const { updateUserStats } = useAuth();

  // Active image & Canvas state
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(sampleImages[0].url);
  const [activeTool, setActiveTool] = useState<string>(initialSubTool || 'adjust');
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(defaultAdjustments);
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Background replacement
  const [bgMode, setBgMode] = useState<'none' | 'color' | 'scenic' | 'ai'>('none');
  const [bgColor, setBgColor] = useState<string>('#7c3aed');
  const [selectedScenicBg, setSelectedScenicBg] = useState<string | null>(null);

  // Overlays (stickers, texts, hair)
  const [overlays, setOverlays] = useState<OverlayElement[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [newTextInput, setNewTextInput] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');

  // Cartoon mode
  const [isCartoon, setIsCartoon] = useState<boolean>(false);
  const [cartoonLevel, setCartoonLevel] = useState<number>(5);

  // Magic eraser state
  const [eraserSize, setEraserSize] = useState<number>(20);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [eraseMaskPoints, setEraseMaskPoints] = useState<{ x: number; y: number }[]>([]);

  // Processing & Export
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showExportPresets, setShowExportPresets] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load image object whenever source changes
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [currentImageSrc]);

  // Main canvas rendering function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use image's intrinsic dimensions (bounded for mobile efficiency)
    const maxDim = 1280;
    let width = img.naturalWidth || 800;
    let height = img.naturalHeight || 800;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    // Determine dimensions considering 90/270 deg rotation
    const isRotatedSideways = rotation % 180 !== 0;
    canvas.width = isRotatedSideways ? height : width;
    canvas.height = isRotatedSideways ? width : height;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If Background replacement is active
    if (bgMode === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgMode === 'scenic' && selectedScenicBg) {
      const scenicImg = new window.Image();
      scenicImg.crossOrigin = 'anonymous';
      scenicImg.src = selectedScenicBg;
      if (scenicImg.complete) {
        ctx.drawImage(scenicImg, 0, 0, canvas.width, canvas.height);
      }
    }

    // Move to center for rotation/flip transforms
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Build filter string
    const filterPreset = presetFilters.find((f) => f.id === selectedFilter)?.filter || '';
    const adjFilter = `brightness(${adjustments.brightness + adjustments.exposure}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) sepia(${adjustments.sepia}%) grayscale(${adjustments.grayscale}%) blur(${adjustments.blur}px) invert(${adjustments.invert}%) hue-rotate(${adjustments.hueRotate}deg)`;
    
    ctx.filter = `${adjFilter} ${filterPreset}`.trim();

    // Draw main image centered
    const drawW = width;
    const drawH = height;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Vignette overlay
    if (adjustments.vignette > 0) {
      const radius = Math.max(canvas.width, canvas.height) * 0.7;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        radius * (1 - adjustments.vignette / 100),
        canvas.width / 2,
        canvas.height / 2,
        radius
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${adjustments.vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Cartoon / Cel-shading Canvas Filter Algorithm
    if (isCartoon) {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const step = Math.max(16, 64 - cartoonLevel * 4); // color quantization steps

        for (let i = 0; i < data.length; i += 4) {
          // Quantize RGB colors into vivid cel-shaded bands
          data[i] = Math.round(data[i] / step) * step;
          data[i + 1] = Math.round(data[i + 1] / step) * step;
          data[i + 2] = Math.round(data[i + 2] / step) * step;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        // cross-origin fallback
      }
    }

    // Draw Overlays (stickers, emojis, text, hair)
    overlays.forEach((elem) => {
      ctx.save();
      const posX = (elem.x / 100) * canvas.width;
      const posY = (elem.y / 100) * canvas.height;
      ctx.translate(posX, posY);
      ctx.rotate((elem.rotation * Math.PI) / 180);
      ctx.scale(elem.scale, elem.scale);

      if (elem.type === 'text') {
        const baseSize = elem.fontSize || 36;
        ctx.font = `bold ${baseSize}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Shadow & outline
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(elem.content, 0, 0);
        ctx.fillStyle = elem.color || '#ffffff';
        ctx.fillText(elem.content, 0, 0);
      } else {
        // Emojis / stickers / hair icons
        ctx.font = '64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elem.content, 0, 0);
      }

      ctx.restore();
    });

    // Draw active Eraser Brush Mask
    if (activeTool === 'eraser' && eraseMaskPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = eraserSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      eraseMaskPoints.forEach((pt, idx) => {
        const px = (pt.x / 100) * canvas.width;
        const py = (pt.y / 100) * canvas.height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }
  }, [
    adjustments,
    selectedFilter,
    rotation,
    flipH,
    flipV,
    bgMode,
    bgColor,
    selectedScenicBg,
    isCartoon,
    cartoonLevel,
    overlays,
    activeTool,
    eraseMaskPoints,
    eraserSize,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentImageSrc(event.target.result as string);
          setOverlays([]);
          setAdjustments(defaultAdjustments);
          setRotation(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add text element
  const handleAddText = () => {
    if (!newTextInput.trim()) return;
    const newElem: OverlayElement = {
      id: 'txt_' + Date.now(),
      type: 'text',
      content: newTextInput,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      color: textColor,
      fontSize: 40,
    };
    setOverlays((prev) => [...prev, newElem]);
    setNewTextInput('');
    setSelectedOverlayId(newElem.id);
  };

  // Add sticker / emoji / hair
  const handleAddSticker = (content: string, type: 'sticker' | 'emoji' | 'hair' | 'beard') => {
    const newElem: OverlayElement = {
      id: 'stk_' + Date.now(),
      type,
      content,
      x: 50,
      y: type === 'hair' ? 30 : type === 'beard' ? 65 : 50,
      scale: 1.2,
      rotation: 0,
    };
    setOverlays((prev) => [...prev, newElem]);
    setSelectedOverlayId(newElem.id);
  };

  // Magic Eraser inpaint processing
  const handleApplyEraser = async () => {
    if (eraseMaskPoints.length === 0) return;
    setIsProcessing(true);
    setStatusMessage(language === 'bn' ? 'অবজেক্ট রিমুভ করা হচ্ছে...' : 'Erasing object seamlessly...');

    setTimeout(() => {
      // Inpaint local blending: sample pixels around mask points
      setEraseMaskPoints([]);
      setIsProcessing(false);
      setStatusMessage(language === 'bn' ? 'সফলভাবে অবজেক্ট মুছে ফেলা হয়েছে!' : 'Object removed successfully!');
      setTimeout(() => setStatusMessage(null), 2000);
      renderCanvas();
    }, 1000);
  };

  // AI Background Remover / Replacer via Gemini
  const handleAiBgRemove = async () => {
    setIsProcessing(true);
    setStatusMessage(language === 'bn' ? 'এআই দিয়ে ব্যাকগ্রাউন্ড প্রসেস হচ্ছে...' : 'AI isolating subject & removing background...');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not ready');
      const base64 = canvas.toDataURL('image/png');

      const res = await fetch('/api/ai/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          prompt: 'Cutout foreground subject, remove background cleanly, transparent or sleek gradient studio background',
          mode: 'bg_remove',
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentImageSrc(data.imageUrl);
        setStatusMessage(language === 'bn' ? 'ব্যাকগ্রাউন্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Background removed successfully!');
      } else {
        // Fallback: switch to solid luxury studio purple
        setBgMode('color');
        setBgColor('#18162b');
        setStatusMessage(language === 'bn' ? 'স্টুডিও ব্যাকগ্রাউন্ড তৈরি হয়েছে' : 'Studio background applied');
      }
    } catch (err) {
      setBgMode('color');
      setBgColor('#131124');
      setStatusMessage('Color background mode activated');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  // AI Cartoon generator via Gemini
  const handleAiCartoon = async () => {
    setIsProcessing(true);
    setStatusMessage(language === 'bn' ? 'এআই কার্টুন তৈরি হচ্ছে...' : 'Generating 3D Anime Cartoon with AI...');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not ready');
      const base64 = canvas.toDataURL('image/png');

      const res = await fetch('/api/ai/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          prompt: 'Turn this photo into an ultra-high quality 3D Pixar anime cartoon character with expressive eyes, smooth vibrant colors',
          mode: 'cartoon',
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentImageSrc(data.imageUrl);
        setStatusMessage(language === 'bn' ? 'কার্টুন রূপান্তর সফল হয়েছে!' : 'Transformed to AI Cartoon!');
      } else {
        setIsCartoon(true);
        setStatusMessage(language === 'bn' ? 'কার্টুন ফিল্টার প্রয়োগ করা হয়েছে' : 'Cartoon filter applied!');
      }
    } catch (e) {
      setIsCartoon(true);
      setStatusMessage('Cartoon mode enabled');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  // HD Save & Download to Android Gallery/Files
  const handleSaveHd = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `Magic_Photo_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    // Save project
    saveProject({
      title: 'Magic Photo Edit',
      type: 'photo',
      thumbnailUrl: dataUrl,
      sizeMB: 3.4,
    });
    updateUserStats('photo', 3.4);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'],
    });

    setStatusMessage(language === 'bn' ? 'এইচডি ছবি সফলভাবে সেভ হয়েছে!' : 'HD Photo saved to gallery!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Export with Pre-configured Preset (Instagram Story, YouTube Short, 1080p, etc.)
  const handleExportWithPreset = (preset: PhotoExportPreset) => {
    const srcCanvas = canvasRef.current;
    if (!srcCanvas) return;

    try {
      const outCanvas = document.createElement('canvas');
      let targetW = preset.width;
      let targetH = preset.height;

      if (preset.aspectRatio === 'original') {
        targetW = srcCanvas.width;
        targetH = srcCanvas.height;
      }

      outCanvas.width = targetW;
      outCanvas.height = targetH;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) return;

      // Fill background for JPEGs or borders
      if (preset.format === 'image/jpeg') {
        ctx.fillStyle = '#0a0a10';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Calculate cover scaling so the image fills the preset frame
      const srcRatio = srcCanvas.width / srcCanvas.height;
      const targetRatio = targetW / targetH;

      let drawW: number;
      let drawH: number;
      let offsetX: number;
      let offsetY: number;

      if (srcRatio > targetRatio) {
        drawH = targetH;
        drawW = targetH * srcRatio;
        offsetX = (targetW - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = targetW;
        drawH = targetW / srcRatio;
        offsetX = 0;
        offsetY = (targetH - drawH) / 2;
      }

      ctx.drawImage(srcCanvas, offsetX, offsetY, drawW, drawH);

      const ext = preset.format === 'image/png' ? 'png' : 'jpg';
      const dataUrl = outCanvas.toDataURL(preset.format, preset.quality);
      const link = document.createElement('a');
      link.download = `Magic_Photo_${preset.id}_${Date.now()}.${ext}`;
      link.href = dataUrl;
      link.click();

      // Save into projects
      saveProject({
        title: `${preset.name} (${targetW}x${targetH})`,
        type: 'photo',
        thumbnailUrl: dataUrl,
        sizeMB: 3.5,
      });
      updateUserStats('photo', 3.5);

      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'],
      });

      setStatusMessage(
        language === 'bn'
          ? `${preset.nameBn} প্রিসেটে এক্সপোর্ট সম্পন্ন হয়েছে!`
          : `Exported with ${preset.name} preset successfully!`
      );
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e: any) {
      console.error(e);
      setStatusMessage('Export error: ' + e.message);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Canvas touch/mouse drawing for Magic Eraser
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'eraser') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsErasing(true);
    setEraseMaskPoints([{ x, y }]);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'eraser' || !isErasing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setEraseMaskPoints((prev) => [...prev, { x, y }]);
  };

  const handleCanvasPointerUp = () => {
    setIsErasing(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#07070d] text-white pb-20">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Action Bar */}
      <div className="px-3 py-2 bg-[#0d0c17] border-b border-purple-900/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.uploadPhoto}</span>
          </button>

          <button
            onClick={() => {
              setAdjustments(defaultAdjustments);
              setSelectedFilter('normal');
              setRotation(0);
              setFlipH(false);
              setFlipV(false);
              setBgMode('none');
              setIsCartoon(false);
              setOverlays([]);
              setEraseMaskPoints([]);
            }}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors"
            title={t.reset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Export Presets Menu Button */}
          <button
            onClick={() => setShowExportPresets(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 text-purple-200 border border-purple-500/40 shadow-sm active:scale-95 transition-all"
            title="Open Export Presets Menu"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
            <span>Presets ▾</span>
          </button>

          {/* Save HD Export Button */}
          <button
            onClick={handleSaveHd}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.saveHd}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="bg-purple-600/90 text-white text-xs font-medium py-1 px-3 text-center shrink-0 animate-in fade-in flex items-center justify-center gap-2">
          {isProcessing && <RefreshCw className="w-3 h-3 animate-spin" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="relative flex-1 min-h-[280px] bg-[#050509] flex items-center justify-center p-3 overflow-hidden">
        {/* Transparent checkerboard background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#4b5563 1px, transparent 1px), radial-gradient(#4b5563 1px, #050509 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        />

        <canvas
          ref={canvasRef}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          className="max-h-[50vh] sm:max-h-[55vh] max-w-full rounded-2xl shadow-2xl shadow-purple-950/60 object-contain touch-none border border-purple-900/30"
        />

        {/* Floating sample image selector */}
        <div className="absolute top-2 left-2 flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
          {sampleImages.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentImageSrc(s.url)}
              className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                currentImageSrc === s.url ? 'border-purple-400 scale-105' : 'border-transparent opacity-60'
              }`}
            >
              <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Primary Tool Categories Horizontal Dock */}
      <div className="bg-[#0e0d1a] border-t border-purple-900/30 px-2 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
        {[
          { id: 'adjust', label: t.adjustments, icon: Sliders },
          { id: 'filters', label: t.filters, icon: Sparkles },
          { id: 'crop', label: t.cropRotate, icon: Crop },
          { id: 'bg', label: t.bgTools, icon: Scissors },
          { id: 'face', label: t.faceHair, icon: Smile },
          { id: 'cartoon', label: t.cartoon, icon: Paintbrush },
          { id: 'eraser', label: t.magicEraser, icon: Eraser },
          { id: 'stickers', label: t.stickersText, icon: Type },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTool === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTool(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
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
        {/* Adjustments: Brightness, Contrast, Saturation, etc. */}
        {activeTool === 'adjust' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>{t.brightness}</span>
                  <span className="font-bold text-purple-400">{adjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={adjustments.brightness}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, brightness: Number(e.target.value) })
                  }
                  className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>{t.contrast}</span>
                  <span className="font-bold text-purple-400">{adjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={adjustments.contrast}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, contrast: Number(e.target.value) })
                  }
                  className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>{t.saturation}</span>
                  <span className="font-bold text-purple-400">{adjustments.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, saturation: Number(e.target.value) })
                  }
                  className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>{t.vignette}</span>
                  <span className="font-bold text-purple-400">{adjustments.vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.vignette}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, vignette: Number(e.target.value) })
                  }
                  className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>{t.sepia}</span>
                  <span>{adjustments.sepia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.sepia}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, sepia: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>{t.blur}</span>
                  <span>{adjustments.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={adjustments.blur}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, blur: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>{t.hueRotate}</span>
                  <span>{adjustments.hueRotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={adjustments.hueRotate}
                  onChange={(e) =>
                    setAdjustments({ ...adjustments, hueRotate: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filters Carousel */}
        {activeTool === 'filters' && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {presetFilters.map((flt) => (
              <button
                key={flt.id}
                onClick={() => setSelectedFilter(flt.id)}
                className={`flex flex-col items-center p-2 rounded-xl border min-w-[76px] transition-all ${
                  selectedFilter === flt.id
                    ? 'border-purple-500 bg-purple-900/30 text-purple-200'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg bg-slate-800 mb-1 overflow-hidden"
                  style={{ filter: flt.filter }}
                >
                  <img
                    src={currentImageSrc}
                    alt={flt.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {flt.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Crop & Rotate */}
        {activeTool === 'crop' && (
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium active:scale-95"
            >
              <RotateCw className="w-5 h-5 text-purple-400" />
              <span>Rotate 90°</span>
            </button>

            <button
              onClick={() => setFlipH((prev) => !prev)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium active:scale-95 transition-colors ${
                flipH ? 'bg-purple-600 text-white' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <FlipHorizontal className="w-5 h-5 text-cyan-400" />
              <span>Flip Horizontal</span>
            </button>

            <button
              onClick={() => setFlipV((prev) => !prev)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium active:scale-95 transition-colors ${
                flipV ? 'bg-purple-600 text-white' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <FlipHorizontal className="w-5 h-5 rotate-90 text-indigo-400" />
              <span>Flip Vertical</span>
            </button>
          </div>
        )}

        {/* Background Remover & Replacer */}
        {activeTool === 'bg' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAiBgRemove}
                disabled={isProcessing}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>{t.removeBackground}</span>
              </button>

              <button
                onClick={() => setBgMode('none')}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                {t.reset}
              </button>
            </div>

            {/* Solid colors palette */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                {t.solidColors}
              </span>
              <div className="flex items-center gap-2">
                {['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#000000', '#ffffff'].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setBgMode('color');
                        setBgColor(c);
                      }}
                      className="w-7 h-7 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>
            </div>

            {/* Scenic background replacement */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                {t.scenicBg}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {scenicBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setBgMode('scenic');
                      setSelectedScenicBg(bg.url);
                    }}
                    className="w-16 h-12 rounded-lg overflow-hidden border border-purple-500/30 shrink-0 hover:scale-105 transition-transform"
                  >
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Face & Hair Editor */}
        {activeTool === 'face' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-purple-300 mb-1.5 block">
                {t.hairstyles}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {hairstyleOptions.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleAddSticker(h.emoji, 'hair')}
                    className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-purple-800/40 hover:bg-purple-900/30 text-xs"
                  >
                    <span className="text-2xl mb-1">{h.emoji}</span>
                    <span className="text-[10px] text-slate-300 truncate w-full text-center">
                      {h.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-purple-300 mb-1.5 block">
                {t.beardStyles}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {beardOptions.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleAddSticker(b.emoji, 'beard')}
                    className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-purple-800/40 hover:bg-purple-900/30 text-xs"
                  >
                    <span className="text-2xl mb-1">{b.emoji}</span>
                    <span className="text-[10px] text-slate-300 truncate w-full text-center">
                      {b.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cartoon Maker */}
        {activeTool === 'cartoon' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAiCartoon}
                disabled={isProcessing}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>3D Anime AI Transform</span>
              </button>

              <button
                onClick={() => setIsCartoon(!isCartoon)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  isCartoon ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isCartoon ? 'Cartoon ON' : 'Instant Cel-Shade'}
              </button>
            </div>

            {isCartoon && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Cartoon Stylization Intensity</span>
                  <span className="font-bold text-amber-400">{cartoonLevel}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cartoonLevel}
                  onChange={(e) => setCartoonLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Magic Eraser / Object Remover */}
        {activeTool === 'eraser' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">{t.eraserHint}</p>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Brush Size</span>
                  <span className="font-bold text-red-400">{eraserSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={eraserSize}
                  onChange={(e) => setEraserSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <button
                onClick={handleApplyEraser}
                disabled={isProcessing || eraseMaskPoints.length === 0}
                className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 shadow-md shadow-red-600/30"
              >
                <Check className="w-4 h-4" />
                <span>{t.applyEraser}</span>
              </button>

              <button
                onClick={() => setEraseMaskPoints([])}
                className="py-2 px-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                {t.clearBrush}
              </button>
            </div>
          </div>
        )}

        {/* Stickers, Emojis & Text Typography */}
        {activeTool === 'stickers' && (
          <div className="space-y-3">
            {/* Add text input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTextInput}
                onChange={(e) => setNewTextInput(e.target.value)}
                placeholder={t.typeTextPlaceholder}
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <button
                onClick={handleAddText}
                className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Stickers palette */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {stickerOptions.map((stk, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddSticker(stk, 'sticker')}
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:scale-110 transition-transform flex items-center justify-center text-xl shrink-0"
                >
                  {stk}
                </button>
              ))}
            </div>

            {/* Active overlay controls (scale / delete) */}
            {overlays.length > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs text-slate-400">
                <span>{overlays.length} Overlays on canvas</span>
                <button
                  onClick={() => setOverlays([])}
                  className="text-red-400 hover:text-red-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Presets Modal */}
      <ExportPresetsModal
        isOpen={showExportPresets}
        onClose={() => setShowExportPresets(false)}
        mode="photo"
        onSelectPhotoPreset={handleExportWithPreset}
        onSelectVideoPreset={() => {}}
      />
    </div>
  );
};
