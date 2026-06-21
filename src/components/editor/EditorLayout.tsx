'use client';

import React from 'react';
import TopToolbar from './TopToolbar';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import BottomStatusBar from './BottomStatusBar';
import CommandPalette from '@/components/ui/CommandPalette';
import ShortcutHelp from '@/components/ui/ShortcutHelp';
import styles from './EditorLayout.module.css';

interface EditorLayoutProps {
  children: React.ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.toolbarArea}>
        <TopToolbar />
      </div>
      <div className={styles.leftArea}>
        <LeftSidebar />
      </div>
      <div className={styles.viewportArea}>
        {children}
      </div>
      <div className={styles.rightArea}>
        <RightPanel />
      </div>
      <div className={styles.statusArea}>
        <BottomStatusBar />
      </div>

      {/* Overlays */}
      <CommandPalette />
      <ShortcutHelp />
    </div>
  );
}

