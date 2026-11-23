/* =========================================================
   Monde de Blocs : armes, argent, missions, fusée, combattants
   ========================================================= */
const MWPN={
  150:{k:'blaster',n:'Blaster',ic:'🔫',price:40,cd:0.2,dmg:4,spd:70,col:'#ff4fd8',mesh:['rapid',1],d:'Tire des rayons rapides.'},
  151:{k:'bow',n:'Arc',ic:'🏹',price:30,cd:0.6,dmg:7,spd:42,grav:14,col:'#e9d9b8',mesh:['sniper',0],d:'Flèches précises, elles retombent un peu.'},
  152:{k:'bazooka',n:'Bazooka',ic:'💥',price:120,cd:1.2,dmg:14,spd:34,col:'#ff9f1c',expl:1,mesh:['rocket',3],d:'Roquette qui explose et casse les blocs !'},
  153:{k:'grenade',n:'Grenade',ic:'🧨',price:25,cd:0.9,dmg:12,spd:16,grav:24,fuse:1.5,col:'#3b3b3b',expl:1,mesh:['pistol',0],d:'Lance-la : elle rebondit puis explose.'},
  154:{k:'fsword',n:'Épée de feu',ic:'🗡️',price:60,cd:0.32,dmg:9,melee:3.8,d:'Coups puissants au corps à corps.'}
};
for(const id in MWPN) MITEMS[id]={n:MWPN[id].n,ic:MWPN[id].ic,wpn:MWPN[id],price:MWPN[id].price};
VEH.rocket={n:'Fusée',ic:'🚀',max:20,back:0,acc:8,turn:0,L:1.6,r:2.2,seat:[0,1.2,0],cam:15};
MITEMS[160]={n:'Fusée',ic:'🚀',veh:'rocket',col:'#f4f4f4',price:200,d:'Décolle vers l\'espace et pose-toi sur la Lune !'};
const ALLY={
  guard:{n:'Garde',ic:'🛡️',price:40,hp:24,rng:16,dmg:4,cd:0.5,w:['rapid',1],col:{skin:'#f1c27d',shirt:'#3b5bdb',pants:'#2b2d42',shoes:'#1d1846',face:'smile',hat:'none'},d:'Tire au blaster sur les monstres.'},
  archer:{n:'Archer',ic:'🏹',price:60,hp:18,rng:20,dmg:6,cd:1.1,w:['sniper',0],arrow:1,col:{skin:'#e0ac69',shirt:'#2f9e44',pants:'#5a3a1e',shoes:'#3a2a1a',face:'happy',hat:'cap'},d:'Flèches à longue portée.'},
  knight:{n:'Chevalier',ic:'⚔️',price:90,hp:40,melee:1,dmg:8,cd:0.8,col:{skin:'#f1c27d',shirt:'#c9ced6',pants:'#8e95a3',shoes:'#5a6070',face:'smile',hat:'none'},d:'Fonce sur les monstres avec son épée.'}
};
const MOON={x:0,z:0,y:300,R:70};
const QT=[
  {k:'kill',ic:'👾',t:n=>'Vaincre '+n+' monstres',lo:3,hi:7,per:10},
  {k:'break',ic:'⛏️',t:n=>'Casser '+n+' blocs',lo:20,hi:50,per:1.3},
  {k:'place',ic:'🧱',t:n=>'Poser '+n+' blocs',lo:20,hi:50,per:1.2},
  {k:'chest',ic:'📦',t:n=>'Ouvrir '+n+(n>1?' coffres':' coffre'),lo:1,hi:2,per:30},
  {k:'ride',ic:'🚗',t:n=>'Rouler ou voler '+n+' mètres',lo:150,hi:400,per:0.13},
  {k:'fish',ic:'🐠',t:n=>'Caresser '+n+' animaux marins',lo:2,hi:4,per:9},
  {k:'talk',ic:'💬',t:n=>'Parler à '+n+' villageois',lo:2,hi:4,per:8},
  {k:'space',ic:'🌌',t:()=>'Atteindre l\'espace en fusée',lo:1,hi:1,per:150,once:'space'},
  {k:'moon',ic:'🌙',t:()=>'Te poser sur la Lune',lo:1,hi:1,per:250,once:'moon'}
];
{ const M=GAMES.mc, wrap=(name,fn)=>{ const o=M[name]; M[name]=function(...a){ return fn.call(this,o,...a); }; };
  M.hudHTML+='<div class="pill ia" id="mcCashP">🪙 <b id="hCash">0</b></div><div class="pill" id="mcAltP" style="display:none">🚀 <b id="hAlt"></b></div>';
  /* ---------- fusée : maillage et sons ---------- */
  { const _vm=vehMesh; vehMesh=function(type,col){
      if(type!=='rocket') return _vm(type,col);
      const g=new THREE.Group(), body=new THREE.Group(); g.add(body); const parts={wheels:[]};
      const add=(geo,mat,x,y,z)=>{ const m=mk(geo,mat); m.position.set(x,y,z); body.add(m); return m; };
      const red='#e63946', glowM=c=>matC('G'+c,()=>new THREE.MeshBasicMaterial({color:c}));
      add(cyl(0.62,0.62,2.5,14),lam(col||'#f4f4f4'),0,1.5,0);
      add(cone(0.62,1.1,14),lam(red),0,3.3,0);
      add(cyl(0.64,0.64,0.2,14),lam(red),0,0.5,0); add(cyl(0.63,0.63,0.16,14),lam('#3b5bdb'),0,2.1,0);
      const win=add(sph(0.3),matC('rwin',()=>new THREE.MeshLambertMaterial({color:'#9fe8ff'})),0,2.55,0.45); win.scale.set(1,1,0.45);
      for(let i=0;i<4;i++){ const a=i*Math.PI/2, f=add(box(0.12,0.9,0.7),lam(red),Math.cos(a)*0.78,0.55,Math.sin(a)*0.78); f.rotation.y=-a; }
      add(cyl(0.34,0.46,0.3,10),lam('#3a3a3a'),0,0.12,0);
      const fl=mk(cone(0.3,1.5,8),glowM('#ffb020')); fl.rotation.x=Math.PI; fl.position.y=-0.55; fl.visible=false; body.add(fl); parts.flame=fl;
      return {g,body,parts};
    }; }
  { const _es=engineStart, _eset=engineSet;
    engineStart=function(type){ if(type!=='rocket') return _es(type);
      engineStop(true); ENG.type='rocket'; if(!AC||!S.sound) return;
      try{ const t=AC.currentTime, out=AC.createGain(); out.gain.setValueAtTime(0,t); out.gain.linearRampToValueAtTime(1,t+0.4); out.connect(AC.destination);
        const N={out,list:[]}; const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=40; o.start(); N.list.push(o);
        const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=240; const g=AC.createGain(); g.gain.value=0.01; o.connect(f); f.connect(g); g.connect(out);
        const nz=AC.createBufferSource(); nz.buffer=engNoise(); nz.loop=true; nz.start(); N.list.push(nz); const nf=AC.createBiquadFilter(); nf.type='lowpass'; nf.frequency.value=600; const ng=AC.createGain(); ng.gain.value=0; nz.connect(nf); nf.connect(ng); ng.connect(out);
        N.a=o; N.g=g; N.nf=nf; N.ng=ng; ENG.nodes=N; }catch(e){ ENG.nodes=null; } };
    engineSet=function(s,extra){ if(ENG.type!=='rocket') return _eset(s,extra); const N=ENG.nodes; if(!N||!AC) return; s=clamp(s,0,1); const t=AC.currentTime, T=(p,v)=>{ try{ p.setTargetAtTime(v,t,0.1); }catch(e){} };
      T(N.a.frequency,35+60*s); T(N.g.gain,0.03+0.05*s); T(N.nf.frequency,500+2600*s); T(N.ng.gain,0.01+0.09*s); }; }
  VSND.start.rocket=()=>{ tone(55,220,1.4,'sawtooth',0.06); tone(300,300,0.08,'square',0.03,0.1); };
  VSND.horn.rocket=()=>{ tone(320,640,0.25,'sine',0.05); tone(640,320,0.25,'sine',0.05,0.25); };
  /* ---------- gravité lunaire ---------- */
  Object.defineProperty(M,'grav',{get(){ return S.mc.mods.moon||this.onMoon?0.38:1; },configurable:true});
  /* ---------- démarrage ---------- */
  wrap('start',function(o){
    o.call(this);
    const st=S.mc.st||(S.mc.st={});
    this.projs=[]; this.allies=[]; this.wcd=0; this.onMoon=false; this.spaceK=0;
    MOON.x=Math.round(this.spawn[0])+240; MOON.z=Math.round(this.spawn[2]); this.buildSpace();
    if(!Array.isArray(S.mc.q)) S.mc.q=[]; while(S.mc.q.length<3) S.mc.q.push(this.newQuest());
    if(!Number.isFinite(S.mc.cash)) S.mc.cash=30;
    if(Array.isArray(S.mc.al)) for(const k of S.mc.al.slice(0,6)) if(ALLY[k]) this.addAlly(k,true);
    const cp=$('mcCashP'); if(cp) cp.onclick=()=>{ sfx('click'); this.panel==='shop'||this.panel==='missions'?this.closePanel():this.openPanel('shop'); };
    this.renderHot();
  });
  wrap('stop',function(o){
    for(const a of this.allies||[]) disposeAvatar(a.A); this.allies=[];
    for(const p of this.projs||[]) this.scene.remove(p.m); this.projs=[];
    if(this.spaceDisp) this.spaceDisp.forEach(x=>{ try{ x.dispose(); }catch(e){} });
    $('mcAltP')&&($('mcAltP').style.display='none');
    o.call(this);
  });
  /* ---------- objets utilisables ---------- */
  M.canUse=function(id){ const d=MITEMS[id]; if(!d||d.price===undefined) return true; return this.mode==='creative'||S.mc.own.indexOf(id)>=0; };
  wrap('avail',function(o,id){ if(!o.call(this,id)) return false; const d=MITEMS[id]; if(d&&d.price!==undefined) return this.canUse(id); return true; });
  M.heldW=function(){ const id=this.hot[this.sel]; return MWPN[id]&&this.canUse(id)?MWPN[id]:null; };
  M.giveHot=function(id){ let i=this.hot.indexOf(id); if(i<0){ i=this.hot.findIndex(v=>!v); if(i<0) i=this.sel; this.hot[i]=id; } this.sel=i; this.renderHot(); saveSoon(); };
  wrap('updHeld',function(o){
    o.call(this); const W=this.heldW(); if(!W||!PA||!PA.sword) return; const h=PA.sword; while(h.children.length) h.remove(h.children[0]);
    if(W.melee){ const hd=mk(box(0.07,0.07,0.24),lam('#7a4b23')), gd=mk(box(0.34,0.08,0.08),lam('#ffc83d')), bl=mk(box(0.07,0.14,0.95),emat('#ff9f1c','#ff4d00')); gd.position.z=0.15; bl.position.z=0.65; h.add(hd,gd,bl); h.rotation.x=0; h.position.set(0,-0.55,0.06); }
    else { h.add(gunMesh(W.mesh[0],W.mesh[1])); h.rotation.x=Math.PI/2; h.position.set(0,-0.62,0); }
  });
  /* ---------- tir ---------- */
  wrap('act',function(o,kind,sx,sy){
    const W=this.heldW(); if(!W||this.ride||this.panel) return o.call(this,kind,sx,sy);
    const d=this.screenDir(sx===undefined?innerWidth/2:sx,sy===undefined?innerHeight/2:sy), vh=this.pickVehicle(d), h=this.pickBlock(d);
    if(vh&&(!h||vh.t<h.t+0.5)) return o.call(this,kind,sx,sy);
    if(h){ const b=this.get(h.x,h.y,h.z); if(b===35||b===42) return o.call(this,kind,sx,sy); }
    this.fire(sx,sy);
  });
  wrap('onAction',function(o){ const W=this.heldW(); if(W&&!this.ride&&!this.panel){ this.fire(); return; } o.call(this); });
  wrap('holdBreak',function(o,dt){
    const h=this.hold, W=this.heldW(); if(!h||!W||this.ride) return o.call(this,dt);
    h.t+=dt; const mouse=h.type==='mouse';
    if(!h.active){ if(mouse?(h.btn===0&&h.t>0.12):(h.moved<12&&h.t>0.35)) h.active=true; else return; }
    if(mouse&&h.btn!==0) return; $('mcRing').style.display='none'; this.fire(h.x,h.y);
  });
  M.fire=function(sx,sy){
    const id=this.hot[this.sel], W=MWPN[id]; if(!W||!this.canUse(id)||this.wcd>0) return false;
    this.wcd=W.cd; PA.swing=0.28;
    if(W.melee){ this.slash(W); return true; }
    const d=sx===undefined?this.screenDir(innerWidth/2,innerHeight/2):this.screenDir(sx,sy);
    const ox=P.x+Math.sin(P.yaw)*0.5, oy=P.y+1.35, oz=P.z+Math.cos(P.yaw)*0.5;
    const h=this.ray(cam.px,cam.py,cam.pz,d[0],d[1],d[2],70), T=h?Math.max(h.t,2.5):60;
    let dx=cam.px+d[0]*T-ox, dy=cam.py+d[1]*T-oy, dz=cam.pz+d[2]*T-oz; if(W.grav) dy+=T*0.06; const l=Math.hypot(dx,dy,dz)||1;
    this.shoot(W,ox,oy,oz,dx/l,dy/l,dz/l,'p');
    sfx(W.k==='bazooka'?'boom':W.k==='bow'?'swing':W.k==='grenade'?'click':'pew'); return true;
  };
  M.shoot=function(W,x,y,z,dx,dy,dz,owner,dmg){
    let m;
    if(W.k==='bow'){ m=new THREE.Group(); const s=mk(box(0.05,0.05,0.7),lam('#c98b4f'),false), t=mk(box(0.1,0.1,0.12),lam('#9aa3b0'),false); t.position.z=0.4; m.add(s,t); }
    else if(W.k==='bazooka'){ m=new THREE.Group(); const b=mk(cyl(0.12,0.12,0.7,8),lam('#5a8f3a'),false); b.rotation.x=Math.PI/2; const t=mk(cone(0.12,0.3,8),lam('#e63946'),false); t.rotation.x=Math.PI/2; t.position.z=0.5; m.add(b,t); }
    else if(W.k==='grenade'){ m=mk(sph(0.2),lam('#2b2d42'),false); }
    else { m=mk(box(0.12,0.12,0.6),matC('G'+W.col,()=>new THREE.MeshBasicMaterial({color:W.col})),false); }
    m.position.set(x,y,z); this.scene.add(m);
    if(m.lookAt) m.lookAt(x+dx,y+dy,z+dz);
    const p={W,m,x,y,z,vx:dx*W.spd,vy:dy*W.spd,vz:dz*W.spd,t:W.fuse?W.fuse+3:3,owner,fuse:W.fuse||0,dmg:dmg||W.dmg};
    this.projs.push(p); return p;
  };
  M.slash=function(W){
    const fx=Math.sin(P.yaw), fz=Math.cos(P.yaw); let hit=0; sfx('swing');
    burst(this.scene,P.x+fx*1.6,P.y+1.2,P.z+fz*1.6,'#ff9f1c',6,4,true);
    for(const e of this.mobs.slice()){ if(e.dead||e.kind==='villager') continue; const dx=e.x-P.x, dz=e.z-P.z, d=Math.hypot(dx,dz);
      if(d<W.melee&&Math.abs(e.y-P.y)<2&&(d<1.2||(dx*fx+dz*fz)/d>0.2)){ this.dmgMob(e,W.dmg,P.x,P.z,true); hit++; } }
    return hit;
  };
  M.dmgMob=function(e,n,sx,sz,byP){
    if(!e||e.dead||e.kind==='villager') return false;
    e.hp=(e.hp===undefined?10:e.hp)-n; if(byP) e.byP=true;
    const dx=e.x-sx, dz=e.z-sz, d=Math.hypot(dx,dz)||1; e.vx=dx/d*6; e.vz=dz/d*6; e.vy=5; e.kb=0.25; e.onGround=false;
    burst(this.scene,e.x,e.y+1.2,e.z,e.kind==='zombie'?'#9be37a':'#ff6b9d',6,3); sfx('hit');
    if(e.hp<=0) this.killMob(e); return true;
  };
  wrap('hitMob',function(o,e){ const was=e.hp; o.call(this,e); if(e.kind==='zombie'&&e.hp<was) e.byP=true; });
  wrap('killMob',function(o,e){ const was=e.dead; o.call(this,e); if(!was&&e.dead&&e.kind==='zombie'&&(e.byP||e.keep)){ this.addCash(8); this.evt('kill'); } });
  wrap('hurt',function(o,n,fx,fz){ if(this.noHurt) return; o.call(this,n,fx,fz); });
  M.boom=function(W,x,y,z){
    const sp=this.mode==='survival'; this.noHurt=true; for(const e of this.mobs) if(e.kind==='zombie'&&Math.hypot(e.x-x,e.z-z)<6) e.byP=true;
    this.explode(Math.floor(x),Math.floor(y),Math.floor(z),true); this.noHurt=false; this.dirtySave=true;
    for(const e of this.mobs.slice()){ if(e.dead||e.kind==='villager') continue; const d=Math.hypot(e.x-x,e.y+0.8-y,e.z-z); if(d<5.5) this.dmgMob(e,Math.round(W.dmg*(1-d/7)),x,z,true); }
    if(sp&&Math.hypot(P.x-x,P.y+1-y,P.z-z)<2.2) this.hurt(3);
  };
  M.updProj=function(dt){
    const L=this.projs; if(!L||!L.length) return;
    for(let i=L.length-1;i>=0;i--){ const p=L[i], W=p.W; p.t-=dt; let end=false, hitE=null;
      const sp=Math.hypot(p.vx,p.vy,p.vz), n=Math.max(1,Math.ceil(sp*dt/0.45)), h=dt/n;
      for(let s=0;s<n&&!end;s++){
        if(W.grav) p.vy-=W.grav*h;
        const nx=p.x+p.vx*h, ny=p.y+p.vy*h, nz=p.z+p.vz*h, sol=(x,y,z)=>{ const b=this.get(Math.floor(x),Math.floor(y),Math.floor(z)); return !!b&&!MB[b].liquid; };
        if(W.fuse){ // grenade : rebondit
          if(sol(nx,p.y,p.z)){ p.vx*=-0.5; } else p.x=nx; if(sol(p.x,p.y,nz)){ p.vz*=-0.5; } else p.z=nz;
          if(sol(p.x,ny,p.z)){ p.vy*=-0.4; p.vx*=0.75; p.vz*=0.75; if(Math.abs(p.vy)<1.5) p.vy=0; } else p.y=ny;
        } else if(sol(nx,ny,nz)){ end=true; } else { p.x=nx; p.y=ny; p.z=nz; }
        if(!end&&(!W.fuse||p.t<W.fuse+2.9)){ for(const e of this.mobs){ if(e.dead||e.kind==='villager') continue; if(p.owner==='a'&&e.kind!=='zombie') continue;
          if(Math.abs(e.x-p.x)<0.7&&Math.abs(e.z-p.z)<0.7&&p.y>e.y-0.1&&p.y<e.y+1.9){ hitE=e; end=true; break; } } }
      }
      if(W.fuse){ p.fuse-=dt; if(p.fuse<=0&&!end) end=true; else if(hitE&&hitE.kind!=='zombie') end=false; }
      p.m.position.set(p.x,p.y,p.z); if(!W.fuse&&sp>0&&p.m.lookAt) p.m.lookAt(p.x+p.vx,p.y+p.vy,p.z+p.vz);
      if(W.k==='bazooka'&&Math.random()<0.8) burst(this.scene,p.x,p.y,p.z,'#ffb020',1,1,true);
      if(W.k==='blaster'&&Math.random()<0.4) burst(this.scene,p.x,p.y,p.z,W.col,1,0.5,true);
      if(p.t<=0) end=true;
      if(end){ this.scene.remove(p.m); L.splice(i,1);
        if(W.expl) this.boom(W,p.x,p.y,p.z);
        else { burst(this.scene,p.x,p.y,p.z,W.col,5,3,true); if(hitE) this.dmgMob(hitE,p.dmg,p.x-p.vx*0.01,p.z-p.vz*0.01,p.owner==='p'); } } }
  };
  /* ---------- argent et missions ---------- */
  M.addCash=function(n){ S.mc.cash=Math.max(0,Math.min(1e9,(S.mc.cash||0)+n)); if(n>0){ toast('+'+n+' 🪙'); sfx('coin'); } saveSoon(); };
  M.newQuest=function(){
    const have=new Set((S.mc.q||[]).map(q=>q.k)), st=S.mc.st||{};
    const pool=QT.filter(t=>!have.has(t.k)&&!(t.once&&st[t.once])&&!(t.k==='moon'&&!st.space));
    const t=pool[Math.floor(Math.random()*pool.length)]||QT[1], need=t.lo+Math.floor(Math.random()*(t.hi-t.lo+1));
    return {k:t.k,n:0,need,r:Math.max(5,Math.round(need*t.per))};
  };
  M.evt=function(k,n){ n=n||1; const Q=S.mc.q; if(!Q) return;
    for(let i=0;i<Q.length;i++){ const q=Q[i]; if(q.k!==k) continue; q.n=Math.min(q.need,q.n+n);
      if(q.n>=q.need){ const t=QT.find(x=>x.k===q.k); this.addCash(q.r); banner('🎯 Mission réussie : '+t.t(q.need)+' · +'+q.r+' 🪙'); sfx('win');
        S.mc.st.done=(S.mc.st.done||0)+1; if(t.once) S.mc.st[t.once]=1; Q.splice(i,1); Q.push(this.newQuest()); i--; if(this.panel==='shop'||this.panel==='missions') this.openPanel(this.panel); save(); } }
  };
  wrap('breakAt',function(o,h){ o.call(this,h); this.evt('break'); });
  wrap('placeAt',function(o,h){ const b=this._sb||0, id=this.hot[this.sel]; o.call(this,h); if((this._sb||0)>b&&MB[id]) this.evt('place'); });
  wrap('setB',function(o,x,y,z,id){ this._sb=(this._sb||0)+1; return o.call(this,x,y,z,id); });
  wrap('openChest',function(o,h){ const p=this.panel; o.call(this,h); if(this.panel==='chest'&&p!=='chest') this.evt('chest'); });
  wrap('talk',function(o,e){ o.call(this,e); this.evt('talk'); });
  wrap('tapSea',function(o,c){ o.call(this,c); this.evt('fish'); });
  /* ---------- combattants ---------- */
  M.addAlly=function(kind,quiet){
    const K=ALLY[kind]; if(!K) return null;
    const a=rand(0,TAU), x=P.x+Math.cos(a)*2.5, z=P.z+Math.sin(a)*2.5, y=this.colTop(Math.floor(x),Math.floor(z));
    const A=makeAvatar(K.col,K.n+' '+K.ic,{hand:!K.melee,sword:!!K.melee}); this.scene.add(A.root); if(!K.melee) setHeld(A,K.w[0],K.w[1]);
    const e={kind,K,A,m:A.root,x,y:Math.max(y,P.y),z,vx:0,vy:0,vz:0,yaw:rand(0,TAU),hp:K.hp,onGround:false,kb:0,atk:0.5,down:0,hc:0};
    this.allies.push(e); A.root.position.set(x,e.y,z); if(!quiet){ burst(this.scene,x,e.y+1,z,'#ffd23f',10,4,true); sfx('cp'); } return e;
  };
  M.allyShoot=function(a,t){
    const K=a.K, ox=a.x, oy=a.y+1.35, oz=a.z; let dx=t.x-ox, dy=t.y+1-oy, dz=t.z-oz; const l=Math.hypot(dx,dy,dz)||1;
    const W=K.arrow?MWPN[151]:MWPN[150]; if(K.arrow) dy+=l*0.04; const l2=Math.hypot(dx,dy,dz)||1;
    this.shoot(W,ox,oy,oz,dx/l2,dy/l2,dz/l2,'a',K.dmg); sfx(K.arrow?'swing':'pew');
  };
  M.updAllies=function(dt){
    for(const a of this.allies){
      if(a.down>0){ a.down-=dt; if(a.down<=0){ a.hp=a.K.hp; a.x=P.x+rand(-2,2); a.z=P.z+rand(-2,2); a.y=P.y+1; a.vx=a.vy=a.vz=0; a.m.visible=true; burst(this.scene,a.x,a.y+1,a.z,'#ffd23f',8,3,true); } continue; }
      const dp=Math.hypot(P.x-a.x,P.z-a.z);
      if(dp>45||a.y<-8||Math.abs(P.y-a.y)>45){ a.x=P.x+rand(-2,2); a.z=P.z+rand(-2,2); a.y=P.y+1; a.vx=a.vy=a.vz=0; }
      let tgt=null, td=1e9; for(const e of this.mobs){ if(e.kind!=='zombie'||e.dead) continue; const d=Math.hypot(e.x-a.x,e.z-a.z); if(d<(a.K.melee?20:a.K.rng+4)&&Math.abs(e.y-a.y)<8&&d<td){ td=d; tgt=e; } }
      let wx=0, wz=0, sp=3.2; a.atk-=dt; a.hc-=dt;
      if(tgt){ const dx=tgt.x-a.x, dz=tgt.z-a.z, d=td||1; a.yaw=angLerp(a.yaw,Math.atan2(dx,dz),Math.min(1,10*dt));
        if(a.K.melee){ if(d>1.7){ wx=dx/d; wz=dz/d; sp=4.4; } else if(a.atk<=0){ a.atk=a.K.cd; a.A.swing=0.28; sfx('swing'); this.dmgMob(tgt,a.K.dmg,a.x,a.z); tgt.ally=true; } }
        else { const keep=a.K.rng*0.55; if(d>keep+2){ wx=dx/d; wz=dz/d; sp=3.6; } else if(d<keep-3){ wx=-dx/d; wz=-dz/d; sp=3.2; }
          if(a.atk<=0&&d<a.K.rng){ a.atk=a.K.cd; a.A.swing=0.28; this.allyShoot(a,tgt); tgt.ally=true; } } }
      else if(dp>4.5){ const dx=P.x-a.x, dz=P.z-a.z; wx=dx/dp; wz=dz/dp; sp=dp>14?5.5:3.4; a.yaw=angLerp(a.yaw,Math.atan2(dx,dz),Math.min(1,8*dt)); }
      const n=Math.ceil(dt/0.02), h=dt/n; for(let i=0;i<n;i++) this.mobStep(a,h,wx,wz,sp);
      for(const e of this.mobs){ if(e.kind==='zombie'&&!e.dead&&Math.hypot(e.x-a.x,e.z-a.z)<1.3&&Math.abs(e.y-a.y)<1.6&&a.hc<=0){ a.hc=1; a.hp-=2; a.vy=4; a.A.swing=0.2; burst(this.scene,a.x,a.y+1.2,a.z,'#ff6b6b',4,3);
        if(a.hp<=0){ a.down=14; a.m.visible=false; burst(this.scene,a.x,a.y+1,a.z,'#ffffff',10,5); sfx('poof'); break; } } }
      a.m.position.set(a.x,a.y,a.z); a.m.rotation.y=a.yaw; animAvatar(a.A,dt,Math.hypot(a.vx,a.vz),a.onGround);
    }
  };
  M.hireAlly=function(kind){ const K=ALLY[kind], cost=this.mode==='creative'?0:K.price;
    if(S.mc.al.length>=6){ banner('👥 Ton équipe est déjà pleine (6 combattants)'); sfx('nope'); return false; }
    if((S.mc.cash||0)<cost){ banner('🪙 Il te manque '+(cost-S.mc.cash)+' pièces'); sfx('nope'); return false; }
    S.mc.cash-=cost; S.mc.al.push(kind); this.addAlly(kind); sfx('buy'); banner(K.ic+' '+K.n+' recruté ! Il te suit et combat les monstres'); saveSoon(); return true; };
  M.dismissAlly=function(){ const a=this.allies.pop(); if(!a) return; S.mc.al.pop(); disposeAvatar(a.A); sfx('poof'); saveSoon(); };
  /* ---------- fusée, espace, Lune ---------- */
  M.buildSpace=function(){
    const sc=this.scene, disp=this.spaceDisp=[];
    const N=700, pos=new Float32Array(N*3); for(let i=0;i<N;i++){ const a=rand(0,TAU), b=Math.acos(rand(-1,1)), r=380; pos[i*3]=r*Math.sin(b)*Math.cos(a); pos[i*3+1]=r*Math.cos(b); pos[i*3+2]=r*Math.sin(b)*Math.sin(a); }
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const sm=new THREE.PointsMaterial({color:'#ffffff',size:2.4,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,fog:false});
    this.stars=new THREE.Points(sg,sm); this.stars.frustumCulled=false; this.stars.visible=false; sc.add(this.stars); disp.push(sg,sm);
    const cv=document.createElement('canvas'); cv.width=512; cv.height=256; const g=cv.getContext('2d');
    g.fillStyle='#2f7fff'; g.fillRect(0,0,512,256); g.fillStyle='#3fae5a';
    for(let i=0;i<46;i++){ g.beginPath(); g.ellipse(rand(0,512),rand(20,236),rand(14,60),rand(8,30),rand(0,3),0,TAU); g.fill(); }
    g.fillStyle='rgba(255,255,255,0.7)'; for(let i=0;i<40;i++){ g.beginPath(); g.ellipse(rand(0,512),rand(0,256),rand(10,40),rand(3,8),0,0,TAU); g.fill(); }
    const tex=new THREE.CanvasTexture(cv), em=new THREE.MeshBasicMaterial({map:tex,fog:false}); disp.push(tex,em);
    const eg=new THREE.SphereGeometry(900,32,20); this.earth=new THREE.Mesh(eg,em); this.earth.visible=false; this.earth.frustumCulled=false; sc.add(this.earth); disp.push(eg);
    // la Lune : un grand plateau gris avec des cratères, bordé d'une barrière invisible
    const mg=new THREE.Group(), R=MOON.R, my=MOON.y, mx=MOON.x, mz=MOON.z;
    const gm=new THREE.MeshLambertMaterial({color:'#b9bcc6'}), dm=new THREE.MeshLambertMaterial({color:'#8c909d'}), sm2=new THREE.MeshLambertMaterial({color:'#a4a7b3'}); disp.push(gm,dm,sm2);
    const slab=new THREE.BoxGeometry(R*2,4,R*2), dome=new THREE.SphereGeometry(R*1.15,20,12), cr=new THREE.CircleGeometry(1,16); disp.push(slab,dome,cr);
    const s1=new THREE.Mesh(slab,gm); s1.position.set(mx,my-2,mz); mg.add(s1);
    const s2=new THREE.Mesh(dome,sm2); s2.position.set(mx,my-4-R*1.15+8,mz); mg.add(s2);
    for(let i=0;i<16;i++){ const c=new THREE.Mesh(cr,dm), r=rand(2,8); c.rotation.x=-Math.PI/2; c.scale.set(r,r,1); c.position.set(mx+rand(-R+9,R-9),my+0.03,mz+rand(-R+9,R-9)); mg.add(c); }
    const pole=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,0.15),new THREE.MeshLambertMaterial({color:'#dddddd'})), flag=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.1,0.05),new THREE.MeshBasicMaterial({color:'#ff5d8f'}));
    pole.position.set(mx+6,my+2.5,mz+6); flag.position.set(mx+7,my+4.4,mz+6); mg.add(pole,flag); disp.push(pole.geometry,pole.material,flag.geometry,flag.material);
    sc.add(mg); this.moonG=mg;
    this.moonBoxes=[{x0:mx-R,x1:mx+R,y0:my-4,y1:my,z0:mz-R,z1:mz+R},
      {x0:mx-R-1,x1:mx-R,y0:my,y1:my+4,z0:mz-R-1,z1:mz+R+1},{x0:mx+R,x1:mx+R+1,y0:my,y1:my+4,z0:mz-R-1,z1:mz+R+1},
      {x0:mx-R,x1:mx+R,y0:my,y1:my+4,z0:mz-R-1,z1:mz-R},{x0:mx-R,x1:mx+R,y0:my,y1:my+4,z0:mz+R,z1:mz+R+1}];
  };
  M.moonTop=function(x,z,y){ return Math.abs(x-MOON.x)<MOON.R&&Math.abs(z-MOON.z)<MOON.R&&y>=MOON.y-1.5?MOON.y:null; };
  wrap('query',function(o,x0,x1,y0,y1,z0,z1){
    const out=o.call(this,x0,x1,y0,y1,z0,z1);
    if(this.moonBoxes&&y1>MOON.y-5&&y0<MOON.y+5) for(const b of this.moonBoxes) if(b.x1>x0&&b.x0<x1&&b.y1>y0&&b.y0<y1&&b.z1>z0&&b.z0<z1) out.push(b);
    return out;
  });
  wrap('vGround',function(o,x,z,y){ const m=this.moonTop(x,z,y); return m!==null?m:o.call(this,x,z,y); });
  M.driveRocket=function(v,K,dt){
    const up=inp.jumpHeld?1:0, dn=inp.downHeld?1:0, fl=v.parts.flame;
    if(v.cd>0){ v.cd-=dt; const s=Math.ceil(v.cd); if(s!==v.cs){ v.cs=s; if(s>0){ banner('🚀 '+s+'…'); tone(520,520,0.1,'square',0.05); } }
      v.body.position.x=Math.sin(this.time*70)*0.04*(4-v.cd); if(fl){ fl.visible=true; fl.scale.set(0.6,0.4+Math.random()*0.3,0.6); }
      if(v.cd<=0){ v.cd=0; v.air=true; v.vy=3; v.body.position.x=0; sfx('boom'); banner('🛫 Décollage ! ▲ monter · ▼ descendre · joystick pour avancer'); } return; }
    if(!v.air){ v.spd=0; v.vy=0; if(fl) fl.visible=false; if(up){ v.cd=3; v.cs=4; banner('🚀 Décollage dans 3…'); tone(520,520,0.1,'square',0.05); } return; }
    const sn=Math.sin(cam.yaw), cs=Math.cos(cam.yaw); let ix=inp.x, iy=inp.y; const il=Math.hypot(ix,iy); if(il>1){ ix/=il; iy/=il; }
    const hv=K.max*(this.spaceK>0.5?2.2:1), wx=(-sn*iy+cs*ix)*hv, wz=(-cs*iy-sn*ix)*hv, k=Math.min(1,2.5*dt);
    v.vx=(v.vx||0)+(wx-(v.vx||0))*k; v.vz=(v.vz||0)+(wz-(v.vz||0))*k; v.spd=Math.hypot(v.vx,v.vz);
    const g=this.vGround(v.x,v.z,v.y), lim=clamp((v.y-g)*1.1,3,32), tvy=up?34:dn?-lim:0;
    v.vy+=(Math.max(tvy,-lim)-v.vy)*Math.min(1,3*dt);
    const blocked=(x,z,y)=>{ for(const [a,b] of [[0,0],[0.9,0],[-0.9,0],[0,0.9],[0,-0.9]]) for(const h of [0.3,1.5,3]) if(this.solidAt(x+a,y+h,z+b)) return true; return false; };
    const nx=v.x+v.vx*dt, nz=v.z+v.vz*dt; if(!blocked(nx,v.z,v.y)) v.x=nx; else v.vx*=-0.2; if(!blocked(v.x,nz,v.y)) v.z=nz; else v.vz*=-0.2;
    let ny=clamp(v.y+v.vy*dt,0.2,760);
    if(Math.abs(v.x-MOON.x)<MOON.R&&Math.abs(v.z-MOON.z)<MOON.R&&v.y<MOON.y-4&&ny+3.4>MOON.y-4){ ny=MOON.y-7.4; v.vy=Math.min(0,v.vy); }
    if(!blocked(v.x,v.z,ny)) v.y=ny; else v.vy=Math.min(0,v.vy);
    const g2=this.vGround(v.x,v.z,v.y);
    if(v.y<=g2+0.02&&v.vy<=0.1){ v.y=g2; v.vy=0; v.vx=v.vz=0; v.air=false; v.pitch=0; v.roll=0; if(fl) fl.visible=false; sfx('cp'); const moon=this.moonTop(v.x,v.z,v.y)!==null;
      banner(moon?'🌙 Bienvenue sur la Lune ! La gravité est faible : saute !':'🛬 Atterrissage réussi !'); if(moon){ S.mc.st.moon=1; this.evt('moon'); } return; }
    v.pitch=lerp(v.pitch,clamp(iy*0.35,-0.4,0.4),Math.min(1,4*dt)); v.roll=lerp(v.roll,clamp(-ix*0.25,-0.3,0.3),Math.min(1,4*dt));
    if(fl){ fl.visible=true; fl.scale.set(0.7+Math.random()*0.2,0.6+Math.max(0,v.vy)/34*1.4+Math.random()*0.3,0.7); }
    if(Math.random()<0.7) burst(this.scene,v.x,v.y-0.2,v.z,Math.random()<0.5?'#ffb020':'#ffffff',1,2,true);
  };
  wrap('updVehicles',function(o,dt){
    const v=this.ride; if(!v||v.type!=='rocket') return o.call(this,dt);
    const K=VEH.rocket; if(S.sound&&AC&&!ENG.nodes) engineStart('rocket'); else if(!S.sound&&ENG.nodes) engineStop(true);
    this.driveRocket(v,K,dt); this.vehPose(v,dt); this.seatPlayer(v);
    engineSet(v.air?0.45+0.55*Math.min(1,Math.abs(v.vy)/34):v.cd>0?0.7:0.05);
    this.vT2=(this.vT2||0)-dt; if(this.vT2<=0&&(v.air||v.cd>0)){ this.vT2=0.5; this.dirtySave=true; }
  });
  wrap('enterVehicle',function(o,v){ o.call(this,v); if(this.ride===v&&v.type==='rocket'){ $('hud').classList.add('flying'); v.cd=0; banner('🚀 Appuie sur ▲ pour lancer le compte à rebours'); } });
  wrap('exitVehicle',function(o,force){
    const v=this.ride; if(!v||v.type!=='rocket'){ const r=o.call(this,force); if(r!==false) P.jumpBuf=0; return r; }
    if(!force&&(v.air||v.cd>0)&&this.mode!=='creative'){ banner('✋ Pose la fusée avant de descendre !'); sfx('nope'); return false; }
    const moon=this.moonTop(v.x,v.z,v.y)!==null; if(v.parts.flame) v.parts.flame.visible=false; v.cd=0;
    const r=o.call(this,force); if(r!==false) P.jumpBuf=0; if(r!==false&&moon){ P.x=v.x+2.6; P.z=v.z; P.y=MOON.y; P.vx=P.vy=P.vz=0; }
    else if(r!==false&&v.air){ P.x=v.x; P.z=v.z; P.y=v.y; }
    return r;
  });
  M.updSpace=function(dt){
    const sc=this.scene, fog=sc.fog, alt=P.y; if(!fog) return;
    const sp=clamp((alt-70)/70,0,1); this.spaceK=sp;
    this.onMoon=!this.ride&&Math.abs(P.x-MOON.x)<MOON.R+2&&Math.abs(P.z-MOON.z)<MOON.R+2&&P.y>MOON.y-2&&P.y<MOON.y+60;
    if(sp<=0){ this.fogN=fog.near; this.fogF=fog.far; if(this.stars.visible){ this.stars.visible=false; this.earth.visible=false; } }
    else {
      const c=this.sky; c.r=lerp(c.r,0.004,sp); c.g=lerp(c.g,0.005,sp); c.b=lerp(c.b,0.02,sp); fog.color.copy(c);
      fog.near=lerp(this.fogN||45,600,sp); fog.far=lerp(this.fogF||150,2600,sp);
      this.stars.visible=true; this.stars.material.opacity=sp; this.stars.position.set(P.x,P.y,P.z);
      this.earth.visible=sp>0.25; this.earth.position.set(P.x,-940,P.z);
      if(sp>0.9&&!(S.mc.st.space)){ S.mc.st.space=1; this.evt('space'); banner('🌌 Tu es dans l\'espace ! Cherche la Lune 🌙'); sfx('win'); save(); }
    }
    if(this.moonG) this.moonG.visible=true;
  };
  wrap('update',function(o,dt){
    this.wcd-=dt; o.call(this,dt);
    this.updProj(dt); this.updAllies(dt); this.updSpace(dt);
    if(this.ride){ const x=this.ride.x, z=this.ride.z; if(this._rx!==undefined){ const d=Math.hypot(x-this._rx,z-this._rz); if(d<30&&d>0) this.evt('ride',d); } this._rx=x; this._rz=z; } else this._rx=undefined;
  });
  wrap('hud',function(o){
    o.call(this); setText('hCash',S.mc.cash||0);
    const ap=$('mcAltP'); if(ap){ const r=this.ride&&this.ride.type==='rocket'; ap.style.display=r?'':'none';
      if(r){ const dx=MOON.x-P.x, dz=MOON.z-P.z, dist=Math.round(Math.hypot(dx,dz)), dir=Math.abs(dx)>Math.abs(dz)?(dx>0?'est ➡️':'ouest ⬅️'):(dz>0?'sud ⬇️':'nord ⬆️');
        setText('hAlt',Math.round(P.y)+' m · 🌙 '+dist+' m '+dir); } }
  });
  /* ---------- boutique et missions ---------- */
  wrap('openPanel',function(o,kind){
    if(kind!=='shop'&&kind!=='missions') return o.call(this,kind);
    o.call(this,'inv'); this.panel=kind; const p=$('mcPanel'), head=p.children[0], body=p.children[1]; head.children[0].textContent=kind==='shop'?'🛒 Boutique':'🎯 Missions';
    body.innerHTML='';
    const tabs=el('div','mcTabs'); body.appendChild(tabs);
    [['shop','🛒 Boutique'],['missions','🎯 Missions']].forEach(([k,l])=>{ const b=el('button',kind===k?'on':''); b.textContent=l; b.addEventListener('click',()=>{ sfx('click'); this.openPanel(k); }); tabs.appendChild(b); });
    const cash=el('p'); cash.innerHTML='<b>🪙 '+(S.mc.cash||0)+' pièces</b>'+(this.mode==='creative'?' · en créatif, tout est gratuit !':''); body.appendChild(cash);
    if(kind==='missions') this.renderMissions(body); else this.renderShop(body);
  });
  M.mkRow=function(ic,title,sub){ const r=el('div','mod'), i=el('span','em'), t=el('div','tx'), b=el('b'), d=el('span'); i.textContent=ic; b.textContent=title; d.textContent=sub||''; t.appendChild(b); t.appendChild(d); r.appendChild(i); r.appendChild(t); return {r,t}; };
  M.renderMissions=function(body){
    S.mc.q.forEach(q=>{ const t=QT.find(x=>x.k===q.k), R=this.mkRow(t.ic,t.t(q.need),Math.floor(q.n)+' / '+q.need), bar=el('div','qbar'), f=el('u'); f.style.width=Math.round(q.n/q.need*100)+'%'; bar.appendChild(f); R.t.appendChild(bar);
      const rw=el('span','qr'); rw.textContent='+'+q.r+' 🪙'; R.r.appendChild(rw); body.appendChild(R.r); });
    const w=el('button','newWorld'); w.textContent='📣 Appeler une vague de 5 monstres (+8 🪙 chacun)'; w.style.background='#ece6ff'; w.style.color='#5a3fd1'; w.addEventListener('click',()=>this.spawnWave()); body.appendChild(w);
    const s=el('p'); s.textContent='Missions réussies : '+(S.mc.st.done||0)+'. Tue des monstres, construis, explore, vole dans l\'espace… et gagne des pièces pour acheter des armes !'; s.style.marginTop='10px'; body.appendChild(s);
  };
  M.spawnWave=function(){ let n=0; for(let i=0;i<60&&n<5;i++) if(this.spawnMob('zombie',8,16,false)){ const e=this.mobs[this.mobs.length-1]; e.keep=true; n++; }
    this.closePanel(); banner(n?'👾 '+n+' monstres arrivent ! Prends ton arme !':'Pas de place pour une vague ici, déplace-toi'); if(n) sfx('boom'); };
  M.renderShop=function(body){
    const creative=this.mode==='creative';
    const row=(ic,name,desc,label,onBuy)=>{ const R=this.mkRow(ic,name,desc), b=el('button','buy'); b.textContent=label; b.addEventListener('click',onBuy); R.r.appendChild(b); body.appendChild(R.r); };
    const pay=(price,id)=>{ if(this.canUse(id)) return true; if((S.mc.cash||0)<price){ banner('🪙 Il te manque '+(price-S.mc.cash)+' pièces'); sfx('nope'); return false; } S.mc.cash-=price; S.mc.own.push(id); sfx('buy'); return true; };
    const h1=el('h4','set-h'); h1.textContent='Armes ⚔️'; body.appendChild(h1);
    for(const id of Object.keys(MWPN).map(Number)){ const W=MWPN[id], own=this.canUse(id);
      row(W.ic,W.n,W.d,creative?'Prendre':own?'✅ Équiper':'🪙 '+W.price,()=>{ if(!pay(W.price,id)) return; this.giveHot(id); banner(W.ic+' '+W.n+' dans ta main · touche l\'écran pour tirer'); this.openPanel('shop'); }); }
    const h2=el('h4','set-h'); h2.textContent='Véhicule spatial 🚀'; body.appendChild(h2);
    row('🚀','Fusée','Pose-la, monte dedans, ▲ pour décoller. Vise la Lune !',creative?'Prendre':this.canUse(160)?'✅ Équiper':'🪙 200',()=>{ if(!pay(200,160)) return; this.giveHot(160); banner('🚀 Pose la fusée sur le sol puis touche-la pour monter'); this.closePanel(); });
    const h3=el('h4','set-h'); h3.textContent='Combattants 🛡️ ('+S.mc.al.length+'/6)'; body.appendChild(h3);
    for(const k of Object.keys(ALLY)){ const K=ALLY[k]; row(K.ic,K.n,K.d+' PV '+K.hp,creative?'Recruter':'🪙 '+K.price,()=>{ if(this.hireAlly(k)) this.openPanel('shop'); }); }
    if(S.mc.al.length){ const b=el('button','newWorld'); b.textContent='👋 Renvoyer le dernier combattant'; b.addEventListener('click',()=>{ this.dismissAlly(); this.openPanel('shop'); }); body.appendChild(b); }
  };
  wrap('onKey',function(o,code){ if(code==='KeyB'&&!this.ride){ this.panel==='shop'||this.panel==='missions'?this.closePanel():this.openPanel('shop'); return; } o.call(this,code); });
}

