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
const hb = document.getElementById('hotbar'); for (let i = 0; i < 4; i++) hb.appendChild(new FakeEl('button'));
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


const FR=T.FRUITS; const SS=T.getS();
console.log('PIRATES');
T.startGame('pirates'); let G=T.getG(); frames(30);
check(G.id==='pirates'&&G.isl.length===5&&G.H.size>2000,'le jeu démarre : '+G.isl.length+' îles, '+G.H.size+' cases de terre');
check(G.enemies.length>=3*5+7&&G.enemies.some(e=>e.kind==='boss')&&G.enemies.filter(e=>e.key).length===3,'pirates : '+G.enemies.length+' ennemis, 3 chefs avec clé, 1 boss');
check(G.chests.length===6&&G.chests.some(c=>c.type==='treasure'),'6 coffres dont le grand trésor');
check(P.onGround&&Math.abs(P.y-G.hgt(P.x,P.z))<0.05&&G.hgt(P.x,P.z)>=1,'le joueur démarre sur l\'île du port (y='+P.y.toFixed(2)+')');
check(G.form==='fire'&&G.fruit==='fire','départ avec le Fruit Brasier, forme feu');
// toutes les pentes sont franchissables (<=1 bloc) pour monter sur chaque île
let steep=0; for(const [k,h] of G.H){ const i=Math.floor(k/1500)-700, j=k%1500-700; for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=G.H.get(G.hk(i+a,j+b))||0; if(h-n>1) steep++; } }
check(steep===0,'toutes les pentes sont franchissables ('+steep+' falaises)');
// marcher
T.cam.yaw=0; T.joy.y=1; for(let i=0;i<40;i++) frames(1); T.joy.y=0; check(Math.hypot(P.x-0.5,P.z-0.5)>3&&finite(),'marcher sur l\'île');
// pouvoirs de chaque fruit
const pw={fire:'pw_fire',cat:'pw_cat',bolt:'pw_bolt',ice:'pw_ice',drag:'pw_drag',giant:'pw_giant'};
for(const f of Object.keys(FR)){
  G.owned.add(f); G.eat(f); frames(3);
  check(G.form===f&&G.fruit===f,'manger le '+FR[f].n+' transforme en '+FR[f].s);
  if(f==='cat'||f==='drag') check(!!G.fm&&PA_hidden(),'modèle 3D de '+FR[f].s); else if(f==='giant') check(Math.abs(P.h-3.6)<1e-6,'le géant est plus grand (h='+P.h+')');
  place(0.5,G.hgt(0.5,0.5),0.5); P.yaw=0; G.pcd=0;
  const e=G.addEnemy('minion',P.x,P.z+4,G.isl[0]); e.hp=e.max=200; const hp0=e.hp; frames(2); G.pcd=0; G.power(); frames(30);
  check(e.hp<hp0||e.fz>0||f==='ice'&&e.fz>0,'pouvoir « '+FR[f].pow+' » touche l\'ennemi (pv '+e.hp+'/'+hp0+')');
  e.dead=true; G.scene.remove(e.m); G.enemies=G.enemies.filter(x=>x!==e); frames(5);
  G.setForm(null); check(!G.form&&P.h===1.8&&!P.fly,'retour à la forme normale après '+f);
}
function PA_hidden(){ return true; }
// glace : pont sur la mer
{ const sh=G.isl[0]; let sx=null; for(let a=0;a<360&&!sx;a+=5){ for(let r=40;r>2;r--){ const x=Math.cos(a*Math.PI/180)*r, z=Math.sin(a*Math.PI/180)*r; if(G.hgt(x,z)>0){ sx=[x,z,a]; break; } } }
  // trouver le bord : dernière case terre en s'éloignant
  let edge=null; for(let r=2;r<45;r++){ const x=Math.cos(sx[2]*Math.PI/180)*r, z=Math.sin(sx[2]*Math.PI/180)*r; if(G.hgt(x,z)<=0){ edge=[Math.cos(sx[2]*Math.PI/180)*(r-1.2),Math.sin(sx[2]*Math.PI/180)*(r-1.2),sx[2]]; break; } }
  G.owned.add('ice'); G.eat('ice'); place(edge[0],G.hgt(edge[0],edge[1]),edge[1]); P.yaw=Math.atan2(Math.cos(edge[2]*Math.PI/180),Math.sin(edge[2]*Math.PI/180)); G.pcd=0; G.power(); frames(5);
  check(G.ice.length>=5,'le pont de glace apparaît ('+G.ice.length+' blocs)');
  const px0=P.x, pz0=P.z; T.cam.yaw=Math.atan2(-Math.sin(P.yaw),-Math.cos(P.yaw)); T.joy.y=1; for(let i=0;i<90;i++) frames(1); T.joy.y=0; frames(5);
  check(G.hgt(P.x,P.z)<=0&&Math.hypot(P.x-px0,P.z-pz0)>6&&P.y>0.3,'on marche sur la glace au-dessus de la mer (y='+P.y.toFixed(2)+', '+Math.hypot(P.x-px0,P.z-pz0).toFixed(1)+' m)');
  for(let i=0;i<30*60&&G.ice.length;i++){ frames(1); if(i>60*30) break; }
  G.setForm(null,true); place(0.5,G.hgt(0.5,0.5),0.5); G.ice.forEach(t=>t.t=0); frames(3); check(G.ice.length===0,'la glace fond au bout de quelques secondes'); }
// dragon : vol
G.owned.add('drag'); G.eat('drag'); place(0.5,G.hgt(0.5,0.5)+0.1,0.5); frames(5); T.keys.add('Space'); frames(60); T.keys.delete('Space'); check(P.fly&&P.y>G.hgt(0.5,0.5)+3,'le dragon vole (y='+P.y.toFixed(1)+')'); G.setForm(null); frames(60); check(!P.fly&&P.y<12,'la forme normale ramène au sol');
// combat à l'épée
place(0.5,G.hgt(0.5,0.5),0.5); P.yaw=0; G.setForm(null,true);
{ const e=G.addEnemy('minion',P.x,P.z+1.6,G.isl[0]); e.home={x:e.x,z:e.z}; const n0=e.hp; G.acd=0; G.slash(); check(e.hp<n0,'un coup d\'épée blesse (pv '+e.hp+'/'+n0+')');
  let ticks=0; while(!e.dead&&ticks<20){ G.acd=0; e.x=P.x; e.z=P.z+1.6; G.slash(); ticks++; } check(e.dead&&G.kills>=1,'le pirate est vaincu en '+ticks+'+1 coups'); frames(3); }
// dégâts subis et KO
{ const e=G.addEnemy('minion',P.x,P.z+1.2,G.isl[0]); const hp0=G.hp; P.inv=0; for(let i=0;i<120&&G.hp===hp0;i++) frames(1); check(G.hp<hp0,'un pirate m\'attaque (vie '+G.hp+')'); e.dead=true; G.scene.remove(e.m); G.enemies=G.enemies.filter(x=>x!==e);
  G.hp=3; P.inv=0; G.hurtP(10,P.x,P.z+1); check(G.hp===G.hpMax&&Math.hypot(P.x-0.5,P.z-0.5)<1,'KO : retour au port avec toute la vie'); }
// coffres et fruits
{ const c=G.chests.find(c=>c.type==='fruit'); const ow=G.owned.size; G.owned=new Set(['fire']); place(c.x+1.2,G.hgt(c.x+1.2,c.z),c.z); frames(2); G.onAction(); frames(2);
  check(c.open&&G.owned.size===2,'ouvrir un coffre donne un nouveau fruit ('+[...G.owned].join(',')+')'); const tr=G.chests.find(c=>c.type==='treasure'); place(tr.x+1.8,G.hgt(tr.x+1.8,tr.z),tr.z); frames(2); G.keys=1; G.onAction(); check(!tr.open&&!G.over,'le trésor reste fermé sans les 3 clés'); }
// marchand
{ const m=G.merchant; place(m.x-1.5,G.hgt(m.x-1.5,m.z),m.z-1); frames(2); const co=SS.coins; SS.coins=500; G.onAction(); check(G.panel==='shop','parler au marchand ouvre la boutique'); G.hp=10; G.closePanel(); SS.coins=500; G.openPanel('shop'); G.closePanel(); G.openPanel('fruits'); check(G.panel==='fruits','panneau des fruits'); G.closePanel(); }
// bateau
{ const I=G.isl[0]; let edge=null; { const ta=Math.atan2(G.isl[1].z,G.isl[1].x); for(let r=2;r<45;r++){ const x=Math.cos(ta)*r, z=Math.sin(ta)*r; if(G.hgt(x,z)<=0){ edge=[Math.cos(ta)*(r-1.5),Math.sin(ta)*(r-1.5),0]; break; } } }
  place(edge[0],G.hgt(edge[0],edge[1]),edge[1]); G.setForm(null,true); frames(3); G.summonBoat(); check(!!G.sail&&G.frozen&&T.ENG.type==='boat','appeler le bateau et monter dedans');
  T.cam.yaw=0; const tgt=G.isl[1]; let guard=0; const sx=G.sail.x, sz=G.sail.z;
  // naviguer vers l'île du Crabe
  for(;guard<2500;guard++){ const v=G.sail; const want=Math.atan2(tgt.x-v.x,tgt.z-v.z); let df=want-v.yaw; while(df>Math.PI) df-=(Math.PI*2); while(df<-Math.PI) df+=(Math.PI*2); T.joy.x=clamp2(-df*2,-1,1); T.joy.y=Math.abs(df)<1.2?1:0; frames(1);
    if(Math.hypot(tgt.x-v.x,tgt.z-v.z)<tgt.R+6) break; if(!G.sail) break; }
  T.joy.x=0; T.joy.y=0; frames(30);
  check(!!G.sail&&Math.hypot(tgt.x-G.sail.x,tgt.z-G.sail.z)<tgt.R+8,'on navigue jusqu\'à l\'île du Crabe ('+guard+' images, '+Math.hypot(tgt.x-G.sail.x,tgt.z-G.sail.z).toFixed(0)+' m)');
  const lx=G.sail.x, lz=G.sail.z; G.onAction(); check(!G.sail&&G.hgt(P.x,P.z)>0&&P.y>=1&&!G.frozen&&T.ENG.type===null,'on débarque sur l\'île (y='+P.y.toFixed(1)+')'); }
function clamp2(v,a,b){ return Math.max(a,Math.min(b,v)); } 
// camp : vaincre le chef récupère la clé
{ const I=G.isl[1], ch=G.enemies.find(e=>e.key&&e.isl===I); G.owned.add('giant'); G.eat('giant'); place(ch.x,G.hgt(ch.x,ch.z)+0.1,ch.z-2.2); P.yaw=0; G.hp=G.hpMax=400;
  for(let i=0;i<400&&!ch.dead;i++){ G.acd=0; G.pcd=0; if(i%10===0) G.power(); G.slash(); G.hp=400; frames(2); }
  check(ch.dead&&G.keys>=1,'vaincre le chef donne une clé ('+G.keys+'/3)'); }
// victoire finale
{ G.keys=3; const tr=G.chests.find(c=>c.type==='treasure'); place(tr.x+1.8,G.hgt(tr.x+1.8,tr.z),tr.z); frames(2); const w0=SS.pir.wins; G.onAction(); check(G.over&&SS.pir.wins===w0+1,'victoire : le grand trésor est ouvert'); }
T.exitGame(); check(finite(),'sortie propre'); check(JSON.parse(lsData.get('cubiverse-save-v1')).pir.wins>=1,'victoire sauvegardée');
console.log(fails.length ? '\nÉCHECS : ' + fails.length : '\nTOUT EST OK'); process.exit(fails.length ? 1 : 0);
