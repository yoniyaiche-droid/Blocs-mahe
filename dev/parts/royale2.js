/* =========================================================
   18. Bataille Royale : île ensoleillée, 3 façons de jouer
       (Tranquille, Classique, Duo avec un robot allié), karts,
       champignons rebondissants, ravitaillements, bonbombes,
       grappin, robots qui se protègent, chiffres de dégâts
   ========================================================= */
Object.assign(WPN,{
  grenade:{n:'Bonbombe',ic:'🍬',dmg:55,splash:4.2,rate:0.75,spd:21,spread:0,range:60,grav:22,stack:3,toss:1},
  grapple:{n:'Grappin',ic:'🪝',dmg:0,rate:0.5,spd:0,spread:0,range:40,stack:4,hook:1}});
const RB_MODES={
  easy:{ic:'🌱',t:'Tranquille',d:'Robots plus gentils et tempête plus douce : parfait pour apprendre',hurt:0.5,rate:1.6,err:1.8,sight:24,build:0.12,storm:0.6,pw:2},
  classic:{ic:'🪂',t:'Classique',d:'15 robots, une île et la tempête : sois le dernier debout !',hurt:1,rate:1,err:1,sight:36,build:0.35,storm:1,pw:1.4},
  duo:{ic:'🤝',t:'Duo',d:'Un robot allié saute avec toi et t\'aide contre 14 robots',hurt:1,rate:1,err:1,sight:36,build:0.35,storm:1,pw:1.4,duo:1}};
const RB_PADS=[[-24,-22],[24,-20],[-22,24],[24,26],[0,-26],[27,3],[-27,2]];
const RB_KARTS=[[10,9,'#ff4f6d'],[-30,-12,'#4f7bff'],[31,-8,'#ffd23f'],[-9,31,'#3ad17a']];
const RB_V=new THREE.Vector3();
{ const gm0=gunMesh;
  gunMesh=function(w,r){
    if(w==='grenade'){ const g=new THREE.Group(), c=mk(sph(0.2),lam('#ff4f8b'),false); c.position.z=0.15; g.add(c);
      const st=mk(box(0.4,0.05,0.05),lam('#ffffff'),false); st.position.z=0.15; g.add(st);
      for(const s of [-1,1]){ const t=mk(cone(0.13,0.2,6),lam('#ffd23f'),false); t.position.set(s*0.3,0,0.15); t.rotation.z=s*Math.PI/2; g.add(t); }
      return g; }
    if(w==='grapple'){ const g=new THREE.Group(), add=(geo,mat,x,y,z)=>{ const m=mk(geo,mat,false); m.position.set(x,y,z); g.add(m); return m; };
      add(box(0.14,0.18,0.42),lam(WRAR[r||0].c),0,0,0.1); add(cyl(0.05,0.05,0.3,8),lam('#2b2d42'),0,0.03,0.4).rotation.x=Math.PI/2;
      add(box(0.34,0.05,0.05),lam('#9aa3b0'),0,0.03,0.58); add(box(0.05,0.05,0.16),lam('#9aa3b0'),0.15,0.03,0.52); add(box(0.05,0.05,0.16),lam('#9aa3b0'),-0.15,0.03,0.52);
      return g; }
    return gm0(w,r); }; }
{ const rl0=rollLoot;
  rollLoot=function(chest){ if(G&&G.id==='royale'&&Math.random()<(chest?0.2:0.1)) return Math.random()<0.6?{kind:'w',w:'grenade',r:1,n:3}:{kind:'w',w:'grapple',r:1,n:4}; return rl0(chest); }; }
function rbKartMesh(col){
  const g=new THREE.Group(), add=(geo,mat,x,y,z)=>{ const m=mk(geo,mat); m.position.set(x,y,z); g.add(m); return m; }, dk=lam('#2b2d42'), c=lam(col);
  add(box(1.5,0.22,2.3),dk,0,0.38,0);
  add(box(0.14,0.42,1.9),c,0.72,0.66,-0.05); add(box(0.14,0.42,1.9),c,-0.72,0.66,-0.05);
  add(box(1.5,0.4,0.62),c,0,0.62,0.9); add(box(1.2,0.06,0.3),lam('#ffffff'),0,0.85,0.95);
  add(box(1.5,0.5,0.32),c,0,0.72,-1.0); add(box(1.7,0.1,0.34),dk,0,1.08,-1.12);
  add(box(0.9,0.55,0.12),dk,0,0.8,-0.55);
  add(cyl(0.22,0.22,0.06,12),dk,0,1.0,0.45).rotation.x=-1.0;
  const wh=[]; for(const [x,z] of [[0.82,0.78],[-0.82,0.78],[0.82,-0.78],[-0.82,-0.78]]){ const w=add(cyl(0.32,0.32,0.26,12),lam('#1d1846'),x,0.32,z); w.rotation.z=Math.PI/2; const hub=mk(cyl(0.14,0.14,0.28,8),lam('#ffd23f')); w.add(hub); wh.push(w); }
  add(sph(0.12),emat('#fff6c2','#ffe066'),0.5,0.62,1.22); add(sph(0.12),emat('#fff6c2','#ffe066'),-0.5,0.62,1.22);
  return {g,wh};
}
function rbPadMesh(){
  const g=new THREE.Group(), st=mk(cyl(0.45,0.55,0.35,10),lam('#fff1dc')); st.position.y=0.18; g.add(st);
  const cap=mk(geoC('RBcap',()=>new THREE.SphereGeometry(1.25,18,8,0,TAU,0,Math.PI/2)),lam('#ff4f6d')); cap.scale.y=0.45; cap.position.y=0.3; g.add(cap);
  for(let i=0;i<6;i++){ const a=i/6*TAU+0.3, r=i%2?0.75:0.5, d=mk(sph(0.15),lam('#ffffff'),false); d.position.set(Math.cos(a)*r,0.3+0.45*Math.sqrt(1.5625-r*r),Math.sin(a)*r); g.add(d); }
  return g;
}
{ const R=GAMES.royale, o={};
  ['start','update','hud','drawMap','tryFire','pickup','openChest','stop','idle','dmgEnt','onKey','speedMul','botWants','land'].forEach(k=>o[k]=R[k]);
  R.hint='ZQSD / WASD : bouger · Espace : sauter · Clic maintenu : tirer · 1-5 : objets · F mur · G rampe · V sol · R : kart · Glisser : viser';
  R.far=340;
  R.start=function(){
    o.start.call(this);
    this.mode=RB_MODES[S.rb&&S.rb.mode]?S.rb.mode:'classic'; this.diff=RB_MODES[this.mode]; this.modeChosen=false; this.ally=null;
    this.inv=[{w:'pickaxe'},null,null,null,null]; this.sel=0;
    this.karts=[]; this.pads=[]; this.drops=[]; this.dropAt={}; this.spin=[]; this.bob=[];
    this.dealt=0; this.streak=0; this.lastKill=-99; this.allyKills=0; this.glide=false; this.kart=null; this.nearK=null; this.hook=null; this.padCd=0; this.fw=0; this._kv=null; this._kl=null; this._kTip=0;
    this.pEnt.team=0; this.bots.forEach((b,i)=>{ b.team=i+1; });
    this.decorate(); this.renderHotbar();
    openChoice({title:'🪂 Bataille Royale',sub:'Comment veux-tu jouer ?',close:false,
      items:Object.keys(RB_MODES).map(k=>{ const m=RB_MODES[k]; return {ic:m.ic,t:m.t,d:m.d,on:k===this.mode,cb:()=>this.setMode(k)}; })});
  };
  R.setMode=function(k){
    if(this.modeChosen) return; closeChoice();
    this.mode=RB_MODES[k]?k:'classic'; this.diff=RB_MODES[this.mode]; S.rb=S.rb||{}; S.rb.mode=this.mode; saveSoon();
    if(this.diff.duo){ const e=this.bots[0], av=randomAvatar(); disposeAvatar(e.A); av.shirt='#3ad17a';
      e.A=makeAvatar(av,'🤝 '+e.name,{hand:true}); e.A.root.traverse(q=>{ if(q.isMesh) q.castShadow=false; }); e.A.root.visible=false; this.scene.add(e.A.root); setHeld(e.A,'pickaxe');
      e.A.glider=gliderMesh('#3ad17a'); e.A.root.add(e.A.glider); e.col=av.shirt; e.ally=true; e.team=0; e.sh=50; this.ally=e; }
    for(const b of this.bots) b.dropT+=this.time;
    this.modeChosen=true; P.jumpBuf=0;
    banner(IS_TOUCH?'Appuie sur ⌃ pour sauter de la montgolfière !':'Appuie sur Espace pour sauter !');
    if(this.ally) this.feed('🤝 '+this.ally.name+' fait équipe avec toi !');
  };
  R.decorate=function(){
    const sc=this.scene, put=(m,x,y,z)=>{ m.position.set(x,y,z); sc.add(m); return m; };
    addSky(this,{top:'#3d94ff',mid:'#8fd4ff',bot:'#eaf8ff',sun:{u:0.28,el:34,r:20,c:'#fff8dc',glow:'rgba(255,244,200,.85)',gl:7},near:70,far:200});
    setLights(this,{hemi:['#ffffff','#7f9a6a',0.66],sun:['#fff4e0',0.74],dir:[16,30,10]});
    for(const m of sc.children){ const pr=m.isMesh&&m.geometry&&m.geometry.parameters; if(!pr) continue;
      if(pr.width===140&&m.position.y===-0.5){ const om=m.material; m.material=texMat('meadow','#ffffff',35); if(om&&om.userData&&om.userData.own){ if(om.map) om.map.dispose(); om.dispose(); } }
      else if(pr.width===500) m.material=lam('#1b86cc'); }
    // plage, eau turquoise, écume
    addBox(this,-77,-1.2,-77,77,-0.12,77,texMat('sand','#ffffff',30),null,null,false);
    const wg=new THREE.PlaneGeometry(600,600); wg.userData.own=true; const wm=new THREE.MeshLambertMaterial({color:'#38d2f0',transparent:true,opacity:0.62}); wm.userData.own=true;
    const water=new THREE.Mesh(wg,wm); water.rotation.x=-Math.PI/2; water.position.y=-0.2; sc.add(water);
    const fm=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0.6,depthWrite:false}); fm.userData.own=true;
    for(const s of [-1,1]){ put(mk(box(156,0.05,0.9),fm,false),0,-0.17,s*77.3); put(mk(box(0.9,0.05,156),fm,false),s*77.3,-0.17,0); }
    // chemins de terre de la place vers les villages
    for(const p of POIS){ const D=Math.hypot(p.x,p.z), L=D-6, k=(3.5+L/2)/D, m=mk(box(2.6,0.04,+L.toFixed(1)),texMat('dirt','#ecd6ad',1,Math.round(L/3)),false);
      m.rotation.y=Math.atan2(p.x,p.z); put(m,p.x*k,0.015,p.z*k); }
    // fontaine de la Place Centrale
    { const st=texC('stone','#e6e0f0'), wM=new THREE.MeshLambertMaterial({color:'#5fd3ff',emissive:'#1a6fa0',emissiveIntensity:0.35}); wM.userData.own=true;
      put(mk(cyl(2.4,2.5,0.6,24),st),0,0.3,0); put(mk(cyl(2.05,2.05,0.06,24),wM,false),0,0.56,0);
      put(mk(cyl(0.3,0.42,1.9,10),st),0,1.4,0); put(mk(cyl(0.95,0.5,0.35,14),st),0,2.35,0); put(mk(cyl(0.85,0.85,0.05,14),wM,false),0,2.5,0);
      this.solid(-1.75,0,-1.75,1.75,0.6,1.75,null,{rock:true});
      addAmb(this,{kind:'rise',fixed:true,cx:0,cz:0,w:1.5,h:1.7,y0:2.5,n:46,color:'#d8f6ff',size:0.17,glow:true}); }
    // phare près de Port Bonbon (avec faisceau qui tourne)
    { const x=-62, z=62, g=new THREE.Group(); g.position.set(x,0,z); sc.add(g); const cols=['#ffffff','#ff4f6d','#ffffff','#ff4f6d'];
      for(let i=0;i<4;i++){ const r0=+(1.7-i*0.12).toFixed(2), r1=+(r0-0.12).toFixed(2), m=mk(cyl(r1,r0,2.6,16),lam(cols[i])); m.position.y=1.3+i*2.6; g.add(m); }
      const deck=mk(cyl(1.6,1.6,0.25,16),lam('#2b2d42')); deck.position.y=10.5; g.add(deck);
      const lm=new THREE.MeshBasicMaterial({color:'#fff2a8'}); lm.userData.own=true; const lamp=mk(cyl(0.9,0.9,1.4,12),lm,false); lamp.position.y=11.3; g.add(lamp);
      const roof=mk(cone(1.3,1.4,12),lam('#ff4f6d')); roof.position.y=12.7; g.add(roof);
      const door=mk(box(0.9,1.6,0.2),lam('#4f7bff')); door.position.set(1.15,0.8,-1.15); door.rotation.y=Math.PI*0.75; g.add(door);
      const bm=new THREE.MeshBasicMaterial({color:'#fff6c2',transparent:true,opacity:0.2,depthWrite:false,side:THREE.DoubleSide}); bm.userData.own=true;
      const bg=new THREE.Group(); bg.position.y=11.3; g.add(bg);
      for(const s of [1,-1]){ const geo=new THREE.ConeGeometry(2.2,26,12,1,true); geo.userData.own=true; const b=new THREE.Mesh(geo,bm); b.rotation.z=s*Math.PI/2; b.position.x=s*13; bg.add(b); }
      this.spin.push({o:bg,ax:'y',v:0.7}); this.solid(x-1.7,0,z-1.7,x+1.7,13.4,z+1.7,null,{rock:true}); }
    // moulin de la Ferme Rigolote (ailes qui tournent) et bottes de foin
    { const x=60, z=-58, g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=Math.atan2(-x,-z); sc.add(g);
      const body=mk(cyl(1.5,2.1,7,8),texC('brick','#fff4ea')); body.position.y=3.5; g.add(body);
      const roof=mk(cone(2.0,2.2,8),lam('#a0522d')); roof.position.y=8.1; g.add(roof);
      const door=mk(box(1,1.8,0.2),lam('#7a4b23')); door.position.set(0,0.9,2.05); g.add(door);
      const hub=new THREE.Group(); hub.position.set(0,6.6,2.0); g.add(hub);
      const ax=mk(cyl(0.25,0.25,0.6,8),lam('#5a3a1e')); ax.rotation.x=Math.PI/2; hub.add(ax);
      for(let i=0;i<4;i++){ const arm=new THREE.Group(); arm.rotation.z=i*Math.PI/2; hub.add(arm);
        const sail=mk(box(1.1,3.6,0.08),lam(i%2?'#ffffff':'#ffd6e8')); sail.position.set(0.55,2.1,0.32); arm.add(sail);
        const spar=mk(box(0.14,4.2,0.12),lam('#7a4b23')); spar.position.set(0,2.1,0.24); arm.add(spar); }
      this.spin.push({o:hub,ax:'z',v:1.1}); this.solid(x-1.8,0,z-1.8,x+1.8,7.4,z+1.8,null,{rock:true});
      for(const [hx,hz,r] of [[40,-36,0],[43,-33.5,1],[37.5,-38.8,0.4]]){ const h=mk(cyl(0.75,0.75,1.6,12),texC('sand','#f2cf6a')); h.rotation.set(0,r,Math.PI/2); put(h,hx,0.75,hz); this.solid(hx-0.8,0,hz-0.8,hx+0.8,1.5,hz+0.8,null,{tree:true}); } }
    // ponton et bateaux bonbons au large
    { const wd=texC('wood','#e8c08a'); put(mk(box(3,0.2,16),wd),-48.5,0.15,78);
      for(const [px,pz] of [[-49.8,72],[-47.2,72],[-49.8,85],[-47.2,85]]) put(mk(cyl(0.16,0.16,1.6,6),lam('#7a4b23')),px,-0.6,pz);
      for(const [bx,bz,c,ry] of [[-60,95,'#ff4f8b',0.4],[25,-97,'#4f7bff',-0.3],[96,30,'#ffd23f',1.4]]){ const g=new THREE.Group();
        const hull=mk(box(2.4,0.9,5),lam(c)); hull.position.y=0.2; g.add(hull); const dk=mk(box(2.0,0.1,4.4),texC('wood','#e8c08a')); dk.position.y=0.7; g.add(dk);
        const mast=mk(cyl(0.1,0.1,4.2,6),lam('#7a4b23')); mast.position.y=2.8; g.add(mast);
        const sail=mk(box(0.06,3,2.2),lam('#ffffff')); sail.position.set(0,3.1,0.9); g.add(sail);
        g.rotation.y=ry; put(g,bx,0,bz); this.bob.push({o:g,y:0,p:bx}); } }
    addClouds(this,12,[25,95],[36,50],[-90,90]);
    addAmb(this,{kind:'petals',color:'#ffc4e6',size:0.2,n:110,rel:true});
    // tempête animée
    { const c=makeCanvas(256,128), g=c.getContext('2d'), q=g.createLinearGradient(0,0,0,128);
      q.addColorStop(0,'rgba(110,30,190,.85)'); q.addColorStop(1,'rgba(210,110,255,.55)'); g.fillStyle=q; g.fillRect(0,0,256,128);
      g.strokeStyle='rgba(255,255,255,.4)'; g.lineWidth=3; for(let i=0;i<9;i++){ const x=20+i*26; g.beginPath(); g.moveTo(x,0); g.bezierCurveTo(x+22,40,x-22,86,x+8,128); g.stroke(); }
      const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(12,1); t.isOwn=true;
      const sm=this.stormM.material; sm.map=t; sm.color.set('#ffffff'); sm.opacity=0.42; sm.needsUpdate=true; this.stormTex=t; }
    // champignons rebondissants et karts
    const freeSpot=(x,z,r)=>{ for(let i=0;i<40;i++){ const tx=x+(i?rand(-6,6):0), tz=z+(i?rand(-6,6):0);
      if(this.query(tx-r,tx+r,0,3,tz-r,tz+r).length===1&&this.items.every(it=>Math.hypot(it.x-tx,it.z-tz)>r+0.5)&&this.chests.every(c=>Math.hypot(c.x-tx,c.z-tz)>r+0.5)) return [tx,tz]; } return null; };
    for(const [x,z] of RB_PADS){ const s=freeSpot(x,z,1.7); if(!s) continue; const g=rbPadMesh(); put(g,s[0],0,s[1]); this.pads.push({x:s[0],z:s[1],g,sq:0}); }
    for(const [x,z,c] of RB_KARTS){ const s=freeSpot(x,z,2.2); if(!s) continue; const k=rbKartMesh(c), yaw=rand(0,TAU); k.g.rotation.y=yaw; put(k.g,s[0],0,s[1]); this.karts.push({x:s[0],y:0,z:s[1],yaw,g:k.g,wh:k.wh}); }
  };
  R.land=function(){ o.land.call(this); this.feed('🍄 Saute sur un champignon rose pour planer !'); };
  R.speedMul=function(){ if(this.kart) return P.fall?1.6:2.3; return o.speedMul.call(this); };
  R.update=function(dt){
    if(!this.modeChosen){ P.x=this.bus.x; P.y=this.bus.y+0.2; P.z=this.bus.cz; P.vx=P.vy=P.vz=0; P.jumpBuf=0; return; }
    o.update.call(this,dt);
    const pe=this.pEnt, sc=this.scene;
    for(const s of this.spin) s.o.rotation[s.ax]+=s.v*dt;
    for(const b of this.bob){ b.o.position.y=b.y+Math.sin(this.time*1.3+b.p)*0.18; b.o.rotation.z=Math.sin(this.time*0.9+b.p)*0.05; }
    if(this.stormTex) this.stormTex.offset.x+=dt*0.02;
    for(const p of this.pads){ if(p.sq>0) p.sq=Math.max(0,p.sq-dt*3.5); const q=Math.sin(p.sq*Math.PI); p.g.scale.set(1+0.25*q,1-0.45*q,1+0.25*q); }
    // ravitaillements : un au début de la 2e et de la 4e phase de tempête
    const s=this.st; if((s.i===1||s.i===3)&&!this.dropAt[s.i]){ this.dropAt[s.i]=1; this.spawnDrop(); }
    for(const d of this.drops){ if(d.landed) continue; d.y=Math.max(0,d.y-dt*4.5); d.g.position.y=d.y; d.g.rotation.y+=dt*0.5;
      if(d.y<=0){ d.landed=true; d.g.remove(d.bal); burst(sc,d.x,0.6,d.z,'#ffd23f',14,5); this.chests.push({x:d.x,z:d.z,g:d.g,open:false,supply:d}); } }
    if(this.over) return;
    // champignons rebondissants puis vol plané
    this.padCd-=dt;
    if(pe.landed&&pe.alive&&!this.hook){
      if(this.padCd<=0&&P.vy<=0.5&&P.y<1.3) for(const p of this.pads){ if(Math.hypot(P.x-p.x,P.z-p.z)<1.3){ P.vy=this.kart?21:26; P.onGround=false; P.fall=0; P.jumpBuf=0; this.glide=true; this.padCd=0.7; p.sq=1; sfx('boing'); burst(sc,p.x,0.9,p.z,'#ff4f6d',10,5); break; } }
      if(this.glide){ if(!P.fall&&P.vy<-1.5&&P.y>3){ P.fall=-5; PA.glider.visible=true; }
        else if(P.onGround&&P.vy<=0){ this.glide=false; P.fall=0; PA.glider.visible=false; } }
    }
    // karts
    let near=null;
    if(!this.kart&&pe.landed&&pe.alive&&P.onGround) for(const k of this.karts){ if(Math.hypot(k.x-P.x,k.z-P.z)<2.3&&Math.abs(k.y-P.y)<1.2){ near=k; break; } }
    this.nearK=near; const kv=!!(near||this.kart); if(kv!==this._kv){ this._kv=kv; $('hud').classList.toggle('nearKart',kv); }
    const kl=this.kart?'🚶':'🛻'; if(kl!==this._kl){ this._kl=kl; const b=$('bKart'); if(b){ b.textContent=kl; b.setAttribute('aria-label',this.kart?'Descendre du kart':'Monter dans le kart'); } }
    if(near&&!this._kTip){ this._kTip=1; this.feed(IS_TOUCH?'🛻 Touche 🛻 pour monter dans le kart':'🛻 Appuie sur R pour monter dans le kart'); }
    if(this.kart){ const sp=Math.hypot(P.vx,P.vz); engineSet(sp/15); for(const w of this.kart.wh) w.rotation.x+=sp*dt*3;
      if(sp>7) for(const e of this.bots){ if(!e.alive||!e.landed||e.team===0||(e.bumpT||0)>this.time) continue; const dx=e.x-P.x, dz=e.z-P.z, d=Math.hypot(dx,dz)||1;
        if(d<1.5&&Math.abs(e.y-P.y)<1.5){ e.bumpT=this.time+0.8; e.vx+=dx/d*14; e.vz+=dz/d*14; e.vy=9; burst(sc,e.x,e.y+1,e.z,'#ffd23f',8,5); sfx('hit'); this.dmgEnt(e,25,pe); if(this.over) return; } } }
    if(this.hook) this.updHook(dt);
    for(const b of this.bots) if(b.dnA){ this.dmgNum(b,b.dnA,b.dnSh); b.dnA=0; }
  };
  R.idle=function(dt){
    o.idle.call(this,dt);
    for(const s of this.spin) s.o.rotation[s.ax]+=s.v*dt;
    if(this.fw>0){ this.fw-=dt; this.fwT=(this.fwT||0)-dt; if(this.fwT<=0){ this.fwT=0.35; const a=rand(0,TAU), r=rand(3,8); confetti(this.scene,P.x+Math.cos(a)*r,P.y+rand(5,9),P.z+Math.sin(a)*r); sfx('cp'); } }
  };
  R.hud=function(){
    o.hud.call(this);
    const a=this.ally, row=$('allyRow'); if(row) row.style.display=a?'':'none';
    if(a){ const b=$('alBar'); if(b) b.style.width=(a.alive?Math.max(0,a.hp):0)+'%'; }
  };
  R.drawMap=function(){
    o.drawMap.call(this);
    const c=$('miniMap'); if(!c||!c.getContext) return; const g=c.getContext('2d'), k=c.width/150, X=x=>(x+75)*k;
    g.fillStyle='#ff4f6d'; for(const p of this.pads){ g.beginPath(); g.arc(X(p.x),X(p.z),4,0,TAU); g.fill(); }
    g.fillStyle='#2b2d42'; for(const kt of this.karts) if(kt!==this.kart) g.fillRect(X(kt.x)-4,X(kt.z)-4,8,8);
    for(const d of this.drops) if(!d.opened){ g.fillStyle='#ffd23f'; g.strokeStyle='#1d1846'; g.lineWidth=2; g.fillRect(X(d.x)-7,X(d.z)-7,14,14); g.strokeRect(X(d.x)-7,X(d.z)-7,14,14); }
    const al=this.ally; if(al&&al.alive&&al.phase!=='bus'){ g.fillStyle='#3ad17a'; g.strokeStyle='#ffffff'; g.lineWidth=2; g.beginPath(); g.arc(X(al.x),X(al.z),6,0,TAU); g.fill(); g.stroke(); }
  };
  // ----- objets : 5 cases, bonbombes et grappin empilables -----
  R.renderHotbar=function(){
    const bs=$('hotbar').children;
    for(let i=0;i<bs.length;i++){ const b=bs[i], it=this.inv[i];
      b.textContent=it?(it.w==='pickaxe'?'⛏️':WPN[it.w].ic):''; b.style.borderColor=it&&it.w!=='pickaxe'?WRAR[it.r].c:'transparent'; b.classList.toggle('on',i===this.sel);
      if(b.dataset) b.dataset.n=it&&it.n?'×'+it.n:''; }
  };
  R.select=function(i){ if(!this.inv[i]) return; this.sel=i; const it=this.inv[i]; if(!this.kart) setHeld(PA,it.w,it.r); PA.aim=false; this.renderHotbar(); sfx('click'); };
  R.useUp=function(){ this.inv[this.sel]=null; let j=this.inv.findIndex((x,i)=>i>0&&x); if(j<0) j=0; this.select(j); };
  R.pickup=function(it){
    if(it.kind!=='w') return o.pickup.call(this,it);
    const W=WPN[it.w];
    if(W.stack){ const have=this.inv.find(x=>x&&x.w===it.w);
      if(have){ if(have.n>=W.stack*2) return; have.n=Math.min(W.stack*2,have.n+(it.n||W.stack)); sfx('buy'); this.feed('➕ '+W.n+' ×'+have.n); this.renderHotbar(); this.takeItem(it); return; } }
    let s=this.inv.findIndex((x,i)=>i>0&&!x);
    if(s<0){ let worst=-1; for(let i=1;i<this.inv.length;i++) if(this.inv[i].r<it.r&&(worst<0||this.inv[i].r<this.inv[worst].r)) worst=i;
      if(worst<0) return; const old=this.inv[worst]; this.dropItem(Object.assign({kind:'w'},old),P.x-Math.sin(P.yaw)*1.6,P.z-Math.cos(P.yaw)*1.6); s=worst; }
    this.inv[s]={w:it.w,r:it.r}; if(W.stack) this.inv[s].n=it.n||W.stack;
    sfx('buy'); this.feed('➕ '+W.n+(W.stack?' ×'+this.inv[s].n:' '+WRAR[it.r].n));
    if(this.sel===0||this.sel===s){ this.sel=s; if(!this.kart) setHeld(PA,it.w,it.r); }
    this.renderHotbar(); this.takeItem(it);
  };
  R.tryFire=function(){
    if(this.over||!this.pEnt.alive||!this.pEnt.landed||this.fireCd>0) return;
    if(this.kart){ this.fireCd=0.6; try{ VSND.horn.car(); }catch(e){} return; }
    const it=this.inv[this.sel], W=it&&WPN[it.w];
    if(W&&W.hook) return this.fireHook(it);
    if(W&&W.toss) return this.throwBomb(it);
    o.tryFire.call(this);
  };
  R.onAction=function(){ if(this.kart||this.nearK){ this.toggleKart(); return; } this.tryFire(); };
  R.onKey=function(code){ if(code==='Digit5') return this.select(4); if(code==='KeyR') return this.toggleKart(); o.onKey.call(this,code); };
  R.throwBomb=function(it){
    const W=WPN.grenade; this.fireCd=W.rate; this.aimT=0.6;
    const yaw=Math.atan2(cam.fx,cam.fz); P.yaw=yaw; PA.aim=true; PA.swing=0.28;
    const ox=P.x+Math.sin(yaw)*0.5, oy=P.y+1.7, oz=P.z+Math.cos(yaw)*0.5, t=this.aimPoint(W.range);
    const dx=t.x-ox, dz=t.z-oz, T=clamp(Math.hypot(dx,dz)/16,0.35,1.7), g=W.grav, vy=(t.y-oy+0.5*g*T*T)/T;
    let m=this.pPool.pop(); if(!m){ m=new THREE.Mesh(sph(0.13),lam('#ffffff')); m.castShadow=false; this.scene.add(m); }
    m.material=lam('#ff4f8b'); m.scale.setScalar(2.3); m.visible=true; m.position.set(ox,oy,oz);
    this.proj.push({x:ox,y:oy,z:oz,vx:dx/T,vy,vz:dz/T,owner:this.pEnt,dmg:W.dmg*WRAR[it.r].m,life:T+1.2,splash:W.splash,grav:g,bomb:1,m,col:'#ff4f8b'});
    it.n--; sfx('swing'); if(it.n<=0) this.useUp(); else this.renderHotbar();
  };
  R.fireHook=function(it){
    const W=WPN.grapple; this.fireCd=W.rate; const yaw=Math.atan2(cam.fx,cam.fz); P.yaw=yaw; PA.aim=true; this.aimT=0.5;
    const t=this.aimPoint(W.range);
    if(t.miss||Math.hypot(t.x-P.x,t.y-P.y-1,t.z-P.z)<2.5){ sfx('nope'); banner('🪝 Vise un mur, un arbre ou le sol plus loin'); return; }
    it.n--; this.hook={x:t.x,y:Math.max(0.4,t.y),z:t.z,t:0,ld:1e9};
    P.fall=0; this.glide=false; PA.glider.visible=false; sfx('swing'); burst(this.scene,t.x,t.y,t.z,'#ffd23f',6,3);
    if(!this.rope){ this.rope=mk(box(0.07,0.07,1),lam('#5a3a1e'),false); this.scene.add(this.rope); }
    this.rope.visible=true;
    if(it.n<=0) this.useUp(); else this.renderHotbar();
  };
  R.updHook=function(dt){
    const h=this.hook; h.t+=dt;
    const dx=h.x-P.x, dy=h.y-(P.y+0.9), dz=h.z-P.z, d=Math.hypot(dx,dy,dz)||1;
    if(d<1.6||h.t>1.8||(h.t>0.2&&h.ld-d<0.08)||this.over||!this.pEnt.alive){ this.hook=null; this.rope.visible=false; if(!P.onGround) P.vy=Math.max(P.vy,5); return; }
    h.ld=d; const sp=24; P.vx=dx/d*sp; P.vz=dz/d*sp; P.vy=dy/d*sp+1.5; P.knock=0.06;
    const hx=P.x, hy=P.y+1.3, hz=P.z, L=Math.hypot(h.x-hx,h.y-hy,h.z-hz)||0.01;
    this.rope.position.set((hx+h.x)/2,(hy+h.y)/2,(hz+h.z)/2); this.rope.scale.set(1,1,L); this.rope.lookAt(h.x,h.y,h.z);
  };
  R.toggleKart=function(){
    if(this.over||!this.pEnt.alive||!this.pEnt.landed) return false;
    if(this.kart){ if(!P.onGround) return false; const k=this.kart, yaw=P.yaw; PA.root.remove(k.g);
      k.x=clamp(P.x-Math.sin(yaw)*1.9,-68,68); k.z=clamp(P.z-Math.cos(yaw)*1.9,-68,68); k.y=Math.max(0,P.y); k.yaw=yaw;
      k.g.position.set(k.x,k.y,k.z); k.g.rotation.set(0,yaw,0); this.scene.add(k.g);
      this.kart=null; engineStop(); const it=this.inv[this.sel]; if(it) setHeld(PA,it.w,it.r); this.shoulder=0.9; cam.dist=5.5; sfx('click'); return true; }
    const k=this.nearK; if(!k) return false;
    this.kart=k; this.nearK=null; this.firing=false; this.scene.remove(k.g); k.g.position.set(0,0,0); k.g.rotation.set(0,0,0); PA.root.add(k.g);
    P.x=k.x; P.z=k.z; P.yaw=k.yaw; setHeld(PA,null); engineStart('car'); try{ VSND.start.car(); }catch(e){}
    this.shoulder=0; cam.dist=7.5; banner('🛻 Fonce dans les robots pour les bousculer !'); return true;
  };
  R.spawnDrop=function(){
    const s=this.st, a=rand(0,TAU), r=rand(0,Math.max(1,s.nr*0.5)), sc=this.scene;
    const x=clamp(s.nx+Math.cos(a)*r,-60,60), z=clamp(s.nz+Math.sin(a)*r,-60,60);
    const g=new THREE.Group(), cr=mk(box(1.3,1.1,1.3),texC('wood','#ffd98a')); cr.position.y=0.55; g.add(cr);
    const b1=mk(box(1.36,0.2,1.36),lam('#4f7bff')), b2=mk(box(0.22,1.14,1.36),lam('#4f7bff')); b1.position.y=0.55; b2.position.y=0.55; g.add(b1,b2);
    const star=mk(oct(0.28),emat('#ffd23f','#7a5a00')); star.position.y=1.35; g.add(star);
    const bal=new THREE.Group(); g.add(bal);
    [['#ff4f8b',-0.55,0],['#ffd23f',0.55,0.1],['#3ad17a',0,-0.55],['#4fa8ff',0.1,0.55]].forEach(([c,bx,bz])=>{ const q=mk(sph(0.62),lam(c),false); q.scale.set(1,1.2,1); q.position.set(bx,4.3,bz); bal.add(q);
      const st=mk(box(0.03,3.1,0.03),lam('#ffffff'),false); st.position.set(bx*0.5,2.65,bz*0.5); bal.add(st); });
    g.position.set(x,42,z); sc.add(g);
    const bm=new THREE.MeshBasicMaterial({color:'#ffe066',transparent:true,opacity:0.28,depthWrite:false}); bm.userData.own=true;
    const bgeo=new THREE.CylinderGeometry(0.45,0.45,70,10,1,true); bgeo.userData.own=true; const beam=new THREE.Mesh(bgeo,bm); beam.position.set(x,35,z); sc.add(beam);
    this.drops.push({x,z,y:42,g,bal,beam,landed:false,opened:false});
    banner('📦 Un ravitaillement tombe du ciel !'); this.feed('📦 Ravitaillement : regarde la carte'); sfx('cp');
  };
  R.openChest=function(c){
    if(!c.supply) return o.openChest.call(this,c);
    const bm=c.supply.beam; c.open=true; c.supply.opened=true; this.scene.remove(c.g); this.scene.remove(bm); bm.geometry.dispose(); bm.material.dispose();
    confetti(this.scene,c.x,1,c.z); burst(this.scene,c.x,1,c.z,'#ffd23f',18,6);
    this.dropItem({kind:'w',w:pickW({sniper:3,rocket:3,shotgun:2,rapid:2}),r:3},c.x+1,c.z);
    this.dropItem({kind:'w',w:'grenade',r:2,n:3},c.x-1,c.z);
    this.dropItem({kind:'shield'},c.x,c.z+1); this.dropItem({kind:'heal'},c.x,c.z-1);
    if(Math.hypot(P.x-c.x,P.z-c.z)<20){ sfx('win'); banner('📦 Ravitaillement : arme légendaire !'); }
  };
  // ----- constructions (joueur et robots) -----
  R.buildAt=function(kind,x,y,z,fx,fz,pl){
    let dx=0, dz=0; if(Math.abs(fx)>Math.abs(fz)) dx=Math.sign(fx)||1; else dz=Math.sign(fz)||1;
    const cx=Math.floor(x/4), cz=Math.floor(z/4), base=Math.max(0,Math.floor((y+2.5)/4)*4);
    let key, b;
    if(kind==='wall'){
      if(dx){ const ex=dx>0?(cx+1)*4:cx*4; key='w|x|'+ex+'|'+cz+'|'+base; b={x0:ex-0.15,x1:ex+0.15,z0:cz*4,z1:cz*4+4,y0:base,y1:base+4}; }
      else { const ez=dz>0?(cz+1)*4:cz*4; key='w|z|'+cx+'|'+ez+'|'+base; b={x0:cx*4,x1:cx*4+4,z0:ez-0.15,z1:ez+0.15,y0:base,y1:base+4}; }
    } else {
      const fx2=cx+dx, fz2=cz+dz; b={x0:fx2*4,x1:fx2*4+4,z0:fz2*4,z1:fz2*4+4};
      if(kind==='floor'){ key='f|'+fx2+'|'+fz2+'|'+base; b.y0=base-0.2; b.y1=base; }
      else { key='r|'+fx2+'|'+fz2+'|'+base+'|'+dx+'|'+dz; b.y0=base; b.y1=base+4; b.noCam=true;
        const X0=b.x0, X1=b.x1, Z0=b.z0, Z1=b.z1;
        b.ramp=dx>0?(q)=>base+clamp(q-X0,0,4):dx<0?(q)=>base+clamp(X1-q,0,4):dz>0?(q,w)=>base+clamp(w-Z0,0,4):(q,w)=>base+clamp(Z1-w,0,4); }
    }
    if(this.pieceKeys.has(key)||Math.abs(b.x0)>72||Math.abs(b.z0)>72||b.y1>60) return false;
    if(!pl&&this.pieces.length>140) return false;
    const wm=tmat(pl?'#d39a5c':'#c9ae86'); let m;
    if(b.ramp){ const L=5.657; m=mk(dx?box(L,0.2,4):box(4,0.2,L),wm); m.position.set((b.x0+b.x1)/2,base+2,(b.z0+b.z1)/2); if(dx) m.rotation.z=dx>0?Math.PI/4:-Math.PI/4; else m.rotation.x=dz>0?-Math.PI/4:Math.PI/4; }
    else { m=mk(box(+(b.x1-b.x0).toFixed(2),+(b.y1-b.y0).toFixed(2),+(b.z1-b.z0).toFixed(2)),wm); m.position.set((b.x0+b.x1)/2,(b.y0+b.y1)/2,(b.z0+b.z1)/2); }
    this.scene.add(m); m.scale.setScalar(0.3); this.pops.push({m,t:0});
    Object.assign(b,{piece:true,hp:pl?150:110,key,m}); this.pieces.push(b); this.pieceKeys.add(key); this.gridAdd(b);
    return true;
  };
  R.build=function(kind){
    if(this.over||!this.pEnt.landed||!this.pEnt.alive) return;
    if(this.wood<10){ banner('Pas assez de bois 🪵 Tape les arbres avec ta pioche !'); sfx('nope'); return; }
    if(this.buildAt(kind,P.x,P.y,P.z,cam.fx,cam.fz,true)){ this.wood-=10; sfx('place'); }
  };
  // ----- dégâts, équipes, éliminations -----
  R.dmgEnt=function(e,amt,by){
    if(!e.alive||amt<=0) return;
    if(by&&by.team!==undefined&&by.team===e.team) return;
    const D=this.diff||RB_MODES.classic;
    if(e.isPlayer){ if(by&&!by.isPlayer) amt*=D.hurt; else if(!by) amt*=D.storm; }
    else if(e.ally&&by) amt*=0.7;
    const sh0=e.sh, real=Math.min(amt,Math.max(0,e.hp)+e.sh);
    o.dmgEnt.call(this,e,amt,by);
    if(by===this.pEnt&&!e.isPlayer){ this.dealt+=real; e.dnA=(e.dnA||0)+real; e.dnSh=sh0>0; }
    if(!e.isPlayer&&by&&e.alive&&e.phase==='ground'&&e.onGround&&(e.buildCd||0)<this.time&&Math.random()<D.build){
      e.buildCd=this.time+4.5; this.buildAt('wall',e.x,e.y,e.z,by.x-e.x,by.z-e.z,false); }
  };
  R.dmgNum=function(e,amt,sh){
    try{ const bx=$('dmgNums'); if(!bx||bx.children.length>16) return;
      RB_V.set(e.x,e.y+2.2,e.z).project(camera); if(!(RB_V.z<1)) return;
      const d=document.createElement('div'); d.className='dn'+(sh?' sh':'')+(e.alive?'':' big'); d.textContent=String(Math.max(1,Math.round(amt)));
      d.style.left=Math.round((RB_V.x+1)/2*innerWidth+rand(-16,16))+'px'; d.style.top=Math.round((1-RB_V.y)/2*innerHeight)+'px';
      bx.appendChild(d); setTimeout(()=>{ if(d.parentNode) d.parentNode.removeChild(d); },900);
    }catch(err){}
  };
  R.eliminate=function(e,by){
    e.alive=false; e.hp=0;
    burst(this.scene,e.x,e.y+1,e.z,e.col||'#ffffff',16,6); confetti(this.scene,e.x,e.y+1.2,e.z); sfx('poof');
    if(!e.isPlayer){ e.A.root.visible=false; if(e.w) this.dropItem({kind:'w',w:e.w.w,r:e.w.r},e.x,e.z); if(Math.random()<0.6) this.dropItem({kind:'shield'},e.x+0.8,e.z); }
    const nm=q=>q.isPlayer?S.name:(q.ally?'🤝 ':'🤖 ')+q.name;
    this.feed(by&&by!==e?nm(by)+' a éliminé '+nm(e):nm(e)+' a été emporté par la tempête');
    if(by===this.pEnt&&!e.isPlayer){ this.kills++; this.streak=this.time-this.lastKill<6?this.streak+1:1; this.lastKill=this.time;
      banner(this.streak>=3?'🔥 '+this.streak+' éliminations d\'affilée !':this.streak===2?'⚡ Double élimination !':'🎯 Éliminé : '+e.name+' !'); if(this.streak>=2) sfx('cp'); }
    else if(by&&by.ally&&!e.isPlayer) this.allyKills++;
    if(e.isPlayer) return this.end(false,by);
    if(e.ally){ banner('💔 '+e.name+' est éliminé… continue, tu peux gagner !'); sfx('nope'); }
    if(this.pEnt.alive&&this.bots.every(b=>!b.alive||b.team===0)) this.end(true);
  };
  R.end=function(win,by){
    if(this.over) return; this.over=true; this.firing=false;
    if(this.hook){ this.hook=null; if(this.rope) this.rope.visible=false; } engineStop();
    const alive=this.bots.filter(b=>b.alive).length, place=win?1:alive+1;
    const coins=this.kills*5+Math.max(0,17-place)*2+(win?50:0); addCoins(coins);
    if(win){ S.best.royaleWins=(S.best.royaleWins||0)+1; sfx('win'); confetti(this.scene,P.x,P.y+2,P.z); this.fw=5; if(PA) PA.waveT=4; }
    if(!S.best.royalePlace||place<S.best.royalePlace) S.best.royalePlace=place;
    const rec=this.kills>0&&this.kills>(S.best.royaleKills||0); if(rec) S.best.royaleKills=this.kills;
    save();
    const M=RB_MODES[this.mode]||RB_MODES.classic, st=[['Place',(win?'1re':place+'e')+' / 16'],['Éliminations',this.kills+(rec?' 🏅 record !':'')],['Dégâts',Math.round(this.dealt)],['Pièces gagnées','+'+coins]];
    if(this.ally) st.splice(2,0,['🤝 '+this.ally.name,this.allyKills+' élim.']);
    showResult(win?{icon:'👑',title:this.ally?'Champions de l\'île !':'Champion de l\'île !',sub:(this.ally?'Toi et '+this.ally.name+', derniers debout':'Tu es le dernier debout')+', bravo '+S.name+' ! ('+M.ic+' '+M.t+')',stats:st}
      :{icon:'🎨',title:'Éliminé !',sub:by?'Repeint par 🤖 '+by.name+'.':'La tempête t\'a rattrapé.',stats:st});
  };
  R.stop=function(){
    if(this.kart&&PA) PA.root.remove(this.kart.g); this.kart=null; engineStop(true);
    o.stop.call(this); $('hud').classList.remove('nearKart'); const d=$('dmgNums'); if(d) d.innerHTML='';
  };
  // ----- visée et pioche : on ne touche jamais son équipe -----
  R.aimPoint=function(range){
    const tol=IS_TOUCH?0.2:0.08; let best=null, ba=tol;
    for(const e of this.ents){ if(e.team===0||!e.alive) continue; const dx=e.x-cam.px, dy=e.y+1.1-cam.py, dz=e.z-cam.pz, l=Math.hypot(dx,dy,dz);
      if(l>range+cam.d) continue; const a=Math.acos(clamp((dx*cam.fx+dy*cam.fy+dz*cam.fz)/l,-1,1)); if(a<ba&&this.los(this.pEnt,e)){ ba=a; best=e; } }
    if(best) return {x:best.x,y:best.y+1.1,z:best.z,e:best};
    for(let s=cam.d+0.8;s<range+cam.d;s+=0.6){ const x=cam.px+cam.fx*s, y=cam.py+cam.fy*s, z=cam.pz+cam.fz*s;
      if(y<0) return {x,y:0,z};
      for(const e of this.ents) if(e.team!==0&&e.alive&&x>e.x-0.45&&x<e.x+0.45&&z>e.z-0.45&&z<e.z+0.45&&y>e.y&&y<e.y+1.9) return {x,y,z,e};
      for(const b of this.query(x-0.05,x+0.05,y-0.05,y+0.05,z-0.05,z+0.05)) if(b!==this.ground&&!b.ramp) return {x,y,z}; }
    return {x:cam.px+cam.fx*(range+cam.d),y:cam.py+cam.fy*(range+cam.d),z:cam.pz+cam.fz*(range+cam.d),miss:1};
  };
  R.swingPick=function(){
    this.fireCd=0.45; PA.swing=0.28; sfx('swing');
    const yaw=Math.atan2(cam.fx,cam.fz); P.yaw=yaw;
    const hx=P.x+Math.sin(yaw)*1.4, hz=P.z+Math.cos(yaw)*1.4, hy=P.y+1.1;
    for(const e of this.bots) if(e.alive&&e.landed&&e.team!==0&&Math.hypot(e.x-hx,e.z-hz)<1.3&&Math.abs(e.y-P.y)<1.6){ this.dmgEnt(e,20,this.pEnt); return; }
    for(const b of this.query(hx-0.5,hx+0.5,hy-0.6,hy+0.6,hz-0.5,hz+0.5)){ if(b===this.ground) continue;
      if(b.piece){ this.hitPiece(b,50); return; }
      const w=b.tree?12:5; this.wood=Math.min(999,this.wood+w); burst(this.scene,hx,hy,hz,b.tree?'#a0703c':'#9aa0aa',6,3); sfx('brk'); return; }
  };
  R.updProj=function(dt){
    for(let i=this.proj.length-1;i>=0;i--){ const p=this.proj[i]; p.life-=dt; let hit=null; const ot=p.owner.team;
      if(p.grav) p.vy-=p.grav*dt;
      const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy,p.vz)*dt/0.4)), h=dt/steps;
      for(let s=0;s<steps&&!hit;s++){ p.x+=p.vx*h; p.y+=p.vy*h; p.z+=p.vz*h;
        if(p.y<0.03){ hit={t:'g'}; break; }
        for(const e of this.ents) if(e!==p.owner&&e.alive&&e.team!==ot&&p.x>e.x-0.45&&p.x<e.x+0.45&&p.z>e.z-0.45&&p.z<e.z+0.45&&p.y>e.y&&p.y<e.y+1.9){ hit={t:'e',e}; break; }
        if(hit) break;
        for(const b of this.query(p.x-0.1,p.x+0.1,p.y-0.1,p.y+0.1,p.z-0.1,p.z+0.1)){ if(b===this.ground) continue;
          if(b.ramp){ const sy=b.ramp(p.x,p.z); if(p.y<sy+0.15&&p.y>sy-0.35){ hit={t:'s',b}; break; } continue; }
          hit={t:'s',b}; break; }
      }
      if(hit||p.life<=0){ if(hit||p.bomb) this.impact(p,hit||{t:'g'}); p.m.visible=false; this.pPool.push(p.m); this.proj.splice(i,1); }
      else p.m.position.set(p.x,p.y,p.z);
    }
  };
  // ----- robots : équipes, allié, difficulté, champignons, ravitaillements -----
  R.botWants=function(e,it){ if(it.kind==='w'&&WPN[it.w]&&WPN[it.w].stack) return false; return o.botWants.call(this,e,it); };
  R.botFire=function(e,o2,d){
    const W=WPN[e.w.w], D=e.ally?RB_MODES.classic:(this.diff||RB_MODES.classic); e.fireCd=(W.rate*1.35+rand(0,0.3))*D.rate; e.aimT=0.7; e.faceT=0.4;
    const yaw=Math.atan2(o2.x-e.x,o2.z-e.z), ox=e.x+Math.sin(yaw)*0.5, oy=e.y+1.35, oz=e.z+Math.cos(yaw)*0.5;
    const err=(0.06+d*0.004)*D.err, tx=o2.x+rand(-1,1)*err*d, ty=o2.y+1.1+rand(-1,1)*err*d*0.6, tz=o2.z+rand(-1,1)*err*d;
    let dx=tx-ox, dy=ty-oy, dz=tz-oz; const l=Math.hypot(dx,dy,dz)||1;
    this.shoot(e,e.w,ox,oy,oz,dx/l,dy/l,dz/l,o2.isPlayer?0.5:1);
  };
  R.updBot=function(e,dt){
    if(!e.alive) return;
    const D=e.ally?RB_MODES.classic:(this.diff||RB_MODES.classic);
    if(e.phase==='bus'){
      if(e.ally){ if(this.frozen&&!this.bus.done) return; }
      else if(this.time<e.dropT&&!this.bus.done) return;
      e.phase='fall'; e.x=this.bus.x; e.y=this.bus.y-1.5; e.z=this.bus.cz; e.A.root.visible=true; }
    let wx=0, wz=0, sp=6.2;
    e.fireCd-=dt; e.aimT-=dt; e.faceT-=dt;
    if(e.phase==='fall'){ if(e.ally){ e.lx=P.x+1.8; e.lz=P.z+1.2; }
      e.fall=e.y>22?-18:-5; e.A.glider.visible=e.y<=22; const dx=e.lx-e.x, dz=e.lz-e.z, d=Math.hypot(dx,dz); if(d>1){ wx=dx/d; wz=dz/d; } sp=e.y>22?12:9; }
    else {
      const s=this.st, dc=Math.hypot(e.x-s.cx,e.z-s.cz), pd=Math.hypot(P.x-e.x,P.z-e.z);
      e.think-=dt;
      if(e.think<=0){ e.think=0.45;
        const sight=e.w?D.sight:14;
        const cand=this.ents.filter(q=>q!==e&&q.alive&&q.landed&&q.team!==e.team&&!(q.isPlayer&&this.graceT>0)).map(q=>[q,Math.hypot(q.x-e.x,q.z-e.z)*(q.isPlayer?D.pw:1)]).filter(c=>c[1]<sight).sort((a,b)=>a[1]-b[1]).slice(0,2);
        e.tgt=null; for(const [q] of cand) if(this.los(e,q)){ e.tgt=q; break; }
        const ag=e.aggro; if(!e.tgt&&ag&&ag.alive&&ag.landed&&ag.team!==e.team&&!(ag.isPlayer&&this.graceT>0)&&Math.hypot(ag.x-e.x,ag.z-e.z)<30) e.tgt=ag;
        e.loot=null;
        if(!e.tgt&&(!e.w||e.w.r<2||e.sh<50||e.hp<60)){ let bd=e.ally?14:30;
          for(const it of this.items){ const d=Math.hypot(it.x-e.x,it.z-e.z); if(d<bd&&this.botWants(e,it)&&(!e.ally||Math.hypot(it.x-P.x,it.z-P.z)<16)){ bd=d; e.loot=it; } }
          if(!e.ally) for(const c of this.chests){ if(c.open) continue; const d=Math.hypot(c.x-e.x,c.z-e.z)*(c.supply?0.5:1); if(d<bd){ bd=d; e.loot=c; } } }
      }
      if(e.detT>0){ e.detT-=dt; wx=e.ddx; wz=e.ddz; }
      else if(dc>s.r-3&&s.r>1.5){ wx=(s.cx-e.x)/dc; wz=(s.cz-e.z)/dc; sp=6.6; }
      else if(e.tgt){ const q=e.tgt, dx=q.x-e.x, dz=q.z-e.z, d=Math.hypot(dx,dz)||1, W=e.w?WPN[e.w.w]:null;
        const want=W?clamp(W.range*0.4,3,22):1.1, f=d>want+2?1:d<want-2?-0.6:0;
        e.strT-=dt; if(e.strT<=0){ e.strT=rand(0.7,1.8); e.str=Math.random()<0.5?-1:1; }
        wx=dx/d*f-dz/d*e.str*0.7; wz=dz/d*f+dx/d*e.str*0.7; const l=Math.hypot(wx,wz)||1; wx/=l; wz/=l;
        e.faceT=0.3; e.yaw=Math.atan2(dx,dz);
        if(e.fireCd<=0){ if(W&&d<W.range) this.botFire(e,q,d); else if(!W&&d<1.8){ e.fireCd=0.8*D.rate; e.A.swing=0.28; this.dmgEnt(q,q.isPlayer?8:12,e); } } }
      else if(e.loot){ const it=e.loot, dx=it.x-e.x, dz=it.z-e.z, d=Math.hypot(dx,dz)||1; wx=dx/d; wz=dz/d;
        if(d<1.3){ if(it.g&&it.open===undefined){ if(this.items.indexOf(it)>=0) this.botTake(e,it); } else if(!it.open) this.openChest(it); e.loot=null; e.think=0; } }
      else if(e.ally&&this.pEnt.alive&&pd>5){ wx=(P.x-e.x)/pd; wz=(P.z-e.z)/pd; sp=pd>12?7.4:6.2; }
      else if(!e.ally){ if(!e.roam||Math.hypot(e.roam[0]-e.x,e.roam[1]-e.z)<2){ const a=rand(0,TAU), r=rand(0,Math.max(2,s.nr*0.8)); e.roam=[s.nx+Math.cos(a)*r,s.nz+Math.sin(a)*r]; }
        const dx=e.roam[0]-e.x, dz=e.roam[1]-e.z, d=Math.hypot(dx,dz)||1; wx=dx/d; wz=dz/d; sp=4.5; }
    }
    const px=e.x, pz=e.z, n=Math.ceil(dt/0.016), h=dt/n; let blocked=false;
    for(let i=0;i<n;i++) blocked=this.entStep(e,h,wx,wz,sp)||blocked;
    if(e.phase==='fall'&&e.onGround){ e.phase='ground'; e.landed=true; e.fall=0; e.A.glider.visible=false; }
    if(e.phase==='ground'&&(wx||wz)){
      if(blocked&&e.onGround) e.vy=10;
      if(Math.hypot(e.x-px,e.z-pz)<sp*dt*0.25){ e.stuck+=dt; if(e.stuck>0.7){ e.stuck=0; const a=rand(0,TAU); e.detT=rand(0.6,1.4); e.ddx=Math.cos(a); e.ddz=Math.sin(a); } } else e.stuck=0;
    }
    if(e.phase==='ground'&&e.onGround&&e.vy<=0&&e.y<1) for(const p of this.pads) if(Math.abs(p.x-e.x)<1.2&&Math.abs(p.z-e.z)<1.2){ e.vy=20; p.sq=1; break; }
    if(e.faceT<=0&&(Math.abs(e.vx)+Math.abs(e.vz)>0.5)) e.yaw=angLerp(e.yaw,Math.atan2(e.vx,e.vz),Math.min(1,10*dt));
    e.A.aim=e.aimT>0;
    e.A.root.position.set(e.x,e.y,e.z); e.A.root.rotation.y=e.yaw; animAvatar(e.A,dt,Math.hypot(e.vx,e.vz),e.onGround||e.phase==='fall');
  };
}
$('bKart').addEventListener('click',()=>{ if(G&&G.id==='royale'){ sfx('click'); G.toggleKart(); } });
