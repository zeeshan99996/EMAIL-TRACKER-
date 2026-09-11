'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  color: string;
  glowColor: string;
  pulseSpeed: number;
  pulsePhase: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Full HD / Retina high-resolution scaling for razor-sharp particles
    const setSize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setSize();
    window.addEventListener('resize', setSize);

    // Color palette matching ERHA theme: White, #07B4D4 (Cyan), #2784DC (Azure Blue), and Sky Blue
    const colors = [
      { fill: 'rgba(255, 255, 255, 0.95)', glow: 'rgba(255, 255, 255, 0.8)' },
      { fill: 'rgba(7, 180, 212, 0.95)', glow: 'rgba(7, 180, 212, 0.85)' },
      { fill: 'rgba(39, 132, 220, 0.95)', glow: 'rgba(39, 132, 220, 0.85)' },
      { fill: 'rgba(165, 243, 252, 0.95)', glow: 'rgba(103, 232, 249, 0.8)' },
      { fill: 'rgba(224, 242, 254, 0.95)', glow: 'rgba(186, 230, 253, 0.8)' },
    ];

    // Determine particle count based on screen width
    const count = width < 768 ? 35 : 80;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      const baseRadius = Math.random() * 2.2 + 1.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: baseRadius,
        baseRadius,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        color: col.fill,
        glowColor: col.glow,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Mouse interaction for subtle repulsion
    const mouse = { x: -1000, y: -1000, radius: 130 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const maxDistance = 125;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing connecting constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.28;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // 2. Update and draw Full HD particles with soft radiant glow
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Wrap or bounce
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Mouse gentle interactive repulsion
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.radius && mdist > 0) {
          const force = (mouse.radius - mdist) / mouse.radius;
          const angle = Math.atan2(mdy, mdx);
          p.x += Math.cos(angle) * force * 1.8;
          p.y += Math.sin(angle) * force * 1.8;
        }

        // Pulsing radius for organic shimmer
        p.pulsePhase += p.pulseSpeed;
        p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.65;

        // Draw particle with luminous glow
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.glowColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
