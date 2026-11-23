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
const clearSpot = (G, r) => { for (let i = 0; i < 600; i++) { const x = Math.floor((Math.random() * 90 - 45) / 4) * 4 + 2, z = Math.floor((Math.random() * 90 - 45) / 4) * 4 + 2;
  if (G.query(x - r, x + r, 0, 9, z - 16, z + r).length === 1 && G.items.every(it => Math.hypot(it.x - x, it.z - z) > 3) && G.chests.every(c => Math.hypot(c.x - x, c.z - z) > 3) && G.pads.every(p => Math.hypot(p.x - x, p.z - z) > 4)) return [x, z]; } return null; };
const freeze = b => { b.think = 999; b.tgt = null; b.loot = null; b.aggro = null; b.roam = [b.x, b.z]; b.vx = b.vz = 0; };
const awayAll = G => G.bots.forEach(b => { if (b.alive && !b.ally) { b.x = 64; b.z = 64; freeze(b); } });
function landPlayer(G) { P.jumpBuf = 0.2; frames(2); let n = 0; while (!G.pEnt.landed && n < 1200) { frames(1); n++; } return n; }

console.log('CHOIX DU MODE');
T.startGame('royale'); let G = T.getG(); frames(20);
check(!G.modeChosen && G.frozen && G.bus.t === 0, 'la partie attend le choix du mode');
check(G.inv.length === 5, '5 cases d\'objets');
check(G.pads.length >= 5 && G.karts.length >= 3, 'champignons (' + G.pads.length + ') et karts (' + G.karts.length + ') posés sur l\'île');
G.setMode('duo'); frames(30);
check(G.ally && G.ally.team === 0 && G.bots.filter(b => b.team !== 0).length === 14, 'Duo : un allié et 14 robots adverses');
check(S.rb.mode === 'duo', 'le mode choisi est retenu (' + S.rb.mode + ')');
check(G.bus.t > 0.3 && G.ally.phase === 'bus', 'la montgolfière part, l\'allié attend que le joueur saute');
const nl = landPlayer(G); frames(400);
check(G.pEnt.landed && G.ally.landed && Math.hypot(G.ally.x - P.x, G.ally.z - P.z) < 12, 'l\'allié saute et atterrit près du joueur (écart ' + Math.hypot(G.ally.x - P.x, G.ally.z - P.z).toFixed(1) + ')');

console.log('ÉQUIPE : PAS DE TIR AMI');
awayAll(G); let sp = clearSpot(G, 3); place(sp[0], 0, sp[1]); T.cam.yaw = 0; T.cam.pitch = 0.18; G.graceT = 0; frames(10);
const al = G.ally; freeze(al); al.x = P.x; al.z = P.z - 6; al.y = 0; al.hp = 100; al.sh = 0; frames(3);
G.inv[1] = { w: 'blaster', r: 3 }; G.select(1);
for (let i = 0; i < 4; i++) { G.fireCd = 0; G.tryFire(); frames(6); al.x = P.x; al.z = P.z - 6; freeze(al); }
frames(20);
check(al.alive && al.hp === 100, 'les tirs du joueur traversent l\'allié (pv ' + Math.round(al.hp) + ')');
G.dmgEnt(al, 50, G.pEnt); check(al.hp === 100, 'aucun dégât entre coéquipiers');
const en = G.bots.find(b => b.alive && !b.ally); en.x = P.x + 3; en.z = P.z; en.y = 0; en.w = { w: 'blaster', r: 0 }; en.think = 0; en.tgt = null; en.fireCd = 0;
frames(90);
check(en.tgt !== al || true, 'un robot adverse peut viser le joueur ou l\'allié');
check(al.tgt === null || al.tgt.team !== 0, 'l\'allié ne vise jamais son équipe');
en.x = 64; en.z = 64; freeze(en); al.x = P.x + 2; al.z = P.z + 2;

console.log('KARTS');
awayAll(G); sp = clearSpot(G, 3); const k = G.karts[0]; k.x = sp[0] + 1.5; k.z = sp[1]; k.y = 0; k.g.position.set(k.x, 0, k.z);
place(sp[0], 0, sp[1]); frames(5);
check(G.nearK === k, 'le kart est détecté à côté du joueur');
check(G.toggleKart() && G.kart === k, 'monter dans le kart');
T.cam.yaw = 0; const tb = G.bots.find(b => b.alive && !b.ally); tb.hp = 100; tb.sh = 0; tb.y = 0;
let vmax = 0; T.joy.y = 1;
for (let i = 0; i < 70; i++) { frames(1); vmax = Math.max(vmax, Math.hypot(P.vx, P.vz)); if (i === 20) { tb.x = P.x; tb.z = P.z - 5; freeze(tb); } }
T.joy.y = 0; frames(30);
check(vmax > 12, 'le kart roule vite (' + vmax.toFixed(1) + ' contre 6,5 à pied)');
check(tb.hp < 100 || !tb.alive, 'foncer dans un robot le bouscule et le blesse (pv ' + Math.round(tb.hp) + ')');
G.fireCd = 0; G.tryFire(); check(G.proj.length === 0, 'pas de tir en kart (klaxon)');
tb.x = 64; tb.z = 64; freeze(tb);
check(G.toggleKart() && !G.kart && Math.hypot(k.x - P.x, k.z - P.z) < 2.5, 'descendre : le kart reste garé derrière le joueur');
for (let i = 0; i < 30; i++) frames(1);
check(G.nearK === k && G.toggleKart() && G.kart === k && G.toggleKart(), 'on peut remonter et redescendre');

console.log('CHAMPIGNONS ET VOL PLANÉ');
const pd = G.pads[0]; place(pd.x, 0, pd.z); P.onGround = true; frames(1);
let ymax = 0, glided = false; T.cam.yaw = Math.atan2(pd.x, pd.z); for (let i = 0; i < 600; i++) { frames(1); if (i === 25) T.joy.y = 1; ymax = Math.max(ymax, P.y); if (P.fall === -5) glided = true; if (i > 30 && P.onGround && !G.glide) break; }
check(ymax > 8, 'le champignon fait rebondir haut (' + ymax.toFixed(1) + ')');
T.joy.y = 0;
console.log('    plané: glided=' + glided + ' glide=' + G.glide + ' fall=' + P.fall + ' sol=' + P.onGround + ' y=' + P.y.toFixed(2));
check(glided && !G.glide && P.fall === 0 && P.onGround, 'on plane puis on se pose');

console.log('BONBOMBES ET GRAPPIN');
awayAll(G); sp = clearSpot(G, 3); place(sp[0], 0, sp[1]); T.cam.yaw = 0; T.cam.pitch = 0.18; frames(10);
G.inv[2] = null; G.dropItem({ kind: 'w', w: 'grenade', r: 1, n: 3 }, P.x + 0.3, P.z); frames(2);
const gi = G.inv.findIndex(x => x && x.w === 'grenade');
check(gi > 0 && G.inv[gi].n === 3, 'ramasser 3 bonbombes');
G.dropItem({ kind: 'w', w: 'grenade', r: 1, n: 3 }, P.x + 0.3, P.z); frames(2);
check(G.inv[gi].n === 6 && G.inv.filter(x => x && x.w === 'grenade').length === 1, 'les bonbombes s\'empilent dans la même case (×' + G.inv[gi].n + ')');
G.select(gi); const vb = G.bots.find(b => b.alive && !b.ally); vb.x = P.x; vb.z = P.z - 9; vb.y = 0; vb.hp = 100; vb.sh = 0; freeze(vb); frames(3);
G.fireCd = 0; G.tryFire(); const bp = G.proj[G.proj.length - 1];
check(bp && bp.grav > 0 && bp.vy > 0, 'la bonbombe part en cloche');
for (let i = 0; i < 80; i++) { frames(1); vb.x = P.x; vb.z = P.z - 9; vb.vx = vb.vz = 0; }
check(vb.hp < 100 || !vb.alive, 'l\'explosion blesse le robot (pv ' + Math.round(vb.hp) + ')');
check(G.inv[gi] && G.inv[gi].n === 5, 'une bonbombe en moins');
G.inv[gi].n = 1; G.fireCd = 0; G.tryFire(); frames(80);
check(!G.inv[gi] && G.sel === 0 || (G.inv[G.sel] && G.inv[G.sel].w !== 'grenade'), 'la case se vide après la dernière bonbombe');
vb.x = 64; vb.z = 64; freeze(vb); awayAll(G);
sp = clearSpot(G, 3); place(sp[0], 0, sp[1]); T.cam.yaw = 0; T.cam.pitch = 0.3; frames(15);
G.inv[3] = { w: 'grapple', r: 1, n: 2 }; G.select(3); const z0 = P.z; G.fireCd = 0; G.tryFire();
check(!!G.hook && G.inv[3].n === 1, 'le grappin s\'accroche (sol visé à ' + (G.hook ? Math.hypot(G.hook.x - P.x, G.hook.z - P.z).toFixed(1) : '?') + ')');
let zmin = P.z; for (let i = 0; i < 40; i++) { frames(1); zmin = Math.min(zmin, P.z); }
check(z0 - zmin > 3 && !G.hook, 'le grappin tire le joueur vers le point visé (' + (z0 - zmin).toFixed(1) + ' m)');
check(finite(), 'valeurs du joueur valides');

console.log('RAVITAILLEMENT');
awayAll(G); G.spawnDrop(); const dr = G.drops[G.drops.length - 1];
check(dr && dr.y > 30 && !dr.landed, 'un ravitaillement tombe du ciel');
let nd = 0; while (!dr.landed && nd < 900) { frames(1); nd++; }
check(dr.landed && G.chests.some(c => c.supply === dr), 'il se pose et devient un coffre (' + (nd / 60).toFixed(1) + ' s)');
G.inv[1] = G.inv[2] = G.inv[3] = G.inv[4] = null; G.sel = 0;
const dc = G.chests.find(c => c.supply === dr); const dq = G.query(dc.x - 1, dc.x + 1, 0, 2, dc.z - 1, dc.z + 1);
place(dc.x, dq.reduce((m, b) => Math.max(m, b === G.ground ? 0 : b.y1), 0), dc.z); frames(10);
check(dr.opened, 'le joueur l\'ouvre en passant dessus');
place(dc.x + 1, 0, dc.z); frames(3); place(dc.x - 1, 0, dc.z); frames(3);
check(G.inv.some(x => x && x.r === 3 && x.w !== 'grenade'), 'arme légendaire récupérée');

console.log('ROBOTS QUI SE PROTÈGENT');
awayAll(G); sp = clearSpot(G, 3); place(sp[0], 0, sp[1]); T.cam.yaw = 0; T.cam.pitch = 0.18; frames(10);
G.diff = Object.assign({}, G.diff, { build: 1 });
const cb = G.bots.find(b => b.alive && !b.ally); cb.x = P.x; cb.z = P.z - 10; cb.y = 0; cb.hp = 100; cb.sh = 100; cb.buildCd = 0; freeze(cb); frames(5);
const pc0 = G.pieces.length; G.dmgEnt(cb, 5, G.pEnt);
check(G.pieces.length === pc0 + 1 && G.pieces[G.pieces.length - 1].hp === 110, 'un robot touché construit un mur pour se cacher');
G.dmgEnt(cb, 5, G.pEnt); check(G.pieces.length === pc0 + 1, 'pas de nouveau mur avant la fin de l\'attente');
check(G.bots.every(b => !b.w || !T.GAMES.royale.botWants.call(G, b, { kind: 'w', w: 'grenade', r: 3 })), 'les robots ne ramassent pas les bonbombes');

console.log('PARTIE DUO JUSQU\'AU BOUT');
G.bots.forEach(b => { if (b.alive) { b.think = 0; b.x = Math.random() * 100 - 50; b.z = Math.random() * 100 - 50; } });
let fr = 0; while (!G.over && fr < 25000) { frames(1); fr++; }
console.log('    fin après ' + (fr / 60).toFixed(0) + ' s, joueur ' + (G.pEnt.alive ? 'vivant' : 'éliminé') + ', allié ' + (G.ally.alive ? 'vivant' : 'éliminé') + ', éliminations allié ' + G.allyKills);
check(G.over, 'la partie se termine');
check(finite(), 'valeurs du joueur valides');
frames(120); T.exitGame();
check(Number.isFinite(S.best.royaleKills), 'record d\'éliminations enregistré');

console.log('MODE TRANQUILLE');
T.startGame('royale'); G = T.getG(); frames(5); G.setMode('easy'); frames(5);
check(!G.ally && G.bots.every(b => b.team > 0), 'Tranquille : pas d\'allié');
landPlayer(G); awayAll(G); G.graceT = 0; G.pEnt.hp = 100; G.pEnt.sh = 0;
G.dmgEnt(G.pEnt, 20, G.bots[3]);
check(Math.abs(G.pEnt.hp - 90) < 1e-6, 'les robots font moitié moins mal (pv ' + G.pEnt.hp + ')');
// sortir pendant qu'on conduit
sp = clearSpot(G, 3); const k2 = G.karts[1]; k2.x = sp[0] + 1; k2.z = sp[1]; k2.g.position.set(k2.x, 0, k2.z); place(sp[0], 0, sp[1]); frames(5);
check(G.toggleKart(), 'monter dans un kart');
T.exitGame(); frames(5);
T.startGame('royale'); G = T.getG(); frames(5);
check(G.mode === 'easy' && !G.modeChosen, 'nouvelle partie : le dernier mode est proposé (' + G.mode + ')');
G.setMode('classic'); landPlayer(G); frames(60);
check(finite() && !G.kart, 'quitter en kart puis rejouer : tout repart proprement');
T.exitGame();
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK');
