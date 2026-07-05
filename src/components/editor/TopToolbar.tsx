'use client';

import * as THREE from 'three';
import Image from 'next/image';
import Link from 'next/link';

import React, { useState, useRef, useEffect } from 'react';
import {
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
  Upload,
  FileJson,
  FileImage,
  Box,
  Sun,
  Moon,
} from 'lucide-react';
import { useEditorStore, type ToolType, type ViewMode } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import styles from './TopToolbar.module.css';

interface ToolDef {
  id: ToolType;
  icon: React.ReactNode;
  label: string;
}

const selectionTools: ToolDef[] = [
  { id: 'select', icon: <MousePointer2 />, label: 'Select (V)' },
  { id: 'move', icon: <Move />, label: 'Move (G)' },
  { id: 'rotate', icon: <RotateCcw />, label: 'Rotate (R)' },
  { id: 'scale', icon: <Maximize2 />, label: 'Scale (S)' },
];

const architectureTools: ToolDef[] = [
  { id: 'wall', icon: <Square />, label: 'Wall (W)' },
  { id: 'floor', icon: <Layers />, label: 'Floor (F)' },
  { id: 'door', icon: <DoorOpen />, label: 'Door (D)' },
  { id: 'window', icon: <AppWindow />, label: 'Window' },
  { id: 'roof', icon: <Triangle />, label: 'Roof' },
  { id: 'stairs', icon: <ArrowUpRight />, label: 'Stairs' },
  { id: 'furniture', icon: <Armchair />, label: 'Furniture' },
];

const actionTools: ToolDef[] = [
  { id: 'delete', icon: <Trash2 />, label: 'Delete (Del)' },
];

const viewModes: { id: ViewMode; label: string }[] = [
  { id: '3d', label: '3D' },
  { id: '2d', label: '2D' },
  { id: 'walkthrough', label: 'Walk' },
];

export default function TopToolbar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const showGrid = useEditorStore((s) => s.showGrid);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const theme = useEditorStore((s) => s.theme);
  const toggleTheme = useEditorStore((s) => s.toggleTheme);
  const objects = useEditorStore((s) => s.objects);
  const loadScene = useEditorStore((s) => s.loadScene);

  const saveProject = useProjectStore((s) => s.saveProject);
  const exportProjectJSON = useProjectStore((s) => s.exportProjectJSON);
  const importProjectJSON = useProjectStore((s) => s.importProjectJSON);

  const [exportOpen, setExportOpen] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    // Use a microtask delay so the current click that opened the menu doesn't immediately close it
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [exportOpen]);

  const handleSave = () => {
    saveProject(objects);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const handleExportJSON = () => {
    const json = exportProjectJSON(objects);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archieverse-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleImportClick = () => {
    setExportOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const importedObjects = importProjectJSON(content);
        if (importedObjects) {
          loadScene(importedObjects);
        } else {
          alert('Failed to import project. Invalid format.');
        }
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleExportGLTF = async () => {
    try {
      // Access the Three.js scene via the canvas
      const canvas = document.querySelector('canvas');
      if (!canvas) { alert('No 3D canvas found'); return; }

      // Import GLTF exporter dynamically from three-stdlib
      const { GLTFExporter } = await import('three-stdlib');
      const renderer = (window as any).__archieverse_renderer as THREE.WebGLRenderer | undefined;
      if (!renderer) { alert('Renderer not ready'); return; }

      // Get scene from renderer's render info — we access via internal R3F state
      // The simplest approach: grab all scene children from renderer
      const scene = renderer.domElement.parentElement?.querySelector('canvas');

      // Alternative: Build a fresh scene from our objects for clean export
      const { Scene, BoxGeometry, MeshStandardMaterial, Mesh, Group } = await import('three');
      const exportScene = new Scene();

      for (const obj of objects) {
        if (!obj.visible) continue;
        const group = new Group();
        group.position.set(...obj.position);
        const rotRad = obj.rotation.map((r: number) => (r * Math.PI) / 180) as [number, number, number];
        group.rotation.set(...rotRad);
        group.scale.set(...obj.scale);

        // Create a simple box representation for each object
        const dims = obj.dimensions;
        let w = dims.width ?? dims.length ?? 1;
        let h = dims.height ?? 1;
        let d = dims.depth ?? dims.thickness ?? 1;

        const geo = new BoxGeometry(w, h, d);
        const mat = new MeshStandardMaterial({
          color: obj.material.color || '#888888',
          roughness: obj.material.roughness ?? 0.5,
          metalness: obj.material.metalness ?? 0,
        });
        const mesh = new Mesh(geo, mat);
        mesh.position.y = h / 2; // place on ground
        mesh.name = obj.name;
        group.add(mesh);
        exportScene.add(group);
      }

      const exporter = new GLTFExporter();
      exporter.parse(
        exportScene,
        (result) => {
          let data: BlobPart;
          let ext: string;
          let mime: string;
          if (result instanceof ArrayBuffer) {
            data = result;
            ext = 'glb';
            mime = 'application/octet-stream';
          } else {
            data = JSON.stringify(result, null, 2);
            ext = 'gltf';
            mime = 'application/json';
          }
          const blob = new Blob([data], { type: mime });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `archieverse-model.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('GLTF export error:', error);
          alert('Export failed. Check console for details.');
        },
        { binary: true }
      );
    } catch (err) {
      console.error('GLTF export error:', err);
      alert('Export failed. Check console for details.');
    }
    setExportOpen(false);
  };

  const handleScreenshot = () => {
    const renderer = (window as any).__archieverse_renderer as THREE.WebGLRenderer | undefined;
    if (!renderer) { alert('Renderer not ready'); return; }
    const dataURL = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'archieverse-screenshot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExportOpen(false);
  };

  const renderGroup = (tools: ToolDef[]) =>
    tools.map((t) => (
      <button
        key={t.id}
        className={`${styles.toolBtn} ${activeTool === t.id ? styles.active : ''}`}
        onClick={() => setActiveTool(t.id)}
        aria-label={t.label}
      >
        {t.icon}
        <span className={styles.toolBtnLabel}>{t.label}</span>
      </button>
    ));

  return (
    <div className={styles.toolbar}>
      {/* ── Left: Logo ── */}
      <Link href="/" className={styles.logoSection}>
        <span className={styles.logoIcon}>✏️</span>
        <span className={styles.logoText}>ArchieVerse</span>
      </Link>

      {/* ── Center: Tools ── */}
      <div className={styles.centerSection}>
        <div className={styles.toolGroup}>{renderGroup(selectionTools)}</div>
        <div className={styles.groupSeparator} />
        <div className={styles.toolGroup}>{renderGroup(architectureTools)}</div>
        <div className={styles.groupSeparator} />
        <div className={styles.toolGroup}>{renderGroup(actionTools)}</div>
      </div>

      {/* ── Right: View, Undo/Redo, Toggles, Export, Save ── */}
      <div className={styles.rightSection}>
        {/* View mode */}
        <div className={styles.viewToggle}>
          {viewModes.map((vm) => (
            <button
              key={vm.id}
              className={`${styles.viewToggleBtn} ${viewMode === vm.id ? styles.active : ''}`}
              onClick={() => setViewMode(vm.id)}
            >
              {vm.label}
            </button>
          ))}
        </div>

        <div className={styles.separator} />

        {/* Undo / Redo */}
        <button
          className={styles.iconBtn}
          onClick={undo}
          disabled={!canUndo}
          aria-label="Undo"
        >
          <Undo2 />
          <span className={styles.toolBtnLabel}>Undo (Ctrl+Z)</span>
        </button>
        <button
          className={styles.iconBtn}
          onClick={redo}
          disabled={!canRedo}
          aria-label="Redo"
        >
          <Redo2 />
          <span className={styles.toolBtnLabel}>Redo (Ctrl+Y)</span>
        </button>

        <div className={styles.separator} />

        {/* Grid / Snap */}
        <button
          className={`${styles.iconBtn} ${showGrid ? styles.toggled : ''}`}
          onClick={toggleGrid}
          aria-label="Toggle Grid"
        >
          <Grid3x3 />
          <span className={styles.toolBtnLabel}>Grid</span>
        </button>
        <button
          className={`${styles.iconBtn} ${snapEnabled ? styles.toggled : ''}`}
          onClick={toggleSnap}
          aria-label="Toggle Snap"
        >
          <Magnet />
          <span className={styles.toolBtnLabel}>Snap</span>
        </button>

        <div className={styles.separator} />

        {/* Theme Toggle */}
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
          <span className={styles.toolBtnLabel}>Theme</span>
        </button>

        <div className={styles.separator} />

        {/* Import */}
        <button
          className={styles.iconBtn}
          onClick={handleImportClick}
          aria-label="Import"
        >
          <Upload />
          <span className={styles.toolBtnLabel}>Import</span>
        </button>

        {/* Export dropdown */}
        <div className={styles.dropdownWrap} ref={exportRef}>
          <button
            className={styles.iconBtn}
            onClick={() => setExportOpen((v) => !v)}
            aria-label="Export"
          >
            <Download />
            <span className={styles.toolBtnLabel}>Export</span>
          </button>
          {exportOpen && (
            <div className={styles.dropdownMenu}>
              <button className={styles.dropdownItem} onClick={handleExportJSON}>
                <FileJson /> Export JSON
              </button>
              <button className={styles.dropdownItem} onClick={handleExportGLTF}>
                <Box /> Export GLTF
              </button>
              <button className={styles.dropdownItem} onClick={handleScreenshot}>
                <FileImage /> Screenshot (PNG)
              </button>
            </div>
          )}
        </div>

        {/* Save */}
        <button
          className={`${styles.accentBtn} ${saveFlash ? styles.saveFlash : ''}`}
          onClick={handleSave}
        >
          <Save /> {saveFlash ? 'Saved!' : 'Save'}
        </button>

        {/* Hidden file input for import */}
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
}
