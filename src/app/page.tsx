'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  PencilRuler,
  Zap,
  DownloadCloud,
  BoxSelect,
  MonitorSmartphone,
  Code,
  ChevronDown
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

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const scrollProgress = useScrollProgress(heroRef);

  const features = [
    {
      icon: PencilRuler,
      title: 'Actually useful dimensions',
      desc: 'Everything is in real-world meters. What you build here is exactly what it looks like IRL.',
    },
    {
      icon: Zap,
      title: 'Runs at 60fps',
      desc: 'No lag, no loading spinners. Drag a wall and it moves instantly.',
    },
    {
      icon: DownloadCloud,
      title: 'Yours to keep',
      desc: 'Export to GLTF, save it as JSON, do whatever you want with your models.',
    },
    {
      icon: BoxSelect,
      title: 'Different ways to look',
      desc: 'Swap between 3D view, a top-down floor plan, or literally walk around inside it.',
    },
    {
      icon: MonitorSmartphone,
      title: 'Works everywhere',
      desc: 'I made sure it runs on your laptop and tablet right in the browser.',
    },
  ];

  return (
    <div className={styles.page}>
      {/* Hand-drawn Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <span className={styles.logoIcon}>✏️</span>
            <span className={styles.logoName}>ArchieVerse</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>What it does</a>
            <a href="https://github.com/Ujwal-TR/archie-verse" className={styles.navLink} target="_blank" rel="noopener noreferrer">
              <Code size={16} /> Code
            </a>
            <Link href="/editor" className={styles.navCta}>
              Open Editor
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroScene}>
          <HeroScene scrollProgress={scrollProgress} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.doodleBadge}>
            <span className={styles.doodleText}>built by a human!</span>
            <svg className={styles.doodleArrow} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M10,80 Q40,10 90,60 M70,50 L90,60 L80,80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 className={styles.heroTitle}>
            I made a 3D editor so you <br />
            don't have to download one.
          </h1>
          
          <p className={styles.heroSubtitle}>
            It's free, it's open source, and it runs right here in your browser. 
            Just open a tab and start dropping walls.
          </p>
          
          <div className={styles.heroCtas}>
            <Link href="/editor" className={styles.primaryBtn}>
              Let's build something <ArrowRight size={18} />
            </Link>
            <span className={styles.handwrittenNote}>(no sign-up required, promise)</span>
          </div>
        </div>
        
        <div className={styles.scrollIndicator}>
          <span>scroll down to see the building grow</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Breakout quote */}
      <section className={styles.quoteSection}>
        <p className={styles.bigQuote}>
          "I just wanted a simple way to sketch out floor plans without a $2000 CAD license."
        </p>
        <span className={styles.quoteAuthor}>— Me, when I started building this</span>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The stuff you actually care about</h2>
            <div className={styles.squigglyLine}></div>
          </div>
          
          <div className={styles.featureGrid}>
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className={`${styles.featureCard} ${i % 2 === 0 ? styles.tiltLeft : styles.tiltRight}`}
              >
                <div className={styles.featureHeader}>
                  <feat.icon size={24} className={styles.featureIcon} />
                  <h3 className={styles.featureTitle}>{feat.title}</h3>
                </div>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
            
            {/* Hand-drawn card */}
            <div className={`${styles.featureCard} ${styles.handDrawnCard}`}>
              <h3 className={styles.handwrittenTitle}>And it's open source!</h3>
              <p className={styles.featureDesc}>If you want to add something or fix my messy code, jump into the GitHub repo.</p>
              <a href="https://github.com/Ujwal-TR/archie-verse" target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
                View Source
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <div className={styles.tape} />
          <h2 className={styles.ctaTitle}>Alright, enough reading.</h2>
          <p className={styles.ctaSubtitle}>
            Go try it out. Your designs auto-save to your browser.
          </p>
          <Link href="/editor" className={styles.primaryBtn}>
            Open the Editor
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Made with coffee and React. © ArchieVerse.</p>
      </footer>
    </div>
  );
}
