(function(){
// Süreç Bölümü: ORYZO tarzı kaydırmalı carousel.
// Bölüm ekrana sabitlenir; sayfa kaydırıldıkça ortadaki çerçevede 3B sahne adım adım ilerler,
// yanlardaki küçük resim şeridi (Adım şeridi) aynı hızla akar.
const sec=document.getElementById('surec');if(!sec)return;
const stage=sec.querySelector('.pstage'),cv=stage.querySelector('canvas'),info=stage.querySelector('.pinfo'),strip=sec.querySelector('.pstrip');
const lis=[...sec.querySelectorAll('.ptrack li')];
const {clamp,e3,ss,M,B,BX,Cy,Sp,canvasTex,makeRnd,makeRenderer,prefersReducedMotion,isCoarsePointer}=AKBAS;
const N=lis.length,reduce=prefersReducedMotion(),coarse=isCoarsePointer();
let cur=0,target=0,dirty=true,visible=false,shown=-1,swT=0;

// Adım şeridi: her adım için bir küçük resim düğmesi
const thumbs=lis.map((l,i)=>{const b=document.createElement('button');b.type='button';b.className='pthumb';
  b.setAttribute('aria-label',(i+1)+'. adım: '+l.querySelector('b').textContent);
  b.innerHTML='<img alt=""><span>'+l.querySelector('span').textContent+'</span>';
  b.addEventListener('click',()=>goTo(i));strip.appendChild(b);return b});

function show(i){if(i===shown)return;const first=shown<0;shown=i;
  thumbs.forEach((t,k)=>t.classList.toggle('on',k===i));
  const put=()=>{const l=lis[i];info.querySelector('.pnum').textContent=l.querySelector('span').textContent;info.querySelector('h3').textContent=l.querySelector('b').textContent;
    info.querySelector('p').textContent=l.querySelector('p').textContent;info.querySelector('.pname i').innerHTML=l.querySelector('svg').outerHTML;info.classList.remove('sw')};
  if(first||reduce){put();return}info.classList.add('sw');clearTimeout(swT);swT=setTimeout(put,240)}

// kaydırma ilerlemesi -> adım (0..N-1)
function progress(){const r=sec.getBoundingClientRect(),span=sec.offsetHeight-innerHeight;return span>0?clamp(-r.top/span):0}
function goTo(i){const span=sec.offsetHeight-innerHeight,top=sec.getBoundingClientRect().top+scrollY;
  scrollTo({top:top+span*(i/(N-1)),behavior:reduce?'auto':'smooth'})}
// Mıknatıs: her adımın çevresinde sahne tam ortada durur, geçiş yalnızca adımların arasındaki dar bölgede olur.
const HOLD=.08;
function magnet(raw){const i=Math.floor(raw),t=raw-i;if(i>=N-1)return N-1;
  const u=clamp((t-HOLD)/(1-2*HOLD));return i+u*u*(3-2*u)}
// Kaydırma durunca adıma otur. Yöne bakar: o yöne birazcık (%10) kaydırmak bir sonraki adıma geçmeye yeter.
const PUSH=.1;
let idleT=0,snapping=false,base=0;
function snapToStep(){const r=sec.getBoundingClientRect();if(r.top>1||r.bottom<innerHeight-1){base=Math.round(progress()*(N-1));return} // bölüm ekrana sabit değilse karışma
  const raw=progress()*(N-1),d=raw-base;if(Math.abs(d)<.004)return;
  let i;if(d>0){const f=Math.floor(raw);i=raw-f>PUSH?f+1:f}else{const c=Math.ceil(raw);i=c-raw>PUSH?c-1:c}
  i=clamp(i,0,N-1);base=i;if(Math.abs(raw-i)<.004)return;snapping=true;goTo(i);clearTimeout(snapT);snapT=setTimeout(()=>{snapping=false},1500)}
let snapT=0;
function onScroll(){const raw=progress()*(N-1);target=magnet(raw);if(reduce)cur=target;show(Math.round(target));dirty=true;
  if(snapping&&Math.abs(raw-base)<.01){snapping=false;clearTimeout(snapT)} // otomatik kaydırma hedefe vardı
  clearTimeout(idleT);if(!snapping)idleT=setTimeout(snapToStep,110)}
addEventListener('scroll',onScroll,{passive:true});
stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'){goTo(clamp(Math.round(target)+1,0,N-1));e.preventDefault()}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){goTo(clamp(Math.round(target)-1,0,N-1));e.preventDefault()}});

// şeridi yerleştir: ortadaki adım çerçevenin arkasında, geçilenler solda, sıradakiler sağda
function placeStrip(p){const fw=stage.offsetWidth,tw=thumbs[0].offsetWidth,gap=Math.max(10,tw*.08),E=fw/2-tw/2;
  thumbs.forEach((t,k)=>{const d=k-p,x=d*(tw+gap)+clamp(d,-1,1)*E-tw/2;t.style.transform='translate('+x.toFixed(1)+'px,-50%)'})}
function tick(){requestAnimationFrame(tick);const d=target-cur;if(Math.abs(d)>.0005){cur+=d*.12;dirty=true}else if(d!==0){cur=target;dirty=true}
  if(dirty)placeStrip(cur)}
addEventListener('resize',()=>{dirty=true});
onScroll();show(Math.round(target));cur=target;requestAnimationFrame(tick);
if (typeof THREE === 'undefined') return;
// 3B sahne bölüme yaklaşınca kurulur, ilk açılış hafif kalsın
const lazy = new IntersectionObserver(es => { if (es[0].isIntersecting) { lazy.disconnect(); build(); } }, { rootMargin: '100% 0px' });
lazy.observe(stage);

/* =====================================================================
   Altı ayrı "stüdyo fotoğrafı" sahnesi. Her adım kendi renkli fon
   kâğıdının (sweep) önünde, dikey çerçeveye göre kurulur. Sahneler x
   ekseninde yan yana dizilir; kaydırınca kamera yana kayar ve bir sonraki
   sahne ORYZO'daki fotoğraflar gibi sağdan çerçeveye girer.
   ===================================================================== */
function build() {
  const R = makeRenderer(cv, .98); if (!R) return;
  R.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
  const PI = Math.PI, V3 = THREE.Vector3, UP = new V3(0, 1, 0);
  const SP = 4.2;                  // sahneler arası mesafe = bir fon kâğıdının genişliği
  const BACK = 1.9;                // fon duvarının merkeze uzaklığı
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(20, .75, .5, 80);
  const rnd = makeRnd(5), ctex = (w, h, draw) => canvasTex(w, h, draw, false);

  // ---------- malzemeler ----------
  const sage = M(0x76876c, .62), sageD = M(0x63725a, .7), creamF = M(0xe3d9ca, .95), ivory = M(0xf1ece3, .55), brass = M(0xb9965c, .4),
    dark = M(0x1d1b19, .5), oak = M(0xb88d5e, .6), oakL = M(0xcaa678, .6), green = M(0x4f6a47, .8), pot = M(0xe7e1d6, .6), steel = M(0xb9bcbf, .35),
    skin = M(0xd39c74, .75), skinD = M(0x8d5a3c, .75), hair = M(0x3b302a, .8), shoe = M(0x2a2622, .6), taupe = M(0x9b8676, .8), navy = M(0x39414a, .8),
    teal = M(0x2f4858, .8), terra = M(0xb5673f, .8), rugS = M(0x34422f, 1), tanL = M(0xb08a5e, .8), walnut = M(0x7a5236, .6),
    shade = M(0xf3ebdd, .9), wallM = M(0xd9d6cf, .95);

  // ---------- yardımcılar ----------
  const G = (p, x, y, z, ry) => { const g = new THREE.Group(); g.position.set(x, y, z); if (ry) g.rotation.y = ry; p.add(g); return g; };
  function limb(g, ax, ay, az, bx, by, bz, r, mat) {
    const a = new V3(ax, ay, az), d = new V3(bx, by, bz).sub(a), len = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(UP, d.normalize()); m.castShadow = true; g.add(m);
    Sp(g, r, mat, bx, by, bz); Sp(g, r, mat, ax, ay, az);
  }
  // insan figürü: ayakta ya da oturan, ön yüzü +z
  function person(pose, top, bot, o = {}) {
    const g = new THREE.Group(), sit = pose === 'sit', hy = sit ? .5 : .92, sk = o.skin || skin;
    B(g, .36, .52, .21, .09, top, 0, hy + .3, -.01); Sp(g, .12, sk, 0, hy + .74, .01, true); limb(g, 0, hy + .5, 0, 0, hy + .64, 0, .045, sk);
    const h = Sp(g, .128, hair, 0, hy + .768, -.022); h.scale.set(1, .9, 1);
    if (o.long) { const hb = Sp(g, .11, hair, 0, hy + .66, -.075); hb.scale.set(1, 1.3, .75); }
    [-1, 1].forEach(s => {
      if (sit) { limb(g, s * .1, hy, 0, s * .1, hy, .44, .072, bot); limb(g, s * .1, hy, .44, s * .1, .08, .46, .055, bot); B(g, .1, .07, .22, .03, shoe, s * .1, .035, .52); }
      else { limb(g, s * .09, hy, 0, s * .09, .08, 0, .066, bot); B(g, .1, .07, .24, .03, shoe, s * .09, .035, .05); }
      if (sit || o.arms || (o.arm && s === 1)) { limb(g, s * .21, hy + .5, 0, s * .23, hy + .24, .1, .046, top); limb(g, s * .23, hy + .24, .1, s * .15, hy + .27, .4, .042, top); Sp(g, .05, sk, s * .15, hy + .27, .44); }
      else { limb(g, s * .21, hy + .5, 0, s * .24, hy + .2, .02, .046, top); limb(g, s * .24, hy + .2, .02, s * .24, hy - .04, .05, .042, top); Sp(g, .05, sk, s * .24, hy - .1, .05); }
    });
    if (o.apron) B(g, .32, .56, .03, .01, o.apron, 0, hy + .22, .105);
    return g;
  }
  function chair(mat) {
    const c = new THREE.Group(); B(c, .5, .07, .5, .03, mat, 0, .46, 0); B(c, .5, .52, .07, .03, mat, 0, .77, -.23);
    [[-.21, -.21], [.21, -.21], [-.21, .21], [.21, .21]].forEach(p => Cy(c, .016, .016, .43, brass, p[0], .215, p[1], true, 8)); return c;
  }
  function leaves(g, x, y, z, n = 11, sc = 1, mat = green) {
    for (let i = 0; i < n; i++) {
      const a = i / n * PI * 2, l = new THREE.Mesh(new THREE.SphereGeometry(.5, 10, 8), mat);
      l.scale.set(.18 * sc, (.75 + (i % 3) * .22) * sc, .06 * sc); l.position.set(x + Math.cos(a) * .15 * sc, y + (.4 + (i % 3) * .1) * sc, z + Math.sin(a) * .15 * sc);
      l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); l.castShadow = true; g.add(l);
    }
  }
  function plant(g, x, z, sc = 1) { Cy(g, .2 * sc, .16 * sc, .42 * sc, pot, x, .21 * sc, z, true, 20); leaves(g, x, .42 * sc, z, 11, sc); }
  function lamp(g, x, z, bulb) {
    Cy(g, .17, .17, .03, brass, x, .015, z); Cy(g, .012, .012, 1.5, brass, x, .76, z, true, 8); Cy(g, .16, .21, .28, shade, x, 1.56, z, false, 24);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 10), bulb); b.position.set(x, 1.47, z); g.add(b);
  }
  // yazılı etiketler: açık = konuşma balonu, koyu = ölçü
  const labT = {};
  function labTex(t, dk) {
    const key = (dk ? 'd' : 'l') + t; if (labT[key]) return labT[key];
    const c = document.createElement('canvas'), k = c.getContext('2d'), f = '600 44px Outfit,system-ui,sans-serif'; k.font = f;
    const w = Math.max(110, Math.ceil(k.measureText(t).width) + 56), h = 84, r = 40; c.width = w; c.height = h;
    k.beginPath(); k.moveTo(r + 2, 2); k.arcTo(w - 2, 2, w - 2, h - 2, r); k.arcTo(w - 2, h - 2, 2, h - 2, r); k.arcTo(2, h - 2, 2, 2, r); k.arcTo(2, 2, w - 2, 2, r); k.closePath();
    k.fillStyle = dk ? '#100904' : '#ffedd7'; k.fill(); k.lineWidth = 3; k.strokeStyle = dk ? 'rgba(255,237,215,.55)' : 'rgba(16,9,4,.25)'; k.stroke();
    k.fillStyle = dk ? '#ffedd7' : '#100904'; k.font = f; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(t, w / 2, h / 2 + 3);
    const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 4; tx._a = w / h; return labT[key] = tx;
  }
  const label = (g, t, x, y, z, s = 1, dk = false) => {
    const tx = labTex(t, dk), m = new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false, toneMapped: false }), sp = new THREE.Sprite(m), h = .3 * s;
    sp.scale.set(h * tx._a, h, 1); sp.position.set(x, y, z); sp.renderOrder = 5; g.add(sp); return sp;
  };
  // küçük kat planı çizimi (pano, masa, klipsli not)
  const planT = ctex(256, 256, (x) => {
    x.fillStyle = '#f4efe6'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#2f3b46'; x.lineWidth = 6; x.strokeRect(30, 30, 196, 196); x.lineWidth = 4; x.beginPath();
    x.moveTo(30, 120); x.lineTo(130, 120); x.moveTo(130, 30); x.lineTo(130, 90); x.moveTo(130, 150); x.lineTo(130, 226); x.moveTo(170, 120); x.lineTo(226, 120); x.stroke();
    x.strokeStyle = '#a8844f'; x.lineWidth = 2; x.beginPath(); x.arc(130, 120, 28, 0, 1.57); x.stroke();
    x.fillStyle = '#76876c'; x.fillRect(46, 46, 50, 34); x.fillRect(160, 170, 50, 36); x.fillStyle = '#b5673f'; x.fillRect(160, 50, 40, 40);
  }); planT.encoding = THREE.sRGBEncoding;
  const paper = (p, w, h, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: planT, roughness: .85 })); m.position.set(x, y, z); p.add(m); return m; };

  // fon kâğıdı: önde zemin, arkada yumuşak kavisle yükselen duvar
  function sweep(g, color) {
    const prof = [[12, 0], [-(BACK - 1), 0]];
    for (let i = 1; i <= 10; i++) { const t = i / 10 * PI / 2; prof.push([-(BACK - 1) - Math.sin(t), 1 - Math.cos(t)]); }
    prof.push([-BACK, 8]);
    const pos = [], idx = [], hw = SP / 2 - .012;
    prof.forEach(p => { pos.push(-hw, p[1], p[0], hw, p[1], p[0]); });
    for (let i = 0; i < prof.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: .95 })); m.receiveShadow = true; g.add(m); return m;
  }
  // sahne grubu: i. adım x = i·SP
  const V = [];
  const vign = (i, color) => { const g = G(scene, i * SP, 0, 0); sweep(g, color); V[i] = g; return g; };
  let g, c, s;

  // =============== 1 · Ön Görüşme: tasarımcı ve müşteri masada, arkada moodboard ===============
  g = vign(0, 0xbfa07c);
  Cy(g, 1.55, 1.55, .02, rugS, 0, .012, 0, false, 48);
  Cy(g, .55, .55, .04, walnut, 0, .74, 0, true, 36); Cy(g, .05, .07, .72, brass, 0, .37, 0, true, 12); Cy(g, .3, .3, .02, brass, 0, .01, 0, true, 24);
  [[-.95, PI / 2, teal, shoe, true, skin], [.95, -PI / 2, terra, navy, false, skinD]].forEach(a => {
    c = chair(tanL); c.position.x = a[0]; c.rotation.y = a[1]; g.add(c);
    c = person('sit', a[2], a[3], { long: a[4], skin: a[5] }); c.position.x = a[0]; c.rotation.y = a[1]; g.add(c);
  });
  B(g, .36, .016, .25, .006, steel, -.06, .768, -.12); { const scr = B(g, .36, .24, .012, .006, dark, -.06, .885, -.255); scr.rotation.x = -.25; }
  { const pp = paper(g, .3, .3, .08, .764, .22); pp.rotation.set(-PI / 2, 0, .25); }
  [[-.3, .14], [.33, .04]].forEach(p => { Cy(g, .045, .035, .07, ivory, p[0], .795, p[1], false, 14); Cy(g, .07, .07, .01, ivory, p[0], .765, p[1], false, 14); });
  [[0x76876c, 0], [0xb5673f, .35], [0xc9a466, .7], [0x2f4858, 1.05]].forEach(q => { const t = B(g, .11, .008, .2, .003, M(q[0], .5), .28, .767, -.2); t.rotation.y = q[1] - .5; });
  // sehpada moodboard
  limb(g, -.4, 0, -1.0, -.3, 1.95, -1.26, .022, oak); limb(g, .4, 0, -1.0, .3, 1.95, -1.26, .022, oak); limb(g, 0, 0, -1.6, 0, 1.9, -1.3, .022, oak);
  { const mb = G(g, 0, 1.36, -1.14); mb.rotation.x = -.12; B(mb, 1.3, .9, .03, .01, M(0xa9835a, .9), 0, 0, 0);
    paper(mb, .5, .5, -.33, .08, .02);
    [[0x76876c, 0xb5673f, 0xc9a466], [0x2f4858, 0xe3d9ca, 0x7a5236]].forEach((r, j) => r.forEach((col, i) => B(mb, .16, .16, .02, .004, M(col, .6), .1 + i * .19, .24 - j * .2, .02)));
    B(mb, .54, .14, .02, .004, oakL, .29, -.22, .02); }
  label(g, 'Tarzınız, bütçeniz?', -.78, 2.32, .2, .66); label(g, 'Sade ve ferah', .82, 2.02, .2, .66);
  plant(g, -1.42, -.75); lamp(g, 1.45, -.85, new THREE.MeshStandardMaterial({ color: 0xf6efe2, emissive: 0xffd8a0, emissiveIntensity: .7 }));

  // =============== 2 · Keşif ve Röleve: boş oda, lazer metreyle ölçüm ===============
  g = vign(1, 0x66735c);
  BX(g, 3.5, .06, 2.6, M(0xc9c4bb, .95), 0, .03, -.25);                                  // şap zemin
  BX(g, 3.5, 2.7, .12, wallM, 0, 1.38, -1.5);                                              // arka duvar
  BX(g, .12, 2.7, 2.0, wallM, -1.69, 1.38, -.55);                                          // sol duvar
  { const wg = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.3), new THREE.MeshBasicMaterial({ color: 0xdfeaf5 })); wg.position.set(-.25, 1.55, -1.43); g.add(wg);
    const fm = M(0xf4f1ea, .5);[[1.3, .07, -.25, 2.2], [1.3, .07, -.25, .9]].forEach(a => BX(g, a[0], a[1], .06, fm, a[2], a[3], -1.41));
    [[-.88], [.38], [-.25]].forEach(a => BX(g, .06, 1.3, .05, fm, a[0], 1.55, -1.41)); }
  const dimM = new THREE.MeshBasicMaterial({ color: 0x100904 }), T = .025;
  const dl = (w, h, d, x, y, z) => BX(g, w, h, d, dimM, x, y, z, false);
  dl(1.2, T, T, -.25, 2.42, -1.4); dl(T, .16, T, -.85, 2.42, -1.4); dl(T, .16, T, .35, 2.42, -1.4); label(g, '1,20 m', -.25, 2.62, -1.3, .8, true);
  dl(T, 1.3, T, .62, 1.55, -1.4); dl(.16, T, T, .62, .9, -1.4); dl(.16, T, T, .62, 2.2, -1.4); label(g, '1,30 m', 1.02, 1.55, -1.3, .8, true);
  dl(T, 2.7, T, 1.62, 1.38, -1.4); dl(.16, T, T, 1.62, .04, -1.4); dl(.16, T, T, 1.62, 2.72, -1.4); label(g, '2,70 m', 1.36, 2.98, -1.3, .8, true);
  // yerdeki sarı lazer metre: sağdan sol duvara kırmızı ışın
  const redM = new THREE.MeshBasicMaterial({ color: 0xe23a2e });
  B(g, .16, .09, .09, .02, M(0xf0b429, .5), 1.42, .105, .95); BX(g, .02, .05, .06, dark, 1.335, .11, .95, false);
  BX(g, 2.98, .014, .014, redM, -.15, .11, .95, false); Sp(g, .04, redM, -1.63, .11, .95);
  label(g, '3,40 m', -.15, .34, 1.0, .8, true);
  // cihaza bakıp ölçüyü okuyan kişi
  s = G(g, 1.12, 0, .2, -.55); s.add(person('stand', teal, shoe, { arm: true }));
  // pencerenin önünde not alan kişi
  s = G(g, -.95, 0, -.85, .4); s.add(person('stand', terra, navy, { arms: true, long: true, skin: skinD }));
  { const cb = G(s, 0, 1.22, .46); cb.rotation.x = .55; B(cb, .34, .02, .44, .01, walnut, 0, 0, 0); const pp = paper(cb, .3, .38, 0, .012, .01); pp.rotation.x = -PI / 2; }

  // =============== 3 · 3D Tasarım: lacivert fonda, mavi tel kafes oda ===============
  g = vign(2, 0x0d141d);
  const gridT = ctex(256, 256, (x) => { x.strokeStyle = '#fff'; x.lineWidth = 2; x.strokeRect(0, 0, 256, 256); x.lineWidth = .7; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 256); x.moveTo(0, i * 64); x.lineTo(256, i * 64); x.stroke(); } });
  gridT.wrapS = gridT.wrapT = THREE.RepeatWrapping; gridT.repeat.set(4, 3);
  { const gr = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6), new THREE.MeshBasicMaterial({ map: gridT, transparent: true, opacity: .45, color: 0x5ea2ff, depthWrite: false, blending: THREE.AdditiveBlending }));
    gr.rotation.x = -PI / 2; gr.position.set(0, .01, -.35); g.add(gr); }
  const wireM = new THREE.LineBasicMaterial({ color: 0x9cc8ff }), fillM = new THREE.MeshBasicMaterial({ color: 0x3f8cf0, transparent: true, opacity: .16, depthWrite: false });
  const WF = [
    { x: 0, z: -.2, parts: [['b', 2.8, .02, 1.9, 0, .02, 0]] },                                                                    // halı
    { x: -.15, z: -.95, parts: [['b', 2.1, .36, .85, 0, .28, 0], ['b', 2.1, .58, .22, 0, .68, -.32], ['b', .2, .5, .85, -.95, .46, 0], ['b', .2, .5, .85, .95, .46, 0]] }, // kanepe
    { x: -.15, z: .1, parts: [['c', .42, .04, 0, .4, 0], ['c', .18, .38, 0, .19, 0]] },                                            // sehpa
    { x: -1.45, z: -1.2, parts: [['c', .18, .27, 0, 1.56, 0], ['b', .025, 1.48, .025, 0, .76, 0], ['c', .16, .03, 0, .015, 0]] },  // lambader
    { x: 0, z: -1.8, parts: [['b', 1.6, .9, .04, -.15, 1.85, 0]] },                                                                // tablo
  ];
  WF.forEach(f => { const w = G(g, f.x, 0, f.z, f.ry); f.parts.forEach(q => {
    const geo = q[0] === 'b' ? new THREE.BoxGeometry(q[1], q[2], q[3]) : new THREE.CylinderGeometry(q[1], q[1], q[2], 24), o = q[0] === 'b' ? 4 : 3;
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), wireM); l.position.set(q[o], q[o + 1], q[o + 2]); w.add(l);
    const fm = new THREE.Mesh(geo, fillM); fm.position.copy(l.position); w.add(fm); }); });
  // tasarımı biten koltuk: katı ve renkli, render'a geçişi gösteriyor
  s = G(g, 1.2, 0, .25, -.85);
  B(s, .72, .3, .7, .07, sage, 0, .3, 0); B(s, .72, .55, .2, .07, sage, 0, .68, -.3); B(s, .15, .4, .7, .07, sage, -.36, .47, 0); B(s, .15, .4, .7, .07, sage, .36, .47, 0);
  [[-.28, -.26], [.28, -.26], [-.28, .26], [.28, .26]].forEach(p => Cy(s, .02, .015, .16, brass, p[0], .08, p[1], true, 8));
  // tel kafes saksı bitki
  { const w = G(g, 1.3, 0, -1.25); const geo = new THREE.CylinderGeometry(.2, .16, .42, 16), l = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), wireM); l.position.y = .21; w.add(l);
    const lm = new THREE.MeshBasicMaterial({ color: 0x9cc8ff, wireframe: true, transparent: true, opacity: .55 }); leaves(w, 0, .42, 0, 9, 1, lm); }
  const bl = new THREE.LineBasicMaterial({ color: 0xffedd7 });
  { const pts = [new V3(-1.2, 1.25, -.55), new V3(.9, 1.25, -.55)], ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), bl); g.add(ln); }
  label(g, '2,20 m', -.15, 1.42, -.5, .8, true);
  label(g, 'Render', 1.2, 1.35, .3, .7);

  // =============== 4 · Proje Onayı: ekranda tasarım, numuneler, imzalı onay ===============
  const rt = new THREE.WebGLRenderTarget(768, 480); rt.texture.encoding = THREE.sRGBEncoding;
  g = vign(3, 0x7a2416);
  B(g, 2.1, .06, .95, .015, walnut, 0, .77, 0); [[-.95, -.38], [.95, -.38], [-.95, .38], [.95, .38]].forEach(p => Cy(g, .03, .03, .74, brass, p[0], .37, p[1], true, 10));
  { const mon = G(g, -.3, .8, -.25); mon.rotation.y = .08; B(mon, 1.2, .78, .05, .02, dark, 0, .55, 0);
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(1.13, .705), new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false })); sm.position.set(0, .55, .028); mon.add(sm);
    B(mon, .4, .03, .26, .01, dark, 0, .015, -.02); B(mon, .07, .18, .04, .01, dark, 0, .1, -.04); }
  // numuneler: mermer, meşe, kumaş, renk kartelası
  const mT = ctex(128, 128, (x) => { x.fillStyle = '#f0ece6'; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(150,118,90,.5)'; x.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) { x.beginPath(); let px = rnd() * 128, py = rnd() * 128; x.moveTo(px, py); for (let k = 0; k < 8; k++) { px += (rnd() - .4) * 30; py += (rnd() - .4) * 30; x.lineTo(px, py); } x.stroke(); } }); mT.encoding = THREE.sRGBEncoding;
  B(g, .28, .025, .28, .005, new THREE.MeshStandardMaterial({ map: mT, roughness: .2 }), .7, .81, -.15).rotation.y = .2; B(g, .26, .025, .26, .005, oak, .6, .835, -.22).rotation.y = -.3;
  [[0xe3d9ca, 0], [0x9b8676, .02], [0x76876c, .04]].forEach((q, i) => B(g, .22, .02, .26, .008, M(q[0], .95), .55, .81 + q[1], .2 + i * .02).rotation.y = .5 - i * .25);
  [0x76876c, 0x63725a, 0xe3d9ca, 0xb9965c, 0x9b8676].forEach((col, i) => { const t = B(g, .06, .006, .2, .002, M(col, .5), .25, .803 + i * .001, .3); t.rotation.y = -.6 + i * .28; });
  // onay kâğıdı, mühür ve kalem
  { const sh2 = G(g, -.3, .803, .3); sh2.rotation.y = .12; B(sh2, .4, .008, .32, .003, ivory, 0, 0, 0); [-.1, -.05, 0].forEach(z => BX(sh2, .28, .002, .014, M(0xb9b1a3, .8), 0, .006, z, false)); BX(sh2, .14, .002, .012, dark, .07, .006, .1, false);
    const seal = G(sh2, -.11, .02, .09); seal.rotation.x = -PI / 2; seal.add(new THREE.Mesh(new THREE.TorusGeometry(.06, .011, 8, 28), brass)); }
  { const pn = Cy(g, .01, .01, .22, brass, -.02, .815, .38, false, 8); pn.rotation.set(0, .6, PI / 2); }
  // büyük onay işareti
  { const big = G(g, .95, 2.25, -.4); big.add(new THREE.Mesh(new THREE.TorusGeometry(.3, .045, 12, 44), brass));
    let ck = BX(big, .2, .07, .06, brass, -.1, -.05, 0, false); ck.rotation.z = -PI / 4; ck = BX(big, .36, .07, .06, brass, .07, .015, 0, false); ck.rotation.z = PI / 3.6; }
  label(g, 'Onaylandı', .95, 1.72, -.3, .7);
  c = person('stand', sage, navy, { arm: true, long: true }); c.position.set(-1.35, 0, .15); c.rotation.y = PI / 2 - .35; g.add(c);
  c = person('stand', taupe, shoe, { arm: true, skin: skinD }); c.position.set(1.4, 0, .35); c.rotation.y = -PI / 2 + .5; g.add(c);

  // =============== 5 · İmalat: atölye, tezgâh ve usta ===============
  g = vign(4, 0x8a5a32);
  // arka duvarda alet panosu
  B(g, 2.5, 1.15, .04, .01, oakL, 0, 1.85, -BACK + .06);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) Cy(g, .012, .012, .01, dark, -1.0 + i * .28, 1.42 + j * .3, -BACK + .085, false, 6).rotation.x = PI / 2;
  B(g, .06, .34, .03, .01, oak, -.9, 1.8, -BACK + .1); B(g, .2, .09, .07, .02, steel, -.9, 2.0, -BACK + .11);                  // çekiç
  B(g, .55, .15, .012, .004, steel, -.2, 2.0, -BACK + .1).rotation.z = -.08; B(g, .14, .16, .03, .03, oak, -.52, 2.02, -BACK + .1); // testere
  BX(g, .4, .035, .012, steel, .55, 2.15, -BACK + .1, false); BX(g, .035, .28, .012, steel, .37, 2.02, -BACK + .1, false);      // gönye
  [.85, .97, 1.09].forEach((x, i) => { Cy(g, .012, .012, .2, steel, x, 2.03, -BACK + .1, false, 6); Cy(g, .022, .022, .12, M([0xd98a2b, 0x76876c, 0xb24a3a][i], .5), x, 2.18, -BACK + .1, false, 8); });
  [-.75, -.4].forEach(x => { BX(g, .05, .3, .03, M(0xd98a2b, .5), x, 1.52, -BACK + .1); BX(g, .14, .03, .03, steel, x + .045, 1.66, -BACK + .1); BX(g, .14, .03, .03, steel, x + .045, 1.39, -BACK + .1); });
  // duvara yaslı keresteler
  [[0xcaa678, -1.62], [0xb88d5e, -1.5], [0xd8b98a, -1.38], [0xa97c4f, -1.26]].forEach((a, i) => { const p = B(g, .1, 2.3 - i * .12, .05, .01, M(a[0], .65), a[1], 1.12 - i * .06, -1.55 + i * .04); p.rotation.z = -.1; });
  // yaslı levhalar
  [[0xd9cfbd, 0], [0x76876c, .05]].forEach(a => { const p = B(g, .95, 1.4, .03, .004, M(a[0], .6), 1.25, .71, -1.45 + a[1]); p.rotation.x = -.1; });
  // tezgâh
  s = G(g, -.15, 0, .05);
  B(s, 2.0, .07, .72, .01, oakL, 0, .84, 0); [[-.9, -.3], [.9, -.3], [-.9, .3], [.9, .3]].forEach(p => BX(s, .08, .8, .08, oak, p[0], .4, p[1])); B(s, 1.85, .04, .58, .006, oak, 0, .2, 0);
  B(s, .9, .03, .42, .004, sage, -.45, .895, 0); B(s, .9, .03, .42, .004, sageD, -.42, .925, .02);
  { const saw = Cy(s, .14, .14, .012, M(0xd0d3d6, .25), .45, 1.0, .02, true, 24); saw.rotation.x = PI / 2; } B(s, .3, .12, .14, .03, M(0xd98a2b, .5), .45, 1.03, .1);
  B(s, .2, .12, .14, .02, steel, .85, .9, .24); Cy(s, .012, .012, .3, oak, -.8, .89, -.22, false, 6).rotation.z = PI / 2;
  [[-.5, .24, .1], [.3, .24, -.1]].forEach(a => B(s, .4, .04, .3, .004, M(0xd9cfbd, .6), a[0], a[1], a[2]));
  // yarı kurulmuş dolap gövdesi
  s = G(g, -1.05, 0, .75, .35);
  [[.03, 1.3, .45, -.4, .65, 0], [.03, 1.3, .45, .4, .65, 0], [.83, .03, .45, 0, 1.29, 0], [.83, .05, .45, 0, .03, 0], [.83, 1.3, .02, 0, .65, -.215], [.8, .02, .42, 0, .7, 0]]
    .forEach(a => B(s, a[0], a[1], a[2], .005, sageD, a[3], a[4], a[5]));
  c = person('stand', navy, shoe, { arms: true, apron: sage, skin: skinD }); c.position.set(1.15, 0, .2); c.rotation.y = -PI / 2; g.add(c);
  // talaş
  for (let i = 0; i < 18; i++) { const ch = BX(g, .04, .006, .02, oakL, -.6 + rnd() * 1.6, .004, .55 + rnd() * .6, false); ch.rotation.y = rnd() * PI; }

  // =============== 6 · Montaj ve Teslim: bitmiş, sıcak ışıklı oturma köşesi ===============
  g = vign(5, 0xa98a66);
  Cy(g, 1.5, 1.5, .02, M(0xd6c8b2, 1), -.05, .012, -.2, false, 48);
  // kanepe
  s = G(g, -.15, 0, -.95);
  B(s, 2.2, .36, .88, .07, creamF, 0, .28, 0); B(s, 2.2, .6, .24, .07, creamF, 0, .68, -.33); B(s, .22, .52, .88, .07, creamF, -1.0, .46, 0); B(s, .22, .52, .88, .07, creamF, 1.0, .46, 0);
  B(s, .9, .16, .6, .07, ivory, -.46, .53, -.08); B(s, .9, .16, .6, .07, ivory, .46, .53, -.08);
  [[-.7, 0xd8c9b0, .14], [.68, 0x8b9a80, -.14]].forEach(a => { const p = B(s, .42, .38, .14, .07, M(a[1], .95), a[0], .78, -.16); p.rotation.z = a[2]; });
  B(s, .8, .03, .5, .01, M(0x9b8676, .95), .5, .64, .05).rotation.y = .2;                                                      // ekose
  // sehpa, vazo, anahtar
  s = G(g, -.15, 0, .15);
  Cy(s, .4, .4, .04, ivory, 0, .42, 0, true, 32); Cy(s, .18, .18, .4, oak, 0, .2, 0, true, 24);
  Cy(s, .06, .05, .2, pot, -.12, .54, -.05, false, 14); leaves(s, -.12, .55, -.05, 6, .3);
  { const k = G(s, .14, .445, .08); k.rotation.x = -PI / 2; k.add(new THREE.Mesh(new THREE.TorusGeometry(.045, .008, 8, 24), brass));
    BX(k, .11, .022, .006, brass, .1, 0, 0, false); BX(k, .02, .03, .006, brass, .14, -.02, 0, false); }
  // koltuk
  s = G(g, 1.3, 0, .2, -.9);
  B(s, .72, .3, .7, .07, sage, 0, .3, 0); B(s, .72, .55, .2, .07, sage, 0, .68, -.3); B(s, .15, .4, .7, .07, sage, -.36, .47, 0); B(s, .15, .4, .7, .07, sage, .36, .47, 0);
  // lambader, bitki, tablo
  const bulbW = new THREE.MeshStandardMaterial({ color: 0xf6efe2, emissive: 0xffc27a, emissiveIntensity: 1.6 });
  lamp(g, -1.5, -.95, bulbW); plant(g, 1.45, -1.05, 1.1);
  { const art = G(g, -.15, 1.85, -BACK + .06); B(art, 1.3, .85, .04, .01, M(0xf1ece3, .6), 0, 0, 0); B(art, 1.16, .71, .02, .005, M(0x3f4f47, .9), 0, 0, .02);
    const sun0 = new THREE.Mesh(new THREE.CircleGeometry(.18, 28), M(0xa4693f, .8)); sun0.position.set(.18, .08, .035); art.add(sun0); }
  label(g, 'Hoş geldiniz!', .2, 2.65, -.6, .72);
  const warm = new THREE.PointLight(0xffc98f, 1.2, 6, 2); warm.position.set(-1.2, 1.7, -.4); g.add(warm);

  // ---------- ışıklar: güneş kamerayla birlikte kayar, gölgeler hep sahnede kalır ----------
  const hemi = new THREE.HemisphereLight(0xfff2e2, 0x6e6052, .42); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e8, .78); sun.castShadow = true; sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 30 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  scene.add(sun, sun.target);
  const blue = new THREE.PointLight(0x5ea2ff, .9, 5, 2); blue.position.set(2 * SP, 1.2, .6); scene.add(blue);

  // ---------- kamera ----------
  let aspect = .75;
  function resize() { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; R.setSize(w, h, false); aspect = w / h; cam.aspect = aspect; cam.updateProjectionMatrix(); dirty = true; }
  function update(p) {
    const tn = Math.tan(cam.fov * PI / 360) * 2;
    const Db = SP * .985 / (aspect * tn), D = Db - BACK;          // fon duvarı çerçeveyi tam doldursun
    const x = p * SP, ty = .72, cy = ty + D * .16;
    cam.position.set(x, cy, D); cam.lookAt(x, ty, 0);
    sun.position.set(x + 3.5, 7, 5.5); sun.target.position.set(x, 0, -.3);
  }
  // onay ekranındaki görüntü: bitmiş oda
  function snap() {
    const c2 = new THREE.PerspectiveCamera(24, 1.6, .5, 40); c2.position.set(5 * SP, 1.9, 5.2); c2.lookAt(5 * SP - .1, .75, -.4);
    sun.position.set(5 * SP + 3.5, 7, 5.5); sun.target.position.set(5 * SP, 0, -.3); sun.target.updateMatrixWorld();
    R.setRenderTarget(rt); R.render(scene, c2); R.setRenderTarget(null); dirty = true;
  }
  // Adım şeridi için her adımın küçük resmi
  function makeThumbs() {
    const w = cv.width, h = cv.height; if (!w || !h) return false;
    const tw = 240, th = Math.round(tw * h / w), cc = document.createElement('canvas'); cc.width = tw; cc.height = th; const k = cc.getContext('2d');
    for (let i = 0; i < N; i++) { update(i); R.render(scene, cam); k.clearRect(0, 0, tw, th); k.drawImage(R.domElement, 0, 0, tw, th); thumbs[i].querySelector('img').src = cc.toDataURL('image/webp', .86); }
    dirty = true; return true;
  }
  let snapped = false, thumbed = false;
  function frame() {
    requestAnimationFrame(frame); if (!visible) return;
    if (!snapped) { snapped = true; snap(); }
    if (!thumbed) thumbed = makeThumbs();
    if (!dirty) return; dirty = false; update(cur); R.render(scene, cam);
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { resize(); dirty = true; } }, { rootMargin: '200px' }).observe(stage);
  addEventListener('resize', resize); resize(); requestAnimationFrame(frame);
}
})();
