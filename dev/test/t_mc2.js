// Simulation headless : THREE et le DOM sont remplacés par des bouchons,
// la logique du jeu (physique, collisions, règles) tourne avec de vrais nombres.
const vm = require('vm');
const fs = require('fs');

function stub(name) {
  const store = new Map();
  const target = function () {};
  return new Proxy(target, {
    get(t, p) {
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === Symbol.iterator) return function* () {};
      if (p === 'then' || p === 'toJSON') return undefined;
      if (store.has(p)) return store.get(p);
      if (p === 'length') return 0;
      if (typeof p === 'symbol') return undefined;
      const s = stub(name + '.' + String(p)); store.set(p, s); return s;
    },
    set(t, p, v) { store.set(p, v); return true; },
    apply() { return stub(name + '()'); },
    construct() { return stub('new ' + name); },
  });
}

class FakeEl {
  constructor(tag) {
    this.tagName = (tag || 'div').toUpperCase();
    const st = {}; st.setProperty = (k, v) => { st[k] = v; }; this.style = st;
    this.dataset = {}; this._cls = new Set(); this.children = []; this._ls = {};
    this.textContent = ''; this._html = ''; this.isConnected = true; this.scrollTop = 0; this.offsetWidth = 100; this.value = '';
    const self = this;
    this.classList = {
      add: (...c) => c.forEach(x => self._cls.add(x)), remove: (...c) => c.forEach(x => self._cls.delete(x)),
      toggle: (c, f) => { const on = f === undefined ? !self._cls.has(c) : !!f; on ? self._cls.add(c) : self._cls.delete(c); return on; },
      contains: c => self._cls.has(c),
    };
  }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get className() { return [...this._cls].join(' '); }
  set innerHTML(v) { this._html = v; this.children = []; }
  get innerHTML() { return this._html; }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(t, f) { (this._ls[t] = this._ls[t] || []).push(f); }
  fire(t, e) { (this._ls[t] || []).forEach(f => f(Object.assign({ preventDefault() {}, stopPropagation() {}, pointerId: 1, clientX: 0, clientY: 0, button: 0 }, e || {}))); }
  querySelectorAll() { return []; }
  insertBefore(n, r) { const i = this.children.indexOf(r); if (i < 0) this.children.push(n); else this.children.splice(i, 0, n); n.parentNode = this; return n; }
  removeChild(n) { const i = this.children.indexOf(n); if (i >= 0) this.children.splice(i, 1); n.parentNode = null; return n; }
  get lastChild() { return this.children[this.children.length - 1]; }
  get firstChild() { return this.children[0] || null; }
  setAttribute() {} getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; }
  setPointerCapture() {} getContext() { return stub('ctx2d'); } toDataURL() { return 'data:image/png;base64,AAA'; } blur() {} focus() {}
}

const els = {};
const winListeners = {};
const raf = [];
const lsData = new Map();
const document = {
  getElementById: id => els[id] || (els[id] = new FakeEl('div')),
  createElement: t => new FakeEl(t),
  createTextNode: t => ({ textContent: t }),
  querySelectorAll: () => [],
  body: new FakeEl('body'), documentElement: new FakeEl('html'),
  addEventListener() {}, hidden: false,
};
const ctx = {
  document, THREE: stub('THREE'), navigator: { maxTouchPoints: 5 },
  localStorage: { getItem: k => (lsData.has(k) ? lsData.get(k) : null), setItem: (k, v) => lsData.set(k, String(v)), removeItem: k => lsData.delete(k) },
  performance: { now: (() => { let t = 0; return () => (t += 2); })() },
  requestAnimationFrame: cb => raf.push(cb),
  setTimeout, clearTimeout, console,
  innerWidth: 390, innerHeight: 844, devicePixelRatio: 3,
  addEventListener: (t, f) => (winListeners[t] = winListeners[t] || []).push(f),
};
ctx.window = ctx;
// SEEDED : hasard reproductible
{ let a = +(process.env.SEED || Date.now() % 100000); const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const M = Object.create(Math); M.random = r; ctx.Math = M; console.log('graine ' + (process.env.SEED || 'auto')); }
const hb = document.getElementById('hotbar'); for (let i = 0; i < 5; i++) hb.appendChild(new FakeEl('button'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), ctx, { filename: 'app.js' });

const T = ctx.__t; const MWPN = T.MWPN;
const newEggForTest = r => ({ kind: 'egg', r, t: 10 });
let now = 1000;
function frames(n, ms = 16.7) { for (let i = 0; i < n; i++) { now += ms; const cbs = raf.splice(0); cbs.forEach(cb => cb(now)); } }
const P = T.P;
const fails = [];
function check(cond, msg) { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) fails.push(msg); }
function finite() { return [P.x, P.y, P.z, P.vx, P.vy, P.vz].every(Number.isFinite); }
function place(x, y, z) { Object.assign(P, { x, y, z, vx: 0, vy: 0, vz: 0, onGround: false, ground: null, knock: 0, inv: 0 }); }


const lsKey='cubiverse-mc-v1';
console.log('MC2 : armes, missions, fusée, combattants');
T.getS().mc.mods={}; T.getS().mc.mode='creative';
T.startGame('mc'); let G=T.getG(); frames(30);
check(!!G.projs&&!!G.allies&&!!G.moonBoxes, 'le module démarre (projectiles, combattants, Lune)');
const X0=Math.floor(P.x), Z0=Math.floor(P.z), Y0=G.colTop(X0,Z0);
check(S_ok(), 'argent de départ et missions : '+T.getS().mc.cash+' pièces, '+T.getS().mc.q.length+' missions');
function S_ok(){ const m=T.getS().mc; return m.cash>=0&&m.q.length===3&&m.q.every(q=>q.need>0&&q.r>0); }
// armes
for (const id of [150,151,152,153,154]) { check(G.canUse(id)&&G.avail(id), 'créatif : arme '+id+' disponible'); }
G.hot[0]=150; G.sel=0; G.renderHot(); check(!!G.heldW()&&G.heldW().k==='blaster','le blaster est en main');
place(X0+0.5,Y0,Z0+0.5); frames(5);
// cible : un zombie devant le joueur
G.spawnMob('zombie',6,8,false); const z=G.mobs.filter(e=>e.kind==='zombie').pop();
if(z){ z.keep=true; z.hp=10; const yaw=P.yaw; z.x=P.x+Math.sin(yaw)*6; z.z=P.z+Math.cos(yaw)*6; z.y=P.y; z.vx=z.vz=0; }
for(let k=0;k<=8;k++) for(let hh=0;hh<3;hh++) G.setB(Math.floor(P.x+Math.sin(P.yaw)*k),Math.floor(P.y)+hh,Math.floor(P.z+Math.cos(P.yaw)*k),0);
const n0=G.projs.length; G.wcd=0; const ok=G.fire(); check(ok&&G.projs.length===n0+1,'tirer crée un projectile');
check(!G.fire(),'cadence de tir (temps de recharge)');
const q0=T.getS().mc.cash;
if(z){ for(let i=0;i<10;i++){ z.x=P.x+Math.sin(P.yaw)*5; z.z=P.z+Math.cos(P.yaw)*5; z.y=P.y; z.vx=z.vz=0; G.wcd=0; G.shoot(MWPN[150],P.x,P.y+1,P.z,Math.sin(P.yaw),0,Math.cos(P.yaw),'p'); frames(8); if(z.dead) break; }
  check(z.hp<10||z.dead,'le blaster blesse un monstre (pv '+z.hp+')'); }
// épée
G.hot[1]=154; G.sel=1; G.renderHot(); check(G.heldW().melee>0,'épée de feu en main');
if(z&&!z.dead){ z.x=P.x+Math.sin(P.yaw)*2; z.z=P.z+Math.cos(P.yaw)*2; z.y=P.y; G.wcd=0; const hp=z.hp; G.fire(); check(z.hp<hp||z.dead,'l\'épée blesse'); }
// bazooka : explosion qui casse des blocs
G.hot[2]=152; G.sel=2; G.renderHot();
const bx=X0+8, bz=Z0, by=G.colTop(bx,bz); G.setB(bx,by,bz,11); G.setB(bx,by+1,bz,11); const b0=G.get(bx,by,bz);
for(let k=-6;k<=-1;k++){ G.setB(bx+k,by+1,bz,0); G.setB(bx+k,by+2,bz,0); G.setB(bx+k,by+3,bz,0); } G.wcd=0; G.shoot(MWPN[152],bx-6+0.5,by+1.5,bz+0.5,1,0,0,'p'); frames(40);
check(b0===11&&G.get(bx,by,bz)===0,'le bazooka explose et détruit les blocs');
check(finite(),'valeurs du joueur valides après explosion');
// grenade
G.hot[3]=153; G.sel=3; G.renderHot(); const nb=G.projs.length; G.wcd=0; G.fire(); check(G.projs.length===nb+1,'lancer une grenade'); frames(120);
check(G.projs.length===nb,'la grenade explose et disparaît');
// arc : retombe
G.hot[4]=151; G.sel=4; G.renderHot(); G.wcd=0; G.fire(); const ar=G.projs[G.projs.length-1]; frames(200); check(!G.projs.includes(ar),'la flèche retombe et disparaît');
// survie : armes à acheter
G.setMode('survival'); const Sg=T.getS(); Sg.mc.own=[]; Sg.mc.cash=10;
check(!G.canUse(152)&&!G.avail(152),'survie : le bazooka doit être acheté'); G.hot[2]=152; G.sel=2; check(G.heldW()===null,'sans achat, pas de tir');
G.openPanel('shop'); check(G.panel==='shop','boutique ouverte'); G.closePanel();
Sg.mc.cash=500; G.renderShop; G.openPanel('shop');
let buyCalls=0; // simule l'achat
{ const price=MWPN[152].price; Sg.mc.cash-=price; Sg.mc.own.push(152); }
check(G.canUse(152)&&G.avail(152)&&Sg.mc.cash===380,'après achat : bazooka utilisable (pièces '+Sg.mc.cash+')'); G.closePanel();
// missions
Sg.mc.q=[{k:'break',n:0,need:3,r:20},{k:'kill',n:0,need:2,r:30},{k:'chest',n:0,need:1,r:40}];
const c0=Sg.mc.cash; G.evt('break',2); check(Sg.mc.q[0].n===2,'progression de mission'); G.evt('break',1);
check(Sg.mc.cash===c0+20&&Sg.mc.q.length===3&&!Sg.mc.q.some(q=>q.k==='break'&&q.n>=q.need),'mission réussie : +20 pièces et nouvelle mission ('+Sg.mc.cash+')');
G.openPanel('missions'); check(G.panel==='missions','panneau missions'); G.closePanel();
// vraie mission "casser" via le jeu
Sg.mc.q=[{k:'break',n:0,need:2,r:7},{k:'kill',n:0,need:2,r:30},{k:'chest',n:0,need:1,r:40}]; G.setMode('creative');
{ const px=X0-5, pz=Z0; const py=G.colTop(px,pz); G.setB(px,py,pz,2); G.setB(px+1,py,pz,2); G.breakAt({x:px,y:py,z:pz}); G.breakAt({x:px+1,y:py,z:pz}); check(Sg.mc.cash>=c0+27||Sg.mc.st.done>=2,'casser des blocs fait avancer la mission'); }
// vague
G.setMode('survival'); const zc=G.mobs.filter(e=>e.kind==='zombie').length; G.spawnWave(); check(G.mobs.filter(e=>e.kind==='zombie').length>zc,'une vague de monstres apparaît');
for(const e of G.mobs) if(e.kind==='zombie') G.killMob(e); frames(3);
// combattants
G.setMode('creative'); Sg.mc.al=[]; const na=G.allies.length;
check(G.hireAlly('knight')&&G.allies.length===na+1&&Sg.mc.al.length===1,'recruter un chevalier'); G.hireAlly('archer'); G.hireAlly('guard');
check(G.allies.length===na+3,'3 combattants dans l\'équipe');
place(X0+0.5,G.colTop(X0,Z0),Z0+0.5); frames(20);
G.spawnMob('zombie',8,10,false); const z2=G.mobs.filter(e=>e.kind==='zombie').pop(); if(z2){ z2.keep=true; z2.x=P.x+6; z2.z=P.z; z2.y=G.colTop(Math.floor(z2.x),Math.floor(z2.z)); }
let killed=false; for(let i=0;i<500&&z2&&!z2.dead;i++){ frames(1); } killed=!z2||z2.dead; check(killed,'les combattants éliminent un monstre');
const far=G.allies[0]; far.x=P.x+80; far.z=P.z; frames(5); check(Math.hypot(far.x-P.x,far.z-P.z)<12,'un combattant égaré revient près du joueur');
const ally=G.allies[0]; ally.hp=0; ally.down=0; { const e=G.mobs.find(e=>e.kind==='zombie'); }
G.dismissAlly(); check(G.allies.length===na+2&&Sg.mc.al.length===2,'renvoyer un combattant');
// fusée
G.setMode('survival'); Sg.mc.own.push(140);
place(X0+0.5,G.colTop(X0,Z0),Z0+0.5); frames(5);
const y1=G.colTop(X0+6,Z0); G.setB(X0+6,y1-1,Z0,1);
const rk=G.addVehicle('rocket','#f4f4f4',X0+6.5,y1,Z0+0.5,0); check(!!rk&&G.vehicles.includes(rk),'poser une fusée');
G.enterVehicle(rk); check(G.ride===rk&&G.engine()==='rocket'&&els.hud._cls.has('flying'),'monter dans la fusée : moteur, boutons ▲ ▼');
T.keys.add('Space'); frames(2); T.keys.delete('Space');
check(rk.cd>0||rk.air,'▲ lance le compte à rebours'); console.log('  dbg rk',rk.cd,rk.air,G.hp,G.ride===rk,G.mode); G.exitVehicle(); check(G.ride===rk,'survie : impossible de descendre avant l\'atterrissage');
frames(200); console.log('  dbg rk2',rk.cd,rk.air,G.hp,G.ride===rk,rk.y); check(rk.air,'la fusée décolle');
T.keys.add('Space'); let maxY=0; for(let i=0;i<500;i++){ frames(1); maxY=Math.max(maxY,rk.y); if(rk.y>200) break; } 
check(rk.y>150,'elle monte vers l\'espace (altitude '+rk.y.toFixed(0)+')');
frames(30); check(G.spaceK>0.9&&Sg.mc.st.space===1,'l\'espace est atteint (étoiles, mission espace)');
// vers la Lune
T.keys.delete('Space'); const MN=T.MOON; let tries=0; T.joy.x=0;
while(Math.hypot(rk.x-MN.x,rk.z-MN.z)>30&&tries<900){ const dx=MN.x-rk.x, dz=MN.z-rk.z; T.cam.yaw=Math.atan2(-dx,-dz)+0; T.joy.y=1; frames(1); tries++; if(rk.y<MN.y+8) T.keys.add('Space'); else T.keys.delete('Space'); }
T.joy.y=0; T.keys.delete('Space');
check(Math.hypot(rk.x-MN.x,rk.z-MN.z)<=40,'on vole jusqu\'à la Lune ('+Math.hypot(rk.x-MN.x,rk.z-MN.z).toFixed(0)+' m, '+tries+' images)');
// atterrissage
T.keys.add('ShiftLeft'); T.joy.down=true; T.getG().ride&&0;
rk.vx=rk.vz=0; for(let i=0;i<600&&rk.air;i++){ T.joy.x=0; T.joy.y=0; frames(1); rk.vy=Math.min(rk.vy,-6); }
T.keys.delete('ShiftLeft');
check(!rk.air&&Math.abs(rk.y-MN.y)<0.6,'atterrissage sur la Lune (y='+rk.y.toFixed(2)+')');
check(Sg.mc.st.moon===1,'mission Lune accomplie');
G.exitVehicle(); check(G.ride===null&&Math.abs(P.y-MN.y)<0.6,'on descend sur la Lune (y='+P.y.toFixed(1)+')');
for(let i=0;i<8;i++){ frames(5); console.log('  dbg moon',P.y.toFixed(2),P.vy.toFixed(2),P.onGround,G.hp,P.fly); } check(Math.abs(P.y-MN.y)<0.7&&G.onMoon&&G.grav<1,'on marche sur la Lune avec une faible gravité ('+P.y.toFixed(2)+')');
T.joy.y=1; for(let i=0;i<400;i++) frames(1); T.joy.y=0; frames(30);
check(P.y>MN.y-1&&P.x>MN.x-MN.R-2&&P.x<MN.x+MN.R+2&&P.z>MN.z-MN.R-2&&P.z<MN.z+MN.R+2,'la barrière empêche de tomber de la Lune ('+P.x.toFixed(0)+','+P.z.toFixed(0)+')');
check(finite(),'valeurs du joueur valides');
// retour : décollage depuis la Lune
P.x=rk.x+2.5; P.z=rk.z; P.y=MN.y; frames(3); G.enterVehicle(rk); T.keys.add('Space'); frames(5); T.keys.delete('Space'); frames(200); check(rk.air&&rk.y>MN.y,'décollage depuis la Lune');
T.keys.add('Space'); frames(100); T.keys.delete('Space');
// sauvegarde
G.exitVehicle(true); G.saveMC(); T.exitGame();
const sv=JSON.parse(lsData.get('cubiverse-save-v1')); check(sv.mc.cash>=0&&sv.mc.al.length===2&&sv.mc.own.includes(152)&&sv.mc.q.length===3&&sv.mc.st.space===1,'pièces, armes, équipe, missions et progrès sauvegardés');
T.startGame('mc'); G=T.getG(); frames(10); check(G.allies.length===2,'l\'équipe revient au rechargement'); check(G.vehicles.some(v=>v.type==='rocket'),'la fusée est sauvegardée');
T.exitGame();
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK'); process.exit(fails.length ? 1 : 0);
