/* =========================================================
   14. Île au Trésor : île tropicale, palmiers, crabes,
       mouettes, trésors enfouis et coucher de soleil
   ========================================================= */
function palmMesh(h,lean,rng){
  const g=new THREE.Group(), tr=lam('#a8763f'), tr2=lam('#8a5a2b'), lf=lam('#3fbf5a'), lf2=lam('#2f9e48');
  let x=0, y=0; const n=6, seg=h/n;
  for(let i=0;i<n;i++){ const m=mk(box(0.36,+(seg+0.05).toFixed(2),0.36),i%2?tr:tr2); x=lean*Math.pow(i/n,1.6); m.position.set(x,y+seg/2,0); m.rotation.z=-lean*0.12*i/n; g.add(m); y+=seg; }
  const top=new THREE.Group(); top.position.set(x,y,0); g.add(top);
  for(let i=0;i<7;i++){ const a=i/7*TAU+rng()*0.3, f=new THREE.Group(); f.rotation.y=a; const l=mk(box(0.42,0.08,2.1),i%2?lf:lf2); l.position.set(0,0,1.0); l.rotation.x=0.42; f.add(l); const t=mk(box(0.3,0.06,0.9),i%2?lf2:lf); t.position.set(0,-0.55,2.15); t.rotation.x=0.9; f.add(t); top.add(f); }
  for(let i=0;i<3;i++){ const c=mk(sph(0.17),lam('#6b4a1e')); c.position.set(Math.cos(i*2.1)*0.25,-0.2,Math.sin(i*2.1)*0.25); top.add(c); }
  return {g,top:[x,y]};
}
function crabMesh(){
  const g=new THREE.Group(), R='#ff5a3c', D='#d63a22', add=(w,h,d,c,x,y,z)=>{ const m=mk(box(w,h,d),lam(c)); m.position.set(x,y,z); g.add(m); return m; };
  add(0.7,0.3,0.5,R,0,0.3,0); for(const k of [-1,1]){ add(0.06,0.22,0.06,D,k*0.12,0.55,0.15); add(0.1,0.1,0.06,'#ffffff',k*0.12,0.68,0.16); add(0.05,0.05,0.04,'#1d1846',k*0.12,0.68,0.2);
    add(0.22,0.18,0.2,R,k*0.48,0.36,0.28); add(0.12,0.08,0.14,D,k*0.55,0.42,0.42); for(let j=0;j<3;j++) add(0.24,0.05,0.05,D,k*0.42,0.18,-0.15+j*0.14).rotation.z=k*0.5; }
  return g;
}
GAMES.island={
  hint:MOVE_HINT+' · E : creuser', autoJump:true, jumpV:11.5,
  hudHTML:'<div class="pill" id="pTime">⏱ <b id="hTime">4:00</b></div><div class="pill">💎 <b id="hGems">0/10</b></div><div class="pill">💰 <b id="hTr">0/3</b></div>',
  speedMul(){ return P.y<0.35?0.6:1; },
  start(){
    const sc=this.scene; setupScene(sc,'#3aa0ff','#ffe0b0',40,130);
    this.skyM=addSky(this,{top:'#3a9cf0',mid:'#8fd0ff',bot:'#ffe6b8',sun:{u:0.3,el:18,r:20,c:'#fff3c4',glow:'rgba(255,220,150,.85)',gl:7},near:40,far:140}).material;
    setLights(this,{hemi:['#fff4dc','#7a6a50',0.66],sun:['#fff0d0',0.72],dir:[-16,22,12]});
    const N=56, O=N/2; this.N=N; this.O=O; this.limit=240; this.found=0;
    const rng=mulberry32((Math.random()*1e9)|0); this.rng=rng;
    const n1=valueNoise(rng,9), n2=valueNoise(rng,4);
    const E=new Float32Array(N*N);
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const dx=(i+0.5-O)/O, dz=(j+0.5-O)/O, d=Math.sqrt(dx*dx+dz*dz);
      E[j*N+i]=(1-d*1.25)*1.1+(n1(i,j)*0.7+n2(i,j)*0.3-0.5)*0.7; }
    const H=new Int8Array(N*N); this.H=H;
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ let s=0,c=0;
      for(let b=-1;b<=1;b++) for(let a=-1;a<=1;a++){ const x=i+a, y=j+b; if(x>=0&&y>=0&&x<N&&y<N){ s+=E[y*N+x]; c++; } }
      let h=Math.floor((s/c)*9); if(i<2||j<2||i>N-3||j>N-3) h=0; H[j*N+i]=clamp(h,0,8); }
    const Hc=(i,j)=>(i<0||j<0||i>=N||j>=N)?0:H[j*N+i]; this.Hc=Hc;
    const cubes=[];
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const h=H[j*N+i];
      if(h<=0){ cubes.push(i,j,-1,h); continue; }
      const mn=Math.min(h,Hc(i-1,j),Hc(i+1,j),Hc(i,j-1),Hc(i,j+1));
      for(let k=Math.min(h-1,mn);k<=h-1;k++) cubes.push(i,j,k,h); }
    const cnt=cubes.length/4;
    const imat=new THREE.MeshLambertMaterial({map:tileTex}); imat.userData.own=true;
    const im=new THREE.InstancedMesh(box(1,1,1),imat,cnt), mtx=new THREE.Matrix4(), col=new THREE.Color();
    const tcol=(h,k)=>{ if(h<=0) return '#e8d08e'; if(h<=2) return k===h-1?'#f7e2a3':'#e8cf8a'; if(k===h-1){ if(h>=8) return '#f4f8ff'; if(h>=7) return '#a3a9b4'; if(h>=5) return '#3e9e4c'; return '#5cc95a'; } if(h-1-k>=3||h>=7) return '#8f95a0'; return '#a9774a'; };
    for(let n=0;n<cnt;n++){ const i=cubes[n*4], j=cubes[n*4+1], k=cubes[n*4+2], h=cubes[n*4+3];
      mtx.makeTranslation(i-O+0.5,k+0.5,j-O+0.5); im.setMatrixAt(n,mtx);
      col.set(tcol(h,k)); col.offsetHSL(0,0,(rng()-0.5)*0.07); im.setColorAt(n,col); }
    im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true;
    im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; sc.add(im);
    // mer turquoise, fond de sable et écume
    const pg=new THREE.PlaneGeometry(N+240,N+240); pg.userData.own=true;
    const wm=new THREE.MeshLambertMaterial({color:'#1fc3d6',transparent:true,opacity:0.7}); wm.userData.own=true;
    const water=new THREE.Mesh(pg,wm); water.rotation.x=-Math.PI/2; water.position.y=0.62; sc.add(water); this.water=water;
    const deep=new THREE.Mesh(pg,lam('#1b6f9e')); deep.rotation.x=-Math.PI/2; deep.position.y=-3; sc.add(deep);
    const sand=new THREE.Mesh(new THREE.PlaneGeometry(N,N),texMat('sand','#e8d08e',N/4)); sand.geometry.userData.own=true; sand.rotation.x=-Math.PI/2; sand.position.y=-0.99; sc.add(sand);
    const foam=[]; for(let j=1;j<N-1;j++) for(let i=1;i<N-1;i++) if(H[j*N+i]===0&&(Hc(i-1,j)>0||Hc(i+1,j)>0||Hc(i,j-1)>0||Hc(i,j+1)>0)) foam.push([i-O+0.5,j-O+0.5]);
    if(foam.length){ const fm=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0.55,depthWrite:false}); fm.userData.own=true;
      const fi=new THREE.InstancedMesh(box(1.05,0.02,1.05),fm,foam.length); foam.forEach(([x,z],n)=>{ mtx.makeTranslation(x,0.64,z); fi.setMatrixAt(n,mtx); }); fi.instanceMatrix.needsUpdate=true; fi.frustumCulled=false; sc.add(fi); this.foam=fi; }
    // départ
    let sp=null, bd=1e9;
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const h=H[j*N+i]; if(h<2||h>6) continue; const d=Math.hypot(i+0.5-O,j+0.5-O); if(d<bd){ bd=d; sp=[i,j,h]; } }
    if(!sp){ sp=[O,O,0]; }
    P.x=sp[0]-O+0.5; P.z=sp[1]-O+0.5; P.y=sp[2]; P.yaw=Math.PI; cam.yaw=0;
    // palmiers sur la plage, arbres de jungle en hauteur
    const taken=new Set(); this.trees=[]; const tPos=[];
    for(let j=3;j<N-3;j++) for(let i=3;i<N-3;i++){ const h=H[j*N+i]; if(h<1||h>5||rng()>(h<=2?0.09:0.06)) continue;
      if(Math.abs(i-sp[0])<3&&Math.abs(j-sp[1])<3) continue;
      let ok=true; for(let b=-2;b<=2&&ok;b++) for(let a=-2;a<=2;a++) if(taken.has((j+b)*N+(i+a))&&!(a===0&&b===0)){ ok=false; break; }
      if(!ok) continue;
      for(let b=-1;b<=1;b++) for(let a=-1;a<=1;a++) taken.add((j+b)*N+(i+a));
      tPos.push([i-O,j-O,h]); }
    const jungle=tPos.filter(t=>t[2]>=4), palms=tPos.filter(t=>t[2]<4);
    for(const [x,z,h] of palms){ const ph=rand(3.4,4.6), P_=palmMesh(ph,rand(0.3,1.1)*(rng()<0.5?-1:1),rng); P_.g.position.set(x+0.5,h,z+0.5); P_.g.rotation.y=rng()*TAU; sc.add(P_.g);
      this.trees.push({x0:x+0.3,x1:x+0.7,y0:h,y1:h+ph,z0:z+0.3,z1:z+0.7}); }
    if(jungle.length){
      const trm=new THREE.MeshLambertMaterial({color:'#8a5a2b'}); trm.userData.own=true;
      const lfm=new THREE.MeshLambertMaterial({map:tileTex}); lfm.userData.own=true;
      const tim=new THREE.InstancedMesh(box(1,1,1),trm,jungle.length), lim=new THREE.InstancedMesh(box(1,1,1),lfm,jungle.length*2);
      const sc3=new THREE.Vector3(), q=new THREE.Quaternion(), ps=new THREE.Vector3();
      jungle.forEach(([x,z,h],n)=>{
        mtx.compose(ps.set(x+0.5,h+1.1,z+0.5),q,sc3.set(0.45,2.2,0.45)); tim.setMatrixAt(n,mtx);
        mtx.compose(ps.set(x+0.5,h+2.6,z+0.5),q,sc3.set(2.4,1.6,2.4)); lim.setMatrixAt(n*2,mtx);
        mtx.compose(ps.set(x+0.5,h+3.8,z+0.5),q,sc3.set(1.4,0.8,1.4)); lim.setMatrixAt(n*2+1,mtx);
        col.set(['#2f9a44','#3fae4a','#25803a'][n%3]); lim.setColorAt(n*2,col); col.offsetHSL(0,0,0.05); lim.setColorAt(n*2+1,col);
        this.trees.push({x0:x+0.275,x1:x+0.725,y0:h,y1:h+2.2,z0:z+0.275,z1:z+0.725});
        this.trees.push({x0:x+0.5-1.2,x1:x+0.5+1.2,y0:h+1.8,y1:h+3.4,z0:z+0.5-1.2,z1:z+0.5+1.2,noCam:true});
        this.trees.push({x0:x+0.5-0.7,x1:x+0.5+0.7,y0:h+3.4,y1:h+4.2,z0:z+0.5-0.7,z1:z+0.5+0.7,noCam:true}); });
      [tim,lim].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false; sc.add(m); });
      if(lim.instanceColor) lim.instanceColor.needsUpdate=true; }
    // fleurs et rochers
    for(let k=0;k<70;k++){ const i=3+Math.floor(rng()*(N-6)), j=3+Math.floor(rng()*(N-6)), h=H[j*N+i]; if(h<3||h>5||taken.has(j*N+i)) continue;
      const f=mk(box(0.18,0.18,0.18),lam(['#ff4d6d','#ffd23f','#ffffff','#ff8fc7','#9b5de5'][k%5]),false); f.position.set(i-O+0.5+rand(-0.3,0.3),h+0.09,j-O+0.5+rand(-0.3,0.3)); sc.add(f); }
    // gemmes
    this.gems=[]; let tries=0;
    while(this.gems.length<10&&tries<5000){ tries++;
      const i=3+Math.floor(rng()*(N-6)), j=3+Math.floor(rng()*(N-6)), h=H[j*N+i];
      if(h<1||taken.has(j*N+i)) continue;
      const x=i-O+0.5, z=j-O+0.5;
      if(Math.hypot(x-P.x,z-P.z)<7) continue;
      if(this.gems.some(g=>Math.hypot(g.x-x,g.z-z)<7)) continue;
      const c=GEMC[this.gems.length], g=new THREE.Group();
      const gm=new THREE.MeshLambertMaterial({color:c,emissive:new THREE.Color(c).multiplyScalar(0.45)}); gm.userData.own=true;
      const m=mk(oct(0.42),gm); g.add(m);
      const bm=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.28,depthWrite:false}); bm.userData.own=true;
      const beam=new THREE.Mesh(cyl(0.08,0.08,40,6),bm); beam.position.y=20; g.add(beam);
      g.position.set(x,h+1,z); sc.add(g);
      this.gems.push({g,m,c,x,y:h+1,z,t:rng()*6,taken:false});
    }
    this.total=this.gems.length;
    // trésors enfouis (marqués d'une croix)
    this.xs=[]; tries=0;
    while(this.xs.length<3&&tries<3000){ tries++; const i=3+Math.floor(rng()*(N-6)), j=3+Math.floor(rng()*(N-6)), h=H[j*N+i];
      if(h<1||h>4||taken.has(j*N+i)) continue; const x=i-O+0.5, z=j-O+0.5;
      if(Math.hypot(x-P.x,z-P.z)<8||this.xs.some(q=>Math.hypot(q.x-x,q.z-z)<10)||this.gems.some(g=>Math.hypot(g.x-x,g.z-z)<3)) continue;
      const g=new THREE.Group(); for(const r of [0.78,-0.78]){ const b=mk(box(1.1,0.05,0.2),lam('#d62828'),false); b.rotation.y=r; g.add(b); } g.position.set(x,h+0.03,z); sc.add(g);
      this.xs.push({g,x,z,y:h,dug:false}); }
    this.trFound=0;
    // crabes et mouettes
    this.crabs=[]; const beach=[]; for(let j=3;j<N-3;j++) for(let i=3;i<N-3;i++) if(H[j*N+i]===1&&!taken.has(j*N+i)) beach.push([i-O+0.5,j-O+0.5]);
    for(let k=0;k<6&&beach.length;k++){ const [x,z]=beach[Math.floor(rng()*beach.length)]; if(Math.hypot(x-P.x,z-P.z)<8) continue; const m=crabMesh(); m.position.set(x,1,z); sc.add(m);
      this.crabs.push({m,x,z,hx:x,hz:z,dir:rng()*TAU,t:rand(1,3),pinch:0}); }
    this.birds=[]; for(let k=0;k<5;k++){ const g=new THREE.Group(), wm2=lam('#ffffff'), b=mk(box(0.25,0.18,0.6),wm2,false); g.add(b);
      const ws=[]; for(const s of [-1,1]){ const w=new THREE.Group(); w.position.set(s*0.12,0.05,0); const p=mk(box(0.9,0.05,0.35),wm2,false); p.position.x=s*0.45; w.add(p); g.add(w); ws.push([w,s]); }
      const bk=mk(box(0.08,0.08,0.18),lam('#ffb020'),false); bk.position.z=0.38; g.add(bk); sc.add(g); this.birds.push({g,ws,r:rand(10,24),h:rand(12,18),a:rand(0,TAU),sp:rand(0.25,0.45)*(k%2?1:-1)}); }
    addClouds(this,16,[0,50],[16,28],[-50,50]);
    addAmb(this,{kind:'dust',color:'#fff3c4',size:0.12,n:120,glow:true,rel:true});
    this.bounds=[-O+1.3,O-1.3,-O+1.3,O-1.3];
    this.introS='10 gemmes, 3 trésors enfouis, avant le coucher du soleil !';
    this.c0={sky:new THREE.Color('#ffffff'),fog:new THREE.Color('#ffe6b8')};
    banner('Trouve les '+this.total+' gemmes 💎 · creuse les ❌ pour des trésors !');
  },
  query(x0,x1,y0,y1,z0,z1){
    const out=[], N=this.N, O=this.O, H=this.H;
    const i0=Math.max(0,Math.floor(x0+O)), i1=Math.min(N-1,Math.floor(x1+O)), j0=Math.max(0,Math.floor(z0+O)), j1=Math.min(N-1,Math.floor(z1+O));
    for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++) out.push({x0:i-O,x1:i-O+1,y0:-2,y1:H[j*N+i],z0:j-O,z1:j-O+1});
    for(const t of this.trees) if(t.x1>x0&&t.x0<x1&&t.z1>z0&&t.z0<z1) out.push(t);
    return out;
  },
  hgt(x,z){ const i=Math.floor(x+this.O), j=Math.floor(z+this.O); return this.Hc(i,j); },
  onAction(){
    if(this.over) return; PA.swing=0.28;
    const x=this.xs.find(q=>!q.dug&&Math.hypot(q.x-P.x,q.z-P.z)<1.6&&Math.abs(P.y-q.y)<1.5);
    if(!x){ sfx('swing'); if(this.xs.some(q=>!q.dug&&Math.hypot(q.x-P.x,q.z-P.z)<6)) banner('❌ Mets-toi sur la croix pour creuser'); return; }
    x.dug=true; this.scene.remove(x.g); sfx('brk'); burst(this.scene,x.x,x.y+0.3,x.z,'#c9a35a',16,5);
    const ch=new THREE.Group(), base=mk(box(1,0.6,0.7),lam('#8a5a2b')), lid=mk(box(1,0.25,0.7),lam('#a8763f')), band=mk(box(0.12,0.86,0.74),lam('#ffd23f'));
    base.position.y=0.3; lid.position.set(0,0.75,-0.25); lid.rotation.x=-0.9; band.position.y=0.43; ch.add(base,lid,band); ch.position.set(x.x,x.y-0.6,x.z); this.scene.add(ch); this.pops=(this.pops||[]).concat([{m:ch,y:x.y,t:0}]);
    this.trFound++; this.limit+=20; addCoins(12); sfx('win'); burst(this.scene,x.x,x.y+1,x.z,'#ffd23f',20,6,true);
    for(let k=0;k<4;k++) makeCoin(this,x.x+rand(-1,1),x.y+1.2,x.z+rand(-1,1));
    banner('💰 Trésor ! +12 🪙 et +20 secondes');
  },
  onTap(){},
  update(dt){
    if(this.time>=this.limit) return this.end(false);
    const t=this.time;
    this.water.position.y=0.62+Math.sin(t*1.3)*0.04;
    if(this.foam){ this.foam.material.opacity=0.35+Math.sin(t*1.8)*0.2; this.foam.position.y=Math.sin(t*1.3)*0.04; }
    // coucher de soleil : le ciel se réchauffe puis s'assombrit à la fin
    const u=clamp((t/this.limit-0.45)/0.55,0,1), s=this.skyM;
    if(s){ s.color.setRGB(1,lerp(1,0.62,u),lerp(1,0.5,u)); if(u>0.75){ const k=(u-0.75)/0.25; s.color.multiplyScalar(1-k*0.45); }
      this.scene.fog.color.setRGB(1,lerp(0.9,0.62,u),lerp(0.72,0.55,u)); const sn=this.scene.userData.sun, hm=this.scene.userData.hemi; if(sn) sn.color.setRGB(1,lerp(0.94,0.66,u),lerp(0.82,0.5,u)); if(hm) hm.intensity=lerp(0.66,0.48,u); }
    for(const g of this.gems){ if(g.taken) continue; g.t+=dt; g.m.rotation.y+=dt*2; g.g.position.y=g.y+Math.sin(g.t*2.4)*0.15;
      if(Math.hypot(P.x-g.x,P.y+0.9-g.y,P.z-g.z)<1.4){ g.taken=true; this.scene.remove(g.g); this.found++; addCoins(5); sfx('gem');
        burst(this.scene,g.x,g.y,g.z,g.c,14,5); if(this.found>=this.total) return this.end(true); banner('💎 '+this.found+' / '+this.total); } }
    for(const x of this.xs) if(!x.dug){ const k=1+Math.sin(t*4)*0.08; x.g.scale.set(k,1,k); }
    if(this.pops) for(const p of this.pops){ p.t=Math.min(1,p.t+dt*2.5); p.m.position.y=p.y-0.6+0.6*p.t; }
    for(const c of this.crabs){ c.t-=dt; if(c.t<=0){ c.t=rand(1.2,3); c.dir+=rand(-1.5,1.5); }
      let nx=c.x+Math.cos(c.dir)*1.2*dt, nz=c.z+Math.sin(c.dir)*1.2*dt, h=this.hgt(nx,nz);
      if(h<1||h>2||Math.hypot(nx-c.hx,nz-c.hz)>6){ c.dir+=Math.PI; } else { c.x=nx; c.z=nz; }
      const gy=Math.max(1,this.hgt(c.x,c.z)); c.m.position.set(c.x,gy,c.z); c.m.rotation.y=-c.dir; c.m.position.y+=Math.abs(Math.sin(t*14))*0.04;
      if(c.pinch>0) c.pinch-=dt;
      else if(Math.hypot(P.x-c.x,P.z-c.z)<0.8&&Math.abs(P.y-gy)<0.8&&P.inv<=0){ c.pinch=2; const dx=P.x-c.x, dz=P.z-c.z, d=Math.hypot(dx,dz)||1; P.vx=dx/d*7; P.vz=dz/d*7; P.vy=5; P.onGround=false; P.knock=0.25; P.inv=0.8; sfx('hurt'); banner('🦀 Aïe, un crabe !'); } }
    for(const b of this.birds){ b.a+=b.sp*dt; b.g.position.set(Math.cos(b.a)*b.r,b.h+Math.sin(t+b.r)*0.6,Math.sin(b.a)*b.r); b.g.rotation.y=-b.a+(b.sp>0?0:Math.PI); for(const [w,s2] of b.ws) w.rotation.z=s2*Math.sin(t*6+b.r)*0.5; }
    this.compass();
    updateCoins(this,dt,1);
  },
  compass(){
    let best=null, bd=1e9; for(const g of this.gems) if(!g.taken){ const d=Math.hypot(g.x-P.x,g.z-P.z); if(d<bd){ bd=d; best=g; } }
    if(best) pointCompass(best.x,best.z,Math.round(bd)+' m');
  },
  end(all){
    this.over=true; const t=this.time;
    if(all){ sfx('win'); confetti(this.scene,P.x,P.y+2.2,P.z); addCoins(30); } else sfx('hurt');
    let rec=false;
    if(this.found>S.best.island){ S.best.island=this.found; rec=!all; }
    if(all&&(!S.best.islandTime||t<S.best.islandTime)){ S.best.islandTime=t; rec=true; }
    save();
    showResult(all?{icon:'💎',title:'Trésor complet !',sub:'Tu as trouvé toutes les gemmes de l\'île.',stats:[['Temps',fmtTime(t)+(rec?' ⭐ Record !':'')],['Gemmes',this.found+' / '+this.total],['Trésors enfouis',this.trFound+' / 3'],['Pièces gagnées','+'+this.earned]]}
      :{icon:'🌅',title:'Le soleil est couché !',sub:'Une nouvelle île t\'attend à la prochaine partie.',stats:[['Gemmes',this.found+' / '+this.total+(rec?' ⭐':'')],['Trésors enfouis',this.trFound+' / 3'],['Pièces gagnées','+'+this.earned]]});
  },
  hud(){ const rem=this.limit-this.time; setText('hTime',fmtTime(rem)); setText('hGems',this.found+'/'+this.total); setText('hTr',this.trFound+'/3');
    const p=$('pTime'); if(p) p.classList.toggle('warn',rem<30); }
};
