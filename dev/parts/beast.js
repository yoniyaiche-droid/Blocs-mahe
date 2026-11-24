/* =========================================================
   24. Les Bestioles Magiques : île à explorer, bestioles
       inventées qui se promènent, combats au tour par tour,
       capture dans des bocaux à étoiles, niveaux, évolutions,
       album, fontaine de soin, boutique et Capitaine Orage
   ========================================================= */
const BS_T={feu:{ic:'🔥',c:'#ff7a2f',n:'Feu'},eau:{ic:'💧',c:'#3b9dff',n:'Eau'},plante:{ic:'🌿',c:'#3ad17a',n:'Plante'},foudre:{ic:'⚡',c:'#f5c400',n:'Foudre'},roc:{ic:'🪨',c:'#a0896b',n:'Roc'},vent:{ic:'🌪️',c:'#5fc8e8',n:'Vent'}};
const BS_STRONG={feu:['plante'],eau:['feu','roc'],plante:['eau','roc'],foudre:['eau','vent'],roc:['feu','foudre'],vent:['plante']};
const BS_M={charge:{n:'Charge',t:null,pw:35},
  braise:{n:'Braise',t:'feu',pw:40},flamme:{n:'Tourbiflamme',t:'feu',pw:65},volcan:{n:'Éruption douce',t:'feu',pw:90},
  bulle:{n:'Bulle',t:'eau',pw:40},vague:{n:'Vaguelette',t:'eau',pw:65},deluge:{n:'Grand Plouf',t:'eau',pw:90},
  feuille:{n:'Feuille tourbillon',t:'plante',pw:40},liane:{n:'Fouet-liane',t:'plante',pw:65},floraison:{n:'Floraison',t:'plante',pw:90},
  etincelle:{n:'Étincelle',t:'foudre',pw:40},eclair:{n:'Zigzag',t:'foudre',pw:65},tonnerre:{n:'Boum-tonnerre',t:'foudre',pw:90},
  caillou:{n:'Jet de cailloux',t:'roc',pw:40},roule:{n:'Roulé-boulé',t:'roc',pw:65},seisme:{n:'Tremblote',t:'roc',pw:90},
  souffle:{n:'Petit souffle',t:'vent',pw:40},rafale:{n:'Rafale',t:'vent',pw:65},tornade:{n:'Mini-tornade',t:'vent',pw:90}};
const BS_TM={feu:['braise','flamme','volcan'],eau:['bulle','vague','deluge'],plante:['feuille','liane','floraison'],foudre:['etincelle','eclair','tonnerre'],roc:['caillou','roule','seisme'],vent:['souffle','rafale','tornade']};
const BS_SP={
  brasou:{n:'Brasou',t:'feu',b:[45,55,40,50],ev:['fournak',10],d:'Une petite boule de braise qui ronronne.'},fournak:{n:'Fournak',t:'feu',b:[70,82,62,62],d:'Il fait cuire des galettes sur sa tête.'},
  goutelin:{n:'Goutelin',t:'eau',b:[50,45,52,45],ev:['marelune',10],d:'Une goutte qui fait des bulles quand elle rit.'},marelune:{n:'Marélune',t:'eau',b:[76,70,72,60],d:'Elle brille la nuit comme la lune.'},
  pousson:{n:'Pousson',t:'plante',b:[56,45,55,40],ev:['arbrisson',10],d:'Une graine qui court sur ses racines.'},arbrisson:{n:'Arbrisson',t:'plante',b:[82,70,78,48],d:'Ses fruits rouges sentent la fraise.'},
  zeclair:{n:'Zéclair',t:'foudre',b:[40,56,35,72],ev:['orageon',12],d:'Un petit nuage qui pétille.'},orageon:{n:'Orageon',t:'foudre',b:[66,86,56,92],d:'Quand il gronde, les vitres tremblent.'},
  caillouche:{n:'Caillouche',t:'roc',b:[55,50,72,25],ev:['rocabosse',12],d:'Il dort sous sa carapace de pierre.'},rocabosse:{n:'Rocabosse',t:'roc',b:[86,80,96,30],d:'Des cristaux poussent sur son dos.'},
  plumino:{n:'Plumino',t:'vent',b:[40,46,36,66],ev:['tornadou',12],d:'Une boule de plumes qui roule au vent.'},tornadou:{n:'Tornadou',t:'vent',b:[66,76,56,96],d:'Sa queue tourne comme une toupie.'},
  fumeroll:{n:'Fumeroll',t:'feu',b:[56,50,66,30],d:'Un escargot qui porte un feu de camp.'},bullipop:{n:'Bullipop',t:'eau',b:[52,50,46,56],d:'Une grenouille avec une bulle sur le dos.'},
  feuillette:{n:'Feuillette',t:'plante',b:[46,52,40,66],d:'Un papillon aux ailes de feuille.'},etincelou:{n:'Étincelou',t:'foudre',b:[46,50,40,70],d:'Sa queue s\'allume comme une lampe.'},
  cristouille:{n:'Cristouille',t:'roc',b:[50,60,66,40],d:'Un crabe aux pinces de cristal.'},nuageon:{n:'Nuageon',t:'vent',b:[62,45,56,50],d:'Un mouton tout doux en nuage.'},
  lumirelle:{n:'Lumirelle',t:'vent',b:[72,82,72,86],rare:1,d:'Très rare : ses ailes brillent comme des étoiles.'}};
const BS_IDS=Object.keys(BS_SP);
const BS_ZONES=[
  {n:'Prairie',x:30,z:2,r:15,pool:['pousson','plumino','feuillette','bullipop'],lv:[2,5],g:'#7fd36a'},
  {n:'Forêt',x:0,z:-40,r:17,pool:['feuillette','caillouche','etincelou','pousson'],lv:[4,8],g:'#4fb85a',rare:1},
  {n:'Plage',x:-4,z:42,r:15,pool:['goutelin','bullipop','cristouille','nuageon'],lv:[5,9],g:'#b8d68a'},
  {n:'Volcan',x:-38,z:-2,r:15,pool:['brasou','fumeroll','caillouche','zeclair'],lv:[7,12],g:'#8a7a6a'}];
const BS_CHAMP=[['orageon',13],['rocabosse',13],['tornadou',14]];
function bsMult(at,dt){ if(!at) return 1; if(BS_STRONG[at].indexOf(dt)>=0) return 2; if(BS_STRONG[dt].indexOf(at)>=0) return 0.5; return 1; }
function bsStats(c){ const b=BS_SP[c.s].b, l=c.lv; c.max=Math.floor(b[0]*l/25+l+12); c.atk=Math.floor(b[1]*l/30+5); c.def=Math.floor(b[2]*l/30+5); c.spd=Math.floor(b[3]*l/30+5); if(c.hp===undefined||c.hp>c.max) c.hp=c.max; return c; }
function bsMoves(c){ const t=BS_TM[BS_SP[c.s].t], m=['charge',t[0]]; if(c.lv>=8) m.push(t[1]); if(c.lv>=15) m.push(t[2]); return m; }
function bsNew(s,lv){ return bsStats({s,lv,xp:0}); }
function bsXpNeed(lv){ return lv*lv*5+10; }
function bsMesh(s){
  const g=new THREE.Group(), add=(geo,col,x,y,z,o)=>{ const m=mk(geo,typeof col==='string'?lam(col):col); m.position.set(x,y,z); if(o){ if(o.s) m.scale.set(o.s[0],o.s[1],o.s[2]); if(o.r) m.rotation.set(o.r[0],o.r[1],o.r[2]); } g.add(m); return m; };
  const glow=(c,e)=>matC('bsgl'+c,()=>new THREE.MeshLambertMaterial({color:c,emissive:e||c,emissiveIntensity:0.9}));
  const glass=(c)=>matC('bsgs'+c,()=>new THREE.MeshLambertMaterial({color:c,transparent:true,opacity:0.72,emissive:c,emissiveIntensity:0.15}));
  const eyes=(y,z,sp,sz,col)=>{ for(const q of [-1,1]){ add(sph(sz||0.09),'#ffffff',q*(sp||0.14),y,z); add(sph((sz||0.09)*0.55),col||'#1d1846',q*(sp||0.14),y,z+(sz||0.09)*0.6); } };
  const legs=(y,col,sp,n)=>{ for(const q of [-1,1]) for(let i=0;i<(n||1);i++) add(box(0.14,0.2,0.16),col,q*(sp||0.18),y,(n>1?(i-0.5)*0.3:0)); };
  switch(s){
    case 'brasou': add(sph(0.42),'#3a2a2a',0,0.45,0); for(let i=0;i<6;i++){ const a=i/6*TAU; add(box(0.05,0.3,0.05),glow('#ff7a1a'),Math.cos(a)*0.4,0.45+Math.sin(i)*0.1,Math.sin(a)*0.4,{r:[0.3,a,0.5]}); }
      for(let i=0;i<3;i++) add(sph(0.12+i*0.03),'#9aa0aa',(i-1)*0.1,0.92+i*0.14,-0.05); eyes(0.52,0.36,0.14,0.09,'#ff7a1a'); legs(0.08,'#2a1d1d',0.2); break;
    case 'fournak': add(box(0.95,0.9,0.75),'#4a3a3a',0,0.62,0); add(box(0.5,0.38,0.06),glow('#ffa040'),0,0.5,0.38); add(cyl(0.14,0.16,0.45,10),'#2b2d42',0.22,1.25,-0.1); add(cone(0.12,0.3,8),glow('#ff7a1a'),0.22,1.6,-0.1);
      eyes(0.88,0.38,0.2,0.1,'#ff7a1a'); for(const q of [-1,1]) add(box(0.2,0.45,0.22),'#3a2a2a',q*0.58,0.6,0); legs(0.1,'#2a1d1d',0.26); break;
    case 'goutelin': add(sph(0.38),glass('#5fb8ff'),0,0.38,0); add(cone(0.38,0.5,16),glass('#5fb8ff'),0,0.84,0); for(const q of [-1,1]){ add(box(0.03,0.28,0.03),'#8fd0ff',q*0.15,1.12,0); add(sph(0.08),glass('#d8f2ff'),q*0.15,1.28,0); } eyes(0.45,0.33,0.13); break;
    case 'marelune': add(new THREE.SphereGeometry(0.62,18,10,0,TAU,0,Math.PI/2),glass('#7fa8ff'),0,0.7,0); for(let i=0;i<8;i++){ const a=i/8*TAU; add(box(0.06,0.55,0.06),glass('#b8d0ff'),Math.cos(a)*0.38,0.42,Math.sin(a)*0.38,{r:[0,0,Math.sin(i)*0.2]}); }
      add(box(0.36,0.1,0.08),glow('#ffe066'),0,1.38,0,{r:[0,0,0.4]}); add(box(0.24,0.1,0.08),glow('#ffe066'),0.14,1.48,0,{r:[0,0,1.1]}); eyes(0.92,0.5,0.18,0.1); break;
    case 'pousson': add(sph(0.38),'#a8c45a',0,0.55,0,{s:[1,1.25,0.95]}); for(const [x,z] of [[-0.18,0.1],[0.18,0.1],[0,-0.2]]) add(cyl(0.05,0.07,0.32,6),'#8a5a33',x,0.14,z,{r:[0.25*Math.sign(z||1),0,-x]});
      add(box(0.04,0.2,0.04),'#3a8a3a',0,1.05,0); add(box(0.28,0.04,0.14),'#4cc157',0.12,1.15,0,{r:[0,0,0.4]}); add(box(0.24,0.04,0.12),'#3fae4a',-0.1,1.12,0,{r:[0,0,-0.4]}); eyes(0.62,0.33,0.13); break;
    case 'arbrisson': add(cyl(0.3,0.38,0.85,10),'#8a5a33',0,0.45,0); for(const [x,y,z,r] of [[0,1.25,0,0.5],[-0.35,1.05,0.1,0.35],[0.35,1.05,0.05,0.35],[0,1.0,-0.3,0.35]]) add(sph(r),'#3fae4a',x,y,z);
      for(const [x,y,z] of [[0.25,1.45,0.25],[-0.3,1.25,0.32],[0.42,1.0,0.3]]) add(sph(0.08),glow('#ff3a4a','#a00010'),x,y,z); eyes(0.62,0.33,0.13); legs(0.05,'#6a4a2a',0.22); break;
    case 'zeclair': for(const [x,y,z,r] of [[0,0.55,0,0.32],[-0.28,0.5,0,0.24],[0.28,0.5,0,0.24],[0,0.75,-0.05,0.24]]) add(sph(r),'#c8d0e8',x,y,z);
      for(const q of [-1,1]){ add(box(0.06,0.22,0.06),glow('#ffe066'),q*0.2,0.95,0,{r:[0,0,q*0.5]}); add(box(0.06,0.18,0.06),glow('#ffe066'),q*0.28,1.1,0,{r:[0,0,-q*0.5]}); } eyes(0.58,0.3,0.12); break;
    case 'orageon': for(const [x,y,z,r] of [[0,0.8,0,0.5],[-0.42,0.72,0,0.36],[0.42,0.72,0,0.36],[0,1.1,-0.08,0.38],[0,0.62,0.12,0.36]]) add(sph(r),'#5a6078',x,y,z);
      for(let i=0;i<4;i++) add(box(0.08,0.3,0.08),glow('#ffe066'),-0.55-i*0.14,0.5+(i%2)*0.18,-0.2,{r:[0,0,(i%2?0.7:-0.7)]}); eyes(0.86,0.46,0.18,0.11,'#ffd23f'); break;
    case 'caillouche': add(new THREE.SphereGeometry(0.5,14,8,0,TAU,0,Math.PI/2),'#9a9488',0,0.15,0); for(let i=0;i<4;i++) add(box(0.18,0.06,0.18),'#5fae5a',Math.cos(i*1.7)*0.25,0.55,Math.sin(i*1.7)*0.25);
      add(sph(0.18),'#c8b89a',0,0.3,0.48); eyes(0.36,0.62,0.08,0.06); for(const [x,z] of [[-0.3,0.25],[0.3,0.25],[-0.3,-0.25],[0.3,-0.25]]) add(box(0.14,0.16,0.14),'#c8b89a',x,0.08,z); break;
    case 'rocabosse': add(new THREE.DodecahedronGeometry(0.72,0),'#8a8478',0,0.72,0); for(let i=0;i<5;i++){ const a=i/5*TAU; add(oct(0.2),glow('#b06bff','#5a1a9a'),Math.cos(a)*0.4,1.25+Math.sin(i)*0.1,Math.sin(a)*0.4-0.1,{s:[0.7,1.6,0.7]}); }
      eyes(0.82,0.62,0.22,0.1,'#b06bff'); for(const q of [-1,1]) add(box(0.3,0.35,0.3),'#6a6458',q*0.45,0.17,0.1); break;
    case 'plumino': add(sph(0.42),'#e8f6ff',0,0.45,0); add(cone(0.08,0.18,6),'#ffb020',0,0.45,0.44,{r:[Math.PI/2,0,0]}); for(let i=0;i<3;i++) add(box(0.06,0.25,0.06),'#9be7ff',(i-1)*0.08,0.92,0,{r:[0,0,(i-1)*0.4]});
      for(const q of [-1,1]) add(box(0.06,0.24,0.32),'#c8eaff',q*0.42,0.45,-0.02,{r:[0,0,q*0.4]}); eyes(0.55,0.36,0.13); legs(0.04,'#ffb020',0.12); break;
    case 'tornadou': add(sph(0.42),'#9be7ff',0,0.85,0,{s:[0.9,1.15,0.9]}); add(cone(0.08,0.2,6),'#ffb020',0,0.9,0.42,{r:[Math.PI/2,0,0]}); for(let i=0;i<4;i++) add(cyl(0.3-i*0.06,0.3-i*0.06,0.06,12),'#5fc8e8',0,0.35-i*0.1,-0.45-i*0.08,{r:[0.4,i,0]});
      for(const q of [-1,1]) add(box(0.06,0.3,0.7),'#7fd0f0',q*0.48,0.95,-0.05,{r:[0,0,q*0.6]}); eyes(1.0,0.36,0.14); legs(0.25,'#ffb020',0.15); break;
    case 'fumeroll': add(box(0.8,0.24,0.4),'#e8c89a',0.1,0.12,0); add(cyl(0.32,0.32,0.36,14),'#c84a2a',-0.08,0.5,0,{r:[Math.PI/2,0,0]}); add(cone(0.16,0.4,8),glow('#ff8a1a'),-0.08,0.98,0);
      add(box(0.24,0.35,0.24),'#e8c89a',0.42,0.35,0); for(const q of [-1,1]){ add(box(0.04,0.22,0.04),'#e8c89a',0.46,0.62,q*0.08); add(sph(0.05),'#1d1846',0.46,0.74,q*0.08); } break;
    case 'bullipop': add(sph(0.36),'#4fc8a8',0,0.36,0,{s:[1.1,0.85,1]}); add(sph(0.3),glass('#d8f8ff'),0,0.62,-0.18); for(const q of [-1,1]){ add(sph(0.11),'#4fc8a8',q*0.16,0.62,0.18); add(sph(0.06),'#1d1846',q*0.16,0.66,0.27); }
      for(const q of [-1,1]) add(box(0.22,0.08,0.3),'#3aa88a',q*0.3,0.05,0.12); break;
    case 'feuillette': add(cyl(0.06,0.06,0.6,8),'#5a3a1e',0,0.7,0,{r:[Math.PI/2,0,0]}); for(const q of [-1,1]) for(const z of [0.12,-0.14]) add(box(0.5,0.04,0.34),'#5fd36a',q*0.3,0.72,z,{r:[0,q*0.3,q*0.3]});
      add(sph(0.1),'#5a3a1e',0,0.72,0.32); for(const q of [-1,1]) add(box(0.02,0.2,0.02),'#5a3a1e',q*0.05,0.86,0.38,{r:[0.4,0,q*0.3]}); break;
    case 'etincelou': add(sph(0.22),'#3a3550',0,0.6,0.1); add(sph(0.24),glow('#ffe066','#ffb000'),0,0.55,-0.28); for(const q of [-1,1]){ add(box(0.36,0.03,0.2),glass('#e0f8ff'),q*0.22,0.75,0); add(box(0.02,0.24,0.02),'#3a3550',q*0.07,0.85,0.22,{r:[0.4,0,q*0.3]}); }
      eyes(0.64,0.3,0.08,0.06); break;
    case 'cristouille': add(box(0.7,0.3,0.5),'#8fd0e8',0,0.3,0); for(const q of [-1,1]){ add(oct(0.16),glow('#c8f4ff','#3ab8d8'),q*0.48,0.45,0.32,{s:[1,0.7,1]}); add(box(0.24,0.06,0.06),'#6ab0c8',q*0.36,0.32,0.22); for(let i=0;i<3;i++) add(box(0.3,0.05,0.05),'#6ab0c8',q*0.42,0.18,-0.15+i*0.15,{r:[0,0,q*0.4]}); }
      add(oct(0.18),glow('#c8f4ff','#3ab8d8'),0,0.58,-0.05,{s:[0.8,1.4,0.8]}); for(const q of [-1,1]){ add(box(0.03,0.16,0.03),'#6ab0c8',q*0.1,0.52,0.24); add(sph(0.05),'#1d1846',q*0.1,0.62,0.24); } break;
    case 'nuageon': for(const [x,y,z,r] of [[0,0.55,0,0.36],[-0.25,0.5,0.1,0.26],[0.25,0.5,0.1,0.26],[0,0.62,-0.25,0.28],[0,0.8,0.05,0.24]]) add(sph(r),'#ffffff',x,y,z);
      add(box(0.3,0.3,0.2),'#4a4a5a',0,0.6,0.4); eyes(0.66,0.51,0.08,0.05); for(const q of [-1,1]) add(cyl(0.07,0.07,0.18,8),'#c8a878',q*0.18,0.82,0.36,{r:[0,0,Math.PI/2]}); legs(0.12,'#4a4a5a',0.18,2); break;
    case 'lumirelle': add(cyl(0.08,0.06,0.7,8),'#3a3060',0,0.8,0,{r:[Math.PI/2,0,0]}); for(const q of [-1,1]) for(const [z,c] of [[0.15,'#ffd6f0'],[-0.2,'#c8e0ff']]) add(box(0.7,0.03,0.5),glow(c),q*0.42,0.82,z,{r:[0,q*0.2,q*0.35]});
      add(oct(0.14),glow('#ffe066'),0,1.18,0.25); add(sph(0.12),'#3a3060',0,0.82,0.4); for(const q of [-1,1]) add(sph(0.05),glow('#ffffff'),q*0.06,0.86,0.5); break;
  }
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; } });
  return g;
}
GAMES.beast={
  hint:'ZQSD / WASD : marcher · Glisser : tourner la caméra · touche une bestiole pour l\'affronter · 🐾 équipe · 📖 album',
  hudHTML:'<div class="pill">🫙 <b id="bsJar">0</b></div><div class="pill">🍓 <b id="bsBer">0</b></div><div class="pill">📖 <b id="bsDex">0/19</b></div><div class="pill" id="bsBadge">🏅</div>',
  far:260, bloom:0.45, bloomTh:0.82,
  solid:GAMES.royale.solid, gridAdd:GAMES.royale.gridAdd, gridRemove:GAMES.royale.gridRemove, query:GAMES.royale.query,
  vhouse(cx,cz,door,col,roof){ const H=3.6, T=0.4, hw=4, wm=tmat(col);
    const wx=(z,d)=>{ if(!d) this.solid(cx-hw,0,z-T/2,cx+hw,H,z+T/2,wm); else { this.solid(cx-hw,0,z-T/2,cx-1,H,z+T/2,wm); this.solid(cx+1,0,z-T/2,cx+hw,H,z+T/2,wm); this.solid(cx-1,2.4,z-T/2,cx+1,H,z+T/2,wm); } };
    const wz=x=>this.solid(x-T/2,0,cz-hw,x+T/2,H,cz+hw,wm);
    wx(cz+hw-T/2,door===0); wx(cz-hw+T/2,door===1); wz(cx+hw-T/2); wz(cx-hw+T/2);
    this.solid(cx-hw-0.3,H,cz-hw-0.3,cx+hw+0.3,H+0.3,cz+hw+0.3,tmat(roof)); const r=mk(cone(hw*1.5,2.2,4),tmat(roof)); r.position.set(cx,H+1.4,cz); r.rotation.y=Math.PI/4; this.scene.add(r); },
  start(){
    this.frozen=true; this.ready=false; this.fp=true; this.grid=new Map(); this.qs=0; this.ground={x0:-1e4,x1:1e4,y0:-1,y1:0,z0:-1e4,z1:1e4};
    setupScene(this.scene,'#4aa8ff','#e0f4ff',70,200); this.bounds=[-68,68,-68,68]; cam.dist=8; cam.pitch=0.42;
    heroPick(this,'beast',()=>{ if(S.beast.team&&S.beast.team.length) this.build(); else this.pickStarter(); });
  },
  pickStarter(){
    openChoice({title:'Choisis ta première bestiole',sub:'Elle t\'accompagnera partout. Les autres, tu pourras les capturer !',close:false,
      items:['brasou','goutelin','pousson'].map(s=>({ic:BS_T[BS_SP[s].t].ic,t:BS_SP[s].n,d:BS_T[BS_SP[s].t].n+' · '+BS_SP[s].d,cb:()=>{ S.beast.team=[bsNew(s,5)]; S.beast.box=[]; S.beast.jars=5; S.beast.ber=3; S.beast.seen=[s]; S.beast.caught=[s]; saveSoon(); this.build(); }}))});
  },
  build(){
    const sc=this.scene, W=this.W={};
    addSky(this,{top:'#3d94ff',mid:'#9ad8ff',bot:'#eaf8ff',sun:{u:0.35,el:38,r:20},hills:[['#8fd47e',10,0,0.012]],near:80,far:230});
    setLights(this,{hemi:['#ffffff','#7a9a5a',0.66],sun:['#fff4dc',0.8],dir:[18,32,12]});
    const mtx=new THREE.Matrix4(), v=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3(), rnd=mulberry32(4242);
    // île, plage, mer
    const gm=texMat('grass','#bfe6a0',60,60), gr=new THREE.Mesh(new THREE.CircleGeometry(74,48),gm); gr.geometry.userData.own=true; gr.rotation.x=-Math.PI/2; gr.receiveShadow=true; sc.add(gr);
    const sm=texMat('sand','#ffe7b8',30,30), sd=new THREE.Mesh(new THREE.RingGeometry(70,84,48),sm); sd.geometry.userData.own=true; sd.rotation.x=-Math.PI/2; sd.position.y=-0.04; sc.add(sd);
    const wm=new THREE.MeshLambertMaterial({color:'#38b6e8',transparent:true,opacity:0.85}); wm.userData.own=true; const sea=new THREE.Mesh(new THREE.PlaneGeometry(900,900),wm); sea.geometry.userData.own=true; sea.rotation.x=-Math.PI/2; sea.position.y=-0.3; sc.add(sea);
    // sols des zones
    for(const z of BS_ZONES){ const k=z.n==='Plage'?'sand':z.n==='Volcan'?'stone':'grass'; const m=texMat(k,z.n==='Volcan'?'#8a7a6a':z.n==='Plage'?'#ffe7b8':z.g,Math.round(z.r/2),Math.round(z.r/2)); const c=new THREE.Mesh(new THREE.CircleGeometry(z.r+3,32),m); c.geometry.userData.own=true; c.rotation.x=-Math.PI/2; c.position.set(z.x,0.01,z.z); c.receiveShadow=true; sc.add(c); }
    // chemins
    const path=(x0,z0,x1,z1)=>{ const L=Math.hypot(x1-x0,z1-z0), m=mk(box(3,0.04,+L.toFixed(1)),texMat('dirt','#e6cfa0',1,Math.round(L/3)),false); m.rotation.y=Math.atan2(x1-x0,z1-z0); m.position.set((x0+x1)/2,0.02,(z0+z1)/2); sc.add(m); };
    path(0,0,30,2); path(0,0,0,-40); path(0,0,-4,42); path(0,0,-38,-2); path(0,-40,36,-38);
    // herbes hautes (instanciées)
    const blades=[]; for(const z of BS_ZONES){ if(z.n==='Volcan') continue; for(let i=0;i<(z.n==='Plage'?160:340);i++){ const a=rnd()*TAU, r=Math.sqrt(rnd())*z.r; blades.push([z.x+Math.cos(a)*r,z.z+Math.sin(a)*r,0.5+rnd()*0.6,rnd()*TAU,z.n==='Plage'?1:0]); } }
    const bl=new THREE.InstancedMesh(box(0.12,1,0.12),lam('#4cc157'),blades.length); blades.forEach(([x,z,h,a],n)=>{ q.setFromEuler(new THREE.Euler(0.2*Math.sin(a),a,0.2*Math.cos(a))); mtx.compose(v.set(x,h/2,z),q,s.set(1,h,1)); bl.setMatrixAt(n,mtx); }); q.identity(); bl.instanceMatrix.needsUpdate=true; bl.frustumCulled=false; sc.add(bl);
    // fleurs dans la prairie
    const fl=[]; for(let i=0;i<120;i++){ const z=BS_ZONES[0], a=rnd()*TAU, r=Math.sqrt(rnd())*z.r; fl.push([z.x+Math.cos(a)*r,z.z+Math.sin(a)*r,i]); }
    const fi=new THREE.InstancedMesh(sph(0.12),lam('#ffffff'),fl.length); const cols=['#ff4f8b','#ffd23f','#ffffff','#b06bff'].map(c=>new THREE.Color(c)); fl.forEach(([x,z,i],n)=>{ mtx.compose(v.set(x,0.6,z),q,s.set(1,1,1)); fi.setMatrixAt(n,mtx); fi.setColorAt(n,cols[i%4]); }); fi.instanceMatrix.needsUpdate=true; if(fi.instanceColor) fi.instanceColor.needsUpdate=true; fi.frustumCulled=false; sc.add(fi);
    // forêt
    const trees=[]; for(let i=0;i<46;i++){ const z=BS_ZONES[1], a=rnd()*TAU, r=4+Math.sqrt(rnd())*(z.r+4); const x=z.x+Math.cos(a)*r, zz=z.z+Math.sin(a)*r; if(Math.abs(x)<2.5) continue; trees.push([x,zz,5+rnd()*4]); }
    const tr=new THREE.InstancedMesh(box(0.8,1,0.8),lam('#7a4b23'),trees.length), cp=new THREE.InstancedMesh(sph(1),lam('#2f9e48'),trees.length*2);
    trees.forEach(([x,z,h],n)=>{ mtx.compose(v.set(x,h/2,z),q,s.set(1,h,1)); tr.setMatrixAt(n,mtx); mtx.compose(v.set(x,h+0.8,z),q,s.set(2.8,2.2,2.8)); cp.setMatrixAt(n*2,mtx); mtx.compose(v.set(x+0.6,h-0.4,z+0.6),q,s.set(1.9,1.5,1.9)); cp.setMatrixAt(n*2+1,mtx); this.solid(x-0.4,0,z-0.4,x+0.4,h,z+0.4,null,{}); });
    [tr,cp].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.castShadow=true; m.frustumCulled=false; sc.add(m); });
    // plage : palmiers et coquillages
    for(let i=0;i<9;i++){ const z=BS_ZONES[2], a=i/9*TAU, r=z.r+2; const x=z.x+Math.cos(a)*r, zz=z.z+Math.sin(a)*r; if(Math.abs(x+2)<3&&zz<z.z) continue; const p=palmMesh(6+rnd()*2,0.3,rnd); p.g.position.set(x,0,zz); p.g.rotation.y=rnd()*TAU; sc.add(p.g); this.solid(x-0.3,0,zz-0.3,x+0.3,6,zz+0.3,null,{}); }
    // volcan
    { const z=BS_ZONES[3], g=new THREE.Group(); g.position.set(z.x-14,0,z.z-4); sc.add(g); const c=mk(cone(9,10,10),texC('stone','#6a5a50')); c.position.y=5; g.add(c);
      const lv=mk(cyl(1.6,1.6,0.3,12),new THREE.MeshBasicMaterial({color:'#ff6a1a'})); lv.material.userData.own=true; lv.position.y=9.7; g.add(lv); this.solid(z.x-21,0,z.z-11,z.x-7,9,z.z+3,null,{noCam:true}); this.volcano=g;
      const rk=[]; for(let i=0;i<14;i++){ const a=rnd()*TAU, r=3+rnd()*z.r; rk.push([z.x+Math.cos(a)*r,z.z+Math.sin(a)*r,0.6+rnd()*1.2]); }
      const ri=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),texC('stone','#7a6a5e'),rk.length); ri.geometry.userData.own=true; rk.forEach(([x,zz,k],n)=>{ mtx.compose(v.set(x,k*0.5,zz),q,s.set(k,k*0.8,k)); ri.setMatrixAt(n,mtx); this.solid(x-k*0.7,0,zz-k*0.7,x+k*0.7,k*0.8,zz+k*0.7,null,{}); }); ri.instanceMatrix.needsUpdate=true; ri.castShadow=true; ri.frustumCulled=false; sc.add(ri); }
    // village : maisons, fontaine de soin, boutique
    this.vhouse(-15,-12,0,'#ffd6a5','#e63946'); this.vhouse(15,-12,0,'#cde7ff','#3b82f6'); this.vhouse(-15,13,1,'#e0c3fc','#9b5de5'); this.vhouse(15,13,1,'#d0f4de','#2a9d8f');
    { const g=new THREE.Group(); sc.add(g); const st=texC('stone','#e6e0f0'); const b=mk(cyl(2.2,2.4,0.7,20),st); b.position.y=0.35; g.add(b); const wM=new THREE.MeshLambertMaterial({color:'#ff9ecf',emissive:'#c0307a',emissiveIntensity:0.5}); wM.userData.own=true;
      const w=mk(cyl(1.9,1.9,0.06,20),wM,false); w.position.y=0.66; g.add(w); const p=mk(cyl(0.25,0.35,1.6,10),st); p.position.y=1.4; g.add(p); const h=mk(oct(0.4),new THREE.MeshLambertMaterial({color:'#ff6fb0',emissive:'#ff2a8a',emissiveIntensity:0.9})); h.material.userData.own=true; h.position.y=2.6; g.add(h); this.heart=h;
      this.solid(-1.7,0,-1.7,1.7,0.7,1.7,null,{}); addAmb(this,{kind:'rise',fixed:true,cx:0,cz:0,w:1.4,h:1.8,y0:0.7,n:40,color:'#ffd6ef',size:0.15,glow:true}); }
    { const g=new THREE.Group(); g.position.set(7,0,5); sc.add(g); const c=mk(box(2.4,1.1,1.2),texC('wood','#e8c08a')); c.position.y=0.55; g.add(c);
      for(let i=0;i<5;i++){ const a=mk(box(0.5,0.08,1.6),lam(i%2?'#ffffff':'#ff4f8b')); a.position.set(-1+i*0.5,2.5,0.1); a.rotation.x=0.25; g.add(a); } for(const x of [-1.1,1.1]){ const p=mk(box(0.12,2.5,0.12),lam('#7a4b23')); p.position.set(x,1.25,-0.5); g.add(p); }
      const jar=this.jarMesh(); jar.position.set(-0.5,1.35,0); g.add(jar); const be=mk(sph(0.16),lam('#ff3a5a')); be.position.set(0.5,1.25,0); g.add(be); this.solid(5.8,0,4.4,8.2,1.1,5.6,null,{}); }
    this.npcs=[];
    const npc=(name,av,x,z,yaw)=>{ const A=makeAvatar(av,name,{}); A.root.position.set(x,0,z); A.root.rotation.y=yaw; sc.add(A.root); this.npcs.push({A,x,z}); this.solid(x-0.35,0,z-0.35,x+0.35,1.8,z+0.35,null,{}); return A; };
    npc('Mamie Tisane',{skin:'#ffe0bd',shirt:'#c3a6ff',pants:'#5a3a6a',shoes:'#2b2d42',face:'happy',hat:'bun',hair:'#e8e8f0',acc:'none'},2.6,-2.2,Math.PI*0.75);
    npc('Marchande Pomme',{skin:'#c68642',shirt:'#ff4f6d',pants:'#2b2d42',shoes:'#ffffff',face:'smile',hat:'bandana',hatC:'#ffd23f',acc:'none'},7,6.6,Math.PI);
    // arène du Capitaine Orage
    { const ax=36, az=-38, st=texC('stone','#cfc6e0'); const p=mk(cyl(8,8.4,0.5,28),st); p.position.set(ax,0.25,az); sc.add(p); this.solid(ax-6,0,az-6,ax+6,0.5,az+6,null,{});
      for(let i=0;i<8;i++){ const a=i/8*TAU, x=ax+Math.cos(a)*8.6, z=az+Math.sin(a)*8.6; const c=mk(box(0.8,4,0.8),st); c.position.set(x,2,z); sc.add(c); this.solid(x-0.4,0,z-0.4,x+0.4,4,z+0.4,null,{});
        const f=mk(box(0.06,1.2,0.9),lam(i%2?'#5f6bff':'#ffd23f')); f.position.set(x,4.6,z); f.rotation.y=-a; sc.add(f); }
      this.champA=npc('Capitaine Orage',{skin:'#8d5524',shirt:'#3a3f8f',pants:'#ffd23f',shoes:'#2b2d42',face:'cool',hat:'helmet',hatC:'#5f6bff',acc:'cape',accC:'#ffd23f'},ax,az-3,0); this.champ={x:ax,z:az-3}; }
    addClouds(this,12,[40,120],[30,45],[-120,120]);
    addAmb(this,{kind:'petals',color:'#ffe0f0',size:0.18,n:90,rel:true});
    // bestioles sauvages qui se promènent
    this.roam=[]; for(const z of BS_ZONES) for(let i=0;i<4;i++) this.roam.push(this.spawnRoam(z,i));
    this.mkBattleScene();
    // départ
    P.x=0; P.y=0; P.z=4.5; P.vx=P.vy=P.vz=0; P.yaw=0; cam.yaw=Math.PI; snapCam(); this.fp=false; this.frozen=false; this.ready=true; this.inB=null;
    const pk=this.pk||{}; this.speed=6.5*(pk.spd||1); this.healCd=0; this.shopArm=true; this.champArm=true;
    for(const k of ['team','box']) S.beast[k]=(S.beast[k]||[]).filter(c=>c&&BS_SP[c.s]&&c.lv>=1); if(!S.beast.team.length&&S.beast.box.length) S.beast.team.push(S.beast.box.shift());
    for(const c of S.beast.team.concat(S.beast.box)) bsStats(c);
    this.owUI(); banner('🐾 Touche les bestioles dans les herbes pour les affronter !'); bgmPlay('beast');
  },
  jarMesh(){ const g=new THREE.Group(); const gl=matC('bsjar',()=>new THREE.MeshLambertMaterial({color:'#c8f0ff',transparent:true,opacity:0.6,emissive:'#3a8ab0',emissiveIntensity:0.25})); g.add(mk(cyl(0.22,0.2,0.44,14),gl,false));
    const lid=mk(cyl(0.24,0.24,0.1,14),lam('#ffd23f'),false); lid.position.y=0.26; g.add(lid); const st=mk(oct(0.08),emat('#ffe066','#a07800'),false); st.position.set(0,0,0.2); st.scale.set(1,1,0.4); g.add(st); return g; },
  spawnRoam(z,i){
    const rare=z.rare&&Math.random()<0.06, s=rare?'lumirelle':z.pool[Math.floor(Math.random()*z.pool.length)], lv=rare?15:Math.floor(rand(z.lv[0],z.lv[1]+1));
    const a=Math.random()*TAU, r=Math.sqrt(Math.random())*z.r*0.85, m=bsMesh(s), k=0.75+lv*0.03; m.scale.setScalar(k);
    const o={z,s,lv,x:z.x+Math.cos(a)*r,zz:z.z+Math.sin(a)*r,tx:0,tz:0,t:Math.random()*3,m,hop:Math.random()*6,gone:0}; o.tx=o.x; o.tz=o.zz; m.position.set(o.x,0,o.zz); this.scene.add(m); return o; },
  // ---------- interface ----------
  owUI(){ gxSet('<button class="rbtn sm bsOw" data-k="team" style="right:12px;top:120px" aria-label="Équipe">🐾</button><button class="rbtn sm bsOw" data-k="dex" style="right:12px;top:186px" aria-label="Album">📖</button>'); $('hud').classList.remove('bsBattle'); },
  onBtn(k,on){ if(!on) return;
    if(!this.inB){ if(k==='team') this.teamMenu(); else if(k==='dex') this.dexMenu(); return; }
    const B=this.inB; if(B.state!=='choose') return;
    if(k[0]==='m'){ const mv=bsMoves(this.me())[+k.slice(1)]; if(mv) this.turn({k:'move',mv}); }
    else if(k==='jar'){ if(B.champ){ this.say('On ne capture pas les bestioles du Capitaine !'); return; } if(S.beast.jars<=0){ this.say('Plus de bocaux ! Achète-en à la boutique du village.'); return; } this.turn({k:'jar'}); }
    else if(k==='berry'){ if(S.beast.ber<=0){ this.say('Plus de baies de soin.'); return; } this.turn({k:'berry'}); }
    else if(k==='swap'){ const al=S.beast.team.map((c,i)=>[c,i]).filter(([c,i])=>i!==B.mi&&c.hp>0); if(!al.length){ this.say('Personne d\'autre ne peut se battre.'); return; }
      openChoice({title:'Qui envoyer ?',close:true,items:al.map(([c,i])=>({ic:BS_T[BS_SP[c.s].t].ic,t:BS_SP[c.s].n+' Nv '+c.lv,d:'❤️ '+c.hp+'/'+c.max,cb:()=>this.turn({k:'swap',to:i})}))}); }
    else if(k==='run'){ if(B.champ){ this.say('Impossible de fuir un défi de champion !'); return; } this.turn({k:'run'}); } },
  teamMenu(){ const T=S.beast.team, Bx=S.beast.box;
    openChoice({title:'🐾 Ton équipe',sub:'Touche une bestiole pour la mettre en tête. Les autres attendent à la pension.',close:true,
      items:T.map((c,i)=>({ic:BS_T[BS_SP[c.s].t].ic,t:BS_SP[c.s].n+' · Nv '+c.lv,d:'❤️ '+c.hp+'/'+c.max+(i===0?' · en tête':''),on:i===0,cb:()=>{ T.unshift(T.splice(i,1)[0]); saveSoon(); this.teamMenu(); }})).concat(
        Bx.map((c,i)=>({ic:'🏡',t:BS_SP[c.s].n+' · Nv '+c.lv,d:'À la pension : touche pour l\'échanger'+(T.length<4?' (place libre)':' avec '+BS_SP[T[T.length-1].s].n),cb:()=>{ const c2=Bx.splice(i,1)[0]; if(T.length<4) T.push(c2); else { Bx.push(T.pop()); T.push(c2); } saveSoon(); this.teamMenu(); }})))}); },
  dexMenu(){ const se=S.beast.seen, ca=S.beast.caught;
    openChoice({title:'📖 Album ('+ca.length+'/'+BS_IDS.length+')',sub:'Capture-les toutes !',close:true,wide:true,
      items:BS_IDS.map(id=>{ const sp=BS_SP[id], c=ca.indexOf(id)>=0, s=se.indexOf(id)>=0; return {ic:c?BS_T[sp.t].ic:s?'👀':'❓',t:c||s?sp.n:'???',d:c?BS_T[sp.t].n+' · '+sp.d:s?'Déjà vue, pas encore capturée':'Pas encore vue',cb:()=>this.dexMenu()}; })}); },
  // ---------- monde ----------
  update(dt){
    if(!this.ready) return;
    if(this.inB) return this.updBattle(dt);
    const t=this.time;
    if(this.heart){ this.heart.rotation.y+=dt*2; this.heart.position.y=2.6+Math.sin(t*2)*0.1; }
    for(const n of this.npcs) animAvatar(n.A,dt,0,true);
    // fontaine de soin
    this.healCd-=dt; if(Math.hypot(P.x,P.z)<3.2&&this.healCd<=0){ this.healCd=6; if(S.beast.team.some(c=>c.hp<c.max)){ S.beast.team.forEach(c=>c.hp=c.max); saveSoon(); sfx('cp'); confetti(this.scene,0,2,0); banner('💖 Mamie Tisane : tes bestioles sont en pleine forme !'); } }
    // boutique
    const dk=Math.hypot(P.x-7,P.z-5.9); if(dk>4) this.shopArm=true; if(dk<2.4&&this.shopArm){ this.shopArm=false; this.shop(); }
    // capitaine
    const dc=Math.hypot(P.x-this.champ.x,P.z-this.champ.z); if(dc>5) this.champArm=true;
    if(dc<2.6&&this.champArm){ this.champArm=false; openChoice({title:'⚔️ Capitaine Orage',sub:S.beast.badge?'« Encore toi ! Une revanche ? »':'« Montre-moi la force de tes bestioles ! » (3 bestioles de niveau 13 à 14)',close:true,
      items:[{ic:'⚔️',t:'Relever le défi',d:'Combat de champion',cb:()=>this.startBattle(BS_CHAMP.map(([s,l])=>bsNew(s,l)),true)},{ic:'🌱',t:'Plus tard',d:'Entraîne-toi encore un peu',cb:()=>{}}]}); }
    // bestioles sauvages
    for(let i=0;i<this.roam.length;i++){ const o=this.roam[i];
      if(o.gone>0){ o.gone-=dt; if(o.gone<=0){ this.scene.remove(o.m); this.roam[i]=this.spawnRoam(o.z,i); } continue; }
      o.t-=dt; const d=Math.hypot(P.x-o.x,P.z-o.zz);
      if(d<7&&S.beast.team.some(c=>c.hp>0)){ o.tx=P.x; o.tz=P.z; } else if(o.t<=0){ o.t=rand(2,5); const a=Math.random()*TAU, r=Math.sqrt(Math.random())*o.z.r*0.85; o.tx=o.z.x+Math.cos(a)*r; o.tz=o.z.z+Math.sin(a)*r; }
      const dx=o.tx-o.x, dz=o.tz-o.zz, l=Math.hypot(dx,dz); if(l>0.3){ const sp=(d<7?2.4:1.3)*dt; o.x+=dx/l*Math.min(sp,l); o.zz+=dz/l*Math.min(sp,l); o.m.rotation.y=Math.atan2(dx,dz); }
      o.hop+=dt*(l>0.3?9:3); o.m.position.set(o.x,Math.abs(Math.sin(o.hop))*0.18,o.zz);
      if(d<1.3&&S.beast.team.some(c=>c.hp>0)){ o.gone=20; o.m.visible=false; this.startBattle([bsNew(o.s,o.lv)],false); return; } }
    if(this.volcano&&Math.random()<0.08) burst(this.scene,this.volcano.position.x+rand(-1,1),10.5,this.volcano.position.z+rand(-1,1),'#9aa0aa',1,2);
  },
  shop(){ const B=S.beast;
    openChoice({title:'🛒 Boutique de Marchande Pomme',sub:'Tu as '+S.coins+' pièces · 🫙 '+B.jars+' · 🍓 '+B.ber,close:true,
      items:[{ic:'🫙',t:'Bocal à étoiles',d:'15 pièces · pour capturer une bestiole',cb:()=>this.buy('jars',15)},{ic:'🍓',t:'Baie de soin',d:'10 pièces · soigne une bestiole pendant un combat',cb:()=>this.buy('ber',10)},{ic:'👋',t:'Au revoir !',d:'',cb:()=>{}}]}); },
  buy(k,p){ if(S.coins<p){ sfx('nope'); banner('Il te manque '+(p-S.coins)+' pièces : gagne des combats !'); this.shop(); return; } S.coins-=p; S.beast[k]++; updateCoinsUI(); sfx('buy'); saveSoon(); this.shop(); },
  hud(){ if(!this.ready) return; const B=S.beast; setText('bsJar',B.jars); setText('bsBer',B.ber); setText('bsDex',B.caught.length+'/'+BS_IDS.length); const bd=$('bsBadge'); if(bd) bd.style.opacity=B.badge?'1':'0.35'; },
  // ---------- combat ----------
  mkBattleScene(){
    const bs=new THREE.Scene(), ow=this.scene, owSky=this.skyDome; setupScene(bs,'#5ab0ff','#eaf8ff',30,90); this.scene=bs;
    addSky(this,{top:'#4a9cff',mid:'#a8e0ff',bot:'#f0fbff',sun:{u:0.3,el:30,r:18},hills:[['#9be08a',14,0,0.012],['#6cc070',8,0,0.02]],near:30,far:110}); setLights(this,{hemi:['#ffffff','#7a9a5a',0.7],sun:['#fff4dc',0.8]});
    this.bSky=this.skyDome; this.scene=ow; this.skyDome=owSky; this.bScene=bs;
    const root=new THREE.Group(); bs.add(root); this.bRoot=root;
    const gm=texMat('grass','#a8e08a',12,12), gnd=new THREE.Mesh(new THREE.CircleGeometry(40,40),gm); gnd.geometry.userData.own=true; gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; root.add(gnd);
    for(const [x,z] of [[-1.7,1.3],[1.8,-1.6]]){ const p=mk(cyl(1.4,1.5,0.25,24),texC('stone','#e8e0f0')); p.position.set(x,0.12,z); root.add(p); const r=mk(cyl(1.42,1.42,0.05,24),lam('#ffffff'),false); r.position.set(x,0.27,z); root.add(r); }
    const tr=new THREE.InstancedMesh(sph(1),lam('#4cc157'),24), mtx=new THREE.Matrix4(), v=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3();
    for(let i=0;i<24;i++){ const a=i/24*TAU, r=14+(i%3)*4; mtx.compose(v.set(Math.cos(a)*r,1.5,Math.sin(a)*r-4),q,s.set(2.4,2.2,2.4)); tr.setMatrixAt(i,mtx); } tr.instanceMatrix.needsUpdate=true; tr.frustumCulled=false; root.add(tr);
  },
  me(){ return S.beast.team[this.inB.mi]; }, foe(){ return this.inB.foes[this.inB.fi]; },
  startBattle(foes,champ){
    const team=S.beast.team; let mi=team.findIndex(c=>c.hp>0); if(mi<0) return;
    for(const f of foes){ if(S.beast.seen.indexOf(f.s)<0) S.beast.seen.push(f.s); }
    this.inB={foes,fi:0,mi,champ,state:'anim',q:[],t:0,mine:null,theirs:null};
    this.owScene=this.scene; this.owSky=this.skyDome; this.scene=this.bScene; this.skyDome=this.bSky; this.frozen=true;
    this.bRoot.position.set(P.x,0,P.z); this.camUpd=this.bCam; this.placeMeshes(); $('hud').classList.add('bsBattle'); $('hud').classList.add('bsFlash'); setTimeout(()=>$('hud').classList.remove('bsFlash'),500);
    this.bUI(); bgmPlay(champ?'arena':'beastb'); sfx('boing');
    this.say(champ?'⚔️ Le Capitaine Orage envoie '+BS_SP[this.foe().s].n+' !':'Un '+BS_SP[this.foe().s].n+' sauvage apparaît !',1.2);
    this.say('À toi, '+BS_SP[this.me().s].n+' !',0.9); this.q({d:0.01,go:()=>{ this.inB.state='choose'; setText('bsMsg','Que doit faire '+BS_SP[this.me().s].n+' ?'); this.bHud(); }}); },
  placeMeshes(){ const B=this.inB, R=this.bRoot;
    if(B.mine) R.remove(B.mine); if(B.theirs) R.remove(B.theirs);
    const me=this.me(), fo=this.foe(); B.mine=bsMesh(me.s); B.mine.scale.setScalar(1.0+me.lv*0.015); B.mine.position.set(-1.7,0.27,1.3); B.mine.rotation.y=Math.atan2(3.5,-2.9); R.add(B.mine);
    B.theirs=bsMesh(fo.s); B.theirs.scale.setScalar(1.3+fo.lv*0.02); B.theirs.position.set(1.8,0.27,-1.6); B.theirs.rotation.y=Math.atan2(-3.5,2.9)+0.35; R.add(B.theirs); B.mine.userData.base=B.mine.scale.x; B.theirs.userData.base=B.theirs.scale.x; },
  bCam(dt){ const R=this.bRoot.position; camera.position.set(R.x-3.4,R.y+3.3,R.z+8.4); camera.lookAt(R.x+0.6,R.y+0.6,R.z-1.0); cam.px=camera.position.x; cam.py=camera.position.y; cam.pz=camera.position.z; },
  bUI(){ const me=this.me(), mv=bsMoves(me);
    gxSet('<div class="bsCard foe" style="top:110px;left:12px"><b id="bsFn"></b><span id="bsFl"></span><div class="bsHp"><i id="bsFh"></i></div></div>'+
      '<div class="bsPanel" style="left:8px;right:8px;bottom:8px"><div class="bsCard me"><b id="bsMn"></b><span id="bsMl"></span><small id="bsMt"></small><div class="bsHp"><i id="bsMh"></i></div><div class="bsXp"><i id="bsMx"></i></div></div>'+
      '<div id="bsMsg"></div><div class="bsMoves">'+mv.map((m,i)=>{ const M=BS_M[m], T=M.t?BS_T[M.t]:null; return '<button data-k="m'+i+'" style="background:'+(T?T.c:'#8d99ae')+'">'+(T?T.ic:'💥')+' '+M.n+'</button>'; }).join('')+'</div>'+
      '<div class="bsActs"><button data-k="jar">🫙 <span id="bsJ"></span></button><button data-k="berry">🍓 <span id="bsB"></span></button><button data-k="swap">🔄</button><button data-k="run">🏃</button></div></div>');
    this.bHud(); },
  bHud(){ const B=this.inB; if(!B) return; const me=this.me(), fo=this.foe();
    setText('bsFn',BS_T[BS_SP[fo.s].t].ic+' '+BS_SP[fo.s].n); setText('bsFl',' Nv '+fo.lv); setText('bsMn',BS_T[BS_SP[me.s].t].ic+' '+BS_SP[me.s].n); setText('bsMl',' Nv '+me.lv); setText('bsMt',Math.max(0,Math.ceil(B.mhp!==undefined?B.mhp:me.hp))+'/'+me.max);
    const fh=$('bsFh'), mh=$('bsMh'), mx=$('bsMx'); const fp=(B.fhp!==undefined?B.fhp:fo.hp)/fo.max, mp=(B.mhp!==undefined?B.mhp:me.hp)/me.max;
    if(fh){ fh.style.width=Math.max(0,fp*100)+'%'; fh.style.background=fp>0.5?'#3ad17a':fp>0.2?'#ffd23f':'#ff4f4f'; } if(mh){ mh.style.width=Math.max(0,mp*100)+'%'; mh.style.background=mp>0.5?'#3ad17a':mp>0.2?'#ffd23f':'#ff4f4f'; }
    if(mx) mx.style.width=Math.min(100,me.xp/bsXpNeed(me.lv)*100)+'%'; setText('bsJ',S.beast.jars); setText('bsB',S.beast.ber);
    const pn=document.querySelector?document.querySelector('#gx .bsPanel'):null; if(pn&&pn.classList) pn.classList.toggle('busy',B.state!=='choose'); },
  say(txt,d){ this.inB.q.push({d:d||1,go:()=>setText('bsMsg',txt)}); },
  q(a){ this.inB.q.push(a); },
  aiMove(a,d){ const mv=bsMoves(a); let best=mv[0], bv=-1; for(const m of mv){ const M=BS_M[m], v=M.pw*bsMult(M.t,BS_SP[d.s].t)*(M.t===BS_SP[a.s].t?1.25:1)*(0.7+Math.random()*0.6); if(v>bv){ bv=v; best=m; } } return best; },
  qAttack(a,d,m,mine){ const B=this.inB, M=BS_M[m];
    this.q({d:0.75,go:()=>{ if(a.hp<=0||d.hp<=0){ this.inB.q[0].d=0; return; } setText('bsMsg',BS_SP[a.s].n+' utilise '+M.n+' !'); sfx('swing'); },up:k=>{ const ms=mine?B.mine:B.theirs; if(!ms) return; const f=Math.sin(Math.min(1,k*1.6)*Math.PI)*0.9; ms.position.x=(mine?-1.7:1.8)+(mine?1:-1)*f; ms.position.z=(mine?1.3:-1.6)+(mine?-1:1)*f; }});
    this.q({d:0.6,go:()=>{ if(a.hp<=0||d.hp<=0){ this.inB.q[0].d=0; return; }
      const miss=Math.random()<0.05; if(miss){ setText('bsMsg','Raté !'); this.inB.q[0].res=null; return; }
      const mult=bsMult(M.t,BS_SP[d.s].t), stab=M.t&&M.t===BS_SP[a.s].t?1.25:1, crit=Math.random()<0.08?1.5:1, pk=this.pk||{};
      let dm=Math.floor(((a.lv*0.4+2)*M.pw*a.atk/d.def/22+2)*mult*stab*crit*rand(0.88,1)); if(!mine&&this.inB&&!this.inB.champ) dm=Math.max(1,Math.floor(dm*0.85)); dm=Math.max(1,dm);
      const h0=d.hp; d.hp=Math.max(0,d.hp-dm); this.inB.q[0].res={mult,crit,h0,dm}; sfx('hit');
      const tg=mine?B.theirs:B.mine; if(tg) burst(this.bScene,this.bRoot.position.x+tg.position.x,0.9,this.bRoot.position.z+tg.position.z,M.t?BS_T[M.t].c:'#ffffff',12,5,true); },
      up:k=>{ const r=this.inB.q[0]&&this.inB.q[0].res; const tg=mine?B.theirs:B.mine; if(!r||!tg) return; tg.position.x=(mine?1.8:-1.7)+Math.sin(k*40)*0.08*(1-k);
        const v=r.h0-(r.h0-d.hp)*Math.min(1,k*1.4); if(mine) B.fhp=v; else B.mhp=v; this.bHud(); },
      end:()=>{ if(mine) B.fhp=undefined; else B.mhp=undefined; this.bHud(); }});
    this.q({d:0.9,go:()=>{ if(d.hp<=0||a.hp<=0){ this.inB.q[0].d=0.01; return; } const mult=bsMult(M.t,BS_SP[d.s].t); if(mult>1) setText('bsMsg','C\'est super efficace ! 💥'); else if(mult<1) setText('bsMsg','Ce n\'est pas très efficace…'); else this.inB.q[0].d=0.01; }});
  },
  turn(act){
    const B=this.inB; B.state='anim'; this.bHud(); const me=this.me(), fo=this.foe(), fm=this.aiMove(fo,me);
    const foeAttack=()=>this.qAttack(fo,me,fm,false);
    if(act.k==='move'){ if(me.spd>=fo.spd){ this.qAttack(me,fo,act.mv,true); foeAttack(); } else { foeAttack(); this.qAttack(me,fo,act.mv,true); } }
    else if(act.k==='run'){ this.say('Tu t\'enfuis en courant !',0.9); this.q({d:0.1,go:()=>this.endBattle('run')}); return; }
    else if(act.k==='berry'){ S.beast.ber--; const h=Math.ceil(me.max*0.5); this.q({d:0.9,go:()=>{ me.hp=Math.min(me.max,me.hp+h); setText('bsMsg','🍓 '+BS_SP[me.s].n+' mange une baie : +'+h+' ❤️'); sfx('gem'); this.bHud(); }}); foeAttack(); }
    else if(act.k==='swap'){ const nc=S.beast.team[act.to]; this.q({d:0.9,go:()=>{ B.mi=act.to; this.placeMeshes(); this.bUI(); setText('bsMsg','À toi, '+BS_SP[nc.s].n+' !'); }}); this.qAttack(fo,nc,this.aiMove(fo,nc),false); }
    else if(act.k==='jar'){ this.throwJar(); return; }
    this.q({d:0.01,go:()=>this.afterTurn()});
  },
  throwJar(){
    const B=this.inB, fo=this.foe(), pk=this.pk||{}; S.beast.jars--; this.bHud();
    const chance=clamp(((1-fo.hp/fo.max)*0.75+0.2)*(pk.cap||1)*(BS_SP[fo.s].rare?0.5:1),0.1,0.95), ok=Math.random()<chance, shakes=ok?3:Math.floor(Math.random()*3);
    const jar=this.jarMesh(); jar.scale.setScalar(1.4); this.bRoot.add(jar); const s0=B.theirs.scale.x;
    this.q({d:0.7,go:()=>{ setText('bsMsg','🫙 Tu lances un bocal à étoiles…'); sfx('swing'); },up:k=>{ jar.position.set(lerp(-1.4,1.8,k),0.8+Math.sin(k*Math.PI)*2.2,lerp(1.2,-1.6,k)); jar.rotation.z=k*8; }});
    this.q({d:0.5,go:()=>{ burst(this.bScene,this.bRoot.position.x+1.8,1,this.bRoot.position.z-1.6,'#ffe066',14,5,true); sfx('pop'in SFX?'pop':'squeak'); },up:k=>{ B.theirs.scale.setScalar(s0*(1-k)); jar.position.y=lerp(1.2,0.6,k); jar.rotation.z=0; }});
    for(let i=0;i<shakes;i++) this.q({d:0.7,go:()=>{ sfx('click'); setText('bsMsg','.'.repeat(i+1)); },up:k=>{ jar.rotation.z=Math.sin(k*Math.PI*2)*0.45; }});
    if(ok){ this.q({d:1.4,go:()=>{ setText('bsMsg','✨ '+BS_SP[fo.s].n+' est capturé !'); sfx('win'); confetti(this.bScene,this.bRoot.position.x+1.8,1.2,this.bRoot.position.z-1.6);
        const T=S.beast.team; fo.xp=0; if(T.length<4) T.push(fo); else S.beast.box.push(fo); if(S.beast.caught.indexOf(fo.s)<0){ S.beast.caught.push(fo.s); banner('📖 Nouvelle bestiole dans l\'album !'); } addCoins(3); saveSoon(); }});
      this.q({d:0.1,go:()=>{ this.bRoot.remove(jar); this.endBattle('catch'); }}); }
    else { this.q({d:0.8,go:()=>{ setText('bsMsg','Oh non ! '+BS_SP[fo.s].n+' s\'est échappé !'); sfx('nope'); this.bRoot.remove(jar); B.theirs.scale.setScalar(s0); }});
      this.qAttack(fo,this.me(),this.aiMove(fo,this.me()),false); this.q({d:0.01,go:()=>this.afterTurn()}); }
  },
  afterTurn(){
    const B=this.inB, me=this.me(), fo=this.foe();
    if(fo.hp<=0){ const pk=this.pk||{}, gain=Math.floor(fo.lv*9*(pk.xp||1)*(B.champ?1.5:1));
      this.q({d:0.9,go:()=>{ setText('bsMsg',BS_SP[fo.s].n+' est K.O. !'); sfx('poof'); },up:k=>{ if(B.theirs){ B.theirs.scale.setScalar(B.theirs.userData.base*(1-k)); B.theirs.position.y=0.27-k*0.4; } }});
      this.q({d:1.0,go:()=>{ setText('bsMsg',BS_SP[me.s].n+' gagne '+gain+' points d\'expérience !'); this.giveXp(me,gain); }});
      if(B.fi<B.foes.length-1){ this.q({d:1.0,go:()=>{ B.fi++; this.placeMeshes(); this.bUI(); setText('bsMsg','Le Capitaine Orage envoie '+BS_SP[this.foe().s].n+' !'); }}); this.q({d:0.01,go:()=>{ B.state='choose'; this.bHud(); }}); }
      else this.q({d:0.3,go:()=>this.endBattle('win')});
      return; }
    if(me.hp<=0){ const next=S.beast.team.findIndex(c=>c.hp>0);
      this.q({d:0.9,go:()=>{ setText('bsMsg',BS_SP[me.s].n+' est K.O. !'); sfx('poof'); },up:k=>{ if(B.mine) B.mine.scale.setScalar(B.mine.userData.base*(1-k)); }});
      if(next>=0) this.q({d:1.0,go:()=>{ B.mi=next; this.placeMeshes(); this.bUI(); setText('bsMsg','À toi, '+BS_SP[this.me().s].n+' !'); },end:()=>{ B.state='choose'; this.bHud(); }});
      else this.q({d:0.3,go:()=>this.endBattle('lose')});
      return; }
    B.state='choose'; setText('bsMsg','Que doit faire '+BS_SP[me.s].n+' ?'); this.bHud();
  },
  giveXp(c,n){ c.xp+=n; while(c.xp>=bsXpNeed(c.lv)&&c.lv<30){ c.xp-=bsXpNeed(c.lv); const oldMv=bsMoves(c).length; c.lv++; const om=c.max; bsStats(c); c.hp=Math.min(c.max,c.hp+(c.max-om)+Math.ceil(c.max*0.2));
      const lvTxt=BS_SP[c.s].n+' passe au niveau '+c.lv+' !'; this.inB.q.splice(1,0,{d:1.0,go:()=>{ setText('bsMsg','⬆️ '+lvTxt); sfx('gem'); this.bHud(); }});
      if(bsMoves(c).length>oldMv){ const nm=BS_M[bsMoves(c)[bsMoves(c).length-1]].n; this.inB.q.splice(2,0,{d:1.0,go:()=>{ setText('bsMsg','✨ Nouvelle attaque : '+nm+' !'); this.bUI(); }}); } }
    this.bHud(); saveSoon(); },
  endBattle(how){
    const B=this.inB; this.inB=null; this.scene=this.owScene; this.skyDome=this.owSky; this.frozen=false; this.camUpd=null; if(B.mine) this.bRoot.remove(B.mine); if(B.theirs) this.bRoot.remove(B.theirs);
    this.owUI(); bgmPlay('beast'); snapCam();
    if(how==='win'){ addCoins(B.champ?60:4+B.foes[0].lv); if(B.champ){ const first=!S.beast.badge; S.beast.badge=1; saveSoon(); sfx('win');
        showResult({icon:'🏅',title:first?'Badge de l\'Orage gagné !':'Revanche gagnée !',sub:'Tes bestioles ont battu le Capitaine Orage, bravo '+S.name+' !',stats:[['Bestioles capturées',S.beast.caught.length+' / '+BS_IDS.length],['Équipe',S.beast.team.map(c=>BS_SP[c.s].n+' '+c.lv).join(', ')],['Pièces gagnées','+60']]}); return; } }
    if(how==='lose'){ S.beast.team.forEach(c=>c.hp=c.max); P.x=0; P.z=4.5; P.vx=P.vz=0; snapCam(); banner('😵 Tes bestioles sont fatiguées… Mamie Tisane les a soignées.'); }
    // évolutions
    for(const c of S.beast.team){ const ev=BS_SP[c.s].ev; if(ev&&c.lv>=ev[1]){ const old=BS_SP[c.s].n; c.s=ev[0]; bsStats(c); c.hp=c.max; if(S.beast.caught.indexOf(c.s)<0) S.beast.caught.push(c.s); if(S.beast.seen.indexOf(c.s)<0) S.beast.seen.push(c.s);
        sfx('win'); confetti(this.scene,P.x,P.y+2,P.z); banner('🌟 '+old+' évolue en '+BS_SP[c.s].n+' !'); } }
    saveSoon(); $('hud').classList.remove('bsBattle');
  },
  updBattle(dt){
    const B=this.inB, t=this.time;
    if(B.mine&&B.state==='choose') B.mine.position.y=0.27+Math.abs(Math.sin(t*3))*0.06; if(B.theirs&&B.foes[B.fi].hp>0) B.theirs.position.y=0.27+Math.abs(Math.sin(t*3+1))*0.06;
    const a=B.q[0]; if(!a) return;
    if(!a.st){ a.st=1; a.t=0; if(a.go) a.go(); if(this.inB!==B) return; }
    a.t+=dt; if(a.up) a.up(Math.min(1,a.t/Math.max(0.01,a.d)));
    if(a.t>=a.d){ if(a.end) a.end(); if(this.inB!==B) return; B.q.shift(); }
  },
  idle(dt){ if(this.inB) this.updBattle(dt); },
  stop(){ if(this.inB){ this.scene=this.owScene; this.skyDome=this.owSky; this.inB=null; } if(this.bScene) disposeScene(this.bScene); $('hud').classList.remove('bsBattle','bsFlash'); this.camUpd=null; }
};
SONGS.beast={bpm:116,root:60,scale:[0,2,4,5,7,9,11],lead:'triangle',bass:'sine',prog:[0,5,3,4],mel:[0,null,4,null,7,null,4,5, 4,null,2,null,0,null,null,null, 5,null,4,2,4,null,7,null, 5,4,2,null,0,null,null,null],drum:'k..hs.h.k.khs.h.',vol:0.7,pluck:true};
SONGS.beastb={bpm:150,root:57,scale:[0,2,3,5,7,8,10],lead:'square',bass:'sawtooth',prog:[0,5,6,4],mel:[0,null,3,0,5,null,3,null, 7,null,5,3,2,null,0,null, 0,null,3,0,5,null,8,7, 5,3,2,3,0,null,null,null],drum:'k.hsk.hsk.hsk.hs',vol:0.55,octBass:true};
GAME_EXTRA.push({id:'beast',ic:'🐾',t:'Bestioles Magiques',d:'Explore l\'île, attrape 19 bestioles dans des bocaux à étoiles, fais-les évoluer et bats le Capitaine Orage !',bg:'linear-gradient(140deg,#ff9f1c,#3ad17a)',
  best:()=>S.beast.team&&S.beast.team.length?'📖 '+S.beast.caught.length+'/19'+(S.beast.badge?' · 🏅':''):'Nouveau !'});
