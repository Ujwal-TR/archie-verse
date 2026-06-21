'use client';

import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    let isA = true;
    
    // Create a canvas element to draw the favicon
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Find or create the favicon link element
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const updateFavicon = () => {
      // Clear canvas
      ctx.clearRect(0, 0, 64, 64);
      
      // Draw background (dark premium color)
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.roundRect(0, 0, 64, 64, 16);
      ctx.fill();

      // Draw text
      ctx.fillStyle = '#6366f1'; // Accent primary
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const letter = isA ? 'A' : 'V';
      ctx.fillText(letter, 32, 36);
      
      // Update favicon
      link.href = canvas.toDataURL('image/png');
      
      // Toggle for next time
      isA = !isA;
    };

    // Initial draw
    updateFavicon();

    // Update every 2 seconds
    const intervalId = setInterval(updateFavicon, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
