/* ============================================================
   ABHIJIT GAIKWAD PORTFOLIO — Ultra-Smooth Scroll Engine v3
   - Single RAF loop (no duplicate listeners)
   - GPU-accelerated transforms only (translate3d / scale)
   - will-change hints for compositor layer promotion
   - Passive scroll + mouse listeners (never blocks paint)
   - Lerp (linear interpolation) for silky easing on all values
   - Mobile / touch / reduced-motion: zero parallax, no RAF loop
   - Tab hidden: RAF paused automatically
   ============================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     DEVICE DETECTION
  ───────────────────────────────────────────── */
  const isMobile      = window.matchMedia('(max-width: 820px)').matches;
  const isTouch       = window.matchMedia('(pointer: coarse)').matches;
  const isLowEnd      = navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 4;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipParallax  = isMobile || isTouch || reducedMotion;

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  const $    = s => document.querySelector(s);
  const $$   = s => Array.prototype.slice.call(document.querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────── */
  let rawScroll  = window.scrollY;
  let lerpScroll = window.scrollY;
  let rawMX = 0, rawMY = 0;
  let lerpMX = 0, lerpMY = 0;
  let rafId     = null;
  let isRunning = false;

  /* ─────────────────────────────────────────────
     CACHED DOM REFERENCES  (query once, reuse)
  ───────────────────────────────────────────── */
  let dom = {};
  function cacheDom() {
    dom = {
      grid       : $('.hero-bg-grid'),
      heroLeft   : $('.hero-left'),
      heroRight  : $('.hero-right'),
      frame      : $('.photo-frame'),
      heroStats  : $('.hero-stats'),
      navbar     : document.getElementById('navbar'),
      bPython    : $('.badge-python'),
      bAi        : $('.badge-ai'),
      bAuto      : $('.badge-auto'),
      cards      : $$('.skill-cat-block, .ach-card'),
      mockups    : $$('.project-mockup'),
      resume     : $$('.resume-block'),
      orbitDots  : $$('.orbit-dot'),
    };
  }

  /* ─────────────────────────────────────────────
     GPU LAYER HINTS
  ───────────────────────────────────────────── */
  function promoteToGPU() {
    ['.hero-bg-grid', '.hero-left', '.hero-right', '.photo-frame'].forEach(sel => {
      const el = $(sel);
      if (el) el.style.willChange = 'transform';
    });
    // Lazy promote cards only when near viewport
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        e.target.style.willChange = e.isIntersecting ? 'transform, opacity' : 'auto';
      });
    }, { rootMargin: '200px' });
    $$('.skill-cat-block,.ach-card,.project-mockup,.resume-block').forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────────
     EVENT LISTENERS  (all passive)
  ───────────────────────────────────────────── */
  window.addEventListener('scroll', () => { rawScroll = window.scrollY; }, { passive: true });

  if (!skipParallax) {
    document.addEventListener('mousemove', e => {
      rawMX = (e.clientX / window.innerWidth  - 0.5) * 2;
      rawMY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     MAIN RAF TICK
  ───────────────────────────────────────────── */
  function tick() {
    rafId = requestAnimationFrame(tick);

    // Lerp factor: lower = smoother but slightly laggy; 0.10 is butter-smooth
    const lf = isLowEnd ? 0.16 : 0.10;
    lerpScroll = lerp(lerpScroll, rawScroll, lf);
    lerpMX     = lerp(lerpMX, rawMX, 0.08);
    lerpMY     = lerp(lerpMY, rawMY, 0.08);

    const sy = lerpScroll;
    const wh = window.innerHeight;

    /* 1. Hero background grid — slow upward drift */
    if (dom.grid)
      dom.grid.style.transform = `translateY(${sy * 0.28}px) scale(1.08)`;

    /* 2. Hero left — mouse parallax + scroll drift */
    if (dom.heroLeft)
      dom.heroLeft.style.transform =
        `translate3d(${lerpMX * -8}px,${lerpMY * -5 + sy * 0.09}px,0)`;

    /* 3. Hero right photo — slower scroll */
    if (dom.heroRight)
      dom.heroRight.style.transform = `translateY(${sy * 0.05}px)`;

    /* 4. Photo frame — 3D mouse tilt */
    if (dom.frame)
      dom.frame.style.transform =
        `perspective(900px) rotateX(${lerpMY * -7}deg) rotateY(${lerpMX * 7}deg) translateZ(10px)`;

    /* 5. Floating badges — different depths */
    if (dom.bPython) dom.bPython.style.transform = `translate3d(${lerpMX * 9}px,${lerpMY * -7}px,0)`;
    if (dom.bAi)     dom.bAi.style.transform     = `translate3d(${lerpMX * -12}px,${lerpMY * 9}px,0)`;
    if (dom.bAuto)   dom.bAuto.style.transform   = `translate3d(${lerpMX * 11}px,${lerpMY * 12}px,0)`;

    /* 6. Orbit dots */
    dom.orbitDots.forEach((dot, i) => {
      const f = (i + 1) * 4;
      dot.style.transform = `translate3d(${lerpMX * f}px,${lerpMY * f}px,0)`;
    });

    /* 7. Hero stats tilt */
    if (dom.heroStats)
      dom.heroStats.style.transform =
        `perspective(600px) rotateX(${lerpMY * -4}deg) rotateY(${lerpMX * 4}deg)`;

    /* 8. Skill / ach cards — subtle scroll tilt (only visible ones) */
    dom.cards.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > wh + 80) return;
      const f    = clamp((rect.top + rect.height / 2 - wh / 2) / wh, -0.5, 0.5);
      el.style.transform = `perspective(900px) rotateX(${f * 2.5}deg) translateY(${f * -4}px)`;
    });

    /* 9. Project mockups — parallax drift */
    dom.mockups.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > wh + 80) return;
      const drift = (clamp(1 - rect.top / wh, 0, 1) - 0.5) * 12;
      el.style.transform = `translateY(${drift}px)`;
    });

    /* 10. Resume blocks — depth slide */
    dom.resume.forEach(el => {
      const rect     = el.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > wh + 80) return;
      const progress = clamp(1 - rect.top / (wh * 0.85), 0, 1);
      el.style.transform = `perspective(1000px) translateZ(${-(1 - progress) * 26}px) translateY(${(1 - progress) * 11}px)`;
      el.style.opacity   = String(clamp(0.4 + progress * 0.6, 0, 1));
    });

    /* 11. Navbar shadow */
    if (dom.navbar) {
      const s = clamp(sy / 200, 0, 1);
      dom.navbar.style.boxShadow = s > 0.05
        ? `0 ${4 + s * 10}px ${20 + s * 34}px rgba(0,0,0,${(0.1 + s * 0.2).toFixed(2)})`
        : '';
    }
  }

  /* ─────────────────────────────────────────────
     SCROLL REVEAL
  ───────────────────────────────────────────── */
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const delay = parseInt(e.target.dataset.delay || 0);
        if (delay) setTimeout(() => e.target.classList.add('visible'), delay);
        else       e.target.classList.add('visible');
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────────────
     DEPTH CARD ENTRANCE
  ───────────────────────────────────────────── */
  function initDepthCards() {
    // Mobile: reset to visible immediately, no 3D
    if (skipParallax) {
      $$('.skill-cat-block,.ach-card,.cert-card,.tech-pill').forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        setTimeout(() => {
          e.target.style.transition =
            'transform 0.62s cubic-bezier(0.4,0,0.2,1), opacity 0.62s ease';
          e.target.style.opacity   = '1';
          e.target.style.transform = 'perspective(900px) rotateX(0deg) translateY(0)';
        }, i * 40);
        io.unobserve(e.target);
      });
    }, { threshold: 0.1 });

    $$('.skill-cat-block,.ach-card,.cert-card').forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = `perspective(800px) translateZ(-32px) translateY(16px)`;
      el.style.transition = `transform 0.62s ${i * 0.04}s cubic-bezier(0.4,0,0.2,1), opacity 0.62s ${i * 0.04}s ease`;
      io.observe(el);
    });
  }

  /* ─────────────────────────────────────────────
     SKILL BARS
  ───────────────────────────────────────────── */
  function initSkillBars() {
    $$('.sic-fill').forEach(bar => {
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setTimeout(() => {
          bar.style.transition = 'width 1.1s cubic-bezier(0.4,0,0.2,1)';
          bar.style.width      = bar.dataset.w + '%';
        }, 220);
      }, { threshold: 0.3 });
      io.observe(bar);
    });
  }

  /* ─────────────────────────────────────────────
     3D HOVER TILT ON PROJECT CARDS  (desktop)
  ───────────────────────────────────────────── */
  function initCardTilt() {
    if (isTouch) return;
    $$('.project-item').forEach(card => {
      const mockup = card.querySelector('.project-mockup');
      if (!mockup) return;
      card.addEventListener('mousemove', e => {
        const r  = mockup.getBoundingClientRect();
        const rx = clamp(((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -9, -9, 9);
        const ry = clamp(((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  9, -9, 9);
        mockup.style.transition = 'box-shadow .15s';
        mockup.style.transform  =
          `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.02)`;
        mockup.style.boxShadow  =
          `${-ry * 2}px ${rx * 2}px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,200,255,.2)`;
      });
      card.addEventListener('mouseleave', () => {
        mockup.style.transition = 'transform .4s cubic-bezier(0.4,0,0.2,1), box-shadow .4s';
        mockup.style.transform  = '';
        mockup.style.boxShadow  = '';
      });
    });
  }

  /* ─────────────────────────────────────────────
     SECTION LINES
  ───────────────────────────────────────────── */
  function initSectionLines() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.5 });
    $$('.parallax-section-line').forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────────────
     MOBILE NAVBAR SHADOW  (no RAF needed)
  ───────────────────────────────────────────── */
  function initMobileNav() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      const s = clamp(window.scrollY / 180, 0, 1);
      nav.style.boxShadow = s > 0.05
        ? `0 ${3 + s * 8}px ${14 + s * 26}px rgba(0,0,0,${(0.08 + s * 0.18).toFixed(2)})`
        : '';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     PAUSE RAF WHEN TAB HIDDEN
  ───────────────────────────────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; isRunning = false; }
    } else if (!skipParallax && !isRunning) {
      isRunning  = true;
      lerpScroll = window.scrollY;
      rawScroll  = window.scrollY;
      tick();
    }
  });

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    cacheDom();
    initReveal();
    initDepthCards();
    initSkillBars();
    initSectionLines();

    if (skipParallax) {
      initMobileNav();
      // Ensure nothing is stuck invisible on mobile
      $$('.resume-block,.section-tag').forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      });
      return;
    }

    promoteToGPU();
    initCardTilt();

    if (!isRunning) {
      isRunning  = true;
      lerpScroll = window.scrollY;
      rawScroll  = window.scrollY;
      tick();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
