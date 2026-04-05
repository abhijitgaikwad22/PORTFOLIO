/* ============================================================
   ABHIJIT GAIKWAD — PORTFOLIO SCRIPT
   Features: Custom cursor, navbar, mobile menu, particles,
   typed text, scroll reveal, counters, skill bars, form
   ============================================================ */

'use strict';

/* ── GSAP CURSOR ── */
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // Since we use transform translate(-50%, -50%) in CSS, GSAP sets x/y relative to it
  let xToDot = gsap.quickTo(dot, "left", {duration: 0.1, ease: "power3"}),
      yToDot = gsap.quickTo(dot, "top", {duration: 0.1, ease: "power3"}),
      xToRing = gsap.quickTo(ring, "left", {duration: 0.35, ease: "power3"}),
      yToRing = gsap.quickTo(ring, "top", {duration: 0.35, ease: "power3"});

  document.addEventListener('mousemove', e => {
    xToDot(e.clientX); yToDot(e.clientY);
    xToRing(e.clientX); yToRing(e.clientY);
  });

  const hovSel = 'a,button,.project-item,.skill-cat-block,.ach-card,.cinfo-card,input,textarea,.photo-frame';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hovSel)) { dot.classList.add('hov'); ring.classList.add('hov'); }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hovSel)) { dot.classList.remove('hov'); ring.classList.remove('hov'); }
  });
  document.addEventListener('mouseleave', () => { gsap.to([dot, ring], {opacity: 0, duration: 0.2}); });
  document.addEventListener('mouseenter', () => { gsap.to([dot, ring], {opacity: 1, duration: 0.2}); });
})();

/* ── FLOATING PARTICLES ── */
(function () {
  const wrap = document.getElementById('particles');
  if (!wrap) return;
  const count = window.innerWidth < 600 ? 14 : 28;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1.5;
    const left = Math.random() * 100;
    const dur  = Math.random() * 18 + 12;
    const delay= Math.random() * -20;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%; bottom:-5%;
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      opacity:0;
    `;
    // alternate colours
    if (i % 3 === 1) p.style.background = '#7c3aed';
    if (i % 3 === 2) p.style.background = '#10b981';
    wrap.appendChild(p);
  }
})();

/* ── NAVBAR SCROLL ── */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();

/* ── HAMBURGER ── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  let open = false;

  function toggle(force) {
    open = force !== undefined ? force : !open;
    menu.classList.toggle('open', open);
    const [a, b, c] = btn.querySelectorAll('span');
    if (open) {
      a.style.transform = 'rotate(45deg) translate(5px,5px)';
      b.style.opacity   = '0';
      c.style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      [a, b, c].forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  }

  btn.addEventListener('click', () => toggle());
  document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', () => toggle(false)));
  document.addEventListener('click', e => {
    if (open && !btn.contains(e.target) && !menu.contains(e.target)) toggle(false);
  });
})();

/* ── TYPED TEXT ── */
(function () {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'AI Developer',
    'Python Engineer',
    'Automation Builder',
    'LLM Integrator',
    'Problem Solver',
  ];

  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
      setTimeout(type, 90);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 45);
    }
  }
  setTimeout(type, 800);
})();

/* ── GSAP SCROLL REVEAL ── */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  
  const els = gsap.utils.toArray('.reveal');
  
  els.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0) / 1000;
    gsap.fromTo(el, 
      { autoAlpha: 0, y: 35 }, 
      {
        autoAlpha: 1, 
        y: 0, 
        duration: 0.8, 
        delay: delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });
})();

/* ── STAT COUNTERS ── */
(function () {
  document.querySelectorAll('[data-to]').forEach(el => {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const target = +el.dataset.to;
      const start  = performance.now();
      const dur    = 1800;
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);
    }, { threshold: 0.5 });
    io.observe(el);
  });
})();

/* ── SKILL BARS ── */
(function () {
  document.querySelectorAll('.sic-fill').forEach(bar => {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(() => bar.style.width = bar.dataset.w + '%', 200);
    }, { threshold: 0.3 });
    io.observe(bar);
  });
})();

/* ── ACTIVE NAV LINK ── */
(function () {
  const sections = document.querySelectorAll('section[id], header[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => io.observe(s));
})();

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || 70);
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
  });
});

/* ── EMAILJS CONFIG ── */
const EMAILJS_SERVICE_ID  = 'service_hpryysx';
const EMAILJS_TEMPLATE_ID = 'template_4ermimm';
const EMAILJS_PUBLIC_KEY  = 'gfkPLpvP2AeYUfNux';

/* ── CONTACT FORM ── */
(function () {
  const btn  = document.getElementById('submitBtn');
  const wrap = document.getElementById('formWrap');
  const done = document.getElementById('formDone');
  if (!btn || !wrap || !done) return;

  // Load EmailJS SDK dynamically
  const sdk = document.createElement('script');
  sdk.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  sdk.onload = () => emailjs.init(EMAILJS_PUBLIC_KEY);
  document.head.appendChild(sdk);

  btn.addEventListener('click', () => {
    const name    = document.getElementById('cname').value.trim();
    const email   = document.getElementById('cemail').value.trim();
    const subject = document.getElementById('csubject').value.trim();
    const message = document.getElementById('cmessage').value.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Shake invalid fields
    [['cname', name], ['cemail', email], ['cmessage', message]].forEach(([id, val]) => {
      if (!val || (id === 'cemail' && !isEmail)) {
        const el = document.getElementById(id);
        el.style.borderColor = '#ef4444';
        el.style.animation   = 'shake .35s ease';
        setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 2200);
      }
    });
    if (!name || !email || !message || !isEmail) return;

    // Loading state
    btn.disabled = true;
    btn.innerHTML = `<svg style="animation:spin .7s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M21 12a9 9 0 11-6.2-8.56"/></svg> Sending…`;

    const templateParams = {
      from_name:  name,
      from_email: email,
      subject:    subject || 'Portfolio Contact',
      message:    message,
      reply_to:   email,
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        wrap.style.display = 'none';
        done.style.display = 'flex';
      })
      .catch(err => {
        console.error('EmailJS error:', err);
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
        // Show inline error
        let errMsg = document.getElementById('formError');
        if (!errMsg) {
          errMsg = document.createElement('p');
          errMsg.id = 'formError';
          errMsg.style.cssText = 'color:#ef4444;font-size:.82rem;margin-top:.6rem;text-align:center;';
          btn.after(errMsg);
        }
        errMsg.textContent = '⚠️ Failed to send. Please email directly: abhijitsgaikwad2244@gmail.com';
      });
  });
})();

/* ── INJECT KEYFRAMES ── */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-7px)} 40%{transform:translateX(7px)}
      60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();

/* ── PHOTO FALLBACK (base64 if file missing) ── */
(function () {
  ['heroPhoto', 'aboutPhoto'].forEach(id => {
    const img = document.getElementById(id);
    if (!img) return;
    img.addEventListener('error', () => {
      // Show styled initials placeholder if photo doesn't load
      const wrap = img.parentElement;
      const placeholder = document.createElement('div');
      const size = id === 'heroPhoto' ? '320px' : '300px';
      const height = id === 'heroPhoto' ? '360px' : '340px';
      const radius = id === 'heroPhoto' ? '30px' : '24px';
      placeholder.style.cssText = `
        width:${size}; height:${height}; border-radius:${radius};
        background:linear-gradient(135deg,rgba(0,229,255,.12),rgba(124,58,237,.15));
        border:2px solid rgba(0,229,255,.25);
        display:flex; align-items:center; justify-content:center;
        font-size:5rem; font-weight:900; color:transparent;
        background-clip:text; -webkit-background-clip:text;
        font-family:'Outfit',sans-serif; letter-spacing:-.02em;
      `;
      placeholder.style.background = 'linear-gradient(135deg,#00e5ff,#7c3aed)';
      placeholder.style.webkitBackgroundClip = 'text';
      placeholder.style.webkitTextFillColor = 'transparent';
      placeholder.textContent = 'AG';
      img.replaceWith(placeholder);
    });
  });
})();