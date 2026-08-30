/* ============================================
   EFFECTS — Sakura petals (single signature effect)
   Lightweight, capped, pauses when tab is hidden,
   respects prefers-reduced-motion.
   ============================================ */

(function () {
  'use strict';

  function initSakura() {
    const canvas = document.getElementById('sakuraCanvas');
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width, height;
    let rafId = null;
    let running = true;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Fewer petals on small / low-power screens
    const COUNT = width < 700 ? 10 : 18;

    function makePetal() {
      return {
        x: Math.random() * width,
        y: -20 - Math.random() * height,
        size: 6 + Math.random() * 7,
        speed: 0.35 + Math.random() * 0.5,
        drift: 0.4 + Math.random() * 0.6,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.006 + Math.random() * 0.01,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        opacity: 0.35 + Math.random() * 0.35,
      };
    }

    const petals = Array.from({ length: COUNT }).map(makePetal);

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = '#FFB7C5';
      ctx.beginPath();
      // simple 5-petal-ish blob approximated with a single soft petal shape
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.6, p.size * 0.8, p.size * 0.4, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.4, -p.size * 0.8, -p.size * 0.6, 0, -p.size);
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.sway += p.swaySpeed;
        p.y += p.speed;
        p.x += Math.sin(p.sway) * p.drift * 0.6;
        p.rot += p.rotSpeed;

        if (p.y - p.size > height) {
          petals[i] = makePetal();
          petals[i].y = -20;
        }
        drawPetal(p);
      }

      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (rafId) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    start();
  }

  document.addEventListener('DOMContentLoaded', initSakura);
})();
