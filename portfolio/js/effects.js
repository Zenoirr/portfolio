/* ============================================
   EFFECTS — Atmosphere background + Cursor trail
   Ported 1:1 from the original React canvas logic
   ============================================ */

(function () {
  'use strict';

  /* ---------- Atmosphere (rain + embers + mouse glow) ---------- */
  function initAtmosphere() {
    const canvas = document.getElementById('atmosphereCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const rainParticles = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 5 + 5,
      opacity: Math.random() * 0.05 + 0.01,
    }));

    const embers = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedY: -(Math.random() * 0.5 + 0.2),
      speedX: Math.random() * 1 - 0.5,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 100,
    }));

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    function handleMouseMove(e) {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    }
    window.addEventListener('mousemove', handleMouseMove);

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 400);
      gradient.addColorStop(0, 'rgba(215, 38, 56, 0.06)');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1;
      rainParticles.forEach((p) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.length * 0.5, p.y + p.length);
        ctx.stroke();

        p.y += p.speed;
        p.x -= p.speed * 0.5;

        if (p.y > canvas.height || p.x < 0) {
          p.y = -p.length;
          p.x = Math.random() * canvas.width + canvas.width * 0.5;
        }
      });

      embers.forEach((e) => {
        const opacity = Math.sin((e.life / e.maxLife) * Math.PI) * 0.6;
        ctx.fillStyle = `rgba(215, 38, 56, ${opacity})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        e.y += e.speedY;
        e.x += e.speedX;
        e.life++;

        if (e.life >= e.maxLife || e.y < 0) {
          e.y = canvas.height + 10;
          e.x = Math.random() * canvas.width;
          e.life = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();
  }

  /* ---------- Cursor trail (particle trail following mouse) ---------- */
  function initCursorTrail() {
    const canvas = document.getElementById('cursorTrail');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let rafId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function onMove(e) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const life = 35 + Math.random() * 25;
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 1.2 + 0.3),
          life,
          maxLife: life,
          size: Math.random() * 2.5 + 1,
        });
      }

      if (particles.length > 120) {
        particles.splice(0, particles.length - 120);
      }
    }
    window.addEventListener('mousemove', onMove);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.life--;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const t = p.life / p.maxLife;
        const alpha = t * 0.7;
        const r = Math.round(215 + (255 - 215) * (1 - t));
        const g = Math.round(38 * t);
        const b = Math.round(56 + (109 - 56) * (1 - t));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.shadowColor = `rgba(255,77,109,${alpha * 0.6})`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    }

    draw();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAtmosphere();
    initCursorTrail();
  });
})();
