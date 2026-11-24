/* =========================================================
   19. Héros inventés, accessoires d'avatar, boutons de jeu,
       qualité graphique automatique et post-traitement
       (lueur, couleurs, vignette, anticrénelage)
   ========================================================= */
HATS.push(
  {id:'helmet',name:'Casque de course',ic:'⛑️',price:140},{id:'explorer',name:'Chapeau d\'explorateur',ic:'🤠',price:120},
  {id:'leaf',name:'Bonnet feuille',ic:'🌱',price:70},{id:'flowers',name:'Couronne de fleurs',ic:'🌺',price:90},
  {id:'starband',name:'Serre-tête étoile',ic:'⭐',price:80},{id:'beanie',name:'Bonnet à pompon',ic:'🧶',price:60},
  {id:'bandana',name:'Bandana',ic:'🎀',price:50},{id:'toque',name:'Toque de chef',ic:'👨‍🍳',price:90},
  {id:'shellhelm',name:'Casque carapace',ic:'🪖',price:130},{id:'hoodears',name:'Capuche à oreilles',ic:'🐾',price:110},
  {id:'pony',name:'Queue de cheval',ic:'💇',price:60},{id:'spiky',name:'Cheveux en pics',ic:'⚡',price:60},{id:'bun',name:'Chignon',ic:'🍡',price:60});
FACES.push({id:'bandit',name:'Masque malin',price:70},{id:'glasses',name:'Lunettes rondes',price:50});
const GAME_EXTRA=[];
const ACCS=[{id:'none',name:'Aucun',ic:'🚫',price:0},{id:'backpack',name:'Sac à dos',ic:'🎒',price:60},{id:'satchel',name:'Sacoche',ic:'👜',price:50},
  {id:'scarf',name:'Écharpe',ic:'🧣',price:50},{id:'cape',name:'Cape',ic:'🦸',price:120},{id:'tail',name:'Queue rayée',ic:'🦝',price:90},
  {id:'shell',name:'Carapace',ic:'🐢',price:110},{id:'wings',name:'Petites ailes',ic:'🪽',price:150},{id:'goggles',name:'Lunettes d\'aviateur',ic:'🥽',price:70},
  {id:'jetpack',name:'Fusée dorsale',ic:'🚀',price:200}];
const HAIRS=['#2b1d14','#5a3a1e','#a0522d','#e0b050','#f2e6c8','#d8d0c8','#c0392b','#ff8fc7','#6d3fd6','#3b82f6'];
/* 15 héros inventés : 3 par nouveau jeu (pk = petit avantage) */
const HEROES=[
  {id:'zig',g:'race',n:'Ziggy Turbo',ic:'🏎️',d:'Vitesse max un peu plus haute',pk:{top:1.06},car:{c:'#ff7a2f',s:0},av:{skin:'#f1c27d',shirt:'#ff7a2f',pants:'#2b2d42',shoes:'#ffffff',face:'cool',hat:'helmet',hatC:'#ff7a2f',acc:'scarf',accC:'#ffd23f'}},
  {id:'comete',g:'race',n:'Capitaine Comète',ic:'☄️',d:'Le turbo dure plus longtemps',pk:{nitro:1.35},car:{c:'#3b82f6',s:1},av:{skin:'#8d5524',shirt:'#3b82f6',pants:'#ffffff',shoes:'#2b2d42',face:'smile',hat:'helmet',hatC:'#ffffff',acc:'cape',accC:'#1e3a8a'}},
  {id:'mina',g:'race',n:'Mina Volt',ic:'⚡',d:'Tourne plus serré dans les virages',pk:{grip:1.22},car:{c:'#b06bff',s:2},av:{skin:'#ffe0bd',shirt:'#9b5de5',pants:'#2b2d42',shoes:'#ff8fc7',face:'wink',hat:'pony',hair:'#ff8fc7',acc:'goggles'}},
  {id:'pepin',g:'plat',n:'Pépin',ic:'🌱',d:'Saute plus haut',pk:{jump:1.12},av:{skin:'#f1c27d',shirt:'#3ad17a',pants:'#a0703c',shoes:'#5a3a1e',face:'happy',hat:'leaf',acc:'backpack'}},
  {id:'nova',g:'plat',n:'Nova',ic:'⭐',d:'Plane en gardant le saut appuyé',pk:{glide:1},av:{skin:'#c68642',shirt:'#ffd23f',pants:'#4f7bff',shoes:'#ffffff',face:'star',hat:'starband',acc:'scarf',accC:'#ff4f8b'}},
  {id:'biscotte',g:'plat',n:'Biscotte',ic:'🧁',d:'Commence avec une bulle protectrice',pk:{bubble:1},av:{skin:'#ffe0bd',shirt:'#ffffff',pants:'#ff8fc7',shoes:'#a0703c',face:'wink',hat:'toque'}},
  {id:'tibo',g:'jungle',n:'Tibo Carapace',ic:'🛡️',d:'Sa toupie dure plus longtemps',pk:{spin:1.5},av:{skin:'#e0ac69',shirt:'#c98b4f',pants:'#4f7bff',shoes:'#ff4d6d',face:'happy',hat:'shellhelm',acc:'shell'}},
  {id:'lili',g:'jungle',n:'Lili Liane',ic:'🌺',d:'Saute plus haut',pk:{jump:1.12},av:{skin:'#8d5524',shirt:'#ff4f8b',pants:'#3ad17a',shoes:'#ffd23f',face:'smile',hat:'flowers',acc:'satchel'}},
  {id:'rako',g:'jungle',n:'Rako',ic:'🦝',d:'Court plus vite',pk:{spd:1.12},av:{skin:'#f1c27d',shirt:'#8d99ae',pants:'#2b2d42',shoes:'#ff7a2f',face:'bandit',hat:'hoodears',hatC:'#8d99ae',acc:'tail'}},
  {id:'ines',g:'temple',n:'Inès Boussole',ic:'🧭',d:'Un cœur de plus',pk:{hp:1},av:{skin:'#c68642',shirt:'#4f8a3a',pants:'#c9a46a',shoes:'#5a3a1e',face:'smile',hat:'explorer',acc:'backpack'}},
  {id:'bao',g:'temple',n:'Bao le Cartographe',ic:'🗺️',d:'Saute plus haut',pk:{jump:1.12},av:{skin:'#f1c27d',shirt:'#2ec4b6',pants:'#2b2d42',shoes:'#a0703c',face:'happy',hat:'bandana',hatC:'#e63946',acc:'satchel'}},
  {id:'pistache',g:'temple',n:'Pr Pistache',ic:'🔍',d:'Son radar montre les reliques',pk:{radar:1},av:{skin:'#ffe0bd',shirt:'#9be7a0',pants:'#5a3a1e',shoes:'#2b2d42',face:'glasses',hat:'bun',hair:'#d8d0c8',acc:'goggles'}},
  {id:'leon',g:'beast',n:'Léon Lanterne',ic:'🎒',d:'Ses bestioles gagnent plus d\'expérience',pk:{xp:1.3},av:{skin:'#e0ac69',shirt:'#3ad17a',pants:'#a0703c',shoes:'#ffffff',face:'happy',hat:'beanie',hatC:'#ff9f1c',acc:'backpack'}},
  {id:'zelie',g:'beast',n:'Zélie Étoile',ic:'✨',d:'Capture plus facilement',pk:{cap:1.25},av:{skin:'#8d5524',shirt:'#6d3fd6',pants:'#2b2d42',shoes:'#ffd23f',face:'star',hat:'pony',hair:'#2b1d14',acc:'cape',accC:'#b06bff'}},
  {id:'malo',g:'beast',n:'Malo Boussole',ic:'🧣',d:'Marche plus vite',pk:{spd:1.15},av:{skin:'#ffe0bd',shirt:'#ff7a2f',pants:'#4f7bff',shoes:'#2b2d42',face:'wink',hat:'spiky',hair:'#e0b050',acc:'scarf',accC:'#3b82f6'}}];
const HERO_BY_ID={}; HEROES.forEach(h=>{ HERO_BY_ID[h.id]=h; h.price=160; });
{ const bh0=buildHat;
  buildHat=function(id,av){
    const g=new THREE.Group(); let spin=null; const hc=av.hatC||av.shirt, hair=lam(av.hair||'#5a3a1e');
    const add=(geo,mat,x,y,z)=>{ const m=mk(geo,mat); m.position.set(x,y,z); g.add(m); return m; };
    const hairCap=()=>{ add(box(0.54,0.14,0.54),hair,0,0.02,0); add(box(0.54,0.24,0.08),hair,0,-0.1,-0.25); };
    switch(id){
      case 'helmet': add(box(0.62,0.32,0.62),lam(hc),0,-0.04,0); add(box(0.64,0.08,0.64),lam('#ffffff'),0,0.1,0); add(box(0.5,0.16,0.05),emat('#1d1846','#0a1a3a'),0,-0.1,0.31); add(box(0.62,0.12,0.12),lam(hc),0,-0.24,-0.26); break;
      case 'explorer': add(cyl(0.48,0.48,0.04,22),lam('#c9a46a'),0,0.02,0); add(cyl(0.27,0.3,0.26,18),lam('#c9a46a'),0,0.16,0); add(cyl(0.305,0.305,0.07,18),lam('#7a4b23'),0,0.07,0); break;
      case 'leaf': add(box(0.54,0.18,0.54),lam('#3ad17a'),0,0.05,0); add(box(0.08,0.18,0.08),lam('#7a4b23'),0,0.22,0); { const l=add(box(0.32,0.04,0.16),lam('#5fd36a'),0.14,0.3,0); l.rotation.z=0.4; const l2=add(box(0.26,0.04,0.13),lam('#3fae4a'),-0.12,0.28,0.02); l2.rotation.z=-0.5; } break;
      case 'flowers': for(let i=0;i<8;i++){ const a=i/8*TAU; add(sph(0.08),lam(['#ff4f8b','#ffd23f','#ffffff','#b06bff'][i%4]),Math.cos(a)*0.27,0.03,Math.sin(a)*0.27); } add(box(0.56,0.04,0.56),lam('#3fae4a'),0,0,0); break;
      case 'starband': add(box(0.54,0.07,0.54),lam('#ff4f8b'),0,-0.02,0); { const s=add(oct(0.14),emat('#ffd23f','#7a5a00'),0,0.08,0.28); s.scale.set(1,1,0.4); } break;
      case 'beanie': add(box(0.56,0.24,0.56),lam(hc),0,0.06,0); add(box(0.58,0.08,0.58),lam('#ffffff'),0,-0.05,0); add(sph(0.1),lam('#ffffff'),0,0.24,0); break;
      case 'bandana': add(box(0.55,0.1,0.55),lam(hc),0,-0.02,0); { const k=add(box(0.1,0.18,0.05),lam(hc),0.08,-0.12,-0.29); k.rotation.z=0.4; const k2=add(box(0.1,0.16,0.05),lam(hc),-0.06,-0.12,-0.29); k2.rotation.z=-0.4; } break;
      case 'toque': add(box(0.5,0.12,0.5),lam('#ffffff'),0,0.04,0); add(cyl(0.3,0.24,0.3,14),lam('#ffffff'),0,0.25,0); add(sph(0.2),lam('#ffffff'),0.12,0.42,0); add(sph(0.2),lam('#ffffff'),-0.12,0.42,0.04); break;
      case 'shellhelm': for(let i=0;i<4;i++){ add(box(0.6,0.12,0.15),lam(i%2?'#a89070':'#8d7a64'),0,0.04+Math.sin(i/3*Math.PI)*0.08,-0.22+i*0.15); } add(box(0.56,0.1,0.56),lam('#7a6650'),0,-0.04,0); break;
      case 'hoodears': add(box(0.6,0.22,0.6),lam(hc),0,0.0,0); add(box(0.6,0.5,0.1),lam(hc),0,-0.18,-0.29);
        for(const s of [-1,1]){ const e=add(cone(0.11,0.24,4),lam(hc),s*0.19,0.22,0); e.rotation.y=Math.PI/4; add(cone(0.06,0.13,4),lam('#ffb3c7'),s*0.19,0.2,0.04).rotation.y=Math.PI/4; } break;
      case 'pony': hairCap(); { const p=add(box(0.16,0.42,0.14),hair,0,-0.2,-0.36); p.rotation.x=0.35; add(box(0.12,0.08,0.12),lam('#ffd23f'),0,0.02,-0.3); } break;
      case 'spiky': hairCap(); for(let i=0;i<6;i++){ const a=(i/5-0.5)*1.6; const c=add(cone(0.09,0.26,5),hair,Math.sin(a)*0.18,0.16,-0.05+Math.cos(i)*0.08); c.rotation.z=-a*0.5; } break;
      case 'bun': hairCap(); add(sph(0.15),hair,0,0.14,-0.12); break;
      default: return bh0(id,av);
    }
    return {g,spin};
  }; }
{ const fc0=faceCanvas;
  faceCanvas=function(face,skin){
    if(face!=='bandit'&&face!=='glasses') return fc0(face,skin);
    const c=makeCanvas(128,128), g=c.getContext('2d'), ink='#1d1846';
    g.fillStyle=skin; g.fillRect(0,0,128,128); g.lineCap='round'; g.lineWidth=7;
    if(face==='bandit'){ g.fillStyle='#3a3550'; roundRect(g,10,38,108,32,14); g.fill(); g.fillStyle='#fff'; g.beginPath(); g.arc(44,54,11,0,TAU); g.arc(84,54,11,0,TAU); g.fill();
      g.fillStyle=ink; g.beginPath(); g.arc(46,55,6,0,TAU); g.arc(86,55,6,0,TAU); g.fill(); g.strokeStyle=ink; g.beginPath(); g.arc(64,78,18,0.2*Math.PI,0.8*Math.PI); g.stroke(); }
    else { g.strokeStyle=ink; g.lineWidth=5; g.beginPath(); g.arc(44,56,15,0,TAU); g.stroke(); g.beginPath(); g.arc(84,56,15,0,TAU); g.stroke(); g.beginPath(); g.moveTo(59,56); g.lineTo(69,56); g.stroke();
      g.fillStyle=ink; g.beginPath(); g.arc(44,57,5,0,TAU); g.arc(84,57,5,0,TAU); g.fill(); g.lineWidth=6; g.beginPath(); g.arc(64,80,16,0.2*Math.PI,0.8*Math.PI); g.stroke(); }
    return c; }; }
function buildAcc(id,av,body,head){
  if(!id||id==='none') return null;
  const g=new THREE.Group(); (id==='goggles'?head:body).add(g); let anim=null; const ac=av.accC;
  const add=(geo,mat,x,y,z,par)=>{ const m=mk(geo,mat); m.position.set(x,y,z); (par||g).add(m); return m; };
  switch(id){
    case 'backpack': add(box(0.5,0.52,0.24),lam(ac||'#a0703c'),0,1.02,-0.31); add(box(0.4,0.2,0.08),lam('#8a5a2b'),0,0.88,-0.46);
      { const r=add(cyl(0.1,0.1,0.48,10),lam('#4f8a3a'),0,1.32,-0.33); r.rotation.z=Math.PI/2; } for(const s of [-1,1]) add(box(0.07,0.6,0.04),lam('#5a3a1e'),s*0.18,1.02,0.2); break;
    case 'satchel': { const st=add(box(0.07,0.95,0.42),lam('#7a4b23'),0,1.0,0); st.rotation.z=0.75; add(box(0.18,0.3,0.32),lam(ac||'#c98b4f'),-0.42,0.72,0.05); } break;
    case 'scarf': { add(box(0.72,0.14,0.42),lam(ac||'#ff4f6d'),0,1.36,0); const pv=new THREE.Group(); pv.position.set(0.16,1.33,-0.21); g.add(pv);
      add(box(0.14,0.48,0.05),lam(ac||'#ff4f6d'),0,-0.22,0,pv); anim=(A,dt,mv)=>{ pv.rotation.x=lerp(pv.rotation.x,(mv?0.9:0.15)+Math.sin(A.t*9)*0.12*(mv?1:0.3),damp(8,dt)); }; } break;
    case 'cape': { const pv=new THREE.Group(); pv.position.set(0,1.32,-0.21); g.add(pv); add(box(0.66,0.95,0.04),lam(ac||'#e63946'),0,-0.47,0,pv);
      anim=(A,dt,mv)=>{ pv.rotation.x=lerp(pv.rotation.x,(mv?0.55:0.08)+Math.sin(A.t*7)*0.05,damp(6,dt)); }; } break;
    case 'tail': { const pv=new THREE.Group(); pv.position.set(0,0.72,-0.2); g.add(pv);
      for(let i=0;i<5;i++) add(box(0.17,0.17,0.2),lam(i%2?'#3a3550':(ac||'#8d99ae')),0,i*0.1,-0.12-i*0.16,pv);
      anim=(A,dt,mv)=>{ pv.rotation.y=Math.sin(A.t*(mv?9:3))*0.35; pv.rotation.x=-0.25; }; } break;
    case 'shell': { const d=add(sph(0.45),lam(ac||'#8d7a64'),0,1.0,-0.2); d.scale.set(0.85,0.95,0.5); for(let i=0;i<3;i++) add(box(0.7,0.06,0.3),lam('#6b5a48'),0,0.78+i*0.2,-0.33); } break;
    case 'wings': { const ws=[]; for(const s of [-1,1]){ const pv=new THREE.Group(); pv.position.set(s*0.12,1.18,-0.22); g.add(pv); const w=add(box(0.55,0.3,0.04),lam(ac||'#e0f2ff'),s*0.27,0.05,0,pv); w.rotation.z=s*0.3; ws.push([pv,s]); }
      anim=(A,dt,mv)=>{ for(const [pv,s] of ws) pv.rotation.y=s*(0.4+Math.sin(A.t*(mv?14:4))*0.35); }; } break;
    case 'goggles': add(box(0.53,0.07,0.53),lam('#3a3550'),0,0.13,0); for(const s of [-1,1]){ add(cyl(0.09,0.09,0.06,12),lam('#c9a46a'),s*0.12,0.14,0.27).rotation.x=Math.PI/2; add(cyl(0.065,0.065,0.07,12),emat('#8fd0ff','#1a5a8a'),s*0.12,0.14,0.28).rotation.x=Math.PI/2; } break;
    case 'jetpack': { for(const s of [-1,1]){ add(cyl(0.12,0.12,0.5,10),lam('#c0c8d4'),s*0.15,1.05,-0.32); add(cone(0.12,0.16,10),lam('#ff4f6d'),s*0.15,1.38,-0.32); }
      const fl=[]; for(const s of [-1,1]){ const f=add(cone(0.08,0.24,8),new THREE.MeshBasicMaterial({color:'#ffb020'}),s*0.15,0.68,-0.32); f.material.userData.own=true; f.rotation.x=Math.PI; fl.push(f); }
      anim=(A,dt,mv)=>{ for(const f of fl) f.scale.y=(mv?1:0.6)+Math.random()*0.4; }; } break;
  }
  return {g,anim};
}
/* ---------- choix du héros au début d'un nouveau jeu ---------- */
function heroUse(Gm,h,opts){
  const old=PA; PA=makeAvatar(h.av,h.n,opts||{}); Gm.scene.add(PA.root);
  if(old){ PA.root.position.copy(old.root.position); disposeAvatar(old); }
  Gm.hero=h; Gm.pk=h.pk||{};
}
function heroPick(Gm,gid,cb,opts){
  const hs=HEROES.filter(h=>h.g===gid), last=S.heroPick[gid];
  openChoice({title:'Choisis ton héros',sub:'Chaque héros a son petit avantage. Tu peux aussi les acheter comme avatars dans la boutique !',close:false,
    items:hs.map(h=>({ic:h.ic,t:h.n,d:h.d,on:h.id===last,cb:()=>{ S.heroPick[gid]=h.id; saveSoon(); heroUse(Gm,h,opts); if(cb) cb(h); }}))});
}
/* ---------- boutons propres à chaque jeu (#gx), par délégation ---------- */
{ const gx=$('gx'), kOf=e=>{ const t=e.target; const b=t&&t.closest?t.closest('[data-k]'):null; return b; };
  gx.addEventListener('pointerdown',e=>{ const b=kOf(e); if(!b||!G||!G.onBtn) return; e.preventDefault(); e.stopPropagation(); unlockAudio(); b.classList.add('down'); try{ b.setPointerCapture(e.pointerId); }catch(_){} G.onBtn(b.dataset.k,true); });
  const up=e=>{ const b=kOf(e); if(!b) return; b.classList.remove('down'); if(G&&G.onBtn) G.onBtn(b.dataset.k,false); };
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>gx.addEventListener(t,up)); }
function gxSet(html){ const gx=$('gx'); gx.innerHTML=html||''; }
/* ---------- qualité graphique ---------- */
const GFXL={high:{n:'Haute',pr:2,sh:2048,ext:30,post:1,amb:1.25},med:{n:'Moyenne',pr:1.5,sh:1024,ext:24,post:0,amb:1},low:{n:'Basse',pr:1,sh:0,ext:22,post:0,amb:0.55}};
const GFX={lv:'high',amb:1,post:null,n:0,t0:0,last:0}; GFX.lv=gfxLevel(); GFX.amb=GFXL[GFX.lv].amb;
function gfxLevel(){ return GFXL[S.gfx]?S.gfx:(GFXL[S.gfxAuto]?S.gfxAuto:'high'); }
function gfxShadow(sc){ const sun=sc&&sc.userData&&sc.userData.sun; if(!sun) return; const L=GFXL[GFX.lv];
  sun.castShadow=!!L.sh; if(L.sh&&sun.shadow.mapSize.x!==L.sh){ if(sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map=null; } sun.shadow.mapSize.set(L.sh,L.sh); } }
function gfxApply(){
  GFX.lv=gfxLevel(); const L=GFXL[GFX.lv]; GFX.amb=L.amb;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,L.pr));
  if(L.post&&GFX.post===null) postInit();
  document.body.classList.toggle('vig',!(L.post&&GFX.post)&&GFX.lv!=='low');
  gfxShadow(lobby.scene); if(G) gfxShadow(G.scene);
  resize();
}
function gfxCycle(){ const order=['auto','high','med','low'], i=order.indexOf(GFXL[S.gfx]?S.gfx:'auto'); S.gfx=order[(i+1)%4]; if(S.gfx==='auto') S.gfxAuto='high'; save(); gfxApply();
  toast('✨ Qualité : '+(S.gfx==='auto'?'Auto ('+GFXL[GFX.lv].n+')':GFXL[S.gfx].n)); }
{ const ss0=setupScene;
  setupScene=function(sc,top,bot,fn,ff){ const sun=ss0(sc,top,bot,fn,ff), L=GFXL[GFX.lv]||GFXL.high;
    sun.castShadow=!!L.sh; if(L.sh) sun.shadow.mapSize.set(L.sh,L.sh); const c=sun.shadow.camera; c.left=c.bottom=-L.ext; c.right=c.top=L.ext; c.far=Math.max(c.far,120); return sun; }; }
{ const aa0=addAmb; addAmb=function(Gm,o){ return aa0(Gm,Object.assign({},o,{n:Math.max(12,Math.round((o.n||260)*GFX.amb))})); }; }
function postInit(){
  try{
    const gl2=renderer.capabilities.isWebGL2, MS=gl2&&THREE.WebGLMultisampleRenderTarget, opt={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,stencilBuffer:false};
    const Q={msaa:!!MS,w:0,h:0};
    Q.rt=MS?new THREE.WebGLMultisampleRenderTarget(4,4,opt):new THREE.WebGLRenderTarget(4,4,opt); if(MS) Q.rt.samples=4;
    const o2=Object.assign({depthBuffer:false},opt); Q.b1=new THREE.WebGLRenderTarget(4,4,o2); Q.b2=new THREE.WebGLRenderTarget(4,4,o2);
    Q.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); Q.sc=new THREE.Scene(); Q.q=new THREE.Mesh(new THREE.PlaneGeometry(2,2)); Q.q.frustumCulled=false; Q.sc.add(Q.q);
    const vs='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }', base={depthTest:false,depthWrite:false};
    Q.bright=new THREE.ShaderMaterial(Object.assign({uniforms:{t:{value:null},px:{value:new THREE.Vector2()},th:{value:0.86}},vertexShader:vs,
      fragmentShader:'uniform sampler2D t; uniform vec2 px; uniform float th; varying vec2 vUv; void main(){ vec3 c=(texture2D(t,vUv+px*vec2(-1.0,-1.0)).rgb+texture2D(t,vUv+px*vec2(1.0,-1.0)).rgb+texture2D(t,vUv+px*vec2(-1.0,1.0)).rgb+texture2D(t,vUv+px*vec2(1.0,1.0)).rgb)*0.25; float l=dot(c,vec3(0.299,0.587,0.114)); gl_FragColor=vec4(c*smoothstep(th,th+0.12,l),1.0); }'},base));
    Q.blur=new THREE.ShaderMaterial(Object.assign({uniforms:{t:{value:null},d:{value:new THREE.Vector2()}},vertexShader:vs,
      fragmentShader:'uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main(){ vec3 c=texture2D(t,vUv).rgb*0.227; c+=(texture2D(t,vUv+d*1.385).rgb+texture2D(t,vUv-d*1.385).rgb)*0.316; c+=(texture2D(t,vUv+d*3.231).rgb+texture2D(t,vUv-d*3.231).rgb)*0.07; gl_FragColor=vec4(c,1.0); }'},base));
    Q.comp=new THREE.ShaderMaterial(Object.assign({uniforms:{t:{value:null},b:{value:null},px:{value:new THREE.Vector2()},bs:{value:0.5},fx:{value:MS?0:1},vig:{value:0.3},sat:{value:1.08}},vertexShader:vs,
      fragmentShader:[
      'uniform sampler2D t; uniform sampler2D b; uniform vec2 px; uniform float bs; uniform float fx; uniform float vig; uniform float sat; varying vec2 vUv;',
      'float lu(vec3 c){ return dot(c,vec3(0.299,0.587,0.114)); }',
      'vec3 aa(vec2 uv){ vec3 cM=texture2D(t,uv).rgb; if(fx<0.5) return cM;',
      ' float a=lu(texture2D(t,uv+vec2(-1.0,-1.0)*px).rgb), b2=lu(texture2D(t,uv+vec2(1.0,-1.0)*px).rgb), c=lu(texture2D(t,uv+vec2(-1.0,1.0)*px).rgb), d=lu(texture2D(t,uv+vec2(1.0,1.0)*px).rgb), m=lu(cM);',
      ' float mn=min(m,min(min(a,b2),min(c,d))), mx=max(m,max(max(a,b2),max(c,d)));',
      ' vec2 dir=vec2(-((a+b2)-(c+d)),((a+c)-(b2+d))); float rd=max((a+b2+c+d)*0.03125,0.0078125); float rc=1.0/(min(abs(dir.x),abs(dir.y))+rd);',
      ' dir=clamp(dir*rc,vec2(-8.0),vec2(8.0))*px;',
      ' vec3 A=0.5*(texture2D(t,uv+dir*(-1.0/6.0)).rgb+texture2D(t,uv+dir*(1.0/6.0)).rgb);',
      ' vec3 B=A*0.5+0.25*(texture2D(t,uv-dir*0.5).rgb+texture2D(t,uv+dir*0.5).rgb); float lB=lu(B); return (lB<mn||lB>mx)?A:B; }',
      'void main(){ vec3 c=aa(vUv)+texture2D(b,vUv).rgb*bs; float l=lu(c); c=mix(vec3(l),c,sat); c=(c-0.5)*1.04+0.5;',
      ' vec2 q=vUv-0.5; c*=1.0-vig*dot(q,q)*1.7; gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }'].join('\n')},base));
    GFX.post=Q;
  }catch(e){ GFX.post=false; }
}
const _gv=new THREE.Vector2();
function gfxRender(sc){
  const now=performance.now();
  if(mode==='game'&&!GFXL[S.gfx]&&G&&G.time>3){
    if(now-GFX.last>250){ GFX.t0=now; GFX.n=0; }
    GFX.last=now; GFX.n++;
    const el=now-GFX.t0; if(el>4000){ const fps=GFX.n*1000/el; GFX.t0=now; GFX.n=0;
      if(fps<40&&GFX.lv!=='low'){ S.gfxAuto=GFX.lv==='high'?'med':'low'; save(); gfxApply(); toast('✨ Qualité ajustée ('+GFXL[GFX.lv].n+') pour rester fluide'); } }
  } else GFX.last=0;
  const Q=GFX.post;
  if(!Q||!GFXL[GFX.lv].post){ renderer.render(sc,camera); return; }
  renderer.getDrawingBufferSize(_gv); const w=_gv.x, h=_gv.y;
  if(Q.w!==w||Q.h!==h){ Q.w=w; Q.h=h; Q.rt.setSize(w,h); const hw=Math.max(2,w>>2), hh=Math.max(2,h>>2); Q.b1.setSize(hw,hh); Q.b2.setSize(hw,hh); Q.comp.uniforms.px.value.set(1/w,1/h); Q.bright.uniforms.px.value.set(1/w,1/h); }
  renderer.setRenderTarget(Q.rt); renderer.render(sc,camera);
  Q.q.material=Q.bright; Q.bright.uniforms.t.value=Q.rt.texture; renderer.setRenderTarget(Q.b1); renderer.render(Q.sc,Q.cam);
  Q.q.material=Q.blur; const bw=1/Q.b1.width, bh=1/Q.b1.height;
  for(const sp of [1,2]){ Q.blur.uniforms.t.value=Q.b1.texture; Q.blur.uniforms.d.value.set(bw*sp,0); renderer.setRenderTarget(Q.b2); renderer.render(Q.sc,Q.cam);
    Q.blur.uniforms.t.value=Q.b2.texture; Q.blur.uniforms.d.value.set(0,bh*sp); renderer.setRenderTarget(Q.b1); renderer.render(Q.sc,Q.cam); }
  Q.q.material=Q.comp; Q.comp.uniforms.t.value=Q.rt.texture; Q.comp.uniforms.b.value=Q.b1.texture; Q.comp.uniforms.bs.value=G&&G.bloom!==undefined?G.bloom:0.3; Q.bright.uniforms.th.value=G&&G.bloomTh!==undefined?G.bloomTh:0.86;
  renderer.setRenderTarget(null); renderer.render(Q.sc,Q.cam);
}
$('bGfx').addEventListener('click',()=>{ sfx('click'); gfxCycle(); });
