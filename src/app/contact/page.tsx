'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Code } from 'lucide-react';
import emailjs from '@emailjs/browser';
import styles from './page.module.css';

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) return;

    setIsSubmitting(true);
    setStatus('idle');

    // Read keys from environment variables
    const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
    const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
    const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
        publicKey: PUBLIC_KEY,
      })
      .then(
        () => {
          setIsSubmitting(false);
          setStatus('success');
          form.current?.reset();
        },
        (error) => {
          setIsSubmitting(false);
          setStatus('error');
          console.error('EmailJS Error:', error.text);
        }
      );
  };

  return (
    <div className={styles.page}>
      <main className={styles.contactContainer}>
        <div className={styles.contactCard}>
          <div className={styles.doodleBadge}>SAY HELLO!</div>
          
          <h1 className={styles.title}>Let's chat.</h1>
          <p className={styles.subtitle}>Have a question, feedback, or just want to say hi? Send me a message below.</p>

          <form ref={form} onSubmit={sendEmail} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="user_name" className={styles.label}>Name</label>
              <input type="text" name="user_name" id="user_name" required className={styles.input} placeholder="John Doe" />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="user_email" className={styles.label}>Email</label>
              <input type="email" name="user_email" id="user_email" required className={styles.input} placeholder="john@example.com" />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="message" className={styles.label}>Message</label>
              <textarea name="message" id="message" required className={styles.textarea} placeholder="What's on your mind?"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
                Message sent successfully! I'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div className={`${styles.statusMessage} ${styles.statusError}`}>
                Oops, something went wrong. Please check your EmailJS configuration.
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '3px solid #1a1a1a', padding: '40px', textAlign: 'center', background: '#fff', marginTop: 'auto' }}>
        <p style={{ fontFamily: 'var(--font-inter, system-ui, sans-serif)', fontSize: '15px', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.6 }}>
          Made with coffee and React. © ArchieVerse. <br/>
          By <a href="https://linktr.ee/ujwal_tr" target="_blank" rel="noopener noreferrer" style={{ color: '#ff5722', textDecoration: 'none', fontWeight: 700 }}>Ujwal TR</a>
        </p>
      </footer>
    </div>
  );
}
