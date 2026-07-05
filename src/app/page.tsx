'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight, PencilRuler, Layers, Library, Sun, Globe, 
  Zap, Code, ChevronDown, Check, MousePointerClick
} from 'lucide-react';
import styles from './page.module.css';

const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => <div className={styles.heroScenePlaceholder} />,
});

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smooth scroll tracking
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Mouse tracking for parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Spring physics for parallax
  const springConfig = { damping: 40, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mousePos.x, springConfig);
  const smoothMouseY = useSpring(mousePos.y, springConfig);
  
  // Transform mappings
  const paperX = useTransform(smoothMouseX, [-1, 1], [-8, 8]);
  const paperY = useTransform(smoothMouseY, [-1, 1], [-8, 8]);
  const bgX = useTransform(smoothMouseX, [-1, 1], [4, -4]);
  const bgY = useTransform(smoothMouseY, [-1, 1], [4, -4]);
  const groundX = useTransform(smoothMouseX, [-1, 1], [-2, 2]);

  const features = [
    { icon: PencilRuler, title: 'Parametric Walls', desc: 'Real-world dimensions, instant adjustments.' },
    { icon: Layers, title: 'Floors & Roofs', desc: 'Build complex multi-story structures easily.' },
    { icon: Library, title: 'Furniture Library', desc: 'Furnish your space with parametric objects.' },
    { icon: Sun, title: 'Lighting', desc: 'Real-time shadows and global illumination.' },
    { icon: Globe, title: 'Browser Based', desc: 'Zero installation. Accessible everywhere.' },
    { icon: Zap, title: 'Real-Time Rendering', desc: 'Silky smooth 60fps GPU acceleration.' },
  ];

  return (
    <div className={styles.page} ref={containerRef}>
      
      {/* Glassmorphic Navbar */}
      <motion.nav 
        className={styles.navbar}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
      >
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <span className={styles.logoMark}>AV</span>
            <span className={styles.logoText}>ArchieVerse</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="https://github.com/Ujwal-TR/archie-verse" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/editor" className={styles.navCta}>Launch Editor</Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ── */}
      <section className={styles.heroSection}>
        {/* Drafting table background */}
        <motion.div 
          className={styles.draftingTableBg} 
          style={{ x: bgX, y: bgY }}
        />
        
        {/* Abstract blurred editor preview */}
        <div className={styles.abstractEditorPreview}>
          <div className={styles.previewSidebar} />
          <div className={styles.previewToolbar} />
          <div className={styles.previewCanvas}>
            <div className={styles.previewShape} />
            <div className={styles.previewShape2} />
          </div>
        </div>

        {/* Perspective Ground */}
        <motion.div 
          className={styles.groundPlane}
          style={{ x: groundX }}
        >
          <div className={styles.ambientShadow} />
        </motion.div>

        {/* Central Floating Paper */}
        <motion.div 
          className={styles.heroPaper}
          style={{ x: paperX, y: paperY }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <div className={styles.paperContent}>
            
            {/* Wobbling Sticky Note */}
            <motion.div 
              className={styles.stickyNote}
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              whileHover={{ scale: 1.05, rotate: 0 }}
            >
              100% Free
              <br/>
              Open Source
            </motion.div>

            <h1 className={styles.heroTitle}>
              Architecture starts<br />with a blank page.
            </h1>
            
            <p className={styles.heroSubtitle}>
              Design buildings, arrange floor plans, and render beautiful walkthroughs. 
              A professional 3D architectural tool running entirely in your browser.
            </p>

            <motion.div className={styles.heroActions}>
              <Link href="/editor" className={styles.primaryBtn} draggable={false}>
                <span className={styles.btnText}>Open Editor</span>
                <span className={styles.btnArrow}>
                  <ArrowRight size={18} />
                </span>
                <div className={styles.btnGlow} />
              </Link>
            </motion.div>

            {/* Social Proof */}
            <div className={styles.socialProof}>
              <span className={styles.proofBadge}><Check size={14}/> No Install</span>
              <span className={styles.proofBadge}><Check size={14}/> Free Forever</span>
              <span className={styles.proofBadge}><Check size={14}/> WebGL Powered</span>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className={styles.scrollPill}>
            <span className={styles.scrollText}>Scroll to watch the building come to life</span>
            <motion.div 
              className={styles.scrollArrow}
              animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </span>
        </motion.div>
      </section>

      {/* ── SCROLL TELLING STORY ── */}
      <section className={styles.storySection}>
        <div className={styles.storyContent}>
          <div className={styles.storyText}>
            <h2>Watch it build itself.</h2>
            <p>From foundations to roof, build intuitively with parametric elements that snap into place.</p>
          </div>
          <div className={styles.storySceneWrapper}>
            <HeroScene scrollProgress={scrollYProgress as any} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2>Everything you need.</h2>
          <p>Built for speed, precision, and beautiful results.</p>
        </div>
        
        <div className={styles.featureGrid}>
          {features.map((feat, i) => (
            <motion.div 
              key={feat.title}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className={styles.featureIcon}>
                <feat.icon size={24} />
              </div>
              <h3 className={styles.featureTitle}>{feat.title}</h3>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Made with ❤️ and Three.js</p>
      </footer>
    </div>
  );
}
