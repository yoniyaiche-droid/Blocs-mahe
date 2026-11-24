/* =========================================================
   20. Turbo Bolides : course de bolides inventés dans une ville
       au coucher du soleil (turbo, dérapages, sauts, 3 tours)
   ========================================================= */
const RC_PTS=[[0,0,0],[70,0,0],[130,8,0],[170,40,4],[176,95,9],[145,135,10],[92,142,3],[62,112,0],[28,118,0],[-12,150,2],[-72,152,6],[-122,122,3],[-142,70,0],[-122,24,0],[-70,4,0]];
const RC_HW=8, RC_LAPS=3, RCT={top:33,nit:47,acc:0.8,turn:2.35};
const RC_NAMES=['Turbo Tom','Rosie Roule','Max Vroum','Lulu Klaxon','Bob Piston'];
function rcTrack(){
  const P=RC_PTS, n=P.length, fine=[];
  const cr=(a,b,c,d,t)=>{ const t2=t*t, t3=t2*t, o=[]; for(let q=0;q<3;q++) o.push(0.5*(2*b[q]+(-a[q]+c[q])*t+(2*a[q]-5*b[q]+4*c[q]-d[q])*t2+(-a[q]+3*b[q]-3*c[q]+d[q])*t3)); return o; };
  for(let i=0;i<n;i++) for(let k=0;k<120;k++) fine.push(cr(P[(i-1+n)%n],P[i],P[(i+1)%n],P[(i+2)%n],k/120));
  const L=[0]; for(let i=1;i<=fine.length;i++){ const a=fine[i-1], b=fine[i%fine.length]; L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1])); }
  const tot=L[L.length-1], N=Math.round(tot/1.2), sp=tot/N;
  const T={N,sp,tot,px:new Float32Array(N),py:new Float32Array(N),pz:new Float32Array(N),tx:new Float32Array(N),tz:new Float32Array(N),nx:new Float32Array(N),nz:new Float32Array(N),k:new Float32Array(N),cum:new Float32Array(N+1)};
  let j=0;
  for(let i=0;i<N;i++){ const d=i*sp; while(L[j+1]<d) j++; const f=(d-L[j])/(L[j+1]-L[j]), a=fine[j], b=fine[(j+1)%fine.length];
    T.px[i]=a[0]+(b[0]-a[0])*f; T.pz[i]=a[1]+(b[1]-a[1])*f; T.py[i]=Math.max(0,a[2]+(b[2]-a[2])*f); }
  for(let i=0;i<N;i++){ const a=(i-2+N)%N, b=(i+2)%N, dx=T.px[b]-T.px[a], dz=T.pz[b]-T.pz[a], l=Math.hypot(dx,dz)||1; T.tx[i]=dx/l; T.tz[i]=dz/l; T.nx[i]=-T.tz[i]; T.nz[i]=T.tx[i]; T.cum[i]=i*sp; }
  T.cum[N]=tot;
  for(let i=0;i<N;i++){ const a=(i-4+N)%N, b=(i+4)%N; let da=Math.atan2(T.tx[b],T.tz[b])-Math.atan2(T.tx[a],T.tz[a]); da=((da+Math.PI)%TAU+TAU)%TAU-Math.PI; T.k[i]=da/(8*sp); }
  return T;
}
function rcRibbon(T,oA,oB,yA,yB,vS,mat,i0,i1){
  i0=i0||0; i1=i1===undefined?T.N:i1; const M=i1-i0, pos=new Float32Array((M+1)*6), uv=new Float32Array((M+1)*4), idx=[];
  for(let k=0;k<=M;k++){ const i=(i0+k)%T.N, v=(i0+k)*T.sp/vS;
    pos[k*6]=T.px[i]+T.nx[i]*oA; pos[k*6+1]=T.py[i]+yA; pos[k*6+2]=T.pz[i]+T.nz[i]*oA;
    pos[k*6+3]=T.px[i]+T.nx[i]*oB; pos[k*6+4]=T.py[i]+yB; pos[k*6+5]=T.pz[i]+T.nz[i]*oB;
    uv[k*4]=0; uv[k*4+1]=v; uv[k*4+2]=1; uv[k*4+3]=v;
    if(k<M){ const a=k*2; idx.push(a,a+2,a+1, a+1,a+2,a+3); } }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); g.userData.own=true;
  const m=new THREE.Mesh(g,mat); m.receiveShadow=true; return m;
}
function rcTex(w,h,fn,rx,ry){ const c=makeCanvas(w,h), g=c.getContext('2d'); fn(g,w,h); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; t.isOwn=true; if(rx) t.repeat.set(rx,ry||1); return t; }
function rcOwn(m){ m.userData.own=true; return m; }
function rcCarMesh(col,style){
  const g=new THREE.Group(), body=new THREE.Group(); g.add(body); g.rotation.order='YXZ';
  const add=(geo,mat,x,y,z,par)=>{ const m=mk(geo,mat); m.position.set(x,y,z); (par||body).add(m); return m; };
  const c=matC('rcp'+col,()=>new THREE.MeshPhongMaterial({color:col,shininess:90,specular:'#ffffff'})), dk=matC('rcdk',()=>new THREE.MeshPhongMaterial({color:'#22203a',shininess:40}));
  const glass=matC('rcgl',()=>new THREE.MeshPhongMaterial({color:'#20304f',emissive:'#0a1430',shininess:120,specular:'#ffffff'}));
  add(box(2.0,0.32,4.3),dk,0,0.4,0);
  if(style===1){ add(box(2.05,0.62,1.75),c,0,0.86,1.15); add(box(2.05,0.62,1.4),c,0,0.86,-1.4); add(box(0.14,0.5,1.4),c,0.98,0.8,-0.05); add(box(0.14,0.5,1.4),c,-0.98,0.8,-0.05);
    add(box(0.9,0.14,1.2),dk,0,1.2,1.2); add(box(2.1,0.12,0.42),dk,0,1.3,-2.0); for(const s of [-1,1]) add(box(0.12,0.3,0.12),dk,s*0.85,1.12,-2.0);
    const w=add(box(1.85,0.5,0.08),glass,0,1.3,0.32); w.rotation.x=-0.35; for(const s of [-1,1]) add(box(0.36,0.1,0.5),lam('#ffffff'),s*0.5,1.18,1.25); }
  else if(style===2){ add(box(1.6,0.5,1.9),c,0,0.78,1.1); add(box(2.2,0.18,1.0),c,0,0.62,1.55); add(box(1.8,0.56,1.6),c,0,0.82,-1.3);
    for(const s of [-1,1]){ add(box(0.4,0.42,1.3),c,s*1.1,0.66,-1.3); add(box(0.4,0.36,1.1),c,s*1.05,0.64,1.25); }
    const bub=add(sph(0.62),glass,0,1.16,0.35); bub.scale.set(1.2,0.6,1.5); add(box(0.5,0.62,0.12),c,0,1.36,-1.7); add(box(2.4,0.08,0.5),c,0,1.68,-1.75); }
  else { add(box(1.9,0.44,1.8),c,0,0.76,1.15); add(box(1.55,0.2,1.2),c,0,1.0,1.05); add(box(1.9,0.52,1.5),c,0,0.78,-1.3);
    for(const s of [-1,1]) add(box(0.12,0.42,1.2),c,s*0.93,0.76,0);
    add(box(2.15,0.08,0.52),dk,0,1.3,-1.9); for(const s of [-1,1]) add(box(0.1,0.34,0.1),dk,s*0.8,1.1,-1.9);
    const w=add(box(1.6,0.45,0.08),glass,0,1.1,0.42); w.rotation.x=-0.55; add(box(0.3,0.06,2.2),lam('#ffffff'),0,1.11,0.9); }
  const hl=matC('rchl',()=>new THREE.MeshBasicMaterial({color:'#fffbe8'})), tl=matC('rctl',()=>new THREE.MeshBasicMaterial({color:'#ff2a4a'}));
  for(const s of [-1,1]){ add(box(0.46,0.18,0.06),hl,s*0.62,0.78,2.16); add(box(0.5,0.16,0.06),tl,s*0.62,0.82,-2.08); }
  const wh=[];
  for(const [x,z] of [[1.0,1.3],[-1.0,1.3],[1.0,-1.35],[-1.0,-1.35]]){ const pv=new THREE.Group(); pv.position.set(x,0.44,z); g.add(pv);
    const sp=new THREE.Group(); pv.add(sp); const w=mk(cyl(0.44,0.44,0.36,16),lam('#1f1d2b')); w.rotation.z=Math.PI/2; sp.add(w);
    const rim=mk(cyl(0.26,0.26,0.38,6),lam('#dfe4ee')); rim.rotation.z=Math.PI/2; sp.add(rim); wh.push({pv,sp,front:z>0}); }
  const um=rcOwn(new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));
  const ug=new THREE.Mesh(geoC('rcug',()=>new THREE.PlaneGeometry(2.8,5)),um); ug.rotation.x=-Math.PI/2; ug.position.y=0.08; g.add(ug);
  const fm=matC('rcfl',()=>new THREE.MeshBasicMaterial({color:'#8fe3ff'})), fl=[];
  for(const s of [-1,1]){ const f=mk(cone(0.17,1.0,8),fm,false); f.rotation.x=-Math.PI/2; f.position.set(s*0.5,0.55,-2.6); f.visible=false; g.add(f); fl.push(f); }
  return {g,body,wh,fl};
}
GAMES.race={
  hint:'← → ou A D : tourner · ↓ : freiner · Espace : déraper · E : turbo',
  hudHTML:'<div class="pill">🏁 <b id="rcLap">1/3</b></div><div class="pill">🏆 <b id="rcPos">-</b></div><div class="pill">⏱ <b id="rcTime">0:00</b></div>',
  far:480, bloom:0.55, bloomTh:0.74,
  start(){
    const sc=this.scene; setupScene(sc,'#2b3a8f','#ffc89a',80,420);
    addSky(this,{top:'#27306f',mid:'#ff8a65',bot:'#ffd6a0',under:'#ff9e7a',sun:{u:0.22,el:7,r:30,c:'#fff3c8',glow:'rgba(255,150,90,.9)',gl:9},skyline:{c:'#4a2f63',win:['#ffd27a','#ff9f6b','#ffe8b0']},near:90,far:430});
    setLights(this,{hemi:['#ffd9c0','#5a4a80',0.6],sun:['#ffb878',0.95],dir:[-34,26,-20]});
    this.frozen=true; this.phase='pick'; this.T=rcTrack(); const T=this.T, N=T.N;
    this.build(); this.mkPickups();
    // voiture du joueur sur la grille
    const g0=N-10; this.car={i:g0,x:T.px[g0]+T.nx[g0]*2.5,z:T.pz[g0]+T.nz[g0]*2.5,y:T.py[g0],vy:0,h:Math.atan2(T.tx[g0],T.tz[g0]),vh:0,spd:0,lap:0,cp:true,nitT:0,drift:false,dDir:0,air:false,wallT:0,stuck:0,wrong:0,pitch:0,roll:0,airT:0,lapT:0,best:0,ry:T.py[g0],prevRy:T.py[g0],off:0,al:0};
    this.car.vh=this.car.h; this.nitro=0.34; this.td=0; this.shake=0; this.raceT=0; this.cnt=0; this.btn={}; this.done=false; this.skT=0; this.mapBg=null;
    this.ais=[];
    for(let k=0;k<5;k++){ const gi=N-16-k*7, side=k%2?2.5:-2.5, av=randomAvatar(), A=makeAvatar(av,'🤖 '+RC_NAMES[k],{}); A.root.scale.setScalar(0.72); A.sit=true; A.root.rotation.order='YXZ'; sc.add(A.root);
      const car=rcCarMesh(['#ff4f8b','#3ad17a','#ffd23f','#2ec4b6','#ff9f1c'][k],k%3); sc.add(car.g);
      this.ais.push({n:RC_NAMES[k],A,car,s:gi-N,o:side,to:side,spd:0,base:0.9+k*0.025+rand(0,0.03),y:T.py[gi],vy:0,crash:0,nT:rand(6,12),nit:0,laneT:rand(2,5),fin:0,h:0,x:0,z:0}); }
    this.mkSkids();
    cam.dist=9;
    $('bAct').textContent='🔥';
    gxSet('<div id="rcLines"></div><canvas id="rcMap" width="240" height="180" style="top:116px;right:10px"></canvas>'+
      '<div id="rcSpd" style="left:50%;bottom:16px"><b id="rcKmh">0</b><span>km/h</span><div class="rcBar"><i id="rcNit"></i></div></div>'+
      '<button class="rbtn" data-k="nitro" style="right:18px;bottom:30px" aria-label="Turbo">🔥</button><button class="rbtn sm" data-k="drift" style="right:110px;bottom:34px" aria-label="Déraper">🌀</button>');
    this.fp=true; this.placeCar(); this.placeAIs(0);
    heroPick(this,'race',h=>this.chosen(h));
  },
  chosen(h){
    this.fp=false; PA.root.scale.setScalar(0.72); PA.sit=true; PA.root.rotation.order='YXZ';
    this.pcar=rcCarMesh(h.car.c,h.car.s); this.scene.add(this.pcar.g);
    this.phase='count'; this.cnt=3.6; this.lastC=4; banner('Prêt ?'); engineStart('car'); try{ VSND.start.car(); }catch(e){}
  },
  build(){
    const sc=this.scene, T=this.T, N=T.N, rnd=mulberry32(77);
    const road=rcTex(128,256,(g,w,h)=>{ g.fillStyle='#3a3848'; g.fillRect(0,0,w,h); for(let i=0;i<2600;i++){ const v=40+Math.random()*40; g.fillStyle='rgba('+v+','+v+','+(v+12)+',.5)'; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
      g.fillStyle='#f4f1ea'; g.fillRect(4,0,4,h); g.fillRect(w-8,0,4,h); g.fillStyle='#ffd23f'; g.fillRect(w/2-2,0,4,h*0.55); });
    sc.add(rcRibbon(T,RC_HW,-RC_HW,0,0,10,rcOwn(new THREE.MeshLambertMaterial({map:road}))));
    const curb=rcTex(16,64,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); g.fillStyle='#e63946'; g.fillRect(0,0,w,h/2); });
    const cm=rcOwn(new THREE.MeshLambertMaterial({map:curb}));
    sc.add(rcRibbon(T,RC_HW+1.3,RC_HW,0.04,0.04,3,cm)); sc.add(rcRibbon(T,-RC_HW,-RC_HW-1.3,0.04,0.04,3,cm));
    const wall=rcTex(32,256,(g,w,h)=>{ const cols=['#4f7bff','#ff4f8b','#ffd23f','#3ad17a']; for(let i=0;i<8;i++){ g.fillStyle=cols[i%4]; g.fillRect(0,i*h/8,w,h/8); g.fillStyle='rgba(255,255,255,.85)';
        g.beginPath(); g.moveTo(w*0.35,i*h/8+6); g.lineTo(w*0.7,i*h/8+h/16); g.lineTo(w*0.35,(i+1)*h/8-6); g.lineTo(w*0.5,i*h/8+h/16); g.fill(); } g.fillStyle='#ffffff'; g.fillRect(w*0.86,0,w*0.14,h); g.fillStyle='#3a3550'; g.fillRect(0,0,w*0.3,h); });
    const wm=rcOwn(new THREE.MeshLambertMaterial({map:wall,side:THREE.DoubleSide}));
    for(const s of [1,-1]) sc.add(rcRibbon(T,s*(RC_HW+1.4),s*(RC_HW+1.4),-1.2,1.3,24,wm));
    // ligne d'arrivée, arche et grille de départ
    const chk=rcTex(64,16,(g,w,h)=>{ for(let x=0;x<8;x++) for(let y=0;y<2;y++){ g.fillStyle=(x+y)%2?'#1d1846':'#ffffff'; g.fillRect(x*8,y*8,8,8); } });
    const fin=rcRibbon(T,RC_HW,-RC_HW,0.03,0.03,2.4,rcOwn(new THREE.MeshLambertMaterial({map:chk})),0,2); sc.add(fin);
    { const a=Math.atan2(T.tx[1],T.tz[1]), arch=new THREE.Group(); arch.position.set(T.px[1],T.py[1],T.pz[1]); arch.rotation.y=a; sc.add(arch);
      const pm=lam('#2b2d42'); for(const s of [-1,1]){ const p=mk(box(1.2,9,1.2),pm); p.position.set(s*(RC_HW+2.2),4.5,0); arch.add(p); }
      const cm2=rcOwn(new THREE.MeshLambertMaterial({map:rcTex(64,16,(g,w,h)=>{ for(let x=0;x<16;x++) for(let y=0;y<4;y++){ g.fillStyle=(x+y)%2?'#1d1846':'#ffffff'; g.fillRect(x*4,y*4,4,4); } })}));
      const beam=mk(box(2*(RC_HW+2.2)+1.2,1.8,1.2),cm2); beam.position.y=9.2; arch.add(beam);
      const lm=matC('rclamp',()=>new THREE.MeshBasicMaterial({color:'#fff1b8'})); for(let i=0;i<9;i++){ const b=mk(sph(0.22),lm,false); b.position.set(-RC_HW-1+i*(2*RC_HW+2)/8,8.1,0.62); arch.add(b); }
      const sg=textSprite(512,128,3); setSprite(sg,'🏁 TURBO BOLIDES 🏁','rgba(29,24,70,.88)','#ffd23f'); sg.position.set(0,11.6,0); arch.add(sg); }
    // sol, plage et mer
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(700,420),texMat('grass','#c8e6a8',100,60)); gr.geometry.userData.own=true; gr.rotation.x=-Math.PI/2; gr.position.set(15,-0.06,165); gr.receiveShadow=true; sc.add(gr);
    const sd=new THREE.Mesh(new THREE.PlaneGeometry(700,40),texMat('sand','#ffe2b0',90,6)); sd.geometry.userData.own=true; sd.rotation.x=-Math.PI/2; sd.position.set(15,-0.08,-65); sd.receiveShadow=true; sc.add(sd);
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(2400,1200),rcOwn(new THREE.MeshLambertMaterial({color:'#3a6fd0',emissive:'#3a1f5a',emissiveIntensity:0.35}))); sea.geometry.userData.own=true; sea.rotation.x=-Math.PI/2; sea.position.set(15,-0.4,-690); sc.add(sea);
    // occupation du terrain (pour placer immeubles, palmiers, lampadaires)
    const X0=-260, Z0=-40, CS=5, GW=120, GH=64, occ=new Uint8Array(GW*GH), cell=(x,z)=>{ const i=Math.floor((x-X0)/CS), j=Math.floor((z-Z0)/CS); return i<0||j<0||i>=GW||j>=GH?-1:j*GW+i; };
    for(let i=0;i<N;i+=2){ for(let dx=-17;dx<=17;dx+=CS) for(let dz=-17;dz<=17;dz+=CS){ if(dx*dx+dz*dz>17*17) continue; const c=cell(T.px[i]+dx,T.pz[i]+dz); if(c>=0) occ[c]=1; } }
    const free=(x,z,w,d)=>{ if(z-d/2<-22) return false; for(let a=x-w/2-2;a<=x+w/2+2;a+=CS/2) for(let b=z-d/2-2;b<=z+d/2+2;b+=CS/2){ const c=cell(a,b); if(c<0||occ[c]) return false; } return true; };
    const mark=(x,z,w,d)=>{ for(let a=x-w/2;a<=x+w/2;a+=CS/2) for(let b=z-d/2;b<=z+d/2;b+=CS/2){ const c=cell(a,b); if(c>=0) occ[c]=1; } };
    // immeubles (instanciés par façade)
    const F=[['#e8d5c4','#4a6a9a',5],['#c98b6b','#3a4f7a',5],['#9aa7c7','#2f3f6a',12],['#e0b0c8','#4a3f7a',12],['#b6d0c0','#2f4f5a',8],['#f0e0a0','#5a4a6a',8]];
    const bl=F.map(()=>[]);
    for(let ring=0;ring<3;ring++) for(let i=0;i<N;i+=6) for(const s of [1,-1]){
      const d=RC_HW+12+ring*20+rnd()*10, x=T.px[i]+T.nx[i]*d*s, z=T.pz[i]+T.nz[i]*d*s, w=8+rnd()*6, dp=8+rnd()*6;
      if(!free(x,z,w,dp)) continue; const tall=ring>0&&rnd()<0.6, k=tall?(rnd()<0.5?2:3):(rnd()<0.5?(rnd()<0.5?0:1):(rnd()<0.5?4:5)), h=k<2?10+rnd()*8:k<4?24+rnd()*22:16+rnd()*8;
      bl[k].push([x,z,w,h,dp,Math.atan2(T.tx[i],T.tz[i])]); mark(x,z,w,dp); }
    const mtx=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), sv=new THREE.Vector3(), up=new THREE.Vector3(0,1,0), roofM=rcOwn(new THREE.MeshLambertMaterial({color:'#5a5470'}));
    this.tallest=[];
    F.forEach(([col,win,fl],k)=>{ if(!bl[k].length) return; const cv=makeCanvas(64,128), g=cv.getContext('2d'), ev=makeCanvas(64,128), ge=ev.getContext('2d');
      g.fillStyle=col; g.fillRect(0,0,64,128); ge.fillStyle='#000'; ge.fillRect(0,0,64,128); const rh=128/fl;
      for(let r=0;r<fl;r++) for(let c=0;c<4;c++){ const on=rnd()<0.42, x=c*16+3, y=r*rh+3; g.fillStyle=on?'#ffe2a8':win; g.fillRect(x,y,10,rh-6); if(on){ ge.fillStyle='#ffffff'; ge.fillRect(x,y,10,rh-6); } }
      const mt=new THREE.CanvasTexture(cv), et=new THREE.CanvasTexture(ev); mt.isOwn=et.isOwn=true; mt.anisotropy=4;
      const fm=rcOwn(new THREE.MeshLambertMaterial({map:mt,emissiveMap:et,emissive:'#ffb866',emissiveIntensity:0.95}));
      const im=new THREE.InstancedMesh(box(1,1,1),[fm,fm,roofM,roofM,fm,fm],bl[k].length);
      bl[k].forEach(([x,z,w,h,d,a],n)=>{ q.setFromAxisAngle(up,a); mtx.compose(v.set(x,h/2,z),q,sv.set(w,h,d)); im.setMatrixAt(n,mtx); if(h>30) this.tallest.push([x,z,w,h,d,a]); });
      im.instanceMatrix.needsUpdate=true; im.castShadow=true; im.receiveShadow=true; sc.add(im); });
    // enseignes lumineuses sur les toits
    const signs=['⚡ VOLT','🍩 DONUTS','TURBO !','BLOCS MAHÉ','🌴 PLAGE','VROUM'];
    this.tallest.slice(0,6).forEach(([x,z,w,h,d,a],i)=>{ const s=textSprite(512,128,4); setSprite(s,signs[i],'rgba(20,10,40,.85)',['#ff4fd8','#2bffd5','#ffd23f','#ff8f5a','#8fd0ff','#b8ff6a'][i]); s.position.set(x,h+2.6,z); sc.add(s); });
    // lampadaires (instanciés)
    const lp=[]; for(let i=0;i<N;i+=22){ const s=(i/22)%2?1:-1; lp.push([T.px[i]+T.nx[i]*s*(RC_HW+2.4),T.py[i],T.pz[i]+T.nz[i]*s*(RC_HW+2.4),T.px[i]+T.nx[i]*s*(RC_HW-0.3),T.pz[i]+T.nz[i]*s*(RC_HW-0.3)]); }
    const poles=new THREE.InstancedMesh(box(0.28,1,0.28),lam('#2b2d42'),lp.length*2), bulbs=new THREE.InstancedMesh(sph(0.42),matC('rcbulb',()=>new THREE.MeshBasicMaterial({color:'#fff3c4'})),lp.length);
    lp.forEach(([x,y,z,bx,bz],n)=>{ mtx.compose(v.set(x,y+3.5-1.2,z),q.identity(),sv.set(1,9.4,1)); poles.setMatrixAt(n*2,mtx);
      const a=Math.atan2(bx-x,bz-z), L=Math.hypot(bx-x,bz-z); q.setFromAxisAngle(up,a); mtx.compose(v.set((x+bx)/2,y+8.1,(z+bz)/2),q,sv.set(1,0.25,L)); poles.setMatrixAt(n*2+1,mtx);
      mtx.compose(v.set(bx,y+7.8,bz),q.identity(),sv.set(1,0.7,1)); bulbs.setMatrixAt(n,mtx); });
    [poles,bulbs].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.frustumCulled=false; sc.add(m); }); poles.castShadow=true;
    // piliers sous les ponts
    const pil=[]; for(let i=0;i<N;i+=9) if(T.py[i]>1.4) for(const s of [1,-1]) pil.push([T.px[i]+T.nx[i]*s*(RC_HW-1.2),T.py[i],T.pz[i]+T.nz[i]*s*(RC_HW-1.2)]);
    if(pil.length){ const pm=new THREE.InstancedMesh(cyl(0.7,0.8,1,10),texC('stone','#d8d0e8'),pil.length); pil.forEach(([x,y,z],n)=>{ mtx.compose(v.set(x,(y-1.2)/2,z),q.identity(),sv.set(1,Math.max(0.1,y-1.2),1)); pm.setMatrixAt(n,mtx); }); pm.instanceMatrix.needsUpdate=true; pm.castShadow=true; sc.add(pm); }
    // palmiers (troncs et feuilles instanciés) sur la plage et dans les parcs
    const pal=[]; for(let x=-230;x<260;x+=13+rnd()*8) pal.push([x,-28-rnd()*12,6+rnd()*4]);
    for(let t=0;t<260&&pal.length<90;t++){ const x=-200+rnd()*420, z=-10+rnd()*220, c=cell(x,z); if(c>=0&&!occ[c]){ pal.push([x,z,6+rnd()*4]); occ[c]=1; } }
    const tr=new THREE.InstancedMesh(box(0.5,1,0.5),lam('#a8763f'),pal.length), lf=new THREE.InstancedMesh(box(3.0,0.12,0.8),lam('#2f9e48'),pal.length*6);
    pal.forEach(([x,z,h],n)=>{ mtx.compose(v.set(x,h/2,z),q.identity(),sv.set(1,h,1)); tr.setMatrixAt(n,mtx);
      for(let k=0;k<6;k++){ const a=k/6*TAU+n; q.setFromEuler(new THREE.Euler(0,a,-0.35,'YXZ')); mtx.compose(v.set(x+Math.cos(a)*0,h,z),q,sv.set(1,1,1)); const o=new THREE.Matrix4().makeTranslation(1.3,0,0); mtx.multiply(o); lf.setMatrixAt(n*6+k,mtx); } });
    [tr,lf].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.castShadow=true; m.frustumCulled=false; sc.add(m); });
    addClouds(this,10,[60,220],[60,90],[-120,260]);
  },
  mkPickups(){
    const T=this.T, N=T.N; this.picks=[];
    const nm=matC('rcnit',()=>new THREE.MeshLambertMaterial({color:'#4fd8ff',emissive:'#1aa0d0'}));
    for(const i of [70,190,300,430,560,640]) for(const o of [-4,4]){ if(i>=N) continue; const g=new THREE.Group(); const c=mk(cyl(0.4,0.4,1.1,12),nm); c.position.y=1.2; g.add(c); const cap=mk(cyl(0.22,0.22,0.3,10),lam('#ffffff')); cap.position.y=1.9; g.add(cap);
      g.position.set(T.px[i]+T.nx[i]*o,T.py[i],T.pz[i]+T.nz[i]*o); this.scene.add(g); this.picks.push({g,k:'n',x:g.position.x,z:g.position.z,y:T.py[i],on:true}); }
    for(const i0 of [35,150,250,370,500,600]) for(let k=0;k<5;k++){ const i=(i0+k*3)%N, o=Math.sin(k*0.9)*3; const g=new THREE.Group(); const m=mk(cyl(0.45,0.45,0.1,16),coinMat()); m.rotation.x=Math.PI/2; m.position.y=1.2; g.add(m);
      g.position.set(T.px[i]+T.nx[i]*o,T.py[i],T.pz[i]+T.nz[i]*o); this.scene.add(g); this.picks.push({g,k:'c',x:g.position.x,z:g.position.z,y:T.py[i],on:true}); }
  },
  mkSkids(){ const m=rcOwn(new THREE.MeshBasicMaterial({color:'#15131f',transparent:true,opacity:0.45,depthWrite:false})); this.skids=[]; this.skI=0;
    for(let i=0;i<70;i++){ const s=new THREE.Mesh(geoC('rcsk',()=>new THREE.PlaneGeometry(0.34,1.0)),m); s.rotation.order='YXZ'; s.rotation.x=-Math.PI/2; s.visible=false; this.scene.add(s); this.skids.push(s); } },
  // position sur la piste : indice le plus proche, décalage latéral et hauteur de la route
  trackAt(o,x,z){
    const T=this.T, N=T.N; let bi=o.i, bd=1e9;
    for(let d=-30;d<=30;d++){ const i=((o.i+d)%N+N)%N, dx=x-T.px[i], dz=z-T.pz[i], q=dx*dx+dz*dz; if(q<bd){ bd=q; bi=i; } }
    o.i=bi; const dx=x-T.px[bi], dz=z-T.pz[bi]; o.al=dx*T.tx[bi]+dz*T.tz[bi]; o.off=dx*T.nx[bi]+dz*T.nz[bi];
    const j=o.al>=0?(bi+1)%N:(bi-1+N)%N, f=Math.min(1,Math.abs(o.al)/T.sp); o.ry=T.py[bi]+(T.py[j]-T.py[bi])*f;
    return bi;
  },
  useNitro(){ const c=this.car; if(this.phase!=='race'||this.nitro<0.3) { if(this.phase==='race'){ sfx('nope'); } return; }
    const full=this.nitro>=0.99; this.nitro-=full?this.nitro:0.33; c.nitT=Math.max(c.nitT,0)+(full?4:2.3)*(this.pk.nitro||1); c.full=full; sfx('boing'); if(full) banner('🔥 SUPER TURBO !'); },
  onAction(){ this.useNitro(); },
  onKey(code){ if(code==='KeyN') this.useNitro(); },
  onBtn(k,on){ if(k==='nitro'&&on) this.useNitro(); if(k==='drift') this.btn.drift=on; },
  update(dt){
    const T=this.T, N=T.N, c=this.car;
    P.onGround=true; P.vx=P.vz=0;
    if(this.phase==='pick'){ this.placeAIs(dt); return; }
    if(this.phase==='count'){ this.cnt-=dt; const n=Math.ceil(this.cnt-0.6);
      if(n!==this.lastC&&n>=0){ this.lastC=n; if(n>0){ banner(String(n)); tone(440,440,0.18,'square',0.06); } else { banner('🏁 PARTEZ !'); tone(880,880,0.4,'square',0.07); this.phase='race'; } } }
    const racing=this.phase==='race'||this.phase==='done';
    if(this.phase==='race') this.raceT+=dt;
    // ---- commandes ----
    const auto=this.phase==='done';
    let st=auto?0:clamp(inp.x,-1,1); const brake=!auto&&inp.y<-0.5, dHeld=!auto&&(this.btn.drift||keys.has('Space')||keys.has('ShiftLeft')||keys.has('ShiftRight'));
    if(auto){ const ta=Math.atan2(T.tx[(c.i+8)%N],T.tz[(c.i+8)%N]); let d=((ta-c.h+Math.PI)%TAU+TAU)%TAU-Math.PI; st=clamp(-d*2.5-c.off*0.05,-1,1); }
    // ---- vitesse ----
    const pk=this.pk||{}; let tgt=racing?RCT.top*(pk.top||1):0;
    if(c.nitT>0){ tgt=RCT.nit*(pk.top||1)*(c.full?1.08:1); c.nitT-=dt; if(c.nitT<=0) c.full=false; }
    if(brake) tgt=Math.min(tgt,9); if(c.drift) tgt*=0.94; if(auto) tgt=RCT.top*0.7;
    const ak=tgt>c.spd?(c.nitT>0?2.4:RCT.acc):(brake?2.6:0.9); c.spd+=(tgt-c.spd)*Math.min(1,ak*dt);
    // ---- direction et dérapage ----
    const sf=clamp(c.spd/10,0,1), tr=RCT.turn*(pk.grip||1)*(1-Math.min(0.3,c.spd/140));
    if(!c.air) c.h-=st*tr*sf*dt*(c.drift?1.5:1);
    const want=dHeld&&Math.abs(st)>0.25&&c.spd>14&&!c.air;
    if(want&&!c.drift){ c.drift=true; c.dDir=Math.sign(st); tone(300,180,0.25,'sawtooth',0.03); }
    if(c.drift&&(!dHeld||c.spd<10||Math.abs(st)<0.1)){ c.drift=false; }
    c.vh=angLerp(c.vh,c.h,Math.min(1,(c.drift?1.9:9)*dt));
    if(c.drift){ this.nitro=Math.min(1,this.nitro+dt*0.3); this.skT-=dt; if(this.skT<=0){ this.skT=0.05; this.skidMark(); } }
    c.x+=Math.sin(c.vh)*c.spd*dt; c.z+=Math.cos(c.vh)*c.spd*dt;
    // ---- murs ----
    this.trackAt(c,c.x,c.z); const lim=RC_HW-1.15;
    if(Math.abs(c.off)>lim){ const s=Math.sign(c.off), i=c.i; c.off=s*lim; c.x=T.px[i]+T.tx[i]*c.al+T.nx[i]*c.off; c.z=T.pz[i]+T.tz[i]*c.al+T.nz[i]*c.off;
      const ta=Math.atan2(T.tx[i],T.tz[i]); c.h=angLerp(c.h,ta,0.3); c.vh=angLerp(c.vh,ta,0.5);
      if(this.time>c.wallT){ c.wallT=this.time+0.3; c.spd*=0.88; this.shake=0.35; sfx('hit'); burst(this.scene,c.x+T.nx[i]*s*1.1,c.y+0.7,c.z+T.nz[i]*s*1.1,'#ffd23f',8,5,true); } }
    // ---- hauteur, sauts ----
    const prevAir=c.air; c.vy-=30*dt; c.y+=c.vy*dt;
    if(c.y<=c.ry){ if(c.air&&c.airT>0.45){ this.shake=0.4; sfx('boom'); this.nitro=Math.min(1,this.nitro+0.12); if(c.airT>0.8) banner('🦘 Super saut !'); } c.vy=Math.max(c.vy,(c.ry-c.prevRy)/Math.max(dt,1e-3)); if(c.vy<0) c.vy=0; c.y=c.ry; c.air=false; c.airT=0; }
    else if(c.y>c.ry+0.12){ c.air=true; c.airT+=dt; this.nitro=Math.min(1,this.nitro+dt*0.25); }
    c.prevRy=c.ry;
    // ---- tours et rang ----
    const pi=c.pi===undefined?c.i:c.pi;
    if(c.i>=N*0.45&&c.i<=N*0.55) c.cp=true;
    if(pi>N*0.8&&c.i<N*0.2&&c.cp){ c.lap++; c.cp=false;
      if(c.lap>1){ const lt=this.raceT-c.lapT; if(!c.best||lt<c.best) c.best=lt; } c.lapT=this.raceT;
      for(const p of this.picks) p.on=true;
      if(c.lap===RC_LAPS) banner('🔔 Dernier tour !'); else if(c.lap>1&&c.lap<=RC_LAPS) banner('🏁 Tour '+c.lap+' / '+RC_LAPS);
      if(c.lap>RC_LAPS&&this.phase==='race') this.finish(); }
    if(pi<N*0.2&&c.i>N*0.8){ c.lap--; c.cp=true; }
    c.pi=c.i;
    // ---- coincé ou à l'envers ----
    if(this.phase==='race'){ const ta=Math.atan2(T.tx[c.i],T.tz[c.i]), dd=Math.abs(((c.h-ta+Math.PI)%TAU+TAU)%TAU-Math.PI);
      c.wrong=dd>2.1?c.wrong+dt:0; if(c.wrong>1.2&&c.wrong-dt<=1.2) banner('↩️ Mauvais sens : fais demi-tour !');
      c.stuck=c.spd<3?c.stuck+dt:0; if(c.wrong>4||c.stuck>3) this.respawn(); }
    // ---- ramassage ----
    for(const p of this.picks){ if(!p.on) continue; if(Math.hypot(p.x-c.x,p.z-c.z)<2.4&&Math.abs(p.y-c.y)<3){ p.on=false;
      if(p.k==='n'){ this.nitro=Math.min(1,this.nitro+0.34); sfx('gem'); burst(this.scene,p.x,p.y+1.2,p.z,'#4fd8ff',8,4,true); } else { addCoins(1); sfx('coin'); } } }
    for(const p of this.picks){ p.g.visible=p.on; if(p.on) p.g.rotation.y+=dt*2.5; }
    // ---- adversaires ----
    this.placeAIs(dt);
    this.placeCar();
    // ---- effets ----
    if(c.drift){ const rx=c.x-Math.sin(c.h)*1.8, rz=c.z-Math.cos(c.h)*1.8; if(Math.random()<0.5) burst(this.scene,rx+rand(-0.8,0.8),c.y+0.3,rz,'#d8d4e8',1,1.5); }
    if(c.nitT>0&&Math.random()<0.4) burst(this.scene,c.x-Math.sin(c.h)*2.8,c.y+0.6,c.z-Math.cos(c.h)*2.8,'#8fe3ff',1,2,true);
    engineSet(clamp(c.spd/RCT.nit,0,1)); this.shake=Math.max(0,this.shake-dt*1.6);
  },
  placeCar(){
    const c=this.car, T=this.T, pc=this.pcar;
    if(!c.air){ const N=T.N, a=(c.i+3)%N, b=(c.i-3+N)%N; c.pitch=lerp(c.pitch,-Math.atan2(T.py[a]-T.py[b],6*T.sp),0.3); }
    else c.pitch=lerp(c.pitch,-Math.atan2(c.vy,Math.max(8,c.spd))*0.5,0.1);
    const slip=((c.h-c.vh+Math.PI)%TAU+TAU)%TAU-Math.PI; c.roll=lerp(c.roll,clamp(-slip*0.35+(inp.x||0)*0.04,-0.12,0.12),0.15);
    if(pc){ pc.g.position.set(c.x,c.y,c.z); pc.g.rotation.set(c.pitch,c.h,c.roll);
      for(const w of pc.wh){ w.sp.rotation.x+=c.spd*0.05; if(w.front) w.pv.rotation.y=-(inp.x||0)*0.45; }
      for(const f of pc.fl){ f.visible=c.nitT>0; f.scale.set(1,c.full?1.7:1+Math.random()*0.5,1); } }
    // le héros est assis dans le bolide
    const sx=-0.25; P.x=c.x+Math.sin(c.h)*sx; P.z=c.z+Math.cos(c.h)*sx; P.y=c.y+0.46; P.yaw=c.h;
  },
  placeAIs(dt){
    const T=this.T, N=T.N, c=this.car, pprog=this.prog();
    for(const a of this.ais){
      if(this.phase==='race'||this.phase==='done'){
        const i=((Math.floor(a.s)%N)+N)%N; let km=0; for(let d=0;d<30;d+=3) km=Math.max(km,Math.abs(T.k[(i+d)%N]));
        let tgt=RCT.top*a.base*clamp(1-km*3.5,0.72,1); const dp=pprog-a.s;
        if(dp>45) tgt*=1.12; else if(dp<-70) tgt*=0.9;
        a.nT-=dt; if(a.nT<=0){ a.nT=rand(7,14); a.nit=2; } if(a.nit>0){ a.nit-=dt; tgt*=1.3; }
        if(a.crash>0){ a.crash-=dt; tgt*=0.25; }
        a.spd+=(tgt-a.spd)*Math.min(1,0.8*dt);
        a.laneT-=dt; if(a.laneT<=0){ a.laneT=rand(2.5,5.5); a.to=rand(-5.2,5.2); }
        a.o+=(a.to-a.o)*Math.min(1,1.5*dt);
        a.s+=a.spd*dt/T.sp;
        if(!a.fin&&a.s>=RC_LAPS*N){ a.fin=this.raceT||1; }
      }
      const i=((Math.floor(a.s)%N)+N)%N, j=(i+1)%N, f=a.s-Math.floor(a.s);
      a.x=lerp(T.px[i],T.px[j],f)+T.nx[i]*a.o; a.z=lerp(T.pz[i],T.pz[j],f)+T.nz[i]*a.o; const ry=lerp(T.py[i],T.py[j],f);
      a.vy-=30*dt; a.y+=a.vy*dt; if(a.y<=ry){ a.vy=Math.max(0,(ry-(a.pry===undefined?ry:a.pry))/Math.max(dt,1e-3)); a.y=ry; } a.pry=ry;
      a.h=Math.atan2(T.tx[i],T.tz[i])+(a.crash>0?a.crash*5:0);
      a.car.g.position.set(a.x,a.y,a.z); a.car.g.rotation.set(0,a.h,0);
      for(const w of a.car.wh) w.sp.rotation.x+=a.spd*0.05;
      for(const fl of a.car.fl) fl.visible=a.nit>0;
      a.A.root.position.set(a.x-Math.sin(a.h)*0.25,a.y+0.46,a.z-Math.cos(a.h)*0.25); a.A.root.rotation.set(0,a.h,0); animAvatar(a.A,dt,0,true);
    }
    // les bolides se poussent ; foncer dans un adversaire le fait déraper
    if(this.phase==='race') for(const a of this.ais){ const dx=a.x-c.x, dz=a.z-c.z, d=Math.hypot(dx,dz);
      if(d<2.5&&d>0.01&&Math.abs(a.y-c.y)<2){ const i=((Math.floor(a.s)%N)+N)%N, push=(2.5-d)/2, lat=(dx*T.nx[i]+dz*T.nz[i])/d;
        a.o=clamp(a.o+lat*push,-RC_HW+1.2,RC_HW-1.2); c.x-=dx/d*push; c.z-=dz/d*push;
        const rel=c.spd-a.spd, fwd=(dx*Math.sin(c.vh)+dz*Math.cos(c.vh))/d;
        if(rel>4&&fwd>0.3&&a.crash<=0){ a.crash=2.2; a.spd*=0.5; this.td++; this.nitro=Math.min(1,this.nitro+0.35); this.shake=0.5; addCoins(2); sfx('boom'); burst(this.scene,a.x,a.y+1,a.z,'#ffd23f',14,6,true); banner('💥 '+a.n+' a dérapé !'); }
        else if(this.time>(a.hitT||0)){ a.hitT=this.time+0.4; c.spd*=0.97; sfx('hit'); } } }
    for(let x=0;x<this.ais.length;x++) for(let y=x+1;y<this.ais.length;y++){ const a=this.ais[x], b=this.ais[y];
      if(Math.abs(a.s-b.s)<4&&Math.abs(a.o-b.o)<2.4){ const s=a.o<b.o?-1:1; a.to=clamp(a.o+s*3,-5.2,5.2); b.to=clamp(b.o-s*3,-5.2,5.2); } }
  },
  prog(){ const c=this.car; return (c.lap-1)*this.T.N+c.i; },
  place(){ if(this.done) return this.fplace; const p=this.prog(); let r=1; for(const a of this.ais) if(a.fin||a.s>p) r++; return Math.min(6,r); },
  skidMark(){ const c=this.car; for(const s of [-1,1]){ const m=this.skids[this.skI++%this.skids.length]; const x=c.x-Math.sin(c.h)*1.35+Math.cos(c.h)*s*1.0, z=c.z-Math.cos(c.h)*1.35-Math.sin(c.h)*s*1.0;
    m.position.set(x,c.y+0.05,z); m.rotation.y=c.vh; m.visible=true; } },
  respawn(){ const T=this.T, c=this.car, i=c.i; c.x=T.px[i]; c.z=T.pz[i]; c.y=T.py[i]+0.5; c.vy=0; c.h=c.vh=Math.atan2(T.tx[i],T.tz[i]); c.spd=10; c.stuck=0; c.wrong=0; banner('🔁 Retour sur la piste'); },
  finish(){
    const place=this.place(); this.fplace=place; this.phase='done'; this.done=true; const c=this.car, coins=Math.max(0,(7-place)*8)+this.td*3+(place===1?30:0);
    addCoins(coins); S.race.n=(S.race.n||0)+1; S.race.td=(S.race.td||0)+this.td;
    if(place===1){ S.race.wins=(S.race.wins||0)+1; if(!S.race.best||this.raceT<S.race.best) S.race.best=this.raceT; sfx('win'); confetti(this.scene,c.x,c.y+3,c.z); if(PA) PA.waveT=4; }
    save(); engineSet(0.3);
    showResult({icon:place===1?'🏆':place<=3?'🥈':'🏁',title:place===1?'Victoire !':'Arrivée : '+place+'e',sub:(this.hero?this.hero.n:'')+' termine la course'+(place===1?' en tête !':' !'),
      stats:[['Place',place+'e / 6'],['Temps',fmtTime(this.raceT)],['Meilleur tour',c.best?fmtTime(c.best):'-'],['Adversaires bousculés',this.td],['Pièces gagnées','+'+coins]]});
  },
  camUpd(dt){
    const c=this.car; let tx, ty, tz, lx, ly, lz;
    if(this.phase==='pick'){ const a=this.time*0.25; tx=c.x+Math.cos(a)*16; tz=c.z+Math.sin(a)*16; ty=c.y+6; lx=c.x; ly=c.y+1; lz=c.z; }
    else { const fx=Math.sin(c.h), fz=Math.cos(c.h), d=8.6+c.spd*0.055; tx=c.x-fx*d; tz=c.z-fz*d; ty=c.y+3.3+c.spd*0.02; lx=c.x+fx*6; ly=c.y+1.3; lz=c.z+fz*6; }
    const k=this.phase==='pick'?1:damp(7,dt);
    if(!this._cp){ this._cp=new THREE.Vector3(tx,ty,tz); } const cp=this._cp; cp.x=lerp(cp.x,tx,k); cp.y=lerp(cp.y,ty,damp(5,dt)); cp.z=lerp(cp.z,tz,k);
    const sh=this.shake*0.5; camera.position.set(cp.x+rand(-sh,sh),cp.y+rand(-sh,sh),cp.z+rand(-sh,sh)); camera.lookAt(lx,ly,lz);
    const fov=clamp(62+c.spd*0.3+(c.nitT>0?10:0),60,88); if(Math.abs(camera.fov-fov)>0.05){ camera.fov=lerp(camera.fov,fov,damp(4,dt)); camera.updateProjectionMatrix(); }
    cam.px=camera.position.x; cam.py=camera.position.y; cam.pz=camera.position.z;
    if(PA){ PA.root.rotation.set(c.pitch,c.h,c.roll); }
  },
  hud(){
    const c=this.car; setText('rcLap',clamp(c.lap,1,RC_LAPS)+'/'+RC_LAPS); setText('rcPos',this.phase==='pick'?'-':this.place()+'/6'); setText('rcTime',fmtTime(this.raceT));
    setText('rcKmh',Math.round(c.spd*7.2)); const nb=$('rcNit'); if(nb){ nb.style.width=Math.round(this.nitro*100)+'%'; nb.parentNode&&nb.parentNode.classList&&nb.parentNode.classList.toggle('full',this.nitro>=0.99); }
    const ln=$('rcLines'); if(ln) ln.style.opacity=c.nitT>0?(c.full?'1':'0.7'):'0';
    this.drawMap();
  },
  drawMap(){
    const cv=$('rcMap'); if(!cv||!cv.getContext) return; const g=cv.getContext('2d'), T=this.T, W=cv.width, H=cv.height;
    const X=x=>(x+165)*W/360, Z=z=>H-(z+20)*H/190;
    if(!this.mapBg){ const b=makeCanvas(W,H), q=b.getContext('2d'); q.fillStyle='rgba(29,24,70,.55)'; q.fillRect(0,0,W,H); q.strokeStyle='#ffffff'; q.lineWidth=7; q.lineJoin='round'; q.beginPath();
      for(let i=0;i<=T.N;i+=4){ const k=i%T.N; if(!i) q.moveTo(X(T.px[k]),Z(T.pz[k])); else q.lineTo(X(T.px[k]),Z(T.pz[k])); } q.closePath(); q.stroke(); q.fillStyle='#ffd23f'; q.fillRect(X(T.px[0])-3,Z(T.pz[0])-6,6,12); this.mapBg=b; }
    g.clearRect(0,0,W,H); g.drawImage(this.mapBg,0,0);
    for(const a of this.ais){ g.fillStyle='#ff4f8b'; g.beginPath(); g.arc(X(a.x),Z(a.z),6,0,TAU); g.fill(); }
    const c=this.car; g.fillStyle='#ffd23f'; g.strokeStyle='#1d1846'; g.lineWidth=3; g.beginPath(); g.arc(X(c.x),Z(c.z),8,0,TAU); g.fill(); g.stroke();
  },
  idle(dt){ this.update(dt); },
  stop(){ engineStop(true); for(const a of this.ais) disposeAvatar(a.A); camera.fov=60; camera.updateProjectionMatrix(); }
};
SONGS.race={bpm:150,root:57,scale:[0,2,3,5,7,8,10],lead:'sawtooth',bass:'square',prog:[0,5,3,6],mel:[0,null,3,null,5,null,7,5, 3,null,5,null,3,2,0,null, 0,null,3,null,5,null,8,7, 5,null,3,null,2,null,null,null],drum:'k.hsk.hsk.hsk.hs',vol:0.55,octBass:true};
GAME_EXTRA.push({id:'race',ic:'🏎️',t:'Turbo Bolides',d:'Course de bolides au coucher du soleil : turbo, dérapages, sauts et 3 pilotes au choix !',bg:'linear-gradient(140deg,#ff7e5f,#6a3cff)',
  best:()=>S.race.wins?'🏆 '+S.race.wins+' victoire'+(S.race.wins>1?'s':'')+(S.race.best?' · '+fmtTime(S.race.best):''):S.race.n?'🏁 '+S.race.n+' course'+(S.race.n>1?'s':''):'Nouveau !'});
