import { useEffect, useRef } from 'react';

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  alpha: number;
};

/**
 * The hero's dust: a canvas of slow drifting dots that scatter away from the
 * pointer. Port of the reference hero's InteractiveParticles, painted in ink so
 * it reads on a white page, paused when the section is off screen or the tab is
 * hidden, and still under prefers-reduced-motion.
 */
export function ParticlesField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const pointer = { x: -1000, y: -1000, radius: 150 };
    let dots: Dot[] = [];
    let frame = 0;
    let visible = false;
    let box = canvas.getBoundingClientRect();
    let dpr = window.devicePixelRatio || 1;

    const build = () => {
      box = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      pointer.radius = 140 * dpr;

      const area = box.width * box.height;
      const count = Math.max(20, Math.min(Math.floor(area / 12000), 150));
      dots = Array.from({ length: count }, () => {
        const baseVx = (Math.random() - 0.5) * 0.6 * dpr;
        const baseVy = (Math.random() - 0.5) * 0.6 * dpr;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: baseVx,
          vy: baseVy,
          baseVx,
          baseVy,
          radius: (Math.random() * 1.5 + 0.5) * dpr,
          alpha: Math.random() * 0.42 + 0.12,
        };
      });
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(23, 23, 23, ${dot.alpha})`;
        ctx.fill();
      }
    };

    const step = () => {
      if (!visible) {
        frame = 0;
        return;
      }
      for (const dot of dots) {
        if (dot.x < 0 || dot.x > canvas.width) {
          dot.baseVx *= -1;
          dot.vx *= -1;
          dot.x = Math.max(0, Math.min(dot.x, canvas.width));
        }
        if (dot.y < 0 || dot.y > canvas.height) {
          dot.baseVy *= -1;
          dot.vy *= -1;
          dot.y = Math.max(0, Math.min(dot.y, canvas.height));
        }

        const dx = pointer.x - dot.x;
        const dy = pointer.y - dot.y;
        const dist = Math.hypot(dx, dy);
        if (dist < pointer.radius && dist > 0) {
          const force = (pointer.radius - dist) / pointer.radius;
          dot.vx -= (dx / dist) * force * 3 * dpr;
          dot.vy -= (dy / dist) * force * 3 * dpr;
        }

        dot.vx += (dot.baseVx - dot.vx) * 0.04;
        dot.vy += (dot.baseVy - dot.vy) * 0.04;

        const speed = Math.hypot(dot.vx, dot.vy);
        const max = 4 * dpr;
        if (speed > max) {
          dot.vx = (dot.vx / speed) * max;
          dot.vy = (dot.vy / speed) * max;
        }

        dot.x += dot.vx;
        dot.y += dot.vy;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (reduced || frame) return;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const onMove = (event: MouseEvent) => {
      pointer.x = (event.clientX - box.left) * dpr;
      pointer.y = (event.clientY - box.top) * dpr;
    };
    const onLeave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };
    const onResize = () => build();
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    build();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
}
