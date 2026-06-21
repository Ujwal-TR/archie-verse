'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  Square,
  Layers,
  ArrowUpRight,
  Triangle,
  DoorOpen,
  AppWindow,
  Armchair,
  Sofa,
  BedDouble,
  PanelLeftClose,
  PanelLeftOpen,
  Building,
  LayoutGrid,
  Cylinder,
  Minus,
  Fence,
  Bath,
  CookingPot,
  Lamp,
  Flower2,
  BookOpen,
  Tv,
  Refrigerator,
  CircleDot,
} from 'lucide-react';
import { useEditorStore, type SceneObject } from '@/store/editorStore';
import styles from './LeftSidebar.module.css';

interface LibraryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  objectType: SceneObject['type'];
  subType?: string;
  defaults: {
    dimensions: Record<string, number>;
    material?: { color: string; roughness: number; metalness: number; opacity: number; transparent: boolean };
  };
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: LibraryItem[];
}

const categories: Category[] = [
  {
    id: 'structural',
    label: 'Structural',
    icon: <Building size={14} />,
    items: [
      { id: 'wall', label: 'Wall', icon: <Square size={18} />, objectType: 'wall',
        defaults: { dimensions: { height: 3, length: 4, thickness: 0.2 } } },
      { id: 'floor', label: 'Floor', icon: <Layers size={18} />, objectType: 'floor',
        defaults: { dimensions: { width: 6, depth: 6, thickness: 0.15 } } },
      { id: 'column', label: 'Column', icon: <Cylinder size={18} />, objectType: 'column',
        defaults: { dimensions: { height: 3, radius: 0.2 } } },
      { id: 'beam', label: 'Beam', icon: <Minus size={18} />, objectType: 'beam',
        defaults: { dimensions: { length: 4, height: 0.3, depth: 0.3, elevation: 2.8 } } },
      { id: 'stairs', label: 'Stairs', icon: <ArrowUpRight size={18} />, objectType: 'stairs',
        defaults: { dimensions: { height: 3, width: 1.2, steps: 15 } } },
      { id: 'roof', label: 'Roof', icon: <Triangle size={18} />, objectType: 'roof',
        defaults: { dimensions: { width: 8, depth: 6, pitch: 30 } } },
    ],
  },
  {
    id: 'openings',
    label: 'Openings',
    icon: <LayoutGrid size={14} />,
    items: [
      { id: 'door', label: 'Door', icon: <DoorOpen size={18} />, objectType: 'door',
        defaults: { dimensions: { height: 2.1, width: 0.9, thickness: 0.05 } } },
      { id: 'window', label: 'Window', icon: <AppWindow size={18} />, objectType: 'window',
        defaults: { dimensions: { height: 1.2, width: 1.0, sillHeight: 0.9 } } },
      { id: 'railing', label: 'Railing', icon: <Fence size={18} />, objectType: 'railing',
        defaults: { dimensions: { length: 3, height: 1, postCount: 8 } } },
    ],
  },
  {
    id: 'furniture',
    label: 'Furniture',
    icon: <Armchair size={14} />,
    items: [
      { id: 'table', label: 'Table', icon: <CircleDot size={18} />, objectType: 'furniture', subType: 'table',
        defaults: { dimensions: { height: 0.75, width: 1.2, depth: 0.8 } } },
      { id: 'chair', label: 'Chair', icon: <Armchair size={18} />, objectType: 'furniture', subType: 'chair',
        defaults: { dimensions: { height: 0.9, width: 0.45, depth: 0.45 } } },
      { id: 'sofa', label: 'Sofa', icon: <Sofa size={18} />, objectType: 'furniture', subType: 'sofa',
        defaults: { dimensions: { height: 0.85, width: 2.0, depth: 0.9 } } },
      { id: 'bed', label: 'Bed', icon: <BedDouble size={18} />, objectType: 'furniture', subType: 'bed',
        defaults: { dimensions: { height: 0.6, width: 1.6, depth: 2.0 } } },
    ],
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    icon: <Bath size={14} />,
    items: [
      { id: 'bathtub', label: 'Bathtub', icon: <Bath size={18} />, objectType: 'bathroom', subType: 'bathtub',
        defaults: { dimensions: { width: 1.7, depth: 0.75, height: 0.6 },
          material: { color: '#f0ece4', roughness: 0.3, metalness: 0.1, opacity: 1, transparent: false } } },
      { id: 'toilet', label: 'Toilet', icon: <CircleDot size={18} />, objectType: 'bathroom', subType: 'toilet',
        defaults: { dimensions: { width: 0.4, depth: 0.55, height: 0.5 },
          material: { color: '#f0ece4', roughness: 0.3, metalness: 0.1, opacity: 1, transparent: false } } },
      { id: 'sink', label: 'Sink', icon: <CircleDot size={18} />, objectType: 'bathroom', subType: 'sink',
        defaults: { dimensions: { width: 0.5, depth: 0.4, height: 0.85 },
          material: { color: '#f0ece4', roughness: 0.3, metalness: 0.1, opacity: 1, transparent: false } } },
    ],
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    icon: <CookingPot size={14} />,
    items: [
      { id: 'counter', label: 'Counter', icon: <Minus size={18} />, objectType: 'kitchen', subType: 'counter',
        defaults: { dimensions: { width: 2, depth: 0.6, height: 0.9 } } },
      { id: 'cabinet', label: 'Cabinet', icon: <Square size={18} />, objectType: 'kitchen', subType: 'cabinet',
        defaults: { dimensions: { width: 0.6, depth: 0.4, height: 0.8 } } },
      { id: 'fridge', label: 'Fridge', icon: <Refrigerator size={18} />, objectType: 'kitchen', subType: 'fridge',
        defaults: { dimensions: { width: 0.8, depth: 0.7, height: 1.8 } } },
    ],
  },
  {
    id: 'lighting',
    label: 'Lighting',
    icon: <Lamp size={14} />,
    items: [
      { id: 'floorLamp', label: 'Floor Lamp', icon: <Lamp size={18} />, objectType: 'lighting', subType: 'floorLamp',
        defaults: { dimensions: { height: 1.6 } } },
      { id: 'ceilingLight', label: 'Ceiling Light', icon: <CircleDot size={18} />, objectType: 'lighting', subType: 'ceilingLight',
        defaults: { dimensions: { height: 0.4 } } },
    ],
  },
  {
    id: 'decor',
    label: 'Decor',
    icon: <Flower2 size={14} />,
    items: [
      { id: 'plant', label: 'Plant', icon: <Flower2 size={18} />, objectType: 'decor', subType: 'plant',
        defaults: { dimensions: { height: 0.9 },
          material: { color: '#22c55e', roughness: 0.8, metalness: 0, opacity: 1, transparent: false } } },
      { id: 'bookshelf', label: 'Bookshelf', icon: <BookOpen size={18} />, objectType: 'decor', subType: 'bookshelf',
        defaults: { dimensions: { width: 0.8, depth: 0.3, height: 1.8 } } },
      { id: 'tv', label: 'TV', icon: <Tv size={18} />, objectType: 'decor', subType: 'tv',
        defaults: { dimensions: { width: 1.2, height: 0.7 } } },
      { id: 'rug', label: 'Rug', icon: <Square size={18} />, objectType: 'decor', subType: 'rug',
        defaults: { dimensions: { width: 2, depth: 1.5 },
          material: { color: '#8b5cf6', roughness: 0.95, metalness: 0, opacity: 1, transparent: false } } },
    ],
  },
];

export default function LeftSidebar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const addObject = useEditorStore((s) => s.addObject);

  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    structural: true,
    openings: true,
    furniture: true,
    bathroom: false,
    kitchen: false,
    lighting: false,
    decor: false,
  });
  const [search, setSearch] = useState('');

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleItemClick = (item: LibraryItem) => {
    setActiveTool(item.objectType);
    addObject({
      type: item.objectType,
      subType: item.subType,
      name: item.subType
        ? `${item.subType.charAt(0).toUpperCase() + item.subType.slice(1)}`
        : `${item.objectType.charAt(0).toUpperCase() + item.objectType.slice(1)}`,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: item.defaults.dimensions,
      material: item.defaults.material ?? {
        color: '#94a3b8',
        roughness: 0.8,
        metalness: 0.1,
        opacity: 1,
        transparent: false,
      },
      locked: false,
      visible: true,
    });
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.objectType.toLowerCase().includes(q) ||
            (item.subType && item.subType.toLowerCase().includes(q))
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>Elements Library</span>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchWrapInner}>
          <Search className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search elements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredCategories.map((cat) => (
          <div key={cat.id} className={styles.category}>
            <button
              className={styles.categoryHeader}
              onClick={() => toggleCategory(cat.id)}
            >
              <span className={styles.categoryHeaderLeft}>
                {cat.icon}
                {cat.label}
              </span>
              <ChevronDown
                className={`${styles.chevron} ${
                  expandedCategories[cat.id] ? styles.expanded : ''
                }`}
              />
            </button>
            {expandedCategories[cat.id] && (
              <div className={styles.itemsGrid}>
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.itemCard} ${
                      activeTool === item.objectType ? styles.active : ''
                    }`}
                    onClick={() => handleItemClick(item)}
                    aria-label={`Add ${item.label}`}
                  >
                    <span className={styles.itemIcon}>{item.icon}</span>
                    <span className={styles.itemLabel}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
