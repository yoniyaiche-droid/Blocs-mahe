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
console.log('TURBO BOLIDES');
T.startGame('race'); let G = T.getG(); frames(20);
check(G.phase === 'pick' && G.T.N > 600, 'circuit construit (' + G.T.N + ' points, ' + Math.round(G.T.tot) + ' m), choix du pilote');
check(G.ais.length === 5, '5 adversaires sur la grille');
G.chosen(T.HEROES.find(h => h.id === 'mina')); T.heroUse(G, T.HEROES.find(h => h.id === 'mina')); frames(5);
check(G.phase === 'count' && G.pcar, 'compte à rebours, bolide du pilote');
frames(60); check(G.car.spd === 0, 'on ne part pas avant le départ');
frames(200); check(G.phase === 'race', 'départ donné');
const T_ = G.T, N = T_.N; let maxOff = 0, air = 0, drifted = false, nitUsed = false, minSpd = 99, fr = 0, laps = new Set(), nanBad = false;
while (G.phase === 'race' && fr < 9000) {
  const c = G.car, la = (c.i + 10) % N, ta = Math.atan2(T_.tx[la], T_.tz[la]); let d = ((ta - c.h + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  T.joy.x = Math.max(-1, Math.min(1, -d * 2.2 - c.off * 0.06));
  G.btn.drift = Math.abs(T_.k[la]) > 0.035 && c.spd > 20;
  if (G.nitro > 0.5 && c.nitT <= 0) { G.useNitro(); nitUsed = true; }
  frames(1); fr++;
  maxOff = Math.max(maxOff, Math.abs(c.off)); if (c.air) air++; if (c.drift) drifted = true; laps.add(c.lap);
  if (fr > 300) minSpd = Math.min(minSpd, c.spd);
  if (![c.x, c.y, c.z, c.h, c.spd].every(Number.isFinite)) nanBad = true;
}
T.joy.x = 0; G.btn.drift = false;
console.log('    course : ' + (fr / 60).toFixed(0) + ' s, place ' + G.fplace + ', bousculés ' + G.td + ', saut ' + (air / 60).toFixed(1) + ' s, tours vus ' + [...laps].join(','));
check(!nanBad, 'valeurs du bolide toujours valides');
check(G.phase === 'done' && G.done, 'la course se termine après 3 tours');
check(laps.has(1) && laps.has(2) && laps.has(3), 'les tours 1, 2 et 3 sont comptés');
check(maxOff <= 8 - 1.15 + 1e-6, 'les murs gardent le bolide sur la piste (écart max ' + maxOff.toFixed(2) + ')');
check(drifted, 'dérapage dans les virages');
check(nitUsed, 'turbo utilisé (jauge remplie en dérapant)');
check(air > 3, 'le bolide décolle sur les bosses');
check(G.ais.every(a => a.s > N * 1.5), 'les adversaires roulent et font des tours');
check(G.fplace >= 1 && G.fplace <= 6, 'place finale ' + G.fplace + '/6');
check(S.race.n === 1, 'course enregistrée');
frames(120); check(Number.isFinite(G.car.x), 'après l\'arrivée, la voiture continue toute seule');
T.exitGame(); frames(5);
// demi-tour : retour automatique sur la piste
T.startGame('race'); G = T.getG(); frames(5); const h = T.HEROES.find(h => h.id === 'zig'); T.heroUse(G, h); G.chosen(h); frames(260);
G.car.h += Math.PI; G.car.vh = G.car.h; let resp = false; for (let i = 0; i < 400; i++) { frames(1); if (G.car.wrong === 0 && i > 30) { resp = true; break; } }
check(resp, 'à contresens : demi-tour automatique');
T.exitGame();
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK');
