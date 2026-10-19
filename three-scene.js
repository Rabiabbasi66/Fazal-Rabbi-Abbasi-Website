/* ==========================================================================
   three-scene.js — subtle hero background
   A few matte shapes floating slowly with gentle mouse parallax.
   Pauses when the hero is off-screen or the tab is hidden.
   ========================================================================== */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const canvas = document.getElementById('hero-canvas');
const hero = document.getElementById('home');

if (canvas && hero) init();

function init() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Renderer ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (err) {
    return; // No WebGL: the page simply has no 3D background.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  /* ---------- Scene, camera, lights ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  scene.add(new THREE.HemisphereLight(0xfff8ee, 0xd9c9b0, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);

  /* ---------- Shapes ----------
     Each shape is anchored to a corner of a real DOM element (the text column,
     the photo frame) so it always sits in empty space or tucks behind a card,
     never over readable text. ax/ay are fractions of the anchor's box (may be
     outside 0..1), px is the approximate on-screen radius in CSS pixels. */
  const palette = {
    sand: 0xe6dccc,
    beige: 0xdcc7a8,
    caramel: 0xd6a273,
    terracotta: 0xb5651d,
  };

  const geometryFor = {
    ico: () => new THREE.IcosahedronGeometry(1, 0),
    torus: () => new THREE.TorusGeometry(0.74, 0.27, 24, 72),
    sphere: () => new THREE.SphereGeometry(1, 40, 40),
  };

  const desktopSpecs = [
    { type: 'ico', color: palette.beige, anchor: 'text', ax: -0.03, ay: 0.06, z: -1, px: 58 },
    { type: 'torus', color: palette.caramel, anchor: 'photo', ax: 1.0, ay: 0.02, z: -2, px: 56 },
    { type: 'sphere', color: palette.sand, anchor: 'photo', ax: 0.96, ay: 1.0, z: -1, px: 60 },
    { type: 'ico', color: palette.terracotta, anchor: 'photo', ax: -0.06, ay: -0.03, z: -3, px: 24 },
    { type: 'torus', color: palette.sand, anchor: 'text', ax: 0.86, ay: 0.95, z: -3, px: 30 },
  ];
  // Single-column layout: only the empty space to the right of the small photo.
  const mobileSpecs = [
    { type: 'torus', color: palette.caramel, anchor: 'photo', ax: 1.95, ay: 0.32, z: -2, px: 30 },
    { type: 'ico', color: palette.beige, anchor: 'photo', ax: 1.4, ay: 0.72, z: -1, px: 24 },
  ];

  const anchors = {
    text: hero.querySelector('.hero__text'),
    photo: hero.querySelector('.photo'),
  };
  const singleColumnQuery = window.matchMedia('(max-width: 860px)');

  const group = new THREE.Group();
  scene.add(group);

  const geometries = [];
  const materials = [];
  let meshes = [];

  function buildShapes() {
    meshes.forEach((m) => group.remove(m));
    geometries.splice(0).forEach((g) => g.dispose());
    materials.splice(0).forEach((m) => m.dispose());

    const specs = singleColumnQuery.matches ? mobileSpecs : desktopSpecs;
    meshes = specs.map((spec, i) => {
      const geometry = geometryFor[spec.type]();
      const material = new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.92,
        metalness: 0,
        flatShading: spec.type === 'ico',
      });
      geometries.push(geometry);
      materials.push(material);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(i * 0.9, i * 1.3, 0);
      mesh.userData = {
        spec,
        phase: i * 1.7,
        floatSpeed: 0.35 + (i % 3) * 0.08,
        floatPx: 6 + (i % 2) * 3,     // float amplitude in CSS pixels
        spin: 0.08 + (i % 3) * 0.03,
        baseY: 0,
        floatAmp: 0,
      };
      group.add(mesh);
      return mesh;
    });
  }

  /* ---------- Layout / resize ---------- */
  function layout() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const heroRect = hero.getBoundingClientRect();
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);

    meshes.forEach((mesh) => {
      const { spec } = mesh.userData;
      const el = anchors[spec.anchor] || hero;
      const r = el.getBoundingClientRect();
      // Anchor point in hero-relative CSS pixels, kept inside the hero.
      const x = Math.min(Math.max(r.left - heroRect.left + r.width * spec.ax, spec.px), w - spec.px);
      const y = Math.min(Math.max(r.top - heroRect.top + r.height * spec.ay, spec.px), h - spec.px);

      // Convert pixels to world units at the shape's depth.
      const dist = camera.position.z - spec.z;
      const halfH = Math.tan(halfFov) * dist;
      const halfW = halfH * camera.aspect;
      const unitsPerPx = (2 * halfH) / h;

      mesh.position.set(((x / w) * 2 - 1) * halfW, (1 - (y / h) * 2) * halfH, spec.z);
      mesh.scale.setScalar(spec.px * unitsPerPx);
      mesh.userData.baseY = mesh.position.y;
      mesh.userData.floatAmp = mesh.userData.floatPx * unitsPerPx;
    });
  }

  buildShapes();
  singleColumnQuery.addEventListener('change', () => { buildShapes(); layout(); if (!rafId) renderFrame(); });

  /* ---------- Mouse parallax ---------- */
  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  if (finePointer && !reducedMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ---------- Render loop ---------- */
  const clock = new THREE.Clock(false);
  let elapsed = 0;
  let rafId = 0;
  let heroVisible = true;
  let firstFrame = true;

  function renderFrame() {
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      canvas.classList.add('is-ready');
    }
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05); // clamp after pauses
    elapsed += dt;

    meshes.forEach((mesh) => {
      const d = mesh.userData;
      mesh.position.y = d.baseY + Math.sin(elapsed * d.floatSpeed + d.phase) * d.floatAmp;
      mesh.rotation.x += d.spin * dt;
      mesh.rotation.y += d.spin * 0.8 * dt;
    });

    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;
    group.rotation.y = eased.x * 0.12;
    group.rotation.x = eased.y * 0.08;
    group.position.x = eased.x * 0.3;
    group.position.y = -eased.y * 0.2;

    renderFrame();
  }

  function start() {
    if (rafId || reducedMotion || document.hidden || !heroVisible) return;
    clock.start();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
    clock.stop();
  }

  layout();

  if (reducedMotion) {
    renderFrame(); // static fallback: a single still frame
  } else {
    start();
  }

  // Pause when the hero leaves the viewport.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      heroVisible ? start() : stop();
    }, { threshold: 0 }).observe(hero);
  }

  // Pause when the tab is hidden.
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  // Keep the canvas sized to the hero.
  const onResize = () => {
    layout();
    if (!rafId) renderFrame();
  };
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(hero);
  else window.addEventListener('resize', onResize);

  // Free GPU resources when the page is really unloaded (not when it enters the bfcache).
  window.addEventListener('pagehide', (e) => {
    if (e.persisted) { stop(); return; }
    stop();
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    renderer.dispose();
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) start(); });
}
