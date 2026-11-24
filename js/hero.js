/* Akbaş Design: hero 3D apartment.
   Scrolling furnishes a 2+1 flat room by room while the camera tours it; drag sideways to turn the house.
   Plan (metres, x → east, z → south/front):
     Bedroom 0–5.0 × 0–5.0 | Study 5.0–8.4 × 0–3.8 | Living 8.4–15.0 × 0–7.4
     Bath 0–5.0 × 5.0–7.6  | Corridor 5.0–6.6 × 3.8–11.6 (front door at z=11.6) + hall 6.6–8.4 × 3.8–7.4
     Kitchen + dining 0–5.0 × 7.6–11.6 | Balcony 11.6–14.8 × 7.6–8.9, entered from the living room
   All door openings are 1.0 m wide.
   Back walls (z=0, x=0) are full height with windows; all other walls are cut at LOW like an architectural section. */
(function () {
const { clamp, e3, ss, M, B, BX, Cy, Sp, sh, canvasTex, makeRnd, makeRenderer, prefersReducedMotion, isCoarsePointer } = AKBAS;
const reduce = prefersReducedMotion();
const hero = document.getElementById('hero'), stage = hero.querySelector('.stage'), cv = document.getElementById('c'), hint = hero.querySelector('.hhint');
const caps = [...hero.querySelectorAll('.caps>div')], dots = [...hero.querySelectorAll('.dots i')];
const LAST = caps.length - 1, stepNo = hero.querySelector('.hcard b');
let shown = -1, dragged = false;
const setIdx = i => {
  if (i === shown) return; shown = i;
  stage.dataset.step = i;
  if (stepNo) stepNo.textContent = String(i + 1).padStart(2, '0');
  caps.forEach((e, k) => e.classList.toggle('on', k === i));
  dots.forEach((e, k) => e.classList.toggle('on', k === i));
  if (hint) hint.classList.toggle('on', i === LAST && !dragged);
};
if (reduce) hero.style.height = '100svh';
if (typeof THREE === 'undefined') { setIdx(LAST); return; }
const R = makeRenderer(cv, .92); if (!R) { setIdx(LAST); return; }
const coarse = isCoarsePointer();
let pr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
R.setPixelRatio(pr);
if (coarse) R.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, 1, .5, 200);
const PI = Math.PI, W = 15.0, D = 11.6, HX = 6.6, E = 7.4, H = 2.8, LOW = 1.05, T = .2, t = .12;  // L-shaped footprint: west wing 0–HX × 0–D, east wing HX–W × 0–E
const BW0 = 11.6, BW1 = 14.8, BZ = 8.9;  // balcony in front of the living room
const rnd = makeRnd(7);

/* ---------- soft studio reflections (so brass, steel and marble read correctly) ---------- */
(function () {
  const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 16), new THREE.MeshBasicMaterial({ color: 0x4d4945, side: THREE.BackSide })));
  const pnl = (w, h, c, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
  pnl(40, 20, 0xcfc5b8, 0, 40, 0); pnl(30, 14, 0xb8b1a6, 40, 10, 20); pnl(20, 10, 0xcfd6e0, -30, 12, -35); pnl(60, 10, 0x4a4440, 0, -30, 0);
  const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(es, .04).texture; pm.dispose();
})();

/* ---------- textures ---------- */
function marbleTex(S, n, l, hue, vein) {
  return canvasTex(S, S, (x) => {
    const ts = S / n, k = S / 512; x.lineJoin = x.lineCap = 'round';
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = 'hsl(' + hue + ',22%,' + (l + rnd() * 3) + '%)'; x.fillRect(i * ts, j * ts, ts, ts); }
    const v = (w, col) => { let px = rnd() * S, py = rnd() * S, a = rnd() * 6.28; x.beginPath(); x.moveTo(px, py); const st = 18 + (rnd() * 26 | 0); for (let s = 0; s < st; s++) { a += (rnd() - .5) * .9; px += Math.cos(a) * 24 * k; py += Math.sin(a) * 24 * k; x.lineTo(px, py); } x.lineWidth = w * k; x.strokeStyle = col; x.stroke(); };
    for (let i = 0; i < 14; i++) v(12 + rnd() * 16, 'rgba(200,160,120,.06)');
    for (let i = 0; i < vein; i++) v(1 + rnd() * 2.4, 'rgba(150,118,90,.32)');
    for (let i = 0; i < 10; i++) v(.8, 'rgba(110,100,92,.25)');
    if (n > 1) { x.strokeStyle = 'rgba(120,104,92,.35)'; x.lineWidth = 1.5 * k; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * ts, 0); x.lineTo(i * ts, S); x.moveTo(0, i * ts); x.lineTo(S, i * ts); x.stroke(); } }
  });
}
function plankTex(h0, s0, l0) {
  return canvasTex(512, 512, (x) => {
    const n = 10, h = 512 / n;
    for (let i = 0; i < n; i++) {
      let px = -rnd() * 220;
      while (px < 512) {
        const w = 180 + rnd() * 200;
        x.fillStyle = 'hsl(' + (h0 + rnd() * 4) + ',' + (s0 + rnd() * 6) + '%,' + (l0 + rnd() * 8) + '%)'; x.fillRect(px, i * h, w, h);
        x.globalAlpha = .08; for (let g = 0; g < 5; g++) { x.fillStyle = rnd() > .5 ? '#fff' : '#000'; x.fillRect(px, i * h + rnd() * h, w, 1 + rnd() * 2); } x.globalAlpha = 1;
        x.fillStyle = 'rgba(60,40,25,.35)'; x.fillRect(px, i * h, 1.5, h); px += w;
      }
      x.fillStyle = 'rgba(60,40,25,.35)'; x.fillRect(0, i * h, 512, 1.5);
    }
  });
}
function stoneTex() {
  return canvasTex(256, 256, (x) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = 'hsl(30,6%,' + (60 + rnd() * 5) + '%)'; x.fillRect(i * 64, j * 64, 64, 64); }
    x.strokeStyle = 'rgba(70,62,55,.45)'; x.lineWidth = 2; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 256); x.moveTo(0, i * 64); x.lineTo(256, i * 64); x.stroke(); }
  });
}
const rep = (tx, rx, ry) => { const c = tx.clone(); c.wrapS = c.wrapT = THREE.MirroredRepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; };
const glowTex = (w, h, draw) => canvasTex(w, h, (x, W2, H2) => { x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.shadowColor = '#fff'; draw(x, W2, H2); }, false);
const glowMats = [];
const glowPlane = (p, tex, w, h, x, y, z, ry, str) => {
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, color: 0xffc184 });
  m.userData.k = str; glowMats.push(m);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); pl.position.set(x, y, z); pl.rotation.y = ry || 0; p.add(pl); return pl;
};
const floorGlowT = canvasTex(4, 64, (x) => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, false);
const floorGlow = (w, d, x, z, rz, str = .55) => { const pl = glowPlane(scene, floorGlowT, w, d, x, .014, z, 0, str); pl.rotation.set(-PI / 2, 0, rz || 0); };

/* ---------- materials ---------- */
const sage = M(0x76876c, .62), sageD = M(0x63725a, .7), creamF = M(0xe3d9ca, .95), ivory = M(0xf4efe7, .55), dark = M(0x1d1b19, .45, 0, .5);
const brass = M(0xc9a466, .32, .95, 1), copper = M(0xb8754a, .3, .95, 1), steel = M(0xa7aaad, .28, .9, 1), glassD = M(0x101214, .15, .2, 1), oak = M(0xb88d5e, .55), oakL = M(0xcaa678, .6), walnut = M(0x5a3d2a, .55);
const green = M(0x4f6a47, .8), pot = M(0xe7e1d6, .6), taupeW = M(0x9b8676, .9), cushM = M(0xf1ebe1, .95), terra = M(0xb06f4f, .8);
const glassM = new THREE.MeshStandardMaterial({ color: 0xd5e6ea, roughness: .05, metalness: .1, transparent: true, opacity: .22, depthWrite: false });
const mirrorM = M(0xdfe5ea, .05, 1, 1);
const ledM = new THREE.MeshStandardMaterial({ color: 0x3a332c, emissive: 0xffc27a, emissiveIntensity: 0 });
const backM = new THREE.MeshStandardMaterial({ color: 0xcbb699, roughness: .9, emissive: 0xffc98a, emissiveIntensity: 0 });
const bulbM = new THREE.MeshStandardMaterial({ color: 0xf6efe2, roughness: .4, emissive: 0xffd8a0, emissiveIntensity: .05 });
const marT = marbleTex(512, 1, 91, 32, 24), floorT = marbleTex(1024, 4, 82, 30, 18), oakT = plankTex(30, 38, 58), stoneT = stoneTex();
const marM = (rx, ry) => { const m = new THREE.MeshStandardMaterial({ map: rep(marT, rx, ry), roughness: .2 }); m.envMapIntensity = .8; return m; };
const splM = (rx, ry) => { const tx = rep(marT, rx, ry); const m = new THREE.MeshStandardMaterial({ map: tx, roughness: .25, emissive: 0xffc890, emissiveMap: tx, emissiveIntensity: 0 }); m.envMapIntensity = .6; return m; };
const splash = [];

/* =================== SHELL: L-shaped slab, walls, windows, doors =================== */
const slabM = M(0xb8b2a8, .95);
B(scene, HX + .5, .3, D + .5, .03, slabM, HX / 2, -.15, D / 2);
B(scene, W - HX, .3, E + .5, .03, slabM, (W + HX + .5) / 2, -.15, E / 2);
const wallMat = M(0xc4c7cc, .95, 0, .5), capM = M(0x4a433c, .85, 0, .3), frameM = M(0xece6dc, .5);
const winGlow = new THREE.MeshBasicMaterial({ color: 0xdfe9ff });

function addWindow(axis, c, a, b, y0, y1, th) {
  const w = b - a, h = y1 - y0, g = new THREE.Group();
  g.position.set(axis === 'x' ? (a + b) / 2 : c, (y0 + y1) / 2, axis === 'x' ? c : (a + b) / 2);
  if (axis === 'z') g.rotation.y = PI / 2;
  scene.add(g);
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), winGlow));
  const bars = [[w, .06, 0, h / 2 - .03], [w, .06, 0, -h / 2 + .03], [.06, h, -w / 2 + .03, 0], [.06, h, w / 2 - .03, 0]];
  if (w > 1) bars.push([.04, h, 0, 0]);
  bars.forEach(q => BX(g, q[0], q[1], .07, frameM, q[2], q[3], 0, false));
  BX(g, w + .1, .035, th / 2 + .1, frameM, 0, -h / 2 - .017, th / 4 + .05, false);
}
// axis 'x' runs along x at z=c; axis 'z' runs along z at x=c. ops: [from, to] door gap or [from, to, sill, head] window.
function wall(axis, c, a0, a1, h, th, ops = [], cast = true) {
  const box = (a, b, y0, y1, mat, extra = 0) => {
    const len = b - a, hh = y1 - y0, x = (a + b) / 2, y = (y0 + y1) / 2;
    const m = axis === 'x' ? BX(scene, len, hh, th + extra, mat, x, y, c) : BX(scene, th + extra, hh, len, mat, c, y, x);
    m.castShadow = cast && mat === wallMat; return m;
  };
  const piece = (a, b, y0, y1) => {
    if (b - a < .005 || y1 - y0 < .005) return;
    box(a, b, y0, y1, wallMat);
    if (y1 >= h && h < H - .01) box(a, b, h, h + .014, capM, .004);  // section-cut cap
  };
  let a = a0;
  for (const o of ops.slice().sort((p, q) => p[0] - q[0])) {
    piece(a, o[0], 0, h);
    const sill = o[2] || 0, head = Math.min(o[3] || h, h);
    if (sill > 0) { piece(o[0], o[1], 0, sill); addWindow(axis, c, o[0], o[1], sill, head, th); }
    else box(o[0], o[1], 0, .012, M(0xa98258, .6), .02);  // oak threshold
    if (head < h) piece(o[0], o[1], head, h);
    a = o[1];
  }
  piece(a, a1, 0, h);
}
// full-height back walls with windows (bedroom, study, living ×2 | kitchen)
wall('x', -T / 2, -T, W + T, H, T, [[1.0, 2.4, .85, 2.3], [6.2, 7.6, .9, 2.25], [8.75, 9.6, .85, 2.3], [13.85, 14.75, .85, 2.3]], false);
wall('z', -T / 2, 0, D + T, H, T, [[10.4, 11.0, 1.55, 2.3]], false);
// exterior walls on the camera side, cut low
wall('x', D + T / 2, 0, HX + T, LOW, T, [[5.3, 6.3]]);   // front of the west wing, with the entrance
wall('z', HX + T / 2, E + T, D, LOW, T);                  // side of the corridor
wall('x', E + T / 2, HX, W + T, LOW, T, [[12.5, 13.5]]);  // front of the east wing, balcony door
wall('z', W + T / 2, 0, E, LOW, T);
// interior partitions (every door opening is 1.0 m)
wall('z', 5.0, 0, D, LOW, t, [[3.9, 4.9], [5.6, 6.6], [8.6, 9.6]]);   // bedroom, bath, kitchen | study, corridor
wall('x', 5.0, 0, 5.0 - t / 2, LOW, t);                                // bedroom | bath
wall('x', 7.6, 0, 5.0 - t / 2, LOW, t);                                // bath | kitchen
wall('x', 3.8, 5.0 + t / 2, 8.4, LOW, t, [[7.0, 8.0]]);                // study | hall
wall('z', 8.4, 0, E, LOW, t, [[5.0, 6.0]]);                            // study, hall | living
// balcony: slab, low parapet with a glass rail
B(scene, BW1 - BW0 + .2, .3, BZ - E + .1, .03, slabM, (BW0 + BW1) / 2, -.15, (E + BZ) / 2 + .05);
wall('x', BZ + .05, BW0 - .1, BW1 + .1, .22, .1);
wall('z', BW0 - .05, E + T, BZ, .22, .1); wall('z', BW1 + .05, E + T, BZ, .22, .1);
{
  const railM = M(0x3a3632, .5, .6, 1);
  BX(scene, BW1 - BW0 + .2, .72, .02, glassM, (BW0 + BW1) / 2, .6, BZ + .05, false);
  [BW0 - .05, BW1 + .05].forEach(x => BX(scene, .02, .72, BZ - E - T, glassM, x, .6, (E + T + BZ) / 2, false));
  BX(scene, BW1 - BW0 + .24, .04, .05, railM, (BW0 + BW1) / 2, .98, BZ + .05, false);
  [BW0 - .05, BW1 + .05].forEach(x => BX(scene, .05, .04, BZ - E - T + .05, railM, x, .98, (E + T + BZ) / 2, false));
}

/* ---------- floors (fade in) ---------- */
const floors = [];
const mkFloor = (tex, x0, x1, z0, z1, tile, rough) => {
  const w = x1 - x0, d = z1 - z0;
  const m = new THREE.MeshStandardMaterial({ map: rep(tex, w / tile, d / tile), roughness: rough, transparent: true, opacity: 0 }); m.envMapIntensity = .5;
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); f.rotation.x = -PI / 2; f.position.set((x0 + x1) / 2, .004, (z0 + z1) / 2); f.receiveShadow = true; scene.add(f); floors.push(m);
};
mkFloor(oakT, 8.4, W, 0, E, 4, .6);            // living oak
mkFloor(oakT, 0, 5.0, 0, 5.0, 4, .6);          // bedroom oak
mkFloor(oakT, 5.0, 8.4, 0, 3.8, 4, .6);        // study oak
mkFloor(floorT, 5.0, HX, 3.8, D, 2.4, .3);     // corridor marble
mkFloor(floorT, HX, 8.4, 3.8, E, 2.4, .3);     // hall marble
mkFloor(floorT, 0, 5.0, 5.0, 7.6, 1.6, .25);   // bath marble tiles
mkFloor(stoneT, 0, 5.0, 7.6, D, 2.4, .55);     // kitchen stone
mkFloor(stoneT, BW0, BW1, E + T, BZ, 1.6, .6);  // balcony stone

/* ---------- scroll registry ---------- */
const items = [];
const reg = (o, s, e, m = 'drop') => { o.userData.y = o.position.y; o.visible = false; if (o.parent !== scene) scene.add(o); items.push({ o, s, e, m }); return o; };
const G = (x, y, z, ry) => { const g = new THREE.Group(); g.position.set(x, y, z); if (ry) g.rotation.y = ry; scene.add(g); return g; };
const onA = (x, y) => G(x, y, 0);                                      // back wall, front faces +z
const onB = (z, y) => { const g = G(0, y, z); g.rotation.y = PI / 2; return g; }; // left wall, front faces +x (local x runs toward -z)

/* ---------- furniture builders (local frame: wall at z=0, front faces +z) ---------- */
function door(g, w, h, x, y, z, mat, handle, hx) {
  B(g, w - .012, h - .012, .022, .004, mat, x, y, z + .011);
  const f = .065, tk = .012;
  BX(g, w - .03, f, tk, mat, x, y + h / 2 - .015 - f / 2, z + .028); BX(g, w - .03, f, tk, mat, x, y - h / 2 + .015 + f / 2, z + .028);
  BX(g, f, h - .03 - 2 * f, tk, mat, x - w / 2 + .015 + f / 2, y, z + .028); BX(g, f, h - .03 - 2 * f, tk, mat, x + w / 2 - .015 - f / 2, y, z + .028);
  if (handle && handle.startsWith('cup')) { const yy = handle === 'cup' ? y + h / 2 - .08 : handle === 'cupb' ? y - h / 2 + .08 : y; const c = Cy(g, .035, .035, .11, copper, x, yy, z + .045, false, 12); c.rotation.z = PI / 2; c.scale.z = .45; }
  else if (handle === 'bar') Cy(g, .009, .009, Math.min(.7, h * .4), brass, x + (hx || 0), y, z + .06, false, 8);
  else if (handle === 'hbar') { const c = Cy(g, .008, .008, Math.min(.45, w * .6), brass, x, y + h / 2 - .09, z + .055, false, 8); c.rotation.z = PI / 2; }
}
function baseRun(g, mods) {
  const tw = mods.reduce((a, m) => a + m.w, 0); let x = -tw / 2;
  for (const m of mods) {
    const cx = x + m.w / 2;
    B(g, m.w, .86, .56, .006, sageD, cx, .43, .28); BX(g, m.w - .04, .1, .02, sageD, cx, .05, .52);
    if (m.t === 'oven') { BX(g, m.w - .04, .56, .03, glassD, cx, .52, .585); BX(g, m.w - .08, .04, .01, steel, cx, .76, .605); door(g, m.w, .2, cx, .2, .56, sage, 'cupc'); }
    else if (m.t === 'dw') BX(g, m.w - .01, .74, .04, M(0x2a2b2c, .35, .5, 1), cx, .49, .58);
    else if (m.t === 'drw') [.24, .24, .24].forEach((h, i) => door(g, m.w, h, cx, .22 + i * .25, .56, sage, 'cupc'));
    else door(g, m.w, .74, cx, .49, .56, sage, 'cup');
    x += m.w;
  }
  return tw;
}
function upperRun(g, ws, h, skip) {
  let x = -ws.reduce((a, b) => a + b, 0) / 2;
  ws.forEach((w, i) => { const cx = x + w / 2; if (!skip || !skip.includes(i)) { B(g, w, h, .34, .006, sageD, cx, h / 2, .17); door(g, w, h, cx, h / 2, .33, sage, 'cupb'); } x += w; });
}
function sofa(g, w, pillows) {
  const hw = w / 2, cw = (w - .5) / 2;
  B(g, w, .38, .95, .08, creamF, 0, .28, 0); B(g, w, .6, .25, .1, creamF, 0, .7, -.36);
  B(g, .24, .55, .95, .1, creamF, -hw + .12, .5, 0); B(g, .24, .55, .95, .1, creamF, hw - .12, .5, 0);
  [-1, 1].forEach(s => B(g, cw - .02, .18, .68, .08, cushM, s * cw / 2, .55, .08));
  if (pillows) [-1, 1].forEach((s, i) => { const p = B(g, .46, .4, .14, .07, i ? M(0x8b9a80, .95) : M(0xd8c9b0, .95), s * (hw - .5), .78, -.18); p.rotation.z = -s * .12; });
  [-1, 1].forEach(sx => [-.4, .4].forEach(z => Cy(g, .025, .02, .1, brass, sx * (hw - .15), .05, z, true, 8)));
}
// berjer: a deep armchair with a wrapped back
function berjer(col) {
  const c = new THREE.Group(), f = M(col, .92);
  B(c, .8, .18, .76, .07, f, 0, .3, 0); B(c, .6, .14, .58, .06, cushM, 0, .45, .05);
  const bk = B(c, .8, .62, .17, .08, f, 0, .66, -.31); bk.rotation.x = -.14;
  [-1, 1].forEach(s => B(c, .15, .36, .72, .07, f, s * .34, .5, .0));
  const pl = B(c, .34, .3, .12, .06, M(0xe8dfd0, .95), 0, .68, -.17); pl.rotation.x = -.2;
  [[-.3, -.28], [.3, -.28], [-.3, .28], [.3, .28]].forEach(p => Cy(c, .02, .012, .2, brass, p[0], .1, p[1], true, 8));
  return c;
}
function tubChair() {
  const c = new THREE.Group(), f = M(0xd9d2c8, .95);
  B(c, .5, .1, .48, .05, f, 0, .47, 0);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(.27, .25, .34, 24, 1, true, -PI * .6, PI * 1.2), f);
  back.material.side = THREE.DoubleSide; back.position.set(0, .66, .02); back.rotation.y = PI; back.scale.set(1, 1, .9); back.castShadow = true; c.add(back);
  [[-.19, -.18], [.19, -.18], [-.19, .18], [.19, .18]].forEach(p => Cy(c, .012, .012, .43, brass, p[0], .215, p[1], true, 8));
  return c;
}
function leaves(g, x, y, z, n = 12, sc = 1) {
  for (let i = 0; i < n; i++) {
    const a = i / n * PI * 2, l = new THREE.Mesh(new THREE.SphereGeometry(.5, 10, 8), green);
    l.scale.set(.2 * sc, (.85 + (i % 3) * .25) * sc, .06 * sc); l.position.set(x + Math.cos(a) * .18 * sc, y + (.45 + (i % 3) * .12) * sc, z + Math.sin(a) * .18 * sc);
    l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); l.castShadow = true; g.add(l);
  }
}
function bush(g, x, y, z, n, r) { for (let i = 0; i < n; i++) Sp(g, r, green, x + (rnd() - .5) * r * 2, y + rnd() * r, z + (rnd() - .5) * r * 2); }
function rug(x, z, w, d, col, s, e) { const g = G(x, 0, z); B(g, w, .025, d, .01, M(col, 1), 0, .013, 0).castShadow = false; reg(g, s, e, 'pop'); }

let g;
/* =================== KITCHEN + DINING (x 0–5.0, z 7.6–11.6): L-shaped counter on the left wall and the bath wall =================== */
g = onB(8.1, 0);
B(g, .82, 2.02, .66, .03, steel, 0, 1.01, .34); BX(g, .82, .012, .02, dark, 0, 1.18, .67);
Cy(g, .012, .012, .6, M(0x5a5d60, .3, .9), -.34, 1.55, .7, false, 8); Cy(g, .012, .012, .4, M(0x5a5d60, .3, .9), -.34, .85, .7, false, 8);
B(g, .84, .55, .6, .006, sageD, 0, 2.33, .3); door(g, .84, .55, 0, 2.33, .6, sage, 'cupb'); reg(g, 1.2, 1.6);
g = onB(9.8, 0); baseRun(g, [{ w: .6 }, { w: .6, t: 'dw' }, { w: .6, t: 'drw' }, { w: .6, t: 'oven' }]); reg(g, 1.25, 1.65);   // sink (z 10.7), dishwasher, drawers, oven (z 8.9)
reg(BX(new THREE.Group(), .64, .04, 2.46, marM(.4, 1.6), .32, .9, 9.8), 1.45, 1.8);
splash.push(splM(1.6, .4));
reg(sh(new THREE.Mesh(new THREE.BoxGeometry(.02, .6, 2.46), splash[0])), 1.5, 1.85, 'pop').position.set(.01, 1.22, 9.8);
g = onB(9.8, 1.52); upperRun(g, [.6, .6, .6, .6], .88, [0, 3]); BX(g, 1.2, .015, .015, ledM, 0, -.008, .3); reg(g, 1.55, 1.9);
// second leg of the L along the bath wall (low counter, no wall cabinets above the cut wall)
g = G(1.65, 0, 7.6 + t / 2); baseRun(g, [{ w: .6, t: 'drw' }, { w: .6 }, { w: .6, t: 'drw' }]);
BX(g, 1.84, .04, .62, marM(1.2, .4), 0, .9, .31); reg(g, 1.3, 1.7);
g = G(1.65, .92, 7.6 + t / 2); B(g, .36, .22, .26, .03, oak, -.55, .11, .2); Cy(g, .07, .06, .16, pot, .2, .08, .25, true, 14); bush(g, .2, .2, .25, 7, .06);
Cy(g, .11, .11, .02, ivory, .62, .01, .3, false, 20); [[-.03, 0], [.04, .03], [0, -.04]].forEach(p => Sp(g, .04, M(0xc9b23e, .6), .62 + p[0], .055, .3 + p[1])); reg(g, 1.75, 2.0);
// hood + hob over the oven
g = onB(8.9, 0);
B(g, .58, .5, .08, .01, glassD, 0, 1.72, .33).rotation.x = .55; B(g, .58, .12, .3, .01, dark, 0, 1.98, .15); BX(g, .56, .01, .46, M(0x111111, .2, .3, 1), 0, .925, .32);
[[-.13, .2], [.13, .2], [-.13, .44], [.13, .44]].forEach(p => { const r = new THREE.Mesh(new THREE.TorusGeometry(.06, .008, 6, 16), dark); r.rotation.x = PI / 2; r.position.set(p[0], .935, p[1]); g.add(r); });
reg(g, 1.6, 1.95);
// sink under the window
g = onB(10.7, .92); BX(g, .5, .01, .36, copper, 0, 0, .32); Cy(g, .015, .018, .32, copper, 0, .16, .08, true, 10);
Cy(g, .012, .012, .18, copper, 0, .32, .16, false, 8).rotation.x = PI / 2; reg(g, 1.65, 1.95, 'pop');
// counter accessories
g = G(0, .92, 0);
B(g, .03, .4, .3, .01, oak, .06, .2, 9.35); Cy(g, .06, .05, .14, ivory, .16, .07, 9.65, true, 14); [-.02, .02].forEach(d => Cy(g, .008, .008, .24, oak, .16, .2, 9.65 + d, false, 6));
Cy(g, .06, .05, .12, pot, .2, .06, 10.15, true, 14); bush(g, .2, .17, 10.15, 7, .055);
reg(g, 1.8, 2.05);
// dining table for four
g = G(3.0, 0, 9.9); B(g, 1.9, .05, .95, .015, marM(1, .5), 0, .76, 0);
[[-.8, -.35], [.8, -.35], [-.8, .35], [.8, .35]].forEach(p => Cy(g, .022, .022, .74, brass, p[0], .37, p[1], true, 10)); reg(g, 1.55, 1.85);
[[-.5, -.75, 0], [.5, -.75, 0], [-.5, .75, PI], [.5, .75, PI]].forEach((p, i) => { const c = tubChair(); c.position.set(3.0 + p[0], 0, 9.9 + p[1]); c.rotation.y = p[2]; scene.add(c); reg(c, 1.65 + i * .04, 1.9 + i * .03); });
g = G(3.0, .79, 9.9); Cy(g, .16, .1, .07, ivory, 0, .035, 0, true, 18); [[-.05, 0], [.05, .03], [0, -.05]].forEach(p => Sp(g, .05, M(0xd98a2b, .6), p[0], .09, p[1]));
[-.55, .55].forEach(x => [-.22, .22].forEach(z => Cy(g, .13, .13, .012, ivory, x, .006, z, false, 20))); reg(g, 1.85, 2.05);
g = G(3.0, -.4, 9.9); Cy(g, .006, .006, .5, dark, 0, 2.91, 0, false, 6); Cy(g, .07, .07, .025, brass, 0, 3.16, 0, false, 18);
{
  const curve = new THREE.CatmullRomCurve3([[-.7, 2.6], [-.35, 2.47], [0, 2.66], [.36, 2.45], [.72, 2.58]].map(p => new THREE.Vector3(p[0], p[1], 0)));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .012, 6), dark));
  [[-.68, 2.2, 2.59], [.02, 2.0, 2.66], [.7, 2.24, 2.57]].forEach(p => { Cy(g, .006, .006, p[2] - p[1], dark, p[0], (p[1] + p[2]) / 2, 0, false, 6); Sp(g, .12, bulbM, p[0], p[1], 0); });
}
reg(g, 1.8, 2.05);
g = G(4.55, 0, 8.05); Cy(g, .2, .16, .42, terra, 0, .21, 0, true, 20); leaves(g, 0, .42, 0, 11, .8); reg(g, 1.85, 2.05);

/* =================== LIVING (x 8.4–15.0, z 0–7.4): TV wall with side cabinets, sofa, two berjers; balcony beyond =================== */
const LX = 11.7;
// slatted TV wall: straight slats from floor to ceiling
g = onA(LX, 0);
{
  const N = 28, ww = 2.6, hh = H - .02;
  for (let i = 0; i < N; i++) { const u = (i + .5) / N, geo = new THREE.BoxGeometry(.08, hh, .05); geo.translate(0, hh / 2, 0); const s = sh(new THREE.Mesh(geo, i % 2 ? sage : sageD)); s.position.set(-ww / 2 + u * ww, 0, .045); g.add(s); }
  const edgeT = glowTex(512, 512, (x, w, h) => { x.lineWidth = 7; x.shadowBlur = 28; x.beginPath(); x.moveTo(12, h); x.lineTo(12, 12); x.lineTo(w - 12, 12); x.lineTo(w - 12, h); x.stroke(); x.stroke(); });
  glowPlane(g, edgeT, ww + .2, hh, 0, hh / 2, .012, 0, .8);
}
reg(g, 2.2, 2.6, 'grow');
g = onA(LX, 1.45); B(g, 1.6, .92, .05, .01, M(0x0c0d0e, .12, .3, 1), 0, 0, .11); reg(g, 2.5, 2.8, 'pop');
g = onA(LX, .3); B(g, 2.5, .44, .46, .01, sageD, 0, .22, .23);
[-.93, -.31, .31, .93].forEach(x => { B(g, .6, .4, .02, .006, sage, x, .22, .47); Cy(g, .008, .008, .3, brass, x, .25, .5, false, 8).rotation.z = PI / 2; });
BX(g, 2.5, .025, .48, ivory, 0, .455, .24); BX(g, 2.4, .012, .012, ledM, 0, -.008, .4); reg(g, 2.3, 2.65);
// tall cabinets either side of the TV wall: closed doors below, lit open shelves above
[-1, 1].forEach((s, i) => {
  g = onA(LX + s * 1.72, 0);
  BX(g, .62, 2.2, .02, sageD, 0, 1.1, .01); [-.3, .3].forEach(x => BX(g, .025, 2.2, .4, oak, x, 1.1, .2));
  BX(g, .62, .025, .42, oak, 0, 2.2, .21);
  B(g, .58, .82, .38, .006, sageD, 0, .43, .2); [-.145, .145].forEach(x => { door(g, .29, .78, x, .45, .39, sage); Cy(g, .007, .007, .16, brass, x - s * .1, .5, .44, false, 8); });
  BX(g, .58, .025, .4, oak, 0, .85, .2);
  [1.3, 1.75].forEach(y => BX(g, .58, .025, .38, oak, 0, y, .2));
  BX(g, .54, .012, .012, ledM, 0, 2.18, .34);
  Cy(g, .07, .05, .26, i ? terra : pot, -.12, .995, .2, true, 14); Sp(g, .07, i ? ivory : M(0x8b9a80, .7), .14, .94, .18);
  for (let k = 0; k < 6; k++) BX(g, .035, .22 + (k % 3) * .03, .2, M([0xe3d9ca, 0x76876c, 0x9b8676, 0x39414a, 0xcdb38a][(k + i) % 5], .8), -.2 + k * .045, 1.42 + (k % 3) * .015, .2, false);
  Cy(g, .1, .1, .03, brass, .15, 1.33, .2, false, 18); Cy(g, .05, .04, .2, ivory, .02, 1.86, .2, true, 12); B(g, .2, .14, .16, .02, oak, -.15, 1.84, .2);
  reg(g, 2.32 + i * .05, 2.66 + i * .04, 'grow');
});
rug(LX, 3.6, 4.0, 3.0, 0xddd2c0, 2.35, 2.65);
g = G(LX, 0, 5.0, PI); sofa(g, 2.7, true); reg(g, 2.45, 2.8);
[[LX - 1.85, 3.0, PI / 2 + .45, 0x9a8468], [LX + 1.85, 3.0, -PI / 2 - .45, 0x9a8468]].forEach((p, i) => { const c = berjer(p[3]); c.position.set(p[0], 0, p[1]); c.rotation.y = p[2]; scene.add(c); reg(c, 2.55 + i * .06, 2.9 + i * .04); });
g = G(LX, 0, 3.35); Cy(g, .5, .5, .04, marM(1, 1), 0, .42, 0, true, 40); Cy(g, .2, .3, .4, oak, 0, .2, 0, true, 24); reg(g, 2.6, 2.9);
g = G(LX, .44, 3.35); Cy(g, .13, .1, .04, ivory, -.15, .02, .1, false, 18); B(g, .36, .04, .26, .01, M(0x7e8e74, .7), .15, .02, -.1);
Cy(g, .03, .04, .18, pot, .28, .09, .16, false, 10); for (let i = 0; i < 6; i++) Cy(g, .004, .004, .24, M(0xcdb38a, .9), .28 + (rnd() - .5) * .08, .3, .16 + (rnd() - .5) * .08, false, 4);
reg(g, 2.85, 3.05);
g = G(LX + 2.45, 0, 2.2); Cy(g, .22, .22, .03, marM(.5, .5), 0, .52, 0, true, 24); Cy(g, .02, .02, .5, brass, 0, .26, 0, true, 8); Cy(g, .15, .15, .02, brass, 0, .01, 0, false, 18); Cy(g, .05, .04, .12, pot, 0, .6, 0, false, 12); reg(g, 2.75, 3.0);
// floor lamp beside the sofa's far arm (kept clear of the living-room door)
g = G(LX + 1.72, 0, 5.3); Cy(g, .18, .18, .03, brass, 0, .015, 0); Cy(g, .012, .012, 1.6, brass, 0, .8, 0, true, 8); Cy(g, .17, .22, .3, M(0xf3ebdd, .9), 0, 1.65, 0, false, 24); Sp(g, .05, bulbM, 0, 1.55, 0); reg(g, 2.7, 3.0);
g = G(10.2, 0, E - .28, PI); B(g, 1.9, .62, .42, .01, oak, 0, .43, 0); [-.85, .85].forEach(x => BX(g, .04, .14, .36, dark, x, .07, 0)); [-.47, .47].forEach(x => Cy(g, .008, .008, .3, brass, x, .45, .22, false, 8));
Cy(g, .09, .06, .3, pot, -.55, .89, 0, true, 16); bush(g, -.55, 1.1, 0, 6, .08); B(g, .3, .05, .22, .008, sageD, .4, .765, 0); B(g, .26, .04, .2, .008, ivory, .42, .81, 0); reg(g, 2.7, 3.0);
g = G(14.55, 0, 6.85); Cy(g, .24, .19, .5, pot, 0, .25, 0, true, 24); leaves(g, 0, .5, 0); reg(g, 2.8, 3.05);

/* =================== BALCONY (x 11.6–14.8, z 7.6–8.9): tall storage cabinet, bistro table, planter =================== */
g = G(BW0 + .4, 0, E + T);
B(g, .64, 2.1, .48, .01, sageD, 0, 1.05, .24); [-.155, .155].forEach((x, i) => { door(g, .31, 2.04, x, 1.05, .48, sage); Cy(g, .008, .008, .3, brass, x + (i ? -.11 : .11), 1.05, .53, false, 8); });
reg(g, 2.6, 2.9, 'grow');
g = G(14.2, 0, 8.3); Cy(g, .3, .3, .03, marM(.6, .6), 0, .72, 0, true, 28); Cy(g, .02, .02, .7, dark, 0, .36, 0, true, 8); Cy(g, .18, .18, .02, dark, 0, .01, 0, false, 18);
Cy(g, .05, .04, .08, ivory, -.08, .775, .05, false, 12); Cy(g, .035, .03, .07, terra, .1, .77, -.06, false, 10); reg(g, 2.7, 2.95);
[[13.68, 8.35, PI / 2], [14.2, 7.88, 0]].forEach((p, i) => { const c = tubChair(); c.position.set(p[0], 0, p[1]); c.rotation.y = p[2]; scene.add(c); reg(c, 2.75 + i * .04, 2.98); });
g = G(13.0, 0, BZ - .2); B(g, 1.0, .32, .26, .02, terra, 0, .16, 0); bush(g, 0, .34, 0, 9, .1); reg(g, 2.8, 3.02);

/* =================== BEDROOM (x 0–5.0, z 0–5.0): 180×200 bed on the left wall =================== */
const BZC = 2.5;  // bed centre line
g = onB(BZC, 0); BX(g, 3.3, H - .02, .02, taupeW, 0, H / 2, .012).castShadow = false; reg(g, 3.2, 3.5, 'pop');
{
  const fluteT = canvasTex(64, 8, (x, w, h) => { for (let i = 0; i < w; i++) { const v = Math.cos(i / w * PI * 2); x.fillStyle = 'rgb(' + (232 + v * 12) + ',' + (224 + v * 12) + ',' + (212 + v * 12) + ')'; x.fillRect(i, 0, 1, h); } });
  fluteT.wrapS = fluteT.wrapT = THREE.RepeatWrapping; fluteT.repeat.set(14, 1);
  const archS = (r, hs) => { const s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, hs); s.absarc(0, hs, r, 0, PI, false); s.closePath(); return s; };
  g = onB(BZC, .15);
  const hb = sh(new THREE.Mesh(new THREE.ExtrudeGeometry(archS(1.02, 1.05), { depth: .07, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 2, curveSegments: 32 }), new THREE.MeshStandardMaterial({ map: fluteT, roughness: .9 })));
  hb.position.z = .03; g.add(hb);
  const archT = glowTex(256, 268, (x, w, h) => { x.lineWidth = 7; x.shadowBlur = 26; const k = w / 2.3, r = 1.02 * k + 5, cx = w / 2, base = h - .1 * k, hs = 1.05 * k; x.beginPath(); x.moveTo(cx - r, base); x.lineTo(cx - r, base - hs); x.arc(cx, base - hs, r, PI, 0); x.lineTo(cx + r, base); x.stroke(); x.stroke(); });
  glowPlane(g, archT, 2.3, 2.4, 0, 1.1, .015, 0, 1.1); reg(g, 3.35, 3.65, 'grow');
}
[BZC - 1.32, BZC + 1.32].forEach((z, i) => {
  g = onB(z, .32); B(g, .52, .5, .44, .008, sageD, 0, .25, .22);
  [.13, .37].forEach(y => { door(g, .5, .23, 0, y, .43, sage); Sp(g, .018, brass, 0, y, .48); });
  BX(g, .5, .012, .012, ledM, 0, -.006, .4); reg(g, 3.5 + i * .05, 3.8 + i * .03);
  const l = onB(z, .82); Cy(l, .08, .09, .02, brass, 0, .01, .2, true, 18); Cy(l, .008, .008, .42, brass, -.06, .22, .2, true, 6);
  { const gm = M(0xf2ede4, .1, 0, 1); gm.transparent = true; gm.opacity = .35; Cy(l, .07, .07, .2, gm, 0, .32, .2, false, 18); }
  Sp(l, .035, bulbM, 0, .32, .2); reg(l, 3.75 + i * .04, 4.0);
});
// bed frame 2.15 × 1.95 around a 180 × 200 mattress
g = G(1.28, 0, BZC);
B(g, 2.15, .3, 1.95, .06, creamF, 0, .25, 0); [[-.95, -.85], [.95, -.85], [-.95, .85], [.95, .85]].forEach(p => Cy(g, .02, .012, .12, brass, p[0], .06, p[1], true, 8));
B(g, 2.05, .26, 1.84, .1, ivory, .03, .52, 0); B(g, .8, .06, 1.88, .03, M(0xd8cbb6, .95), .62, .66, 0);
[[-.82, -.48, ivory], [-.82, .48, ivory], [-.7, -.4, M(0xe8dfd0, .95)], [-.7, .4, M(0xe8dfd0, .95)], [-.6, 0, M(0xd2c2aa, .95)]].forEach((p, i) => {
  const pl = B(g, .16, i < 2 ? .42 : i < 4 ? .36 : .3, i < 4 ? .7 : .5, .07, p[2], p[0], .82 - (i > 3 ? .07 : 0), p[1]); pl.rotation.z = .22;
});
reg(g, 3.45, 3.8);
rug(1.8, BZC, 2.8, 2.9, 0xe4dccd, 3.3, 3.6);
g = onA(3.9, 0); B(g, 1.8, 2.62, .6, .006, sageD, 0, 1.31, .3);
[-.6, 0, .6].forEach((x, i) => door(g, .6, 2.5, x, 1.3, .58, sage, 'bar', i === 2 ? -.24 : .24));
BX(g, 1.8, .012, .012, ledM, 0, .004, .62); reg(g, 3.25, 3.6, 'grow');
{
  const curT = canvasTex(64, 8, (x, w, h) => { for (let i = 0; i < w; i++) { const v = Math.cos(i / w * PI * 2); x.fillStyle = 'rgb(' + (238 + v * 10) + ',' + (234 + v * 10) + ',' + (226 + v * 10) + ')'; x.fillRect(i, 0, 1, h); } });
  curT.wrapS = THREE.RepeatWrapping; curT.repeat.set(6, 1);
  const cm = new THREE.MeshStandardMaterial({ map: curT, roughness: .95 });
  g = G(0, 0, 0); [.78, 2.62].forEach(x => BX(g, .38, 2.5, .06, cm, x, 1.3, .1)); reg(g, 3.8, 4.05, 'grow');
}
g = G(3.4, 0, 3.4);
{ const pf = Cy(g, .26, .26, .36, cushM, 0, .2, 0, true, 24); for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2, s = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), pf.material); s.scale.set(.9, 1.5, .9); s.position.set(Math.cos(a) * .2, .2, Math.sin(a) * .2); g.add(s); } Cy(g, .2, .2, .03, brass, 0, .015, 0, false, 20); }
reg(g, 3.8, 4.05);

/* =================== BATH (x 0–5.0, z 5.0–7.6): shower cabin, vanity, storage cabinets; no bathtub =================== */
const BZ0 = 5.0 + t / 2;  // inner face of the bedroom wall
// shower cabin in the far corner
g = G(0, 0, 0);
BX(g, 1.1, .04, 1.1, ivory, .55, .02, 5.55); BX(g, 1.1, 2.0, .02, glassM, .55, 1.04, 6.1, false); BX(g, .02, 2.0, .5, glassM, 1.1, 1.04, 5.31, false);
BX(g, 1.1, .03, .03, brass, .55, 2.05, 6.1, false); BX(g, .03, .03, .5, brass, 1.1, 2.05, 5.31, false);
Cy(g, .012, .012, .3, brass, .15, 1.95, 5.55, false, 8).rotation.z = PI / 2; Cy(g, .1, .1, .015, brass, .3, 1.94, 5.55, false, 20); Cy(g, .03, .03, .04, brass, .03, 1.1, 5.55, false, 12).rotation.z = PI / 2;
reg(g, 4.25, 4.6, 'grow');
// vanity with drawers + round mirror on the left wall
g = onB(6.9, 0);
B(g, 1.1, .42, .5, .01, oak, 0, .62, .25); [.52, .72].forEach(y => { BX(g, 1.04, .006, .01, M(0x6e5038, .6), 0, y, .505); }); [.52, .72].forEach(y => Cy(g, .007, .007, .2, brass, 0, y + .09, .52, false, 8).rotation.z = PI / 2);
BX(g, 1.14, .03, .52, marM(.5, .3), 0, .845, .26);
Cy(g, .2, .16, .12, ivory, 0, .92, .27, true, 24); Cy(g, .012, .012, .3, brass, 0, 1.0, .05, false, 8); Cy(g, .01, .01, .16, brass, 0, 1.14, .13, false, 8).rotation.x = PI / 2;
{ const mr = new THREE.Mesh(new THREE.CircleGeometry(.33, 40), mirrorM); mr.position.set(0, 1.62, .025); g.add(mr); const tr = new THREE.Mesh(new THREE.TorusGeometry(.34, .018, 8, 40), brass); tr.position.set(0, 1.62, .03); g.add(tr); }
{ const ringT = glowTex(128, 128, (x, w) => { x.lineWidth = 6; x.shadowBlur = 18; x.beginPath(); x.arc(w / 2, w / 2, w * .36, 0, PI * 2); x.stroke(); }); glowPlane(g, ringT, 1.0, 1.0, 0, 1.62, .012, 0, .9); }
reg(g, 4.2, 4.5);
// storage along the bedroom wall (where the bathtub used to be): a tall linen cabinet and a low cabinet with a counter
g = G(1.6, 0, BZ0);
B(g, .6, 2.1, .42, .01, oak, 0, 1.05, .21); [-.15, .15].forEach((x, i) => { door(g, .3, 2.04, x, 1.05, .42, M(0xc9a67a, .6)); Cy(g, .007, .007, .26, brass, x + (i ? -.1 : .1), 1.05, .47, false, 8); });
reg(g, 4.3, 4.65, 'grow');
g = G(2.75, 0, BZ0);
B(g, 1.2, .82, .46, .01, oak, 0, .45, .23); BX(g, 1.18, .08, .4, oak, 0, .04, .2);
[-.3, .3].forEach((x, i) => { door(g, .6, .74, x, .47, .46, M(0xc9a67a, .6)); Cy(g, .007, .007, .18, brass, x + (i ? -.22 : .22), .55, .51, false, 8); });
BX(g, 1.24, .03, .48, marM(.5, .3), 0, .875, .24);
[0, 1, 2].forEach(k => B(g, .3, .07, .22, .03, [ivory, M(0xa9b3a0, .95), M(0xe8dfd0, .95)][k], -.35, .93 + k * .07, .22));
Cy(g, .1, .09, .14, M(0xb89a6e, .9), .08, .96, .22, true, 16); Cy(g, .06, .05, .16, pot, .4, .97, .22, true, 12); leaves(g, .4, .97, .22, 7, .35);
// wall cabinet above
B(g, .9, .5, .22, .01, oak, 0, 1.75, .11); [-.225, .225].forEach((x, i) => { door(g, .45, .48, x, 1.75, .22, M(0xc9a67a, .6)); Cy(g, .007, .007, .14, brass, x + (i ? -.17 : .17), 1.62, .27, false, 8); });
reg(g, 4.35, 4.65);
// toilet against the kitchen-side wall
g = G(3.2, 0, 7.15);
B(g, .4, .36, .17, .04, ivory, 0, .6, .27); { const bw = Cy(g, .19, .15, .4, ivory, 0, .2, 0, true, 24); bw.scale.z = 1.25; } BX(g, .36, .02, .46, ivory, 0, .41, -.02);
reg(g, 4.35, 4.65);
rug(1.5, 6.5, .9, .6, 0xa9b3a0, 4.4, 4.7);
g = G(4.6, 0, 7.2); Cy(g, .16, .13, .34, pot, 0, .17, 0, true, 18); leaves(g, 0, .32, 0, 9, .6); reg(g, 4.45, 4.75);

/* =================== STUDY (x 5.0–8.4, z 0–3.8): shelves either side of the desk on the back wall =================== */
[5.5, 8.0].forEach((sx, k) => {
  g = onA(sx, 0);
  BX(g, .8, 2.2, .02, sageD, 0, 1.1, .01); [-.39, .39].forEach(x => BX(g, .03, 2.2, .32, oak, x, 1.1, .16));
  for (let i = 0; i < 6; i++) BX(g, .78, .025, .32, oak, 0, .05 + i * .42, .16);
  for (let s = 0; s < 5; s++) { let x = -.34; while (x < .3) { const w = .03 + rnd() * .03, h = .2 + rnd() * .1; if (rnd() > .82) { x += .08; continue; } BX(g, w, h, .2, M([0xe3d9ca, 0x76876c, 0x9b8676, 0x39414a, 0xcdb38a][(rnd() * 5) | 0], .8), x + w / 2, .065 + s * .42 + h / 2, .17, false); x += w + .005; } }
  reg(g, 4.3 + k * .05, 4.65 + k * .03, 'grow');
});
g = onA(6.9, 0);
B(g, 1.4, .04, .6, .01, oak, 0, .75, .32); [[-.65, .05], [.65, .05], [-.65, .58], [.65, .58]].forEach(p => Cy(g, .015, .015, .73, brass, p[0], .365, p[1], true, 8));
B(g, .34, .015, .24, .005, steel, -.15, .78, .35); { const sc = B(g, .34, .23, .012, .005, dark, -.15, .9, .23); sc.rotation.x = -.25; }
Cy(g, .07, .07, .02, brass, .5, .78, .15, false, 16); Cy(g, .008, .008, .4, brass, .5, .98, .15, false, 6); { const sd = Cy(g, .09, .06, .1, brass, .5, 1.17, .22, false, 16); sd.rotation.x = .5; }
reg(g, 4.35, 4.7);
g = G(6.9, 0, 1.0, PI);
B(g, .48, .07, .48, .03, sageD, 0, .47, 0); B(g, .46, .44, .06, .03, sageD, 0, .76, -.22); Cy(g, .025, .025, .4, dark, 0, .23, 0, true, 8);
[0, 1, 2, 3, 4].forEach(i => { const a = i / 5 * PI * 2, l = BX(g, .3, .02, .03, dark, Math.cos(a) * .14, .03, Math.sin(a) * .14); l.rotation.y = -a; });
reg(g, 4.45, 4.75);
g = G(7.84, 0, 2.65, -PI / 2); sofa(g, 1.6, false); reg(g, 4.4, 4.75);
rug(6.6, 2.4, 2.0, 1.7, 0xd8cdb9, 4.3, 4.6);

/* =================== ENTRANCE, CORRIDOR and HALL =================== */
rug(5.8, 8.2, .8, 4.6, 0xd2c6b2, 4.2, 4.5);
g = G(HX - .19, 0, 9.9);
B(g, .34, .78, 1.3, .01, sageD, 0, .39, 0); [-.43, 0, .43].forEach(z => B(g, .02, .7, .41, .006, sage, -.17, .4, z));
BX(g, .36, .025, 1.32, oak, 0, .79, 0); Cy(g, .07, .05, .26, pot, 0, .93, -.35, false, 14); for (let i = 0; i < 5; i++) Cy(g, .004, .004, .3, M(0xcdb38a, .9), (rnd() - .5) * .05, 1.15, -.35 + (rnd() - .5) * .05, false, 4);
Cy(g, .1, .1, .02, brass, 0, .81, .3, false, 18);
reg(g, 4.35, 4.7);
g = G(5.32, 0, D + .02, 1.3); B(g, .96, 2.1, .05, .01, sage, .48, 1.05, 0); Cy(g, .01, .01, .3, brass, .86, 1.0, -.05, false, 8); reg(g, 4.4, 4.75, 'grow');
rug(5.8, 11.2, .9, .5, 0x8f8272, 4.45, 4.7);
// hall niche: bench, round rug, plant
g = G(7.5, 0, E - .26); B(g, 1.1, .07, .4, .02, oak, 0, .42, 0); [[-.48, -.14], [.48, -.14], [-.48, .14], [.48, .14]].forEach(p => BX(g, .04, .4, .04, oak, p[0], .2, p[1]));
B(g, .5, .09, .36, .04, M(0x8b9a80, .95), -.26, .5, 0); B(g, .5, .09, .36, .04, cushM, .27, .5, 0); reg(g, 4.4, 4.75);
g = G(7.5, 0, 5.6); Cy(g, .6, .6, .02, M(0xcdbfa8, 1), 0, .012, 0, false, 40); reg(g, 4.3, 4.6, 'pop');
g = G(8.05, 0, 4.25); Cy(g, .2, .16, .42, terra, 0, .21, 0, true, 20); leaves(g, 0, .42, 0, 11, .9); reg(g, 4.5, 4.8);

/* ---------- tone down reflections once ---------- */
{ const seen = new Set(); scene.traverse(o => { const m = o.material; if (m && m.isMeshStandardMaterial && !seen.has(m)) { seen.add(m); m.envMapIntensity *= .55; } }); }

/* ---------- LED floor glows ---------- */
floorGlow(2.4, .8, .98, 9.8, PI / 2); floorGlow(1.8, .8, 1.65, 8.4, 0, .45); floorGlow(2.5, .7, LX, .7, 0, .35); floorGlow(1.8, .75, 3.9, .95, 0, .4);
floorGlow(.5, .5, .8, BZC - 1.32, PI / 2, .3); floorGlow(.5, .5, .8, BZC + 1.32, PI / 2, .3);

/* ---------- lights ---------- */
const CX = 7.4, CZ = 5.6;
const hemi = new THREE.HemisphereLight(0xc3d0e2, 0x8a8176, .35); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xdfe8ff, .9); sun.position.set(CX + 12, 17, CZ + 8); sun.target.position.set(CX, 0, CZ); sun.castShadow = true;
sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02; scene.add(sun, sun.target);
const warm = [[3.0, 2.3, 9.8, 1.3], [LX, 2.3, 3.7, 1.3], [2.5, 2.3, 2.5, 1.2], [6.2, 2.2, 5.2, 1.1], [2.5, 2.2, 6.3, .9]].map(p => { const l = new THREE.PointLight(0xffc98f, 0, 7, 2); l.position.set(p[0], p[1], p[2]); l.userData.k = p[3]; scene.add(l); return l; });

/* ---------- room labels shown on the plan step ---------- */
const labGroup = new THREE.Group(), labMats = []; labGroup.visible = false; scene.add(labGroup);
function makeLabels() {
  const rr = (k, x, y, w, h, r) => { k.beginPath(); k.moveTo(x + r, y); k.arcTo(x + w, y, x + w, y + h, r); k.arcTo(x + w, y + h, x, y + h, r); k.arcTo(x, y + h, x, y, r); k.arcTo(x, y, x + w, y, r); k.closePath(); };
  [['Yatak Odası', '25,0 m²', 2.5, 2.5], ['Çalışma Odası', '12,9 m²', 6.7, 1.9], ['Salon', '48,8 m²', 11.7, 3.7], ['Banyo', '13,0 m²', 2.5, 6.3], ['Mutfak', '20,0 m²', 2.5, 9.6], ['Balkon', '4,8 m²', 13.2, 8.25], ['Antre', '', 5.8, 8.6]].forEach(r => {
    const c = document.createElement('canvas'), k = c.getContext('2d'), f1 = '600 44px Outfit,system-ui,sans-serif', f2 = '500 32px Outfit,system-ui,sans-serif';
    k.font = f1; const w1 = k.measureText(r[0]).width; k.font = f2; const w2 = r[1] ? k.measureText(r[1]).width : 0;
    const cw = Math.ceil(Math.max(w1, w2)) + 60, ch = r[1] ? 132 : 84; c.width = cw; c.height = ch;
    k.fillStyle = 'rgba(244,239,230,.95)'; rr(k, 2, 2, cw - 4, ch - 4, r[1] ? 30 : 40); k.fill();
    k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillStyle = '#3e352b'; k.font = f1; k.fillText(r[0], cw / 2, r[1] ? 46 : ch / 2 + 2);
    if (r[1]) { k.font = f2; k.fillStyle = '#8a6f3f'; k.fillText(r[1], cw / 2, 94); }
    const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 4;
    const m = new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false, toneMapped: false, opacity: 0 }); labMats.push(m);
    const s = new THREE.Sprite(m), hh = r[1] ? .62 : .4; s.scale.set(hh * cw / ch, hh, 1); s.position.set(r[2], .45, r[3]); s.renderOrder = 5; labGroup.add(s);
  });
}

/* ---------- camera tour: one key pose per caption (yaw/pitch in degrees, rx/ry = half extents to frame) ---------- */
const KF = [
  // genel bakışlar (Ev 1, 2, 7) 25 Kasım 2026'da ~%15 genişletildi: evin üst köşesi logonun altında kalıyordu
  { c: [7.3, .4, 5.4], yaw: 45, pitch: 34, rx: 12.4, ry: 6.4 },  // empty flat
  { c: [7.4, 0, 5.6], yaw: 38, pitch: 60, rx: 11.6, ry: 7.8 },   // plan + room names
  { c: [2.4, 1.1, 9.5], yaw: 62, pitch: 36, rx: 4.1, ry: 3.1 },  // kitchen + dining
  { c: [11.9, .6, 5.6], yaw: 30, pitch: 46, rx: 5.2, ry: 4.6 },  // living room + balcony
  { c: [2.5, .9, 2.6], yaw: 24, pitch: 38, rx: 3.8, ry: 2.7 },   // bedroom
  { c: [4.2, .5, 4.9], yaw: 40, pitch: 52, rx: 6.4, ry: 4.3 },   // bath, study, hall
  { c: [7.3, .4, 5.4], yaw: 45, pitch: 36, rx: 12.4, ry: 6.4 }   // finished, evening
];
const DEG = PI / 180, tgt = new THREE.Vector3(), tanV = Math.tan(cam.fov * DEG / 2);
let aspect = 1;
function placeCamera(t, yawOff) {
  const i = Math.min(KF.length - 2, Math.max(0, Math.floor(t))), f = ss(t - i, 0, 1), a = KF[i], b = KF[i + 1], L = (p, q) => p + (q - p) * f;
  tgt.set(L(a.c[0], b.c[0]), L(a.c[1], b.c[1]), L(a.c[2], b.c[2]));
  const portrait = aspect < 1;
  const yaw = clamp(L(a.yaw, b.yaw) + yawOff, 4, 86) * DEG;
  const pitch = Math.min(70, L(a.pitch, b.pitch) + (portrait ? 14 * (1 - aspect) : 0)) * DEG;
  const rx = Math.exp(L(Math.log(a.rx), Math.log(b.rx))), ry = Math.exp(L(Math.log(a.ry), Math.log(b.ry)));
  // phones: frame a little tighter sideways (the tall screen has spare room above and below)
  const dist = Math.max(ry / tanV, rx * (portrait ? .84 : 1) / (tanV * aspect));
  cam.position.set(tgt.x + Math.sin(yaw) * Math.cos(pitch) * dist, tgt.y + Math.sin(pitch) * dist, tgt.z + Math.cos(yaw) * Math.cos(pitch) * dist);
  cam.lookAt(tgt);
}

/* ---------- state ---------- */
const cC = new THREE.Color(0xc4c7cc), cW = new THREE.Color(0xefe8dd), hC = new THREE.Color(0xc3d0e2), hW = new THREE.Color(0xffe3bf), sC = new THREE.Color(0xdfe8ff), sW = new THREE.Color(0xffe2b8), gC = new THREE.Color(0xdfe9ff), gW = new THREE.Color(0xffe6b8);
function update(t) {
  for (const it of items) {
    const p = clamp((t - it.s) / (it.e - it.s)), e = e3(p), o = it.o; o.visible = p > 0; if (!o.visible) continue;
    if (it.m === 'grow') o.scale.set(1, Math.max(e, .001), 1);
    else { o.scale.setScalar(.9 + .1 * e); if (it.m === 'drop') o.position.y = o.userData.y + (1 - e) * 1.4; }
  }
  floors.forEach((m, i) => m.opacity = e3(clamp((t - .3 - i * .06) / .6)));
  const lab = ss(t, .7, 1.05) * (1 - ss(t, 1.55, 1.95)); labGroup.visible = lab > .002; labMats.forEach(m => m.opacity = lab);
  const w2 = e3(clamp((t - .4) / 1)), wk = ss(t, 5.15, 5.95);
  wallMat.color.lerpColors(cC, cW, w2); hemi.color.lerpColors(hC, hW, wk); hemi.intensity = .35 - .1 * wk; sun.color.lerpColors(sC, sW, wk); sun.intensity = .9 - .3 * wk;
  ledM.emissiveIntensity = wk * 1.6; backM.emissiveIntensity = wk * .9; bulbM.emissiveIntensity = .05 + wk * 1.5; splash.forEach(m => m.emissiveIntensity = wk * .28);
  glowMats.forEach(m => m.opacity = wk * m.userData.k); winGlow.color.lerpColors(gC, gW, wk); warm.forEach(l => l.intensity = wk * l.userData.k);
  placeCamera(t, yawOff + pxC * 6);
  setIdx(Math.min(LAST, Math.round(t)));
}
let cur = reduce ? LAST : 0, target = cur, dirty = true, visible = true, pxT = 0, pxC = 0, yawOff = 0, yawOffT = 0, lastT = performance.now(), slow = 0, cnt = 0, cw = 0, ch = 0;
function resize(force) {
  const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h || (!force && w === cw && h === ch)) return; cw = w; ch = h;
  R.setSize(w, h, false); aspect = w / h; cam.aspect = aspect;
  // dikey ekranda model yazıların üstüne kalkar; geniş ekranda hafifçe aşağı iner ki üst köşe dev logonun altında kalmasın
  cam.setViewOffset(w, h, 0, h * (aspect < 1 ? .08 : -.04), w, h);
  cam.updateProjectionMatrix(); dirty = true;
}
function calc() {
  // Ev adımları, Süreç Bölümü üstüne binmeden 0,4 ekran önce biter: ev Ev 7'de ~3 fare kaydırması bekler,
  // sonra geçiş başlar (210svh bindirme + 40svh bekleme = 2,5). #hero yüksekliği CSS'te buna göre 910svh.
  const r = hero.getBoundingClientRect(), tot = Math.max(1, hero.offsetHeight - stage.offsetHeight * 2.5);
  target = reduce ? LAST : clamp(-r.top / tot) * LAST; if (Math.abs(target - cur) > .0008) dirty = true;
}
addEventListener('scroll', calc, { passive: true });
addEventListener('resize', () => { resize(); calc(); });
if (!coarse) addEventListener('pointermove', e => { pxT = e.clientX / innerWidth - .5; }, { passive: true });
new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) dirty = true; }).observe(hero);

/* ---------- drag sideways to turn the house (vertical swipes keep scrolling the page) ---------- */
let pid = null, sx = 0, sy = 0, decided = false, dragging = false, startOff = 0;
stage.addEventListener('pointerdown', e => {
  if (e.target.closest('a,button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
  pid = e.pointerId; sx = e.clientX; sy = e.clientY; decided = false; dragging = false; startOff = yawOffT;
});
stage.addEventListener('pointermove', e => {
  if (e.pointerId !== pid) return;
  const dx = e.clientX - sx, dy = e.clientY - sy;
  if (!decided) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    decided = true; dragging = Math.abs(dx) > Math.abs(dy);
    if (dragging) { try { stage.setPointerCapture(pid); } catch (_) {} stage.classList.add('drag'); if (!dragged) { dragged = true; if (hint) hint.classList.remove('on'); } }
  }
  if (!dragging) return;
  yawOffT = clamp(startOff - dx / Math.max(320, stage.clientWidth) * 110, -42, 42); dirty = true;
});
const endDrag = e => { if (e.pointerId !== pid) return; pid = null; if (dragging) { dragging = false; stage.classList.remove('drag'); } };
stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

function frame(now) {
  requestAnimationFrame(frame); if (!visible) return;
  const dt = Math.min(64, now - lastT), k = dt / 16.7; lastT = now;
  const d = target - cur;
  if (Math.abs(d) > .0008) { cur += d * Math.min(1, .12 * k); dirty = true; if (!dragging && Math.abs(d) > .01) yawOffT *= Math.pow(.95, k); }
  else if (d !== 0) { cur = target; dirty = true; }
  const dy = yawOffT - yawOff; if (Math.abs(dy) > .01) { yawOff += dy * Math.min(1, .16 * k); dirty = true; }
  const dp = pxT - pxC; if (Math.abs(dp) > .0005) { pxC += dp * .06; dirty = true; }
  if (!dirty) return; dirty = false; update(cur); R.render(scene, cam);
  if (++cnt > 12 && cnt < 70) { slow += dt; if (cnt === 69 && slow / 57 > 30 && pr > 1) { pr = 1; R.setPixelRatio(1); resize(true); } }
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { makeLabels(); dirty = true; }); else makeLabels();
resize(true); calc(); cur = reduce ? LAST : target; requestAnimationFrame(frame);
window.__setT = v => { cur = target = v; dirty = true; };
})();
