'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code } from 'lucide-react';
import styles from './NavBar.module.css';

export function NavBar() {
  const pathname = usePathname();

  // The editor has its own specialized toolbar
  if (pathname === '/editor') {
    return null;
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.navLogo}>
          <span className={styles.logoIcon}>✏️</span>
          <span className={styles.logoName}>ArchieVerse</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/#features" className={styles.navLink}>What it does</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
          <a href="https://github.com/Ujwal-TR/archie-verse" className={styles.navLink} target="_blank" rel="noopener noreferrer">
            <Code size={16} /> Code
          </a>
          <Link href="/editor" className={styles.navCta}>
            Open Editor
          </Link>
        </div>
      </div>
    </nav>
  );
}
