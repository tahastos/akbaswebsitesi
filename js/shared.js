/* Akbaş Design: shared helpers for both 3D scenes (hero + process).
   Loaded as a classic script after three.js so the site also works when opened via file://. */
window.AKBAS = (function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const e3 = p => 1 - Math.pow(1 - p, 3); // ease-out cubic
  const ss = (p, a, b) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); }; // smoothstep

  const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = () => matchMedia('(pointer:coarse)').matches;

  // Deterministic pseudo-random generator; each scene keeps its own seed so the layout never changes.
  const makeRnd = seed => { let sd = seed; return () => (sd = (sd * 16807) % 2147483647) / 2147483647; };

  /* ---------- geometry / mesh helpers (THREE must already be loaded) ---------- */

  // Material: colour, roughness, metalness, env-map intensity
  const M = (c, r = .7, m = 0, ei = .7) => {
    const x = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
    x.envMapIntensity = ei;
    return x;
  };

  // Rounded box geometry (bevelled extrusion)
  function rgeo(w, h, d, r) {
    const b = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001), bw = w - 2 * b, bh = h - 2 * b, dp = Math.max(d - 2 * b, .001);
    const s = new THREE.Shape();
    s.moveTo(-bw / 2, -bh / 2); s.lineTo(bw / 2, -bh / 2); s.lineTo(bw / 2, bh / 2); s.lineTo(-bw / 2, bh / 2); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: dp, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 1 });
    g.translate(0, 0, -dp / 2);
    return g;
  }

  const sh = m => { m.castShadow = m.receiveShadow = true; return m; };

  // Rounded box
  const B = (p, w, h, d, r, mat, x, y, z) => { const m = sh(new THREE.Mesh(rgeo(w, h, d, r), mat)); m.position.set(x, y, z); p.add(m); return m; };
  // Plain box (s = shadows)
  const BX = (p, w, h, d, mat, x, y, z, s = true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = s; p.add(m); return m; };
  // Cylinder
  const Cy = (p, rt, rb, h, mat, x, y, z, s = true, seg = 20) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = s; p.add(m); return m; };
  // Sphere
  const Sp = (p, r, mat, x, y, z, s = false) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat); m.position.set(x, y, z); m.castShadow = s; p.add(m); return m; };

  // Texture drawn on a 2D canvas
  function canvasTex(w, h, draw, srgb = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }

  // Shared renderer setup; returns null when WebGL is unavailable.
  function makeRenderer(canvas, exposure) {
    let R;
    try { R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = exposure;
    R.shadowMap.enabled = true;
    R.shadowMap.type = THREE.PCFSoftShadowMap;
    return R;
  }

  return { clamp, e3, ss, prefersReducedMotion, isCoarsePointer, makeRnd, M, rgeo, sh, B, BX, Cy, Sp, canvasTex, makeRenderer };
})();
