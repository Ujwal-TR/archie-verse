'use client';

import { useEditorStore } from '@/store/editorStore';
import { X } from 'lucide-react';
import styles from './ShortcutHelp.module.css';

const SHORTCUTS = [
  { category: 'General', items: [
    { keys: ['Ctrl', 'K'], desc: 'Command Palette' },
    { keys: ['Ctrl', 'Z'], desc: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo' },
    { keys: ['Ctrl', 'C'], desc: 'Copy Selected' },
    { keys: ['Ctrl', 'X'], desc: 'Cut Selected' },
    { keys: ['Ctrl', 'V'], desc: 'Paste' },
    { keys: ['Ctrl', 'D'], desc: 'Duplicate Selected' },
    { keys: ['Ctrl', 'S'], desc: 'Save Project' },
    { keys: ['Del'], desc: 'Delete Selected' },
    { keys: ['Esc'], desc: 'Deselect / Cancel' },
  ]},
  { category: 'Tools', items: [
    { keys: ['V'], desc: 'Select Tool' },
    { keys: ['G'], desc: 'Move Tool' },
    { keys: ['R'], desc: 'Rotate Tool' },
    { keys: ['S'], desc: 'Scale Tool' },
    { keys: ['X'], desc: 'Delete Tool' },
  ]},
  { category: 'Elements', items: [
    { keys: ['W'], desc: 'Wall Tool' },
    { keys: ['F'], desc: 'Floor Tool' },
    { keys: ['D'], desc: 'Door Tool' },
  ]},
  { category: 'View', items: [
    { keys: ['H'], desc: 'Toggle Grid' },
    { keys: ['N'], desc: 'Toggle Snap' },
    { keys: ['?'], desc: 'Show Shortcuts' },
  ]},
];

export default function ShortcutHelp() {
  const show = useEditorStore((s) => s.showShortcutHelp);
  const setShow = useEditorStore((s) => s.setShowShortcutHelp);

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={() => setShow(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button className={styles.close} onClick={() => setShow(false)}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.content}>
          {SHORTCUTS.map((section) => (
            <div key={section.category} className={styles.section}>
              <h3 className={styles.categoryTitle}>{section.category}</h3>
              {section.items.map((item) => (
                <div key={item.desc} className={styles.shortcutRow}>
                  <span className={styles.desc}>{item.desc}</span>
                  <div className={styles.keys}>
                    {item.keys.map((key, i) => (
                      <span key={i}>
                        <kbd className={styles.key}>{key}</kbd>
                        {i < item.keys.length - 1 && <span className={styles.plus}>+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
