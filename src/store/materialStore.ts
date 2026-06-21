import { create } from 'zustand';
import { MaterialConfig } from './editorStore';

export interface MaterialPreset {
  id: string;
  name: string;
  category: string;
  config: MaterialConfig;
}

interface MaterialState {
  presets: MaterialPreset[];
  activeMaterial: MaterialPreset | null;
  setActiveMaterial: (preset: MaterialPreset | null) => void;
}

const DEFAULT_PRESETS: MaterialPreset[] = [
  // Concrete & Masonry
  { id: 'concrete-light', name: 'Light Concrete', category: 'Concrete', config: { color: '#c8c0b8', roughness: 0.9, metalness: 0, opacity: 1, transparent: false } },
  { id: 'concrete-dark', name: 'Dark Concrete', category: 'Concrete', config: { color: '#7a7570', roughness: 0.85, metalness: 0, opacity: 1, transparent: false } },
  { id: 'brick-red', name: 'Red Brick', category: 'Masonry', config: { color: '#8b4513', roughness: 0.8, metalness: 0, opacity: 1, transparent: false } },
  { id: 'brick-white', name: 'White Brick', category: 'Masonry', config: { color: '#f0ead6', roughness: 0.75, metalness: 0, opacity: 1, transparent: false } },
  // Wood
  { id: 'wood-oak', name: 'Oak Wood', category: 'Wood', config: { color: '#b5882c', roughness: 0.6, metalness: 0, opacity: 1, transparent: false } },
  { id: 'wood-walnut', name: 'Walnut', category: 'Wood', config: { color: '#5c4033', roughness: 0.55, metalness: 0, opacity: 1, transparent: false } },
  { id: 'wood-pine', name: 'Pine', category: 'Wood', config: { color: '#deb887', roughness: 0.65, metalness: 0, opacity: 1, transparent: false } },
  { id: 'wood-cherry', name: 'Cherry', category: 'Wood', config: { color: '#9b4722', roughness: 0.5, metalness: 0, opacity: 1, transparent: false } },
  // Metal
  { id: 'metal-steel', name: 'Steel', category: 'Metal', config: { color: '#8a8a8a', roughness: 0.3, metalness: 0.9, opacity: 1, transparent: false } },
  { id: 'metal-aluminum', name: 'Aluminum', category: 'Metal', config: { color: '#d4d4d8', roughness: 0.25, metalness: 0.85, opacity: 1, transparent: false } },
  { id: 'metal-copper', name: 'Copper', category: 'Metal', config: { color: '#b87333', roughness: 0.35, metalness: 0.8, opacity: 1, transparent: false } },
  { id: 'metal-gold', name: 'Brass', category: 'Metal', config: { color: '#cd9b1d', roughness: 0.3, metalness: 0.75, opacity: 1, transparent: false } },
  // Glass
  { id: 'glass-clear', name: 'Clear Glass', category: 'Glass', config: { color: '#88ccff', roughness: 0.05, metalness: 0.1, opacity: 0.3, transparent: true } },
  { id: 'glass-frosted', name: 'Frosted Glass', category: 'Glass', config: { color: '#e8f0f8', roughness: 0.6, metalness: 0.05, opacity: 0.5, transparent: true } },
  { id: 'glass-tinted', name: 'Tinted Glass', category: 'Glass', config: { color: '#2a5a8a', roughness: 0.05, metalness: 0.15, opacity: 0.4, transparent: true } },
  // Stone & Tile
  { id: 'marble-white', name: 'White Marble', category: 'Stone', config: { color: '#f5f0e8', roughness: 0.2, metalness: 0.05, opacity: 1, transparent: false } },
  { id: 'marble-black', name: 'Black Marble', category: 'Stone', config: { color: '#2a2a2a', roughness: 0.15, metalness: 0.08, opacity: 1, transparent: false } },
  { id: 'granite', name: 'Granite', category: 'Stone', config: { color: '#808080', roughness: 0.4, metalness: 0.05, opacity: 1, transparent: false } },
  { id: 'tile-white', name: 'White Tile', category: 'Tile', config: { color: '#f8f8f0', roughness: 0.2, metalness: 0.02, opacity: 1, transparent: false } },
  { id: 'tile-terracotta', name: 'Terracotta', category: 'Tile', config: { color: '#cc5533', roughness: 0.7, metalness: 0, opacity: 1, transparent: false } },
  // Paint
  { id: 'paint-white', name: 'White Paint', category: 'Paint', config: { color: '#fafafa', roughness: 0.5, metalness: 0, opacity: 1, transparent: false } },
  { id: 'paint-cream', name: 'Cream', category: 'Paint', config: { color: '#fffdd0', roughness: 0.5, metalness: 0, opacity: 1, transparent: false } },
  { id: 'paint-sage', name: 'Sage Green', category: 'Paint', config: { color: '#9caf88', roughness: 0.5, metalness: 0, opacity: 1, transparent: false } },
  { id: 'paint-navy', name: 'Navy Blue', category: 'Paint', config: { color: '#1a2744', roughness: 0.5, metalness: 0, opacity: 1, transparent: false } },
  { id: 'paint-charcoal', name: 'Charcoal', category: 'Paint', config: { color: '#36454f', roughness: 0.5, metalness: 0, opacity: 1, transparent: false } },
];

export const useMaterialStore = create<MaterialState>((set) => ({
  presets: DEFAULT_PRESETS,
  activeMaterial: null,
  setActiveMaterial: (preset) => set({ activeMaterial: preset }),
}));
