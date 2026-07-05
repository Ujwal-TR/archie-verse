'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  Ruler,
  Zap,
  Download,
  Layers,
  Globe,
  MonitorSmartphone,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import styles from './page.module.css';

const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => <div className={styles.heroScenePlaceholder} />,
});

/* ── Scroll progress tracker ── */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      const rect = el!.getBoundingClientRect();
      const viewH = window.innerHeight;
      const total = rect.height + viewH;
      const scrolled = viewH - rect.top;
      setProgress(Math.max(0, Math.min(1, scrolled / total)));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref]);

  return progress;
}

/* ── Count-up on scroll ── */
function useCountUp(target: number, duration = 1800) {
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
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(target * ease));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ── Reveal on scroll ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const scrollProgress = useScrollProgress(heroRef);

  const features = [
    {
      icon: Ruler,
      title: 'Real Dimensions',
      desc: 'Every wall, floor, and staircase uses real-world meters. Your designs translate directly to physical space.',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      desc: 'Changes render at 60fps. No waiting, no loading bars. Move a wall and see it happen.',
    },
    {
      icon: Download,
      title: 'Take It Anywhere',
      desc: 'Export as GLTF for Blender, JSON for backup, or grab a screenshot. Your work, your formats.',
    },
    {
      icon: Layers,
      title: 'Multiple Views',
      desc: '3D perspective, top-down floor plan, or walk through your design. Switch freely.',
    },
    {
      icon: Globe,
      title: 'Nothing to Install',
      desc: 'Open a browser tab and start designing. No downloads, no accounts, no friction.',
    },
    {
      icon: MonitorSmartphone,
      title: 'Any Screen',
      desc: 'Laptop, desktop, tablet — the editor adapts. Design wherever you are.',
    },
  ];

  const stats = [
    { label: 'Building Elements', target: 30, suffix: '+' },
    { label: 'Export Formats', target: 4, suffix: '' },
    { label: 'Frames Per Second', target: 60, suffix: '' },
    { label: 'Price Tag', target: 0, suffix: '', prefix: '$' },
  ];

  const featReveal = useReveal();
  const ctaReveal = useReveal();
  const statsReveal = useReveal();

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <span className={styles.logoMark}>AV</span>
            <span className={styles.logoName}>Archie-Verse</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="https://github.com/Ujwal-TR/archie-verse" className={styles.navLink} target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/editor" className={styles.navCta}>
              Open Editor <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — scroll-linked 3D scene */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroScene}>
          <HeroScene scrollProgress={scrollProgress} />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Free &amp; open source</p>
          <h1 className={styles.heroTitle}>
            Architecture starts<br />
            <span className={styles.heroAccent}>with an idea.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            ArchieVerse is a browser-based 3D editor for designing buildings. 
            No installs, no cost — just open a tab and build.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/editor" className={styles.primaryBtn}>
              Start designing <ArrowRight size={18} />
            </Link>
            <a href="#features" className={styles.secondaryBtn}>
              Learn more <ChevronDown size={18} />
            </a>
          </div>
        </div>

        <div className={styles.scrollHint}>
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* Stats */}
      <section
        ref={statsReveal.ref}
        className={`${styles.stats} ${statsReveal.visible ? styles.revealed : ''}`}
      >
        {stats.map((stat) => {
          const counter = useCountUp(stat.target);
          return (
            <div key={stat.label} ref={counter.ref} className={styles.statItem}>
              <span className={styles.statValue}>
                {stat.prefix}
                {counter.value}
                {stat.suffix}
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          );
        })}
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div
          ref={featReveal.ref}
          className={`${styles.featuresInner} ${featReveal.visible ? styles.revealed : ''}`}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built for the way you work</h2>
            <p className={styles.sectionSubtitle}>
              No learning curve. Drag elements, tweak properties, export when ready.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className={styles.featureCard}
                style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}
              >
                <div className={styles.featureIcon}>
                  <feat.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div
          ref={ctaReveal.ref}
          className={`${styles.ctaInner} ${ctaReveal.visible ? styles.revealed : ''}`}
        >
          <h2 className={styles.ctaTitle}>Your next building starts here.</h2>
          <p className={styles.ctaSubtitle}>
            Open the editor and place your first wall. No sign-up needed.
          </p>
          <Link href="/editor" className={styles.ctaButton}>
            Launch Editor <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.logoMark}>AV</span>
            <span className={styles.footerName}>Archie-Verse</span>
          </div>
          <a
            href="https://github.com/Ujwal-TR/archie-verse"
            className={styles.footerLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} /> Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
