'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  MousePointer2,
  Move,
  RotateCcw,
  Maximize2,
  Square,
  Layers,
  DoorOpen,
  AppWindow,
  Triangle,
  ArrowUpRight,
  Armchair,
  Trash2,
  Undo2,
  Redo2,
  Grid3x3,
  Magnet,
  Save,
  Download,
  Eye,
  EyeOff,
  Copy,
  FileJson,
  Camera,
  X,
} from 'lucide-react';
import { useEditorStore, ToolType } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { exportGLTF, exportOBJ } from '@/utils/exporters';
import styles from './CommandPalette.module.css';

interface Command {
  id: string;
  label: string;
  category: string;
  icon: LucideIcon;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette() {
  const show = useEditorStore((s) => s.showCommandPalette);
  const setShow = useEditorStore((s) => s.setShowCommandPalette);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const clearScene = useEditorStore((s) => s.clearScene);
  const objects = useEditorStore((s) => s.objects);
  const saveProject = useProjectStore((s) => s.saveProject);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      // Tools
      { id: 'select', label: 'Select Tool', category: 'Tools', icon: MousePointer2, shortcut: 'V', action: () => setActiveTool('select') },
      { id: 'move', label: 'Move Tool', category: 'Tools', icon: Move, shortcut: 'G', action: () => setActiveTool('move') },
      { id: 'rotate', label: 'Rotate Tool', category: 'Tools', icon: RotateCcw, shortcut: 'R', action: () => setActiveTool('rotate') },
      { id: 'scale', label: 'Scale Tool', category: 'Tools', icon: Maximize2, shortcut: 'S', action: () => setActiveTool('scale') },
      { id: 'delete-tool', label: 'Delete Tool', category: 'Tools', icon: Trash2, shortcut: 'X', action: () => setActiveTool('delete') },
      // Create
      { id: 'wall', label: 'Add Wall', category: 'Create', icon: Square, shortcut: 'W', action: () => setActiveTool('wall' as ToolType) },
      { id: 'floor', label: 'Add Floor', category: 'Create', icon: Layers, shortcut: 'F', action: () => setActiveTool('floor' as ToolType) },
      { id: 'door', label: 'Add Door', category: 'Create', icon: DoorOpen, shortcut: 'D', action: () => setActiveTool('door' as ToolType) },
      { id: 'window', label: 'Add Window', category: 'Create', icon: AppWindow, action: () => setActiveTool('window' as ToolType) },
      { id: 'roof', label: 'Add Roof', category: 'Create', icon: Triangle, action: () => setActiveTool('roof' as ToolType) },
      { id: 'stairs', label: 'Add Stairs', category: 'Create', icon: ArrowUpRight, action: () => setActiveTool('stairs' as ToolType) },
      { id: 'furniture', label: 'Add Furniture', category: 'Create', icon: Armchair, action: () => setActiveTool('furniture' as ToolType) },
      // Edit
      { id: 'undo', label: 'Undo', category: 'Edit', icon: Undo2, shortcut: '⌘Z', action: undo },
      { id: 'redo', label: 'Redo', category: 'Edit', icon: Redo2, shortcut: '⌘⇧Z', action: redo },
      { id: 'delete', label: 'Delete Selected', category: 'Edit', icon: Trash2, shortcut: 'Del', action: deleteSelected },
      { id: 'duplicate', label: 'Duplicate Selected', category: 'Edit', icon: Copy, shortcut: '⌘D', action: duplicateSelected },
      { id: 'clear', label: 'Clear Scene', category: 'Edit', icon: X, action: clearScene },
      // View
      { id: 'view-3d', label: '3D Perspective View', category: 'View', icon: Eye, action: () => setViewMode('3d') },
      { id: 'view-2d', label: '2D Floor Plan View', category: 'View', icon: Layers, action: () => setViewMode('2d') },
      { id: 'view-walk', label: 'Walkthrough Mode', category: 'View', icon: Eye, action: () => setViewMode('walkthrough') },
      { id: 'grid', label: 'Toggle Grid', category: 'View', icon: Grid3x3, shortcut: 'H', action: toggleGrid },
      { id: 'snap', label: 'Toggle Snap', category: 'View', icon: Magnet, shortcut: 'N', action: toggleSnap },
      // File
      { id: 'save', label: 'Save Project', category: 'File', icon: Save, shortcut: '⌘S', action: () => saveProject(objects) },
      { id: 'export-gltf', label: 'Export as GLTF', category: 'File', icon: Download, action: () => { /* handled in viewport */ } },
      { id: 'export-json', label: 'Export as JSON', category: 'File', icon: FileJson, action: () => { /* handled separately */ } },
      { id: 'screenshot', label: 'Take Screenshot', category: 'File', icon: Camera, action: () => { /* handled in viewport */ } },
    ],
    [setActiveTool, setViewMode, undo, redo, deleteSelected, duplicateSelected, toggleGrid, toggleSnap, clearScene, saveProject, objects]
  );

  const filtered = useMemo(() => {
    if (!query) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.category.toLowerCase().includes(lower)
    );
  }, [query, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (show) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [show]);

  const executeCommand = useCallback(
    (cmd: Command) => {
      cmd.action();
      setShow(false);
    },
    [setShow]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShow(false);
      }
    },
    [filtered, selectedIndex, executeCommand, setShow]
  );

  if (!show) return null;

  // Group by category
  const groups: Record<string, Command[]> = {};
  filtered.forEach((cmd) => {
    if (!groups[cmd.category]) groups[cmd.category] = [];
    groups[cmd.category].push(cmd);
  });

  let flatIndex = 0;

  return (
    <div className={styles.overlay} onClick={() => setShow(false)}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        <div className={styles.results}>
          {Object.entries(groups).map(([category, cmds]) => (
            <div key={category}>
              <div className={styles.category}>{category}</div>
              {cmds.map((cmd) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={cmd.id}
                    className={`${styles.item} ${idx === selectedIndex ? styles.itemActive : ''}`}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className={styles.itemLeft}>
                      <cmd.icon size={16} />
                      <span>{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.empty}>No commands found</div>
          )}
        </div>
      </div>
    </div>
  );
}
