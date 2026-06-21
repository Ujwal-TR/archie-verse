'use client';

import React from 'react';
import { Grid3x3, Magnet } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import styles from './BottomStatusBar.module.css';

export default function BottomStatusBar() {
  const objects = useEditorStore((s) => s.objects);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const activeTool = useEditorStore((s) => s.activeTool);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const showGrid = useEditorStore((s) => s.showGrid);
  const fps = useEditorStore((s) => s.fps);
  const unitSystem = useEditorStore((s) => s.unitSystem);

  const selectedCount = selectedObjectIds.length;
  const firstSelectedObject = selectedCount === 1
    ? objects.find((o) => o.id === selectedObjectIds[0])
    : undefined;

  const fpsClass = fps >= 50 ? styles.fpsGood : fps >= 30 ? styles.fpsWarn : styles.fpsBad;

  return (
    <div className={styles.statusBar}>
      {/* Left */}
      <div className={styles.left}>
        <span>{objects.length} object{objects.length !== 1 ? 's' : ''}</span>
        {selectedCount === 1 && firstSelectedObject && (
          <>
            <span className={styles.divider} />
            <span className={styles.selectedInfo}>
              {firstSelectedObject.name} ({firstSelectedObject.type})
            </span>
          </>
        )}
        {selectedCount > 1 && (
          <>
            <span className={styles.divider} />
            <span className={styles.selectedInfo}>
              {selectedCount} objects selected
            </span>
          </>
        )}
      </div>

      {/* Center */}
      <div className={styles.center}>
        <span className={styles.toolName}>{activeTool}</span>
        <span className={styles.divider} />
        <span className={styles.indicator}>
          <Grid3x3 />
          <span className={`${styles.dot} ${showGrid ? styles.dotActive : styles.dotInactive}`} />
        </span>
        <span className={styles.indicator}>
          <Magnet />
          <span className={`${styles.dot} ${snapEnabled ? styles.dotActive : styles.dotInactive}`} />
        </span>
      </div>

      {/* Right */}
      <div className={styles.right}>
        <span className={fpsClass}>{fps} FPS</span>
        <span className={styles.divider} />
        <span>100%</span>
        <span className={styles.divider} />
        <button
          className={styles.unitToggle}
          onClick={() => {
            // Toggle unit system — store doesn't expose a toggle, so set directly
            useEditorStore.setState({
              unitSystem: unitSystem === 'metric' ? 'imperial' : 'metric',
            });
          }}
        >
          {unitSystem === 'metric' ? 'M' : 'FT'}
        </button>
      </div>
    </div>
  );
}
