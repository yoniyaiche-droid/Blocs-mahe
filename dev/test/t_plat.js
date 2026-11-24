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
console.log('ROYAUME SAUTE-NUAGE');
T.startGame('plat'); let G = T.getG(); frames(10);
check(!G.ready && G.choiceOpen, 'choix du héros d\'abord');
T.heroUse(G, T.HEROES.find(h => h.id === 'pepin')); G.build(0); frames(30);
check(G.ready && G.NW > 180 && G.stars.length === 3 && G.goal, 'monde 1 construit (' + G.NW + ' colonnes, 3 étoiles, arrivée)');
check(G.onGround && Math.abs(P.y - 2) < 1e-6, 'le héros tient sur le sol (y=' + P.y.toFixed(3) + ')');
// boîte cadeau tapée par-dessous
let bk = Object.keys(G.boxes).map(Number).find(k => G.boxes[k].ch === 'B'), bi = bk % G.NW, bj = Math.floor(bk / G.NW);
place(bi + 0.5, bj - 1.7, 0); P.vy = 8; const c0 = G.coinsGot; frames(20);
check(G.boxes[bk].ch === 'U' && G.coinsGot === c0 + 1, 'taper une boîte cadeau par-dessous donne une pièce');
bk = Object.keys(G.boxes).map(Number).find(k => G.boxes[k].ch === 'P'); bi = bk % G.NW; bj = Math.floor(bk / G.NW);
place(bi + 0.5, bj - 1.7, 0); P.vy = 8; frames(20);
check(G.items.length === 1 && G.boxes[bk].ch === 'U', 'une boîte bonus fait sortir un bonus (' + (G.items[0] && G.items[0].k) + ')');
const it = G.items[0]; place(it.x, it.ty - 0.6, 0); frames(5); check(G.items.length === 0 && (G.bubble || G.leaf || G.spring > 0), 'ramasser le bonus');
// écraser un ennemi
G.bubble = 0; const f = G.foes.find(f => !f.dead && !T.GAMES.plat && true) || G.foes.find(x => !x.dead);
const fo = G.foes.find(x => !x.dead && x.k === 'a'); place(fo.x, fo.y + 2.5, 0); P.vy = -2; fo.x0 = fo.x; const h0 = G.hearts; frames(20);
check(fo.dead && G.hearts === h0, 'sauter sur un ennemi l\'écrase sans se blesser');
const fo2 = G.foes.find(x => !x.dead); fo2.dir = 1; place(fo2.x + 0.2, fo2.y, 0); G.inv = 0; P.inv = 0; frames(2);
check(G.hearts === h0 - 1, 'toucher un ennemi de côté enlève un cœur');
// trampoline
const tr = G.tramps[0]; G.inv = 0; place(tr.x, tr.y + 1.5, 0); P.vy = -3; let ym = 0; for (let i = 0; i < 70; i++) { frames(1); ym = Math.max(ym, P.y); }
check(ym > tr.y + 6, 'le trampoline fait sauter très haut (' + (ym - tr.y).toFixed(1) + ')');
// chute dans un trou
G.inv = 0; const hh = G.hearts; place(40, -4.9, 0); P.vy = -5; frames(5);
check(G.hearts === hh - 1 && P.y >= 1.9, 'tomber dans un trou : un cœur en moins et retour à la lanterne');
// plateforme qui glisse (monde 2)
T.exitGame(); T.startGame('plat'); G = T.getG(); frames(3); T.heroUse(G, T.HEROES.find(h => h.id === 'nova')); G.build(1); frames(10);
const mv = G.movers[0]; frames(5); place(mv.x + 1.5, mv.y + 1.5, 0); P.vy = -1; frames(30); const rx = P.x - mv.x; frames(60);
check(G.onMover === mv && Math.abs((P.x - mv.x) - rx) < 0.05, 'la plateforme mobile transporte le héros');
// le bot court et saute jusqu'à la montgolfière
for (let w = 0; w < 4; w++) {
  T.exitGame(); T.startGame('plat'); G = T.getG(); frames(3); T.heroUse(G, T.HEROES.find(h => h.id === 'biscotte')); G.build(w); frames(10);
  T.joy.x = 1; let fr = 0, mx = 0, deaths = 0, lastH = G.hearts, stuckX = 0, stuckT = 0;
  const bot = () => { const ax = P.x + 0.75, gA = G.solid(Math.floor(ax), Math.floor(P.y - 0.5)) || G.oneway(Math.floor(ax), Math.floor(P.y - 0.5)), wA = G.solid(Math.floor(ax), Math.floor(P.y + 0.5)) || G.solid(Math.floor(ax), Math.floor(P.y + 1.2));
    const en = G.foes.some(f => !f.dead && f.x > P.x && f.x - P.x < 2.6 && Math.abs(f.y - P.y) < 2.5), sp = G.spikes.some(s => s.x + 0.5 > P.x && s.x - P.x < 1.4 && Math.abs(s.y - P.y) < 1);
    let go = 1; const mv = G.movers.find(m => m.ax === 'x' && m.x > P.x - 1 && m.x - P.x < 16);
    if (G.onGround && !gA && mv && !G.onMover && (m => m.x > P.x + 1.8 || m.x + m.w < P.x + 0.5)(mv)) go = 0;
    if (G.onMover && !gA) { let d = 0; for (let k = 1; k < 8; k++) if (G.solid(Math.floor(P.x + k), Math.floor(P.y - 0.5)) || G.solid(Math.floor(P.x + k), Math.floor(P.y - 1.5)) || G.solid(Math.floor(P.x + k), Math.floor(P.y - 2.5))) { d = k; break; } if (!d || d > 3) go = 0; }
    if (!G.onGround && P.vy < 0 && G.movers.some(m => P.x > m.x + 0.8 && P.x < m.x + m.w - 0.6 && P.y > m.y)) go = 0;
    T.joy.x = go; const jump = G.onGround && go && (!gA || wA || en || sp);
    if (jump) { P.jumpBuf = 0.15; T.keys.add('Space'); } else if (G.onGround || P.vy < 0) T.keys.delete('Space'); };
  while (!G.won && fr < 60 * 150) { bot(); frames(1); fr++; mx = Math.max(mx, P.x); if (G.hearts < lastH) deaths++; lastH = G.hearts;
    if (Math.abs(P.x - stuckX) < 0.3) stuckT++; else { stuckT = 0; stuckX = P.x; }
    if (stuckT > 180) { T.joy.x = -1; frames(20); T.joy.x = 1; stuckT = 0; } }
  T.joy.x = 0; T.keys.delete('Space');
  console.log('    monde ' + (w + 1) + ' : ' + (G.won ? 'gagné' : 'pas fini') + ' en ' + (fr / 60).toFixed(0) + ' s, avancée ' + Math.round(mx / G.NW * 100) + ' %, chocs ' + deaths + ', étoiles ' + G.nStars());
  check(G.won || mx / G.NW > 0.6, 'monde ' + (w + 1) + ' : le robot coureur avance loin (' + Math.round(mx / G.NW * 100) + ' %)');
  check(finite(), 'valeurs valides');
}
frames(200);
check(S.plat.lv >= 1, 'gagner débloque le monde suivant (' + S.plat.lv + ')');
T.exitGame();
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK');
