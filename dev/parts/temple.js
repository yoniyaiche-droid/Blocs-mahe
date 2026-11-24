/* =========================================================
   23. Le Temple d'Émeraude : exploration en 7 salles (blocs à
       pousser sur des dalles, couloir de pièges, leviers dans
       l'ordre de la fresque, gouffre de lave, rocher qui roule,
       trésor), 5 reliques cachées, mur de lianes, lance-pierre
   ========================================================= */
const TP_RELICS=[{n:'Masque de jade',ic:'🟩'},{n:'Amulette soleil',ic:'🌞'},{n:'Statuette chat',ic:'🐈'},{n:'Coupe d\'or',ic:'🏆'},{n:'Scarabée bleu',ic:'🪲'}];
const TP_SYM=['☀️','🌙','⭐'];
function tpRelicMesh(k){
  const g=new THREE.Group(), add=(geo,mat,x,y,z)=>{ const m=mk(geo,mat); m.position.set(x,y,z); g.add(m); return m; }, au=emat('#ffd23f','#7a5a00');
  if(k===0){ add(box(0.6,0.75,0.14),emat('#3ad17a','#0a5a2a'),0,0,0); for(const s of [-1,1]) add(box(0.14,0.1,0.16),lam('#1d1846'),s*0.14,0.1,0); add(box(0.22,0.06,0.16),lam('#1d1846'),0,-0.18,0); }
  else if(k===1){ const d=add(cyl(0.32,0.32,0.08,18),au,0,0,0); d.rotation.x=Math.PI/2; for(let i=0;i<8;i++){ const r=add(box(0.07,0.22,0.06),au,0,0,0); r.rotation.z=i/8*TAU; r.translateY(0.42); } }
  else if(k===2){ add(box(0.36,0.42,0.3),au,0,-0.1,0); add(box(0.3,0.28,0.26),au,0,0.25,0.04); for(const s of [-1,1]) add(cone(0.06,0.14,4),au,s*0.1,0.45,0.04); add(box(0.06,0.06,0.4),au,0.16,-0.25,-0.2); }
  else if(k===3){ add(cyl(0.3,0.16,0.4,16),au,0,0.15,0); add(cyl(0.05,0.05,0.25,8),au,0,-0.15,0); add(cyl(0.2,0.2,0.05,14),au,0,-0.28,0); for(const s of [-1,1]){ const h=add(box(0.08,0.2,0.06),au,s*0.34,0.18,0); } }
  else { add(sph(0.26),emat('#4fa8ff','#0a2a7a'),0,0,0).scale.set(1,0.7,1.3); add(box(0.06,0.05,0.5),lam('#1d1846'),0,0.17,0); for(const s of [-1,1]) for(const z of [-0.15,0,0.15]){ const l=add(box(0.2,0.04,0.04),lam('#1d1846'),s*0.3,-0.1,z); l.rotation.z=s*0.4; } }
  return g;
}
GAMES.temple={
  hint:'ZQSD / WASD : marcher · Espace : sauter · E : lance-pierre · Glisser : tourner la caméra · pousse les blocs en marchant dedans',
  hudHTML:'<div class="pill" id="tpH"></div><div class="pill">🗿 <b id="tpR">0/5</b></div><div class="pill">💎 <b id="tpG">0</b></div><div class="pill">⏱ <b id="tpT">0:00</b></div>',
  far:160, bloom:0.6, bloomTh:0.7, autoJump:false,
  solid:GAMES.royale.solid, gridAdd:GAMES.royale.gridAdd, gridRemove:GAMES.royale.gridRemove, query:GAMES.royale.query,
  start(){
    this.frozen=true; this.ready=false; this.fp=true; this.grid=new Map(); this.qs=0; this.ground={x0:-1e4,x1:1e4,y0:-300,y1:-299,z0:-1e4,z1:1e4};
    setupScene(this.scene,'#0b1a14','#1d3a2a',18,90); cam.yaw=0; cam.pitch=0.32; cam.dist=7;
    heroPick(this,'temple',()=>this.build());
  },
  build(){
    const sc=this.scene, H=7;
    addSky(this,{top:'#040812',mid:'#0f2a24',bot:'#1d3a2a',stars:300,moon:{u:0.6,el:35,r:9},near:24,far:110});
    setLights(this,{hemi:['#9fd8c0','#1a1410',0.42],sun:['#c8e8ff',0.45],dir:[8,30,14]});
    const B=(x0,y0,z0,x1,y1,z1,m,pr)=>this.solid(Math.min(x0,x1),Math.min(y0,y1),Math.min(z0,z1),Math.max(x0,x1),Math.max(y0,y1),Math.max(z0,z1),m,pr);
    const TM=(k,c,w,h)=>texMat(k,c,Math.max(1,Math.round(w/2)),Math.max(1,Math.round(h/2)));
    const floor=(x0,z0,x1,z1,c)=>B(x0,-1,z0,x1,0,z1,TM('stone',c||'#bfb49a',Math.abs(x1-x0),Math.abs(z1-z0)));
    const wallX=(x,z0,z1,h)=>B(x-0.3,0,z0,x+0.3,h||H,z1,TM('stone','#a89c80',Math.abs(z1-z0),h||H));
    const wallZ=(z,x0,x1,door,h)=>{ h=h||H; if(!door) return B(x0,0,z-0.3,x1,h,z+0.3,TM('stone','#a89c80',x1-x0,h));
      B(x0,0,z-0.3,-2,h,z+0.3,TM('stone','#a89c80',-2-x0,h)); B(2,0,z-0.3,x1,h,z+0.3,TM('stone','#a89c80',x1-2,h)); B(-2,4.5,z-0.3,2,h,z+0.3,TM('stone','#968a70',4,h-4.5)); };
    this.torches=[]; this.relics=[]; this.gems=[]; this.foes=[]; this.peb=[]; this.darts=[]; this.gates={};
    const torch=(x,y,z,face)=>{ const g=new THREE.Group(); g.position.set(x,y,z); sc.add(g); const br=mk(box(0.18,0.5,0.18),lam('#4a3a2a')); g.add(br);
      const fl=mk(cone(0.16,0.42,8),matC('tpfl',()=>new THREE.MeshBasicMaterial({color:'#ffb02e'})),false); fl.position.y=0.45; g.add(fl);
      const core=mk(sph(0.1),matC('tpfc',()=>new THREE.MeshBasicMaterial({color:'#fff3b0'})),false); core.position.y=0.38; g.add(core); this.torches.push({x,y:y+0.5,z,fl}); };
    const gem=(x,y,z)=>this.gems.push({x,y,z,on:true});
    const relic=(k,x,y,z)=>{ const m=tpRelicMesh(k); m.position.set(x,y,z); sc.add(m); const halo=mk(sph(0.5),matC('tphalo',()=>{ const q=new THREE.MeshBasicMaterial({color:'#fff2a0',transparent:true,opacity:0.18,depthWrite:false}); return q; }),false); halo.position.set(x,y,z); sc.add(halo); this.relics.push({k,x,y,z,m,halo,got:false}); };
    const gate=(id,z,x0,x1)=>{ const m=texMat('stone','#7a6a50',2,2); const b=B(x0,0,z-0.25,x1,4.5,z+0.25,m,{gate:id}); this.gates[id]={b,open:0,y:0}; };
    const ray=(x,z,r,h)=>{ const g=new THREE.CylinderGeometry(r*0.6,r,h,16,1,true); g.userData.own=true; const m=new THREE.MeshBasicMaterial({color:'#fff3c8',transparent:true,opacity:0.1,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}); m.userData.own=true; const o=new THREE.Mesh(g,m); o.position.set(x,h/2,z); sc.add(o); };
    // dehors : clairière de jungle et façade du temple
    floor(-30,0,30,30,'#5a8a4a'); const tr=new THREE.InstancedMesh(box(0.8,1,0.8),lam('#6a4a2a'),18), cn=new THREE.InstancedMesh(sph(1),lam('#2f7d44'),18), mtx=new THREE.Matrix4(), v=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3();
    for(let i=0;i<18;i++){ const sd=i%2?1:-1, x=sd*(9+(i*7)%16), z=4+(i*5)%24, h=6+(i%4)*2; mtx.compose(v.set(x,h/2,z),q,s.set(1,h,1)); tr.setMatrixAt(i,mtx); mtx.compose(v.set(x,h+1.2,z),q,s.set(3.4,2.4,3.4)); cn.setMatrixAt(i,mtx); B(x-0.4,0,z-0.4,x+0.4,h,z+0.4,null,{}); }
    [tr,cn].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.castShadow=true; sc.add(m); });
    wallZ(0,-14,14,true,10); B(-14,10,-0.6,14,11.2,0.6,TM('stone','#8a7e62',28,2)); for(const sx of [-6,6]){ B(sx-1,0,0.3,sx+1,9,1.6,TM('stone','#b0a486',2,9)); } torch(-3,3,0.7); torch(3,3,0.7);
    { const fr=textSprite(512,128,4); setSprite(fr,'TEMPLE D\'ÉMERAUDE','rgba(20,30,20,.85)','#9be7a0'); fr.position.set(0,8.6,0.8); sc.add(fr); }
    // salle 1 : grand hall (relique 1)
    floor(-10,-20,10,0); wallX(-10,-20,0); wallX(10,-20,0); wallZ(-20,-10,10,true);
    for(const x of [-6,6]) for(const z of [-5,-15]){ B(x-0.6,0,z-0.6,x+0.6,H,z+0.6,TM('stone','#b8ac8e',1,H)); torch(x+(x<0?0.7:-0.7),3,z); }
    B(-0.6,0,-10.6,0.6,1,-9.4,texC('stone','#d8ccb0')); relic(0,0,1.7,-10); ray(0,-10,2.2,7);
    for(let i=0;i<8;i++){ const a=i/8*TAU; gem(Math.cos(a)*4,0.8,-10+Math.sin(a)*4); }
    // salle 2 : blocs à pousser sur les dalles (relique 2 en haut du mur de lianes)
    floor(-10,-40,10,-20); wallX(-10,-40,-20); wallX(10,-40,-20); wallZ(-40,-10,10,true); gate('g2',-40,-2,2);
    this.blocks=[]; this.plates=[];
    const blkM=matC('tpblk',()=>new THREE.MeshLambertMaterial({map:(()=>{ const c=makeCanvas(64,64), g=c.getContext('2d'); g.fillStyle='#9a8c6c'; g.fillRect(0,0,64,64); g.strokeStyle='#5a4a34'; g.lineWidth=4; g.strokeRect(4,4,56,56); g.beginPath(); g.arc(32,32,14,0,TAU); g.stroke(); g.beginPath(); g.moveTo(32,8); g.lineTo(32,56); g.moveTo(8,32); g.lineTo(56,32); g.stroke(); return new THREE.CanvasTexture(c); })()}));
    for(const [x,z] of [[-6,-26],[0,-28],[6,-26]]){ const m=mk(box(1.8,1.8,1.8),blkM); m.position.set(x,0.9,z); sc.add(m); const b=B(x-0.9,0,z-0.9,x+0.9,1.8,z+0.9,null,{blk:1}); this.blocks.push({x,z,x0:x,z0:z,m,b,tx:x,tz:z,mv:0,push:0}); }
    { const m=mk(box(1.6,0.08,1.6),lam('#c8a060'),false); m.position.set(-8.4,0.04,-22.4); sc.add(m); const sg=textSprite(128,128,1); setSprite(sg,'↺','rgba(40,30,20,.85)','#ffd23f'); sg.position.set(-8.4,1.4,-22.4); sc.add(sg); this.resetPad={x:-8.4,z:-22.4,armed:true}; }
    for(const x of [-6,0,6]){ const pm=new THREE.MeshLambertMaterial({color:'#5a7a9a',emissive:'#000000'}); pm.userData.own=true; const m=mk(box(1.9,0.08,1.9),pm,false); m.position.set(x,0.04,-34); sc.add(m); this.plates.push({x,z:-34,m,on:false}); }
    { const vm=texMat('leaves','#5fbf5a',1,2), b=B(8.4,0,-30,10,4,-24,vm,{vine:1}); this.vine=b; relic(1,9.2,4.8,-27); for(let i=0;i<5;i++) gem(9.2,1+i*0.7,-23.4); }
    torch(-9.5,3,-30); torch(9.5,3,-35);
    // salle 3 : couloir des pièges (pics et fléchettes à ventouse)
    floor(-4,-60,4,-40); wallX(-4,-60,-40); wallX(4,-60,-40); wallZ(-60,-10,10,true);
    this.spk=[]; for(let r=0;r<6;r++) for(let c=0;c<4;c++) this.spk.push({x:-3+c*2,z:-44-r*2,r});
    this.spkIM=new THREE.InstancedMesh(cone(0.22,0.8,6),lam('#c8ccd8'),this.spk.length*4); this.spkIM.castShadow=true; sc.add(this.spkIM);
    for(const t of this.spk){ const m=mk(box(1.9,0.06,1.9),lam('#6a5a48'),false); m.position.set(t.x,0.03,t.z); sc.add(m); }
    this.shooters=[{x:-3.7,z:-47,d:1,t:0},{x:3.7,z:-50.5,d:-1,t:0.8},{x:-3.7,z:-54,d:1,t:1.6}];
    for(const sh of this.shooters){ const m=mk(box(0.3,0.5,0.5),lam('#4a3a2a')); m.position.set(sh.x,1.1,sh.z); sc.add(m); const f=mk(box(0.32,0.3,0.3),lam('#c8302a'),false); f.position.set(sh.x,1.45,sh.z); sc.add(f); }
    relic(2,3,1.4,-58.6); torch(-3.5,3,-42); torch(3.5,3,-57);
    // salle 4 : leviers à tirer dans l'ordre de la fresque (relique 4 apparaît)
    floor(-10,-80,10,-60); wallX(-10,-80,-60); wallX(10,-80,-60); wallZ(-80,-10,10,true); gate('g4',-80,-2,2);
    const ord=[0,1,2].sort(()=>Math.random()-0.5); this.order=ord; this.seq=[];
    { const c=makeCanvas(512,160), g=c.getContext('2d'); g.fillStyle='#6a5a40'; g.fillRect(0,0,512,160); g.strokeStyle='#ffd23f'; g.lineWidth=8; g.strokeRect(8,8,496,144); g.font='88px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      ord.forEach((k,i)=>{ g.fillStyle='#2b1d14'; g.beginPath(); g.arc(100+i*156,80,58,0,TAU); g.fill(); g.fillText(TP_SYM[k],100+i*156,84); if(i<2){ g.fillStyle='#ffd23f'; g.fillText('→',178+i*156,84); } });
      const t=new THREE.CanvasTexture(c); t.isOwn=true; const m=new THREE.MeshBasicMaterial({map:t}); m.userData.own=true; const pg=new THREE.PlaneGeometry(8,2.5); pg.userData.own=true; const p=new THREE.Mesh(pg,m); p.position.set(0,5.6,-79.65); sc.add(p); }
    this.levers=[];
    [[-6,-68],[0,-66],[6,-68]].forEach(([x,z],k)=>{ const g=new THREE.Group(); g.position.set(x,0,z); sc.add(g); const base=mk(box(1,0.6,1),texC('stone','#8a7e62')); base.position.y=0.3; g.add(base);
      const pv=new THREE.Group(); pv.position.y=0.6; g.add(pv); const h=mk(box(0.14,1.2,0.14),lam('#7a4b23')); h.position.y=0.6; pv.add(h); const kn=mk(sph(0.16),lam('#d9a832')); kn.position.y=1.2; pv.add(kn); pv.rotation.x=0.6;
      const sg=textSprite(128,128,1.1); setSprite(sg,TP_SYM[k],'rgba(40,30,20,.85)','#ffffff'); sg.position.set(0,2.4,0); g.add(sg); B(x-0.5,0,z-0.5,x+0.5,0.6,z+0.5,null,{});
      this.levers.push({x,z,k,pv,on:false}); });
    this.relic4=null; torch(-9.5,3,-64); torch(9.5,3,-64); torch(-9.5,3,-76); torch(9.5,3,-76);
    for(const [x,z] of [[-5,-73],[0,-75],[5,-73]]) this.foes.push({k:'bat',x,y:3,z,x0:x,z0:z,t:rand(0,6)});
    // salle 5 : gouffre de lave (pierres, dalles qui s'effondrent, plateforme mobile ; relique 5 sur un pilier)
    floor(-10,-84,10,-80); floor(-10,-104,10,-100); wallX(-10,-104,-80); wallX(10,-104,-80); wallZ(-104,-10,10,true);
    { const lm=new THREE.MeshBasicMaterial({color:'#ff6a1a'}); lm.userData.own=true; const lg=new THREE.PlaneGeometry(20,16); lg.userData.own=true; const lava=new THREE.Mesh(lg,lm); lava.rotation.x=-Math.PI/2; lava.position.set(0,-4,-92); sc.add(lava); this.lava=lava;
      const pl=new THREE.PointLight('#ff6a1a',1.4,20,1.5); pl.position.set(0,-1,-92); sc.add(pl); }
    B(-1,-4,-87.5,1,0,-85.5,texC('stone','#8a7e62'));
    this.falls=[]; for(const [x,z] of [[0,-89.5],[-2,-96.5],[2,-96.5]]){ const m=mk(box(2,0.6,2),texC('stone','#c8a878')); m.position.set(x,-0.3,z); sc.add(m); const b=B(x-1,-0.6,z-1,x+1,0,z+1,null,{fall:1}); this.falls.push({x,z,m,b,t:-1,down:0}); }
    { const m=mk(box(3,0.6,3),texC('stone','#b8a070')); sc.add(m); const b=B(-1.5,-0.6,-94.5,1.5,0,-91.5,null,{mover:1}); this.mover={m,b,x:0,dx:0}; m.position.set(0,-0.3,-93); }
    B(6,-4,-94,8,0,-92,texC('stone','#8a7e62')); relic(4,7,0.9,-93);
    for(const [x,z] of [[-5,-102],[5,-102]]) this.foes.push({k:'spider',x,y:0,z,x0:x,z0:z,t:rand(0,6)});
    torch(-9.5,2.5,-82); torch(9.5,2.5,-82); torch(-9.5,2.5,-102); torch(9.5,2.5,-102);
    // salle 6 : couloir du rocher (haies basses, trou à sauter)
    floor(-4,-143.5,4,-104); floor(-4,-152,4,-146); wallX(-4,-152,-104); wallX(4,-152,-104);
    for(const z of [-116,-126,-136]) B(-4,0,z-0.4,4,0.9,z+0.4,texC('stone','#9a8a6a'));
    for(let z=-110;z>-142;z-=4) gem(0,0.8,z);
    torch(-3.6,3,-112); torch(3.6,3,-124); torch(-3.6,3,-136); torch(3.6,3,-148);
    { const bm=texMat('stone','#9a8e72',3,3); this.boulder={m:mk(new THREE.SphereGeometry(2.9,20,14),bm),z:-101,y:3,on:false,done:false}; this.boulder.m.geometry.userData.own=true; this.boulder.m.position.set(0,-20,-101); sc.add(this.boulder.m); }
    // salle 7 : le trésor (idole d'émeraude)
    floor(-8,-172,8,-152); wallX(-8,-172,-152); wallX(8,-172,-152); wallZ(-172,-8,8,false); B(-8,0,-152.3,-2,H,-151.7,TM('stone','#a89c80',6,H)); B(2,0,-152.3,8,H,-151.7,TM('stone','#a89c80',6,H));
    B(-1.6,0,-167.6,1.6,1.2,-164.4,texC('stone','#e0d4b0'));
    { const g=new THREE.Group(); g.position.set(0,1.2,-166); sc.add(g); const base=mk(cyl(0.6,0.8,0.4,8),emat('#ffd23f','#6a4a00')); base.position.y=0.2; g.add(base);
      const em=mk(oct(0.9),new THREE.MeshLambertMaterial({color:'#3aff9a',emissive:'#1ab86a',emissiveIntensity:1.1})); em.material.userData.own=true; em.scale.set(0.8,1.4,0.8); em.position.y=1.5; g.add(em); this.idol=em; this.idolG=g; }
    ray(0,-166,3,7); for(const x of [-6,6]) for(const z of [-156,-168]){ B(x-0.5,0,z-0.5,x+0.5,H,z+0.5,emat('#d9a832','#5a3a00')); torch(x+(x<0?0.6:-0.6),3,z); }
    for(let i=0;i<10;i++){ const a=i/10*TAU; gem(Math.cos(a)*3.4,0.8,-162+Math.sin(a)*3); }
    this.goal={x:0,z:-166};
    // gemmes (instanciées), ennemis, lumières mobiles
    this.gemIM=new THREE.InstancedMesh(oct(0.24),matC('tpgem',()=>new THREE.MeshLambertMaterial({color:'#3ad17a',emissive:'#0a7a3a',emissiveIntensity:0.8})),this.gems.length); sc.add(this.gemIM);
    for(const f of this.foes){ const g=new THREE.Group(); if(f.k==='bat'){ const b=mk(sph(0.3),lam('#3a2a4a')); g.add(b); for(const q of [-1,1]){ const w=mk(box(0.6,0.05,0.34),lam('#2a1a3a')); w.position.x=q*0.42; w.userData.wing=q; g.add(w); const e=mk(sph(0.06),emat('#ff4f4f','#a00000')); e.position.set(q*0.1,0.05,0.27); g.add(e); } }
      else { const b=mk(sph(0.4),lam('#2b2d42')); b.scale.set(1,0.6,1.2); b.position.y=0.35; g.add(b); for(const q of [-1,1]) for(let i=0;i<4;i++){ const l=mk(box(0.7,0.06,0.06),lam('#1d1846')); l.position.set(q*0.45,0.3,-0.3+i*0.2); l.rotation.z=q*0.5; g.add(l); } for(const q of [-1,1]){ const e=mk(sph(0.07),emat('#ffd23f','#7a5a00')); e.position.set(q*0.12,0.45,0.42); g.add(e); } }
      f.g=g; sc.add(g); }
    this.pl=[0,1,2].map(()=>{ const l=new THREE.PointLight('#ffa040',1.5,13,1.6); sc.add(l); return l; });
    addAmb(this,{kind:'dust',color:'#ffe8b0',size:0.12,n:110,glow:true,rel:true});
    // départ
    const pk=this.pk||{}; this.jumpV=11*(pk.jump||1); this.maxH=3+(pk.hp||0); this.hearts=this.maxH; this.got=0; this.gemN=0; this.inv=0; this.won=false; this.t0=this.time;
    this.cp={x:0,z:10}; P.x=0; P.y=0.05; P.z=12; P.vx=P.vy=P.vz=0; P.yaw=Math.PI; cam.yaw=0; snapCam(); this.ready=true; this.fp=false; this.frozen=false; this.room=0; this.lt=0;
    $('bAct').textContent='🎯'; $('hud').classList.toggle('radar',!!pk.radar); this.updGems();
    banner('🧭 Entre dans le temple et trouve l\'idole d\'émeraude !'); bgmPlay('temple');
  },
  onAction(){ this.shoot(); },
  shoot(){ if(!this.ready||this.won||(this.shootCd||0)>this.time) return; this.shootCd=this.time+0.45;
    let tg=null, bd=14; for(const f of this.foes) if(!f.dead){ const d=Math.hypot(f.x-P.x,f.z-P.z); if(d<bd){ bd=d; tg=f; } }
    const ox=P.x, oy=P.y+1.3, oz=P.z; let dx, dy, dz; if(tg){ dx=tg.x-ox; dy=tg.y+0.3-oy; dz=tg.z-oz; } else { dx=-Math.sin(cam.yaw); dy=0; dz=-Math.cos(cam.yaw); }
    const l=Math.hypot(dx,dy,dz)||1; if(tg) P.yaw=Math.atan2(dx,dz); PA.swing=0.28;
    const m=mk(sph(0.09),lam('#8a7e62'),false); m.position.set(ox,oy,oz); this.scene.add(m); this.peb.push({x:ox,y:oy,z:oz,vx:dx/l*22,vy:dy/l*22,vz:dz/l*22,t:0,m}); sfx('swing'); },
  hurt(){ if(this.inv>0||this.won) return; this.hearts--; this.inv=1.3; P.inv=1.3; sfx('hurt'); flashHurt(); if(this.hearts<=0) this.respawn(true); },
  respawn(full){ if(full){ this.hearts=this.maxH; banner('💪 On reprend à l\'entrée de la salle'); } P.x=this.cp.x; P.y=0.05; P.z=this.cp.z; P.vx=P.vy=P.vz=0; this.inv=1.5; P.inv=1.5; snapCam();
    if(this.boulder.on&&!this.boulder.done){ this.boulder.on=false; this.boulder.m.position.y=-20; } },
  wdir(){ const sn=Math.sin(cam.yaw), cs=Math.cos(cam.yaw); let ix=inp.x, iy=inp.y; const l=Math.hypot(ix,iy); if(l<0.3) return null; ix/=Math.max(1,l); iy/=Math.max(1,l); return [-sn*iy+cs*ix,-cs*iy-sn*ix]; },
  update(dt){
    if(!this.ready) return;
    const t=this.time, sc=this.scene; this.inv=Math.max(0,this.inv-dt);
    if(this.won){ this.idolG.rotation.y+=dt*2; this.idolG.position.y=1.2+Math.min(1.5,(t-this.wonT)*0.8); if(Math.random()<0.15) confetti(sc,rand(-5,5),rand(2,5),-166+rand(-4,4)); return; }
    // salles et points de reprise
    const rooms=[[0,10],[-2,-2],[-22,-22],[-42,-42],[-62,-62],[-81.5,-81.5],[-105.5,-105.5],[-154,-154]];
    for(let i=rooms.length-1;i>0;i--) if(P.z<rooms[i][0]&&P.y>-0.5){ if(this.room<i){ this.room=i; this.cp={x:0,z:rooms[i][1]}; if(i>1) sfx('cp'); } break; }
    // torches : 3 lumières qui suivent les torches les plus proches
    this.lt-=dt; if(this.lt<=0){ this.lt=0.3; const near=this.torches.map(o=>[o,Math.hypot(o.x-P.x,o.z-P.z)]).sort((a,b)=>a[1]-b[1]).slice(0,3); near.forEach(([o],i)=>this.pl[i].position.set(o.x,o.y+0.3,o.z)); }
    for(const o of this.torches) o.fl.scale.set(1,0.85+Math.sin(t*17+o.x*3+o.z)*0.18,1); this.pl.forEach((l,i)=>l.intensity=1.4+Math.sin(t*13+i*2)*0.15);
    // lianes : on grimpe en poussant contre le mur
    const wd=this.wdir();
    if(wd&&this.vine&&touching(this.vine)&&P.y<this.vine.y1){ const cx=clamp(P.x,this.vine.x0,this.vine.x1)-P.x, cz=clamp(P.z,this.vine.z0,this.vine.z1)-P.z, cl=Math.hypot(cx,cz)||1; if((wd[0]*cx+wd[1]*cz)/cl>0.4){ P.vy=Math.max(P.vy,5.2); P.onGround=false; if(Math.random()<0.1) sfx('step'in SFX?'step':'click'); } }
    // blocs à pousser
    for(const bk of this.blocks){
      if(bk.mv>0){ bk.mv=Math.max(0,bk.mv-dt*3.4); const f=1-bk.mv; bk.m.position.set(lerp(bk.x,bk.tx,f),0.9,lerp(bk.z,bk.tz,f)); if(bk.mv===0){ bk.x=bk.tx; bk.z=bk.tz; } continue; }
      if(!wd||!touching(bk.b)||P.y>0.5){ bk.push=0; continue; }
      const dx=bk.x-P.x, dz=bk.z-P.z; let ax=0, az=0; if(Math.abs(dx)>Math.abs(dz)) ax=Math.sign(dx); else az=Math.sign(dz);
      if(wd[0]*ax+wd[1]*az<0.7){ bk.push=0; continue; }
      bk.push+=dt; if(bk.push<0.22) continue; bk.push=0;
      const nx=bk.x+ax*2, nz=bk.z+az*2;
      const blocked=nx<-8.9||nx>8.9||nz>-21||nz<-38.9||this.query(nx-0.85,nx+0.85,0.1,1.7,nz-0.85,nz+0.85).some(b=>b!==this.ground&&b!==bk.b&&!b.gnd&&b.y1>0.05);
      if(blocked){ sfx('nope'); continue; }
      this.gridRemove(bk.b); Object.assign(bk.b,{x0:nx-0.9,x1:nx+0.9,z0:nz-0.9,z1:nz+0.9}); this.gridAdd(bk.b); bk.tx=nx; bk.tz=nz; bk.mv=1; tone(90,60,0.25,'sawtooth',0.05); }
    const rp=this.resetPad, dr=Math.hypot(P.x-rp.x,P.z-rp.z); if(dr>1.6) rp.armed=true;
    if(rp.armed&&dr<0.9&&!this.gates.g2.open&&this.blocks.some(b=>b.tx!==b.x0||b.tz!==b.z0)){ rp.armed=false; for(const bk of this.blocks){ this.gridRemove(bk.b); Object.assign(bk.b,{x0:bk.x0-0.9,x1:bk.x0+0.9,z0:bk.z0-0.9,z1:bk.z0+0.9}); this.gridAdd(bk.b); bk.x=bk.tx=bk.x0; bk.z=bk.tz=bk.z0; bk.mv=0; bk.m.position.set(bk.x0,0.9,bk.z0); } sfx('cp'); banner('↺ Les blocs reviennent à leur place'); }
    let pOn=0; for(const p of this.plates){ const on=this.blocks.some(b=>Math.abs(b.tx-p.x)<0.5&&Math.abs(b.tz-p.z)<0.5); if(on!==p.on){ p.on=on; p.m.material.emissive.set(on?'#3a9aff':'#000000'); if(on) sfx('cp'); } if(on) pOn++; }
    if(pOn===3&&!this.gates.g2.open){ this.openGate('g2'); banner('🚪 Les trois dalles sont pressées : la porte s\'ouvre !'); }
    // portes qui descendent
    for(const id in this.gates){ const gt=this.gates[id]; if(gt.open&&gt.y>-4.6){ gt.y=Math.max(-4.6,gt.y-dt*2.2); gt.b.m.position.y=2.25+gt.y; } }
    // couloir des pièges
    const mtx=new THREE.Matrix4(), v=new THREE.Vector3(), q=new THREE.Quaternion(), s1=new THREE.Vector3(1,1,1);
    this.spk.forEach((sp,n)=>{ const ph=(t*0.55+(sp.r%2)*0.5)%1, up=ph<0.5, h=up?Math.min(1,ph/0.06):Math.max(0,1-(ph-0.5)/0.06); sp.up=h>0.5;
      for(let k=0;k<4;k++){ mtx.compose(v.set(sp.x+(k%2?0.45:-0.45),-0.4+h*0.8,sp.z+(k<2?0.45:-0.45)),q,s1); this.spkIM.setMatrixAt(n*4+k,mtx); }
      if(sp.up&&Math.abs(P.x-sp.x)<1.2&&Math.abs(P.z-sp.z)<1.2&&P.y<0.6) this.hurt(); });
    this.spkIM.instanceMatrix.needsUpdate=true;
    for(const sh of this.shooters){ sh.t-=dt; if(sh.t<=0&&Math.abs(P.z-sh.z)<14){ sh.t=2.4; const m=mk(box(0.5,0.08,0.08),lam('#c8302a'),false); m.position.set(sh.x,1.0,sh.z); sc.add(m); this.darts.push({x:sh.x,z:sh.z,d:sh.d,m}); } }
    for(let i=this.darts.length-1;i>=0;i--){ const d=this.darts[i]; d.x+=d.d*9*dt; d.m.position.x=d.x; if(Math.abs(d.x-P.x)<0.45&&Math.abs(d.z-P.z)<0.45&&P.y<1.1&&P.y+1.7>0.9){ this.hurt(); d.x=99; }
      if(Math.abs(d.x)>4){ sc.remove(d.m); this.darts.splice(i,1); } }
    // leviers
    if(this.lvReset>0){ this.lvReset-=dt; if(this.lvReset<=0) this.levers.forEach(l=>l.on=false); }
    for(const lv of this.levers){ lv.pv.rotation.x=lerp(lv.pv.rotation.x,lv.on?-0.6:0.6,damp(10,dt));
      const dl=Math.hypot(P.x-lv.x,P.z-lv.z); if(dl>1.9) lv.armed=true;
      if(!lv.on&&lv.armed!==false&&!(this.lvReset>0)&&!this.gates.g4.open&&dl<1.3){ lv.on=true; lv.armed=false; this.seq.push(lv.k); sfx('click');
        const okSoFar=this.seq.every((k,i)=>k===this.order[i]);
        if(!okSoFar){ banner('❌ Mauvais ordre : regarde la fresque au-dessus de la porte !'); sfx('nope'); this.seq=[]; this.lvReset=0.6; }
        else if(this.seq.length===3){ this.openGate('g4'); banner('🚪 Bon ordre ! La porte s\'ouvre…'); relicAppear.call(this); } } }
    function relicAppear(){ if(this.relic4) return; this.relic4=true; const k=3; const m=tpRelicMesh(k); m.position.set(0,1.5,-72); this.scene.add(m); const halo=mk(sph(0.5),matC('tphalo',()=>new THREE.MeshBasicMaterial({color:'#fff2a0',transparent:true,opacity:0.18,depthWrite:false})),false); halo.position.set(0,1.5,-72); this.scene.add(halo);
      this.relics.push({k,x:0,y:1.5,z:-72,m,halo,got:false}); confetti(this.scene,0,2,-72); }
    // gouffre de lave
    const mv=this.mover, nx=Math.sin(t*0.9)*5; mv.dx=nx-mv.x; mv.x=nx; mv.m.position.x=nx; this.gridRemove(mv.b); mv.b.x0=nx-1.5; mv.b.x1=nx+1.5; this.gridAdd(mv.b);
    if(P.ground===mv.b) P.x+=mv.dx;
    for(const f of this.falls){ if(f.t<0&&P.ground===f.b){ f.t=0.7; sfx('click'); }
      if(f.t>0){ f.t-=dt; f.m.position.x=f.x+Math.sin(t*60)*0.05; if(f.t<=0){ f.down=3; this.gridRemove(f.b); } }
      if(f.down>0){ f.down-=dt; f.m.position.y=-0.3-(3-f.down)*4; if(f.down<=0){ f.m.position.set(f.x,-0.3,f.z); this.gridAdd(f.b); f.t=-1; } } }
    if(this.lava) this.lava.material.color.setHSL(0.05,1,0.5+Math.sin(t*2)*0.05);
    if(P.y<-2.5){ burst(sc,P.x,-3.5,P.z,'#ff8a2a',14,5,true); this.hearts--; sfx('hurt'); if(this.hearts<=0) this.respawn(true); else this.respawn(false); }
    // rocher qui roule
    const bo=this.boulder;
    if(!bo.on&&!bo.done&&P.z<-108&&P.z>-140){ bo.on=true; bo.z=-101; bo.y=2.9; banner('😱 Un rocher ! COURS !'); sfx('boom'); cam.pitch=0.75; cam.dist=10; }
    if(bo.on){ if(bo.z>-145.2) bo.z-=5.3*dt; else { bo.z=-145.2; bo.y-=12*dt; } bo.m.position.set(0,bo.y,bo.z); bo.m.rotation.x-=5.3*dt/2.9;
      if(bo.y>0&&Math.abs(P.x)<4&&bo.z-2.6<P.z&&bo.z+2.6>P.z&&P.y<bo.y+2.9){ this.hearts--; sfx('hurt'); flashHurt(); if(this.hearts<=0) this.hearts=this.maxH; this.respawn(false); cam.pitch=0.32; cam.dist=7; }
      if(bo.y<-6){ bo.on=false; bo.done=true; sfx('boom'); cam.pitch=0.32; cam.dist=7; banner('😮‍💨 Ouf ! Le rocher est tombé dans le trou.'); } }
    if(P.z<-153&&!this.closed7){ this.closed7=true; this.solid(-2,0,-152.3,2,4.5,-151.7,texMat('stone','#7a6a50',2,2)); }
    // ennemis
    for(const f of this.foes){ if(f.dead){ f.g.scale.multiplyScalar(0.9); if(f.g.scale.x<0.05&&f.g.parent) sc.remove(f.g); continue; }
      const d=Math.hypot(P.x-f.x,P.z-f.z); f.t+=dt;
      if(f.k==='bat'){ if(d<9){ f.x=lerp(f.x,P.x,dt*0.9); f.z=lerp(f.z,P.z,dt*0.9); f.y=lerp(f.y,P.y+1.4+Math.sin(f.t*3)*0.6,dt*2); } else { f.x=f.x0+Math.sin(f.t)*2; f.z=f.z0+Math.cos(f.t)*1.5; f.y=3+Math.sin(f.t*2)*0.4; }
        f.g.children.forEach(c=>{ if(c.userData.wing) c.rotation.z=Math.sin(f.t*28)*0.7*c.userData.wing; }); }
      else { if(d<8&&d>0.8){ f.x+=(P.x-f.x)/d*2.2*dt; f.z+=(P.z-f.z)/d*2.2*dt; } f.g.rotation.y=Math.atan2(P.x-f.x,P.z-f.z); }
      f.g.position.set(f.x,f.y,f.z);
      if(d<0.9&&Math.abs(P.y+0.9-f.y-0.3)<1.2) this.hurt(); }
    // cailloux du lance-pierre
    for(let i=this.peb.length-1;i>=0;i--){ const p=this.peb[i]; p.t+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; p.m.position.set(p.x,p.y,p.z); let hit=p.t>0.9;
      for(const f of this.foes) if(!f.dead&&Math.hypot(f.x-p.x,f.y+0.3-p.y,f.z-p.z)<0.8){ f.dead=1; hit=true; burst(sc,f.x,f.y+0.3,f.z,'#b06bff',10,4); sfx('squish'); addCoins(1); }
      if(hit){ sc.remove(p.m); this.peb.splice(i,1); } }
    // reliques et gemmes
    for(const r of this.relics){ if(r.got) continue; r.m.rotation.y+=dt*1.5; r.m.position.y=r.y+Math.sin(t*2+r.k)*0.1; r.halo.scale.setScalar(1+Math.sin(t*3)*0.1);
      if(Math.hypot(r.x-P.x,r.z-P.z)<1.3&&r.y>P.y-0.5&&r.y<P.y+2.6){ r.got=true; sc.remove(r.m); sc.remove(r.halo); this.got++; sfx('gem'); confetti(sc,r.x,r.y,r.z); banner(TP_RELICS[r.k].ic+' '+TP_RELICS[r.k].n+' ! ('+this.got+'/5)'); addCoins(5); } }
    for(const g of this.gems) if(g.on&&Math.hypot(g.x-P.x,g.z-P.z)<0.9&&g.y>P.y-0.4&&g.y<P.y+2.2){ g.on=false; this.gemN++; addCoins(1); sfx('coin'); }
    this.updGems();
    // radar de la Pr Pistache
    if(this.pk&&this.pk.radar){ let best=null, bd=1e9; for(const r of this.relics) if(!r.got){ const d=Math.hypot(r.x-P.x,r.z-P.z); if(d<bd){ bd=d; best=r; } }
      if(best) pointCompass(best.x,best.z,Math.round(bd)+' m'); else pointCompass(this.goal.x,this.goal.z,'💚'); }
    if(this.idol){ this.idol.rotation.y+=dt; this.idolG.position.y=1.2+Math.sin(t*1.5)*0.08; }
    if(Math.hypot(P.x-this.goal.x,P.z-this.goal.z)<2.2&&P.z<-160) this.win();
  },
  openGate(id){ const g=this.gates[id]; if(g.open) return; g.open=1; this.gridRemove(g.b); sfx('boom'); this.shakeT=0.6; },
  updGems(){ const im=this.gemIM; if(!im) return; const mtx=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), s=new THREE.Vector3(), e=new THREE.Euler();
    this.gems.forEach((g,n)=>{ e.set(0,this.time*2+n,0); q.setFromEuler(e); mtx.compose(v.set(g.x,g.y+Math.sin(this.time*3+n)*0.08,g.z),q,s.set(1,1.4,1).multiplyScalar(g.on?1:0)); im.setMatrixAt(n,mtx); }); im.instanceMatrix.needsUpdate=true; },
  win(){
    this.won=true; this.wonT=this.time; sfx('win'); if(PA) PA.waveT=5; const tm=this.time-this.t0, coins=30+this.got*10;
    addCoins(coins); S.temple.done=(S.temple.done||0)+1; S.temple.relics=Math.max(S.temple.relics||0,this.got); if(!S.temple.best||tm<S.temple.best) S.temple.best=tm; save();
    showResult({icon:'💚',title:'Idole d\'émeraude trouvée !',sub:this.got===5?'Et les 5 reliques en plus : quelle exploratrice, quel explorateur !':'Il reste des reliques cachées dans le temple…',stats:[['Reliques',this.got+' / 5'],['Gemmes',this.gemN],['Temps',fmtTime(tm)],['Pièces gagnées','+'+coins]]});
  },
  hud(){ if(!this.ready) return; setText('tpH','❤️'.repeat(Math.max(0,this.hearts))); setText('tpR',this.got+'/5'); setText('tpG',this.gemN); setText('tpT',fmtTime(this.time-this.t0)); },
  idle(dt){ this.update(dt); },
  stop(){ $('hud').classList.remove('radar'); }
};
SONGS.temple={bpm:96,root:52,scale:[0,1,4,5,7,8,11],lead:'triangle',bass:'sine',prog:[0,1,0,4],mel:[0,null,null,1,4,null,5,null, 4,null,1,null,0,null,null,null, 7,null,5,4,null,1,null,0, 1,null,null,null,0,null,null,null],drum:'k...s..hk..ks...',vol:0.5};
GAME_EXTRA.push({id:'temple',ic:'🗿',t:'Temple d\'Émeraude',d:'Explore un temple perdu : blocs à pousser, leviers, pièges, rocher qui roule et 5 reliques cachées !',bg:'linear-gradient(140deg,#1d6b4a,#d9a832)',
  best:()=>S.temple.done?'💚 trouvée '+S.temple.done+' fois · 🗿 '+(S.temple.relics||0)+'/5':'Nouveau !'});
