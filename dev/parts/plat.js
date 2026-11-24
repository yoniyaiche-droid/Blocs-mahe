/* =========================================================
   21. Royaume Saute-Nuage : plateformes vue de côté, 4 mondes,
       boîtes cadeaux, biscuits, ennemis inventés, bonus
       (bulle, feuille-boomerang, chaussures à ressort),
       arrivée en montgolfière
   ========================================================= */
// morceaux de niveau (12 lignes, haut → bas). Sol en bas (dessus du sol à y=2).
// # sol  = bloc  - nuage traversable  B boîte cadeau (pièce)  P boîte cadeau (bonus)  b biscuit cassable
// o pièce  * grande étoile  ^ pics  T trampoline  e/E ennemis du monde  M plateforme qui glisse  V plateforme qui monte
// c lanterne (point de reprise)  G montgolfière (arrivée)
const PK={
  S:['................','................','................','................','................','................','................','................','................','................','################','################'],
  A:['................','................','................','................','................','......o.o.o.....','................','.....BPBb.......','................','............e...','################','################'],
  H:['................','................','................','................','................','......o.o.......','....o.....o.....','................','.....####.......','...########..e..','################','################'],
  Q:['................','................','................','................','................','................','................','......ooooo.....','......=====.....','................','####.........###','####.........###'],
  R:['..................','..................','..................','..................','..................','............ooo...','..................','..........======..','.......===........','....===.....e.....','##################','##################'],
  J:['................','......oo*oo.....','................','................','................','................','................','................','................','....T......E....','################','################'],
  K:['..................','..................','..................','..................','..................','..................','.....o....o.......','....===..===......','..................','..^^^^^^^^^^^.....','##################','##################'],
  C:['................','................','..........*.....','................','.........---....','................','....---.........','................','..........---...','..e.............','################','################'],
  W:['....................','....................','....................','....................','....................','....................','.......o.o.o.o......','....................','......M.............','....................','####............####','####............####'],
  L:['................','................','................','..........ooooo.','..........######','..........######','..........######','..........######','..........######','........V.######','################','################'],
  Z:['................','................','................','................','................','.......bbb......','.......b*b......','.......bbb......','................','...e..........E.','################','################'],
  F:['................','................','................','................','................','.....o..o..o....','................','....B...P...B...','................','..e....E....e...','################','################'],
  X:['................','................','................','................','................','................','................','................','.....o..o..o....','....==.==.==....','###..........###','###..........###'],
  K2:['............','............','............','............','............','............','............','............','............','......c.....','############','############'],
  G:['................','................','................','................','................','................','................','................','................','...........G....','################','################']};
const PWORLDS=[
  {n:'Prairie Fleurie',ic:'🌼',e:'a',E:'s',lv:'S A H Q J R K2 C K F Z X G',bg:'linear-gradient(140deg,#5fcf5a,#8fd0ff)',
    sky:{top:'#3d94ff',mid:'#8fd4ff',bot:'#e8f8ff',sun:{u:0.3,el:30,r:20},hills:[['#a8e08a',18,0,0.012],['#7fcf6a',10,0,0.02]],near:60,far:170},
    lights:{hemi:['#ffffff','#7a9a5a',0.66],sun:['#fff4dc',0.74]},top:'#5fcf5a',dirt:'#a8743f',plat:'#d39a5c',far:['#b8e6a0','#8fd47e'],prop:'tree',amb:{kind:'petals',color:'#ffd6f0',size:0.18,n:90,rel:true}},
  {n:'Désert Caramel',ic:'🌵',e:'k',E:'h',lv:'S H A K J Q K2 R C W F Z G',bg:'linear-gradient(140deg,#ffb347,#ff7e5f)',
    sky:{top:'#ff9e5e',mid:'#ffc78a',bot:'#ffe8c0',sun:{u:0.55,el:14,r:26,c:'#fff1c4',glow:'rgba(255,190,120,.85)',gl:7},hills:[['#f0b070',22,0,0.01],['#e0965a',12,0,0.018]],near:55,far:160},
    lights:{hemi:['#ffe6c8','#a0704a',0.62],sun:['#ffd6a0',0.82]},top:'#f3cf7a',dirt:'#d9965a',plat:'#c98a5a',far:['#e9a86a','#d4864a'],prop:'cactus',amb:{kind:'dust',color:'#fff0c8',size:0.16,n:70,rel:true}},
  {n:'Grotte Cristal',ic:'💎',e:'s',E:'f',lv:'S A R Z Q K2 C F X L J K G',bg:'linear-gradient(140deg,#3a1d6e,#2bd5ff)',dark:1,
    sky:{top:'#0b0620',mid:'#1d1040',bot:'#3a2470',stars:300,near:30,far:110},
    lights:{hemi:['#9b8cff','#1a1030',0.5],sun:['#c8b8ff',0.45]},top:'#7a6aa8',dirt:'#4a3a6a',plat:'#5fd8ff',far:['#2a1a50','#20143e'],prop:'crystal',amb:{kind:'fireflies',color:'#9ffcff',size:0.22,n:70,glow:true,rel:true}},
  {n:'Château des Nuages',ic:'☁️',e:'f',E:'h',lv:'S Q W C X K2 L J K W F Z Q G',bg:'linear-gradient(140deg,#ff9ecf,#7b8cff)',
    sky:{top:'#5a5cd8',mid:'#c89ae8',bot:'#ffd6e8',sun:{u:0.7,el:10,r:24,c:'#fff0f8',glow:'rgba(255,200,230,.85)',gl:7},near:60,far:170},
    lights:{hemi:['#fff0ff','#8a7ab8',0.68],sun:['#ffe8f4',0.72]},top:'#fff4fb',dirt:'#b9a6ea',plat:'#ff9ecf',far:['#e8dcff','#d6c4ff'],prop:'cloud',cloudy:1,amb:{kind:'dust',color:'#ffffff',size:0.2,n:80,rel:true}}];
const PL={g:38,jv:16.6,run:7.6,acc:46,air:28,fric:34,fall:22,coy:0.1,w:0.34,h:1.45};
const PE={a:{n:'Glandouille',w:0.9,h:0.95,sp:1.6,col:'#a0703c'},s:{n:'Escargouille',w:1.0,h:0.9,sp:0.9,col:'#ff8fc7'},k:{n:'Crabouille',w:1.1,h:0.8,sp:2.4,col:'#ff5a3c'},
  h:{n:'Piquou',w:0.95,h:0.9,sp:1.4,spiky:1,col:'#8a6a5a'},f:{n:'Bzzou',w:0.9,h:0.8,fly:1,col:'#ffd23f'}};
function plTex(fn){ const c=makeCanvas(64,64), g=c.getContext('2d'); fn(g); const t=new THREE.CanvasTexture(c); t.isOwn=true; t.magFilter=THREE.NearestFilter; return t; }
function plEnemyMesh(k){
  const g=new THREE.Group(), add=(geo,mat,x,y,z)=>{ const m=mk(geo,mat); m.position.set(x,y,z); g.add(m); return m; }, E=PE[k];
  const eyes=(y,z,s)=>{ for(const q of [-1,1]){ add(box(0.18*s,0.2*s,0.06),lam('#ffffff'),q*0.17*s,y,z); add(box(0.09*s,0.12*s,0.07),lam('#1d1846'),q*0.15*s,y-0.02,z+0.01); const b=add(box(0.22*s,0.05,0.07),lam('#1d1846'),q*0.17*s,y+0.14*s,z); b.rotation.z=q*0.35; } };
  if(k==='a'){ add(box(0.8,0.6,0.7),lam('#e8b878'),0,0.42,0); add(box(0.9,0.3,0.8),lam('#7a4b23'),0,0.82,0); add(box(0.12,0.18,0.12),lam('#5a3a1e'),0,1.03,0); eyes(0.5,0.36,1); for(const q of [-1,1]) add(box(0.22,0.14,0.3),lam('#5a3a1e'),q*0.22,0.07,0.05); }
  else if(k==='s'){ add(box(1.0,0.32,0.6),lam('#ffe0a8'),0,0.16,0); const sh=add(cyl(0.38,0.38,0.5,14),lam(E.col),-0.1,0.6,0); sh.rotation.x=Math.PI/2; add(cyl(0.22,0.22,0.52,12),lam('#ff4f8b'),-0.1,0.6,0).rotation.x=Math.PI/2;
    add(box(0.3,0.45,0.32),lam('#ffe0a8'),0.38,0.42,0); for(const q of [-1,1]){ add(box(0.05,0.25,0.05),lam('#ffe0a8'),0.42,0.75,q*0.1); add(sph(0.06),lam('#1d1846'),0.42,0.88,q*0.1); } }
  else if(k==='k'){ const c=crabMesh(); c.scale.setScalar(1.1); g.add(c); }
  else if(k==='h'){ add(sph(0.45),lam(E.col),0,0.45,0).scale.set(1.15,0.9,1); add(box(0.4,0.3,0.3),lam('#ffe0c8'),0.38,0.38,0); add(sph(0.07),lam('#1d1846'),0.58,0.4,0);
    for(let i=0;i<9;i++){ const a=i/8*Math.PI, s=add(cone(0.1,0.32,5),lam('#5a3a2a'),-Math.cos(a)*0.42,0.45+Math.sin(a)*0.4,(i%2?0.15:-0.15)); s.rotation.z=a-Math.PI/2; } }
  else { add(box(0.7,0.5,0.5),lam(E.col),0,0.4,0); for(const x of [-0.12,0.12]) add(box(0.1,0.52,0.52),lam('#2b2d42'),x,0.4,0); add(box(0.3,0.3,0.4),lam(E.col),0.42,0.45,0); add(sph(0.06),lam('#1d1846'),0.55,0.5,0.12);
    const wm=matC('plwing',()=>new THREE.MeshLambertMaterial({color:'#e8f6ff',transparent:true,opacity:0.75})); for(const q of [-1,1]){ const w=add(box(0.4,0.04,0.28),wm,0,0.72,q*0.2); w.userData.wing=q; } add(cone(0.06,0.2,5),lam('#2b2d42'),-0.44,0.38,0).rotation.z=Math.PI/2; }
  return g;
}
function plBalloon(){
  const g=new THREE.Group(), tx=new THREE.CanvasTexture((()=>{ const c=makeCanvas(128,64), q=c.getContext('2d'); const cols=['#ff4f8b','#ffd23f','#3ad17a','#4f7bff','#9b5de5','#ff9f1c','#2ec4b6','#ffffff']; for(let i=0;i<16;i++){ q.fillStyle=cols[i%8]; q.fillRect(i*8,0,8,64); } return c; })()); tx.isOwn=true;
  const bm=new THREE.MeshLambertMaterial({map:tx}); bm.userData.own=true; const b=mk(new THREE.SphereGeometry(2.6,24,16),bm); b.geometry.userData.own=true; b.scale.set(1,1.15,1); b.position.y=7.2; g.add(b);
  const bk=mk(box(1.8,1.1,1.8),texC('wood','#c98b4f')); bk.position.y=0.55; g.add(bk); const rim=mk(box(1.95,0.15,1.95),lam('#7a4b23')); rim.position.y=1.12; g.add(rim);
  for(const [x,z] of [[-0.8,-0.8],[0.8,-0.8],[-0.8,0.8],[0.8,0.8]]){ const r=mk(box(0.05,3.6,0.05),lam('#5a3a1e')); r.position.set(x*1.05,2.9,z*1.05); g.add(r); }
  const fl=mk(cone(0.3,0.7,8),new THREE.MeshBasicMaterial({color:'#ffb020'})); fl.material.userData.own=true; fl.position.y=4.3; g.add(fl); g.userData.flame=fl; return g;
}
GAMES.plat={
  hint:'← → ou A D : courir · Espace : sauter (garder appuyé = plus haut) · E : lancer la feuille',
  hudHTML:'<div class="pill" id="plH"></div><div class="pill">🪙 <b id="plC">0</b></div><div class="pill">⭐ <b id="plS">0/3</b></div><div class="pill">⏱ <b id="plT">0:00</b></div>',
  far:260, bloom:0.35, bloomTh:0.9,
  start(){
    this.frozen=true; this.ready=false; this.fp=true; setupScene(this.scene,'#3d94ff','#e8f8ff',60,170);
    this.wi=Math.min(S.plat.lv||0,PWORLDS.length-1);
    heroPick(this,'plat',()=>this.pickWorld());
  },
  pickWorld(){
    openChoice({title:'Choisis un monde',sub:'Finis un monde pour débloquer le suivant. Trouve les 3 grandes étoiles !',close:false,wide:true,
      items:PWORLDS.map((w,i)=>{ const st=S.plat.st[i]||0, n=(st&1)+(st>>1&1)+(st>>2&1); return {ic:w.ic,t:w.n,d:i>(S.plat.lv||0)?'Termine le monde '+i+' pour l\'ouvrir':'⭐ '+n+'/3'+(S.plat.best[i]?' · '+fmtTime(S.plat.best[i]):''),lock:i>(S.plat.lv||0),on:i===this.wi,cb:()=>this.build(i)}; })});
  },
  build(wi){
    const W=PWORLDS[wi], sc=this.scene; this.wi=wi; this.W=W;
    addSky(this,W.sky); setLights(this,Object.assign({dir:[-10,18,22]},W.lights));
    if(W.dark){ this.bloom=0.65; this.bloomTh=0.62; }
    // assemblage du niveau
    const rows=[]; for(let r=0;r<12;r++) rows.push('');
    for(const id of W.lv.split(' ')) for(let r=0;r<12;r++) rows[r]+=PK[id][r];
    const NW=rows[0].length; this.NW=NW; this.map=new Array(NW*12).fill('.');
    this.coins=[]; this.stars=[]; this.foes=[]; this.objs=[]; this.boxes={}; this.movers=[]; this.spikes=[]; this.tramps=[]; this.lanterns=[]; this.items=[]; this.leaves=[];
    const groundTop=[], gr=[], dirt=[], plats=[], clouds=[];
    for(let r=0;r<12;r++) for(let i=0;i<NW;i++){ let ch=rows[r][i]; const j=11-r;
      if(ch==='e') ch=W.e; else if(ch==='E') ch=W.E;
      if('#=-Bb P'.indexOf(ch)>=0&&ch!==' '){ if(ch==='P'||ch==='B'||ch==='b') this.mkBox(i,j,ch); else this.map[j*NW+i]=ch; }
      else if(ch==='o') this.coins.push({x:i+0.5,y:j+0.5,on:true});
      else if(ch==='*') this.stars.push({x:i+0.5,y:j+0.5,on:true,k:this.stars.length});
      else if(ch==='^') this.spikes.push({x:i,y:j});
      else if(ch==='T') this.tramps.push({x:i+0.5,y:j,sq:0});
      else if(ch==='c') this.lanterns.push({x:i+0.5,y:j,on:false});
      else if(ch==='G') this.goal={x:i+0.5,y:j};
      else if(ch==='M') this.movers.push({x0:i-1,y0:j,w:4,ax:'x',amp:7,t:0,x:i-1,y:j});
      else if(ch==='V') this.movers.push({x0:i-1,y0:j,w:3,ax:'y',amp:6,t:0,x:i-1,y:j,up:1});
      else if(PE[ch]) this.foes.push({k:ch,x:i+0.5,y:j,x0:i+0.5,y0:j+(PE[ch].fly?2:0),vx:-PE[ch].sp||0,vy:0,dir:-1,dead:0,t:rand(0,6)}); }
    for(let i=0;i<NW;i++) for(let j=0;j<12;j++){ const ch=this.map[j*NW+i];
      if(ch==='#'){ const top=j===11||this.map[(j+1)*NW+i]!=='#'; (top?groundTop:dirt).push([i,j]); if(j===0) gr.push(i); }
      else if(ch==='=') plats.push([i,j]); else if(ch==='-') clouds.push([i,j]); }
    // décor en blocs (instanciés)
    const mtx=new THREE.Matrix4(), v=new THREE.Vector3(), q=new THREE.Quaternion(), s1=new THREE.Vector3(1,1,1);
    const inst=(geo,mat,list,fn)=>{ if(!list.length) return null; const m=new THREE.InstancedMesh(geo,mat,list.length); list.forEach((p,n)=>{ fn(p,v,s1); mtx.compose(v,q,s1); m.setMatrixAt(n,mtx); s1.set(1,1,1); });
      m.instanceMatrix.needsUpdate=true; m.castShadow=true; m.receiveShadow=true; sc.add(m); return m; };
    const topTex=plTex(g=>{ g.fillStyle=W.dirt; g.fillRect(0,0,64,64); g.fillStyle=W.top; g.fillRect(0,0,64,22); for(let i=0;i<8;i++) g.fillRect(i*8+2,22,4,4+(i%3)*3); for(let i=0;i<60;i++){ g.fillStyle='rgba(0,0,0,.08)'; g.fillRect(Math.random()*64,24+Math.random()*40,3,3); } });
    const dirtTex=plTex(g=>{ g.fillStyle=W.dirt; g.fillRect(0,0,64,64); for(let i=0;i<70;i++){ g.fillStyle=i%2?'rgba(0,0,0,.1)':'rgba(255,255,255,.08)'; g.fillRect(Math.random()*64,Math.random()*64,4,4); } });
    const topSide=new THREE.MeshLambertMaterial({map:topTex}), topUp=new THREE.MeshLambertMaterial({color:W.top}), dirtM=new THREE.MeshLambertMaterial({map:dirtTex}); [topSide,topUp,dirtM].forEach(m=>m.userData.own=true);
    inst(box(1,1,3),[topSide,topSide,topUp,dirtM,topSide,topSide],groundTop,([i,j],v)=>v.set(i+0.5,j+0.5,0));
    inst(box(1,1,3),dirtM,dirt,([i,j],v)=>v.set(i+0.5,j+0.5,0));
    inst(box(1,8,3),dirtM,gr,(i,v)=>v.set(i+0.5,-4,0));
    const platTex=plTex(g=>{ g.fillStyle=W.plat; g.fillRect(0,0,64,64); g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(0,30,64,4); g.fillRect(30,0,4,30); g.fillRect(14,34,4,30); g.fillRect(46,34,4,30); g.fillStyle='rgba(255,255,255,.25)'; g.fillRect(0,0,64,5); });
    const pm=W.dark?new THREE.MeshLambertMaterial({map:platTex,emissive:'#2a8fd0',emissiveIntensity:0.6}):new THREE.MeshLambertMaterial({map:platTex}); pm.userData.own=true;
    inst(box(1,1,1.6),pm,plats,([i,j],v)=>v.set(i+0.5,j+0.5,0));
    inst(box(1,0.45,1.8),lam('#ffffff'),clouds,([i,j],v)=>v.set(i+0.5,j+0.78,0));
    // pièces instanciées
    this.coinIM=new THREE.InstancedMesh(cyl(0.32,0.32,0.08,16),coinMat(),Math.max(1,this.coins.length)); this.coinIM.castShadow=true; sc.add(this.coinIM);
    for(const s of this.stars){ const m=mk(oct(0.45),emat('#ffe066','#a07800')); m.scale.set(1,1,0.5); m.position.set(s.x,s.y,0); sc.add(m); s.m=m; }
    for(const p of this.spikes){ const g=new THREE.Group(); for(let k=0;k<3;k++){ const c=mk(cone(0.16,0.5,4),lam('#c0c8d4')); c.position.set(p.x+0.2+k*0.3,p.y+0.25,0); g.add(c); const c2=c.clone(); c2.position.z=0.5; g.add(c2); } sc.add(g); }
    for(const t of this.tramps){ const g=new THREE.Group(); const b=mk(cyl(0.45,0.45,0.3,14),lam('#3b82f6')); b.position.y=0.15; g.add(b); const top=mk(cyl(0.5,0.5,0.12,14),lam('#ff4f6d')); top.position.y=0.42; g.add(top); g.position.set(t.x,t.y,0); sc.add(g); t.g=g; t.top=top; }
    for(const l of this.lanterns){ const g=new THREE.Group(); const p=mk(box(0.15,2,0.15),lam('#2b2d42')); p.position.y=1; g.add(p); const lm=new THREE.MeshLambertMaterial({color:'#9aa0aa',emissive:'#000000'}); lm.userData.own=true; const h=mk(box(0.5,0.6,0.5),lm); h.position.y=2.2; g.add(h); g.position.set(l.x,l.y,-0.6); sc.add(g); l.mat=lm; }
    for(const m of this.movers){ const g=mk(box(m.w,0.45,1.6),W.cloudy?lam('#ffffff'):texC('wood','#e8c08a')); sc.add(g); m.g=g; }
    for(const f of this.foes){ f.g=plEnemyMesh(f.k); f.g.position.set(f.x,f.y,0); sc.add(f.g); }
    if(this.goal){ this.balloon=plBalloon(); this.balloon.position.set(this.goal.x,this.goal.y,0); sc.add(this.balloon); }
    this.decor(W);
    if(W.amb) addAmb(this,W.amb);
    // départ
    this.spawn={x:2.5,y:2}; P.x=2.5; P.y=2; P.vx=P.vy=0; this.face=1; this.hearts=3+(this.pk.hp||0); this.maxH=this.hearts; this.coinsGot=0; this.starsGot=0; this.t0=this.time;
    this.bubble=this.pk.bubble?1:0; this.leaf=0; this.spring=0; this.inv=0; this.coy=0; this.onGround=false; this.won=false; this.cx=P.x; this.cy=6;
    PA.root.scale.setScalar(0.78); this.fp=false; this.ready=true; this.updCoins(0); this.mkBubble();
    $('hud').classList.remove('plLeaf'); $('bAct').textContent='🍃'; banner(W.ic+' '+W.n+' : file jusqu\'à la montgolfière !'); bgmPlay('plat');
  },
  mkBox(i,j,ch){
    const tex=ch==='b'?'plCookie':'plGift'+(i%2), t=matC(tex,()=>new THREE.MeshLambertMaterial({map:plTex(g=>{
      if(ch==='b'){ g.fillStyle='#e8b878'; g.fillRect(0,0,64,64); g.fillStyle='#d9a35f'; g.beginPath(); g.arc(32,32,27,0,TAU); g.fill(); g.fillStyle='#5a3a1e'; for(const [x,y] of [[20,20],[40,16],[30,34],[46,40],[18,44]]){ g.beginPath(); g.arc(x,y,4,0,TAU); g.fill(); } }
      else { g.fillStyle=i%2?'#ff8fc7':'#8fd0ff'; g.fillRect(0,0,64,64); g.fillStyle='#ffffff'; g.fillRect(27,0,10,64); g.fillRect(0,27,64,10); g.fillStyle='#ffd23f'; g.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, r=k%2?6:13; g.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r); } g.fill(); g.strokeStyle='rgba(0,0,0,.2)'; g.lineWidth=3; g.strokeRect(1,1,62,62); } })}));
    const m=mk(box(0.98,0.98,1.2),t); m.position.set(i+0.5,j+0.5,0); this.scene.add(m);
    this.map[j*this.NW+i]=ch; this.boxes[j*this.NW+i]={m,ch,bump:0,y:j+0.5};
  },
  decor(W){
    const sc=this.scene, NW=this.NW, rnd=mulberry32(this.wi*31+7), mtx=new THREE.Matrix4(), v=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3();
    // collines lointaines (parallaxe naturelle de la perspective)
    W.far.forEach((c,k)=>{ const cv=makeCanvas(512,128), g=cv.getContext('2d'); g.fillStyle=c; g.beginPath(); g.moveTo(0,128);
      for(let x=0;x<=512;x+=8) g.lineTo(x,128-40-k*14-30*Math.sin(x*0.02+k*2)-16*Math.sin(x*0.051+k)); g.lineTo(512,128); g.fill();
      const t=new THREE.CanvasTexture(cv); t.isOwn=true; t.wrapS=THREE.RepeatWrapping; t.repeat.set(4+k*2,1); const mt=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,fog:true}); mt.userData.own=true;
      const pg=new THREE.PlaneGeometry(NW*3+400,60+k*30); pg.userData.own=true; const m=new THREE.Mesh(pg,mt); m.position.set(NW/2,14+k*8,-40-k*40); m.renderOrder=-5+k; sc.add(m); });
    // accessoires du monde (milieu de plan)
    const P1=[], P2=[], P3=[];
    for(let x=4;x<NW-4;x+=2+rnd()*4){ const z=-3-rnd()*7; P1.push([x,z,0.8+rnd()*0.7]); }
    if(W.prop==='tree'){ const tr=new THREE.InstancedMesh(box(0.5,1,0.5),lam('#8a5a2b'),P1.length), cp=new THREE.InstancedMesh(sph(1),lam('#4cc157'),P1.length);
      P1.forEach(([x,z,k],n)=>{ mtx.compose(v.set(x,2+1.5*k,z),q,s.set(1,3*k,1)); tr.setMatrixAt(n,mtx); mtx.compose(v.set(x,2+3.6*k,z),q,s.set(1.5*k,1.3*k,1.5*k)); cp.setMatrixAt(n,mtx); });
      [tr,cp].forEach(m=>{ m.instanceMatrix.needsUpdate=true; m.castShadow=true; m.frustumCulled=false; sc.add(m); }); }
    else if(W.prop==='cactus'){ const cc=new THREE.InstancedMesh(box(0.6,1,0.6),lam('#3fae4a'),P1.length*3);
      P1.forEach(([x,z,k],n)=>{ mtx.compose(v.set(x,2+1.6*k,z),q,s.set(1,3.2*k,1)); cc.setMatrixAt(n*3,mtx); mtx.compose(v.set(x+0.55,2+1.8*k,z),q,s.set(0.6,1.2*k,0.6)); cc.setMatrixAt(n*3+1,mtx); mtx.compose(v.set(x-0.55,2+2.2*k,z),q,s.set(0.6,1.1*k,0.6)); cc.setMatrixAt(n*3+2,mtx); });
      cc.instanceMatrix.needsUpdate=true; cc.castShadow=true; cc.frustumCulled=false; sc.add(cc); }
    else if(W.prop==='crystal'){ const cm=new THREE.MeshLambertMaterial({color:'#6ff6ff',emissive:'#1ab8d8',emissiveIntensity:0.9}); cm.userData.own=true; const cr=new THREE.InstancedMesh(oct(0.6),cm,P1.length*2);
      P1.forEach(([x,z,k],n)=>{ q.setFromEuler(new THREE.Euler(0,n,0.3)); mtx.compose(v.set(x,2+0.9*k,z),q,s.set(0.9*k,2.2*k,0.9*k)); cr.setMatrixAt(n*2,mtx); mtx.compose(v.set(x+0.8,2+0.5*k,z+0.4),q,s.set(0.5*k,1.2*k,0.5*k)); cr.setMatrixAt(n*2+1,mtx); });
      q.identity(); cr.instanceMatrix.needsUpdate=true; cr.frustumCulled=false; sc.add(cr);
      // plafond de la grotte
      const st=new THREE.InstancedMesh(cone(1,1,6),lam('#3a2a5a'),Math.floor(NW/2)); for(let n=0;n<Math.floor(NW/2);n++){ q.setFromEuler(new THREE.Euler(Math.PI,0,0)); mtx.compose(v.set(n*2+rnd(),17-rnd()*1.5,-2-rnd()*6),q,s.set(0.8+rnd(),2+rnd()*3,0.8+rnd())); st.setMatrixAt(n,mtx); } q.identity(); st.instanceMatrix.needsUpdate=true; st.frustumCulled=false; sc.add(st);
      const ceil=mk(box(NW+80,4,24),lam('#2a1d46')); ceil.position.set(NW/2,20,-6); sc.add(ceil);
      for(let x=20;x<NW;x+=45){ const pl=new THREE.PointLight('#5ff0ff',1.2,22,1.6); pl.position.set(x,6,-3); sc.add(pl); } }
    else { const cl=new THREE.InstancedMesh(sph(1),lam('#ffffff'),P1.length*3);
      P1.forEach(([x,z,k],n)=>{ for(let t=0;t<3;t++){ mtx.compose(v.set(x+t*1.1-1.1,-1+rnd()*2+(t===1?0.5:0),z-4),q,s.set(1.4*k,1*k,1.2*k)); cl.setMatrixAt(n*3+t,mtx); } }); cl.instanceMatrix.needsUpdate=true; cl.frustumCulled=false; sc.add(cl);
      // tours du château au loin
      for(let x=20;x<NW;x+=55){ const g=new THREE.Group(); const t=mk(cyl(2.2,2.6,14,10),lam('#f6e8ff')); t.position.y=5; g.add(t); const r=mk(cone(2.8,4,10),lam('#ff8fc7')); r.position.y=14; g.add(r); g.position.set(x,0,-22); sc.add(g); } }
    // fleurs, cailloux ou cristaux au bord du sol
    for(let x=1;x<NW;x+=1+Math.floor(rnd()*3)){ const top=this.topAt(x); if(top<0) continue; P2.push([x+rnd(),top,1.1+rnd()*0.3]); }
    if(P2.length){ const fm=W.dark?matC('plgl',()=>new THREE.MeshBasicMaterial({color:'#9ffcff'})):lam(['#ff4f8b','#ffd23f','#ffffff','#b06bff'][this.wi%4]); const fl=new THREE.InstancedMesh(box(0.16,0.16,0.16),fm,P2.length);
      P2.forEach(([x,y,z],n)=>{ mtx.compose(v.set(x,y+0.1,z),q,s.set(1,1,1)); fl.setMatrixAt(n,mtx); }); fl.instanceMatrix.needsUpdate=true; fl.frustumCulled=false; sc.add(fl); }
    addClouds(this,W.dark?0:14,[0,NW],[18,28],[-30,-12]);
  },
  topAt(x){ const i=Math.floor(x); if(i<0||i>=this.NW) return -1; for(let j=11;j>=0;j--) if(this.map[j*this.NW+i]==='#') return j+1; return -1; },
  solid(i,j){ if(i<0||i>=this.NW) return true; if(j<0||j>11) return false; const c=this.map[j*this.NW+i]; return c==='#'||c==='='||c==='B'||c==='P'||c==='b'||c==='U'; },
  oneway(i,j){ return i>=0&&i<this.NW&&j>=0&&j<=11&&this.map[j*this.NW+i]==='-'; },
  mkBubble(){ const m=new THREE.MeshLambertMaterial({color:'#8fe8ff',transparent:true,opacity:0.32,emissive:'#2a8fb0',depthWrite:false}); m.userData.own=true; this.bubM=new THREE.Mesh(sph(1.15),m); this.bubM.scale.set(0.9,1.15,0.9); this.scene.add(this.bubM); },
  onAction(){ this.throwLeaf(); },
  onKey(code){ if(code==='KeyW'||code==='ArrowUp') P.jumpBuf=0.15; },
  throwLeaf(){ if(!this.ready||this.won||!this.leaf||this.leaves.length>=1) return;
    const m=mk(box(0.6,0.08,0.34),lam('#3fae4a')); m.position.set(P.x,P.y+0.9,0.2); this.scene.add(m); this.leaves.push({x:P.x,y:P.y+0.9,vx:this.face*14,t:0,m}); sfx('swing'); },
  hurt(){ if(this.inv>0||this.won) return;
    if(this.bubble){ this.bubble=0; this.inv=1.2; P.inv=1.2; sfx('pop'in SFX?'pop':'squeak'); burst(this.scene,P.x,P.y+1,0.5,'#8fe8ff',12,5,true); banner('🫧 La bulle t\'a protégé !'); return; }
    this.hearts--; this.inv=1.6; P.inv=1.6; P.vy=9; P.vx=-this.face*6; sfx('hurt'); flashHurt(); if(this.hearts<=0) this.respawn(true); },
  respawn(full){ P.x=this.spawn.x; P.y=this.spawn.y; P.vx=P.vy=0; this.inv=1.5; P.inv=1.5; if(full){ this.hearts=this.maxH; banner('💪 On repart de la lanterne !'); } this.cx=P.x; },
  update(dt){
    if(!this.ready) return;
    for(const m of this.movers){ m.t+=dt; const f=(1-Math.cos(m.t*(m.ax==='x'?0.9:0.7)))/2, nx=m.ax==='x'?m.x0+f*m.amp:m.x0, ny=m.ax==='y'?m.y0+f*m.amp:m.y0; m.dx=nx-m.x; m.dy=ny-m.y; m.x=nx; m.y=ny; m.g.position.set(m.x+m.w/2,m.y+0.22,0); }
    if(this.onMover&&!this.won){ P.x+=this.onMover.dx; P.y+=this.onMover.dy; }
    const n=Math.max(1,Math.ceil(dt/0.008)), h=dt/n; for(let k=0;k<n;k++) this.step(h);
    this.inv=Math.max(0,this.inv-dt); if(this.spring>0) this.spring-=dt;
    const t=this.time;
    // pièces, étoiles, bonus
    let cn=0; for(const c of this.coins){ if(c.on&&Math.abs(c.x-P.x)<0.75&&c.y>P.y-0.2&&c.y<P.y+PL.h+0.3){ c.on=false; this.coinsGot++; addCoins(1); sfx('coin'); cn++; } }
    this.updCoins(dt);
    for(const s of this.stars){ if(!s.on) continue; s.m.rotation.y+=dt*2; s.m.position.y=s.y+Math.sin(t*3+s.k)*0.12;
      if(Math.abs(s.x-P.x)<0.85&&s.y>P.y-0.3&&s.y<P.y+PL.h+0.4){ s.on=false; this.scene.remove(s.m); this.starsGot|=1<<s.k; sfx('gem'); confetti(this.scene,s.x,s.y,0.5); banner('⭐ Grande étoile ! ('+this.nStars()+'/3)'); } }
    for(let i=this.items.length-1;i>=0;i--){ const it=this.items[i]; it.t+=dt; if(it.k==='pop'&&it.t>0.5){ this.scene.remove(it.m); this.items.splice(i,1); continue; } it.y=Math.min(it.y+dt*2.5,it.ty); it.m.position.set(it.x,it.y+Math.sin(t*4)*0.08,0); it.m.rotation.y+=dt*2;
      if(Math.abs(it.x-P.x)<0.9&&it.y>P.y-0.4&&it.y<P.y+PL.h+0.4){ this.scene.remove(it.m); this.items.splice(i,1); this.power(it.k); } }
    // lanternes (point de reprise)
    for(const l of this.lanterns) if(!l.on&&Math.abs(l.x-P.x)<1){ l.on=true; this.spawn={x:l.x,y:l.y}; l.mat.color.set('#ffe066'); l.mat.emissive.set('#ffb020'); sfx('cp'); banner('🏮 Lanterne allumée !'); if(this.hearts<this.maxH) this.hearts=this.maxH; }
    // ennemis
    for(const f of this.foes) this.updFoe(f,dt);
    // feuille-boomerang
    for(let i=this.leaves.length-1;i>=0;i--){ const L=this.leaves[i]; L.t+=dt; if(L.t>0.42){ const dx=P.x-L.x; L.vx+=Math.sign(dx)*48*dt; L.y+=(P.y+0.9-L.y)*Math.min(1,4*dt); }
      L.x+=L.vx*dt; L.m.position.set(L.x,L.y,0.2); L.m.rotation.y+=dt*20;
      for(const f of this.foes) if(!f.dead&&Math.abs(f.x-L.x)<0.8&&Math.abs(f.y+0.45-L.y)<0.8) this.kill(f);
      const bi=Math.floor(L.x), bj=Math.floor(L.y); const b=this.boxes[bj*this.NW+bi]; if(b&&b.ch==='b') this.hitBox(bi,bj);
      if(L.t>0.5&&Math.abs(L.x-P.x)<0.8||L.t>2.5){ this.scene.remove(L.m); this.leaves.splice(i,1); } }
    // trampolines
    for(const tr of this.tramps){ if(tr.sq>0) tr.sq=Math.max(0,tr.sq-dt*4); tr.top.position.y=0.42-Math.sin(tr.sq*Math.PI)*0.25; }
    // animations des boîtes
    for(const k in this.boxes){ const b=this.boxes[k]; if(b.bump>0){ b.bump=Math.max(0,b.bump-dt*5); b.m.position.y=b.y+Math.sin(b.bump*Math.PI)*0.3; } }
    if(this.bubM){ this.bubM.visible=!!this.bubble; this.bubM.position.set(P.x,P.y+0.75,0); }
    if(this.spring>0&&Math.random()<0.3) burst(this.scene,P.x,P.y+0.1,0.3,'#ffd23f',1,2,true);
    // arrivée
    if(this.goal&&!this.won&&Math.abs(P.x-this.goal.x)<(P.y>this.goal.y+4?2.8:1.4)&&P.y<this.goal.y+10) this.win();
    if(this.won){ this.bal+=dt; this.balloon.position.y=this.goal.y+Math.max(0,this.bal-0.6)*this.bal*2.2; P.x=this.goal.x; P.y=this.balloon.position.y+0.6; P.vx=P.vy=0;
      this.balloon.userData.flame.scale.y=1+Math.random()*0.5; if(this.bal>0.6&&Math.random()<0.2) confetti(this.scene,P.x+rand(-3,3),P.y+rand(0,4),0); }
    if(!this.won) P.yaw=this.face>0?Math.PI/2:-Math.PI/2;
  },
  step(h){
    if(this.won) return;
    const pk=this.pk||{}; let ix=clamp(inp.x,-1,1); const held=inp.jumpHeld||keys.has('ArrowUp')||keys.has('KeyW');
    if(ix) this.face=ix>0?1:-1;
    const want=ix*PL.run*(pk.spd||1), acc=this.onGround?PL.acc:PL.air;
    if(ix) P.vx+=clamp(want-P.vx,-acc*h,acc*h); else P.vx+=clamp(-P.vx,-(this.onGround?PL.fric:PL.air*0.35)*h,(this.onGround?PL.fric:PL.air*0.35)*h);
    if(this.onGround) this.coy=PL.coy; else this.coy-=h;
    if(P.jumpBuf>0){ P.jumpBuf-=h; if(this.coy>0){ P.vy=PL.jv*(pk.jump||1)*(this.spring>0?1.28:1); this.coy=0; P.jumpBuf=0; this.onGround=false; sfx('jump'); } }
    if(P.vy<=0) this.noCut=false; let g=PL.g; if(P.vy>0&&!held&&!this.noCut) g*=2.6; P.vy-=g*h;
    if(pk.glide&&held&&P.vy<-2.4){ P.vy=-2.4; }
    if(P.vy<-PL.fall) P.vy=-PL.fall;
    // axe x
    P.x+=P.vx*h; const w=PL.w, H=PL.h;
    for(let j=Math.floor(P.y+0.02);j<=Math.floor(P.y+H-0.02);j++){
      if(P.vx>0){ const i=Math.floor(P.x+w); if(this.solid(i,j)){ P.x=i-w-1e-4; P.vx=0; } }
      else if(P.vx<0){ const i=Math.floor(P.x-w); if(this.solid(i,j)){ P.x=i+1+w+1e-4; P.vx=0; } } }
    if(P.x<0.4){ P.x=0.4; P.vx=0; }
    // axe y
    const py=P.y; P.y+=P.vy*h; this.onGround=false; this.onMover=null;
    if(P.vy<=0){ const j=Math.floor(P.y);
      for(let i=Math.floor(P.x-w+0.02);i<=Math.floor(P.x+w-0.02);i++){ if(this.solid(i,j)||(this.oneway(i,j)&&py>=j+1-0.02)){ P.y=j+1; P.vy=0; this.onGround=true; break; } }
      if(!this.onGround) for(const m of this.movers){ const top=m.y+0.45; if(P.x+w>m.x&&P.x-w<m.x+m.w&&py>=top-0.05&&P.y<=top&&P.y>top-0.6){ P.y=top; P.vy=0; this.onGround=true; this.onMover=m; break; } }
      if(this.onGround) for(const tr of this.tramps) if(Math.abs(P.x-tr.x)<0.6&&Math.abs(P.y-(tr.y+0.48))<0.6){ P.vy=24*(pk.jump||1); this.noCut=true; this.onGround=false; tr.sq=1; sfx('boing'); }
      for(const tr of this.tramps) if(P.vy<0&&Math.abs(P.x-tr.x)<0.6&&P.y<tr.y+0.55&&P.y>tr.y-0.1){ P.y=tr.y+0.5; P.vy=24*(pk.jump||1); this.noCut=true; tr.sq=1; sfx('boing'); } }
    else { const j=Math.floor(P.y+H); let hit=null, best=9;
      for(let i=Math.floor(P.x-w+0.02);i<=Math.floor(P.x+w-0.02);i++) if(this.solid(i,j)){ const d=Math.abs(i+0.5-P.x); if(d<best){ best=d; hit=i; } }
      if(hit!==null){ P.y=j-H-1e-4; P.vy=0; this.hitBox(hit,j); } }
    // pics et chute
    for(const s of this.spikes) if(P.x+w>s.x+0.1&&P.x-w<s.x+0.9&&P.y<s.y+0.45&&P.y+H>s.y) this.hurt();
    if(P.y<-5){ this.hearts--; sfx('hurt'); if(this.hearts<=0) this.respawn(true); else this.respawn(false); }
  },
  hitBox(i,j){
    const k=j*this.NW+i, b=this.boxes[k]; if(!b) return; b.bump=1;
    for(const f of this.foes) if(!f.dead&&Math.abs(f.x-(i+0.5))<0.9&&Math.abs(f.y-(j+1))<0.3) this.kill(f);
    if(b.ch==='B'){ b.ch='U'; this.map[k]='U'; b.m.material=matC('plUsed',()=>new THREE.MeshLambertMaterial({color:'#b89a7a',map:tileTex})); this.coinsGot++; addCoins(1); sfx('coin');
      const c=mk(cyl(0.32,0.32,0.08,14),coinMat()); c.rotation.x=Math.PI/2; c.position.set(i+0.5,j+1.3,0); this.scene.add(c); this.items.push({k:'pop',x:i+0.5,y:j+1.2,ty:j+2.6,m:c,t:0}); }
    else if(b.ch==='P'){ b.ch='U'; this.map[k]='U'; b.m.material=matC('plUsed',()=>new THREE.MeshLambertMaterial({color:'#b89a7a',map:tileTex}));
      const kd=['bubble','leaf','spring'][Math.floor(Math.random()*3)]; const m=this.powerMesh(kd); m.position.set(i+0.5,j+1,0); this.scene.add(m); this.items.push({k:kd,x:i+0.5,y:j+1,ty:j+1.7,m,t:0}); sfx('squeak'); }
    else if(b.ch==='b'){ this.map[k]='.'; this.scene.remove(b.m); delete this.boxes[k]; burst(this.scene,i+0.5,j+0.5,0.4,'#d9a35f',10,5); sfx('brk'); }
    else sfx('click');
  },
  powerMesh(k){ const g=new THREE.Group();
    if(k==='bubble'){ const m=new THREE.MeshLambertMaterial({color:'#8fe8ff',transparent:true,opacity:0.6,emissive:'#2a8fb0'}); m.userData.own=true; g.add(mk(sph(0.4),m)); const sh=mk(sph(0.1),lam('#ffffff')); sh.position.set(-0.15,0.15,0.3); g.add(sh); }
    else if(k==='leaf'){ const l=mk(box(0.6,0.08,0.34),emat('#3fae4a','#0a4a1a')); l.rotation.z=0.4; g.add(l); g.add(mk(box(0.05,0.3,0.05),lam('#7a4b23'))); }
    else { g.add(mk(cyl(0.18,0.18,0.12,10),lam('#ff4f6d'))); for(let i=0;i<4;i++){ const c=mk(cyl(0.2,0.2,0.05,10),lam('#c0c8d4')); c.position.y=-0.12-i*0.1; g.add(c); } const sh=mk(box(0.42,0.2,0.3),lam('#ffffff')); sh.position.y=0.15; g.add(sh); }
    return g; },
  power(k){
    if(k==='pop') return;
    if(k==='bubble'){ this.bubble=1; banner('🫧 Bulle protectrice !'); }
    else if(k==='leaf'){ this.leaf=1; $('hud').classList.add('plLeaf'); banner(IS_TOUCH?'🍃 Feuille-boomerang : touche 🍃 pour la lancer !':'🍃 Feuille-boomerang : appuie sur E !'); }
    else { this.spring=14; banner('👟 Chaussures à ressort : tu sautes plus haut !'); }
    sfx('buy'); },
  kill(f){ if(f.dead) return; f.dead=1; f.sq=1; burst(this.scene,f.x,f.y+0.5,0.3,PE[f.k].col,10,5); sfx('squish'); addCoins(1); },
  updFoe(f,dt){
    const E=PE[f.k];
    if(f.dead){ f.sq-=dt*3; f.g.scale.set(1.2,Math.max(0.05,f.sq*0.6),1.2); if(f.sq<=0&&f.g.parent){ this.scene.remove(f.g); } return; }
    if(Math.abs(f.x-P.x)>22){ return; }
    f.t+=dt;
    if(E.fly){ f.x=f.x0+Math.sin(f.t*0.9)*2.5; f.y=f.y0+Math.sin(f.t*2.2)*0.7; f.dir=Math.cos(f.t*0.9)>0?1:-1; f.g.traverse(o=>{ if(o.userData.wing) o.rotation.x=Math.sin(f.t*40)*0.6*o.userData.wing; }); }
    else { f.vy-=PL.g*dt; f.y+=f.vy*dt; const j=Math.floor(f.y);
      if(f.vy<=0&&(this.solid(Math.floor(f.x),j))){ f.y=j+1; f.vy=0; }
      const ahead=f.x+f.dir*(E.w/2+0.05), ai=Math.floor(ahead), fj=Math.floor(f.y+0.3);
      if(this.solid(ai,fj)||!this.solid(ai,Math.floor(f.y-0.5))) f.dir*=-1;
      f.x+=f.dir*E.sp*dt; if(f.y<-6){ f.dead=1; f.sq=0; } }
    f.g.position.set(f.x,f.y,0); f.g.rotation.y=f.dir>0?0:Math.PI;
    // contact avec le héros
    const hw=E.w/2;
    if(P.x+PL.w>f.x-hw&&P.x-PL.w<f.x+hw&&P.y<f.y+E.h&&P.y+PL.h>f.y){
      if(P.vy<0&&P.y>f.y+E.h*0.45&&!E.spiky){ this.kill(f); P.vy=(inp.jumpHeld?15:10.5); }
      else this.hurt(); }
  },
  updCoins(dt){ const im=this.coinIM; if(!im) return; const mtx=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), s=new THREE.Vector3(), e=new THREE.Euler(Math.PI/2,0,0,'YXZ');
    this.coins.forEach((c,n)=>{ e.y=this.time*3+c.x*0.3; q.setFromEuler(e); mtx.compose(v.set(c.x,c.y,0),q,s.setScalar(c.on?1:0)); im.setMatrixAt(n,mtx); }); im.instanceMatrix.needsUpdate=true; },
  nStars(){ const s=this.starsGot; return (s&1)+(s>>1&1)+(s>>2&1); },
  win(){
    this.won=true; this.bal=0; sfx('win'); confetti(this.scene,P.x,P.y+2,0.5); if(PA) PA.waveT=5;
    const tm=this.time-this.t0, wi=this.wi, coins=20+this.nStars()*10;
    addCoins(coins); S.plat.st[wi]=(S.plat.st[wi]||0)|this.starsGot; if(!S.plat.best[wi]||tm<S.plat.best[wi]) S.plat.best[wi]=tm; if(wi>=(S.plat.lv||0)&&wi<PWORLDS.length-1) S.plat.lv=wi+1;
    save();
    showResult({icon:'🎈',title:PWORLDS[wi].n+' terminé !',sub:wi<PWORLDS.length-1?'Le monde suivant est ouvert !':'Tu as fini tous les mondes, bravo !',stats:[['Étoiles',this.nStars()+'/3'],['Pièces',this.coinsGot],['Temps',fmtTime(tm)],['Pièces gagnées','+'+(coins+this.coinsGot)]]});
  },
  camUpd(dt){
    if(!this.ready){ camera.position.set(8,7,24); camera.lookAt(8,5,0); return; }
    const asp=camera.aspect||0.5, D=clamp(8.5/(0.83*asp),11,22), k=damp(5,dt);
    this.cx=lerp(this.cx,P.x+this.face*1.6,k); const ty=clamp(P.y+2.2,4.6,this.won?99:13); this.cy=lerp(this.cy,ty,damp(4,dt));
    camera.position.set(this.cx,this.cy+1.4,D); camera.lookAt(this.cx,this.cy,0);
    cam.px=camera.position.x; cam.py=camera.position.y; cam.pz=camera.position.z;
  },
  hud(){
    if(!this.ready) return; setText('plH','❤️'.repeat(Math.max(0,this.hearts))+(this.bubble?' 🫧':''));
    setText('plC',this.coinsGot); setText('plS',this.nStars()+'/3'); setText('plT',fmtTime(this.time-(this.t0||0)));
  },
  idle(dt){ this.update(dt); },
  stop(){ $('hud').classList.remove('plLeaf'); }
};
SONGS.plat={bpm:144,root:62,scale:[0,2,4,5,7,9,11],lead:'square',bass:'triangle',prog:[0,3,4,0],mel:[4,null,4,2,4,null,7,null, 5,null,4,2,0,null,null,null, 2,null,2,4,5,null,4,2, 4,null,null,2,0,null,null,null],drum:'k.h.s.hhk.k.s.h.',vol:0.6,pluck:true};
GAME_EXTRA.push({id:'plat',ic:'🎈',t:'Royaume Saute-Nuage',d:'Cours et saute à travers 4 mondes : boîtes cadeaux, bonus magiques et 3 étoiles cachées par monde !',bg:'linear-gradient(140deg,#5fcf5a,#ff8fc7)',
  best:()=>{ const n=(S.plat.st||[]).reduce((a,v)=>a+(v&1)+(v>>1&1)+(v>>2&1),0); return n||S.plat.lv?'🗺️ '+Math.min(4,(S.plat.lv||0)+1)+'/4 mondes · ⭐ '+n+'/12':'Nouveau !'; }});
