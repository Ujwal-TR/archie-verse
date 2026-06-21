'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';

export default function ThemeProvider() {
  const theme = useEditorStore((s) => s.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  return null;
}
