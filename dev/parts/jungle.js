/* =========================================================
   22. Course de la Jungle : plateformes 3D en couloir, attaque
       toupie, caisses (baies, rebond, reprise, pétard, luciole,
       fer), ennemis inventés, troncs qui roulent, 3 niveaux
   ========================================================= */
// morceaux de couloir : 7 colonnes, une ligne = 1,5 m, du départ vers l'arrivée.
// # sol  . vide  = bloc haut  w eau  n nénuphar  c caisse  b caisse rebond  k caisse reprise  x caisse pétard  l caisse luciole  i caisse en fer
// o baie  O baie au-dessus du vide  r crabe  p plante  v chauve-souris  h hérisson  L troncs qui roulent  S tronc qui se balance  g pierre-soleil (arrivée)
const JK={
  S:['#######','#######','#######','##o#o##'],
  C:['#######','#c#o#c#','#######','#o#b#o#','#######'],
  R:['#######','#o###o#','###r###','#######','#o#o#o#'],
  P:['#######','..OOO..','..OOO..','#######'],
  P2:['#######','...O...','..###..','..#c#..','..###..','...O...','#######'],
  K:['#######','###k###','#######'],
  X:['#######','#o#x#o#','#######','##c#c##','#######'],
  U:['#######','##===##','#=====#','##=o=##','#######'],
  V:['#######','#o#v#o#','#######','#######','##o#o##'],
  H:['#######','#######','h######','#######','######h','#######'],
  L:['#######','#######','#######','#######','##o#o##','#######','#######','###L###'],
  PL:['#######','#p###p#','#######','##ccc##','#######'],
  W:['#######','wwwnwww','wwnwnww','wwwnwww','wwnwnww','wwwnwww','#######'],
  Br:['#######','...#...','...O...','...#...','...O...','#######'],
  SW:['#######','#######','###S###','#######','#######'],
  G:['#######','#######','###g###','#######','#######'],
  l:['#######','###l###','#######'],
  I:['#######','##i#i##','#o###o#','#######']};
const JLV=[
  {n:'Sentier des Lianes',ic:'🌿',lv:'S C R P K X U V PL l Br C K L R P2 G',bg:'linear-gradient(140deg,#2fbf71,#a8e063)',
   sky:{top:'#4aa8ff',mid:'#a8e0ff',bot:'#e0f8ff',sun:{u:0.4,el:40,r:20},hills:[['#3f9a52',26,0,0.012],['#2f7d44',14,0,0.02]],near:30,far:120},
   lights:{hemi:['#ffffff','#4a7a3a',0.62],sun:['#fff4d8',0.78]},top:'#56c45a',side:'#8a5a33',wall:'#6b5a48',leaf:'#2f9e48',amb:{kind:'petals',color:'#c8ffb0',size:0.18,n:80,rel:true}},
  {n:'Rivière aux Nénuphars',ic:'🪷',lv:'S C W R K W Br X V K L W PL P2 G',bg:'linear-gradient(140deg,#ff9e5e,#4fa8ff)',
   sky:{top:'#5a6ad8',mid:'#ff9e7a',bot:'#ffd9a8',sun:{u:0.5,el:9,r:26,c:'#fff0c0',glow:'rgba(255,170,110,.9)',gl:8},hills:[['#4a6a5a',22,0,0.01]],near:30,far:120},
   lights:{hemi:['#ffe0c8','#5a5a7a',0.6],sun:['#ffc890',0.85]},top:'#7ccf5a',side:'#9a6a3a',wall:'#7a6a58',leaf:'#3a9a58',water:1,amb:{kind:'dust',color:'#ffe8b0',size:0.15,n:60,rel:true}},
  {n:'Temple des Lucioles',ic:'🏮',lv:'S X R P2 K SW V L C K SW Br H l W G',bg:'linear-gradient(140deg,#1d1846,#6d3fd6)',dark:1,
   sky:{top:'#05051a',mid:'#141040',bot:'#2a2060',stars:400,moon:{u:0.3,el:30,r:10},near:22,far:95},
   lights:{hemi:['#8a9aff','#1a1030',0.45],sun:['#b8c8ff',0.5]},top:'#5a7a6a',side:'#4a4058',wall:'#5a5070',leaf:'#2a6a48',lantern:1,amb:{kind:'fireflies',color:'#d8ff8a',size:0.2,n:90,glow:true,rel:true}}];
const JCS=1.5, JW=7;
function jgFoe(k){
  const g=new THREE.Group(), add=(geo,mat,x,y,z,par)=>{ const m=mk(geo,mat); m.position.set(x,y,z); (par||g).add(m); return m; };
  if(k==='r'){ const c=crabMesh(); c.scale.setScalar(1.3); g.add(c); }
  else if(k==='p'){ add(cyl(0.12,0.16,0.9,8),lam('#3a8a3a'),0,0.45,0); const hd=new THREE.Group(); hd.position.y=1.0; g.add(hd);
    add(sph(0.42),lam('#e63946'),0,0,0,hd).scale.set(1,0.8,1); for(let i=0;i<8;i++){ const a=i/8*TAU; const t=add(cone(0.06,0.18,4),lam('#ffffff'),Math.cos(a)*0.32,-0.02,Math.sin(a)*0.32+0.05,hd); t.rotation.x=Math.PI; }
    for(let i=0;i<6;i++){ const a=i/6*TAU; const s=add(sph(0.09),lam('#ffd23f'),Math.cos(a)*0.3,0.22,Math.sin(a)*0.3,hd); }
    for(const q of [-1,1]){ const l=add(box(0.6,0.05,0.25),lam('#4cc157'),q*0.35,0.3,0); l.rotation.z=q*0.4; } g.userData.head=hd; }
  else if(k==='v'){ add(sph(0.3),lam('#5a3a7a'),0,0,0); for(const q of [-1,1]){ const w=add(box(0.6,0.05,0.35),lam('#3a2a5a'),q*0.42,0.05,0); w.userData.wing=q; add(cone(0.07,0.16,4),lam('#5a3a7a'),q*0.15,0.3,0); add(sph(0.06),emat('#ffe066','#a07800'),q*0.1,0.05,0.27); } }
  else { add(sph(0.5),lam('#8a6a5a'),0,0.5,0); for(let i=0;i<14;i++){ const a=i/14*TAU, b=(i%3)*0.6+0.4; const s=add(cone(0.1,0.32,5),lam('#4a3a2a'),Math.cos(a)*0.45*Math.sin(b),0.5+Math.cos(b)*0.45,Math.sin(a)*0.45*Math.sin(b)); s.lookAt(s.position.x*3,s.position.y*3-1,s.position.z*3); s.rotateX(Math.PI/2); } }
  return g;
}
function jgCrate(k){
  const key='jgc'+k, m=matC(key,()=>new THREE.MeshLambertMaterial({map:(()=>{ const c=makeCanvas(64,64), g=c.getContext('2d');
    const base={c:'#c98b4f',b:'#7fc8ff',k:'#3ad17a',x:'#ff4f4f',l:'#ffd23f',i:'#9aa3b0'}[k]; g.fillStyle=base; g.fillRect(0,0,64,64);
    g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=5; g.strokeRect(3,3,58,58); if(k!=='i'){ g.beginPath(); g.moveTo(6,6); g.lineTo(58,58); g.moveTo(58,6); g.lineTo(6,58); g.stroke(); }
    else { g.fillStyle='#6a7380'; for(const [x,y] of [[10,10],[54,10],[10,54],[54,54]]){ g.beginPath(); g.arc(x,y,4,0,TAU); g.fill(); } }
    g.fillStyle='#ffffff'; g.font='bold 30px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    const sym={b:'⇧',k:'✔',x:'✸',l:'✦'}[k]; if(sym){ g.fillStyle='rgba(255,255,255,.92)'; g.beginPath(); g.arc(32,32,15,0,TAU); g.fill(); g.fillStyle=base; g.fillText(sym,32,34); }
    const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; return t; })()}));
  return mk(box(1.1,1.1,1.1),m);
}
GAMES.jungle={
  hint:'ZQSD / WASD ou ← ↑ → ↓ : courir · Espace : sauter (sur les caisses pour les casser) · E : toupie',
  hudHTML:'<div class="pill">🧡 <b id="jgL">5</b></div><div class="pill">🍊 <b id="jgB">0</b></div><div class="pill">📦 <b id="jgC">0/0</b></div><div class="pill" id="jgLu">✨ 0</div>',
  far:220, bloom:0.45, bloomTh:0.84,
  solid:GAMES.royale.solid, gridAdd:GAMES.royale.gridAdd, gridRemove:GAMES.royale.gridRemove, query:GAMES.royale.query,
  start(){
    this.frozen=true; this.ready=false; this.fp=true; this.grid=new Map(); this.qs=0; this.ground={x0:-1e4,x1:1e4,y0:-200,y1:-199,z0:-1e4,z1:1e4};
    setupScene(this.scene,'#4aa8ff','#e0f8ff',30,120); cam.yaw=0; this.li=Math.min(S.jungle.lv||0,2);
    heroPick(this,'jungle',()=>this.pickLevel());
  },
  pickLevel(){
    openChoice({title:'Choisis un niveau',sub:'Casse toutes les caisses d\'un niveau pour gagner sa gemme !',close:false,
      items:JLV.map((L,i)=>({ic:L.ic,t:L.n,d:i>(S.jungle.lv||0)?'Termine le niveau '+i+' pour l\'ouvrir':(S.jungle.gem[i]?'💎 gemme gagnée':'💎 pas encore')+(S.jungle.best[i]?' · '+fmtTime(S.jungle.best[i]):''),lock:i>(S.jungle.lv||0),on:i===this.li,cb:()=>this.build(i)}))});
  },
  build(li){
    const L=JLV[li], sc=this.scene; this.li=li; this.L=L; addSky(this,L.sky); setLights(this,Object.assign({dir:[-14,26,18]},L.lights));
    if(L.dark){ this.bloom=0.7; this.bloomTh=0.66; }
    const rows=[]; for(const id of L.lv.split(' ')) for(const r of JK[id]) rows.push(r);
    this.rows=rows; const NR=rows.length; this.NR=NR;
    this.crates=[]; this.berries=[]; this.foes=[]; this.logs=[]; this.rollers=[]; this.swings=[]; this.pads=[]; this.fx=[];
    const X=c=>(c-3)*JCS, Z=r=>-r*JCS, grT=[], raised=[], water=[];
    for(let r=0;r<NR;r++){ const row=rows[r]; let run=-1;
      for(let c=0;c<=JW;c++){ const ch=c<JW?row[c]:'.', gnd=c<JW&&'.wnO'.indexOf(ch)<0;
        if(gnd&&run<0) run=c; if(!gnd&&run>=0){ this.solid(X(run)-JCS/2,-3,Z(r)-JCS/2,X(c-1)+JCS/2,0,Z(r)+JCS/2,null,{gnd:1}); run=-1; }
        if(c>=JW) continue; const x=X(c), z=Z(r);
        if(gnd) grT.push([x,z]);
        if(ch==='w'||ch==='n') water.push([x,z]);
        if(ch==='n'){ this.solid(x-0.65,-0.25,z-0.65,x+0.65,0,z+0.65,null,{pad:1}); this.pads.push([x,z]); }
        if(ch==='='){ this.solid(x-JCS/2,0,z-JCS/2,x+JCS/2,1.5,z+JCS/2,null,{gnd:1}); raised.push([x,z]); }
        if('cbkxli'.indexOf(ch)>=0) this.mkCrate(ch,x,z);
        if(ch==='o'||ch==='O') this.berries.push({x,y:ch==='O'?1.4:0.9,z,on:true});
        if('rpvh'.indexOf(ch)>=0) this.foes.push({k:ch,x,z,x0:x,z0:z,y:ch==='v'?1.5:0,dir:1,t:rand(0,6),dead:0,sq:0,g:null});
        if(ch==='L') this.rollers.push({z,t:0,zEnd:z+7*JCS});
        if(ch==='S') this.swings.push({z,t:rand(0,2)});
        if(ch==='g') this.goal={x,z}; } }
    this.crTot=this.crates.filter(c=>c.k!=='i').length; this.crGot=0;
    // décor du sol (instancié)
    const mtx=new THREE.Matrix4(), v=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3(1,1,1), rnd=mulberry32(li*13+5);
    const edge=matC('jgEdge'+li,()=>new THREE.MeshLambertMaterial({map:(()=>{ const c=makeCanvas(64,64), g=c.getContext('2d'); g.fillStyle=L.side; g.fillRect(0,0,64,64); for(let i=0;i<60;i++){ g.fillStyle=i%2?'rgba(0,0,0,.12)':'rgba(255,255,255,.07)'; g.fillRect(Math.random()*64,14+Math.random()*50,4,4); } g.fillStyle=L.top; g.fillRect(0,0,64,14); for(let i=0;i<8;i++) g.fillRect(i*8+2,14,4,3+(i%3)*3); const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; return t; })()}));
    const top=matC('jgTop'+li,()=>new THREE.MeshLambertMaterial({map:(()=>{ const c=makeCanvas(64,64), g=c.getContext('2d'); g.fillStyle=L.top; g.fillRect(0,0,64,64); for(let i=0;i<90;i++){ g.fillStyle=i%3?'rgba(0,60,0,.12)':'rgba(255,255,255,.1)'; g.fillRect(Math.random()*64,Math.random()*64,3,3); } if(L.dark){ g.strokeStyle='rgba(0,0,0,.25)'; g.lineWidth=3; g.strokeRect(1,1,62,62); } const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; return t; })()}));
    const gi=new THREE.InstancedMesh(box(JCS,3,JCS),[edge,edge,top,edge,edge,edge],grT.length);
    grT.forEach(([x,z],n)=>{ mtx.compose(v.set(x,-1.5,z),q,s); gi.setMatrixAt(n,mtx); }); gi.instanceMatrix.needsUpdate=true; gi.receiveShadow=true; gi.castShadow=true; sc.add(gi);
    if(raised.length){ const ri=new THREE.InstancedMesh(box(JCS,1.5,JCS),[edge,edge,top,edge,edge,edge],raised.length); raised.forEach(([x,z],n)=>{ mtx.compose(v.set(x,0.75,z),q,s); ri.setMatrixAt(n,mtx); }); ri.instanceMatrix.needsUpdate=true; ri.castShadow=true; ri.receiveShadow=true; sc.add(ri); }
    if(water.length||L.water){ const wm=new THREE.MeshLambertMaterial({color:'#3aa8d8',emissive:'#0a3a5a',transparent:true,opacity:0.88}); wm.userData.own=true; const wg=new THREE.PlaneGeometry(80,NR*JCS+80); wg.userData.own=true;
      const w=new THREE.Mesh(wg,wm); w.rotation.x=-Math.PI/2; w.position.set(0,-0.7,-NR*JCS/2); sc.add(w); this.water=w; }
    if(this.pads.length){ const pi=new THREE.InstancedMesh(cyl(0.72,0.72,0.12,14),lam('#4cc157'),this.pads.length); this.pads.forEach(([x,z],n)=>{ mtx.compose(v.set(x,-0.06,z),q,s); pi.setMatrixAt(n,mtx); }); pi.instanceMatrix.needsUpdate=true; pi.receiveShadow=true; sc.add(pi); this.padIM=pi; }
    // parois de la jungle (falaises, troncs, feuillage)
    const W1=[], W2=[], W3=[];
    for(let r=-6;r<NR+10;r+=1+Math.floor(rnd()*2)) for(const sd of [-1,1]){ const z=Z(r)+rnd()*0.8, h=2.5+rnd()*4.5; W1.push([sd*(JW/2*JCS+0.9+rnd()*0.8),h,z,1.4+rnd()*1.2]); if(rnd()<0.55) W2.push([sd*(JW/2*JCS+2.6+rnd()*3),z,4+rnd()*6]); if(rnd()<0.5) W3.push([sd*(JW/2*JCS+0.6),z,1.2+rnd()*2.4]); }
    const wallM=L.dark?texC('stone','#a8a0c8'):texC('stone','#d8c8b0');
    const wi=new THREE.InstancedMesh(box(1,1,1.6),wallM,W1.length); W1.forEach(([x,h,z,w],n)=>{ mtx.compose(v.set(x,h/2-1,z),q,s.set(w,h+2,1)); wi.setMatrixAt(n,mtx); }); s.set(1,1,1); wi.instanceMatrix.needsUpdate=true; wi.castShadow=true; wi.receiveShadow=true; sc.add(wi);
    const ti=new THREE.InstancedMesh(box(0.7,1,0.7),lam('#7a4b23'),W2.length), ci=new THREE.InstancedMesh(sph(1),lam(L.leaf),W2.length*2);
    W2.forEach(([x,z,h],n)=>{ mtx.compose(v.set(x,h/2,z),q,s.set(1,h,1)); ti.setMatrixAt(n,mtx); mtx.compose(v.set(x,h+0.8,z),q,s.set(2.4,1.7,2.4)); ci.setMatrixAt(n*2,mtx); mtx.compose(v.set(x-Math.sign(x)*1.4,h+0.2,z+0.8),q,s.set(1.6,1.2,1.6)); ci.setMatrixAt(n*2+1,mtx); }); s.set(1,1,1);
    [ti,ci].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.castShadow=true; m.frustumCulled=false; sc.add(m); });
    const vi=new THREE.InstancedMesh(box(0.08,1,0.08),lam('#3a8a3a'),W3.length); W3.forEach(([x,z,h],n)=>{ mtx.compose(v.set(x,5.5-h/2,z),q,s.set(1,h,1)); vi.setMatrixAt(n,mtx); }); s.set(1,1,1); vi.instanceMatrix.needsUpdate=true; vi.frustumCulled=false; sc.add(vi);
    if(L.lantern){ const lp=[]; for(let r=2;r<NR;r+=7) for(const sd of [-1,1]) lp.push([sd*(JW/2*JCS+0.4),Z(r)]);
      const pm=new THREE.InstancedMesh(box(0.18,2.4,0.18),lam('#2b2d42'),lp.length), lb=new THREE.InstancedMesh(box(0.5,0.6,0.5),matC('jglan',()=>new THREE.MeshBasicMaterial({color:'#ffcf6a'})),lp.length);
      lp.forEach(([x,z],n)=>{ mtx.compose(v.set(x,1.2,z),q,s); pm.setMatrixAt(n,mtx); mtx.compose(v.set(x,2.6,z),q,s); lb.setMatrixAt(n,mtx); }); [pm,lb].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.frustumCulled=false; sc.add(m); });
      for(let r=10;r<NR;r+=22){ const pl=new THREE.PointLight('#ffb860',1.3,16,1.6); pl.position.set(0,3,Z(r)); sc.add(pl); } }
    // baies (instanciées), ennemis, éléments mobiles
    this.berryIM=new THREE.InstancedMesh(sph(0.26),matC('jgBerry',()=>new THREE.MeshLambertMaterial({color:'#ffb020',emissive:'#c05a00',emissiveIntensity:0.6})),Math.max(1,this.berries.length)); this.berryIM.castShadow=true; sc.add(this.berryIM);
    for(const f of this.foes){ f.g=jgFoe(f.k); f.g.position.set(f.x,f.y,f.z); sc.add(f.g); }
    for(const sw of this.swings){ const g=new THREE.Group(); g.position.set(0,6.5,sw.z); sc.add(g); const rope=mk(box(0.1,5.2,0.1),lam('#7a5a3a')); rope.position.y=-2.6; g.add(rope);
      const lg=mk(cyl(0.55,0.55,2.2,12),texC('wood','#a87a4a')); lg.rotation.z=Math.PI/2; lg.position.y=-5.4; g.add(lg); const beam=mk(box(JW*JCS+3,0.4,0.4),lam('#5a3a1e')); beam.position.set(0,6.7,sw.z); sc.add(beam); sw.g=g; }
    if(this.goal){ const g=new THREE.Group(); const pd=mk(cyl(0.8,1,1,8),texC('stone','#e0d8c8')); pd.position.y=0.5; g.add(pd);
      const orb=mk(sph(0.6),new THREE.MeshBasicMaterial({color:'#fff2a0'})); orb.material.userData.own=true; orb.position.y=1.8; g.add(orb); this.orb=orb;
      for(let i=0;i<8;i++){ const ry=mk(box(0.08,0.9,0.08),new THREE.MeshBasicMaterial({color:'#ffd23f'})); ry.material.userData.own=true; ry.position.y=1.8; ry.rotation.z=i/8*TAU; ry.translateY(0.95); g.add(ry); }
      g.position.set(this.goal.x,0,this.goal.z); sc.add(g); this.goalG=g; }
    this.lumiG=new THREE.Group(); const lm=mk(sph(0.18),new THREE.MeshBasicMaterial({color:'#f6ff9a'})); lm.material.userData.own=true; this.lumiG.add(lm); for(const q of [-1,1]){ const w=mk(box(0.26,0.03,0.14),lam('#e0f8ff'),false); w.position.x=q*0.18; w.userData.wing=q; this.lumiG.add(w); } this.lumiG.visible=false; sc.add(this.lumiG);
    if(L.amb) addAmb(this,L.amb);
    addClouds(this,L.dark?0:10,[20,60],[16,28],[-NR*JCS,10]);
    // départ
    const pk=this.pk||{}; this.speed=6.5*(pk.spd||1); this.jumpV=11*(pk.jump||1);
    this.spawn={x:0,z:-1.5}; this.lives=5; this.berry=0; this.lumi=0; this.spin=0; this.spinCd=0; this.inv=0; this.won=false; this.deaths=0; this.t0=this.time;
    P.x=0; P.y=0.1; P.z=-1.5; P.vx=P.vy=P.vz=0; P.yaw=Math.PI; cam.yaw=0; this.ready=true; this.fp=false; this.wasG=true; this.cz=P.z; this.cxx=0;
    $('bAct').textContent='🌀'; this.updBerries(); banner(L.ic+' '+L.n+' : cours jusqu\'à la pierre-soleil !'); bgmPlay('jungle');
  },
  mkCrate(k,x,z){ const m=jgCrate(k); m.position.set(x,0.55,z); this.scene.add(m);
    const c={k,x,z,m,hits:0,fuse:-1,mat0:m.material}; c.b=this.solid(x-0.55,0,z-0.55,x+0.55,1.1,z+0.55,null,{crate:c}); this.crates.push(c); },
  breakCrate(c,how){
    if(c.dead||c.k==='i') return;
    if(c.k==='x'){ if(c.fuse<0){ c.fuse=how==='boom'?0.01:2; sfx('click'); if(how!=='boom') banner('💥 Caisse pétard : cours !'); } return; }
    if(c.k==='b'&&how==='top'){ c.hits++; this.addBerry(1); if(c.hits<5){ c.m.scale.set(1.15,0.8,1.15); setTimeout(()=>{ if(!c.dead) c.m.scale.set(1,1,1); },90); return; } }
    c.dead=true; this.gridRemove(c.b); this.scene.remove(c.m); this.crGot++;
    burst(this.scene,c.x,0.6,c.z,'#c98b4f',12,5); sfx('brk');
    if(c.k==='c') this.addBerry(how==='spin'?2:3);
    else if(c.k==='k'){ this.spawn={x:c.x,z:c.z}; sfx('cp'); banner('✔️ Point de reprise !'); }
    else if(c.k==='l'){ this.lumi=Math.min(2,this.lumi+1); sfx('gem'); banner(this.lumi>1?'✨✨ Deux lucioles gardiennes !':'✨ Une luciole gardienne te protège !'); }
    if(this.crGot===this.crTot){ banner('💎 Toutes les caisses cassées !'); sfx('win'); }
  },
  addBerry(n){ this.berry+=n; for(let i=0;i<n;i++) sfx('coin'); if(Math.floor((this.berry)/50)>Math.floor((this.berry-n)/50)){ this.lives++; banner('🧡 Une vie de plus !'); } },
  explode(c){ c.dead=true; this.gridRemove(c.b); this.scene.remove(c.m); this.crGot++; sfx('boom'); burst(this.scene,c.x,0.8,c.z,'#ff7a2f',24,8,true); confetti(this.scene,c.x,1,c.z);
    for(const o of this.crates) if(!o.dead&&o!==c&&Math.hypot(o.x-c.x,o.z-c.z)<2.8) this.breakCrate(o,'boom');
    for(const f of this.foes) if(!f.dead&&Math.hypot(f.x-c.x,f.z-c.z)<2.8) this.kill(f);
    if(Math.hypot(P.x-c.x,P.z-c.z)<2.4&&P.y<2.2) this.hurt(); },
  onAction(){ this.doSpin(); },
  doSpin(){ if(!this.ready||this.won||this.spin>0||this.spinCd>0) return; this.spin=0.45*((this.pk||{}).spin||1); sfx('swing'); },
  kill(f){ if(f.dead) return; f.dead=1; f.sq=1; burst(this.scene,f.x,f.y+0.6,f.z,'#ffd23f',10,5); sfx('squish'); },
  hurt(){ if(this.inv>0||this.won) return;
    if(this.lumi>0){ this.lumi--; this.inv=1.3; P.inv=1.3; P.vy=7; sfx('pop' in SFX?'pop':'squeak'); burst(this.scene,P.x,P.y+1.2,P.z,'#f6ff9a',12,5,true); banner('✨ La luciole t\'a protégé !'); return; }
    this.die(); },
  die(){ this.lives--; this.deaths++; sfx('hurt'); flashHurt(); if(this.lives<=0){ this.lives=5; banner('💪 Encore une fois !'); }
    P.x=this.spawn.x; P.y=0.2; P.z=this.spawn.z; P.vx=P.vy=P.vz=0; this.inv=1.5; P.inv=1.5; this.cz=P.z; },
  update(dt){
    if(!this.ready) return;
    cam.yaw=0; const t=this.time;
    if(this.won){ this.winT+=dt; P.vx=P.vz=0; if(this.orb) this.orb.scale.setScalar(1+Math.sin(t*6)*0.15); if(Math.random()<0.15) confetti(this.scene,P.x+rand(-2,2),P.y+3,P.z+rand(-2,2)); return; }
    this.frozen=false; this.inv=Math.max(0,this.inv-dt);
    // atterrissage sur une caisse
    if(P.onGround&&P.ground&&P.ground.crate&&(!this.wasG||this.lastVy<-1)){ const c=P.ground.crate;
      if(c.k==='i'){ } else if(c.k==='b'){ this.breakCrate(c,'top'); P.vy=13; P.onGround=false; } else { this.breakCrate(c,'top'); P.vy=10; P.onGround=false; } }
    this.wasG=P.onGround; this.lastVy=P.vy;
    // toupie
    if(this.spin>0){ this.spin-=dt; for(const c of this.crates) if(!c.dead&&Math.hypot(c.x-P.x,c.z-P.z)<1.75&&Math.abs(0.55-P.y)<1.6) this.breakCrate(c,'spin');
      for(const f of this.foes) if(!f.dead&&Math.hypot(f.x-P.x,f.z-P.z)<1.8&&Math.abs(f.y-P.y)<1.8) this.kill(f);
      if(Math.random()<0.5) burst(this.scene,P.x,P.y+0.8,P.z,'#ffffff',1,3); if(this.spin<=0) this.spinCd=0.15; }
    else this.spinCd=Math.max(0,this.spinCd-dt);
    // caisses pétard
    for(const c of this.crates) if(!c.dead&&c.k==='x'&&c.fuse>=0){ c.fuse-=dt; c.m.scale.setScalar(1+Math.sin(t*30)*0.06*(2-c.fuse)); c.m.material=Math.floor(c.fuse*4)%2===0?matC('jgcx2',()=>new THREE.MeshBasicMaterial({color:'#fff0a0'})):c.mat0; if(c.fuse<=0) this.explode(c); }
    // baies
    for(const b of this.berries) if(b.on&&Math.hypot(b.x-P.x,b.z-P.z)<0.95&&b.y>P.y-0.3&&b.y<P.y+2){ b.on=false; this.addBerry(1); }
    this.updBerries();
    // ennemis
    for(const f of this.foes) this.updFoe(f,dt);
    // troncs qui roulent
    for(const r of this.rollers){ const d=P.z-r.z; if(d<2||d>26) continue; r.t-=dt; if(r.t<=0){ r.t=2.8; const g=mk(cyl(0.55,0.55,JW*JCS-0.4,14),texC('wood','#a87a4a')); g.rotation.z=Math.PI/2; g.position.set(0,0.55,r.z); this.scene.add(g); this.logs.push({z:r.z,g,zEnd:r.zEnd}); } }
    for(let i=this.logs.length-1;i>=0;i--){ const lg=this.logs[i]; lg.z+=4.5*dt; lg.g.position.z=lg.z; lg.g.rotation.x-=4.5*dt/0.55;
      if(Math.abs(P.z-lg.z)<0.8&&P.y<0.95) this.hurt();
      if(lg.z>lg.zEnd){ burst(this.scene,0,0.6,lg.z,'#a87a4a',8,4); this.scene.remove(lg.g); this.logs.splice(i,1); } }
    // troncs qui se balancent
    for(const sw of this.swings){ sw.t+=dt; const a=Math.sin(sw.t*1.7)*0.62; sw.g.rotation.z=a; const lx=Math.sin(a)*5.4, ly=6.5-Math.cos(a)*5.4;
      if(Math.abs(P.z-sw.z)<0.9&&Math.abs(P.x-lx)<1.4&&P.y<ly+0.5&&P.y+1.7>ly-0.5) this.hurt(); }
    // luciole gardienne
    this.lumiG.visible=this.lumi>0; if(this.lumi>0){ this.lumiG.position.set(P.x+Math.cos(t*2)*0.8,P.y+2+Math.sin(t*3)*0.2,P.z+Math.sin(t*2)*0.8); this.lumiG.children[0].scale.setScalar(this.lumi>1?1.6:1); this.lumiG.children.forEach(c=>{ if(c.userData.wing) c.rotation.x=Math.sin(t*40)*0.6; }); }
    if(this.water){ this.water.position.y=-0.7+Math.sin(t*1.2)*0.04; }
    if(this.orb){ this.orb.rotation.y+=dt; this.goalG.rotation.y+=dt*0.5; }
    // chute et arrivée
    if(this.water&&P.y<-0.9){ burst(this.scene,P.x,-0.6,P.z,'#bfefff',14,5); sfx('splash' in SFX?'splash':'poof'); this.die(); }
    if(P.y<-6) this.die();
    if(this.goal&&Math.hypot(P.x-this.goal.x,P.z-this.goal.z)<1.4) this.win();
    P.x=clamp(P.x,-JW/2*JCS+0.4,JW/2*JCS-0.4); if(P.z>0.4) P.z=0.4;
  },
  updFoe(f,dt){
    if(f.dead){ f.sq-=dt*3; f.g.scale.set(1.2,Math.max(0.05,f.sq),1.2); if(f.sq<=0&&f.g.parent) this.scene.remove(f.g); return; }
    if(Math.abs(f.z-P.z)>30) return;
    f.t+=dt; const lim=JW/2*JCS-0.8;
    if(f.k==='r'){ f.x+=f.dir*2.1*dt; if(Math.abs(f.x)>lim){ f.x=Math.sign(f.x)*lim; f.dir*=-1; } f.g.rotation.y=f.dir>0?Math.PI/2:-Math.PI/2; }
    else if(f.k==='h'){ f.x+=f.dir*3.4*dt; if(Math.abs(f.x)>lim){ f.x=Math.sign(f.x)*lim; f.dir*=-1; } f.g.rotation.z-=f.dir*3.4*dt/0.5; }
    else if(f.k==='v'){ f.x=f.x0+Math.sin(f.t*1.1)*2.6; f.y=1.5+Math.sin(f.t*2.2)*0.4; f.z=f.z0+Math.sin(f.t*2.2)*0.6; f.g.children.forEach(c=>{ if(c.userData.wing) c.rotation.z=Math.sin(f.t*30)*0.7*c.userData.wing; }); }
    else { const hd=f.g.userData.head, d=Math.hypot(P.x-f.x,P.z-f.z); f.snap=(f.snap||0)-dt; if(d<2.6&&f.snap<=0){ f.snap=1.6; f.bite=0.35; } f.bite=Math.max(0,(f.bite||0)-dt);
      if(hd){ hd.position.z=f.bite>0?0.6*Math.sin(f.bite/0.35*Math.PI):0; hd.lookAt(P.x-f.x,1.0,P.z-f.z); } }
    f.g.position.set(f.x,f.y,f.z);
    const r=f.k==='h'?0.95:0.85, hy=f.k==='v'?f.y-0.4:0, top=f.k==='v'?f.y+0.4:f.k==='p'?1.4:0.9;
    if(Math.hypot(P.x-f.x,P.z-f.z)<r&&P.y<top&&P.y+1.7>hy){
      if(this.spin>0) return this.kill(f);
      if(P.vy<-0.5&&P.y>top-0.55&&f.k!=='h'&&f.k!=='p'){ this.kill(f); P.vy=inp.jumpHeld?12:9; }
      else if(f.k!=='p'||f.bite>0||d2(P,f)<0.6) this.hurt(); }
    function d2(a,b){ return Math.hypot(a.x-b.x,a.z-b.z); }
  },
  updBerries(){ const im=this.berryIM; if(!im) return; const mtx=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), s=new THREE.Vector3();
    this.berries.forEach((b,n)=>{ mtx.compose(v.set(b.x,b.y+Math.sin(this.time*3+b.z)*0.08,b.z),q,s.setScalar(b.on?1:0)); im.setMatrixAt(n,mtx); }); im.instanceMatrix.needsUpdate=true; },
  win(){
    this.won=true; this.winT=0; sfx('win'); confetti(this.scene,P.x,P.y+2,P.z); if(PA) PA.waveT=5; P.yaw=0;
    const li=this.li, tm=this.time-this.t0, gem=this.crGot>=this.crTot, coins=20+Math.floor(this.berry/3)+(gem?25:0);
    addCoins(coins); if(gem) S.jungle.gem[li]=1; if(!S.jungle.best[li]||tm<S.jungle.best[li]) S.jungle.best[li]=tm; if(li>=(S.jungle.lv||0)&&li<2) S.jungle.lv=li+1; save();
    showResult({icon:gem?'💎':'☀️',title:JLV[li].n+' terminé !',sub:gem?'Toutes les caisses cassées : gemme gagnée !':'Il reste des caisses à casser pour la gemme.',stats:[['Caisses',this.crGot+' / '+this.crTot],['Baies',this.berry],['Chutes',this.deaths],['Temps',fmtTime(tm)],['Pièces gagnées','+'+coins]]});
  },
  camUpd(dt){
    if(!this.ready){ camera.position.set(0,5,8); camera.lookAt(0,1,-6); return; }
    this.cz=lerp(this.cz,P.z,damp(6,dt)); this.cxx=lerp(this.cxx,P.x*0.45,damp(4,dt)); const ty=P.y*0.6;
    camera.position.set(this.cxx,ty+5.4,this.cz+8.4); camera.lookAt(this.cxx*1.2,ty+1.1,this.cz-5.5);
    cam.px=camera.position.x; cam.py=camera.position.y; cam.pz=camera.position.z;
    if(PA&&this.spin>0) PA.root.rotation.y+=this.time*25%TAU;
  },
  hud(){ if(!this.ready) return; setText('jgL',this.lives); setText('jgB',this.berry); setText('jgC',this.crGot+'/'+this.crTot); setText('jgLu','✨ '+this.lumi); },
  idle(dt){ this.update(dt); },
  stop(){}
};
SONGS.jungle={bpm:132,root:57,scale:[0,3,5,7,10],lead:'triangle',bass:'square',prog:[0,0,3,4],mel:[0,null,2,3,null,2,0,null, 4,null,3,2,null,0,null,null, 0,2,3,null,4,null,3,2, 0,null,null,null,2,null,0,null],drum:'k..hk.s.k.hhk.s.',vol:0.6,pluck:true};
GAME_EXTRA.push({id:'jungle',ic:'🌀',t:'Course de la Jungle',d:'Fonce dans la jungle, casse les caisses, fais la toupie et évite les troncs qui roulent !',bg:'linear-gradient(140deg,#2fbf71,#ffb020)',
  best:()=>{ const g=(S.jungle.gem||[]).reduce((a,v)=>a+(v?1:0),0); return S.jungle.lv||g?'🌿 '+Math.min(3,(S.jungle.lv||0)+1)+'/3 niveaux · 💎 '+g+'/3':'Nouveau !'; }});
