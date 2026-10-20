/* ==========================================================================
   main.js — navigation, typing headline, skills, 3D tilt, scroll reveal, contact
   Vanilla JS, no dependencies.
   ========================================================================== */

/* ==========================================================================
   Skills / toolkit — edit this single list to change the chips on the page.
   Groups without `learning: true` render as solid "known" chips; groups with
   it render as dotted "learning" chips with a small tag.
   ========================================================================== */
const SKILLS = [
  {
    title: 'Languages',
    items: ['HTML', 'CSS', 'JavaScript', 'Python'],
  },
  {
    title: 'Backend and Databases',
    items: ['FastAPI', 'MongoDB', 'SQL', 'MySQL', 'REST APIs', 'APIs'],
  },
  {
    title: 'DevOps and Linux',
    items: ['Linux', 'Docker', 'Git', 'GitHub'],
  },
  {
    title: 'Tools and Deployment',
    items: ['Vercel', 'Netlify', 'Render', 'Postman'],
  },
  {
    title: 'AI and 3D',
    items: ['YOLOv8 (AI)', 'Three.js (basic)'],
  },
  {
    title: 'CI/CD and Automation',
    learning: true,
    items: ['CI/CD Pipelines', 'GitHub Actions', 'Jenkins', 'Bash Scripting'],
  },
  {
    title: 'Containers and Orchestration',
    learning: true,
    items: ['Kubernetes', 'Helm', 'Docker Compose'],
  },
  {
    title: 'Infrastructure as Code',
    learning: true,
    items: ['Terraform', 'Ansible'],
  },
  {
    title: 'Monitoring and Observability',
    learning: true,
    items: ['Prometheus', 'Grafana'],
  },
  {
    title: 'GitOps and Platform Engineering',
    learning: true,
    items: ['GitOps', 'ArgoCD', 'Internal Developer Platforms'],
  },
  {
    title: 'Cloud and Networking',
    learning: true,
    items: ['AWS (basics)', 'Nginx'],
  },
  {
    title: 'Data',
    learning: true,
    items: ['Redis', 'GraphQL'],
  },
];

(() => {
  'use strict';

  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Skills / toolkit ---------- */
  const skillPanelEls = document.querySelectorAll('[data-skills-panel]');
  if (skillPanelEls.length) {
    const knownGroups = SKILLS.filter((group) => !group.learning);
    const learningGroups = SKILLS.filter((group) => group.learning);
    const countSkills = (groups) => groups.reduce((total, group) => total + group.items.length, 0);

    const renderGroups = (groups) => groups.map((group) => {
      const chips = group.items.map((skill) => {
        const note = group.learning ? '<span class="chip__note mono">learning</span>' : '';
        return `<li class="chip${group.learning ? ' chip--learning' : ''}">${skill}${note}</li>`;
      }).join('');

      return `<div class="skill-group reveal">
        <h3 class="skill-group__title mono">${group.title}</h3>
        <ul class="chips" aria-label="${group.title} skills">${chips}</ul>
      </div>`;
    }).join('');

    const knownMount = document.querySelector('[data-skills-panel="known"]');
    const learningMount = document.querySelector('[data-skills-panel="learning"]');
    if (knownMount) knownMount.innerHTML = renderGroups(knownGroups);
    if (learningMount) learningMount.innerHTML = renderGroups(learningGroups);

    // Counts are always derived from SKILLS, so they stay correct when edited.
    const setCount = (key, count) => {
      const el = document.querySelector(`[data-skill-count="${key}"]`);
      if (el) el.textContent = `(${count})`;
    };
    setCount('known', countSkills(knownGroups));
    setCount('learning', countSkills(learningGroups));

    const filters = Array.from(document.querySelectorAll('[data-skill-filter]'));
    const panels = {
      known: document.getElementById('skills-panel-known'),
      learning: document.getElementById('skills-panel-learning'),
    };

    function setSkillFilter(name) {
      filters.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.skillFilter === name));
      });

      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const active = key === name;
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', String(!active));
        if ('inert' in panel) panel.inert = !active;
      });
    }

    filters.forEach((button, index) => {
      button.addEventListener('click', () => setSkillFilter(button.dataset.skillFilter));

      button.addEventListener('keydown', (event) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = filters.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % filters.length;
        else nextIndex = (index - 1 + filters.length) % filters.length;

        const nextButton = filters[nextIndex];
        setSkillFilter(nextButton.dataset.skillFilter);
        nextButton.focus();
      });
    });

    setSkillFilter('known');
  }

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
     Hero typing animation
     One async state machine types the hero from empty, one character at a
     time, then erases it and loops forever. No overlapping timers.
     ========================================================================== */
  const HERO = {
    greeting: "Hi, I'm",
    name: 'Fazal-E-Rabbi Abbasi',
    prefix: "I'm a ",
    roles: [
      'Python Developer',
      'Backend Developer',
      'Aspiring Platform Engineer',
      'Linux & Docker Enthusiast',
    ],
    typeMs: 90,
    eraseMs: 50,
    afterGreetingMs: 400,
    afterNameMs: 700,
    roleHoldMs: 2000,
    emptyMs: 600,
  };

  function initHeroTyping() {
    const parts = {
      greeting: document.querySelector('[data-typer="greet"]'),
      name: document.querySelector('[data-typer="name"]'),
      prefix: document.querySelector('[data-typer="prefix"]'),
      role: document.querySelector('[data-typer="role"]'),
    };
    const cursor = document.querySelector('.typer__cursor');
    if (Object.values(parts).some((el) => !el) || !cursor) return;

    /** Put the single cursor at the end of the line that owns `el`. */
    function moveCursorTo(el) {
      el.closest('.typer__line').appendChild(cursor);
    }

    async function typeText(el, text) {
      for (const char of text) {
        el.textContent += char;
        await sleep(HERO.typeMs);
      }
    }

    async function eraseText(el) {
      while (el.textContent.length > 0) {
        el.textContent = el.textContent.slice(0, -1);
        await sleep(HERO.eraseMs);
      }
    }

    async function runTypingLoop() {
      for (;;) {
        // 1. Greeting, then a short pause.
        moveCursorTo(parts.greeting);
        await typeText(parts.greeting, HERO.greeting);
        await sleep(HERO.afterGreetingMs);

        // 2. Name on its own line, then a longer pause.
        moveCursorTo(parts.name);
        await typeText(parts.name, HERO.name);
        await sleep(HERO.afterNameMs);

        // 3. "I'm a " stays in place while each role is typed, held and erased.
        moveCursorTo(parts.role);
        await typeText(parts.prefix, HERO.prefix);
        for (const role of HERO.roles) {
          await typeText(parts.role, role);
          await sleep(HERO.roleHoldMs);
          await eraseText(parts.role);
        }

        // 4. Clear the prefix, name and greeting, then restart from empty.
        await eraseText(parts.prefix);
        moveCursorTo(parts.name);
        await eraseText(parts.name);
        moveCursorTo(parts.greeting);
        await eraseText(parts.greeting);
        await sleep(HERO.emptyMs);
      }
    }

    runTypingLoop();
  }

  initHeroTyping();

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

  if (hasFinePointer) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      initTilt(el, el.classList.contains('photo') ? 7 : 6);
    });
  }

  /* ==========================================================================
     Fade-up on scroll
     ========================================================================== */
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
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
     Contact email link
     The address is stored as two base64 parts and assembled only on click, so
     it never appears in the HTML as a plain address or a working mailto link.
     ========================================================================== */
  const emailLink = document.querySelector('[data-email-user]');
  if (emailLink) {
    emailLink.addEventListener('click', (event) => {
      event.preventDefault();
      const user = atob(emailLink.dataset.emailUser);
      const domain = atob(emailLink.dataset.emailDomain);
      window.location.href = `mailto:${user}@${domain}`;
    });
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
          setStatus(detail || 'Something went wrong. Please use the email link above or message me on WhatsApp.', 'error');
        }
      } catch {
        setStatus('Could not reach the server. Please use the email link above or message me on WhatsApp.', 'error');
      } finally {
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  }
})();
