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
console.log('COURSE DE LA JUNGLE');
T.startGame('jungle'); let G = T.getG(); frames(5);
check(!G.ready && G.choiceOpen, 'choix du héros d\'abord');
T.heroUse(G, T.HEROES.find(h => h.id === 'tibo')); G.build(0); frames(30);
check(G.ready && G.NR > 60 && G.goal && G.crTot > 8, 'niveau 1 construit (' + G.NR + ' lignes, ' + G.crTot + ' caisses)');
check(P.onGround && Math.abs(P.y) < 1e-6, 'le héros tient sur le sol');
T.joy.y = 1; frames(30); T.joy.y = 0; check(P.z < -3, 'avancer (joystick vers le haut = vers l\'arrivée)');
// sauter sur une caisse
let c = G.crates.find(c => c.k === 'c'); const b0 = G.berry; place(c.x, 2.2, c.z); P.vy = -2; frames(15);
check(c.dead && G.berry >= b0 + 3, 'sauter sur une caisse la casse et donne des baies');
// toupie
c = G.crates.find(c => !c.dead && c.k === 'c'); place(c.x + 1.2, 0, c.z); frames(3); G.doSpin(); frames(20);
check(c.dead, 'la toupie casse une caisse à côté');
const f = G.foes.find(f => f.k === 'r'); f.x = 0; f.x0 = 0; place(1.0, 0, f.z); G.doSpin(); frames(5);
check(f.dead, 'la toupie élimine un crabe');
// luciole gardienne
c = G.crates.find(c => c.k === 'l'); place(c.x, 2.2, c.z); P.vy = -2; frames(15);
check(G.lumi === 1, 'caisse luciole : une luciole gardienne');
G.inv = 0; const lv0 = G.lives; G.hurt(); check(G.lumi === 0 && G.lives === lv0, 'la luciole encaisse un coup à la place du héros');
// caisse de reprise puis chute
c = G.crates.find(c => c.k === 'k'); place(c.x, 2.2, c.z); P.vy = -2; frames(15);
check(G.spawn.z === c.z, 'caisse de reprise : nouveau point de départ');
G.inv = 0; place(0, -7, c.z - 30); frames(3); check(Math.abs(P.z - c.z) < 0.1 && G.lives === lv0 - 1, 'tomber : une vie en moins, retour à la reprise');
// caisse pétard
c = G.crates.find(c => c.k === 'x'); const near = G.crates.find(o => !o.dead && o !== c && Math.hypot(o.x - c.x, o.z - c.z) < 2.8);
place(c.x, 2.2, c.z); P.vy = -2; frames(22); check(c.fuse > 0 && !c.dead, 'caisse pétard : la mèche s\'allume');
place(c.x, 0, c.z + 6); G.inv = 0; frames(140); check(c.dead && (!near || near.dead), 'elle explose et casse les caisses autour');
// troncs qui roulent
const r = G.rollers[0]; place(0, 0, r.z + 8); G.inv = 0; G.lumi = 0; const lv1 = G.lives; let hit = false; for (let i = 0; i < 300 && !hit; i++) { frames(1); if (G.lives < lv1) hit = true; P.vz = 0; }
check(G.logs.length > 0 && hit, 'les troncs roulent vers le héros et font mal si on ne saute pas');
// arrivée
place(G.goal.x, 0, G.goal.z + 0.5); frames(10); check(G.won, 'toucher la pierre-soleil termine le niveau');
frames(60); T.exitGame();
check(S.jungle.lv >= 1, 'niveau suivant débloqué');
// robot coureur sur les 3 niveaux
for (let li = 0; li < 3; li++) {
  T.startGame('jungle'); G = T.getG(); frames(3); T.heroUse(G, T.HEROES.find(h => h.id === 'rako')); G.build(li); frames(10);
  const solidAt = (x, z) => G.query(x - 0.3, x + 0.3, -0.6, 0.1, z - 0.3, z + 0.3).some(b => b !== G.ground && (b.gnd || b.pad || b.crate));
  let fr = 0, mz = 0, deaths0 = G.deaths;
  while (!G.won && fr < 60 * 160) {
    // viser une colonne avec du sol devant
    let tx = P.x; if (!solidAt(P.x, P.z - 2.2) || !solidAt(P.x, P.z - 3.7)) { let best = 99; for (let cx = -3; cx <= 3; cx++) { const x = cx * 1.5; if (solidAt(x, P.z - 2.2) || solidAt(x, P.z - 3.7)) { const d = Math.abs(x - P.x); if (d < best) { best = d; tx = x; } } } }
    T.joy.x = Math.max(-1, Math.min(1, (tx - P.x) * 1.5)); T.joy.y = 1;
    const gA = solidAt(P.x, P.z - 1.2), log = G.logs.some(l => l.z < P.z && P.z - l.z < 3.4), cr = G.crates.some(c => !c.dead && Math.abs(c.x - P.x) < 1 && c.z < P.z && P.z - c.z < 1.6),
      hi = G.query(P.x - 0.3, P.x + 0.3, 0.5, 1.4, P.z - 1.4, P.z - 0.6).some(b => b.gnd), en = G.foes.some(f => !f.dead && Math.hypot(f.x - P.x, f.z - P.z) < 2.2);
    const sw = G.swings.some(s => s.z < P.z + 1 && P.z - s.z < 2.6 && Math.abs(Math.sin(Math.sin(s.t * 1.7) * 0.62) * 5.4) < 2.7 && P.z - s.z > 1.2);
    if (sw) T.joy.y = 0;
    if (en) G.doSpin();
    if (P.onGround && (!gA || log || cr || hi)) P.jumpBuf = 0.12;
    frames(1); fr++; mz = Math.max(mz, -P.z);
  }
  T.joy.x = T.joy.y = 0;
  console.log('    niveau ' + (li + 1) + ' : ' + (G.won ? 'gagné' : 'pas fini') + ' en ' + (fr / 60).toFixed(0) + ' s, avancée ' + Math.round(mz / (G.NR * 1.5) * 100) + ' %, chutes ' + (G.deaths - deaths0) + ', caisses ' + G.crGot + '/' + G.crTot);
  check(G.won || mz / (G.NR * 1.5) > 0.7, 'niveau ' + (li + 1) + ' : le robot avance loin');
  check(finite(), 'valeurs valides'); frames(30); T.exitGame();
}
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK');
