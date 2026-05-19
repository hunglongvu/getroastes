'use client';
import { useEffect, useRef } from 'react';

export function Embers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      life: number;
      maxLife: number;
    }[] = [];

    function spawnParticle() {
      particles.push({
        x: Math.random() * canvas!.width,
        y: -10,
        size: 0.5 + Math.random() * 1.5,
        speedX: -0.3 + Math.random() * 0.6,
        speedY: 0.3 + Math.random() * 0.8,
        opacity: 0.3 + Math.random() * 0.5,
        life: 0,
        maxLife: 200 + Math.random() * 300,
      });
    }

    let frame = 0;
    let rafId: number;

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      frame++;
      if (frame % 8 === 0) spawnParticle();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const currentOpacity = p.opacity * (1 - lifeRatio);
        const flicker = 0.7 + Math.random() * 0.3;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(226, 75, 74, ${currentOpacity * flicker})`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 100, 50, ${currentOpacity * 0.15 * flicker})`;
        ctx!.fill();

        if (p.life >= p.maxLife || p.y > canvas!.height) {
          particles.splice(i, 1);
        }
      }

      rafId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      particles.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
