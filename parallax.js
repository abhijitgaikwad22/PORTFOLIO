/* ============================================================
   ABHIJIT GAIKWAD PORTFOLIO — 3D Parallax Scroll (Medium)
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let ticking = false;
  let scrollY = 0;
  let mouseX = 0, mouseY = 0;

  /* ── Throttled RAF scroll ── */
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  /* ── Mouse tracking for hero ── */
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2; // -1 to 1
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    updateMouseParallax();
  });

  /* ── Main update loop ── */
  function update() {
    ticking = false;
    const sy = scrollY;

    // 1. Hero background grid drifts up slower than scroll
    const grid = $('.hero-bg-grid');
    if (grid) {
      grid.style.transform = `translateY(${sy * 0.35}px) scale(1.08)`;
    }

    // 2. Hero left content drifts up slightly
    const heroLeft = $('.hero-left');
    if (heroLeft) {
      heroLeft.style.transform = `translateY(${sy * 0.12}px)`;
    }

    // 3. Hero right (photo) drifts up a bit faster → depth illusion
    const heroRight = $('.hero-right');
    if (heroRight) {
      heroRight.style.transform = `translateY(${sy * 0.08}px)`;
    }

    // 4. Scroll line reveals
    $$('.parallax-section-line').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) el.classList.add('visible');
    });

    // 5. Staggered card depth on scroll (subtle tilt based on viewport position)
    $$('.skill-cat-block, .ach-card').forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const factor = center / window.innerHeight;
      const rotX = factor * 4; // max 4deg tilt
      el.style.transform = `perspective(900px) rotateX(${rotX}deg) translateY(${factor * -6}px)`;
    });

    // 6. Project mockups — parallax drift
    $$('.project-mockup').forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const progress = 1 - rect.top / window.innerHeight;
      const drift = (progress - 0.5) * 18;
      el.style.transform = `translateY(${drift}px)`;
    });

    // 7. Section tags float up as they enter
    $$('.section-tag').forEach(el => {
      const rect = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 1 - rect.top / (window.innerHeight * 0.8)));
      el.style.transform = `translateY(${(1 - progress) * 20}px)`;
      el.style.opacity = 0.3 + progress * 0.7;
    });

    // 8. Resume blocks — slide in from depth
    $$('.resume-block').forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 1 - rect.top / (window.innerHeight * 0.85)));
      const depth = (1 - progress) * 30;
      el.style.transform = `perspective(1000px) translateZ(${-depth}px) translateY(${(1 - progress) * 15}px)`;
      el.style.opacity = 0.4 + progress * 0.6;
    });
  }

  /* ── Mouse parallax (hero section only) ── */
  function updateMouseParallax() {
    const heroSection = $('.hero');
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    // Photo frame responds to mouse
    const frame = $('.photo-frame');
    if (frame) {
      const rx = mouseY * -8;  // -8 to 8 deg
      const ry = mouseX *  8;
      frame.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
    }

    // Hero left text shifts subtly opposite to mouse
    const heroLeft = $('.hero-left');
    if (heroLeft) {
      const tx = mouseX * -8;
      const ty = mouseY * -5 + scrollY * 0.12;
      heroLeft.style.transform = `translate(${tx}px, ${ty}px)`;
    }

    // Photo badges float at different depths
    const badgeDepths = [
      { sel: '.badge-python', dx: 1.5, dy: -1.2 },
      { sel: '.badge-ai',     dx: -2,  dy:  1.5 },
      { sel: '.badge-auto',   dx: 1.8, dy:  2   },
    ];
    badgeDepths.forEach(({ sel, dx, dy }) => {
      const el = $(sel);
      if (el) {
        el.style.transform += ` translate(${mouseX * dx * 6}px, ${mouseY * dy * 6}px)`;
      }
    });

    // Orbit dots respond to mouse
    $$('.orbit-dot').forEach((dot, i) => {
      const factor = (i + 1) * 4;
      dot.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px)`;
    });
  }

  /* ── Intersection Observer for depth reveals ── */
  const depthObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease';
        entry.target.style.transform = 'translateZ(0) translateY(0)';
        entry.target.style.opacity = '1';
      }
    });
  }, { threshold: 0.1 });

  // Apply initial depth state to cards
  function initDepthCards() {
    $$('.skill-cat-block, .ach-card, .cert-card, .tech-pill').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = `perspective(800px) translateZ(-40px) translateY(20px)`;
      el.style.transition = `transform 0.6s ${i * 0.05}s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ${i * 0.05}s ease`;
      depthObserver.observe(el);
    });
  }

  /* ── 3D hover tilt on project cards ── */
  function initCardTilt() {
    $$('.project-item').forEach(card => {
      const mockup = card.querySelector('.project-mockup');
      if (!mockup) return;

      card.addEventListener('mousemove', e => {
        const rect = mockup.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rx = dy * -10; // max 10deg
        const ry = dx *  10;
        mockup.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.02)`;
        mockup.style.boxShadow = `${-ry * 2}px ${rx * 2}px 40px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.25)`;
      });

      card.addEventListener('mouseleave', () => {
        mockup.style.transform = '';
        mockup.style.boxShadow = '';
      });
    });
  }

  /* ── Hero section line pulse ── */
  function initHeroLines() {
    const heroStats = $('.hero-stats');
    if (heroStats) {
      heroStats.style.transform = 'perspective(600px) rotateX(0deg)';
      document.addEventListener('mousemove', e => {
        const rect = heroStats.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / window.innerWidth;
        const dy = (e.clientY - cy) / window.innerHeight;
        heroStats.style.transform = `perspective(600px) rotateX(${dy * -6}deg) rotateY(${dx * 6}deg)`;
      });
    }
  }

  /* ── Navbar 3D depth on scroll ── */
  function initNavDepth() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      const s = Math.min(window.scrollY / 200, 1);
      // subtle shadow depth increase
      if (s > 0.1) {
        nav.style.boxShadow = `0 ${4 + s * 12}px ${20 + s * 40}px rgba(0,0,0,${0.1 + s * 0.25})`;
      }
    }, { passive: true });
  }

  /* ── Init all ── */
  function init() {
    initDepthCards();
    initCardTilt();
    initHeroLines();
    initNavDepth();
    update(); // run once on load
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
