(function(){
const sec=document.getElementById('surec');if(!sec)return;
const stage=sec.querySelector('.pstage'),cv=stage.querySelector('canvas'),info=stage.querySelector('.pinfo'),hint=stage.querySelector('.phint');
const lis=[...sec.querySelectorAll('.ptrack li')],prev=sec.querySelector('.pprev'),next=sec.querySelector('.pnext');
const {clamp,e3,ss,M,B,BX,Cy,Sp,canvasTex,makeRnd,makeRenderer,prefersReducedMotion,isCoarsePointer}=AKBAS;
const N=lis.length,reduce=prefersReducedMotion(),coarse=isCoarsePointer();
let cur=0,target=0,dirty=true,visible=false,shown=-1,swT=0;
function show(i){if(i===shown)return;const first=shown<0;shown=i;lis.forEach((l,k)=>l.classList.toggle('on',k===i));prev.disabled=i===0;next.disabled=i===N-1;
const put=()=>{info.querySelector('.pnum').textContent=lis[i].querySelector('span').textContent;info.querySelector('h3').textContent=lis[i].querySelector('b').textContent;info.querySelector('p').textContent=lis[i].querySelector('p').textContent;info.classList.remove('sw')};
if(first||reduce){put();return}info.classList.add('sw');clearTimeout(swT);swT=setTimeout(put,260)}
const go=i=>{target=clamp(i,0,N-1);hint.classList.add('off');if(reduce)cur=target;dirty=true;show(Math.round(target))};
lis.forEach((l,i)=>l.querySelector('button').addEventListener('click',()=>go(i)));
prev.addEventListener('click',()=>go(Math.round(target)-1));next.addEventListener('click',()=>go(Math.round(target)+1));
stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){go(Math.round(target)+1);e.preventDefault()}else if(e.key==='ArrowLeft'){go(Math.round(target)-1);e.preventDefault()}});
// drag: pulling the scene to the right moves to the next step
let dragging=false,sx=0,sy=0,sp=0,decided=false,pid=null;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pid=e.pointerId;sx=e.clientX;sy=e.clientY;sp=cur;decided=false;dragging=false});
stage.addEventListener('pointermove',e=>{if(e.pointerId!==pid)return;const dx=e.clientX-sx,dy=e.clientY-sy;
if(!decided){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;decided=true;dragging=Math.abs(dx)>Math.abs(dy);if(dragging){try{stage.setPointerCapture(pid)}catch(_){}stage.classList.add('drag');hint.classList.add('off')}}
if(!dragging)return;let p=sp+dx/Math.max(220,stage.clientWidth*.45);if(p<0)p*=.25;if(p>N-1)p=N-1+(p-N+1)*.25;cur=target=p;dirty=true;show(clamp(Math.round(p),0,N-1))});
const end=e=>{if(e.pointerId!==pid)return;pid=null;if(!dragging)return;dragging=false;stage.classList.remove('drag');const d=cur-sp;let t=Math.round(cur);if(Math.abs(d)>.12&&Math.abs(d)<.5)t=Math.round(sp)+Math.sign(d);go(t)};
stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
show(0);
if(typeof THREE==='undefined')return;
// build the 3D scene only when the section gets close, so the first load stays light
const lazy=new IntersectionObserver(es=>{if(es[0].isIntersecting){lazy.disconnect();build()}},{rootMargin:'100% 0px'});lazy.observe(stage);
function build(){
const R=makeRenderer(cv,1.05);if(!R)return;
let pr=Math.min(devicePixelRatio||1,coarse?1.5:2);R.setPixelRatio(pr);
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(26,1,1,120),PI=Math.PI,S=6,H=2.8,V3=THREE.Vector3;
const UP=new V3(0,1,0);
function limb(g,ax,ay,az,bx,by,bz,r,mat){const a=new V3(ax,ay,az),d=new V3(bx,by,bz).sub(a),len=d.length(),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10),mat);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(UP,d.normalize());m.castShadow=true;g.add(m);Sp(g,r,mat,bx,by,bz);Sp(g,r,mat,ax,ay,az)}
const ctex=(w,h,draw)=>canvasTex(w,h,draw,false);
const rnd=makeRnd(5);
const sage=M(0x76876c,.62),sageD=M(0x63725a,.7),creamF=M(0xe3d9ca,.95),ivory=M(0xf1ece3,.55),brass=M(0xb9965c,.4),dark=M(0x1d1b19,.5),oak=M(0xb88d5e,.6),oakL=M(0xcaa678,.6),green=M(0x4f6a47,.8),pot=M(0xe7e1d6,.6),steel=M(0xb9bcbf,.35);
const skin=M(0xd39c74,.75),hair=M(0x3b302a,.8),shoe=M(0x2a2622,.6),taupe=M(0x9b8676,.8),navy=M(0x39414a,.8),rugM=M(0xddd2c0,1),teal=M(0x2f4858,.8),terra=M(0xb5673f,.8),rugS=M(0x34422f,1),rugT=M(0x503d2e,1),tanL=M(0xb08a5e,.8),walnut=M(0x7a5236,.6);
const MATS={rug:rugM,cream:creamF,ivory,oak,sage,brass,pot,shade:M(0xf3ebdd,.9),curtain:M(0xeee9df,.95)};
// ---- registry of things that come and go ----
const props=[],at=i=>p=>1-Math.abs(p-i)/.6;
const G=(x,y,z,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;scene.add(g);return g};
const reg=(o,fn,mode,mats)=>{o.userData.y=o.position.y;o.visible=false;props.push({o,fn,mode,mats});return o};
const roomAmt=p=>ss(p,.35,.9)*(1-ss(p,2.4,2.9))+ss(p,3.25,3.8);
// ---- people, chairs, plants ----
function person(pose,top,bot,o={}){const g=new THREE.Group(),sit=pose==='sit',hy=sit?.5:.92;
B(g,.36,.52,.21,.09,top,0,hy+.3,-.01);Sp(g,.12,skin,0,hy+.74,.01,true);limb(g,0,hy+.5,0,0,hy+.64,0,.045,skin);
const h=Sp(g,.128,hair,0,hy+.768,-.022);h.scale.set(1,.9,1);if(o.long){const hb=Sp(g,.11,hair,0,hy+.66,-.075);hb.scale.set(1,1.3,.75)}
[-1,1].forEach(s=>{
if(sit){limb(g,s*.1,hy,0,s*.1,hy,.44,.072,bot);limb(g,s*.1,hy,.44,s*.1,.08,.46,.055,bot);B(g,.1,.07,.22,.03,shoe,s*.1,.035,.52)}
else{limb(g,s*.09,hy,0,s*.09,.08,0,.066,bot);B(g,.1,.07,.24,.03,shoe,s*.09,.035,.05)}
if(sit||o.arms||(o.arm&&s===1)){limb(g,s*.21,hy+.5,0,s*.23,hy+.24,.1,.046,top);limb(g,s*.23,hy+.24,.1,s*.15,hy+.27,.4,.042,top);Sp(g,.05,skin,s*.15,hy+.27,.44)}
else{limb(g,s*.21,hy+.5,0,s*.24,hy+.2,.02,.046,top);limb(g,s*.24,hy+.2,.02,s*.24,hy-.04,.05,.042,top);Sp(g,.05,skin,s*.24,hy-.1,.05)}});
if(o.apron)B(g,.32,.56,.03,.01,o.apron,0,hy+.22,.105);return g}
function chair(mat){const c=new THREE.Group();B(c,.5,.07,.5,.03,mat,0,.46,0);B(c,.5,.52,.07,.03,mat,0,.77,-.23);[[-.21,-.21],[.21,-.21],[-.21,.21],[.21,.21]].forEach(p=>Cy(c,.016,.016,.43,brass,p[0],.215,p[1],true,8));return c}
function leaves(g,x,y,z,n=11,sc=1){for(let i=0;i<n;i++){const a=i/n*PI*2,l=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),green);l.scale.set(.18*sc,(.75+(i%3)*.22)*sc,.06*sc);l.position.set(x+Math.cos(a)*.15*sc,y+(.4+(i%3)*.1)*sc,z+Math.sin(a)*.15*sc);l.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5);l.castShadow=true;g.add(l)}}
function plant(g,x,z){Cy(g,.2,.16,.42,pot,x,.21,z,true,20);leaves(g,x,.42,z)}
function lamp(g,x,z,bulb){Cy(g,.17,.17,.03,brass,x,.015,z);Cy(g,.012,.012,1.5,brass,x,.76,z,true,8);Cy(g,.16,.21,.28,MATS.shade,x,1.56,z,false,24);const b=new THREE.Mesh(new THREE.SphereGeometry(.05,12,10),bulb);b.position.set(x,1.47,z);g.add(b)}
// text pills: light = speech bubble, dark = measurement
const labT={};
function labTex(t,dk){const key=(dk?'d':'l')+t;if(labT[key])return labT[key];const c=document.createElement('canvas'),k=c.getContext('2d'),f='700 44px Manrope,system-ui,sans-serif';k.font=f;
const w=Math.max(110,Math.ceil(k.measureText(t).width)+56),h=84,r=40;c.width=w;c.height=h;
k.beginPath();k.moveTo(r+2,2);k.arcTo(w-2,2,w-2,h-2,r);k.arcTo(w-2,h-2,2,h-2,r);k.arcTo(2,h-2,2,2,r);k.arcTo(2,2,w-2,2,r);k.closePath();
k.fillStyle=dk?'#2b2621':'#f6f0e4';k.fill();k.lineWidth=3;k.strokeStyle=dk?'#c9a56b':'rgba(111,90,51,.4)';k.stroke();
k.fillStyle=dk?'#f7e7c6':'#463a22';k.font=f;k.textAlign='center';k.textBaseline='middle';k.fillText(t,w/2,h/2+3);
const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=4;tx._a=w/h;return labT[key]=tx}
const label=(g,arr,t,x,y,z,s=1,dk=false)=>{const tx=labTex(t,dk),m=new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false,toneMapped:false});arr.push(m);const sp=new THREE.Sprite(m),h=.3*s;sp.scale.set(h*tx._a,h,1);sp.position.set(x,y,z);sp.renderOrder=5;g.add(sp)};
// a small floor-plan drawing, reused on the moodboard, the table and the clipboard
const planT=ctex(256,256,(x)=>{x.fillStyle='#f4efe6';x.fillRect(0,0,256,256);x.strokeStyle='#2f3b46';x.lineWidth=6;x.strokeRect(30,30,196,196);x.lineWidth=4;x.beginPath();x.moveTo(30,120);x.lineTo(130,120);x.moveTo(130,30);x.lineTo(130,90);x.moveTo(130,150);x.lineTo(130,226);x.moveTo(170,120);x.lineTo(226,120);x.stroke();
x.strokeStyle='#a8844f';x.lineWidth=2;x.beginPath();x.arc(130,120,28,0,1.57);x.stroke();x.fillStyle='#76876c';x.fillRect(46,46,50,34);x.fillRect(160,170,50,36);x.fillStyle='#b5673f';x.fillRect(160,50,40,40)});planT.encoding=THREE.sRGBEncoding;
const paper=(p,w,h,x,y,z)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:planT,roughness:.85}));m.position.set(x,y,z);p.add(m);return m};
// ---- bases: square slab + walls (room / workshop), round platform (meeting / approval) ----
const slab=B(scene,S+.2,.3,S+.2,.03,M(0xb8b2a8,.95),(S-.2)/2,-.15,(S-.2)/2);reg(slab,roomAmt,'c');
const plat=Cy(scene,2.8,2.8,.14,M(0x2f2823,.9),3,.07,3,true,64);plat.castShadow=false;reg(plat,p=>Math.max(at(0)(p),at(3)(p)),'c');
const walls=G(0,0,0),wallMat=M(0xc4c7cc,.95);
const wA=B(walls,S+.2,H,.2,.02,wallMat,(S-.2)/2,H/2,-.1),wB=B(walls,.2,H,S,.02,wallMat,-.1,H/2,S/2);wA.castShadow=wB.castShadow=false;
const winGlow=new THREE.MeshBasicMaterial({color:0xdfe9ff}),wp=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.5),winGlow);wp.rotation.y=PI/2;wp.position.set(.02,1.65,1.9);walls.add(wp);
const frameM=M(0xece6dc,.5);[[.08,.08,1.52,2.44,1.9],[.08,.08,1.52,.86,1.9],[.08,1.6,.08,1.65,1.18],[.08,1.6,.08,1.65,2.62],[.06,1.5,.05,1.65,1.9]].forEach(a=>BX(walls,a[0],a[1],a[2],frameM,.04,a[3],a[4]));
const oakT=ctex(512,512,(x)=>{const n=10,h=512/n;for(let i=0;i<n;i++){let px=-rnd()*220;while(px<512){const w=180+rnd()*200;x.fillStyle='hsl('+(30+rnd()*4)+','+(38+rnd()*6)+'%,'+(58+rnd()*8)+'%)';x.fillRect(px,i*h,w,h);x.fillStyle='rgba(60,40,25,.35)';x.fillRect(px,i*h,1.5,h);px+=w}x.fillStyle='rgba(60,40,25,.35)';x.fillRect(0,i*h,512,1.5)}});oakT.encoding=THREE.sRGBEncoding;oakT.wrapS=oakT.wrapT=THREE.MirroredRepeatWrapping;oakT.repeat.set(1.5,1.5);
const floorM=new THREE.MeshStandardMaterial({map:oakT,roughness:.6,transparent:true,opacity:0});const fl=new THREE.Mesh(new THREE.PlaneGeometry(S,S),floorM);fl.rotation.x=-PI/2;fl.position.set(S/2,.004,S/2);fl.receiveShadow=true;scene.add(fl);
const gridT=ctex(256,256,(x)=>{x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(0,0,256,256);x.lineWidth=.6;for(let i=1;i<4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,256);x.moveTo(0,i*64);x.lineTo(256,i*64);x.stroke()}});gridT.wrapS=gridT.wrapT=THREE.RepeatWrapping;gridT.repeat.set(6,6);
const gridM=new THREE.MeshBasicMaterial({map:gridT,transparent:true,opacity:0,color:0x3f86d9,depthWrite:false});const gr=new THREE.Mesh(new THREE.PlaneGeometry(S,S),gridM);gr.rotation.x=-PI/2;gr.position.set(S/2,.008,S/2);scene.add(gr);
const bulbM=new THREE.MeshStandardMaterial({color:0xf6efe2,emissive:0xffd8a0,emissiveIntensity:.6}),bulbF=new THREE.MeshStandardMaterial({color:0xf6efe2,emissive:0xffd8a0,emissiveIntensity:0});
let g,c;
// =============== 1 · Ön Görüşme: designer and client at a table, moodboard behind them ===============
g=G(3,.14,3,PI/4);Cy(g,2.2,2.2,.02,rugS,0,.012,0,false,48);
Cy(g,.6,.6,.04,walnut,0,.74,0,true,36);Cy(g,.05,.07,.72,brass,0,.37,0,true,12);Cy(g,.3,.3,.02,brass,0,.01,0,true,24);
[[-1.08,PI/2,teal,shoe,true],[1.08,-PI/2,terra,navy,false]].forEach(a=>{c=chair(tanL);c.position.x=a[0];c.rotation.y=a[1];g.add(c);c=person('sit',a[2],a[3],{long:a[4]});c.position.x=a[0];c.rotation.y=a[1];g.add(c)});
// on the table: laptop, floor plan, material swatches, two coffees
B(g,.36,.016,.25,.006,steel,-.08,.768,-.12);const scr=B(g,.36,.24,.012,.006,dark,-.08,.885,-.255);scr.rotation.x=-.25;
{const pp=paper(g,.34,.34,.05,.764,.28);pp.rotation.set(-PI/2,0,.25)}
[[-.36,.12],[.38,.02]].forEach(p=>{Cy(g,.045,.035,.07,ivory,p[0],.795,p[1],false,14);Cy(g,.07,.07,.01,ivory,p[0],.765,p[1],false,14)});
[[0x76876c,0],[0xb5673f,.35],[0xc9a466,.7],[0x2f4858,1.05]].forEach(s=>{const t=B(g,.11,.008,.2,.003,M(s[0],.5),.3,.767,-.22);t.rotation.y=s[1]-.5});
// moodboard on an easel: plan, colour chips and a wood sample
limb(g,-.42,0,-1.6,-.3,1.95,-1.86,.022,oak);limb(g,.42,0,-1.6,.3,1.95,-1.86,.022,oak);limb(g,0,0,-2.3,0,1.9,-1.9,.022,oak);
{const mb=new THREE.Group();mb.position.set(0,1.32,-1.74);mb.rotation.x=-.12;g.add(mb);B(mb,1.34,.92,.03,.01,M(0xa9835a,.9),0,0,0);
paper(mb,.52,.52,-.33,.08,.02);[[0x76876c,0xb5673f,0xc9a466],[0x2f4858,0xe3d9ca,0x7a5236]].forEach((r,j)=>r.forEach((col,i)=>B(mb,.16,.16,.02,.004,M(col,.6),.1+i*.19,.24-j*.2,.02)));
B(mb,.54,.14,.02,.004,oakL,.29,-.22,.02);B(mb,.52,.1,.012,.004,M(0xe3d9ca,.9),-.33,-.3,.02)}
const bubM=[];label(g,bubM,'Tarzınız, bütçeniz?',-1.08,1.85,0,.72);label(g,bubM,'Sade ve ferah',1.08,1.8,0,.72);
plant(g,-1.6,-1.2);lamp(g,1.65,-1.25,bulbM);reg(g,at(0));
// =============== 2 · Keşif ve Röleve: the room, measured with a hand-held laser meter ===============
const dimM=new THREE.MeshBasicMaterial({color:0x6b4f1f,transparent:true}),dimMats=[dimM];
g=G(0,0,0);const dl=(w,h,d,x,y,z,ry)=>{const m=BX(g,w,h,d,dimM,x,y,z,false);if(ry)m.rotation.y=ry;return m},T=.03;
const dim=(t,x,y,z,s=.95)=>label(g,dimMats,t,x,y,z,s,true);
// floor: width and depth
dl(5.4,.015,T,3,.02,5.5);dl(T,.015,.34,.3,.02,5.5);dl(T,.015,.34,5.7,.02,5.5);dim('5,60 m',3,.34,5.5);
dl(T,.015,5.4,5.5,.02,3);dl(.34,.015,T,5.5,.02,.3);dl(.34,.015,T,5.5,.02,5.7);dim('5,60 m',5.5,.34,3);
// ceiling height
dl(T,2.6,T,5.8,1.4,.12);dl(.3,T,T,5.8,.1,.12);dl(.3,T,T,5.8,2.7,.12);dim('2,80 m',5.8,1.5,.55);
// window: width above, height beside, sill below
dl(T,T,1.4,.05,2.62,1.9);dl(T,.2,T,.05,2.62,1.2);dl(T,.2,T,.05,2.62,2.6);dim('1,40 m',.4,2.98,1.9,1);
dl(T,1.5,T,.05,1.65,2.9);dl(T,T,.2,.05,.9,2.9);dl(T,T,.2,.05,2.4,2.9);dim('1,50 m',.4,1.65,3.6,1);
dl(T,.86,T,.05,.45,1.9);dl(T,T,.2,.05,.02,1.9);dl(T,T,.2,.05,.86,1.9);dim('0,90 m',.4,.45,1.25,1);
// sockets on the back wall
[1.3,4.9].forEach(x=>{B(g,.12,.12,.02,.01,ivory,x,.36,.02);dl(T,.3,T,x+.18,.15,.04);dim('0,30 m',x+.68,.2,.3,.85)});
dim('31,4 m²',2.6,.3,3.9,1.2);reg(g,at(1),0,dimMats);
// designer measuring the back wall with a hand-held laser meter
const redM=new THREE.MeshBasicMaterial({color:0xe23a2e});
g=G(3.6,0,2.9,PI);g.add(person('stand',teal,shoe,{arm:true}));
B(g,.07,.04,.15,.012,M(0xf0b429,.5),.15,1.2,.52);BX(g,.05,.006,.07,dark,.15,1.223,.5,false);BX(g,.072,.042,.03,dark,.15,1.2,.6,false);
BX(g,.014,.014,2.28,redM,.15,1.2,1.75,false);Sp(g,.045,redM,.15,1.2,2.88);label(g,[],'2,90 m',.15,1.62,1.75,.8,true);reg(g,at(1));
// tape measure pulled across the floor + a surveyor with a tablet
const tapeT=ctex(512,16,(x)=>{x.fillStyle='#e9c545';x.fillRect(0,0,512,16);x.fillStyle='#2a2622';for(let i=0;i<=64;i++){x.fillRect(i*8,0,1.2,i%8===0?16:i%4===0?10:6)}});tapeT.encoding=THREE.sRGBEncoding;
g=G(.9,0,4.55);B(g,.3,.28,.11,.05,M(0xe0b23c,.45),0,.14,0);Cy(g,.07,.07,.115,dark,0,.14,0,false,16).rotation.x=PI/2;
const tp=new THREE.Mesh(new THREE.PlaneGeometry(2.9,.08),new THREE.MeshStandardMaterial({map:tapeT,roughness:.5,side:THREE.DoubleSide}));tp.rotation.x=-PI/2;tp.position.set(1.6,.02,0);tp.receiveShadow=true;g.add(tp);BX(g,.02,.06,.09,steel,3.05,.03,0);reg(g,at(1));
// colleague noting the measurements on a clipboard with the plan
g=G(1.5,0,4.4,PI*.3);g.add(person('stand',terra,navy,{arms:true,long:true}));
{const cb=new THREE.Group();cb.position.set(0,1.22,.46);cb.rotation.x=.55;g.add(cb);B(cb,.34,.02,.44,.01,walnut,0,0,0);const pp=paper(cb,.3,.38,0,.012,.01);pp.rotation.x=-PI/2;BX(cb,.12,.02,.03,steel,0,.02,-.2,false);Cy(cb,.008,.008,.16,brass,.19,.02,.05,false,6).rotation.x=PI/2}
reg(g,at(1));
// =============== 3 · 3D Tasarım: the whole room as wireframe ===============
const FUR=[
{x:2.9,z:2.75,parts:[['b',3.4,.025,2.3,0,.013,0,'rug']]},
{x:2.9,z:4.05,parts:[['b',2.5,.36,.9,0,.28,0,'cream'],['b',2.5,.6,.24,0,.68,.33,'cream'],['b',.22,.52,.9,-1.14,.48,0,'cream'],['b',.22,.52,.9,1.14,.48,0,'cream'],['b',1.0,.16,.6,-.52,.53,-.1,'ivory'],['b',1.0,.16,.6,.52,.53,-.1,'ivory']]},
{x:2.9,z:2.55,parts:[['c',.5,.04,0,.42,0,'ivory'],['c',.2,.4,0,.2,0,'oak']]},
{x:4.95,z:2.45,ry:-1.15,parts:[['b',.72,.3,.7,0,.3,0,'sage'],['b',.72,.55,.2,0,.68,-.3,'sage'],['b',.15,.4,.7,-.36,.47,0,'sage'],['b',.15,.4,.7,.36,.47,0,'sage']]},
{x:5.45,z:.75,parts:[['c',.19,.28,0,1.56,0,'shade'],['b',.025,1.5,.025,0,.77,0,'brass'],['c',.17,.03,0,.015,0,'brass']]},
{x:.62,z:.62,parts:[['c',.2,.42,0,.21,0,'pot']]},
{x:.13,z:4.3,parts:[['b',.26,.04,1.7,0,1.45,0,'oak'],['b',.26,.04,1.7,0,1.9,0,'oak']]},
{x:1.25,z:2.8,parts:[['c',.27,.36,0,.19,0,'ivory']]},
{x:.72,z:.03,parts:[['b',.8,1,.04,0,1.82,0,'brass']]},
{x:.23,z:1.9,parts:[['b',.44,.4,1.4,0,.2,0,'sage'],['b',.42,.07,1.36,0,.435,0,'cream']]},
{x:.07,z:1.9,parts:[['b',.08,2.5,.36,0,1.3,-.92,'curtain'],['b',.08,2.5,.36,0,1.3,.92,'curtain']]}];
const wireM=new THREE.LineBasicMaterial({color:0x1766c9,transparent:true,opacity:0});
const fillM=new THREE.MeshBasicMaterial({color:0x3f8cf0,transparent:true,opacity:0,depthWrite:false});fillM.userData.k=.16;
const wire=G(0,0,0);FUR.forEach(f=>{const s=new THREE.Group();s.position.set(f.x,0,f.z);s.rotation.y=f.ry||0;wire.add(s);f.parts.forEach(q=>{const geo=q[0]==='b'?new THREE.BoxGeometry(q[1],q[2],q[3]):new THREE.CylinderGeometry(q[1],q[1],q[2],20);const o=q[0]==='b'?4:3,l=new THREE.LineSegments(new THREE.EdgesGeometry(geo,30),wireM);l.position.set(q[o],q[o+1],q[o+2]);s.add(l);const fm=new THREE.Mesh(geo,fillM);fm.position.copy(l.position);s.add(fm)})});
reg(wire,at(2),0,[wireM,fillM]);
// the cabinet: wireframe (3) → exploded parts in the workshop (5) → installed (6)
const cab=G(3,0,.3),parts=[];
const cS=M(0x76876c,.62),cD=M(0x63725a,.7),cB=M(0xb9965c,.4),cabMats=[cS,cD,cB];
const lineM=new THREE.LineBasicMaterial({color:0x1766c9,transparent:true,opacity:0});
const part=(w,h,d,x,y,z,mat,dx,dy,dz,k)=>{const geo=new THREE.BoxGeometry(w,h,d),m=new THREE.Mesh(geo,mat);m.receiveShadow=true;const ln=new THREE.LineSegments(new THREE.EdgesGeometry(geo),lineM);const p=new THREE.Group();p.add(m,ln);p.position.set(x,y,z);cab.add(p);parts.push({p,m,ln,b:new V3(x,y,z),d:new V3(dx,dy,dz).multiplyScalar(k||1)})};
part(.04,2.3,.55,-1.58,1.15,0,cD,-1,0,0,.6);part(.04,2.3,.55,1.58,1.15,0,cD,1,0,0,.6);
part(3.12,.04,.55,0,2.28,0,cD,0,1,0,.45);part(3.12,.1,.55,0,.05,0,cD,0,-.2,0,.2);
part(3.2,2.3,.02,0,1.15,-.265,cD,0,0,-1,.35);
part(.03,2.16,.5,-.53,1.18,0,cD,-.3,0,.4,.5);part(.03,2.16,.5,.53,1.18,0,cD,.3,0,.4,.5);
[.78,1.28,1.78].forEach((y,i)=>part(1.02,.03,.48,0,y,0,cD,0,.15,1,.55+i*.18));
part(1.03,2.16,.03,-1.05,1.18,.275,cS,-.5,0,1,.95);part(1.03,2.16,.03,1.05,1.18,.275,cS,.5,0,1,.95);
part(1.02,.3,.03,0,.27,.275,cS,0,-.1,1,1.15);part(1.02,.3,.03,0,.59,.275,cS,0,.1,1,1.4);
part(.02,.6,.02,-.6,1.2,.31,cB,-.5,0,1,1.2);part(.02,.6,.02,.6,1.2,.31,cB,.5,0,1,1.2);
part(.4,.016,.02,0,.27,.31,cB,0,-.1,1,1.35);part(.4,.016,.02,0,.59,.31,cB,0,.1,1,1.6);
// =============== 4 · Proje Onayı: design on screen, samples, signed approval ===============
const rt=new THREE.WebGLRenderTarget(768,480);rt.texture.encoding=THREE.sRGBEncoding;
g=G(3,.14,3,PI/4);Cy(g,2.2,2.2,.02,rugT,0,.012,0,false,48);
B(g,2.7,.06,1.15,.015,walnut,0,.77,0);[[-1.2,-.45],[1.2,-.45],[-1.2,.45],[1.2,.45]].forEach(p=>Cy(g,.03,.03,.74,brass,p[0],.37,p[1],true,10));
const mon=new THREE.Group();mon.position.set(-.35,.8,-.28);mon.rotation.x=-.1;g.add(mon);B(mon,1.5,.96,.05,.02,dark,0,.62,0);
const sm=new THREE.Mesh(new THREE.PlaneGeometry(1.42,.888),new THREE.MeshBasicMaterial({map:rt.texture,toneMapped:false}));sm.position.set(0,.62,.028);mon.add(sm);B(mon,.5,.03,.3,.01,dark,0,.015,-.02);B(mon,.08,.2,.04,.01,dark,0,.1,-.04);
// samples: door, marble, oak, fabric, colour chips
const dS=new THREE.Group();dS.position.set(.75,.81,.3);dS.rotation.y=-.25;g.add(dS);B(dS,.34,.03,.46,.006,sage,0,0,0);[[.34,.05,0,-.205],[.34,.05,0,.205],[.05,.36,-.145,0],[.05,.36,.145,0]].forEach(a=>BX(dS,a[0],.012,a[1],sage,a[2],.02,a[3]));Cy(dS,.03,.03,.09,brass,0,.03,.16,false,10).rotation.z=PI/2;
const mT=ctex(128,128,(x)=>{x.fillStyle='#f0ece6';x.fillRect(0,0,128,128);x.strokeStyle='rgba(150,118,90,.5)';x.lineWidth=1.5;for(let i=0;i<7;i++){x.beginPath();let px=rnd()*128,py=rnd()*128;x.moveTo(px,py);for(let s=0;s<8;s++){px+=(rnd()-.4)*30;py+=(rnd()-.4)*30;x.lineTo(px,py)}x.stroke()}});mT.encoding=THREE.sRGBEncoding;
B(g,.3,.025,.3,.005,new THREE.MeshStandardMaterial({map:mT,roughness:.2}),1.15,.81,-.12).rotation.y=.2;B(g,.28,.025,.28,.005,oak,1.02,.835,-.2).rotation.y=-.3;
[[0xe3d9ca,0],[0x9b8676,.02],[0x76876c,.04]].forEach((s,i)=>B(g,.26,.02,.3,.008,M(s[0],.95),.48,.81+s[1],-.3+i*.03).rotation.y=.5-i*.25);
[0x76876c,0x63725a,0xe3d9ca,0xb9965c,0x9b8676].forEach((col,i)=>{const t=B(g,.07,.006,.22,.002,M(col,.5),1.02,.803+i*.001,.38);t.rotation.y=-.6+i*.28});
// approval sheet with brass seal + pen
const sheet=new THREE.Group();sheet.position.set(-.05,.803,.36);sheet.rotation.y=.12;g.add(sheet);B(sheet,.42,.008,.56,.003,ivory,0,0,0);[-.19,-.13,-.07,-.01].forEach(z=>BX(sheet,.3,.002,.016,M(0xb9b1a3,.8),0,.006,z,false));BX(sheet,.16,.002,.012,dark,.06,.006,.2,false);
const seal=new THREE.Group();seal.position.set(-.1,.02,.13);seal.rotation.x=-PI/2;sheet.add(seal);seal.add(new THREE.Mesh(new THREE.TorusGeometry(.085,.014,8,28),brass));let ck=BX(seal,.06,.02,.02,brass,-.03,-.015,0,false);ck.rotation.z=-PI/4;ck=BX(seal,.11,.02,.02,brass,.022,.006,0,false);ck.rotation.z=PI/3.6;
const pn=Cy(g,.01,.01,.24,brass,.3,.815,.45,false,8);pn.rotation.set(0,.6,PI/2);
// big approval mark above
const big=new THREE.Group();big.position.set(1.3,1.95,-.2);g.add(big);big.add(new THREE.Mesh(new THREE.TorusGeometry(.3,.04,10,40),brass));ck=BX(big,.2,.065,.06,brass,-.1,-.05,0,false);ck.rotation.z=-PI/4;ck=BX(big,.36,.065,.06,brass,.07,.015,0,false);ck.rotation.z=PI/3.6;
c=person('stand',sage,navy,{arm:true,long:true});c.position.set(-1.85,0,.1);c.rotation.y=PI/2-.35;g.add(c);c=person('stand',taupe,shoe,{arm:true});c.position.set(1.9,0,.3);c.rotation.y=-PI/2+.5;g.add(c);
reg(g,at(3));
// =============== 5 · İmalat: the workshop ===============
g=G(0,0,0);
B(g,2.7,1.25,.04,.01,oakL,3.9,1.8,.03);for(let i=0;i<9;i++)for(let j=0;j<4;j++)Cy(g,.012,.012,.01,dark,2.8+i*.28,1.35+j*.3,.052,false,6).rotation.x=PI/2;
B(g,.06,.34,.03,.01,oak,2.95,1.75,.07);B(g,.2,.09,.07,.02,steel,2.95,1.95,.08);                                   // hammer
B(g,.55,.15,.012,.004,steel,3.7,1.95,.065).rotation.z=-.08;B(g,.14,.16,.03,.03,oak,3.38,1.97,.07);                // hand saw
BX(g,.4,.035,.012,steel,4.45,2.1,.065,false);BX(g,.035,.28,.012,steel,4.27,1.97,.065,false);                       // square
[4.75,4.87,4.99].forEach((x,i)=>{Cy(g,.012,.012,.2,steel,x,1.98,.07,false,6);Cy(g,.022,.022,.12,M([0xd98a2b,0x76876c,0xb24a3a][i],.5),x,2.13,.07,false,8)});
[3.1,3.5].forEach(x=>{BX(g,.05,.3,.03,M(0xd98a2b,.5),x,1.48,.07);BX(g,.14,.03,.03,steel,x+.045,1.62,.07);BX(g,.14,.03,.03,steel,x+.045,1.35,.07)}); // clamps
B(g,2.7,.04,.26,.006,oak,3.9,1.08,.14);[[3.0,.09,.2,0xd9d3c8],[3.25,.07,.14,0x63725a],[3.48,.08,.17,0xb9965c],[4.6,.1,.12,0x39414a],[4.85,.07,.2,0xe0b23c]].forEach(a=>Cy(g,a[1],a[1],a[2],M(a[3],.5),a[0],1.1+a[2]/2,.14,false,14));
// lumber rack on the left wall
[3.5,5.5].forEach(z=>{BX(g,.07,2.1,.07,dark,.05,1.05,z);[.55,1.1,1.65].forEach(y=>BX(g,.5,.05,.05,dark,.3,y,z))});
[.55,1.1,1.65].forEach((y,k)=>{for(let i=0;i<4-k;i++)for(let j=0;j<2;j++)B(g,.2,.06,2.5+((i+j)%3)*.12,.008,M([0xcaa678,0xb88d5e,0xd8b98a,0xa97c4f][(i+j+k)%4],.65),.15+j*.22,y+.055+i*.065,4.5)});
// sheet goods leaning on the back wall
[[0xd9cfbd,0],[0xcaa678,.05],[0x76876c,.1]].forEach(a=>{const s=B(g,1.25,1.7,.03,.004,M(a[0],.6),1.25,.86,.2+a[1]);s.rotation.x=-.1});
// table saw
B(g,.9,.8,1.15,.02,M(0x4d5a52,.5),5.2,.4,1.7);B(g,1.1,.05,1.4,.01,steel,5.2,.83,1.7);const bl=Cy(g,.17,.17,.012,M(0xd0d3d6,.25),5.2,.88,1.7,true,28);bl.rotation.z=PI/2;B(g,.05,.1,1.3,.01,M(0xd98a2b,.5),5.55,.9,1.7);
// offcut bin
B(g,.5,.45,.5,.02,M(0x39414a,.6),5.45,.225,3.3);[[-.1,.2],[.08,-.15],[.12,.1]].forEach((a,i)=>{const o=BX(g,.07,.7,.03,oakL,5.45+a[0],.5,3.3+a[1]);o.rotation.z=a[0]*2;o.rotation.x=a[1]});
reg(g,at(4));
// workbench in front + carpenter
g=G(3,0,4.85);B(g,2.4,.07,.75,.01,oakL,0,.84,0);[[-1.1,-.3],[1.1,-.3],[-1.1,.3],[1.1,.3]].forEach(p=>BX(g,.08,.8,.08,oak,p[0],.4,p[1]));B(g,2.2,.04,.6,.006,oak,0,.2,0);
B(g,1,.03,.45,.004,cS,-.5,.895,0);const saw=Cy(g,.14,.14,.012,M(0xd0d3d6,.25),.5,1.0,.02,true,24);saw.rotation.x=PI/2;B(g,.3,.12,.14,.03,M(0xd98a2b,.5),.5,1.03,.1);
B(g,.2,.12,.14,.02,steel,1.05,.9,.33);B(g,.22,.05,.06,.01,dark,.05,.9,.25);Cy(g,.012,.012,.3,oak,-.9,.89,-.25,false,6).rotation.z=PI/2;
[[-.6,.24,.1],[.2,.24,-.1],[.7,.24,.05]].forEach(a=>B(g,.4,.04,.3,.004,M(0xd9cfbd,.6),a[0],a[1],a[2]));reg(g,at(4));
g=G(4.75,0,4.85,-PI/2);g.add(person('stand',navy,shoe,{arms:true,apron:sage}));reg(g,at(4));
// =============== 6 · Montaj ve Teslim: the finished, furnished room ===============
FUR.forEach(f=>{const s=G(f.x,0,f.z,f.ry||0);f.parts.forEach(q=>{if(q[0]==='b')B(s,q[1],q[2],q[3],Math.min(.07,q[1]/5,q[2]/5,q[3]/5),MATS[q[7]],q[4],q[5],q[6]);else Cy(s,q[1],q[1],q[2],MATS[q[6]],q[3],q[4],q[5],true,32)});reg(s,at(5))});
const ledM=new THREE.MeshStandardMaterial({color:0x3a332c,emissive:0xffc27a,emissiveIntensity:0});
g=G(0,0,0);leaves(g,.62,.42,.62);
[[2.0,0xd8c9b0,.14],[3.8,0x8b9a80,-.14]].forEach(a=>{const p=B(g,.46,.4,.14,.07,M(a[1],.95),a[0],.8,4.22);p.rotation.z=a[2]});B(g,.9,.03,.55,.01,M(0x9b8676,.95),3.75,.47,3.7).rotation.y=.2;
Cy(g,.12,.09,.04,ivory,2.75,.46,2.65,false,18);B(g,.34,.04,.24,.008,sageD,3.08,.46,2.45).rotation.y=.4;Cy(g,.03,.04,.16,pot,3.0,.52,2.75,false,10);
[[4.0,.05,.26,0xf1ece3],[4.07,.05,.22,0x63725a],[4.14,.05,.24,0xcdb38a],[4.21,.05,.2,0x9b8676]].forEach(a=>B(g,.18,a[2],a[1],.006,M(a[3],.7),.14,1.47+a[2]/2,a[0]));Cy(g,.06,.04,.2,pot,.14,1.57,4.8,false,12);
Cy(g,.07,.05,.12,M(0x7e8e74,.5),.14,1.98,3.8,false,12);leaves(g,.14,1.95,4.75,7,.32);Cy(g,.08,.06,.1,pot,.14,1.97,4.75,false,12);B(g,.16,.2,.03,.006,brass,.14,2.02,4.3);
B(g,.66,.86,.02,.004,M(0x3f4f47,.9),.72,1.82,.058);const sun0=new THREE.Mesh(new THREE.CircleGeometry(.17,28),M(0xa4693f,.8));sun0.position.set(.84,1.9,.072);g.add(sun0);
[[1.55,0xd8c9b0],[2.2,0x8b9a80]].forEach(a=>B(g,.3,.3,.12,.06,M(a[1],.95),.2,.6,a[0]).rotation.z=.3);
Cy(g,.22,.22,.03,ivory,4.3,.46,3.05,true,24);Cy(g,.025,.025,.44,brass,4.3,.22,3.05,true,8);Cy(g,.04,.035,.06,ivory,4.3,.5,3.05,false,12);
const lb=new THREE.Mesh(new THREE.SphereGeometry(.05,12,10),bulbF);lb.position.set(5.45,1.47,.75);g.add(lb);
// cabinet shelf decor + LED
Cy(g,.05,.03,.2,pot,2.75,.895,.35,false,12);Cy(g,.07,.07,.03,brass,3.2,.81,.35,false,14);B(g,.05,.26,.2,.006,ivory,2.7,1.425,.3);B(g,.05,.22,.2,.006,sageD,2.76,1.405,.3);B(g,.05,.24,.2,.006,M(0xcdb38a,.7),2.82,1.415,.3);
Cy(g,.06,.07,.14,M(0x7e8e74,.5),3.25,1.365,.35,false,12);Cy(g,.09,.06,.07,ivory,3,1.83,.35,false,16);BX(g,3.1,.012,.012,ledM,3,.004,.6,false);reg(g,at(5));
const glowT=ctex(4,64,(x)=>{const q=x.createLinearGradient(0,0,0,64);q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.3,'rgba(255,255,255,.35)');q.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=q;x.fillRect(0,0,4,64)});
const glowM=new THREE.MeshBasicMaterial({map:glowT,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,color:0xffc184});const gp=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),glowM);gp.rotation.x=-PI/2;gp.position.set(3,.014,1);scene.add(gp);
// ---- lights ----
const hemi=new THREE.HemisphereLight(0xc3d0e2,0x8a8176,.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xdfe8ff,.9);sun.position.set(11,13,8);sun.target.position.set(2.5,0,2.5);sun.castShadow=true;sun.shadow.mapSize.set(coarse?1024:2048,coarse?1024:2048);
Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:40});sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;scene.add(sun,sun.target);
const warm=new THREE.PointLight(0xffc98f,0,8,2);warm.position.set(3.2,2.2,2.6);scene.add(warm);
const cC=new THREE.Color(0xc4c7cc),cK=new THREE.Color(0xb3aa9c),cW=new THREE.Color(0xefe8dd),hC=new THREE.Color(0xc3d0e2),hW=new THREE.Color(0xffe3bf),sC=new THREE.Color(0xdfe8ff),sW=new THREE.Color(0xffe2b8),gC=new THREE.Color(0xdfe9ff),gW=new THREE.Color(0xffe6b8),tc=new THREE.Color();
const dir=new V3();let aspect=1;
function resize(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;R.setSize(w,h,false);aspect=w/h;cam.aspect=aspect;
cam.updateProjectionMatrix();dirty=true}
function update(p){
for(const it of props){const w=e3(clamp(it.fn(p))),o=it.o;o.visible=w>.002;if(!o.visible)continue;
if(it.mats)it.mats.forEach(m=>m.opacity=w*(m.userData.k||1));else if(it.mode==='c')o.scale.setScalar(Math.max(w,.001));else{o.scale.setScalar(.82+.18*w);o.position.y=o.userData.y+(1-w)*1.1}}
bubM.forEach(m=>m.opacity=clamp(at(0)(p)));
const ra=clamp(roomAmt(p));walls.visible=ra>.002;walls.scale.set(1,Math.max(ra,.001),1);
const rise=e3(ss(p,1.35,2)),so=ss(p,3.35,3.8),lo=ss(p,1.35,1.8)*(1-ss(p,2.4,2.85)),ex=p<3?0:1-ss(p,4.05,4.75);
cab.visible=lo>.002||so>.002;cab.scale.set(1,p<3?Math.max(rise,.001):1,1);cab.position.set(3,.22*ex,.3+2.05*ex);cab.rotation.y=.28*ex;
lineM.opacity=lo;cabMats.forEach(m=>{m.opacity=so;m.transparent=so<.999;m.depthWrite=so>.5});
for(const q of parts){q.m.visible=so>.002;q.m.castShadow=so>.6;q.ln.visible=lo>.002;q.p.position.copy(q.b).addScaledVector(q.d,ex)}
gridM.opacity=.5*ss(p,1.4,2)*(1-ss(p,2.4,2.9));
const wk=ss(p,4.4,5);floorM.opacity=wk;tc.lerpColors(cC,cK,ss(p,3,3.7));wallMat.color.lerpColors(tc,cW,wk);winGlow.color.lerpColors(gC,gW,wk);
hemi.color.lerpColors(hC,hW,wk);hemi.intensity=.7-.2*wk;sun.color.lerpColors(sC,sW,wk);sun.intensity=.9-.25*wk;
warm.intensity=wk*1.3;ledM.emissiveIntensity=wk*1.6;bulbF.emissiveIntensity=wk*1.6;glowM.opacity=wk*.55;
const portrait=aspect<1,tn=Math.tan(cam.fov*PI/360)*2,D=Math.max(8.4/tn,(portrait?9.6:10.2)/(tn*aspect));
const pa=e3(clamp(Math.max(at(0)(p),at(3)(p)))),ty=1.15+(portrait?(1-aspect)*3.6:.25)-.3*pa;
dir.set(.7071,portrait?.56:.44,.7071).normalize();cam.position.set(3,ty,3).addScaledVector(dir,D*(1-.3*pa));cam.lookAt(3,ty,3)}
// picture of the finished room for the approval screen
function snap(){const c2=new THREE.PerspectiveCamera(27,1.6,1,100);update(N-1);c2.position.set(3,1.2,3).addScaledVector(new V3(.7071,.44,.7071).normalize(),19.5);c2.lookAt(3,1.2,3);
const bg=scene.background;scene.background=new THREE.Color(0xd9d3c8);R.setRenderTarget(rt);R.render(scene,c2);R.setRenderTarget(null);scene.background=bg;dirty=true}
let last=performance.now(),snapped=false;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(64,now-last);last=now;if(!visible)return;
if(!snapped){snapped=true;snap()}
const d=target-cur;if(Math.abs(d)>.0006){cur+=d*Math.min(1,.075*dt/16.7);dirty=true}else if(d!==0){cur=target;dirty=true}
if(!dirty)return;dirty=false;update(cur);R.render(scene,cam)}
new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){resize();dirty=true}},{rootMargin:'200px'}).observe(stage);
addEventListener('resize',resize);resize();requestAnimationFrame(frame);
}
})();
