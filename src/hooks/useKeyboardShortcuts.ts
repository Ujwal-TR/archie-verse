'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    cutSelected,
    pasteClipboard,
    setActiveTool,
    toggleGrid,
    toggleSnap,
    setShowCommandPalette,
    setShowShortcutHelp,
    selectObject,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Z: Undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if ((ctrl && e.shiftKey && e.key === 'z') || (ctrl && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+C: Copy
      if (ctrl && e.key === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }

      // Ctrl+X: Cut
      if (ctrl && e.key === 'x') {
        e.preventDefault();
        cutSelected();
        return;
      }

      // Ctrl+V: Paste
      if (ctrl && e.key === 'v') {
        e.preventDefault();
        pasteClipboard();
        return;
      }

      // Ctrl+D: Duplicate
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Ctrl+S: Save (prevent browser default)
      if (ctrl && e.key === 's') {
        e.preventDefault();
        // Save handled elsewhere
        return;
      }

      // Ctrl+K: Command palette
      if (ctrl && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      // Delete/Backspace: Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Escape: Deselect / close modals
      if (e.key === 'Escape') {
        selectObject(null);
        setShowCommandPalette(false);
        setShowShortcutHelp(false);
        setActiveTool('select');
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
        case 'q':
          setActiveTool('select');
          break;
        case 'g':
          setActiveTool('move');
          break;
        case 'r':
          setActiveTool('rotate');
          break;
        case 's':
          if (!ctrl) setActiveTool('scale');
          break;
        case 'w':
          setActiveTool('wall');
          break;
        case 'f':
          setActiveTool('floor');
          break;
        case 'd':
          if (!ctrl) setActiveTool('door');
          break;
        case 'x':
          if (!ctrl) setActiveTool('delete');
          break;
        // Toggle shortcuts
        case 'h':
          toggleGrid();
          break;
        case 'n':
          toggleSnap();
          break;
        case '?':
          setShowShortcutHelp(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    cutSelected,
    pasteClipboard,
    setActiveTool,
    toggleGrid,
    toggleSnap,
    setShowCommandPalette,
    setShowShortcutHelp,
    selectObject,
  ]);
}

