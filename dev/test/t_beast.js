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
console.log('BESTIOLES MAGIQUES');
S.coins = 100;
T.startGame('beast'); let G = T.getG(); frames(5);
check(!G.ready && G.choiceOpen, 'choix du héros d\'abord');
T.heroUse(G, T.HEROES.find(h => h.id === 'zelie')); G.pickStarter(); 
S.beast.team = [T.bsNew('brasou', 5)]; S.beast.box = []; S.beast.jars = 5; S.beast.ber = 3; S.beast.seen = ['brasou']; S.beast.caught = ['brasou']; G.build(); frames(30);
check(G.ready && G.roam.length === 16 && S.beast.team[0].hp === S.beast.team[0].max, 'île construite, 16 bestioles sauvages, Brasou de départ');
check(P.onGround, 'le héros tient sur le sol');
T.joy.y = 1; frames(60); T.joy.y = 0; check(Math.hypot(P.x, P.z - 4.5) > 3, 'se promener');
// combat contre une bestiole sauvage
const playBattle = (maxT) => { let n = 0; while (G.inB && n < maxT) { if (G.inB.state === 'choose') { const mv = 'm' + (G.me().lv >= 8 ? 2 : 1); G.onBtn(mv, true); } frames(1); n++; } return n; };
const ro = G.roam.find(o => o.z.n === 'Prairie'); P.x = ro.x; P.z = ro.zz + 1; frames(3);
check(!!G.inB && G.scene === G.bScene, 'toucher une bestiole lance un combat dans l\'arène');
const foeS = G.foe().s; check(S.beast.seen.indexOf(foeS) >= 0, 'la bestiole adverse est notée « vue » dans l\'album');
frames(150); check(G.inB.state === 'choose', 'messages d\'intro puis à toi de jouer');
const xp0 = S.beast.team[0].xp, lv0 = S.beast.team[0].lv; const n1 = playBattle(60 * 60);
check(!G.inB && G.scene !== G.bScene, 'le combat se termine et on revient sur l\'île (' + (n1 / 60).toFixed(0) + ' s)');
check(S.beast.team[0].xp !== xp0 || S.beast.team[0].lv > lv0, 'Brasou gagne de l\'expérience');
// capture
S.beast.team[0].hp = S.beast.team[0].max; S.beast.team[0].lv = 9; T.GAMES.beast && 0;
const ro2 = G.roam.find(o => o.gone <= 0 && o.z.n === 'Plage'); P.x = ro2.x; P.z = ro2.zz + 1; frames(3);
check(!!G.inB, 'deuxième combat');
frames(150); let caught = false, tries = 0;
let guard = 0; while (G.inB && tries < 30 && guard++ < 60 * 120) { if (G.inB.state === 'choose') { G.foe().hp = 1; S.beast.jars = Math.max(S.beast.jars, 1); G.onBtn('jar', true); tries++; } frames(1); }
frames(30); check(S.beast.team.length === 2 || S.beast.box.length > 0, 'capturer une bestiole avec un bocal à étoiles (' + tries + ' essai(s))');
check(S.beast.caught.length === 2, 'elle entre dans l\'album (' + S.beast.caught.join(', ') + ')');
// baie, changer, fuir
const ro3 = G.roam.find(o => o.gone <= 0); P.x = ro3.x; P.z = ro3.zz + 1; frames(3); frames(150);
S.beast.team[0].hp = 3; const b0 = S.beast.ber; G.onBtn('berry', true); let k = 0; while (G.inB.state !== 'choose' && k < 600) { frames(1); k++; }
check(S.beast.ber === b0 - 1 && (S.beast.team[0].hp > 3 || S.beast.team[0].hp === 0), 'la baie de soin redonne des cœurs');
if (S.beast.team[0].hp > 0) { G.onBtn('swap', true); frames(2); }
G.inB && (G.inB.state = 'choose'); if (G.inB) { S.beast.team[1].hp = S.beast.team[1].max; S.beast.team[1].def = 999; G.turn({ k: 'swap', to: 1 }); k = 0; while (G.inB && G.inB.state !== 'choose' && k < 600) { frames(1); k++; } }
check(!G.inB || G.inB.mi === 1, 'changer de bestiole pendant le combat');
if (G.inB) { G.onBtn('run', true); frames(120); } check(!G.inB, 'fuir un combat sauvage');
// boutique
const c0 = S.coins, j0 = S.beast.jars; G.buy('jars', 15); check(S.beast.jars === j0 + 1 && S.coins === c0 - 15, 'acheter un bocal à la boutique (pièces du jeu)');
// fontaine
S.beast.team.forEach(c => c.hp = 1); G.healCd = 0; P.x = 0; P.z = 2.6; frames(3); check(S.beast.team.every(c => c.hp === c.max), 'la fontaine de Mamie Tisane soigne l\'équipe');
// évolution
const st = S.beast.team[0]; st.lv = 9; st.xp = 10000; const ro4 = G.roam.find(o => o.gone <= 0); P.x = ro4.x; P.z = ro4.zz + 1; frames(3); frames(150); playBattle(60 * 60);
check(st.s === 'fournak', 'Brasou évolue en Fournak au niveau 10 (niveau ' + st.lv + ')');
// défaite
S.beast.team.forEach(c => { c.hp = 1; c.def = 1; c.spd = 0; }); const ro5 = G.roam.find(o => o.gone <= 0 && o.z.n === 'Volcan'); P.x = ro5.x; P.z = ro5.zz + 1; frames(3); frames(150);
let n5 = 0; while (G.inB && n5 < 60 * 60) { if (G.inB.state === 'choose') G.onBtn('m0', true); frames(1); n5++; }
check(!G.inB && S.beast.team.every(c => c.hp === c.max) && Math.hypot(P.x, P.z - 4.5) < 0.5, 'si toute l\'équipe est K.O. : retour au village, soignée');
// champion
S.beast.team.forEach(c => { c.lv = 22; T.GAMES.beast; }); for (const c of S.beast.team) { delete c.hp; } S.beast.team.forEach(c => { const n = T.bsNew(c.s, 22); Object.assign(c, n); });
G.startBattle([['orageon', 13], ['rocabosse', 13], ['tornadou', 14]].map(([s, l]) => T.bsNew(s, l)), true); frames(150);
G.onBtn('jar', true); frames(5); check(G.inB.state === 'choose', 'pas de capture contre le Capitaine');
const nc = playBattle(60 * 120);
check(S.beast.badge === 1, 'battre les 3 bestioles du Capitaine Orage donne le badge (' + (nc / 60).toFixed(0) + ' s)');
check(finite(), 'valeurs valides');
frames(60); T.exitGame();
// reprise de partie
T.startGame('beast'); G = T.getG(); frames(3); T.heroUse(G, T.HEROES.find(h => h.id === 'leon')); G.build(); frames(10);
check(G.ready && S.beast.team.length >= 1 && S.beast.badge === 1, 'on retrouve son équipe et son badge en revenant');
T.exitGame();
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK');
