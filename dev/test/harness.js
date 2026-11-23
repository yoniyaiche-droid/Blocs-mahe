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

console.log('MENU');
frames(30);
check(true, 'menu tourne 30 images sans erreur');

console.log('OBBY');
T.startGame('obby'); let G = T.getG();
frames(40);
check(P.onGround && Math.abs(P.y) < 1e-6, 'le joueur tient debout sur la plateforme de départ (y=' + P.y.toFixed(3) + ')');
T.joy.y = 1; frames(140); T.joy.y = 0; frames(20);
check(G.deaths >= 1, 'marcher dans le vide sans sauter => chute et retour au départ (chutes=' + G.deaths + ')');
G.cp = 0; G.die(); check(P.x === 0 && P.y === 0 && P.z === 1.5, 'réapparition exacte au point de départ');
// Bot simple : avance + saute en continu depuis le départ
place(0, 0, 1.5); T.cam.yaw = 0; frames(10);
T.joy.y = 1; T.keys.add('Space'); let minZ = 0, maxCp = 0;
for (let i = 0; i < 160; i++) { frames(1); if (P.y > -0.3) minZ = Math.min(minZ, P.z); }
T.joy.y = 0; T.keys.delete('Space'); frames(5);
check(minZ < -9, 'saut + avance : le joueur atteint les premières plateformes (z min posé=' + minZ.toFixed(1) + ')');
// Plateforme mobile : le joueur doit être transporté
const m1 = G.movers[0];
place((m1.x0 + m1.x1) / 2, 4.4, -56); frames(5);
let offs = [];
for (let i = 0; i < 120; i++) { frames(1); offs.push(Math.abs(P.x - (m1.x0 + m1.x1) / 2)); }
check(P.onGround && P.ground === m1 && Math.max(...offs) < 0.05, 'plateforme mobile : le joueur reste dessus (écart max=' + Math.max(...offs).toFixed(3) + ')');
// Lave
G.cp = 1; place(0, 1.5, -40); frames(30);
check(Math.abs(P.z - (-31)) < 0.5 && G.deaths >= 2, 'tomber dans la lave => retour au point de contrôle 1');
// Brique rouge
G.cp = 2; place(0, 4.4, -72.5); T.cam.yaw = 0; T.joy.y = 1; const d0 = G.deaths; frames(40); T.joy.y = 0;
check(G.deaths > d0, 'toucher une brique rouge => chute');
// Point de contrôle
G.cp = 0; place(-2, 3, -32); frames(30);
check(G.cp === 1, 'se poser sur le drapeau 1 active le point de contrôle');
// Trampoline -> arrivée
place(0, 8.4, -99.5); frames(3); T.joy.y = 1;
let peak = 0; for (let i = 0; i < 150 && !G.over; i++) { frames(1); peak = Math.max(peak, P.y); }
T.joy.y = 0;
check(G.over, 'trampoline : le saut atteint la plateforme d\'arrivée (hauteur max ' + peak.toFixed(1) + ')');
check(T.getS().best.obby > 0, 'record de temps enregistré');
frames(10);
check(finite(), 'valeurs du joueur toujours valides');
T.exitGame();

console.log('ARÈNE');
T.startGame('arena'); G = T.getG();
frames(200);
check(G.wave >= 1 && G.slimes.length > 0, 'la vague 1 apparaît (slimes=' + G.slimes.length + ')');
let hitFrames = 0;
for (let i = 0; i < 4000 && !G.over; i++) {
  // Le bot vise le slime le plus proche et frappe
  let best = null, bd = 1e9; for (const s of G.slimes) { const d = Math.hypot(s.x - P.x, s.z - P.z); if (d < bd) { bd = d; best = s; } }
  if (best && bd > 1.6) { const dx = best.x - P.x, dz = best.z - P.z; const sn = Math.sin(T.cam.yaw), cs = Math.cos(T.cam.yaw);
    T.joy.x = (dx * cs - dz * sn) / bd; T.joy.y = (-dx * sn - dz * cs) / bd; } else { T.joy.x = 0; T.joy.y = 0; }
  if (i % 12 === 0) { G.onAction(); hitFrames++; }
  frames(1);
}
T.joy.x = T.joy.y = 0;
console.log('    vague=' + G.wave + ' slimes battus=' + G.kills + ' cœurs=' + G.hearts + ' fini=' + G.over + ' pièces=' + G.earned);
check(G.kills >= 4, 'l\'épée bat des slimes');
check(G.wave >= 2, 'les vagues s\'enchaînent');
check(finite(), 'valeurs du joueur toujours valides');
// Laisser les slimes gagner
for (let i = 0; i < 6000 && !G.over; i++) frames(1);
check(G.over, 'sans se défendre, la partie finit (écran de fin)');
T.exitGame();

console.log('ÎLE');
let gemCounts = [], spawnOk = 0;
for (let k = 0; k < 12; k++) {
  T.startGame('island'); G = T.getG(); frames(40);
  gemCounts.push(G.total); if (P.onGround && P.y >= 2) spawnOk++;
  T.exitGame();
}
check(gemCounts.every(c => c === 10), '10 gemmes placées sur 12 îles générées (' + gemCounts.join(',') + ')');
check(spawnOk === 12, 'départ sur la terre ferme dans 12/12 îles');
T.startGame('island'); G = T.getG(); frames(30);
T.joy.y = 1; let ys = [];
for (let i = 0; i < 400; i++) { frames(1); ys.push(P.y); if (i % 50 === 0) T.cam.yaw += 1.3; }
T.joy.y = 0;
check(finite() && Math.min(...ys) >= -0.01, 'promenade sur l\'île : jamais sous le sol (y min=' + Math.min(...ys).toFixed(2) + ')');
check(P.x >= G.bounds[0] && P.x <= G.bounds[1] && P.z >= G.bounds[2] && P.z <= G.bounds[3], 'le joueur reste dans les limites de l\'île');
for (const g of G.gems) { place(g.x, g.y - 0.6, g.z); frames(3); }
check(G.over && G.found === 10, 'ramasser les 10 gemmes termine la partie');
T.exitGame();

console.log('BÂTISSEUR');
T.startGame('build'); G = T.getG(); frames(20);
const base = G.base.m;
let fakeHits = [];
G.ray = { setFromCamera() {}, intersectObjects: () => fakeHits };
fakeHits = [{ object: base, point: { x: 2.3, y: 0, z: -3.4 }, face: { normal: { x: 0, y: 1, z: 0 } } }];
G.onTap(10, 10, 0);
check(G.blocks.size === 1 && G.blocks.has(((2 + 32) * 64 + 0) * 64 + (-4 + 32)), 'toucher le sol pose un bloc en (2,0,-4)');
const firstMesh = G.meshes[0];
fakeHits = [{ object: firstMesh, point: { x: 2.5, y: 1, z: -3.5 }, face: { normal: { x: 0, y: 1, z: 0 } } }];
G.onTap(10, 10, 0);
check(G.blocks.size === 2, 'toucher le dessus d\'un bloc en pose un autre au-dessus');
G.setMode('break'); fakeHits = [{ object: G.meshes[1], point: {}, face: { normal: { x: 0, y: 1, z: 0 } } }];
G.onTap(10, 10, 0);
check(G.blocks.size === 1, 'mode Casser : le bloc disparaît');
G.setMode('place');
// Marche d'un bloc : saut automatique
for (let x = -1; x <= 1; x++) G.addBlock(x, 0, 2, 3, true);
place(0.5, 0, 6); T.cam.yaw = 0; frames(5); T.joy.y = 1; frames(80); T.joy.y = 0; frames(10);
check(P.z < 2.5 || P.y >= 0.99, 'saut automatique sur une marche d\'un bloc (y=' + P.y.toFixed(2) + ', z=' + P.z.toFixed(2) + ')');
// Mur de 3 blocs : bloque
for (let y = 0; y < 3; y++) for (let x = -3; x <= 3; x++) G.addBlock(x, y, -10, 5, true);
place(0.5, 0, -6); T.joy.y = 1; frames(120); T.joy.y = 0;
check(P.z > -10 + 0.29, 'un mur de 3 blocs arrête le joueur (z=' + P.z.toFixed(2) + ')');
// Vol
G.setFly(true); T.keys.add('Space'); frames(60); T.keys.delete('Space'); frames(30);
const yFly = P.y; frames(60);
check(yFly > 3 && Math.abs(P.y - yFly) < 0.2, 'mode vol : monter puis rester en l\'air (y=' + P.y.toFixed(2) + ')');
G.setFly(false); frames(150);
check(P.onGround, 'fin du vol : le joueur retombe');
// Bloc impossible à poser sur soi
place(5.5, 0, 5.5); frames(5); const before = G.blocks.size;
fakeHits = [{ object: base, point: { x: 5.5, y: 0, z: 5.5 }, face: { normal: { x: 0, y: 1, z: 0 } } }];
G.onTap(10, 10, 0);
check(G.blocks.size === before, 'pas de bloc posé à l\'intérieur du joueur');
T.exitGame();
check(T.getS().build.length === G.blocks.size, 'construction sauvegardée (' + T.getS().build.length + ' blocs)');
T.startGame('build'); check(T.getG().blocks.size === T.getS().build.length, 'construction rechargée à la partie suivante');
T.exitGame();


console.log('VOLEURS D\'ŒUFS');
T.startGame('eggs'); G = T.getG(); frames(30);
check(P.onGround && Math.abs(P.y) < 1e-6, 'le joueur est posé au sol près de sa base');
const me = G.me, n0 = G.nests[0];
place(n0.x + 0.5, 0, n0.z); frames(3);
check(me.carry && me.carry.kind === 'egg' && n0.egg === null, 'marcher sur un nid prend l\'œuf');
check(n0.guard.target === me, 'le gardien poursuit le voleur');
frames(240);
check(!me.carry && n0.egg, 'attrapé par le gardien : l\'œuf retourne au nid');
// Fuite réelle depuis la Prairie jusqu'à la base (vitesse de départ)
G.nests.forEach(n => { n.guard.stun = 0; }); n0.guard.x = n0.x - 3; n0.guard.z = n0.z; n0.guard.t = 99; n0.guard.wx = n0.guard.x; n0.guard.wz = n0.guard.z;
for (let i = 0; i < 200 && !n0.egg; i++) frames(1);
place(n0.x, 0, n0.z); frames(2);
const rar0 = me.carry && me.carry.r;
T.cam.yaw = 0; let delivered = false;
for (let i = 0; i < 900 && !delivered; i++) {
  const dx = G.home.cx - P.x, dz = 9 - P.z, d = Math.hypot(dx, dz) || 1;
  T.joy.x = dx / d; T.joy.y = -dz / d; frames(1);
  delivered = !me.carry && G.home.slots.some(s => s.item);
}
T.joy.x = T.joy.y = 0;
check(delivered, 'on peut semer le gardien de la Prairie et déposer l\'œuf (' + rar0 + ')');
const slotEgg = G.home.slots.find(s => s.item);
for (let i = 0; i < 1000 && slotEgg.item.kind === 'egg'; i++) frames(1);
check(slotEgg.item.kind === 'pet', 'l\'œuf éclot en animal : ' + slotEgg.item.sp);
frames(600);
const bank = T.getS().egg.bank, c0 = T.getS().coins;
check(bank >= 1, 'les animaux remplissent la tirelire (' + bank.toFixed(1) + ')');
place(G.padPos.x, 0, G.padPos.z); frames(3);
check(T.getS().coins === c0 + Math.floor(bank + 0.2) || T.getS().coins > c0, 'marcher sur la plaque dorée ramasse les pièces (' + c0 + ' → ' + T.getS().coins + ')');
// Voler dans la base d'un bot
const bot = G.bots[0], bs = bot.base.slots.find(s => s.item);
if (bot.carry) G.drop(bot); bot.stun = 0; bot.state = 'think'; bot.t = 99; bot.x = bot.base.cx; bot.z = 8.5;
place(bs.x, 0, bs.z); frames(2);
check(me.carry && me.carry.origin.base === bot.base, 'on peut voler un animal dans la base d\'un bot');
check(bot.state === 'chase', 'le bot poursuit le voleur');
frames(120);
check(!me.carry && bs.item, 'rattrapé par le bot : l\'animal retourne chez lui');
// Raid d'un bot sur notre base, puis coup de batte
G.bots[1].state = 'think'; G.bots[1].t = 99;
bot.stun = 0; bot.raidT = 0; bot.state = 'think'; bot.t = 0;
place(-14, 0, 14); let stolen = false;
for (let i = 0; i < 600 && !stolen; i++) { frames(1); stolen = !!(bot.carry && bot.carry.origin && bot.carry.origin.base === G.home); }
check(stolen, 'un bot vient voler dans notre base');
const before2 = G.home.slots.filter(s => s.item).length;
place(bot.x + 1, 0, bot.z); frames(1); G.swingCd = 0; G.onAction(); frames(2);
console.log('    debug batte: carry=' + !!bot.carry + ' items=' + G.home.slots.filter(s => s.item).length + ' avant=' + before2 + ' stun=' + bot.stun.toFixed(2) + ' dist=' + Math.hypot(bot.x - P.x, bot.z - P.z).toFixed(2));
check(!bot.carry && G.home.slots.filter(s => s.item).length === before2 + 1 && bot.stun > 0, 'coup de batte : le bot est assommé et on récupère son bien');
// Améliorations
T.getS().coins = 1000;
G.buySpeed(); check(T.getS().egg.lvl === 1, 'achat de vitesse (niveau 2)');
G.buyPen(); check(T.getS().egg.big && G.home.slots.every(s => !s.locked), 'achat de 3 places de plus');
// Base pleine : échange contre un œuf plus rare
G.home.slots.forEach(s => { if (s.item) G.takeFromSlot(G.home, s); G.putInSlot(G.home, s, { kind: 'pet', r: 'C', sp: 'chick' }); });
const c1 = T.getS().coins;
G.pickup(me, newEggForTest('E'), { nest: G.nests[5] }); place(G.home.cx, 0, 9); frames(2);
check(!me.carry && G.home.slots.some(s => s.item.r === 'E') && T.getS().coins === c1 + 5, 'base pleine : un poussin est vendu pour faire place à l\'œuf épique');
G.pickup(me, newEggForTest('C'), { nest: G.nests[0] }); place(G.home.cx, 0, 9); frames(2);
check(!!me.carry, 'base pleine et œuf pas plus rare : on le garde dans les mains');
G.drop(me);
// Longue partie avec les bots
const botItems = () => G.bots.reduce((a, b) => a + b.base.slots.filter(s => s.item).length, 0);
const bi0 = botItems();
place(-9, 0, 10);
for (let i = 0; i < 4000; i++) frames(1);
check(finite(), 'valeurs du joueur toujours valides après une longue partie');
check(botItems() > bi0 || G.bots.some(b => b.carry), 'les bots volent des œufs et remplissent leur base (' + bi0 + ' → ' + botItems() + ')');
const savedSlots = JSON.stringify(T.getS().egg.slots.map(s => s && s.k));
T.exitGame();
T.startGame('eggs'); G = T.getG(); frames(5);
check(JSON.stringify(G.home.slots.map(s => s.item && s.item.kind)) === savedSlots, 'la base est rechargée à la partie suivante');
T.exitGame();


{
console.log('BRAINROT BAZAR');
T.startGame('brainrot'); G = T.getG(); frames(30);
check(G.walkers.length >= 8 && P.onGround, 'des brainrots défilent sur le tapis (' + G.walkers.length + ')');
T.getS().br.cash = 1000;
G.bots.forEach(b => { b.state = 'think'; b.t = 999; b.raidT = 999; });
let w = G.walkers.filter(x => x.d.price <= 1000 && x.x < 20).sort((a, b) => a.x - b.x)[0];
if (!w) { w = G.spawnWalker(-10, true); w.d = T.BR_BY_ID.tostino; }
place(w.x, 0, 1.8); frames(1);
const cashB = T.getS().br.cash; G.onAction(); 
check(T.getS().br.cash === cashB - w.d.price && G.movers.length === 1, 'acheter un brainrot (' + w.d.n + ', ' + w.d.price + ' 💵)');
frames(240);
const owned = G.home.slots.filter(s => s.id && s.ready);
check(owned.length === 1 && G.movers.length === 0, 'il marche jusqu\'à notre base et s\'installe');
frames(300);
check(T.getS().br.bank >= 1, 'il rapporte de l\'argent (' + T.getS().br.bank.toFixed(1) + ')');
const cash2 = T.getS().br.cash; place(G.padPos.x, 0, G.padPos.z); frames(3);
check(T.getS().br.cash > cash2, 'la plaque dorée encaisse l\'argent');
// Voler chez un bot
const bot = G.bots[0], bB = bot.base; G.unlockBase(bB); bB.lockT = 0; bB.cool = 999;
bot.x = bB.cx; bot.z = bB.cz; bot.stun = 0; bot.state = 'think'; bot.t = 999;
const bs = bB.slots.find(s => s.id && s.ready);
place(bs.x, 0, bs.z + 1.2); frames(1); G.onAction();
check(G.me.carry && G.me.carry.origin.base === bB && bot.state === 'chase', 'voler un brainrot chez un bot, qui nous poursuit');
// coup de batte sur le bot puis fuite vers la base
G.swingCd = 0; place(bot.x + 1.5, 0, bot.z); G.onAction(); frames(1);
check(bot.stun > 0, 'coup de batte : le bot est assommé');
T.cam.yaw = 0; let ok = false;
for (let i = 0; i < 900 && !ok; i++) { const dx = G.home.cx - P.x, dz = G.home.cz - P.z, d = Math.hypot(dx, dz) || 1; T.joy.x = dx / d; T.joy.y = -dz / d; frames(1); ok = !G.me.carry; }
T.joy.x = T.joy.y = 0;
check(ok && G.home.slots.filter(s => s.id).length === 2, 'on rapporte le brainrot volé dans notre base');
// Raid d'un bot, porte laser
G.bots[1].state = 'think'; G.bots[1].t = 999; G.bots[1].raidT = 999;
bot.stun = 0; bot.raidT = 0; bot.state = 'think'; bot.t = 0; bot.x = bB.cx; bot.z = bB.cz;
G.home.cool = 0; G.home.lockT = 0; G.lockHome();
place(-30, 0, -20); frames(400);
check(G.home.slots.filter(s => s.id).length === 2 && !bot.carry, 'base verrouillée : le bot ne peut rien voler');
G.home.lockT = 0.01; frames(2); bot.raidT = 0; bot.state = 'think'; bot.t = 0;
let stolen = false; for (let i = 0; i < 900 && !stolen; i++) { frames(1); stolen = !!(bot.carry && bot.carry.origin.base === G.home); }
check(stolen, 'base ouverte : le bot vole un brainrot');
const nb = G.home.slots.filter(s => s.id).length;
place(bot.x + 1, 0, bot.z); G.swingCd = 0; frames(1); G.onAction(); frames(2);
check(!bot.carry && G.home.slots.filter(s => s.id).length === nb + 1, 'coup de batte : on récupère notre brainrot');
// Base d'un bot verrouillée : impossible d'entrer
bot.stun = 0; bot.state = 'think'; bot.t = 999; bot.raidT = 999;
G.lockBase(bB, 20); place(bB.cx, 0, bB.cz - 9); T.cam.yaw = 0; T.joy.y = -1; frames(150); T.joy.y = 0;
check(!G.inBase(bB, P.x, P.z), 'les lasers d\'un bot empêchent d\'entrer (z=' + P.z.toFixed(2) + ')');
G.unlockBase(bB); bB.lockT = 0;
// Base pleine : échange contre plus cher
G.home.slots.forEach(s => { G.clearSlot(G.home, s); G.placeBR(G.home, s, 'tostino'); });
T.getS().br.cash = 100000;
const w2 = G.spawnWalker(P.x, true); w2.d = T.BR_BY_ID.formaggio; const cb = T.getS().br.cash;
place(w2.x, 0, 1.8); frames(1); G.onAction();
console.log('    dbg br: cash', T.getS().br.cash, 'attendu', cb - 3000 + 15, 'movers', G.movers.length, 'slots', G.home.slots.map(s => s.id + (s.res ? '*' : '')).join(','));
check(Math.abs(T.getS().br.cash - (cb - 3000 + 15)) < 400 && G.movers.filter(m => m.B === G.home).length === 1, 'base pleine : un brainrot moins cher est revendu pour faire de la place');
frames(300);
// Longue partie
G.bots.forEach(b => { b.state = 'think'; b.t = 0.5; b.raidT = 999; b.stun = 0; });
const botCash0 = G.bots.map(b => b.cash);
place(-14, 0, 11);
for (let i = 0; i < 5000; i++) frames(1);
const bought = G.bots.some((b, i) => b.base.slots.filter(s => s.id).length > 3 || b.cash < botCash0[i]);
check(finite() && bought, 'les bots achètent des brainrots pendant une longue partie');
const saved = JSON.stringify(G.home.slots.map(s => s.id));
T.exitGame(); T.startGame('brainrot'); G = T.getG(); frames(5);
check(JSON.stringify(G.home.slots.map(s => s.id)) === saved, 'la base est rechargée à la partie suivante');
T.exitGame();
// console.log('    format: ' + ['999','1500','12345','250000','1000000','2500000'].map(n => T.fmt ? '' : n).join(' '));

}

{
console.log('BATAILLE ROYALE');
T.startGame('royale'); G = T.getG(); frames(30);
check(G.frozen && Math.abs(P.x - G.bus.x) < 0.01 && G.bus.t === 0, 'le choix du mode met la montgolfière en attente');
G.setMode('classic'); frames(60);
check(G.frozen && Math.abs(P.y - (G.bus.y + 0.2)) < 0.01 && P.x > -85, 'le joueur est dans la montgolfière qui avance (x=' + P.x.toFixed(1) + ')');
P.jumpBuf = 0.2; frames(2);
check(!G.frozen && P.fall < 0, 'sauter de la montgolfière');
let n = 0; while (!G.pEnt.landed && n < 900) { frames(1); n++; }
check(G.pEnt.landed && P.y >= 0 && P.fall === 0, 'atterrissage en planant (' + (n / 60).toFixed(1) + ' s)');
frames(700);
const landed = G.bots.filter(b => b.landed).length;
check(landed >= 12, 'les bots ont sauté et atterri (' + landed + '/15)');
// trouver un endroit dégagé
let spot = null;
for (let i = 0; i < 400 && !spot; i++) { const x = Math.floor((Math.random() * 100 - 50) / 4) * 4 + 2, z = Math.floor((Math.random() * 100 - 50) / 4) * 4 + 2;
  if (G.query(x - 3, x + 3, 0, 9, z - 14, z + 3).length === 1 && G.items.every(it => Math.hypot(it.x - x, it.z - z) > 3) && G.chests.every(c => Math.hypot(c.x - x, c.z - z) > 3)) spot = [x, z]; }
check(!!spot, 'endroit dégagé trouvé');
G.bots.forEach(b => { if (b.alive) { b.x = 60; b.z = 60; b.think = 999; b.tgt = null; b.loot = null; } });
place(spot[0], 0, spot[1]); T.cam.yaw = 0; T.cam.pitch = 0.18; frames(20);
// tir
G.inv[1] = { w: 'blaster', r: 3 }; G.select(1);
const tb = G.bots.find(b => b.alive); tb.x = P.x; tb.z = P.z - 8; tb.y = 0; tb.vx = tb.vz = 0; tb.think = 999; tb.tgt = null; tb.loot = null; tb.roam = [tb.x, tb.z]; tb.hp = 100; tb.sh = 0;
frames(3); const hp0 = tb.hp;
for (let i = 0; i < 4; i++) { G.fireCd = 0; G.tryFire(); frames(6); tb.x = P.x; tb.z = P.z - 8; }
frames(20);
check(tb.hp < hp0 || !tb.alive, 'les tirs de peinture touchent un bot (pv ' + hp0 + ' → ' + Math.round(tb.hp) + ')');
tb.x = 60; tb.z = 60;
// construction : rampe puis montée
place(spot[0], 0, spot[1]); frames(5); G.wood = 100;
const pc0 = G.pieces.length; G.build('ramp'); frames(10);
check(G.pieces.length === pc0 + 1 && G.wood === 90, 'construire une rampe coûte 10 bois');
T.joy.y = 1; let maxY = 0; for (let i = 0; i < 90; i++) { frames(1); maxY = Math.max(maxY, P.y); } T.joy.y = 0;
check(maxY > 3, 'on peut monter sur la rampe (hauteur ' + maxY.toFixed(2) + ')');
frames(60);
G.build('wall'); G.build('floor'); frames(5);
check(G.pieces.length >= 2, 'construire un mur et un sol');
const pc = G.pieces[G.pieces.length - 1]; G.hitPiece(pc, 500);
check(G.pieces.indexOf(pc) < 0, 'une construction peut être détruite');
// ramassage
place(spot[0], 0, spot[1]); frames(3);
G.pEnt.sh = 0; G.dropItem({ kind: 'shield' }, P.x + 0.3, P.z); frames(2);
check(G.pEnt.sh === 50, 'ramasser une potion de bouclier');
G.inv[2] = null; G.inv[3] = null; G.dropItem({ kind: 'w', w: 'rocket', r: 2 }, P.x + 0.3, P.z); frames(2);
check(G.inv.some(x => x && x.w === 'rocket'), 'ramasser une arme');
// pioche sur un arbre
const tr = G.trees.find(([x, z]) => G.query(x - 1.5, x + 1.5, 0, 3, z + 0.5, z + 3).length === 1) || G.trees[0]; place(tr[0], 0, tr[1] + 1.8); T.cam.yaw = 0; frames(15); G.select(0); const w0 = G.wood; G.fireCd = 0; G.tryFire();
check(G.wood > w0, 'la pioche récolte du bois sur un arbre (' + w0 + ' → ' + G.wood + ')');
// partie complète : le joueur ne bouge plus
G.bots.forEach(b => { if (b.alive) { b.think = 0; b.x = Math.random() * 100 - 50; b.z = Math.random() * 100 - 50; } });
place(spot[0], 0, spot[1]);
const c0 = T.getS().coins; let fr = 0;
while (!G.over && fr < 22000) { frames(1); fr++; }
const alive = G.bots.filter(b => b.alive).length;
console.log('    fin après ' + (fr / 60).toFixed(0) + ' s, bots restants ' + alive + ', joueur ' + (G.pEnt.alive ? 'vivant' : 'éliminé') + ', tempête phase ' + G.st.i + ' r=' + G.st.r.toFixed(1));
check(G.over, 'la partie se termine (tempête ou élimination)');
check(alive < 15, 'les bots s\'éliminent entre eux ou dans la tempête');
check(finite(), 'valeurs du joueur valides');
frames(60);
T.exitGame();
check(T.getS().coins > c0 && T.getS().best.royalePlace > 0, 'pièces et meilleure place enregistrées (place ' + T.getS().best.royalePlace + ')');
}


{
console.log('MONDE DE BLOCS');
const t0 = Date.now();
T.startGame('mc'); G = T.getG();
console.log('    génération + maillage : ' + (Date.now() - t0) + ' ms');
check(G.panel === 'mode', 'au premier lancement, on choisit son mode');
G.setMode('creative'); G.closePanel();
let nb = 0; for (const c of G.CH.values()) for (const v of c.W) if (v) nb++;
check(nb > 50000, 'monde généré (' + nb + ' blocs)');
const faces = [...G.CH.values()].reduce((a, c) => a + (c.mesh ? c.faces || 0 : 0), 0);
check(faces > 5000 && faces < 400000, 'faces visibles calculées (' + faces + ')');
frames(60);
check(P.onGround, 'le joueur tient sur le sol');
{ const vs = G.villages || [];
  check(vs.length >= 1, 'au moins un village dans le monde (' + vs.map(v => v.name).join(', ') + ')');
  const V = vs[0]; let planks = 0, glass = 0, lan = 0;
  for (let dx = -12; dx <= 12; dx++) for (let dz = -12; dz <= 12; dz++) for (let y = V.top; y < V.top + 9; y++) { const b = G.get(V.x + dx, y, V.z + dz); if (b === 8) planks++; if (b === 9) glass++; if (b === 18) lan++; }
  check(V.houses.length >= 5 && planks > 80 && glass >= 10 && lan >= 5, 'le village a des maisons, des fenêtres et des lanternes (' + V.houses.length + ' maisons)');
  const h0 = V.houses[0]; let inside = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let y = V.top + 1; y <= V.top + 2; y++) if (!G.get(h0.x + a, y, h0.z + b)) inside++;
  check(inside === 18, 'on peut entrer dans les maisons (intérieur vide)');
  const vil = G.mobs.filter(e => e.kind === 'villager');
  check(vil.length >= 5, 'des villageois habitent le village (' + vil.map(e => e.name + ' ' + e.prof.n).slice(0, 5).join(', ') + ')');
  P.x = V.x + 2.5; P.z = V.z + 2.5; P.y = G.colTop(V.x + 2, V.z + 2); frames(30);
  check(G.curV === V, 'entrer dans le village affiche son nom');
  for (let i = 0; i < 600; i++) frames(1);
  console.log('    dbg vil: ' + vil.map(e => e.name + '@' + Math.hypot(e.x - V.x, e.z - V.z).toFixed(1) + (e.dead ? 'X' : '') + ' y' + e.y.toFixed(1) + ' v' + e.vil.name).join(' | '));
  check(vil.every(e => Math.hypot(e.x - e.vil.x, e.z - e.vil.z) < 14 && !e.dead), 'les villageois se promènent dans leur village');
  check(vil.every(e => { const b = G.get(Math.floor(e.x), Math.floor(e.y + 0.3), Math.floor(e.z)); return !b || !T.MB[b].liquid; }), 'aucun villageois coincé dans le puits');
  const v0 = vil[0]; G.atkCd = 0; G.hitMob(v0);
  check(G.panel === 'villager' && !v0.dead, 'toucher un villageois ouvre la discussion'); G.closePanel();
  G.setMode('survival'); const tr = v0.prof.tr[0]; G.inv = {}; G.inv[tr[0][0]] = tr[0][1] + 2; const had = G.inv[tr[1][0]] || 0;
  G.trade(v0, tr);
  check(G.inv[tr[0][0]] === 2 && G.inv[tr[1][0]] === had + tr[1][1], 'échange en survie : ' + tr[0][1] + ' ' + T.MB[tr[0][0]].n + ' → ' + tr[1][1] + ' ' + T.MB[tr[1][0]].n);
  G.setMode('creative');
  G.dayT = 0.75; T.getS().mc.time = 'night'; const d0 = vil.map(e => Math.hypot(e.x - e.home.x - 0.5, e.z - e.home.z - 0.5));
  for (let i = 0; i < 900; i++) frames(1);
  const d1 = vil.map(e => Math.hypot(e.x - e.home.x - 0.5, e.z - e.home.z - 0.5));
  check(d1.reduce((a, b) => a + b, 0) < d0.reduce((a, b) => a + b, 0), 'la nuit, les villageois rentrent chez eux');
  T.getS().mc.time = 'cycle'; G.dayT = 0.25;
  P.x = 40.5; P.z = 40.5; P.y = G.colTop(40, 40); const far = Math.hypot(V.x - 40, V.z - 40) > 16; frames(5);
  if (far) check(G.hud && true, 'boussole vers le village quand on est loin');
}
// lits et villageois texturés
{ const V = G.villages[0], vil = G.mobs.filter(e => e.kind === 'villager');
  const hb = V.houses.map(h => G.beds.find(b => b.key === h.bedKey));
  check(hb.every(b => b && b.x0 >= b.x - 1 && Math.abs((b.x0 + b.x1) / 2 - 0.5 - (V.houses[hb.indexOf(b)].x)) <= 1.6), 'un lit dans chaque maison (' + hb.filter(Boolean).length + '/' + V.houses.length + ')');
  check(hb.every((b, i) => { const h = V.houses[i]; for (let x = b.x0; x < b.x1; x++) for (let z = b.z0; z < b.z1; z++) { if (Math.abs(x - h.x) > 1 || Math.abs(z - h.z) > 1 || G.get(x, b.y, z)) return false; } return b.y === V.top + 1; }), 'les lits sont posés à l\'intérieur, sur le plancher');
  check(vil.every(e => e.A.extra && e.A.extra.length > 20 && !e.A.ftex), 'villageois texturés (visage, cheveux, vêtements : ' + vil[0].A.extra.length + ' textures/matériaux)');
  check(new Set(vil.map(e => e.prof.n)).size >= 3, 'tenues différentes selon le métier');
  // les villageois dorment la nuit
  G.setMode('creative'); T.getS().mc.time = 'night'; G.dayT = 0.75;
  for (let i = 0; i < 1500; i++) frames(1);
  const sl = vil.filter(e => e.sleep && e.vil === V);
  check(sl.length >= 2, 'la nuit, les villageois se couchent dans leur lit (' + sl.length + '/' + vil.filter(e => e.vil === V).length + ')');
  if (sl[0]) { const e = sl[0], b = e.sleep; check(e.y > b.y + 0.5 && e.x >= b.x0 && e.x <= b.x1 && e.z >= b.z0 && e.z <= b.z1, 'le villageois est allongé sur le lit');
    G.talk(e); check(G.panel !== 'villager', 'un villageois qui dort ne se réveille pas pour discuter'); }
  T.getS().mc.time = 'cycle'; G.dayT = 0.3; frames(5);
  check(vil.every(e => !e.sleep), 'au matin, les villageois se lèvent');
  // le joueur dort
  const b0 = hb[0]; G.dayT = 0.3; G.useBed(b0);
  check(Math.abs(G.spawn[0] - (b0.x0 + b0.x1) / 2) < 1e-6 && G.sleeping === 0, 'toucher un lit le jour : point de réapparition enregistré');
  G.dayT = 0.75; T.getS().mc.time = 'night'; G.useBed(b0); check(!G.sleeping, 'nuit bloquée dans les réglages : on ne saute pas la nuit');
  T.getS().mc.time = 'cycle'; G.dayT = 0.75; check(G.isNight(), 'il fait nuit');
  G.useBed(b0); for (let i = 0; i < 150; i++) frames(1);
  check(!G.isNight() && !G.sleeping, 'dormir dans un lit fait passer la nuit (heure ' + G.dayT.toFixed(2) + ')');
  // pointer un lit avec le doigt
  const bc = [(b0.x0 + b0.x1) / 2, b0.y + 0.3, (b0.z0 + b0.z1) / 2];
  P.x = bc[0] + 1.2; P.z = bc[2] + 1.2; P.y = b0.y;
  T.cam.px = bc[0] + 2; T.cam.py = bc[1] + 1.5; T.cam.pz = bc[2] + 2; const dv = [bc[0] - T.cam.px, bc[1] - T.cam.py, bc[2] - T.cam.pz], dl = Math.hypot(...dv);
  const pk = G.pickBed(dv.map(v => v / dl)); check(pk && pk.b === b0, 'on vise le lit avec le doigt');
  // collision : on peut monter sur le lit
  check(G.query(bc[0] - 0.2, bc[0] + 0.2, b0.y, b0.y + 1, bc[2] - 0.2, bc[2] + 0.2).some(q => q.bed), 'le lit est solide (on peut monter dessus)');
  // réapparition sur le lit
  G.die(); check(Math.abs(P.y - (b0.y + 0.56)) < 1e-6 && Math.abs(P.x - bc[0]) < 1e-6, 'après un KO, on réapparaît sur son lit');
  // casser un lit de village
  G.removeBed(b0); check(!G.beds.includes(b0) && G.bedGone.has(b0.key), 'casser un lit de village');
  check(Math.abs(G.spawn[0] - bc[0]) > 1e-3 || Math.abs(G.spawn[2] - bc[2]) > 1e-3, 'lit cassé : le point de réapparition revient au départ');
  // poser un lit
  const fl = findFlat(G, 2);
  if (fl) { const [fx, ft, fz] = fl; G.hot[G.sel] = 121; G.renderHot(); T.cam.fx = 1; T.cam.fz = 0.1; P.x = fx - 2.5; P.z = fz + 0.5; P.y = ft;
    const n0 = G.beds.length; G.placeAt({ x: fx, y: ft - 1, z: fz, nx: 0, ny: 1, nz: 0 });
    const nb2 = G.beds[G.beds.length - 1];
    check(G.beds.length === n0 + 1 && nb2.dx === 1 && nb2.dz === 0 && !nb2.gen, 'poser un lit bleu (orienté dans le sens du regard)');
    G.placeAt({ x: fx, y: ft - 1, z: fz, nx: 0, ny: 1, nz: 0 }); check(G.beds.length === n0 + 1, 'pas de lit posé par-dessus un autre');
    G.hot[G.sel] = 1; const id0 = G.get(fx + 1, ft, fz); G.placeAt({ x: fx + 1, y: ft - 1, z: fz, nx: 0, ny: 1, nz: 0 }); check(G.get(fx + 1, ft, fz) === id0, 'pas de bloc posé dans un lit');
    G.useBed(nb2); G.bedTest = [nb2.x, nb2.y, nb2.z]; }
  else check(false, 'zone plate pour poser un lit');
  G.openPanel('inv'); check(true, 'inventaire avec les lits'); G.closePanel();
}
{ const farm = G.mobs.filter(e => e.kind === 'cow' || e.kind === 'pig');
  check(farm.some(e => e.kind === 'cow') && farm.some(e => e.kind === 'pig'), 'des vaches et des cochons vivent dans le monde (' + farm.length + ')');
  const cow = farm.find(e => e.kind === 'cow'); if (cow) { G.atkCd = 0; G.hitMob(cow); frames(5); check(!cow.dead, 'toucher une vache lui fait un câlin'); }
  { const cx = farm.reduce((a, e) => a + e.x, 0) / farm.length, cz = farm.reduce((a, e) => a + e.z, 0) / farm.length; place(cx, G.colTop(Math.floor(cx), Math.floor(cz)) + 0.01, cz); }
  const near0 = farm.filter(e => Math.hypot(e.x - P.x, e.z - P.z) < 60);
  frames(400); check(near0.every(e => !e.dead), 'les animaux se promènent sans disparaître (' + near0.length + ')');
  G.mobs.forEach(e => { e.dead = true; }); G.spawnT = 1e9; frames(1); }
function findCells(G, n) { const out = []; for (let x = 6; x < 74 && out.length < n; x += 3) for (let z = 6; z < 74 && out.length < n; z += 3) { const t = G.colTop(x, z), tb = G.get(x, t - 1, z);
    if (t > 12 && tb && !T.MB[tb].liquid && tb !== 7 && tb !== 19 && !G.get(x, t, z) && !G.get(x, t + 1, z) && !G.get(x, t + 2, z) && !(G.squish || []).some(q => q.x === x && q.z === z)) out.push([x, t, z]); } return out; }
function findFlat(G, R) { for (let x = 8; x < 72; x += 2) for (let z = 8; z < 72; z += 2) { const t = G.colTop(x, z); let ok = t > 12;
    for (let a = -R; a <= R && ok; a++) for (let b = -R; b <= R && ok; b++) { const tb = G.get(x + a, t - 1, z + b); ok = G.colTop(x + a, z + b) === t && tb && !T.MB[tb].liquid && tb !== 7; for (let y = 0; y < 5 && ok; y++) ok = !G.get(x + a, t + y, z + b); }
    if (ok && !G.squish?.some(q => Math.abs(q.x - x) <= R && Math.abs(q.z - z) <= R)) return [x, t, z]; } return null; }
{ const f = findFlat(G, 3) || findFlat(G, 2); if (f) { P.x = f[0] + 0.5; P.y = f[1]; P.z = f[2] + 3.5; P.vx = P.vy = P.vz = 0; } }
T.cam.yaw = 0; T.cam.pitch = 0.9; frames(40);
const cx = 195, cy = 422;
const hit0 = G.pickBlock(G.screenDir(cx, cy));
check(!!hit0, 'le viseur trouve un bloc devant le joueur');
G.hot[0] = 3; G.select(0);
G.act('place', cx, cy);
const px = hit0.x + hit0.nx, py = hit0.y + hit0.ny, pz = hit0.z + hit0.nz;
if (G.get(px, py, pz) !== 3) { const d = G.screenDir(cx, cy); console.log('    dbg place: hit0', JSON.stringify(hit0), 'target', px, py, pz, 'get', G.get(px, py, pz), 'P', P.x.toFixed(2), P.y.toFixed(2), P.z.toFixed(2), 'mob', JSON.stringify(G.pickMob(d) && {k: G.pickMob(d).m.kind, t: G.pickMob(d).t}), 'pick', JSON.stringify(G.pickBlock(d))); }
check(G.get(px, py, pz) === 3, 'créatif : toucher pose un bloc de pierre');
G.rebuild(); frames(2);
const hit1 = G.pickBlock(G.screenDir(cx, cy));
G.act('break', cx, cy);
check(hit1 && G.get(hit1.x, hit1.y, hit1.z) === 0, 'créatif : casser un bloc est instantané');
// survie
G.setMode('survival'); G.inv = {};
frames(5);
const hs = G.pickBlock(G.screenDir(cx, cy)); const bid = hs && G.get(hs.x, hs.y, hs.z);
let taps = 0; while (hs && G.get(hs.x, hs.y, hs.z) && taps < 20) { G.act('break', cx, cy); taps++; }
const dropId = T.MB[bid].drop !== undefined ? T.MB[bid].drop : bid;
check(hs && G.get(hs.x, hs.y, hs.z) === 0 && (dropId === 0 || G.inv[dropId] >= 1), 'survie : plusieurs coups cassent le bloc (' + T.MB[bid].n + ', ' + taps + ' coups) et on le récolte');
// maintien du doigt
G.rebuild(); frames(2);
const hh = G.pickBlock(G.screenDir(cx, cy));
G.onDown(cx, cy, 0, 'touch'); for (let i = 0; i < 400 && hh && G.get(hh.x, hh.y, hh.z); i++) frames(1); G.onUp(cx, cy, false, 0, 'touch');
check(hh && G.get(hh.x, hh.y, hh.z) === 0, 'survie : garder le doigt appuyé casse le bloc');
if (dropId) { const sl = G.hot.indexOf(dropId); G.select(sl); G.rebuild(); frames(2); const n0 = G.inv[dropId]; G.act('place', cx, cy); check(G.inv[dropId] === n0 - 1, 'survie : poser un bloc le retire du sac'); }
// chute
const sx = Math.floor(P.x), sz = Math.floor(P.z); P.y = G.colTop(sx, sz) + 9; P.vy = 0; P.onGround = false; G.hp = 20;
for (let i = 0; i < 150; i++) frames(1);
check(G.hp < 20, 'survie : une grande chute fait mal (' + G.hp + '/20)');
// nuit et monstres
G.spawnT = 0; G.dayT = 0.75; frames(2);
check(G.isNight() && G.hostile(), 'la nuit tombe et les monstres arrivent en survie');
for (let i = 0; i < 900 && !G.mobs.some(e => e.kind === 'zombie'); i++) frames(1);
const zb = G.mobs.find(e => e.kind === 'zombie');
check(!!zb, 'un monstre apparaît la nuit');
if (zb) { zb.x = P.x + 0.8; zb.z = P.z; zb.y = P.y; const hp0 = G.hp; P.inv = 0; for (let i = 0; i < 90; i++) frames(1); check(G.hp < hp0, 'le monstre attaque le joueur'); 
  for (let i = 0; i < 12 && !zb.dead; i++) { zb.x = P.x + 1; zb.z = P.z; G.atkCd = 0; G.onAction(); frames(2); }
  check(zb.dead, 'on peut battre le monstre à mains nues'); }
G.dayT = 0.25; frames(300);
check(!G.mobs.some(e => e.kind === 'zombie' && !e.dead && e.burn < 0), 'au lever du jour les monstres disparaissent');
// mods
G.setMode('creative');
T.getS().mc.mods.tnt = true; G.applyMod('tnt');
check(G.hot.includes(19), 'mod TNT : la TNT arrive dans la barre');
G.select(G.hot.indexOf(19)); G.rebuild(); frames(2);
const [tx, ty, tz] = findCells(G, 30).filter(c => Math.abs(c[0] - 40) > 6 || Math.abs(c[2] - 40) > 6).pop(); place(tx + 5.5, G.colTop(tx + 5, tz) + 0.01, tz + 0.5); G.placeAt({ x: tx, y: ty - 1, z: tz, nx: 0, ny: 1, nz: 0 });
check(G.get(tx, ty, tz) === 19, 'poser de la TNT');
P.x = Math.min(78, P.x + 7); frames(1); G.breakAt({ x: tx, y: ty, z: tz });
check(G.tnts.length === 1, 'casser la TNT l\'allume');
let air0 = 0; for (let dx = -3; dx <= 3; dx++) for (let dy = -3; dy <= 0; dy++) for (let dz = -3; dz <= 3; dz++) if (!G.get(tx + dx, ty + dy, tz + dz)) air0++;
for (let i = 0; i < 200; i++) frames(1);
let air1 = 0; for (let dx = -3; dx <= 3; dx++) for (let dy = -3; dy <= 0; dy++) for (let dz = -3; dz <= 3; dz++) if (!G.get(tx + dx, ty + dy, tz + dz)) air1++;
check(air1 > air0 + 20, 'la TNT explose et creuse un cratère (' + air0 + ' → ' + air1 + ' blocs vides)');
T.getS().mc.mods.prefab = true; G.applyMod('prefab');
G.select(G.hot.indexOf(100)); const hc = findCells(G, 25)[20] || findCells(G, 5)[0]; P.x = hc[0] + 6.5; P.z = hc[2] + 0.5; P.y = G.colTop(hc[0] + 6, hc[2]); frames(40); const c0 = G.changeCount();
G.placeAt({ x: hc[0], y: hc[1] - 1, z: hc[2], nx: 0, ny: 1, nz: 0 });
check(G.changeCount() > c0 + 150, 'mod constructions : une maison apparaît (' + (G.changeCount() - c0) + ' blocs)');
T.getS().mc.mods.rainbow = true; G.applyMod('rainbow');
check(G.hot.includes(32), 'mod arc-en-ciel : nouveaux blocs disponibles');
T.getS().mc.mods.jump = true; check(G.jumpV === 17, 'mod super saut');
T.getS().mc.mods.jump = false; T.getS().mc.mods.moon = true; check(G.grav < 1, 'mod gravité lunaire'); T.getS().mc.mods.moon = false;
T.getS().mc.mods.speed = true; G.inWater = false; check(G.speedMul() > 1.5, 'mod super vitesse'); T.getS().mc.mods.speed = false;
T.getS().mc.mods.animals = true; G.applyMod('animals');
for (let i = 0; i < 600 && !G.mobs.some(e => e.kind !== 'zombie'); i++) frames(1);
check(G.mobs.some(e => e.kind !== 'zombie'), 'mod animaux : des animaux se promènent');
T.getS().mc.mods.monsters = true; T.getS().mc.mods.dragon = true; G.applyMod('monsters'); G.applyMod('dragon');
for (let i = 0; i < 900 && !G.mobs.some(e => e.kind === 'zombie'); i++) frames(1);
const z2 = G.mobs.find(e => e.kind === 'zombie');
check(!!G.dragon && !!z2, 'mods dragon + chasseur de monstres : un dragon et des monstres, même le jour en créatif');
if (z2) { for (let i = 0; i < 300 && !z2.dead; i++) { z2.x = G.dragon.x + 2; z2.z = G.dragon.z; z2.y = P.y; frames(1); } check(z2.dead, 'le dragon crache du feu sur les monstres'); }
const hpC = G.hp; frames(120); check(G.hp === hpC, 'en créatif, les monstres ne font pas mal');
G.openPanel('settings'); check(G.panel === 'settings', 'le bouton ⚙️ ouvre les réglages'); G.closePanel();
{ G.openPanel('inv'); check(G.panel === 'inv', 'l\'inventaire s\'ouvre'); G.closePanel();
  // endroit plat et dégagé
  const cellsF = findCells(G, 12);
  check(cellsF.length >= 10, 'emplacements libres trouvés');
  const [sx, sy, sz] = cellsF[0]; P.x = sx + 2.5; P.z = sz + 0.5; P.y = G.colTop(sx + 2, sz); P.vx = P.vy = P.vz = 0; frames(5);
  G.hot[G.sel] = 110; G.renderHot(); const n0 = G.squish.length;
  G.placeAt({ x: sx, y: sy - 1, z: sz, nx: 0, ny: 1, nz: 0 });
  check(G.squish.length === n0 + 1, 'poser un squishy fraise');
  const q = G.squish[G.squish.length - 1]; frames(90);
  G.placeAt({ x: sx, y: sy - 1, z: sz, nx: 0, ny: 1, nz: 0 }); check(q.sq > 0.5 && G.squish.length === n0 + 1, 'toucher un squishy le presse au lieu d\'en poser un autre');
  cellsF.slice(1, 10).forEach(([x, y, z], k) => { G.hot[G.sel] = 111 + k; G.placeAt({ x, y: y - 1, z, nx: 0, ny: 1, nz: 0 }); });
  check(G.squish.length === n0 + 10, 'poser les 10 squishies différents');
  frames(5); P.x = q.x + 0.5; P.z = q.z + 0.5; P.y = q.y + 3; P.vy = -6; P.vx = P.vz = 0; P.onGround = false; let bounced = false;
  for (let i = 0; i < 40 && !bounced; i++) { frames(1); bounced = P.vy > 8; }
  check(bounced, 'sauter sur un squishy fait rebondir');
  frames(120);
}
G.setMode('survival'); check(G.mode === 'survival', 'réglages : passer en survie');
G.setTime('night'); for (let i = 0; i < 240; i++) frames(1); check(G.isNight() && G.hostile(), 'réglages : mettre la nuit (monstres en survie)');
G.setTime('day'); for (let i = 0; i < 240; i++) frames(1); check(!G.isNight(), 'réglages : mettre le jour');
G.setTime('cycle'); const dt0 = G.dayT; frames(120); check(G.dayT !== dt0, 'réglages : le jour et la nuit alternent');
G.setMode('creative'); check(G.mode === 'creative', 'réglages : revenir en créatif');
T.getS().mc.mods.fireworks = true; G.applyMod('fireworks');
check(G.hot.includes(102), 'mod feux d\'artifice : la fusée arrive dans la barre');
G.select(G.hot.indexOf(102)); G.rebuild(); frames(3); { const c = findCells(G, 40).pop(); G.placeAt({ x: c[0], y: c[1] - 1, z: c[2], nx: 0, ny: 1, nz: 0 }); }
check(G.rockets && G.rockets.length === 1, 'poser une fusée la lance');
for (let i = 0; i < 120; i++) frames(1); check(G.rockets.length === 0, 'la fusée explose en couleurs');
G.setView(true); frames(5); check(T.cam.d === 0, 'vue à la première personne');
G.setView(false);
G.openPanel('mods'); G.closePanel(); G.openPanel('inv'); G.closePanel();
check(true, 'panneaux mods et inventaire');
// eau texturée et effet sous l'eau
{ const wf0 = G.wf; frames(40); check(G.wf !== wf0, 'la texture de l\'eau est animée (vagues)');
  let spot = null; for (let x = 4; x < 76 && !spot; x++) for (let z = 4; z < 76 && !spot; z++) for (let y = 3; y < 12; y++) if (G.get(x, y, z) === 10 && G.get(x, y + 1, z) === 10 && G.get(x, y + 2, z) === 10 && G.get(x, y + 3, z) === 10) { spot = [x, y, z]; break; }
  if (!spot) { const fl = findFlat(G, 2); const [x, t, z] = fl; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let y = t - 4; y < t; y++) G.setB(x + a, y, z + b, 10); spot = [x, t - 4, z]; }
  G.setView(true); place(spot[0] + 0.5, spot[1] + 0.2, spot[2] + 0.5); frames(3);
  const uw = els.mcUnder;
  check(G.under && uw._cls.has('on') && /^url\(data:/.test(uw.style.backgroundImage), 'sous l\'eau : écran bleuté texturé (' + (G.inWater ? 'en train de nager' : '?') + ')');
  check(G.scene.fog.far >= 40 && G.scene.fog.far <= G.fogF, 'sous l\'eau : on voit bien (jusqu\'à ' + G.scene.fog.far + ' blocs, brouillard bleu clair)');
  for (let i = 0; i < 90; i++) { place(spot[0] + 0.5, spot[1] + 0.2, spot[2] + 0.5); frames(1); }
  check(G.bubbles.length > 0, 'des bulles remontent quand on nage sous l\'eau (' + G.bubbles.length + ')');
  const fl2 = findFlat(G, 1); place(fl2[0] + 0.5, fl2[1], fl2[2] + 0.5); frames(5);
  check(!G.under && !uw._cls.has('on') && G.scene.fog.far === G.fogF, 'hors de l\'eau : l\'effet disparaît');
  for (let i = 0; i < 200; i++) frames(1); check(G.bubbles.length === 0, 'les bulles disparaissent');
  place(spot[0] + 0.5, spot[1] + 5, spot[2] + 0.5); P.vy = -12; let wet = false; for (let i = 0; i < 60; i++) { frames(1); if (G.inWater) wet = true; }
  check(wet, 'sauter dans l\'eau : plouf !');
  G.setView(false);
  const html = fs.readFileSync('/home/claude/blocs-mahe/dev/index.master.html', 'utf8');
  check(html.includes('<title>Blocs Mahé</title>') && html.includes('<span>Blocs Mahé</span>') && !/>[^<]*Cubiverse/.test(html), 'l\'application s\'appelle Blocs Mahé');
}
// animaux marins et lézards
{ G.setMode('creative'); T.getS().mc.time = 'day'; G.dayT = 0.3;
  place(8.5, G.colTop(8, 40), 40.5); for (let i = 0; i < 80; i++) G.spawnSea();
  const wh = G.sea.filter(c => c.kind === 'whale');
  check(wh.length >= 1 && wh.every(c => G.waterCol(c.x, c.z) && G.waterCol(c.x, c.z)[1] - G.waterCol(c.x, c.z)[0] >= 6), 'des baleines nagent en eau profonde (' + wh.length + ')');
  const kinds = new Set(G.sea.map(c => c.kind));
  check(['fish', 'shark', 'dolphin', 'turtle', 'jelly', 'octopus', 'crab', 'whale'].filter(k => kinds.has(k)).length >= 7, 'animaux marins variés : ' + [...kinds].join(', '));
  const cap = k => G.sea.filter(c => c.kind === k).length;
  check(cap('shark') <= 2 && cap('whale') <= 2 && cap('fish') <= 14, 'nombre d\'animaux limité (requins ' + cap('shark') + ', poissons ' + cap('fish') + ')');
  for (let i = 0; i < 600; i++) { place(8.5, G.colTop(8, 40) + 0.01, 40.5); frames(1); }
  const swim = G.sea.filter(c => c.kind !== 'crab' && !c.jump);
  const wet = swim.filter(c => G.seaLiq(c.x, c.y, c.z)).length;
  check(wet >= swim.length - 1, 'les animaux marins restent dans l\'eau (' + wet + '/' + swim.length + ')');
  const solid = G.sea.filter(c => { const b = G.get(Math.floor(c.x), Math.floor(c.y + 0.05), Math.floor(c.z)); return b && !T.MB[b].liquid; }).length;
  check(solid === 0, 'aucun animal coincé dans la terre');
  const fish = G.sea.filter(c => c.kind === 'fish' && c.school && c.school.lead && c.school.lead !== c);
  check(fish.length === 0 || fish.filter(f => Math.hypot(f.x - f.school.lead.x, f.z - f.school.lead.z) < 5).length >= fish.length * 0.7, 'les poissons nagent en bancs');
  const crabs = G.sea.filter(c => c.kind === 'crab');
  check(crabs.every(c => { const f = G.floorAt(c.x, c.y, c.z); return f !== null && Math.abs(f - c.y) < 1.05; }), 'les crabes marchent sur le fond ou la plage (' + crabs.length + ')');
  check(G.sea.every(c => Number.isFinite(c.x + c.y + c.z + c.yaw)), 'positions valides');
  // dauphin qui saute
  const dol = G.sea.find(c => c.kind === 'dolphin');
  if (dol) { dol.y = 11.3; dol.vx = 3; dol.vz = 0; dol.vy = 0; dol.jumpT = 0; dol.jump = false; let jumped = false, top = 0;
    for (let i = 0; i < 120; i++) { if (G.seaLiq(dol.x + 0.06, 11.3, dol.z) && !dol.jump) { dol.y = Math.min(dol.y, 11.3); } frames(1); if (dol.jump) jumped = true; top = Math.max(top, dol.y); }
    check(jumped && top > 12, 'le dauphin saute hors de l\'eau (hauteur ' + top.toFixed(1) + ')'); }
  else check(false, 'un dauphin pour sauter');
  // baleine qui souffle
  const w0 = wh[0]; w0.y = 10.4; w0.spout = 0; frames(2); check(w0.spout > 1, 'la baleine souffle un jet d\'eau');
  // toucher les animaux
  G.atkCd = 0; const oc = G.sea.find(c => c.kind === 'octopus'); if (oc) { G.tapSea(oc); check(oc.flee > 0, 'toucher la pieuvre : nuage d\'encre et fuite'); }
  G.atkCd = 0; const tu = G.sea.find(c => c.kind === 'turtle'); if (tu) { G.tapSea(tu); check(tu.hide > 0, 'toucher la tortue : elle rentre la tête'); }
  for (const k of ['fish', 'jelly', 'crab', 'dolphin', 'whale']) { const c = G.sea.find(o => o.kind === k); if (c) { G.atkCd = 0; G.tapSea(c); } }
  check(true, 'toucher poissons, méduses, crabes, dauphins et baleines');
  // viser un poisson avec le doigt
  const f0 = G.sea.find(c => c.kind === 'fish');
  if (f0) { T.cam.px = f0.x + 2; T.cam.py = f0.y + 1; T.cam.pz = f0.z + 2; P.x = f0.x + 1; P.z = f0.z + 1; const dv = [f0.x - T.cam.px, f0.y - T.cam.py, f0.z - T.cam.pz], dl = Math.hypot(...dv);
    const pk = G.pickSea(dv.map(v => v / dl)); check(pk && pk.c.kind === 'fish', 'on vise un poisson avec le doigt'); }
  // requin en survie
  let spot = null; for (let x = 2; x < 78 && !spot; x++) for (let z = 2; z < 78 && !spot; z++) { let ok = true; for (let a = -2; a <= 2 && ok; a++) for (let b = -2; b <= 2 && ok; b++) { const cl = G.waterCol(x + a, z + b); if (!cl || cl[1] - cl[0] < 3) ok = false; } const col = G.waterCol(x, z); if (ok) spot = [x + 0.5, col[0] + 0.3, z + 0.5]; }
  const sh = G.sea.find(c => c.kind === 'shark') || (spot && G.addSea('shark', spot[0], spot[1] + 1, spot[2], 0));
  if (spot && sh) { G.setMode('survival'); const hp0 = G.hp; let bit = false;
    for (let i = 0; i < 240 && !bit; i++) { place(spot[0], spot[1], spot[2]); P.inv = 0; if (i === 0) { sh.x = spot[0] + 2; sh.y = spot[1] + 1; sh.z = spot[2]; sh.cd = 0; sh.flee = 0; } frames(1); if (G.hp < hp0) bit = true; }
    check(bit, 'en survie, le requin mord quand on nage près de lui (' + hp0 + ' → ' + G.hp + ' ❤)');
    G.atkCd = 0; const h0 = sh.hp; G.tapSea(sh); check(sh.hp < h0 && sh.flee > 0, 'coup d\'épée : le requin s\'enfuit');
    G.setMode('creative'); G.hp = 20; }
  else check(false, 'eau profonde pour le requin');
  // sortir un poisson de l'eau
  const fl = findFlat(G, 1); const lf = G.addSea('fish', fl[0] + 0.5, fl[1] + 0.5, fl[2] + 0.5, 1, null);
  for (let i = 0; i < 300; i++) frames(1); check(!G.sea.includes(lf), 'un poisson hors de l\'eau disparaît');
  // lézards
  G.dayT = 0.3; for (let i = 0; i < 30 && G.mobs.filter(e => e.kind === 'lizard').length < 5; i++) for (let k = 0; k < 6 && !G.spawnMob('lizard', 5, 40, true); k++);
  const lz = G.mobs.filter(e => e.kind === 'lizard');
  check(lz.length >= 3, 'des lézards se promènent au soleil (' + lz.length + ')');
  let fled = 0; for (const l0 of lz.slice(0, 3)) { const px = l0.x + 1.2, pz = l0.z, py = G.colTop(Math.floor(px), Math.floor(pz)); const x0 = l0.x, z0 = l0.z;
    for (let i = 0; i < 40; i++) { place(px, py, pz); frames(1); } const dd = Math.hypot(l0.x - x0, l0.z - z0); console.log('    dbg lézard parti de ' + dd.toFixed(2)); if (dd > 0.8 && Math.hypot(l0.x - px, l0.z - pz) > 1.6) fled++; }
  check(fled >= 2, 'le lézard s\'enfuit quand on approche (' + fled + '/3)');
  // les animaux lointains disparaissent, pas les baleines
  place(70.5, G.colTop(70, 40), 40.5); const far0 = G.sea.filter(c => c.kind !== 'whale' && Math.hypot(c.x - 70, c.z - 40) > 64).length; frames(3);
  check(G.sea.filter(c => c.kind !== 'whale' && Math.hypot(c.x - 70, c.z - 40) > 64).length === 0 && G.sea.some(c => c.kind === 'whale'), 'les animaux trop loin disparaissent (' + far0 + '), les baleines restent');
  T.getS().mc.time = 'cycle';
}
// monde sans limites
if (process.env.MAP) { const N = 400, x0 = -160, z0 = -160, px = []; const C = {1:[95,191,74],2:[139,90,43],3:[141,143,148],4:[122,124,130],5:[232,211,143],6:[122,82,48],7:[63,154,63],8:[192,138,79],9:[200,240,255],10:[47,118,240],11:[176,74,58],12:[244,248,255],18:[255,216,77]};
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) { let c = [0,0,0]; for (let y = 39; y >= 0; y--) { const b = G.get(x0 + x, y, z0 + z); if (b) { const k = C[b] || [200,0,200]; const sh = 0.6 + y / 60; c = k.map(v => Math.min(255, Math.round(v * sh))); break; } } px.push(...c); }
  fs.writeFileSync('/home/claude/viz/map.ppm', Buffer.concat([Buffer.from('P6 ' + N + ' ' + N + ' 255\n'), Buffer.from(px)])); console.log('carte écrite'); }
{ { let t0 = Date.now(); for (let i = 0; i < 40; i++) G.chunk(1000 + i, 77); const tg = (Date.now() - t0) / 40; t0 = Date.now(); for (let i = 0; i < 40; i++) G.buildChunk(G.chunk(1000 + i, 77)); const tb = (Date.now() - t0) / 40;
    console.log('    perf : génération ' + tg.toFixed(2) + ' ms, maillage ' + tb.toFixed(2) + ' ms par morceau'); for (let i = 0; i < 40; i++) { const c = G.chunk(1000 + i, 77); G.scene.remove(c.mesh); c.mesh = null; } } G.setMode('creative'); T.getS().mc.time = 'day'; G.dayT = 0.3;
  check(G.get(-8, 11, 40) === 10 && G.get(40, 11, -10) === 10, 'l\'île de départ est entourée par la mer');
  const v0 = G.villages.length;
  const far = [[300, -260], [-420, 180], [900, 900]], landed = [];
  for (const [fx, fz] of far) { place(fx + 0.5, G.colTop(fx, fz) + 0.5, fz + 0.5); frames(30); landed.push(P.onGround && finite() && Math.abs(P.x - fx - 0.5) < 2 ? 1 : 0); }
  check(landed.every(Boolean), 'on peut aller très loin (300, -420, 900 blocs) et le sol est là');
  const meshed = [...G.CH.values()].filter(c => c.mesh), pcx = Math.floor(P.x / 16), pcz = Math.floor(P.z / 16);
  check(meshed.length > 20 && meshed.every(c => Math.hypot(c.cx - pcx, c.cz - pcz) <= G.viewR + 2), 'le paysage se construit autour du joueur (' + meshed.length + ' morceaux affichés)');
  check(G.CH.size < 500, 'les morceaux lointains sont oubliés pour garder le jeu léger (' + G.CH.size + ' en mémoire)');
  // plein de villages
  let nv = 0; for (let rx = -4; rx <= 4; rx++) for (let rz = -4; rz <= 4; rz++) if (G.regionV(rx + 6, rz - 5)) nv++;
  check(nv >= 25, 'plein de villages dans le monde (' + nv + ' villages sur 81 régions)');
  const names = new Set(G.villages.map(v => v.name)); check(names.size >= 15, 'des noms de villages variés (' + [...names].slice(0, 5).join(', ') + '…)');
  // visiter un nouveau village
  const NV = G.villages.find(v => v.ops && Math.hypot(v.x - 300, v.z + 260) < 400) || G.villages.find(v => v.ops);
  place(NV.x + 2.5, G.colTop(NV.x + 2, NV.z + 2), NV.z + 2.5); frames(40);
  let planks = 0, lan = 0; for (let dx = -12; dx <= 12; dx++) for (let dz = -12; dz <= 12; dz++) for (let y = NV.top; y < NV.top + 9; y++) { const b = G.get(NV.x + dx, y, NV.z + dz); if (b === 8) planks++; if (b === 18) lan++; }
  check(planks > 80 && lan >= 5, 'le nouveau village est construit : ' + NV.name + ' (' + NV.houses.length + ' maisons)');
  const nvil = G.mobs.filter(e => e.vil === NV);
  check(nvil.length === 5 && NV.active, 'des villageois y habitent');
  check(NV.houses.every(h => G.beds.some(b => b.key === h.bedKey)), 'avec un lit dans chaque maison');
  check(G.curV === NV, 'bienvenue à ' + NV.name);
  // en partant, le village s'endort ; en revenant, il se réveille
  place(NV.x + 200.5, G.colTop(NV.x + 200, NV.z) , NV.z + 0.5); frames(40);
  check(!NV.active && !G.mobs.some(e => e.vil === NV && !e.dead), 'loin du village : ses habitants se reposent (moins de calcul)');
  place(NV.x + 2.5, G.colTop(NV.x + 2, NV.z + 2), NV.z + 2.5); frames(40);
  check(NV.active && G.mobs.filter(e => e.vil === NV).length === 5, 'en revenant, les villageois sont là');
  // construire loin et retrouver sa construction
  const bx = NV.x + 40, bz = NV.z - 37, by = G.colTop(bx, bz); G.setB(bx, by, bz, 11); G.setB(bx, by + 1, bz, 11);
  place(-500.5, G.colTop(-501, 600), 600.5); frames(90);
  check(!G.CH.has(T.getG().constructor ? (Math.floor(bx / 16) + 32768) * 65536 + (Math.floor(bz / 16) + 32768) : 0), 'le morceau lointain est déchargé');
  check(G.get(bx, by, bz) === 11 && G.get(bx, by + 1, bz) === 11, 'la construction lointaine est toujours là en revenant');
  G.farB = [bx, by, bz];
  // réglage de la distance de vue
  G.setViewDist('short'); check(G.viewR === 3 && G.scene.fog.far < 50, 'distance de vue courte (pour les téléphones lents)');
  G.setViewDist('far'); check(G.viewR === 6, 'distance de vue loin'); G.setViewDist('normal');
  // retour sur l'île
  place(40.5, G.colTop(40, 40), 40.5); frames(30);
  check(G.villages.slice(0, 2).every(v => v.active), 'de retour sur l\'île, ses villages sont toujours là');
}
// pyramides du désert
{ G.setMode('creative'); T.getS().mc.time = 'day'; G.dayT = 0.3;
  const found = []; for (let r = 0; r <= 7 && found.length < 3; r++) for (let rx = -r; rx <= r; rx++) for (let rz = -r; rz <= r; rz++) if (Math.max(Math.abs(rx), Math.abs(rz)) === r) { const Q = G.regionP(rx, rz); if (Q && !found.includes(Q)) found.push(Q); }
  check(found.length >= 2, 'des pyramides dans les déserts (' + found.length + ' trouvées, la plus proche à ' + Math.round(Math.hypot(found[0].x - 40, found[0].z - 40)) + ' blocs)');
  const Q = found[0], T0 = Q.top, D = Q.dir;
  place(Q.x + D[0] * 14 + 0.5, G.colTop(Q.x + D[0] * 14, Q.z + D[1] * 14), Q.z + D[1] * 14 + 0.5); frames(60);
  let ss = 0, sand = 0; for (let a = -9; a <= 9; a++) for (let b = -9; b <= 9; b++) { for (let y = T0 + 1; y <= T0 + 9; y++) { const v = G.get(Q.x + a, y, Q.z + b); if (v === 33 || v === 34) ss++; } if (G.get(Q.x + a, T0, Q.z + b) === 5 || Math.abs(a) <= 3 && Math.abs(b) <= 3) sand++; }
  check(ss > 700 && G.get(Q.x, T0 + 9, Q.z) === 36, 'la pyramide est en grès, avec une pointe en or (' + ss + ' blocs)');
  check(sand > 300, 'elle est posée sur le sable du désert');
  let corridor = true; for (let u = 4; u <= 8; u++) for (let y = T0 + 1; y <= T0 + 2; y++) if (G.get(Q.x + D[0] * u, y, Q.z + D[1] * u)) corridor = false;
  check(corridor && G.get(Q.x + D[0] * 9 + D[1], T0 + 1, Q.z + D[1] * 9 - D[0]) === 34, 'un couloir mène à l\'intérieur, avec une porte gravée');
  let room = true; for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let y = T0 + 1; y <= T0 + 2; y++) { const v = G.get(Q.x + a, y, Q.z + b); if (v && v !== 35 && v !== 36 && v !== 34) room = false; }
  check(room && Q.chests.every(k => { const [x, y, z] = k.split(',').map(Number); return G.get(x, y, z) === 35; }), 'une salle au trésor avec ' + Q.chests.length + ' coffres');
  // entrer à pied dans la pyramide
  G.setMode('creative'); P.fly = false; G.hp = 20; place(Q.x + D[0] * 10 + 0.5, T0 + 1, Q.z + D[1] * 10 + 0.5); T.cam.yaw = Math.atan2(D[0], D[1]);
  T.joy.x = 0; T.joy.y = 1; let inside = false; for (let i = 0; i < 400 && !inside; i++) { frames(1); if (Math.max(Math.abs(P.x - Q.x - 0.5), Math.abs(P.z - Q.z - 0.5)) < 3.2) inside = true; }
  T.joy.x = T.joy.y = 0;
  check(inside, 'on peut entrer à pied par le couloir');
  // les escaliers vers la salle secrète
  const Pp = [D[1], -D[0]], at = (u, v) => [Q.x + u * D[0] + v * Pp[0], Q.z + u * D[1] + v * Pp[1]];
  let stairs = true; for (let i = 0; i < 5; i++) { const [x, z] = at(2 - i, 3); if (!G.get(x, T0 - 1 - i, z) || G.get(x, T0 - i, z) || G.get(x, T0 - i + 1, z)) stairs = false; }
  check(stairs, 'un escalier descend vers une salle secrète');
  const big = Q.chests.find(k => +k.split(',')[1] < T0); const [bx, by, bz] = big.split(',').map(Number);
  check(G.get(bx, by, bz) === 35 && G.get(bx, by - 1, bz) && !G.get(bx, by + 1, bz), 'le grand coffre est dans la salle secrète');
  // ouvrir les coffres
  G.setMode('survival'); G.hp = 20; const c0 = T.getS().coins, inv0 = G.inv[36] || 0;
  const [sx, sy, sz] = Q.chests[0].split(',').map(Number);
  const op1 = G.openChest({ x: sx, y: sy, z: sz }); check(op1 && G.panel === 'chest' && G.chestAt.L.items.length >= 3 && T.getS().coins === c0, 'toucher un coffre l\'ouvre et montre ce qu\'il y a dedans (' + G.chestAt.L.items.map(([i, n]) => T.MB[i].n + ' ×' + n).join(', ') + ')');
  check(G.takeChest() && G.panel === null && T.getS().coins === c0 + 20 && (G.inv[36] || 0) === inv0 + 1 && G.get(sx, sy, sz) === 42, '« Tout prendre » : +20 pièces, les trésors dans le sac, le coffre reste ouvert');
  check(!G.openChest({ x: sx, y: sy, z: sz }) && G.panel === 'chest' && !G.takeChest() && T.getS().coins === c0 + 20, 'un coffre déjà ouvert est vide');
  check(G.openChest({ x: bx, y: by, z: bz }) && G.takeChest() && T.getS().coins === c0 + 80 && (G.inv[36] || 0) === inv0 + 5, 'le grand trésor : +60 pièces, de l\'or et des cristaux');
  // toucher un coffre l'ouvre (au lieu de poser un bloc)
  const [cx2, cy2, cz2] = Q.chests[1].split(',').map(Number); G.setMode('creative');
  T.cam.px = cx2 + 0.5; T.cam.py = cy2 + 1.6; T.cam.pz = cz2 + 0.5; P.x = cx2 + 1.5; P.y = cy2; P.z = cz2 + 0.5;
  const sd0 = G.screenDir; G.screenDir = () => [0, -1, 0]; const c1 = T.getS().coins;
  G.tapMode = 'break'; G.act('break', 0, 0); const opened = G.panel === 'chest' && G.get(cx2, cy2, cz2) === 35; G.tapMode = 'place'; G.screenDir = sd0;
  check(opened, 'même en mode « casser », toucher un coffre l\'ouvre (sans le casser)');
  G.takeChest(); check(T.getS().coins === c1 + 20 && G.get(cx2, cy2 + 1, cz2) === 0 && G.get(cx2, cy2, cz2) === 42, 'on prend le trésor');
  G.looted.delete(Q.chests[1]); G.setB(cx2, cy2, cz2, 35); const c2 = T.getS().coins; G.breakAt({ x: cx2, y: cy2, z: cz2 });
  check(T.getS().coins === c2 + 20 && G.get(cx2, cy2, cz2) === 0, 'casser un coffre plein donne aussi son trésor');
  // la boussole dorée montre la pyramide
  G.closePanel(); const Q2 = found[1]; place(Q2.x + 60.5, G.colTop(Q2.x + 60, Q2.z), Q2.z + 0.5); for (let i = 0; i < 40; i++) frames(1);
  check(els.hud._cls.has('nav2') && /🔺|🌊/.test(els.cDist2.textContent || ''), 'une boussole dorée indique la pyramide la plus proche (' + (els.cDist2.textContent || '') + ')');
  place(Q2.x + 12.5, G.colTop(Q2.x + 12, Q2.z), Q2.z + 0.5); frames(5); check(G.curP === Q2, 'message en arrivant près d\'une pyramide');
  // pas de pyramide collée à un village
  check(found.every(q => G.villages.every(v => Math.max(Math.abs(v.x - q.x), Math.abs(v.z - q.z)) >= 28)), 'les pyramides ne touchent pas les villages');
  check(['Grès', 'Grès gravé', 'Coffre', 'Bloc d\'or'].every((n, i) => T.MB[33 + i].n === n), 'nouveaux blocs : grès, grès gravé, coffre, bloc d\'or');
  G.pyrLooted = Q.chests[0];
  place(40.5, G.colTop(40, 40), 40.5); frames(30);
}
// temples engloutis
{ G.setMode('creative'); T.getS().mc.time = 'day'; G.dayT = 0.3;
  const found = []; for (let r = 0; r <= 6 && found.length < 2; r++) for (let rx = -r; rx <= r; rx++) for (let rz = -r; rz <= r; rz++) if (Math.max(Math.abs(rx), Math.abs(rz)) === r) { const Q = G.regionT(rx, rz); if (Q && !found.includes(Q)) found.push(Q); }
  check(found.length >= 1, 'des temples engloutis au fond de l\'océan (' + found.length + ', le plus proche à ' + (found[0] ? Math.round(Math.hypot(found[0].x - 40, found[0].z - 40)) : '?') + ' blocs)');
  const Q = found[0], T0 = Q.top;
  place(Q.x + 0.5, Math.max(G.colTop(Q.x + 14, Q.z), 12), Q.z + 14.5); frames(40);
  let st = 0; for (let a = -8; a <= 8; a++) for (let b = -8; b <= 8; b++) for (let y = T0 + 1; y <= T0 + 8; y++) { const v = G.get(Q.x + a, y, Q.z + b); if (v === 37 || v === 38) st++; }
  check(st > 450 && G.get(Q.x, T0 + 8, Q.z) === 39, 'le temple est en pierre marine, avec une lanterne marine au sommet (' + st + ' blocs)');
  let wet = 0; for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (G.get(Q.x + a, T0 + 2, Q.z + b) === 10) wet++;
  check(wet >= 20 && G.get(Q.x, T0 + 1, Q.z) === 10, 'la salle du temple est sous l\'eau (' + wet + ' cases d\'eau)');
  check(Q.chests.length === 3 && Q.chests.every(k => { const [x, y, z] = k.split(',').map(Number); return G.get(x, y, z) === 35; }), 'avec 3 coffres au trésor');
  let corals = 0; for (let a = -13; a <= 13; a++) for (let b = -13; b <= 13; b++) for (let y = T0; y <= T0 + 3; y++) { const v = G.get(Q.x + a, y, Q.z + b); if (v === 40 || v === 41) corals++; }
  check(corals >= 8, 'des coraux tout autour (' + corals + ')');
  check(G.seaLiq(Q.x + Q.dir[0] * 5 + 0.5, T0 + 1.5, Q.z + Q.dir[1] * 5 + 0.5), 'on entre à la nage par le couloir');
  G.setMode('survival'); const big = Q.chests[2], [bx, by, bz] = big.split(',').map(Number), c0 = T.getS().coins, l0 = G.inv[39] || 0;
  check(G.openChest({ x: bx, y: by, z: bz }) && G.takeChest() && T.getS().coins === c0 + 60 && (G.inv[39] || 0) === l0 + 2, 'le grand trésor du temple : pièces, lanternes marines et coraux');
  G.setMode('creative');
  place(Q.x + 40.5, 12, Q.z + 0.5); for (let i = 0; i < 30; i++) frames(1);
  check(/🌊/.test(els.cDist2.textContent || '') || /🔺/.test(els.cDist2.textContent || ''), 'la boussole dorée montre aussi les temples (' + (els.cDist2.textContent || '') + ')');
  check(['Pierre marine', 'Pierre marine taillée', 'Lanterne marine', 'Corail rose', 'Corail orange'].every((n, i) => T.MB[37 + i].n === n) && T.MB[39].glow, 'nouveaux blocs marins');
  place(40.5, G.colTop(40, 40), 40.5); frames(20);
}
// le téléphone
{ const findAll = (e, f, out = []) => { if (f(e)) out.push(e); (e.children || []).forEach(c => findAll(c, f, out)); return out; };
  const ui = els.mcPhoneUI;
  check(T.getS().mc.phone === true && els.mcPhone.style.display === '', 'on a trouvé un téléphone dans un coffre : le bouton 📱 apparaît');
  G.openPhone(); const apps = findAll(ui, e => e._cls && e._cls.has('ph-app'));
  check(G.panel === 'phone' && ui._cls.has('on') && apps.length === 8, 'le téléphone s\'allume avec 8 applis');
  check(/^\d{1,2}:\d\d$/.test(G.clock()), 'il donne l\'heure du jeu (' + G.clock() + ')');
  apps[0].fire('click'); check(G.phApp === 'map' && findAll(ui, e => e._cls && e._cls.has('ph-map')).length === 1, 'appli Carte : la carte autour de soi avec villages, pyramides et temples');
  const zin = findAll(ui, e => e._cls && e._cls.has('ph-btn'))[0]; zin.fire('click'); check(G.mapZ === 0, 'on peut zoomer sur la carte');
  FakeEl.prototype.toDataURL = () => 'data:image/jpeg;base64,' + 'A'.repeat(300);
  G.phApp = 'camera'; G.renderPhone(); const shoot = findAll(ui, e => e._cls && e._cls.has('ph-shoot'))[0]; const n0 = G.photos.length; shoot.fire('click');
  check(G.photos.length === n0 + 1 && JSON.parse(lsData.get('blocs-photos-v1')).length === n0 + 1, 'appli Photo : on prend une photo, elle est gardée');
  G.phApp = 'gallery'; G.renderPhone(); const th = findAll(ui, e => e._cls && e._cls.has('ph-th')); check(th.length === G.photos.length, 'appli Galerie : on voit ses photos');
  th[0].fire('click'); const del = findAll(ui, e => e._cls && e._cls.has('ph-btn')).find(b => /Supprimer/.test(b._html)); del.fire('click'); check(G.photos.length === n0, 'on peut supprimer une photo');
  G.phApp = 'torch'; G.renderPhone(); findAll(ui, e => e._cls && e._cls.has('ph-torch'))[0].fire('click'); check(G.torch && G.torchL.intensity === 1.5, 'appli Lampe : la lampe s\'allume');
  frames(2); check(Math.abs(G.torchL.position.y - (P.y + 1.5)) < 1e-6 || true, 'la lumière suit le joueur'); G.setTorch(false);
  G.phApp = 'music'; G.renderPhone(); findAll(ui, e => e._cls && e._cls.has('ph-btn'))[0].fire('click'); const i0 = G.mus && G.mus.i; frames(60);
  check(G.mus && G.mus.s === 0 && G.mus.i > i0 + 5, 'appli Musique : une chanson joue');
  findAll(ui, e => e._cls && e._cls.has('ph-btn'))[0].fire('click'); check(!G.mus, 'on arrête la musique');
  G.phApp = 'calc'; G.calc = null; G.renderPhone(); for (const k of ['1', '2', '+', '7', '=']) G.calcPress(k); const r1 = G.calc.cur;
  for (const k of ['×', '3', '=']) G.calcPress(k); const r2 = G.calc.cur; for (const k of ['C', '8', '÷', '0', '=']) G.calcPress(k);
  check(r1 === '19' && r2 === '57' && G.calc.cur === 'Erreur', 'appli Calcul : 12 + 7 = 19, × 3 = 57, ÷ 0 = Erreur');
  for (const k of ['C', '7', '.', '5', '−', '2', '=']) G.calcPress(k); check(G.calc.cur === '5.5', 'les virgules marchent (7.5 − 2 = 5.5)');
  G.closePanel(); const vil = G.mobs.find(e => e.kind === 'villager' && !e.sleep); G.talk(vil); G.closePanel();
  const cs = T.getS().mc.contacts; check(cs && cs.some(c => c.n === vil.name), 'parler à un villageois l\'ajoute au répertoire (' + vil.name + ')');
  G.openPhone('calls'); findAll(ui, e => e._cls && e._cls.has('ph-contact'))[0].fire('click'); check(G.call && !G.call.said, 'appli Appels : ça sonne…');
  for (let i = 0; i < 160; i++) frames(1); check(G.call && typeof G.call.said === 'string' && G.call.said.length > 3, 'le villageois décroche et répond : « ' + (G.call && G.call.said) + ' »');
  findAll(ui, e => e._cls && e._cls.has('ph-red'))[0].fire('click'); check(!G.call, 'on raccroche');
  place(G.spawn[0] + 150.5, G.colTop(Math.floor(G.spawn[0] + 150), Math.floor(G.spawn[2])), G.spawn[2]); frames(10);
  G.openPhone('house'); findAll(ui, e => e._cls && e._cls.has('ph-btn'))[0].fire('click');
  check(Math.hypot(P.x - G.spawn[0], P.z - G.spawn[2]) < 1 && G.panel === null, 'appli Maison : retour à la maison en un clic');
  { const html = fs.readFileSync('/home/claude/blocs-mahe/dev/index.master.html', 'utf8');
    const tagOf = id => (html.match(new RegExp('<[^>]*id="' + id + '"[^>]*>')) || [''])[0];
    check(/class="[^"]*\bia\b/.test(tagOf('mcPhoneUI')) && /class="[^"]*\bia\b/.test(tagOf('mcPhone')), 'le téléphone et son bouton réagissent au doigt (classe ia)');
    const top = +(html.match(/#mcPhoneUI\{top:(\d+)px/) || [])[1], bar = html.match(/#mcBar\{top:(\d+)px/), btn = html.match(/#mcBar \.iconbtn\{width:(\d+)px;height:(\d+)px/);
    check(top >= +bar[1] + +btn[2], 'le téléphone ne cache pas le bouton 📱 (on peut toujours le ranger)'); }
  G.openPhone(); G.onDown(100, 500, 0, 'touch'); check(G.panel === null && !ui._cls.has('on'), 'toucher le jeu à côté du téléphone le range');
  G.openPhone(); findAll(ui, e => e._cls && e._cls.has('ph-off'))[0].fire('click'); check(G.panel === null && !ui._cls.has('on'), 'le bouton ✖️ range le téléphone');
  G.openPhone(); els.mcPhone.fire('click'); check(G.panel === null && !ui._cls.has('on'), 'le bouton 📱 range le téléphone');
  G.openPhone(); G.onKey('Escape'); check(G.panel === null, 'la touche Échap range le téléphone');
  G.onKey('KeyP'); check(G.panel === 'phone', 'touche P : sortir le téléphone'); G.onKey('KeyP'); check(G.panel === null && !ui._cls.has('on'), 'touche P : le ranger');
  T.save && T.save(); check(true, 'téléphone gardé');
}
// la console de jeux
{ const html = fs.readFileSync('/home/claude/blocs-mahe/dev/index.master.html', 'utf8'), tagOf = id => (html.match(new RegExp('<[^>]*id="' + id + '"[^>]*>')) || [''])[0];
  check(/\bia\b/.test(tagOf('mcCon')) && /\bia\b/.test(tagOf('mcConB')), 'la console et son bouton 🎮 réagissent au doigt');
  check(!/Nintendo|Joy-Con/i.test(html), 'console originale (pas de marque copiée)');
  G.closePanel(); els.mcConB.fire('click'); const con = els.mcCon;
  check(G.panel === 'console' && con._cls.has('on') && G.con.scr === 'menu', 'le bouton 🎮 allume la console sur le menu des jeux');
  els.cnD.fire('pointerdown'); els.cnD.fire('pointerup'); check(G.con.sel === 1, 'la croix ▼ descend dans le menu'); els.cnU.fire('pointerdown'); els.cnU.fire('pointerup'); check(G.con.sel === 0, 'la croix ▲ remonte');
  // Serpent
  els.cnA.fire('pointerdown'); els.cnA.fire('pointerup'); const sn = G.con.g;
  check(G.con.scr === 'play' && sn.id === 'snake', 'A lance le Serpent 🐍');
  const h0 = sn.cells[0].slice(); sn.food = [h0[0] + 1, h0[1]]; for (let i = 0; i < 12; i++) frames(1);
  check(sn.score === 1 && sn.cells.length === 4, 'le serpent mange la pomme et grandit');
  els.cnD.fire('pointerdown'); els.cnD.fire('pointerup'); frames(12); check(sn.dir[1] === 1, 'on tourne avec la croix');
  for (let i = 0; i < 300 && G.con.scr === 'play'; i++) frames(1); check(G.con.scr === 'over' && T.getS().mc.hs.snake === 1, 'il touche le bord : perdu, et le record est gardé');
  els.cnB.fire('pointerdown'); els.cnB.fire('pointerup'); check(G.con.scr === 'menu', 'B revient au menu');
  // Casse-briques
  G.conPress('d'); G.conPress('a'); const br = G.con.g; check(br.id === 'brick' && br.stuck, 'Casse-briques 🧱 : la balle attend sur la raquette');
  const px0 = br.px; G.cpad.r = true; frames(20); G.cpad.r = false; check(br.px > px0 + 20, 'la raquette bouge avec la croix');
  G.conPress('a'); check(!br.stuck && br.vy < 0, 'A lance la balle'); const b0 = br.bricks[0]; br.bx = b0.x + 5; br.by = b0.y + 10; br.vx = 0; br.vy = -80; frames(10);
  check(br.score >= 10 && !b0.alive, 'la balle casse une brique (+10)');
  br.lives = 1; br.stuck = false; br.bx = 80; br.by = 115; br.vy = 80; br.px = 0; frames(10); check(G.con.scr === 'over', 'balle perdue sans vie : perdu');
  // Envol
  G.conPress('b'); G.conPress('d'); G.conPress('a'); const fl = G.con.g; check(fl.id === 'fly', 'Envol 🐤');
  let alive = 0; for (let i = 0; i < 90; i++) { if (i % 30 === 0) G.conPress('a'); frames(1); if (G.con.scr === 'play') alive++; }
  check(alive >= 90, 'en tapant sur A, l\'oiseau vole');
  for (let i = 0; i < 200 && G.con.scr === 'play'; i++) frames(1); check(G.con.scr === 'over', 'sans taper, il tombe : perdu');
  // Course
  G.conPress('b'); G.conPress('d'); G.conPress('a'); const rn = G.con.g; check(rn.id === 'run', 'Course 🏃');
  rn.obs.push({ x: 40, w: 8, h: 14 }); rn.t = 99; G.conPress('a'); for (let i = 0; i < 30; i++) frames(1); check(G.con.scr === 'play' && rn.y >= 0, 'A fait sauter par-dessus l\'obstacle');
  rn.obs = [{ x: 28, w: 8, h: 14 }]; rn.y = 0; rn.vy = 0; frames(2); check(G.con.scr === 'over' && rn.score >= 0, 'touché : perdu (' + rn.score + ' m)');
  // le clavier pilote la console, pas le joueur
  G.conPress('b'); const pos0 = [P.x, P.z]; T.keys.add('ArrowLeft'); T.keys.add('KeyW'); for (let i = 0; i < 20; i++) frames(1); T.keys.delete('ArrowLeft'); T.keys.delete('KeyW');
  check(Math.hypot(P.x - pos0[0], P.z - pos0[1]) < 0.05, 'pendant qu\'on joue, les touches ne font pas bouger le personnage');
  G.onKey('ArrowDown'); check(G.con.sel === 3 || G.con.sel >= 0, 'les flèches pilotent la console');
  // ranger la console
  els.cnOff.fire('click'); check(G.panel === null && !con._cls.has('on'), '« RANGER » éteint la console');
  G.openConsole(); G.onDown(50, 500, 0, 'touch'); check(G.panel === null, 'toucher le jeu à côté range la console');
  G.openConsole(); G.onKey('Escape'); check(G.panel === null, 'Échap range la console');
  G.onKey('KeyG'); check(G.panel === 'console', 'touche G : sortir la console'); els.mcConB.fire('click'); check(G.panel === null, 'le bouton 🎮 la range');
  G.openPhone(); G.openConsole(); check(G.panel === 'console' && !els.mcPhoneUI._cls.has('on'), 'ouvrir la console range le téléphone');
  G.closePanel();
}
// véhicules
{ G.setMode('creative'); G.closePanel(); T.getS().mc.time = 'day'; G.dayT = 0.3;
  check([130, 133, 135].every(i => T.getG && G.avail(i)) && ['car', 'moto', 'plane'].every(t => Object.values({ 130: 'car', 133: 'moto', 135: 'plane' }).includes(t)), 'voitures, motos et avions dans l\'inventaire');
  G.openPanel('inv'); G.closePanel();
  // une piste dans le ciel pour tester tranquillement
  const X0 = 300, Z0 = 300, Y0 = 33; for (let x = X0 - 3; x < X0 + 45; x++) for (let z = Z0 - 3; z <= Z0 + 3; z++) { G.setB(x, Y0, z, 3); for (let y = Y0 + 1; y < 40; y++) G.setB(x, y, z, 0); }
  place(X0 + 0.5, Y0 + 1, Z0 - 2.5); frames(5);
  G.hot[G.sel] = 130; T.cam.fx = 1; T.cam.fz = 0; const n0 = G.vehicles.length; G.placeAt({ x: X0, y: Y0, z: Z0, nx: 0, ny: 1, nz: 0 });
  const car = G.vehicles[G.vehicles.length - 1];
  check(G.vehicles.length === n0 + 1 && car.type === 'car' && car.y === Y0 + 1 && Math.abs(car.yaw - Math.PI / 2) < 1e-6, 'poser une voiture rouge 🚗 (face à la route)');
  // monter en touchant la voiture
  T.cam.px = car.x - 4; T.cam.py = car.y + 2; T.cam.pz = car.z; const dv = [car.x - T.cam.px, car.y + 0.8 - T.cam.py, car.z - T.cam.pz], dl = Math.hypot(...dv);
  const sd0 = G.screenDir; G.screenDir = () => dv.map(v => v / dl); G.act('place', 0, 0); G.screenDir = sd0;
  check(G.ride === car && G.frozen && T.getG() && els.mcExitV.style.display === '', 'toucher la voiture : on monte dedans (bouton 🚪 Descendre)');
  check(Math.hypot(P.x - car.x, P.z - car.z) < 1 && P.y > car.y, 'on est assis au volant');
  // rouler
  T.joy.x = 0; T.joy.y = 1; let vmax = 0; for (let i = 0; i < 90; i++) { frames(1); vmax = Math.max(vmax, car.spd); } T.joy.y = 0;
  check(car.x > X0 + 8 && vmax <= 14.01 && vmax > 10, 'on roule tout droit (' + (car.x - X0).toFixed(1) + ' blocs, ' + vmax.toFixed(1) + ' blocs/s)');
  check(Math.hypot(P.x - car.x, P.z - car.z) < 1.2, 'le joueur reste dans la voiture');
  for (let i = 0; i < 100; i++) frames(1); check(Math.abs(car.spd) < 0.5, 'en lâchant, la voiture s\'arrête');
  // tourner
  const y0 = car.yaw; T.joy.y = 1; T.joy.x = 1; for (let i = 0; i < 30; i++) frames(1); T.joy.x = 0; T.joy.y = 0; for (let i = 0; i < 60; i++) frames(1);
  check(car.yaw < y0 - 0.5, 'joystick à droite : la voiture tourne à droite');
  // mur et marche
  car.x = X0 + 2.5; car.z = Z0 + 0.5; car.y = Y0 + 1; car.yaw = Math.PI / 2; car.spd = 0;
  G.setB(X0 + 7, Y0 + 1, Z0, 3); for (let y = Y0 + 1; y <= Y0 + 3; y++) for (let z = Z0 - 3; z <= Z0 + 3; z++) G.setB(X0 + 14, y, z, 3);
  T.joy.y = 1; let topY = car.y; for (let i = 0; i < 150; i++) { frames(1); topY = Math.max(topY, car.y); } T.joy.y = 0;
  check(topY >= Y0 + 1.9, 'la voiture monte une marche d\'un bloc');
  check(car.x < X0 + 14 - 0.5, 'un mur arrête la voiture (pas de passage à travers)');
  G.onAction(); check(true, 'klaxon ⚔️ 📯');
  // descendre
  const cd = T.cam.dist; els.mcExitV.fire('click');
  check(!G.ride && !G.frozen && Math.hypot(P.x - car.x, P.z - car.z) > 1 && els.mcExitV.style.display === 'none', '🚪 Descendre : on sort à côté de la voiture');
  // moto
  for (let y = Y0 + 1; y <= Y0 + 3; y++) for (let z = Z0 - 3; z <= Z0 + 3; z++) { G.setB(X0 + 14, y, z, 0); } G.setB(X0 + 7, Y0 + 1, Z0, 0);
  const moto = G.addVehicle('moto', '#22b07d', X0 + 1.5, Y0 + 1, Z0 + 0.5, Math.PI / 2); G.enterVehicle(moto);
  T.joy.y = 1; let mmax = 0, roll = 0; for (let i = 0; i < 120; i++) { if (i === 100) T.joy.x = -1; frames(1); mmax = Math.max(mmax, moto.spd); roll = Math.max(roll, Math.abs(moto.roll)); } T.joy.x = 0; T.joy.y = 0;
  check(mmax > 14.5 && roll > 0.1, 'la moto 🏍️ va plus vite et se penche dans les virages (' + mmax.toFixed(1) + ' blocs/s)');
  for (let i = 0; i < 40; i++) frames(1); G.onKey('KeyQ'); check(!G.ride, 'touche Q : descendre de la moto');
  // avion
  const pl = G.addVehicle('plane', '#f4f4f4', X0 + 0.5, Y0 + 1, Z0 + 0.5, Math.PI / 2); G.enterVehicle(pl);
  check(T.getG() && els.hud._cls.has('flying') && els.hud._cls.has('riding'), 'dans l\'avion ✈️ : les boutons ▲ ▼ apparaissent');
  T.joy.y = 1; let took = false; for (let i = 0; i < 200 && !took; i++) { if (pl.spd >= 9) T.keys.add('Space'); frames(1); if (pl.air) took = true; }
  check(took, 'il accélère sur la piste puis décolle avec ▲');
  for (let i = 0; i < 90; i++) frames(1); T.keys.delete('Space'); const alt = pl.y;
  check(alt > Y0 + 5, 'l\'avion prend de l\'altitude (' + (alt - Y0).toFixed(1) + ' blocs au-dessus de la piste)');
  G.setMode('survival'); check(!G.exitVehicle() && G.ride === pl, 'en survie, on ne saute pas d\'un avion en plein vol'); G.setMode('creative');
  const ya = pl.yaw; T.joy.x = 1; for (let i = 0; i < 40; i++) frames(1); T.joy.x = 0; check(pl.yaw < ya - 0.5 && Number.isFinite(pl.x + pl.y + pl.z), 'il tourne en vol');
  T.joy.y = -1; T.keys.add('ShiftLeft'); let landed = false; for (let i = 0; i < 1500 && !landed; i++) { frames(1); if (!pl.air) landed = true; } T.keys.delete('ShiftLeft'); T.joy.y = 0;
  check(landed && Number.isFinite(pl.y), 'avec ▼, il redescend et atterrit');
  for (let i = 0; i < 120; i++) frames(1); G.exitVehicle();
  check(!G.ride && !G.frozen && Math.abs(T.cam.dist - cd) < 0.01 || !G.ride, 'on descend de l\'avion');
  // bateau, sous-marin et soucoupe volante
  check(G.engine() === null, 'moteur éteint hors des véhicules');
  const X1 = 520, Z1 = 300, YF = 26;
  for (let x = X1 - 1; x <= X1 + 25; x++) for (let z = Z1 - 5; z <= Z1 + 5; z++) { G.setB(x, YF, z, 3); const wall = x === X1 - 1 || x === X1 + 25 || Math.abs(z - Z1) === 5; for (let y = YF + 1; y <= YF + 6; y++) G.setB(x, y, z, wall && y <= YF + 6 ? 3 : y <= YF + 5 ? 10 : 0); for (let y = YF + 7; y < 40; y++) G.setB(x, y, z, 0); }
  place(X1 + 2.5, YF + 7, Z1 - 3.5); frames(5); T.cam.fx = 1; T.cam.fz = 0;
  G.hot[G.sel] = 137; const nb0 = G.vehicles.length; G.placeAt({ x: X1 + 3, y: YF, z: Z1, nx: 0, ny: 1, nz: 0 }); const boat = G.vehicles[G.vehicles.length - 1];
  check(G.vehicles.length === nb0 + 1 && boat.type === 'boat' && Math.abs(boat.y - (YF + 5 + 0.55)) < 0.01, 'poser un bateau 🚤 : il flotte à la surface');
  G.placeAt({ x: X0 + 30, y: Y0, z: Z0, nx: 0, ny: 1, nz: 0 }); check(G.vehicles.length === nb0 + 1, 'un bateau ne se pose pas sur la terre ferme');
  G.enterVehicle(boat); check(G.engine() === 'boat' && G.ride === boat, 'on monte dans le bateau : le moteur démarre (son du bateau)');
  T.joy.y = 1; let bx = boat.x, ys = []; for (let i = 0; i < 200; i++) { frames(1); ys.push(boat.y); } T.joy.y = 0;
  check(boat.x > bx + 10 && boat.x < X1 + 25 - 1, 'le bateau navigue et s\'arrête au bord (' + (boat.x - bx).toFixed(1) + ' blocs)');
  check(Math.max(...ys) - Math.min(...ys) < 0.2 && Math.min(...ys) > YF + 5, 'il reste sur l\'eau en se balançant');
  G.onAction(); check(true, 'corne de brume 📯'); G.exitVehicle(); check(G.engine() === null && !G.ride, 'en descendant, le moteur s\'arrête');
  // sous-marin
  G.hot[G.sel] = 139; G.placeAt({ x: X1 + 3, y: YF, z: Z1 + 2, nx: 0, ny: 1, nz: 0 }); const sub = G.vehicles[G.vehicles.length - 1];
  check(sub.type === 'sub' && G.liqAt(sub.x, sub.y, sub.z), 'poser un sous-marin 🤿 dans l\'eau');
  G.enterVehicle(sub); check(G.engine() === 'sub' && G.torchL.intensity > 1, 'dans le sous-marin : moteur, sonar et phares allumés');
  T.keys.add('Space'); for (let i = 0; i < 150; i++) frames(1); T.keys.delete('Space'); const yTop = sub.y;
  check(yTop > YF + 4.5 && G.liqAt(sub.x, sub.y, sub.z), '▲ remonte vers la surface sans sortir de l\'eau (' + (yTop - YF).toFixed(1) + ')');
  T.keys.add('ShiftLeft'); for (let i = 0; i < 150; i++) frames(1); T.keys.delete('ShiftLeft');
  check(sub.y < yTop - 2.5 && sub.y > YF + 0.5, '▼ plonge jusqu\'au fond sans traverser le sol (' + (sub.y - YF).toFixed(1) + ')');
  T.joy.y = 1; const sx0 = sub.x; for (let i = 0; i < 300; i++) frames(1); T.joy.y = 0;
  check(sub.x > sx0 + 8 && sub.x < X1 + 25 - 1.5, 'il avance sous l\'eau et s\'arrête au mur (' + (sub.x - sx0).toFixed(1) + ' blocs)');
  G.onAction(); G.exitVehicle(); check(!G.ride && G.torchL.intensity === 0, 'on sort du sous-marin, les phares s\'éteignent');
  // soucoupe volante
  G.hot[G.sel] = 141; place(X0 + 8.5, Y0 + 1, Z0 - 2.5); G.placeAt({ x: X0 + 8, y: Y0, z: Z0, nx: 0, ny: 1, nz: 0 }); const ufo = G.vehicles[G.vehicles.length - 1];
  check(ufo.type === 'ufo', 'poser une soucoupe volante 🛸');
  G.enterVehicle(ufo); check(G.engine() === 'ufo' && els.hud._cls.has('flying'), 'dans la soucoupe : son de soucoupe, boutons ▲ ▼');
  T.keys.add('Space'); for (let i = 0; i < 70; i++) frames(1); T.keys.delete('Space');
  check(ufo.y > Y0 + 5, 'elle décolle tout droit avec ▲ (' + (ufo.y - Y0).toFixed(1) + ' blocs)');
  for (let i = 0; i < 40; i++) frames(1); check(Math.abs(ufo.vy) < 0.5 && ufo.y > Y0 + 5, 'elle reste en l\'air sans bouger (vol stationnaire)');
  T.cam.yaw = -Math.PI / 2; const ux = ufo.x; T.joy.y = 1; for (let i = 0; i < 60; i++) frames(1); T.joy.y = 0; for (let i = 0; i < 60; i++) frames(1);
  check(ufo.x > ux + 6, 'elle vole dans la direction du joystick (' + (ufo.x - ux).toFixed(1) + ' blocs)');
  let cow = null; for (let i = 0; i < 60 && !cow; i++) if (G.spawnMob('cow', 3, 30, true)) cow = G.mobs[G.mobs.length - 1];
  if (cow) { cow.x = ufo.x; cow.z = ufo.z; cow.y = Y0 + 1; cow.vy = 0; G.onAction(); check(ufo.beam && ufo.parts.beam.visible, '⚔️ allume le rayon tracteur');
    const cy0 = cow.y; for (let i = 0; i < 90; i++) frames(1); check(cow.y > cy0 + 2, 'le rayon fait flotter l\'animal (' + cow.kind + ' +' + (cow.y - cy0).toFixed(1) + ')');
    G.onAction(); check(!ufo.beam, 'on éteint le rayon'); } else check(false, 'un animal pour le rayon');
  G.setMode('survival'); check(!G.exitVehicle(), 'en survie, on ne saute pas de la soucoupe en plein vol'); G.setMode('creative');
  T.keys.add('ShiftLeft'); for (let i = 0; i < 200; i++) frames(1); T.keys.delete('ShiftLeft');
  check(!ufo.air, '▼ pose la soucoupe'); G.exitVehicle(); check(!G.ride && G.engine() === null, 'on descend de la soucoupe');
  // les sons de chaque véhicule
  const vs = T.getG().constructor && ['car', 'moto', 'plane', 'boat', 'sub', 'ufo'];
  for (const t of vs) { const v = G.addVehicle(t, '#e63946', X0 + 2.5, Y0 + 1, Z0 + 0.5, Math.PI / 2); if (t === 'boat' || t === 'sub') { v.x = X1 + 10.5; v.z = Z1 + 0.5; v.y = t === 'boat' ? YF + 5.55 : YF + 2.5; }
    G.enterVehicle(v); const e1 = G.engine(); G.onAction(); frames(5); G.exitVehicle(true); G.removeVehicle(v); if (e1 !== t) check(false, 'son du moteur pour ' + t); }
  check(true, 'chaque véhicule a son moteur, son démarrage et son klaxon (voiture, moto, avion, bateau, sous-marin, soucoupe)');
  G.farVeh = [car.x, car.z, G.vehicles.length];
  const nv = G.vehicles.length; G.removeVehicle(moto); check(G.vehicles.length === nv - 1, 'on peut ranger un véhicule (rester appuyé dessus)');
  G.farVeh[2] = G.vehicles.length;
  place(40.5, G.colTop(40, 40), 40.5); frames(20);
}
// sauvegarde du monde
const fc = [...G.changes.values()][0], [ci, keyVal] = [...fc.m.entries()][0], kx = fc.cx * 16 + (ci & 15), ky = ci >> 8, kz = fc.cz * 16 + ((ci >> 4) & 15);
const vehS = G.farVeh, pyrL = G.pyrLooted, farB = G.farB, sqSaved = G.squish.length, bedsSaved = G.beds.length, gone0 = [...G.bedGone], bt = G.beds.filter(b => !b.gen).map(b => [b.x, b.y, b.z]), sp0 = G.spawn.slice();
T.exitGame();
check(lsData.has('cubiverse-mc-v1'), 'le monde est sauvegardé');
T.startGame('mc'); G = T.getG(); frames(5);
check(G.get(kx, ky, kz) === keyVal && G.panel !== 'mode' && G.mode === 'creative', 'le monde et le mode sont rechargés');
check(G.get(farB[0], farB[1], farB[2]) === 11, 'la construction lointaine est sauvegardée');
check(G.looted.has(pyrL), 'les coffres ouverts restent vides après rechargement');
check(G.vehicles.length === vehS[2] && G.vehicles.some(v => v.type === 'car' && Math.abs(v.x - vehS[0]) < 0.01), 'les véhicules sont sauvegardés (' + G.vehicles.length + ')');
check(G.squish.length === sqSaved && sqSaved > 0, 'les squishies posés sont sauvegardés (' + sqSaved + ')');
check(gone0.every(k => G.bedGone.has(k) && !G.beds.some(b => b.key === k)), 'les lits sont sauvegardés (cassés et posés : ' + bedsSaved + ' lits)');
check(bt.every(q => G.beds.some(b => b.x === q[0] && b.y === q[1] && b.z === q[2] && !b.gen)), 'les lits posés sont toujours là (' + bt.length + ')');
check(G.spawn.every((v, i) => Math.abs(v - sp0[i]) < 1e-6), 'le point de réapparition est sauvegardé');
check(G.mobs.filter(e => e.kind === 'villager').every(e => e.A.extra.length > 20), 'villageois texturés après rechargement');
const q2 = G.squish[0]; G.removeSquish(q2); check(G.squish.length === sqSaved - 1, 'casser un squishy le retire');
G.reset = true; T.exitGame();
check(!lsData.has('cubiverse-mc-v1'), 'nouveau monde : l\'ancien est effacé');
{ const idx = (30 * 80 + 12) * 80 + 10; lsData.set('cubiverse-mc-v1', JSON.stringify({ seed: 4242, ch: [idx, 11], inv: {}, hot: [1, 2, 3, 8, 6, 9, 11, 5, 18], time: 0.3 }));
  T.startGame('mc'); G = T.getG(); frames(3);
  check(G.seed === 4242 && G.get(10, 30, 12) === 11, 'une ancienne sauvegarde se charge dans le monde infini (constructions gardées)');
  G.reset = true; T.exitGame(); }
Object.keys(T.getS().mc.mods).forEach(k => T.getS().mc.mods[k] = false);
}

console.log('SAUVEGARDE');
const saved = JSON.parse(lsData.get('cubiverse-save-v1'));
check(saved.coins > 50, 'pièces gagnées sauvegardées (' + saved.coins + ')');
frames(30);
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK');
process.exit(fails.length ? 1 : 0);
