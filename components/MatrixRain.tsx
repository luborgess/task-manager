"use client"

import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix rain configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);
    const chars = ['0', '1'];

    // Animation function
    const draw = () => {
      // Semi-transparent black background to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      // Draw the characters
      for (let i = 0; i < drops.length; i++) {
        // Random character from chars array
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Calculate x and y position
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Add glow effect
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#0F0';
        
        // Draw the character
        ctx.fillText(char, x, y);
        
        // Reset shadow for next iteration
        ctx.shadowBlur = 0;

        // Reset drop to top of screen if it's at the bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }
    };

    // Run animation
    const interval = setInterval(draw, 50);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      style={{ background: 'black' }}
    />
  );
};

export default MatrixRain;
