export type Language = 'en' | 'bn';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isPro: boolean;
  projectsCount: number;
  exportsCount: number;
  storageUsedMB: number;
}

export type ActiveTab = 'home' | 'photo' | 'video' | 'ai' | 'dashboard' | 'templates';

export interface PhotoAdjustments {
  brightness: number; // 50 to 150, default 100
  contrast: number;   // 50 to 150, default 100
  saturation: number; // 0 to 200, default 100
  sepia: number;      // 0 to 100, default 0
  grayscale: number;  // 0 to 100, default 0
  blur: number;       // 0 to 20, default 0
  invert: number;     // 0 to 100, default 0
  hueRotate: number;  // 0 to 360, default 0
  exposure: number;   // -50 to 50, default 0
  vignette: number;   // 0 to 100, default 0
}

export interface OverlayElement {
  id: string;
  type: 'text' | 'sticker' | 'emoji' | 'hair' | 'beard';
  content: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface VideoSubtitle {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  color: string;
  fontSize: number;
}

export interface SavedProject {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'ai';
  thumbnailUrl: string;
  createdAt: string;
  sizeMB: number;
  dataUrl?: string;
}

export type TemplateCategory = 'social' | 'collage' | 'intro' | 'reels' | 'portrait';

export interface TemplateSlot {
  id: string;
  defaultUrl: string;
  label?: string;
}

export interface TemplateTextLayer {
  id: string;
  defaultText: string;
  defaultTextBn?: string;
  style: 'title' | 'subtitle' | 'badge' | 'caption';
  color: string;
  fontSize?: number;
}

export interface TemplateVideoConfig {
  defaultVideoUrl: string;
  duration: number;
  soundTrack?: string;
  introAnimation: 'neon' | 'glitch' | 'zoom' | 'cinematic' | 'luxury';
}

export interface TemplateItem {
  id: string;
  title: string;
  titleBn: string;
  category: TemplateCategory;
  thumbnailUrl: string;
  aspectRatio: '1:1' | '9:16' | '16:9' | '4:5';
  type: 'photo' | 'video' | 'collage';
  description: string;
  descriptionBn: string;
  badge?: string;
  slots?: TemplateSlot[];
  textLayers?: TemplateTextLayer[];
  videoConfig?: TemplateVideoConfig;
  collageLayout?: 'split-2' | 'grid-3' | 'grid-4' | 'featured-3' | 'grid-6';
}

export interface PhotoExportPreset {
  id: string;
  name: string;
  nameBn: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Universal';
  aspectRatio: '9:16' | '1:1' | '4:5' | '16:9' | 'original';
  width: number;
  height: number;
  format: 'image/png' | 'image/jpeg';
  quality: number;
  description: string;
  descriptionBn: string;
  badge: string;
}

export interface VideoExportPreset {
  id: string;
  name: string;
  nameBn: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'Universal';
  aspectRatio: '9:16' | '16:9' | '1:1';
  width: number;
  height: number;
  bitrate: number;
  fps: number;
  description: string;
  descriptionBn: string;
  badge: string;
}


