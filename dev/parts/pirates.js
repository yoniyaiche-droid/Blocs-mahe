/* =========================================================
   9. Océan des Fruits : îles, pirates, bateau et fruits mystiques
   ========================================================= */
const FRUITS={
  fire:{n:'Fruit Brasier',s:'Brasier',ic:'🔥',c:'#ff7a1a',em:'#ff3d00',pow:'Boule de feu',cd:2.5,sw:1.5,sp:1.1,d:'Ton corps devient flammes. Lance de grosses boules de feu.'},
  cat:{n:'Fruit Fauve',s:'Fauve',ic:'🐆',c:'#e0a43a',em:'#000000',pow:'Bond de panthère',cd:2.4,sw:1.3,sp:1.8,d:'Tu deviens une panthère rapide qui bondit sur ses proies.'},
  bolt:{n:'Fruit Foudre',s:'Foudre',ic:'⚡',c:'#ffe14d',em:'#b89b00',pow:'Éclairs',cd:3,sw:1.2,sp:1.5,d:'Frappe les ennemis proches avec des éclairs et fonce sur eux.'},
  ice:{n:'Fruit Givre',s:'Givre',ic:'🧊',c:'#8fdcff',em:'#2a7fb0',pow:'Gel et pont de glace',cd:3,sw:1.2,sp:1,d:'Gèle tes ennemis et crée un pont de glace sur la mer.'},
  drag:{n:'Fruit Dragon',s:'Dragon',ic:'🐉',c:'#3fae4a',em:'#0d4a1a',pow:'Souffle de feu',cd:2.5,sw:1.4,sp:1.25,d:'Deviens un dragon : tu voles et tu craches du feu.'},
  giant:{n:'Fruit Géant',s:'Géant',ic:'🗿',c:'#a79a82',em:'#3a3226',pow:'Séisme',cd:3.5,sw:2.2,sp:0.9,d:'Tu deviens un colosse. Ton coup au sol secoue tout.'}
};
const PIR_B=235;
function catModel(){
  const g=new THREE.Group(), legs=[];
  const add=(w,h,d,c,x,y,z,par)=>{ const m=mk(box(w,h,d),lam(c)); m.position.set(x,y,z); (par||g).add(m); return m; };
  add(0.7,0.55,1.5,'#e0a43a',0,0.85,0); add(0.72,0.1,1.4,'#fff1c9',0,0.58,0);
  for(const [x,z] of [[0.2,0.3],[-0.25,-0.2],[0.15,-0.5],[-0.2,0.5]]) add(0.16,0.04,0.16,'#3a2a14',x,1.14,z);
  add(0.58,0.52,0.52,'#e0a43a',0,1.12,0.92); add(0.3,0.2,0.2,'#fff1c9',0,1.0,1.2); add(0.1,0.08,0.05,'#2b2d42',0,1.07,1.31);
  for(const k of [-1,1]){ add(0.13,0.16,0.1,'#e0a43a',k*0.2,1.45,0.82); add(0.1,0.1,0.04,'#b8ff6a',k*0.15,1.22,1.19); }
  for(const [x,z] of [[0.27,0.55],[-0.27,0.55],[0.27,-0.55],[-0.27,-0.55]]){ const l=new THREE.Group(); l.position.set(x,0.6,z); g.add(l); add(0.2,0.6,0.2,'#d79a30',0,-0.3,0,l); legs.push(l); }
  const tail=new THREE.Group(); tail.position.set(0,0.95,-0.75); g.add(tail); add(0.13,0.13,0.7,'#e0a43a',0,0.1,-0.35,tail); tail.rotation.x=-0.5;
  g.scale.setScalar(1.15); return {g,legs,tail,t:0,anim(t,sp){ const s=Math.sin(t*14)*0.8*Math.min(1,sp/5); legs.forEach((l,i)=>{ l.rotation.x=(i%2?-1:1)*s; }); tail.rotation.y=Math.sin(t*4)*0.4; }};
}
function dragModel(){
  const g=new THREE.Group(), wings=[];
  const add=(w,h,d,c,x,y,z,par)=>{ const m=mk(box(w,h,d),lam(c)); m.position.set(x,y,z); (par||g).add(m); return m; };
  add(0.9,0.8,1.7,'#3fae4a',0,1.0,0); add(0.8,0.2,1.6,'#d8f29a',0,0.64,0);
  add(0.4,0.4,0.8,'#3fae4a',0,1.35,0.95).rotation.x=-0.5; add(0.6,0.5,0.7,'#3fae4a',0,1.55,1.5); add(0.4,0.25,0.4,'#2f8a3a',0,1.45,1.9);
  for(const k of [-1,1]){ add(0.12,0.12,0.06,'#ffe14d',k*0.2,1.68,1.82); add(0.1,0.35,0.1,'#fff6e0',k*0.2,1.95,1.3).rotation.x=-0.4; }
  for(let i=0;i<3;i++) add(0.5-i*0.12,0.5-i*0.12,0.8,'#3fae4a',0,0.95-i*0.12,-1.1-i*0.65);
  for(const k of [-1,1]){ const w=new THREE.Group(); w.position.set(k*0.4,1.45,0.1); g.add(w); add(1.8,0.07,1.1,'#2f8a3a',k*0.95,0,-0.1,w); add(0.9,0.07,0.8,'#ffb84d',k*1.25,0.0,-0.2,w); wings.push([w,k]); }
  for(const [x,z] of [[0.3,0.5],[-0.3,0.5],[0.3,-0.5],[-0.3,-0.5]]) add(0.22,0.4,0.22,'#2f8a3a',x,0.4,z);
  g.scale.setScalar(1.15); return {g,anim(t,sp){ wings.forEach(([w,k])=>{ w.rotation.z=k*(0.2+Math.sin(t*9)*0.55); }); }};
}
const PIR_NAMES=['Barbe-Sel','Pied-de-Rhum','Œil-de-Perle','Tonneau','Mouette','Gros-Bras','Cap\'taine Mou','Bouboule','Rafiot','Moustache'];
function pirateAvatar(kind,name){
  const skins=['#e0ac69','#f1c27d','#c68642','#8d5524'], cl=[['#b3382c','#2b2d42'],['#2f6fb5','#3a2a1a'],['#5a8f3a','#2b2d42'],['#8e44ad','#1d1846']][Math.floor(Math.random()*4)];
  const av={skin:skins[Math.floor(Math.random()*4)],shirt:kind==='boss'?'#1d1846':kind==='chief'?'#c92a2a':cl[0],pants:cl[1],shoes:'#1d1846',face:kind==='minion'?'happy':'wow',hat:kind==='boss'?'viking':kind==='chief'?'tophat':'none'};
  const A=makeAvatar(av,name,{sword:true});
  if(kind==='minion'){ const b=mk(box(0.54,0.12,0.54),lam('#e63946')); b.position.set(0,0.2,0); const k=mk(box(0.12,0.1,0.14),lam('#e63946')); k.position.set(0,0.12,-0.34); A.head.add(b,k); }
  const p=mk(box(0.13,0.13,0.03),lam('#111111')); p.position.set(0.12,0.04,0.255); A.head.add(p);
  return A;
}
GAMES.pirates={
  hint:'ZQSD/WASD : bouger · Espace : sauter · E : épée / ouvrir · F : pouvoir · G : transformation · R : fruits · B : bateau',
  autoJump:true, far:300,
  hudHTML:'<div class="pill">❤️ <b id="pHp">100</b></div><div class="pill ia" id="pFruitP">🍎 <b id="pFruit">—</b></div><div class="pill">🔑 <b id="pKeys">0/3</b></div><div class="pill" id="pBossP" style="display:none">👑 <b id="pBoss">0</b></div>',
  get jumpV(){ return this.form==='cat'?14.5:this.form==='giant'?12.5:11.5; },
  speedMul(){ let m=this.form?FRUITS[this.form].sp:1; if(P.y<0.45&&!P.fly&&this.hgt(P.x,P.z)<=0) m*=0.55; return m; },
  hk(i,j){ return (i+700)*1500+(j+700); },
  hgt(x,z){ return this.H.get(this.hk(Math.floor(x),Math.floor(z)))||0; },
  start(){
    const sc=this.scene; setupScene(sc,'#46b2ff','#dff6ff',80,260);
    const rng=mulberry32((Math.random()*1e9)|0); this.rng=rng; const rr=(a,b)=>a+rng()*(b-a);
    Object.assign(this,{H:new Map(),enemies:[],chests:[],pearls:[],shots:[],ice:[],solids:[],keys:0,kills:0,hp:100,hpMax:100,hurtT:0,regenT:0,acd:0,pcd:0,form:null,fruit:'fire',owned:new Set(['fire']),swordLv:0,
      sail:null,boat:null,fm:null,tintList:null,pounce:0,breath:0,panel:null,merchant:null,sh:0,fruitsFound:0,bossHp:0,bossDead:false,spawnPt:null,ring:[],mark:null});
    const n1=valueNoise(rng,7), n2=valueNoise(rng,3), A0=rng()*TAU;
    const pol=(a,r)=>[Math.round(Math.cos(a)*r),Math.round(Math.sin(a)*r)];
    this.isl=[{id:'home',x:0,z:0,R:27,n:'Île du Port'}];
    ['Île du Crabe','Île du Requin','Île du Corail'].forEach((n,i)=>{ const [x,z]=pol(A0+i*TAU/3,100); this.isl.push({id:'camp'+i,x,z,R:24,n,chief:['Chef Crabe 🦀','Chef Requin 🦈','Chef Corail 🪸'][i]}); });
    { const [x,z]=pol(A0+TAU/6,188); this.isl.push({id:'boss',x,z,R:28,n:'Île du Crâne'}); }
    for(const I of this.isl){ const R=I.R, N=Math.ceil(R*2+8), x0=Math.floor(I.x-R-4), z0=Math.floor(I.z-R-4), E=new Float32Array(N*N);
      for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const d=Math.hypot(x0+i+0.5-I.x,z0+j+0.5-I.z)/R; E[j*N+i]=(1-d*1.15)*1.15+(n1(x0+i+400,z0+j+400)*0.65+n2(x0+i+400,z0+j+400)*0.35-0.5)*0.8; }
      for(let j=1;j<N-1;j++) for(let i=1;i<N-1;i++){ let s=0; for(let b=-1;b<=1;b++) for(let a=-1;a<=1;a++) s+=E[(j+b)*N+i+a]; const h=clamp(Math.floor(s/9*7),0,6); if(h>0) this.H.set(this.hk(x0+i,z0+j),h); } }
    const flat=(x,z,r,h)=>{ for(let i=Math.floor(x-r);i<=Math.ceil(x+r);i++) for(let j=Math.floor(z-r);j<=Math.ceil(z+r);j++) if(Math.hypot(i+0.5-x,j+0.5-z)<=r) this.H.set(this.hk(i,j),h); };
    flat(0,0,7,2); for(const I of this.isl) if(I.id.startsWith('camp')) flat(I.x,I.z,6,2); flat(this.isl[4].x,this.isl[4].z,7,3);
    for(let it=0;it<60;it++){ let ch=false; for(const [k,h] of Array.from(this.H.entries())){ const i=Math.floor(k/1500)-700, j=k%1500-700; let lo=h;
        for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=this.H.get(this.hk(i+a,j+b))||0; if(h>n+1&&n+1<lo) lo=n+1; }
        if(lo<h){ this.H.set(k,lo); ch=true; } } if(!ch) break; }
    // cubes
    { const cubes=[]; for(const [k,h] of this.H){ const i=Math.floor(k/1500)-700, j=k%1500-700;
        const mn=Math.min(h,this.H.get(this.hk(i-1,j))||0,this.H.get(this.hk(i+1,j))||0,this.H.get(this.hk(i,j-1))||0,this.H.get(this.hk(i,j+1))||0);
        for(let y=Math.min(h-1,mn);y<=h-1;y++) cubes.push(i,j,y,h); }
      const cnt=cubes.length/4, imat=new THREE.MeshLambertMaterial({map:tileTex}); imat.userData.own=true;
      const im=new THREE.InstancedMesh(box(1,1,1),imat,cnt), mtx=new THREE.Matrix4(), col=new THREE.Color();
      for(let n=0;n<cnt;n++){ const i=cubes[n*4], j=cubes[n*4+1], y=cubes[n*4+2], h=cubes[n*4+3]; mtx.makeTranslation(i+0.5,y+0.5,j+0.5); im.setMatrixAt(n,mtx); col.set(islandColor(h,y)); col.offsetHSL(0,0,(rng()-0.5)*0.06); im.setColorAt(n,col); }
      im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; sc.add(im); }
    // mer
    { const pg=new THREE.PlaneGeometry(1000,1000); pg.userData.own=true; const wm=new THREE.MeshLambertMaterial({color:'#2fa4ff',transparent:true,opacity:0.74}); wm.userData.own=true;
      const w=new THREE.Mesh(pg,wm); w.rotation.x=-Math.PI/2; w.position.y=0.62; sc.add(w); this.water=w;
      const sm=new THREE.MeshLambertMaterial({color:'#c9b27a'}); sm.userData.own=true; const s=new THREE.Mesh(pg,sm); s.rotation.x=-Math.PI/2; s.position.y=-1.02; sc.add(s); }
    // arbres
    { const taken=[], tPos=[]; const near=(x,z)=>this.isl.some(I=>Math.hypot(x-I.x,z-I.z)<8&&I.id!=='home')||Math.hypot(x,z)<9;
      for(const [k,h] of this.H){ const i=Math.floor(k/1500)-700, j=k%1500-700; if(h<1||h>4||rng()>0.045||near(i,j)) continue; if(taken.some(t=>Math.hypot(t[0]-i,t[1]-j)<4)) continue; taken.push([i,j]); tPos.push([i,j,h]); }
      if(tPos.length){ const trm=new THREE.MeshLambertMaterial({color:'#8a5a2b'}); trm.userData.own=true; const lfm=new THREE.MeshLambertMaterial({map:tileTex}); lfm.userData.own=true;
        const tim=new THREE.InstancedMesh(box(1,1,1),trm,tPos.length), lim=new THREE.InstancedMesh(box(1,1,1),lfm,tPos.length*2), mtx=new THREE.Matrix4(), q=new THREE.Quaternion(), ps=new THREE.Vector3(), sc3=new THREE.Vector3(), col=new THREE.Color();
        tPos.forEach(([x,z,h],n)=>{ mtx.compose(ps.set(x+0.5,h+1.3,z+0.5),q,sc3.set(0.4,2.6,0.4)); tim.setMatrixAt(n,mtx); mtx.compose(ps.set(x+0.5,h+3,z+0.5),q,sc3.set(3,0.5,3)); lim.setMatrixAt(n*2,mtx);
          mtx.compose(ps.set(x+0.5,h+3.5,z+0.5),q,sc3.set(1.6,0.5,1.6)); lim.setMatrixAt(n*2+1,mtx); col.set(['#3fae4a','#4cc157','#2f9a44'][n%3]); lim.setColorAt(n*2,col); lim.setColorAt(n*2+1,col);
          this.solids.push({x0:x+0.3,x1:x+0.7,y0:h,y1:h+2.6,z0:z+0.3,z1:z+0.7}); });
        [tim,lim].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.castShadow=true; m.frustumCulled=false; sc.add(m); }); if(lim.instanceColor) lim.instanceColor.needsUpdate=true; } }
    // départ + marchand
    this.spawnPt=[0.5,this.hgt(0.5,0.5),0.5]; P.x=0.5; P.z=0.5; P.y=this.spawnPt[1]; P.yaw=Math.PI; cam.yaw=0;
    { const A=makeAvatar({skin:'#f1c27d',shirt:'#2f9e44',pants:'#5a3a1e',shoes:'#3a2a1a',face:'happy',hat:'tophat'},'Marchand 🛒'); const y=this.hgt(3.5,2.5); A.root.position.set(3.5,y,2.5); A.root.rotation.y=Math.PI*0.8; sc.add(A.root); this.merchant={A,x:3.5,y,z:2.5};
      const st=mk(box(1.6,0.9,0.8),lam('#a0703c')); st.position.set(3.5,y+0.45,3.6); sc.add(st); this.solids.push({x0:2.7,x1:4.3,y0:y,y1:y+0.9,z0:3.2,z1:4}); }
    this.addChest('fruit',-4.5,2.5); 
    // camps
    this.isl.forEach(I=>{ if(!I.id.startsWith('camp')) return; const ci=+I.id.slice(4);
      [[-4,-3,'#e63946'],[4,-3,'#f4f4f4'],[0,5,'#ffb020']].forEach(([dx,dz,c])=>this.addTent(I.x+dx,I.z+dz,c));
      this.addChest('fruit',I.x+3,I.z+2.5);
      for(let k=0;k<4;k++){ const a=k/4*TAU+0.6; this.addEnemy('minion',I.x+Math.cos(a)*4.5,I.z+Math.sin(a)*4.5,I); }
      this.addEnemy('chief',I.x+0.5,I.z+0.5,I).key=true; this.enemies[this.enemies.length-1].name=I.chief; });
    { const B=this.isl[4]; this.addChest('treasure',B.x+0.5,B.z-4); this.addChest('fruit',B.x-5,B.z+3);
      for(let k=0;k<6;k++){ const a=k/6*TAU; this.addEnemy('minion',B.x+Math.cos(a)*7,B.z+Math.sin(a)*7,B); }
      const bs=this.addEnemy('boss',B.x+0.5,B.z+3.5,B); this.boss=bs; }
    // perles
    for(const I of this.isl){ let n=0, tries=0; while(n<10&&tries<400){ tries++; const a=rr(0,TAU), r=rr(2,I.R*0.8), x=I.x+Math.cos(a)*r, z=I.z+Math.sin(a)*r, h=this.hgt(x,z); if(h<1) continue;
        const g=new THREE.Group(), m=mk(oct(0.22),emat('#ffd23f','#7a5a00')); g.add(m); g.position.set(Math.floor(x)+0.5,h+0.8,Math.floor(z)+0.5); sc.add(g); this.pearls.push({g,m,x:g.position.x,y:h+0.8,z:g.position.z,t:rr(0,6)}); n++; } }
    addClouds(this,18,[0,150],[22,38],[-150,150]);
    this.bounds=[-PIR_B,PIR_B,-PIR_B,PIR_B]; cam.dist=7.5;
    $('pirPanel').classList.remove('on'); banner('🏴‍☠️ Trouve les 3 clés des chefs, puis le grand trésor ! Tu as le '+FRUITS.fire.n+' 🔥');
    this.setForm('fire',true);
  },
  /* ---------- décor ---------- */
  query(x0,x1,y0,y1,z0,z1){
    const out=[this.seaBox||(this.seaBox={x0:-1e4,x1:1e4,y0:-5,y1:0,z0:-1e4,z1:1e4})];
    for(let j=Math.floor(z0);j<=Math.floor(z1);j++) for(let i=Math.floor(x0);i<=Math.floor(x1);i++){ const h=this.H.get(this.hk(i,j)); if(h) out.push({x0:i,x1:i+1,y0:-2,y1:h,z0:j,z1:j+1}); }
    for(const b of this.solids) if(b.x1>x0&&b.x0<x1&&b.z1>z0&&b.z0<z1&&b.y1>y0&&b.y0<y1) out.push(b);
    return out;
  },
  addTent(x,z,c){ const h=this.hgt(x,z), g=new THREE.Group(), b=mk(box(2.6,1.5,2.6),lam(c)), r=mk(cone(2.1,1.3,4),lam(shadeHex(c,0.8))); b.position.y=0.75; r.position.y=2.15; r.rotation.y=Math.PI/4; g.add(b,r); g.position.set(x,h,z); this.scene.add(g);
    this.solids.push({x0:x-1.3,x1:x+1.3,y0:h,y1:h+1.5,z0:z-1.3,z1:z+1.3}); },
  addChest(type,x,z){
    const h=this.hgt(x,z), g=new THREE.Group(), big=type==='treasure', s=big?1.6:1;
    const base=mk(box(1.1*s,0.7*s,0.8*s),lam(big?'#6b3a1c':'#a0703c')), band=mk(box(0.14*s,0.72*s,0.84*s),lam('#ffd23f')); base.position.y=0.35*s; band.position.y=0.35*s; band.position.x=0.2*s;
    const lid=new THREE.Group(); lid.position.set(0,0.7*s,-0.4*s); const lm=mk(box(1.1*s,0.3*s,0.8*s),lam(big?'#8a4a24':'#b8814a')); lm.position.set(0,0.15*s,0.4*s); const lb=mk(box(0.14*s,0.32*s,0.84*s),lam('#ffd23f')); lb.position.set(0.2*s,0.15*s,0.4*s); lid.add(lm,lb);
    g.add(base,band,lid); g.position.set(x,h,z); this.scene.add(g);
    const c={type,g,lid,x,y:h,z,open:false}; this.chests.push(c); this.solids.push({x0:x-0.55*s,x1:x+0.55*s,y0:h,y1:h+0.7*s,z0:z-0.4*s,z1:z+0.4*s}); return c;
  },
  addEnemy(kind,x,z,I){
    const names={minion:PIR_NAMES[Math.floor(Math.random()*PIR_NAMES.length)],chief:'Chef pirate',boss:'Capitaine Corbeau 🏴‍☠️'};
    const A=pirateAvatar(kind,names[kind]); const sc=kind==='boss'?1.7:kind==='chief'?1.3:1; A.root.scale.setScalar(sc);
    const y=this.hgt(x,z), hp=kind==='boss'?420:kind==='chief'?170:45;
    const e={kind,A,m:A.root,x,y,z,yaw:rand(0,TAU),hp,max:hp,cd:rand(0.3,1),fz:0,kb:0,kx:0,kz:0,home:{x,z},wt:0,wx:x,wz:z,reach:kind==='boss'?3.2:kind==='chief'?2.4:1.9,dmg:kind==='boss'?18:kind==='chief'?12:7,sp:kind==='boss'?3.6:kind==='chief'?3.2:3.4,aggro:kind==='boss'?20:15,coin:kind==='boss'?60:kind==='chief'?25:3,dead:false,isl:I,wave:0,key:false,name:names[kind]};
    A.root.position.set(x,y,z); this.scene.add(A.root); this.enemies.push(e); return e;
  },
  /* ---------- forme / fruits ---------- */
  setForm(f,quiet){
    if(this.form===f&&!quiet) return; this.clearForm(); this.form=f||null;
    if(!f){ if(!quiet) banner('🙂 Tu reprends ta forme normale'); return; }
    const F=FRUITS[f];
    if(f==='cat'||f==='drag'){ PA.body.visible=false; this.fm=f==='cat'?catModel():dragModel(); PA.root.add(this.fm.g); }
    else { const mt=new THREE.MeshLambertMaterial({color:F.c,emissive:F.em}); mt.userData.own=true; this.tintMat=mt; this.tintList=[]; PA.root.traverse(o=>{ if(!o.isMesh) return; this.tintList.push([o,o.material]); o.material=Array.isArray(o.material)?o.material.map(m=>m.map?m:mt):mt; }); }
    if(f==='giant'){ PA.root.scale.setScalar(2.1); P.hw=0.55; P.h=3.6; cam.dist=12; }
    if(f==='drag'){ P.fly=true; $('hud').classList.add('flying'); P.vy=3; P.onGround=false; }
    burst(this.scene,P.x,P.y+1,P.z,F.c,16,6,true); sfx('cp'); if(!quiet) banner(F.ic+' Forme '+F.s+' ! ✨ pouvoir : '+F.pow);
  },
  clearForm(){
    if(this.tintList){ for(const [o,m] of this.tintList) o.material=m; this.tintList=null; if(this.tintMat){ this.tintMat.dispose(); this.tintMat=null; } }
    if(this.fm){ PA.root.remove(this.fm.g); this.fm=null; } if(PA&&PA.body) PA.body.visible=true;
    if(PA) PA.root.scale.setScalar(1); P.hw=0.3; P.h=1.8; cam.dist=7.5; if(P.fly){ P.fly=false; } $('hud').classList.remove('flying');
  },
  eat(f){ if(!this.owned.has(f)) return; this.fruit=f; if(S.pir.seen.indexOf(f)<0) S.pir.seen.push(f); saveSoon(); this.setForm(f); sfx('buy'); banner(FRUITS[f].ic+' Tu as mangé le '+FRUITS[f].n+' !'); },
  toggleForm(){ if(this.sail) return; if(this.form) this.setForm(null); else if(this.fruit) this.setForm(this.fruit); },
  giveFruit(c){
    const rest=Object.keys(FRUITS).filter(k=>!this.owned.has(k)); if(!rest.length){ addCoins(20); banner('🍎 Tous les fruits sont à toi ! +20 pièces'); return null; }
    const f=rest[Math.floor(this.rng()*rest.length)]; this.owned.add(f); this.fruitsFound++; if(S.pir.seen.indexOf(f)<0) S.pir.seen.push(f); saveSoon();
    banner('🎁 '+FRUITS[f].ic+' '+FRUITS[f].n+' trouvé ! Ouvre 🍎 pour le manger'); sfx('win'); return f;
  },
  /* ---------- action principale : ouvrir / parler / bateau / épée ---------- */
  onAction(){
    if(this.sail){ this.disembark(); return; }
    for(const c of this.chests){ if(c.open) continue; if(Math.hypot(P.x-c.x,P.z-c.z)<2.8&&Math.abs(P.y-c.y)<3){ return this.openChest(c); } }
    const m=this.merchant; if(m&&Math.hypot(P.x-m.x,P.z-m.z)<4){ P.yaw=Math.atan2(m.x-P.x,m.z-P.z); return this.openPanel('shop'); }
    this.slash();
  },
  openChest(c){
    c.open=true; c.lid.rotation.x=-1.2; burst(this.scene,c.x,c.y+1,c.z,'#ffd23f',14,5,true); sfx('gem');
    if(c.type==='treasure'){ if(this.keys<3){ c.open=false; c.lid.rotation.x=0; banner('🔒 Il faut les 3 clés des chefs ('+this.keys+'/3)'); sfx('nope'); return; } return this.end(true); }
    this.giveFruit(c); addCoins(10);
  },
  slash(){
    if(this.acd>0) return; const F=this.form?FRUITS[this.form]:null, big=this.form==='giant'; this.acd=big?0.5:0.38; PA.swing=0.28; sfx('swing');
    const mult=(F?F.sw:1)*(1+this.swordLv*0.25), reach=(big?4.4:2.8), fx=Math.sin(P.yaw), fz=Math.cos(P.yaw); let hit=0;
    if(this.form==='fire'||this.form==='drag') burst(this.scene,P.x+fx*1.5,P.y+1.2,P.z+fz*1.5,'#ff8a1f',6,4,true);
    for(const e of this.enemies){ if(e.dead) continue; const dx=e.x-P.x, dz=e.z-P.z, d=Math.hypot(dx,dz);
      if(d<reach+(e.kind==='boss'?1.2:0.4)&&Math.abs(e.y-P.y)<3&&(d<1.3||(dx*fx+dz*fz)/d>0.1)){ this.dmgEnemy(e,Math.round(15*mult),P.x,P.z); hit++; } }
    return hit;
  },
  dmgEnemy(e,n,sx,sz){
    if(e.dead) return; e.hp-=n; const dx=e.x-sx, dz=e.z-sz, d=Math.hypot(dx,dz)||1; if(e.kind==='minion'){ e.kb=0.25; e.kx=dx/d*5; e.kz=dz/d*5; }
    burst(this.scene,e.x,e.y+1.2*(e.m.scale.y||1),e.z,'#ffffff',5,3); sfx('hit'); e.A.swing=0; if(e.hp<=0) this.killEnemy(e);
  },
  killEnemy(e){
    e.dead=true; this.kills++; burst(this.scene,e.x,e.y+1,e.z,'#ffd23f',14,6,true); sfx('poof'); this.scene.remove(e.m); disposeAvatar(e.A); addCoins(e.coin);
    if(e.key){ this.keys++; banner('🔑 Clé récupérée ! '+this.keys+'/3'+(this.keys>=3?' — le trésor t\'attend sur l\'Île du Crâne !':'')); sfx('win'); }
    if(e.kind==='boss'){ this.bossDead=true; banner('👑 Le Capitaine Corbeau est vaincu !'); }
  },
  hurtP(n,fx,fz){
    if(P.inv>0||this.over) return; if(this.form==='giant') n=Math.round(n*0.5); this.hp-=n; this.regenT=0; P.inv=0.45; flashHurt(); sfx('hurt');
    if(fx!==undefined&&this.form!=='giant'){ const dx=P.x-fx, dz=P.z-fz, d=Math.hypot(dx,dz)||1; P.vx=dx/d*5; P.vz=dz/d*5; P.vy=Math.max(P.vy,3.5); P.knock=0.18; P.onGround=false; }
    if(this.hp<=0) this.die();
  },
  die(){
    if(this.sail) this.disembark(true); banner('😵 KO ! Tu te réveilles au port'); this.hp=this.hpMax; this.setForm(null,true);
    P.x=this.spawnPt[0]; P.y=this.spawnPt[1]; P.z=this.spawnPt[2]; P.vx=P.vy=P.vz=0; P.inv=2; snapCam();
    for(const e of this.enemies) if(!e.dead&&e.kind!=='boss'){ e.hp=e.max; }
  },
  /* ---------- pouvoirs ---------- */
  power(){
    if(this.sail||this.over) return; const f=this.fruit; if(!f){ banner('Mange d\'abord un fruit 🍎'); return; }
    if(this.pcd>0){ sfx('nope'); return; } if(this.form!==f) this.setForm(f);
    this.pcd=FRUITS[f].cd; PA.swing=0.28; this['pw_'+f]();
  },
  aim(){ let fx=Math.sin(P.yaw), fz=Math.cos(P.yaw), best=null, bd=1e9; for(const e of this.enemies){ if(e.dead) continue; const dx=e.x-P.x, dz=e.z-P.z, d=Math.hypot(dx,dz); if(d<26&&(dx*fx+dz*fz)/d>0.82&&d<bd){ bd=d; best=[dx/d,dz/d]; } } return best||[fx,fz]; },
  shot(x,y,z,dx,dz,o){ const m=mk(sph(o.r||0.4),emat(o.c,o.c)); m.position.set(x,y,z); this.scene.add(m); this.shots.push(Object.assign({m,x,y,z,vx:dx*o.sp,vz:dz*o.sp,vy:0,t:o.t||1.5},o)); },
  pw_fire(){ const [dx,dz]=this.aim(), s=this.form==='giant'?2:1; sfx('boom'); this.shot(P.x+dx*0.8,P.y+1.3*s,P.z+dz*0.8,dx,dz,{sp:24,c:'#ff6a00',dmg:34,rad:3.4,r:0.5,fire:1}); },
  pw_cat(){ const [dx,dz]=this.aim(); this.pounce=0.7; this.hitSet=new Set(); P.vx=dx*20; P.vz=dz*20; P.vy=6.5; P.onGround=false; P.knock=0.55; P.yaw=Math.atan2(dx,dz); sfx('boing'); },
  pw_bolt(){
    const L=this.enemies.filter(e=>!e.dead&&Math.hypot(e.x-P.x,e.z-P.z)<24).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)).slice(0,4); sfx('boom');
    for(const e of L){ for(let h=0;h<16;h+=2) burst(this.scene,e.x,e.y+h,e.z,'#ffe14d',2,1,true); this.dmgEnemy(e,36,P.x,P.z); }
    let dx=Math.sin(P.yaw), dz=Math.cos(P.yaw); if(L[0]){ const ax=L[0].x-P.x, az=L[0].z-P.z, d=Math.hypot(ax,az)||1; dx=ax/d; dz=az/d; }
    P.vx=dx*26; P.vz=dz*26; P.knock=0.22; P.yaw=Math.atan2(dx,dz); P.inv=Math.max(P.inv,0.4);
  },
  pw_ice(){
    let n=0; for(const e of this.enemies){ if(e.dead||Math.hypot(e.x-P.x,e.z-P.z)>10) continue; e.fz=4; this.dmgEnemy(e,12,P.x,P.z); burst(this.scene,e.x,e.y+1,e.z,'#8fdcff',8,3,true); n++; }
    const dx=Math.sin(P.yaw), dz=Math.cos(P.yaw); let made=0;
    for(let k=2;k<=16;k++){ const x=P.x+dx*k, z=P.z+dz*k, i=Math.floor(x), j=Math.floor(z);
      if(this.hgt(x,z)>0||Math.abs(x)>PIR_B-2||Math.abs(z)>PIR_B-2||this.ice.some(t=>t.i===i&&t.j===j)) continue;
      const m=mk(box(1,0.85,1),matC('ICE',()=>new THREE.MeshLambertMaterial({color:'#bfeaff',transparent:true,opacity:0.85})),false); m.position.set(i+0.5,0.42,j+0.5); this.scene.add(m);
      const b={x0:i,x1:i+1,y0:-1,y1:0.85,z0:j,z1:j+1}; this.solids.push(b); this.ice.push({i,j,m,b,t:25}); made++; }
    sfx('cp'); burst(this.scene,P.x+dx*2,P.y+1,P.z+dz*2,'#bfeaff',14,5,true); if(made) banner('🧊 Un pont de glace se forme !');
  },
  pw_drag(){ this.breath=0.6; sfx('boom'); const dx=Math.sin(P.yaw), dz=Math.cos(P.yaw);
    for(const e of this.enemies){ if(e.dead) continue; const ax=e.x-P.x, az=e.z-P.z, d=Math.hypot(ax,az); if(d<11&&(d<1.5||(ax*dx+az*dz)/d>0.7)&&Math.abs(e.y-P.y)<6) this.dmgEnemy(e,40,P.x,P.z); } },
  pw_giant(){ sfx('boom'); const R=8; for(let k=0;k<16;k++){ const a=k/16*TAU; burst(this.scene,P.x+Math.cos(a)*R*0.8,P.y+0.3,P.z+Math.sin(a)*R*0.8,'#c8b98a',3,4); }
    for(const e of this.enemies){ if(e.dead) continue; const d=Math.hypot(e.x-P.x,e.z-P.z); if(d<R&&Math.abs(e.y-P.y)<4) this.dmgEnemy(e,Math.round(45*(1-d/(R*1.4))),P.x,P.z); } },
  /* ---------- bateau ---------- */
  openWater(x,z){ if(Math.abs(x)>PIR_B-4||Math.abs(z)>PIR_B-4) return false; for(const [a,b] of [[0,0],[2,0],[-2,0],[0,2],[0,-2]]) if(this.hgt(x+a,z+b)>0||this.iceAt(x+a,z+b)) return false; return true; },
  iceAt(x,z){ const i=Math.floor(x), j=Math.floor(z); return this.ice.some(t=>t.i===i&&t.j===j); },
  summonBoat(){
    if(this.sail) return this.disembark(); if(P.fly||this.over) return;
    let sx=null, sz=null; const swim=P.y<0.5&&this.hgt(P.x,P.z)<=0&&!this.iceAt(P.x,P.z);
    if(swim&&this.openWater(P.x,P.z)){ sx=P.x; sz=P.z; }
    else { let best=1e9; for(let r=2;r<=10;r++) for(let a=0;a<20;a++){ const x=P.x+Math.cos(a/20*TAU)*r, z=P.z+Math.sin(a/20*TAU)*r; if(r<best&&this.openWater(x,z)){ best=r; sx=x; sz=z; } } }
    if(sx===null){ banner('🚤 Va au bord de l\'eau pour appeler ton bateau'); sfx('nope'); return; }
    if(!this.boat){ const M=vehMesh('boat','#f4f4f4'); this.scene.add(M.g); this.boat=M; }
    this.sail={x:sx,z:sz,yaw:Math.atan2(sx-P.x,sz-P.z)||P.yaw,spd:0,m:this.boat.g,body:this.boat.body}; this.setForm(null,true); this.frozen=true; PA.sit=true; cam.dist=9; this.boat.g.visible=true;
    engineStart('boat'); VSND.start.boat(); banner('🚤 Joystick pour naviguer · 🚤 ou ⚔️ pour descendre'); this.sailPose(0);
  },
  disembark(force){
    const v=this.sail; if(!v) return; let best=null, bd=1e9;
    for(let r=1;r<=7;r++) for(let a=0;a<24;a++){ const x=v.x+Math.cos(a/24*TAU)*r, z=v.z+Math.sin(a/24*TAU)*r, h=this.hgt(x,z); if(h>=1&&h<=2&&r<bd&&this.hgt(x,z)>0&&!this.solids.some(b=>x>b.x0-0.4&&x<b.x1+0.4&&z>b.z0-0.4&&z<b.z1+0.4&&b.y1>h-0.1&&b.y0<h+1.5)){ bd=r; best=[Math.floor(x)+0.5,h,Math.floor(z)+0.5]; } }
    if(!best&&!force&&this.iceAt(v.x,v.z)===false){ /* en pleine mer : on nage */ }
    this.frozen=false; PA.sit=false; engineStop(); cam.dist=7.5;
    if(best){ P.x=best[0]; P.y=best[1]; P.z=best[2]; } else { P.x=v.x+Math.sin(v.yaw+1.57)*1.6; P.z=v.z+Math.cos(v.yaw+1.57)*1.6; P.y=0.05; }
    P.vx=P.vy=P.vz=0; P.jumpBuf=0; this.sail=null; sfx('click'); if(!force) banner(best?'🏝️ Tu débarques sur l\'île':'🏊 Tu nages');
  },
  sailPose(dt){ const v=this.sail, t=this.time; v.m.position.set(v.x,0.32+Math.sin(t*2)*0.05,v.z); v.m.rotation.y=v.yaw; v.body.rotation.z=(v.roll||0); v.body.rotation.x=Math.sin(t*1.7)*0.03;
    P.x=v.x; P.z=v.z; P.y=0.6; P.yaw=v.yaw; P.vx=P.vy=P.vz=0; P.onGround=true; },
  sailStep(dt){
    const v=this.sail, thr=inp.y, st=inp.x; const tgt=thr>0.1?15*thr:thr<-0.1?-4*(-thr):0; v.spd+=(tgt-v.spd)*Math.min(1,(tgt===0?3:2.2)*dt);
    v.yaw-=st*1.8*dt*clamp(Math.abs(v.spd)/4,0.3,1)*(v.spd<0?-1:1);
    const nx=v.x+Math.sin(v.yaw)*v.spd*dt, nz=v.z+Math.cos(v.yaw)*v.spd*dt, bad=(x,z)=>{ if(Math.abs(x)>PIR_B||Math.abs(z)>PIR_B) return true; for(const [a,b] of [[0,0],[1.1,0],[-1.1,0],[0,1.7],[0,-1.7]]){ const rx=Math.cos(v.yaw)*a+Math.sin(v.yaw)*b, rz=-Math.sin(v.yaw)*a+Math.cos(v.yaw)*b; if(this.hgt(x+rx,z+rz)>0||this.iceAt(x+rx,z+rz)) return true; } return false; };
    if(!bad(nx,nz)){ v.x=nx; v.z=nz; } else { if(Math.abs(v.spd)>4) sfx('hit'); v.spd*=-0.25; }
    v.roll=lerp(v.roll||0,clamp(-st*0.18,-0.2,0.2),Math.min(1,4*dt)); this.sailPose(dt);
    if(Math.abs(v.spd)>1) cam.yaw=angLerp(cam.yaw,v.yaw+Math.PI,Math.min(1,1.6*dt*clamp(Math.abs(v.spd)/6,0,1)));
    engineSet(Math.abs(v.spd)/15);
  },
  /* ---------- interface ---------- */
  openPanel(kind){
    const p=$('pirPanel'); p.innerHTML=''; p.classList.add('on'); this.panel=kind;
    const head=el('div','mcp-h'), t=el('span'), x=el('button','iconbtn'); t.textContent=kind==='shop'?'🛒 Le Marchand':'🍎 Tes fruits'; x.textContent='✖️'; x.setAttribute('aria-label','Fermer'); x.addEventListener('click',()=>this.closePanel()); head.appendChild(t); head.appendChild(x);
    const body=el('div','mcp-b'); p.appendChild(head); p.appendChild(body);
    const row=(ic,name,desc,label,fn,on)=>{ const r=el('div','mod'), i=el('span','em'), tx=el('div','tx'), b=el('b'), d=el('span'); i.textContent=ic; b.textContent=name; d.textContent=desc; tx.appendChild(b); tx.appendChild(d); r.appendChild(i); r.appendChild(tx);
      if(label){ const bt=el('button','buy'); bt.textContent=label; bt.addEventListener('click',fn); if(on===false) bt.style.opacity='0.5'; r.appendChild(bt); } body.appendChild(r); };
    if(kind==='shop'){
      const c=el('p'); c.innerHTML='<b>🪙 '+S.coins+' pièces</b> · les pièces se gagnent en battant des pirates et en ramassant des perles.'; body.appendChild(c);
      const pay=n=>{ if(S.coins<n){ banner('🪙 Il te manque '+(n-S.coins)+' pièces'); sfx('nope'); return false; } S.coins-=n; updateCoinsUI(); saveSoon(); sfx('buy'); return true; };
      row('🍖','Gros repas','Soigne complètement ta vie.','🪙 5',()=>{ if(this.hp>=this.hpMax){ banner('Tu es déjà en pleine forme !'); return; } if(pay(5)){ this.hp=this.hpMax; this.openPanel('shop'); } });
      row('🗡️','Affûter l\'épée','+25 % de dégâts ('+this.swordLv+'/3).',this.swordLv>=3?'Max':'🪙 '+(30+this.swordLv*30),()=>{ if(this.swordLv>=3) return; if(pay(30+this.swordLv*30)){ this.swordLv++; this.openPanel('shop'); } });
      row('🎁','Fruit mystère','Un fruit que tu n\'as pas encore.','🪙 60',()=>{ if(Object.keys(FRUITS).every(k=>this.owned.has(k))){ banner('Tu as déjà tous les fruits !'); return; } if(pay(60)){ this.giveFruit(); this.openPanel('shop'); } });
      row('❤️','Armure de pirate','+30 de vie maximum.',this.hpMax>=160?'Max':'🪙 80',()=>{ if(this.hpMax>=160) return; if(pay(80)){ this.hpMax+=30; this.hp=this.hpMax; this.openPanel('shop'); } });
    } else {
      const c=el('p'); c.textContent='Touche un fruit pour le manger : tu te transformes ! Tu ne peux avoir qu\'un fruit actif à la fois, mais tu peux en changer quand tu veux.'; body.appendChild(c);
      for(const k of Object.keys(FRUITS)){ const F=FRUITS[k], has=this.owned.has(k), seen=S.pir.seen.indexOf(k)>=0;
        row(has||seen?F.ic:'❓',has||seen?F.n:'Fruit inconnu',has?F.d+' ✨ '+F.pow:seen?'Retrouve-le dans un coffre.':'Cherche-le dans les coffres.',has?(this.fruit===k?'🌀 Actif':'Manger'):null,()=>{ this.eat(k); this.openPanel('fruits'); }); }
    }
  },
  closePanel(){ $('pirPanel').classList.remove('on'); this.panel=null; },
  onKey(code){ if(code==='KeyF') this.power(); else if(code==='KeyG') this.toggleForm(); else if(code==='KeyB') this.summonBoat(); else if(code==='KeyR') this.panel==='fruits'?this.closePanel():this.openPanel('fruits'); else if(code==='Escape') this.closePanel(); },
  /* ---------- boucle ---------- */
  update(dt){
    this.acd-=dt; this.pcd-=dt; this.hurtT-=dt; if(P.inv>0) P.inv-=dt;
    this.water.position.y=0.62+Math.sin(this.time*1.3)*0.04;
    if(this.sail) this.sailStep(dt);
    else { if(P.y<-6){ P.y=2; } }
    if(!this.sail&&this.form==='drag'&&!P.fly){ P.fly=true; $('hud').classList.add('flying'); }
    this.updForm(dt); this.updEnemies(dt); this.updShots(dt); this.updIce(dt);
    for(const q of this.pearls){ if(q.taken) continue; q.t+=dt; q.m.rotation.y+=dt*3; q.g.position.y=q.y+Math.sin(q.t*3)*0.12;
      if(Math.hypot(P.x-q.x,P.y+0.9-q.y,P.z-q.z)<1.7){ q.taken=true; this.scene.remove(q.g); addCoins(2); sfx('coin'); } }
    this.regenT+=dt; if(this.regenT>6&&this.hp<this.hpMax){ this.hp=Math.min(this.hpMax,this.hp+dt*3); }
    const m=this.merchant; if(m){ m.A.root.rotation.y=Math.atan2(P.x-m.x,P.z-m.z)*0.4+Math.PI*0.5; animAvatar(m.A,dt,0,true); }
    for(const c of this.chests){ if(!c.open&&Math.hypot(P.x-c.x,P.z-c.z)<2.8&&!this.noHint&&this.time-(this.hintT||-9)>4){ this.hintT=this.time; toast('⚔️ / E : ouvrir le coffre'); } }
    this.compass();
  },
  updForm(dt){
    const sp=Math.hypot(P.vx,P.vz), t=this.time;
    if(this.fm){ this.fm.anim(t,sp); }
    if(this.form==='fire'||this.form==='drag'&&this.breath>0){ if(Math.random()<0.5) burst(this.scene,P.x+rand(-0.3,0.3),P.y+rand(0.2,1.8),P.z+rand(-0.3,0.3),Math.random()<0.5?'#ff8a1f':'#ffd23f',1,1.2,true); }
    if(this.form==='bolt'&&Math.random()<0.3) burst(this.scene,P.x+rand(-0.4,0.4),P.y+rand(0.2,1.8),P.z+rand(-0.4,0.4),'#fff6a8',1,2,true);
    if(this.form==='ice'&&Math.random()<0.25) burst(this.scene,P.x+rand(-0.4,0.4),P.y+rand(0.2,1.8),P.z+rand(-0.4,0.4),'#dff6ff',1,0.8,true);
    if(this.breath>0){ this.breath-=dt; const dx=Math.sin(P.yaw), dz=Math.cos(P.yaw); for(let k=0;k<3;k++){ const r=rand(1.5,8); burst(this.scene,P.x+dx*r+rand(-1,1),P.y+1.2+rand(-0.6,0.6),P.z+dz*r+rand(-1,1),Math.random()<0.5?'#ff6a00':'#ffd23f',1,2,true); } }
    if(this.pounce>0){ this.pounce-=dt; for(const e of this.enemies){ if(e.dead||this.hitSet.has(e)) continue; if(Math.hypot(e.x-P.x,e.z-P.z)<2.4&&Math.abs(e.y-P.y)<3){ this.hitSet.add(e); this.dmgEnemy(e,38,P.x,P.z); } } if(P.onGround&&this.pounce<0.5) this.pounce=0; }
    if(this.form==='cat'&&this.fm) this.fm.g.rotation.x=0;
  },
  updShots(dt){
    for(let i=this.shots.length-1;i>=0;i--){ const s=this.shots[i]; s.t-=dt; s.x+=s.vx*dt; s.z+=s.vz*dt; s.m.position.set(s.x,s.y,s.z); if(s.fire&&Math.random()<0.8) burst(this.scene,s.x,s.y,s.z,'#ffb020',1,1,true);
      const gy=Math.max(this.hgt(s.x,s.z),0); let hit=s.t<=0||s.y<gy+0.1||Math.abs(s.x)>PIR_B||Math.abs(s.z)>PIR_B;
      if(!hit) for(const e of this.enemies){ if(!e.dead&&Math.hypot(e.x-s.x,e.z-s.z)<1.2*(e.m.scale.x||1)&&s.y>e.y-0.2&&s.y<e.y+2.6*(e.m.scale.y||1)){ hit=true; break; } }
      if(hit){ this.scene.remove(s.m); this.shots.splice(i,1); sfx('boom'); burst(this.scene,s.x,s.y,s.z,'#ff6a00',16,7,true); burst(this.scene,s.x,s.y,s.z,'#3b3b3b',8,4);
        for(const e of this.enemies){ if(e.dead) continue; const d=Math.hypot(e.x-s.x,e.z-s.z); if(d<s.rad+0.8&&Math.abs(e.y-s.y)<5) this.dmgEnemy(e,Math.round(s.dmg*(1-d/(s.rad+2.5))),s.x,s.z); } } }
  },
  updIce(dt){ for(let i=this.ice.length-1;i>=0;i--){ const t=this.ice[i]; t.t-=dt; if(t.t<3) t.m.visible=Math.floor(this.time*6)%2===0; if(t.t<=0){ this.scene.remove(t.m); const k=this.solids.indexOf(t.b); if(k>=0) this.solids.splice(k,1); this.ice.splice(i,1); } } },
  updEnemies(dt){
    let bossNear=false;
    for(const e of this.enemies){ if(e.dead) continue; e.cd-=dt; e.fz-=dt;
      const dx=P.x-e.x, dz=P.z-e.z, d=Math.hypot(dx,dz); let wx=0, wz=0, sp=0, chase=false;
      if(e.fz>0){ /* gelé */ }
      else if(e.kb>0){ e.kb-=dt; wx=e.kx; wz=e.kz; sp=1; }
      else if(d<e.aggro&&!this.sail&&Math.abs(P.y-e.y)<7&&this.hp>0){ chase=true; e.yaw=angLerp(e.yaw,Math.atan2(dx,dz),Math.min(1,10*dt));
        if(d>e.reach*0.85){ wx=dx/d; wz=dz/d; sp=e.sp; }
        else if(e.cd<=0){ e.cd=e.kind==='boss'?1.1:1.3; e.A.swing=0.28; sfx('swing'); this.hurtP(e.dmg,e.x,e.z); } }
      else { e.wt-=dt; if(e.wt<=0){ e.wt=rand(2,5); const a=rand(0,TAU), r=rand(0,4); e.wx=e.home.x+Math.cos(a)*r; e.wz=e.home.z+Math.sin(a)*r; }
        const ax=e.wx-e.x, az=e.wz-e.z, ad=Math.hypot(ax,az); if(ad>0.6){ wx=ax/ad; wz=az/ad; sp=1.4; e.yaw=angLerp(e.yaw,Math.atan2(ax,az),Math.min(1,5*dt)); } }
      if(e.kind==='boss'){ bossNear=true; if(e.hp<e.max*0.5&&!e.wave){ e.wave=1; for(let k=0;k<3;k++){ const a=k/3*TAU; this.addEnemy('minion',e.x+Math.cos(a)*5,e.z+Math.sin(a)*5,e.isl); } banner('🏴‍☠️ Le Capitaine appelle des renforts !'); }
        if(e.wave&&chase){ e.slam=(e.slam||5)-dt; if(e.slam<=0){ e.slam=6; sfx('boom'); for(let k=0;k<16;k++){ const a=k/16*TAU; burst(this.scene,e.x+Math.cos(a)*5,e.y+0.4,e.z+Math.sin(a)*5,'#ff6a00',2,4,true); } if(d<7&&P.y<e.y+2) this.hurtP(16,e.x,e.z); } } }
      if(sp>0){ const nx=e.x+wx*sp*dt, nz=e.z+wz*sp*dt; const ok=(x,z)=>{ const h=this.hgt(x,z); return h>0&&h<=e.y+1.05&&!this.solids.some(b=>x>b.x0-0.3&&x<b.x1+0.3&&z>b.z0-0.3&&z<b.z1+0.3&&b.y0<e.y+1&&b.y1>e.y+0.6); }; if(ok(nx,e.z)) e.x=nx; if(ok(e.x,nz)) e.z=nz; }
      const gy=this.hgt(e.x,e.z); e.y=lerp(e.y,gy,Math.min(1,12*dt));
      e.m.position.set(e.x,e.y,e.z); e.m.rotation.y=e.yaw; animAvatar(e.A,dt,sp,true); }
    this.enemies=this.enemies.filter(e=>!e.dead);
  },
  /* ---------- boussole et interface ---------- */
  compass(){
    let t=null; if(this.keys>=3){ const c=this.chests.find(c=>c.type==='treasure'); t=c?[c.x,c.z]:null; }
    else { let bd=1e9; for(const e of this.enemies) if(e.key&&!e.dead){ const d=Math.hypot(e.x-P.x,e.z-P.z); if(d<bd){ bd=d; t=[e.x,e.z]; } } }
    if(t) pointCompass(t[0],t[1],Math.round(Math.hypot(t[0]-P.x,t[1]-P.z))+' m');
  },
  hud(){
    setText('pHp',Math.max(0,Math.ceil(this.hp))+'/'+this.hpMax); setText('pFruit',this.fruit?FRUITS[this.fruit].ic+' '+FRUITS[this.fruit].s:'—'); setText('pKeys',this.keys+'/3');
    const b=$('pBossP'); if(b){ const bs=this.enemies.find(e=>e.kind==='boss'); const near=bs&&Math.hypot(bs.x-P.x,bs.z-P.z)<40; b.style.display=near?'':'none'; if(near) setText('pBoss',Math.ceil(bs.hp)+'/'+bs.max); }
    const fp=$('bFruit'); if(fp&&this.pcd!==undefined){ const pw=$('bPow'); if(pw) pw.style.opacity=this.pcd>0?'0.55':'1'; }
  },
  end(win){
    this.over=true; this.setForm(null,true); const t=this.time;
    if(win){ sfx('win'); confetti(this.scene,P.x,P.y+2.2,P.z); addCoins(100); S.pir.wins++; if(!S.pir.time||t<S.pir.time) S.pir.time=Math.floor(t); save();
      showResult({icon:'🏴‍☠️',title:'Trésor trouvé !',sub:'Tu as battu le Capitaine Corbeau et rempli ton coffre d\'or.',stats:[['Temps',fmtTime(t)],['Pirates vaincus',String(this.kills)],['Fruits trouvés',String(this.fruitsFound+1)+'/6'],['Pièces gagnées','+'+this.earned]]}); }
  },
  stop(){ if(this.sail) engineStop(true); this.clearForm(); $('pirPanel').classList.remove('on'); $('hud').classList.remove('flying'); for(const e of this.enemies||[]) disposeAvatar(e.A); if(this.merchant) disposeAvatar(this.merchant.A); }
};
{ const pg=()=>G&&G.id==='pirates'?G:null;
  holdBtn($('bPow'),()=>{ const g=pg(); if(g) g.power(); });
  $('bForm').addEventListener('click',()=>{ const g=pg(); if(g){ sfx('click'); g.toggleForm(); } });
  $('bFruit').addEventListener('click',()=>{ const g=pg(); if(g){ sfx('click'); g.panel==='fruits'?g.closePanel():g.openPanel('fruits'); } });
  $('pFruitP').addEventListener('click',()=>{ const g=pg(); if(g){ sfx('click'); g.panel==='fruits'?g.closePanel():g.openPanel('fruits'); } });
  $('bBoat').addEventListener('click',()=>{ const g=pg(); if(g){ sfx('click'); g.summonBoat(); } }); }
