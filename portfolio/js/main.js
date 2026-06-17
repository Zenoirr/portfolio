/* ============================================
   MAIN — Navigation, Loading Screen, Stats,
   Preloader, Portfolio, FAQ, Process,
   Music Player, Back to Top, Progress Bar, Reveal
   ============================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initLoadingScreen();
    initProgressBar();
    initNavigation();
    initScrollReveal();
    initStatCounters();
    initPortfolio();
    initAccordion();
    initMusicPlayer();
    initBackToTop();
  });

  /* ---------- Loading Screen (first visit only) ---------- */
  function initLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    if (!screen) return;

    // Only show on first visit per session
    const hasVisited = sessionStorage.getItem('zenoir_visited');
    if (hasVisited) {
      screen.classList.add('hidden');
      initPreloader();
      return;
    }

    sessionStorage.setItem('zenoir_visited', '1');
    document.body.style.overflow = 'hidden';

    // Rain effect
    const canvas = document.getElementById('loadingRain');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let drops = [];
      let animId;

      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drops = [];
        const count = Math.floor(canvas.width / 12);
        for (let i = 0; i < count; i++) {
          drops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            len: 8 + Math.random() * 24,
            speed: 3 + Math.random() * 8,
            opacity: 0.1 + Math.random() * 0.35,
          });
        }
      }

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drops.forEach((d) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(185, 28, 28, ${d.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 1, d.y + d.len);
          ctx.stroke();
          d.y += d.speed;
          if (d.y > canvas.height) {
            d.y = -d.len;
            d.x = Math.random() * canvas.width;
          }
        });
        animId = requestAnimationFrame(drawRain);
      }
      drawRain();

      setTimeout(() => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resizeCanvas);
      }, 2500);
    }

    // Fade out after 1.8s
    setTimeout(() => {
      screen.classList.add('fade-out');
      document.body.style.overflow = '';
      setTimeout(() => {
        screen.classList.add('hidden');
        initPreloader();
      }, 800);
    }, 1800);
  }

  /* ---------- Preloader (full-screen login) ---------- */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const countdownEl = document.getElementById('preloaderCountdown');
    const btn = document.getElementById('preloaderBtn');
    const progressFill = document.getElementById('preloaderProgress');
    if (!preloader || !countdownEl || !btn) return;

    document.body.style.overflow = 'hidden';

    const TOTAL = 3;
    let countdown = TOTAL;
    const startTime = Date.now();

    const interval = setInterval(() => {
      countdown -= 1;
      const pct = ((TOTAL - countdown) / TOTAL) * 100;
      if (progressFill) progressFill.style.width = pct + '%';
      if (countdown > 0) {
        countdownEl.textContent = `Available in ${countdown}s`;
      } else {
        countdownEl.textContent = 'Ready to continue';
        if (progressFill) progressFill.style.width = '100%';
        btn.disabled = false;
        clearInterval(interval);
      }
    }, 1000);

    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      preloader.classList.add('is-hiding');
      document.body.style.overflow = 'unset';
      setTimeout(() => preloader.remove(), 600);
    });
  }

  /* ---------- Progress bar ---------- */
  function initProgressBar() {
    const bar = document.getElementById('progressBar');
    const fill = document.getElementById('progressBarFill');
    if (!bar || !fill) return;

    let current = 0;
    let rafId;

    function tick() {
      const target = document.readyState === 'complete' ? 100 : 85;
      const step = (target - current) * 0.08 + 0.3;
      current = Math.min(current + step, target);
      fill.style.width = current + '%';
      if (current < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => bar.classList.add('is-hidden'), 500);
      }
    }
    rafId = requestAnimationFrame(tick);

    function onLoad() {
      current = 100;
      fill.style.width = '100%';
      setTimeout(() => bar.classList.add('is-hidden'), 400);
    }

    if (document.readyState === 'complete') { onLoad(); }
    else { window.addEventListener('load', onLoad, { once: true }); }
  }

  /* ---------- Navigation ---------- */
  function initNavigation() {
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__link, .drawer__link');
    const sectionIds = ['about', 'portfolio', 'pricing', 'faq', 'commission'];

    function handleScroll() {
      if (window.scrollY > 20) { nav.classList.add('is-scrolled'); }
      else { nav.classList.remove('is-scrolled'); }

      const scrollY = window.scrollY + 100;
      let activeName = null;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollY) {
          activeName = navLinkNameForSection(sectionIds[i]);
          break;
        }
      }

      navLinks.forEach((link) => {
        if (link.dataset.link === activeName) link.classList.add('is-active');
        else link.classList.remove('is-active');
      });
    }

    function navLinkNameForSection(id) {
      const map = { about: 'About', portfolio: 'Portfolio', pricing: 'Pricing', faq: 'FAQ', commission: 'Commission Me' };
      return map[id];
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* Mobile drawer */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const drawer = document.getElementById('drawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const iconMenu = document.getElementById('iconMenu');
    const iconClose = document.getElementById('iconClose');

    function openDrawer() {
      drawer.style.display = 'block';
      requestAnimationFrame(() => drawer.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      iconMenu.style.display = 'none';
      iconClose.style.display = 'block';
    }
    function closeDrawer() {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
      iconMenu.style.display = 'block';
      iconClose.style.display = 'none';
      setTimeout(() => { drawer.style.display = 'none'; }, 350);
    }

    let drawerOpen = false;
    hamburgerBtn.addEventListener('click', () => {
      drawerOpen = !drawerOpen;
      if (drawerOpen) openDrawer(); else closeDrawer();
    });
    drawerBackdrop.addEventListener('click', () => { drawerOpen = false; closeDrawer(); });
    document.querySelectorAll('.drawer__link').forEach((link) => {
      link.addEventListener('click', () => { drawerOpen = false; closeDrawer(); });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    // Mark individual children for staggered reveal
    document.querySelectorAll('.reveal').forEach((el) => {
      // Add stagger delay to direct children if they're meaningful blocks
      const staggerTargets = el.querySelectorAll(
        '.project-card, .feature-card, .pricing-card, .stat-block, .process-step, .accordion-item, .faq-work__col'
      );
      staggerTargets.forEach((child, i) => {
        child.classList.add('reveal-child');
        child.style.transitionDelay = (i * 0.08) + 's';
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Trigger children
            entry.target.querySelectorAll('.reveal-child').forEach((child) => {
              child.classList.add('is-visible');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ---------- Animated stat counters ---------- */
  function initStatCounters() {
    const blocks = document.querySelectorAll('.stat-block');
    if (!blocks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    blocks.forEach((block) => observer.observe(block));
  }

  function animateCounter(block) {
    const target = parseInt(block.dataset.target, 10);
    const countEl = block.querySelector('.stat-count');
    if (!countEl || isNaN(target)) return;

    const duration = 1600;
    const start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      countEl.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
      else countEl.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Portfolio (filter + modal) ---------- */
  function initPortfolio() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalTag = document.getElementById('modalTag');
    const modalImg = document.getElementById('modalImg');
    const modalClose = document.getElementById('modalClose');

    const tagClassMap = { Anime: 'tag--anime', Cartoony: 'tag--cartoony', Stud: 'tag--stud', Simplistic: 'tag--simplistic', Horror: 'tag--horror' };

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          card.style.display = (filter === 'All' || card.dataset.category === filter) ? '' : 'none';
        });
      });
    });

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        modalTitle.textContent = card.dataset.title;
        modalTag.textContent = card.dataset.category;
        modalTag.className = 'tag ' + (tagClassMap[card.dataset.category] || '');
        modalImg.src = card.dataset.img;
        modalImg.alt = card.dataset.title;
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
  }

  /* ---------- FAQ accordion ---------- */
  function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach((item) => {
      const trigger = item.querySelector('.accordion-item__trigger');
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach((i) => i.classList.remove('is-open'));
        if (!isOpen) item.classList.add('is-open');
      });
    });
  }

  /* ---------- Music player ---------- */
  function initMusicPlayer() {
    const audio = document.getElementById('audioTrack');
    const player = document.querySelector('.music-player');
    const playBtn = document.getElementById('playBtn');
    const expandBtn = document.getElementById('expandBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const iconPlay = document.getElementById('iconPlay');
    const iconPause = document.getElementById('iconPause');
    const iconVolOn = document.getElementById('iconVolOn');
    const iconVolOff = document.getElementById('iconVolOff');
    if (!audio || !player) return;

    const BASE_VOLUME = 0.10;
    let muted = false;
    let volume = BASE_VOLUME;
    audio.volume = BASE_VOLUME;
    audio.loop = true;

    function setPlayingUI(isPlaying) {
      player.classList.toggle('is-playing', isPlaying);
      iconPlay.style.display = isPlaying ? 'none' : 'block';
      iconPause.style.display = isPlaying ? 'block' : 'none';
    }

    function tryAutoplay() {
      audio.play().then(() => setPlayingUI(true)).catch(() => {
        const onInteract = () => {
          audio.play().then(() => setPlayingUI(true)).catch(() => {});
          document.removeEventListener('click', onInteract);
          document.removeEventListener('keydown', onInteract);
        };
        document.addEventListener('click', onInteract, { once: true });
        document.addEventListener('keydown', onInteract, { once: true });
      });
    }
    tryAutoplay();

    playBtn.addEventListener('click', () => {
      if (player.classList.contains('is-playing')) { audio.pause(); setPlayingUI(false); }
      else { audio.play().then(() => setPlayingUI(true)).catch(() => {}); }
    });
    expandBtn.addEventListener('click', () => { player.classList.toggle('is-expanded'); });
    muteBtn.addEventListener('click', () => {
      muted = !muted;
      audio.volume = muted ? 0 : volume;
      iconVolOn.style.display = muted ? 'none' : 'block';
      iconVolOff.style.display = muted ? 'block' : 'none';
    });
    volumeSlider.addEventListener('input', (e) => {
      volume = Number(e.target.value);
      muted = false; audio.volume = volume;
      iconVolOn.style.display = 'block'; iconVolOff.style.display = 'none';
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    function onScroll() { btn.classList.toggle('is-visible', window.scrollY > 500); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

})();