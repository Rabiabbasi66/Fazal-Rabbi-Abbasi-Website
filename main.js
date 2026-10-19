/* ==========================================================================
   main.js — navigation, typing headline, 3D tilt, scroll reveal, contact form
   Vanilla JS, no dependencies.
   ========================================================================== */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ==========================================================================
     Mobile navigation
     ========================================================================== */
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('is-open') && !e.target.closest('.nav')) setMenu(false);
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* ==========================================================================
     Active section highlight
     ========================================================================== */
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));
  const linkFor = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const trackedSections = ['home', ...linkFor.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach((a) => {
      const active = a === linkFor.get(id);
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && trackedSections.length) {
    // A section is "active" when it crosses a thin band near the upper middle of the viewport.
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    trackedSections.forEach((s) => sectionObserver.observe(s));
  }

  /* ==========================================================================
     Typing headline
     One async state machine runs the whole loop, so steps can never overlap.
     Timers are deadline-based (no drift), pause while the tab is hidden and
     are cancelled on page unload.
     ========================================================================== */
  const TYPER_TIMING = {
    type: 90,            // ms per character while typing (all lines)
    eraseRole: 50,       // ms per character when erasing a role
    eraseAll: 50,        // ms per character when erasing "I'm a", name and greeting
    afterGreet: 400,     // pause after "Hi, I'm"
    afterName: 700,      // pause after the name
    roleHold: 2000,      // how long a finished role stays visible
    beforeEraseAll: 1000,// pause after the last role is erased
    beforeRestart: 600,  // pause before the loop starts again
  };
  const ROLES = [
    'Python Developer',
    'Backend Developer',
    'Aspiring Platform Engineer',
    'Linux & Docker Enthusiast',
  ];

  function initTyper() {
    const parts = {
      greet: document.querySelector('[data-typer="greet"]'),
      name: document.querySelector('[data-typer="name"]'),
      prefix: document.querySelector('[data-typer="prefix"]'),
      role: document.querySelector('[data-typer="role"]'),
    };
    const cursor = document.querySelector('.typer__cursor');
    if (!cursor || Object.values(parts).some((el) => !el)) return;

    // Reduced motion: keep the static markup (full name + first role), no loop.
    if (prefersReducedMotion) return;

    const texts = {
      greet: parts.greet.textContent,
      name: parts.name.textContent,
      prefix: parts.prefix.textContent,
    };

    const STOP = Symbol('typer-stopped');
    let stopped = false;
    let timer = 0;
    let pending = null;     // { resolve, reject } of the current wait()
    let deadline = 0;       // absolute time (ms) the current wait() should end
    let hiddenAt = 0;

    /** Wait `ms` after the previous deadline (not after "now"), so timer lag never accumulates. */
    function wait(ms) {
      return new Promise((resolve, reject) => {
        if (stopped) { reject(STOP); return; }
        pending = { resolve, reject };
        deadline = Math.max(deadline + ms, performance.now());
        schedule();
      });
    }

    function schedule() {
      clearTimeout(timer);
      if (!pending || document.hidden) return; // resumed by visibilitychange
      timer = setTimeout(() => {
        const p = pending;
        pending = null;
        p.resolve();
      }, Math.max(0, deadline - performance.now()));
    }

    // Pause while hidden; on return, shift the schedule so it resumes exactly where it stopped.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(timer);
        hiddenAt = performance.now();
      } else {
        deadline += performance.now() - hiddenAt;
        schedule();
      }
    });

    // Cancel timers on unload; restart cleanly if the page comes back from the back/forward cache.
    window.addEventListener('pagehide', () => {
      stopped = true;
      clearTimeout(timer);
      if (pending) { pending.reject(STOP); pending = null; }
    });
    window.addEventListener('pageshow', (event) => {
      if (event.persisted && stopped) { stopped = false; run(); }
    });

    /** Put the single cursor at the end of the given line. */
    function moveCursor(key) {
      parts[key].closest('.typer__line').appendChild(cursor);
    }

    async function type(el, text, speed) {
      cursor.classList.add('is-typing');
      for (const ch of text) {
        el.textContent += ch;
        await wait(speed);
      }
      cursor.classList.remove('is-typing');
    }

    async function erase(el, speed) {
      cursor.classList.add('is-typing');
      while (el.textContent.length) {
        el.textContent = el.textContent.slice(0, -1);
        await wait(speed);
      }
      cursor.classList.remove('is-typing');
    }

    async function loop() {
      const T = TYPER_TIMING;
      for (;;) {
        // 1. "Hi, I'm"
        moveCursor('greet');
        await type(parts.greet, texts.greet, T.type);
        await wait(T.afterGreet);

        // 2. Name
        moveCursor('name');
        await type(parts.name, texts.name, T.type);
        await wait(T.afterName);

        // 3-4. "I'm a " + each role: type, hold, erase
        moveCursor('role');
        await type(parts.prefix, texts.prefix, T.type);
        for (const role of ROLES) {
          await type(parts.role, role, T.type);
          await wait(T.roleHold);
          await erase(parts.role, T.eraseRole);
        }

        // 5. Erase bottom-up: "I'm a ", name, greeting
        await wait(T.beforeEraseAll);
        await erase(parts.prefix, T.eraseAll);
        moveCursor('name');
        await erase(parts.name, T.eraseAll);
        moveCursor('greet');
        await erase(parts.greet, T.eraseAll);

        // 6. Short pause, then start over
        await wait(T.beforeRestart);
      }
    }

    function run() {
      Object.values(parts).forEach((el) => { el.textContent = ''; });
      cursor.classList.remove('is-typing');
      deadline = performance.now();
      loop().catch((err) => { if (err !== STOP) throw err; });
    }

    run();
  }

  initTyper();

  /* ==========================================================================
     CSS 3D tilt (desktop / fine pointer only)
     ========================================================================== */
  function initTilt(el, maxDeg) {
    let frame = 0;
    let pending = null;

    function apply() {
      frame = 0;
      if (!pending) return;
      const { px, py } = pending;               // -0.5 .. 0.5
      const ry = px * 2 * maxDeg;
      const rx = -py * 2 * maxDeg;
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      // Shadow drifts opposite to the tilt so the light source feels fixed.
      el.style.setProperty('--sx', `${(-ry * 1.4).toFixed(1)}px`);
      el.style.setProperty('--sy', `${(14 + rx * 1.4).toFixed(1)}px`);
    }

    el.addEventListener('pointerenter', () => el.classList.add('is-tilting'));
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      pending = { px: (e.clientX - r.left) / r.width - 0.5, py: (e.clientY - r.top) / r.height - 0.5 };
      if (!frame) frame = requestAnimationFrame(apply);
    });
    el.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pending = null;
      el.classList.remove('is-tilting');
      ['--rx', '--ry', '--sx', '--sy'].forEach((p) => el.style.removeProperty(p));
    });
  }

  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      initTilt(el, el.classList.contains('photo') ? 7 : 6);
    });
  }

  /* ==========================================================================
     Fade-up on scroll
     ========================================================================== */
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ==========================================================================
     Contact form (posts to the existing FastAPI backend)
     ========================================================================== */
  const API_BASE_URL = 'https://fazal-rabbi-abbasi-website-dcbx.vercel.app';
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-success', type === 'success');
    statusEl.classList.toggle('is-error', type === 'error');
  }

  function validate(fields) {
    const errors = [];
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim());
    const checks = [
      [fields.name, fields.name.value.trim().length >= 2, 'Please enter your name.'],
      [fields.email, emailOk, 'Please enter a valid email address.'],
      [fields.message, fields.message.value.trim().length >= 10, 'Please write a message of at least 10 characters.'],
    ];
    checks.forEach(([input, ok, msg]) => {
      input.setAttribute('aria-invalid', String(!ok));
      if (!ok) errors.push({ input, msg });
    });
    return errors;
  }

  if (form) {
    const fields = { name: form.elements.name, email: form.elements.email, message: form.elements.message };
    const submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errors = validate(fields);
      if (errors.length) {
        setStatus(errors[0].msg, 'error');
        errors[0].input.focus();
        return;
      }

      const name = fields.name.value.trim();
      const payload = {
        name,
        email: fields.email.value.trim(),
        subject: `Portfolio message from ${name}`, // backend schema requires a subject
        message: fields.message.value.trim(),
      };

      submit.disabled = true;
      const label = submit.textContent;
      submit.textContent = 'Sending...';
      setStatus('', null);

      try {
        const res = await fetch(`${API_BASE_URL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success !== false) {
          setStatus('Thanks, your message was sent. I will get back to you soon.', 'success');
          form.reset();
          Object.values(fields).forEach((f) => f.removeAttribute('aria-invalid'));
        } else {
          const detail = typeof data.detail === 'string' ? data.detail : data.message;
          setStatus(detail || 'Something went wrong. Please email me directly instead.', 'error');
        }
      } catch (err) {
        setStatus('Could not reach the server. Please email me at Rabif1820@gmail.com.', 'error');
      } finally {
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  }
})();
