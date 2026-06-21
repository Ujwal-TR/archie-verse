'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Box,
  Zap,
  Download,
  Layers,
  Sparkles,
  Globe,
  MonitorSmartphone,
  ExternalLink,
  ChevronDown,
  Cpu,
  Eye,
  Users,
} from 'lucide-react';
import styles from './page.module.css';

const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => <div className={styles.heroScenePlaceholder} />,
});

/* Count-up animation hook */
function useCountUp(target: number, duration: number = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(target * ease));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* Scroll reveal hook */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function HomePage() {
  const features = [
    { icon: Box, title: 'Parametric Elements', desc: 'Walls, floors, roofs, stairs, furniture, lighting — all with real-world dimensions in meters.', color: '#6366f1' },
    { icon: Zap, title: '60 FPS Real-time', desc: 'WebGL-powered rendering with HDRI lighting, contact shadows, and smooth camera controls.', color: '#f59e0b' },
    { icon: Download, title: 'Export Anywhere', desc: 'Download as GLTF, OBJ, JSON, or PNG screenshot. Import into Blender, Unity, or Unreal.', color: '#22c55e' },
    { icon: Layers, title: 'Multi-View Modes', desc: '3D perspective, 2D floor plan, and walkthrough mode for complete spatial understanding.', color: '#ec4899' },
    { icon: Globe, title: 'Zero Install', desc: 'Runs entirely in your browser. No plugins, no downloads, no account required.', color: '#3b82f6' },
    { icon: MonitorSmartphone, title: 'Cross-Platform', desc: 'Works on any device with a modern browser — desktop, tablet, or laptop.', color: '#8b5cf6' },
  ];

  const stats = [
    { label: 'Elements', target: 30, suffix: '+' },
    { label: 'Export Formats', target: 4, suffix: '' },
    { label: 'FPS Target', target: 60, suffix: '' },
    { label: 'Cost', target: 0, suffix: '$', prefix: '' },
  ];

  const marqueeItems = ['Three.js', 'React', 'WebGL', 'GPU-Accelerated', 'Zero Install', '60 FPS', 'TypeScript', 'GLTF Export', 'Real-time Shadows', 'HDRI Lighting'];

  const heroReveal = useReveal();
  const featReveal = useReveal();
  const ctaReveal = useReveal();

  return (
    <div className={styles.page}>
      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <Image src="/logo.png" alt="Archi-Verse Logo" width={32} height={32} className={styles.logoImage} />
            <span className={styles.logoName}>Archi-Verse</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="https://github.com" className={styles.navLink} target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/editor" className={styles.navCta}>
              Open Editor <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroScene}>
          <HeroScene />
        </div>
        <div
          ref={heroReveal.ref}
          className={`${styles.heroContent} ${heroReveal.visible ? styles.revealed : ''}`}
        >
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Free &amp; Open Source</span>
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine1}>Design Architecture</span>
            <span className={styles.heroLine2}>In Your Browser</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Professional-grade 3D architectural modeling — no downloads, no plugins, no cost. 
            Build walls, floors, roofs, furniture, and more with real-time WebGL rendering.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/editor" className={styles.primaryBtn}>
              Start Building <ArrowRight size={18} />
            </Link>
            <a href="#features" className={styles.secondaryBtn}>
              See Features <ChevronDown size={18} />
            </a>
          </div>
        </div>
        <div className={styles.heroFade} />
      </section>

      {/* ── Marquee ── */}
      <section className={styles.marqueeSection}>
        <div className={styles.marqueeTrack}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className={styles.marqueeItem}>
              <Cpu size={14} /> {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.stats}>
        {stats.map((stat) => {
          const counter = useCountUp(stat.target);
          return (
            <div key={stat.label} ref={counter.ref} className={styles.statItem}>
              <span className={styles.statValue}>
                {stat.prefix}{counter.value}{stat.suffix}
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          );
        })}
      </section>

      {/* ── Features ── */}
      <section id="features" className={styles.features}>
        <div ref={featReveal.ref} className={`${styles.featuresInner} ${featReveal.visible ? styles.revealed : ''}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Features</span>
            <h2 className={styles.sectionTitle}>Everything you need to design</h2>
            <p className={styles.sectionSubtitle}>
              From structural elements to interior furniture, ArchieVerse gives you a complete toolkit.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className={styles.featureCard}
                style={{ '--delay': `${i * 80}ms`, '--accent': feat.color } as React.CSSProperties}
              >
                <div className={styles.featureIcon}>
                  <feat.icon size={24} />
                </div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div ref={ctaReveal.ref} className={`${styles.ctaInner} ${ctaReveal.visible ? styles.revealed : ''}`}>
          <div className={styles.ctaGlow} />
          <h2 className={styles.ctaTitle}>Ready to build something amazing?</h2>
          <p className={styles.ctaSubtitle}>
            No signup required. Jump straight into the editor and start designing.
          </p>
          <Link href="/editor" className={styles.ctaButton}>
            Launch Editor <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image src="/logo.png" alt="Archi-Verse Logo" width={32} height={32} className={styles.logoImage} />
            <span className={styles.logoName}>Archi-Verse</span>
            <span className={styles.footerTagline}>Browser-based 3D architecture</span>
          </div>
          <div className={styles.footerLinks}>
            <a href="https://github.com" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} /> Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
