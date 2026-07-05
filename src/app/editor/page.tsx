'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const EditorLayout = dynamic(
  () => import('@/components/editor/EditorLayout'),
  { ssr: false }
);

const Viewport = dynamic(
  () => import('@/components/editor/Viewport'),
  { ssr: false }
);

const SESSION_KEY = 'archieverse_session';

export default function EditorPage() {
  useKeyboardShortcuts();

  const objects = useEditorStore((s) => s.objects);
  const autoSaveEnabled = useProjectStore((s) => s.autoSaveEnabled);
  const saveProject = useProjectStore((s) => s.saveProject);
  const hasRestored = useRef(false);

  // ── Restore saved scene on first mount ──
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    try {
      // Try sessionStorage first (survives same-tab refresh)
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length > 0) {
          useEditorStore.setState({
            objects: saved,
            selectedObjectIds: [],
            history: [{ objects: saved, selectedObjectIds: [] }],
            historyIndex: 0,
            canUndo: false,
            canRedo: false,
          });
          return;
        }
      }

      // Fall back to localStorage (survives tab close / browser restart)
      const projectData = useProjectStore.getState().loadProject();
      if (projectData && projectData.objects.length > 0) {
        useEditorStore.setState({
          objects: projectData.objects,
          selectedObjectIds: [],
          history: [{ objects: projectData.objects, selectedObjectIds: [] }],
          historyIndex: 0,
          canUndo: false,
          canRedo: false,
        });
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
    }
  }, []);

  // ── Auto-persist to sessionStorage on every change (debounced) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(objects));
      } catch (e) {
        // sessionStorage full or unavailable — silently ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [objects]);

  // ── Also auto-save to localStorage every 30s ──
  useEffect(() => {
    if (!autoSaveEnabled || objects.length === 0) return;

    const timer = setInterval(() => {
      saveProject(objects);
    }, 30000);

    return () => clearInterval(timer);
  }, [objects, autoSaveEnabled, saveProject]);

  return (
    <EditorLayout>
      <Viewport />
    </EditorLayout>
  );
}

