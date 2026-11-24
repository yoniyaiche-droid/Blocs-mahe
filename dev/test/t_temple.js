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

const T = ctx.__t;
const newEggForTest = r => ({ kind: 'egg', r, t: 10 });
let now = 1000;
function frames(n, ms = 16.7) { for (let i = 0; i < n; i++) { now += ms; const cbs = raf.splice(0); cbs.forEach(cb => cb(now)); } }
const P = T.P;
const fails = [];
function check(cond, msg) { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) fails.push(msg); }
function finite() { return [P.x, P.y, P.z, P.vx, P.vy, P.vz].every(Number.isFinite); }
function place(x, y, z) { Object.assign(P, { x, y, z, vx: 0, vy: 0, vz: 0, onGround: false, ground: null, knock: 0, inv: 0 }); }
const S = T.getS();
console.log('TEMPLE D\'ÉMERAUDE');
T.startGame('temple'); let G = T.getG(); frames(5);
check(!G.ready && G.choiceOpen, 'choix du héros d\'abord');
T.heroUse(G, T.HEROES.find(h => h.id === 'ines')); G.build(); frames(30);
check(G.ready && G.hearts === 4 && G.relics.length === 4 && G.blocks.length === 3 && G.levers.length === 3, 'temple construit (Inès : 4 cœurs)');
check(P.onGround && Math.abs(P.y) < 1e-6, 'le héros tient sur le sol');
T.joy.y = 1; frames(90); T.joy.y = 0; check(P.z < 6, 'avancer vers le temple');
// relique 1 au milieu du hall
place(0, 0, -8.8); frames(10); check(G.got === 1, 'relique 1 ramassée dans le hall');
// pousser un bloc
T.cam.yaw = 0; const bk = G.blocks[1]; place(bk.x, 0, bk.z + 1.3); frames(3); T.joy.y = 1; frames(90); T.joy.y = 0; frames(30);
check(bk.tz <= -30, 'pousser un bloc en marchant dedans (z ' + bk.z0 + ' → ' + bk.tz + ')');
place(G.resetPad.x, 0, G.resetPad.z + 3); frames(5); place(G.resetPad.x, 0, G.resetPad.z); frames(5);
check(bk.tz === bk.z0, 'la dalle ↺ remet les blocs à leur place');
for (const b of G.blocks) { place(b.x, 0, b.z + 1.3); frames(3); T.joy.y = 1; let n = 0; while (b.tz > -34 && n < 400) { frames(1); n++; } T.joy.y = 0; frames(25); }
check(G.plates.every(p => p.on) && G.gates.g2.open, 'les 3 blocs sur les dalles ouvrent la porte');
// mur de lianes
place(7.9, 0, -27); frames(5); T.cam.yaw = -Math.PI / 2; T.joy.y = 1; let ym = 0; for (let i = 0; i < 120; i++) { frames(1); ym = Math.max(ym, P.y); } T.joy.y = 0; T.cam.yaw = 0; frames(10);
check(ym >= 4 && G.got === 2, 'grimper au mur de lianes et prendre la relique 2 (hauteur ' + ym.toFixed(1) + ')');
// pics
G.inv = 0; const h0 = G.hearts; const sp = G.spk.find(s => s.up); place(sp.x, 0, sp.z); frames(2);
check(G.hearts === h0 - 1, 'marcher sur des pics levés fait mal');
// fléchettes
G.inv = 0; P.inv = 0; const h1 = G.hearts; place(0, 0, -50.5); let hit = false; for (let i = 0; i < 200 && !hit; i++) { frames(1); if (G.hearts < h1) hit = true; G.spk.forEach(s => s.up = false); }
check(G.darts.length >= 0 && hit, 'les fléchettes à ventouse traversent le couloir');
place(3, 0, -57.8); frames(10); check(G.got === 3, 'relique 3 au bout du couloir');
// leviers
G.hearts = G.maxH; const lvK = k => G.levers.find(l => l.k === k);
const wrong = lvK(G.order[1]); place(wrong.x, 0, wrong.z + 1.1); frames(5); place(0, 0, -62); frames(50);
check(G.seq.length === 0 && G.levers.every(l => !l.on), 'mauvais ordre : les leviers se remettent en place');
for (const k of G.order) { const l = lvK(k); place(l.x, 0, l.z + 1.1); frames(5); place(l.x, 0, l.z + 3); frames(5); }
check(G.gates.g4.open && G.relic4, 'bon ordre de la fresque : la porte s\'ouvre et la relique 4 apparaît');
place(0, 0, -72); frames(5); check(G.got === 4, 'relique 4 ramassée');
// lance-pierre
const bat = G.foes.find(f => f.k === 'bat' && !f.dead); place(bat.x0, 0, bat.z0 + 5); bat.x = bat.x0; bat.z = bat.z0; G.inv = 9; G.shoot(); frames(30);
check(bat.dead, 'le lance-pierre vise la chauve-souris la plus proche');
// lave, plateforme mobile, dalles qui tombent
G.inv = 0; P.inv = 0; G.hearts = 4; place(0, 0, -82.5); frames(5); place(-6, 0, -90); P.y = -1; frames(60);
check(G.hearts === 3 && Math.abs(P.z + 81.5) < 0.1, 'tomber dans la lave : un cœur en moins, retour à l\'entrée de la salle');
const mv = G.mover; place(mv.x, 0.2, -93); frames(10); const rel = P.x - mv.x; frames(40);
check(P.ground === mv.b && Math.abs((P.x - mv.x) - rel) < 0.05, 'la plateforme mobile transporte le héros');
const fl = G.falls[0]; place(fl.x, 0.1, fl.z); frames(60); check(fl.down > 0 || P.y < -1, 'la dalle fragile s\'effondre');
G.inv = 9; place(7, 0.1, -93); frames(10); check(G.got === 5, 'relique 5 sur le pilier');
// rocher
G.inv = 0; P.inv = 0; G.hearts = 4; place(0, 0, -106); frames(5); T.cam.yaw = 0; T.joy.y = 1; let started = false, cleared = false;
for (let i = 0; i < 60 * 14; i++) { if (P.onGround && G.query(P.x - 0.3, P.x + 0.3, 0.2, 1, P.z - 1.6, P.z - 0.5).some(b => b !== G.ground && b.y1 > 0.5 && b.y1 < 1)) P.jumpBuf = 0.1;
  if (P.onGround && P.z < -142 && P.z > -144) P.jumpBuf = 0.1; frames(1); if (G.boulder.on) started = true; if (P.z < -153) { cleared = true; break; } }
T.joy.y = 0; frames(300);
check(started, 'le rocher se met à rouler');
check(cleared && G.closed7, 'courir, sauter les haies et le trou : on échappe au rocher');
check(G.boulder.done, 'le rocher tombe dans le trou');
// trésor
place(0, 0, -164.05); frames(20); check(G.won, 'toucher l\'idole d\'émeraude termine l\'aventure');
check(finite(), 'valeurs valides'); frames(60); T.exitGame();
check(S.temple.done === 1 && S.temple.relics === 5, 'aventure enregistrée (5 reliques)');
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK');
