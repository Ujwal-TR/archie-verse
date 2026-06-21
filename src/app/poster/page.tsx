'use client';

import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Box, Layers, Zap, Download, QrCode } from 'lucide-react';
import styles from './poster.module.css';

// Dynamically import the 3D scene from the landing page
const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), { ssr: false });

export default function PosterPage() {
  return (
    <div className={styles.posterContainer}>
      {/* The actual poster that is exactly 1920x1080 and scales down via CSS transform */}
      <div className={styles.poster} id="promotional-poster">
        <div className={styles.backgroundGrid} />
        <div className={styles.glow} />
        
        <div className={styles.content}>
          
          <header className={styles.header}>
            <div className={styles.brand}>
              <Image src="/logo.png" alt="Archie-Verse Logo" width={80} height={80} className={styles.logoImage} />
              <span className={styles.brandName}>Archie-Verse</span>
            </div>
            <div className={styles.website}>
              archiverse.app
            </div>
          </header>

          <main className={styles.mainLayout}>
            <div className={styles.leftColumn}>
              <h1 className={styles.title}>
                Design Buildings<br />
                <span className={styles.titleGradient}>In Your Browser</span>
              </h1>
              <p className={styles.subtitle}>
                Professional-grade 3D architectural modeling — no downloads, no plugins, zero cost. The next generation of CAD is fully web-based.
              </p>

              <div className={styles.featureGrid}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <Box size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>Parametric Elements</h3>
                  <p className={styles.featureDesc}>Real-world dimensions for walls, floors, and furniture.</p>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <Zap size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>60 FPS Real-time</h3>
                  <p className={styles.featureDesc}>Smooth WebGL rendering with contact shadows.</p>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <Layers size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>Multi-View Modes</h3>
                  <p className={styles.featureDesc}>3D perspective, 2D floor plans, and walkthroughs.</p>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <Download size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>Export Anywhere</h3>
                  <p className={styles.featureDesc}>Download as GLTF, OBJ, JSON, or HD screenshots.</p>
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.sceneContainer}>
                <HeroScene />
              </div>
            </div>
          </main>

          <footer className={styles.footer}>
            <div className={styles.techStack}>
              <span className={styles.techText}>Powered By</span>
              <div className={styles.techItems}>
                <span className={styles.techItem}>Next.js</span>
                <span className={styles.techItem}>Three.js</span>
                <span className={styles.techItem}>WebGL</span>
                <span className={styles.techItem}>React</span>
              </div>
            </div>
            
            {/* A placeholder for a real QR code to scan */}
            <div className={styles.qrCodePlaceholder}>
              <QrCode size={100} className={styles.qrIcon} strokeWidth={1} />
            </div>
          </footer>
          
        </div>
      </div>
    </div>
  );
}
