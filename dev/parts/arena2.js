/* =========================================================
   13. Arène des Slimes : colisée de nuit, nouveaux slimes,
       bonus, combos et améliorations à choisir
   ========================================================= */
Object.assign(SLIME,{
  split:{hp:3,size:1.35,spd:3.3,color:'#b6f25a',coins:3,split:1},
  spit:{hp:2,size:1.0,spd:2.8,color:'#ff9f1c',coins:3,ranged:1},
  bomb:{hp:1,size:0.95,spd:4.4,color:'#4a3a5a',coins:2,bomb:1}
});
const ARENA_UP=[
  {k:'heart',ic:'❤️',t:'Cœur en plus',d:'+1 cœur maximum et soin complet'},
  {k:'dmg',ic:'💪',t:'Coups plus forts',d:'+1 dégât à chaque coup d\'épée'},
  {k:'reach',ic:'🗡️',t:'Grande épée',d:'+25 % de portée'},
  {k:'speed',ic:'👟',t:'Baskets rapides',d:'+12 % de vitesse'},
  {k:'whirl',ic:'🌀',t:'Coup tournoyant',d:'Chaque 4e coup frappe tout autour de toi'},
  {k:'magnet',ic:'🧲',t:'Aimant',d:'Les pièces et les bonus viennent à toi'},
  {k:'thorns',ic:'🌵',t:'Armure à piques',d:'Un slime qui te touche perd 1 PV'}];
const ARENA_PW={heart:{ic:'❤️',n:'Cœur'},speed:{ic:'⚡',n:'Super vitesse'},fire:{ic:'🔥',n:'Épée de feu'},shield:{ic:'🛡️',n:'Bouclier'}};
GAMES.arena={
  hint:'ZQSD / WASD : bouger · Espace : sauter · Clic ou E : épée · Glisser : caméra',
  hudHTML:'<div class="pill" id="hHearts"></div><div class="pill">🌊 <b id="hWave">1</b></div><div class="pill">👾 <b id="hLeft">0</b></div><div class="pill" id="pCombo" style="display:none">🔥 <b id="hCombo">x0</b></div><div class="pill" id="pBossA" style="display:none">👑 <b id="hBossA"></b></div><div class="pill" id="pPw" style="display:none"><b id="hPw"></b></div>',
  speedMul(){ return (this.pw&&this.pw.spd>0?1.35:1)*(1+0.12*(this.up.speed||0)); },
  start(){
    const sc=this.scene; setupScene(sc,'#0b0726','#5a3170',30,105);
    addSky(this,{top:'#07041a',mid:'#24124a',bot:'#5a3170',stars:800,moon:{u:0.62,el:40,r:20},hills:[['#1a0f30',14,0,0.02]],near:34,far:110});
    setLights(this,{hemi:['#9b8cff','#2a1838',0.5],sun:['#c4d0ff',0.5],dir:[-12,30,8]});
    const R=20;
    addBox(this,-R,-1,-R,R,0,R,texMat('stone','#cfc4e0',10));
    const sand=new THREE.Mesh(cyl(13,13,0.04,40),texMat('sand','#f0d9a0',6)); sand.position.y=0.02; sand.receiveShadow=true; sc.add(sand);
    const ring=new THREE.Mesh(cyl(13.4,13.4,0.03,40),lam('#8a6a40')); ring.position.y=0.01; sc.add(ring);
    const wm=texC('stone','#9d93b8');
    addBox(this,-R-1,0,-R-1,R+1,2.2,-R,wm); addBox(this,-R-1,0,R,R+1,2.2,R+1,wm);
    addBox(this,-R-1,0,-R,-R,2.2,R,wm); addBox(this,R,0,-R,R+1,2.2,R,wm);
    for(let i=-R;i<=R;i+=2){ for(const [x,z] of [[i,-R-0.5],[i,R+0.5],[-R-0.5,i],[R+0.5,i]]){ const c=mk(box(0.9,0.6,0.9),wm); c.position.set(x,2.5,z); sc.add(c); } }
    const banC=['#e63946','#4f7bff','#ffd23f','#3ad17a'];
    [[0,-R-1.05,0],[0,R+1.05,Math.PI],[-R-1.05,0,Math.PI/2],[R+1.05,0,-Math.PI/2]].forEach(([x,z,ry],i)=>{ for(const o of [-8,8]){ const b=mk(box(2,3,0.1),lam(banC[i]),false); const dx=Math.cos(ry)*o, dz=-Math.sin(ry)*o;
      b.position.set(x+dx,1.6,z+dz); b.rotation.y=ry; sc.add(b); const e=mk(box(0.8,0.8,0.12),lam('#ffffff'),false); e.position.copy(b.position); e.position.y=1.9; e.rotation.y=ry; sc.add(e); } });
    this.fires=[];
    PILLARS.forEach(([x,z])=>{ addBox(this,x-1,0,z-1,x+1,3,z+1,texC('stone','#bdb2d6')); addBox(this,x-1.2,3,z-1.2,x+1.2,3.4,z+1.2,texC('stone','#8f84ad'));
      const bowl=mk(cyl(0.9,0.5,0.5,10),lam('#3a2a2a')); bowl.position.set(x,3.65,z); sc.add(bowl);
      const fm=new THREE.MeshBasicMaterial({color:'#ffb030',transparent:true,opacity:0.9}); fm.userData.own=true; const f=new THREE.Mesh(cone(0.6,1.4,8),fm); f.position.set(x,4.5,z); sc.add(f);
      const L=new THREE.PointLight('#ff9a40',1.3,22,1.6); L.position.set(x,5,z); sc.add(L); this.fires.push({f,L,x,z,ph:rand(0,6)}); });
    // gradins et spectateurs
    const tierM=texC('stone','#7a7090');
    for(let k=0;k<3;k++){ const a=R+2+k*2, h=1+k*1.3; addBox(this,-a-2,0,-a-2,a+2,h,-a,tierM,null,null); addBox(this,-a-2,0,a,a+2,h,a+2,tierM,null,null); addBox(this,-a-2,0,-a,-a,h,a,tierM,null,null); addBox(this,a,0,-a,a+2,h,a,tierM,null,null); }
    const crowd=[]; for(let k=0;k<3;k++){ const a=R+3+k*2, y=1+k*1.3; for(let i=-a+1;i<a;i+=1.6){ for(const [x,z] of [[i,-a],[i,a],[-a,i],[a,i]]) if(Math.random()<0.62) crowd.push([x+rand(-0.2,0.2),y,z+rand(-0.2,0.2)]); } }
    const n=crowd.length, bm=new THREE.MeshLambertMaterial(); bm.userData.own=true; const hm=new THREE.MeshLambertMaterial(); hm.userData.own=true;
    const bi=new THREE.InstancedMesh(box(0.7,0.9,0.5),bm,n), hi=new THREE.InstancedMesh(box(0.5,0.5,0.5),hm,n), col=new THREE.Color();
    crowd.forEach((c,i)=>{ col.set(CLOTHES[i%CLOTHES.length]); bi.setColorAt(i,col); col.set(SKINS[i%6]); hi.setColorAt(i,col); });
    [bi,hi].forEach(m=>{ if(m.instanceColor) m.instanceColor.needsUpdate=true; m.frustumCulled=false; sc.add(m); });
    this.crowd={bi,hi,list:crowd,ph:crowd.map(()=>rand(0,6)),cheer:0,mtx:new THREE.Matrix4()}; this.posCrowd(0);
    addAmb(this,{kind:'fireflies',color:'#c9a6ff',size:0.22,n:90,glow:true,fixed:true,cx:0,cz:0,w:40,h:8,y0:0.5});
    this.bounds=[-R+0.31,R-0.31,-R+0.31,R-0.31];
    Object.assign(this,{hearts:5,maxH:5,wave:0,slimes:[],toSpawn:0,spawnT:0,breakT:1.6,kills:0,swingCd:0,queue:[],_h:-1,_m:-1,up:{},hitN:0,combo:0,comboT:0,bestCombo:0,pw:{spd:0,fire:0,sh:false},drops:[],goos:[],chT:0,shM:null});
    P.x=0; P.y=0; P.z=3; P.yaw=Math.PI; cam.yaw=0;
    this.introS='Survis aux vagues de slimes !';
    if(IS_TOUCH) banner('Appuie sur ⚔️ pour attaquer !');
  },
  posCrowd(dt){ const C=this.crowd; if(C.cheer>0) C.cheer-=dt; const t=this.time||0, m=C.mtx;
    C.list.forEach(([x,y,z],i)=>{ const j=C.cheer>0?Math.abs(Math.sin(t*9+C.ph[i]))*0.5:Math.abs(Math.sin(t*1.5+C.ph[i]))*0.04;
      m.makeTranslation(x,y+0.45+j,z); C.bi.setMatrixAt(i,m); m.makeTranslation(x,y+1.15+j,z); C.hi.setMatrixAt(i,m); });
    C.bi.instanceMatrix.needsUpdate=true; C.hi.instanceMatrix.needsUpdate=true; },
  spawnSlime(type,at){
    const T=SLIME[type], sz=T.size, g=new THREE.Group();
    const mt=new THREE.MeshLambertMaterial({color:T.color,emissive:'#000000',map:tileTex,transparent:true,opacity:0.92}); mt.userData.own=true;
    const body=mk(box(sz,+(sz*0.8).toFixed(2),sz),mt); body.position.y=sz*0.4; g.add(body);
    const core=mk(box(+(sz*0.5).toFixed(2),+(sz*0.4).toFixed(2),+(sz*0.5).toFixed(2)),lam(shadeHex(T.color,0.7)),false); core.position.y=sz*0.35; g.add(core);
    const eyeW=lam('#ffffff'), eyeB=lam('#1d1846');
    for(const s of [-1,1]){ const e=mk(box(+(sz*0.22).toFixed(2),+(sz*0.26).toFixed(2),0.04),eyeW,false); e.position.set(s*sz*0.2,sz*0.5,sz/2+0.02);
      const p=mk(box(+(sz*0.11).toFixed(2),+(sz*0.14).toFixed(2),0.04),eyeB,false); p.position.set(s*sz*0.2,sz*0.47,sz/2+0.045); g.add(e,p);
      if(type==='spit'||type==='bomb'){ const br=mk(box(+(sz*0.28).toFixed(2),0.05,0.04),eyeB,false); br.position.set(s*sz*0.2,sz*0.66,sz/2+0.05); br.rotation.z=s*0.4; g.add(br); } }
    const mo=mk(box(+(sz*0.22).toFixed(2),+(sz*0.06).toFixed(2),0.04),eyeB,false); mo.position.set(0,sz*0.27,sz/2+0.02); g.add(mo);
    if(type==='king'){ const h=buildHat('crown',S.avatar); h.g.scale.setScalar(sz*1.4); h.g.position.y=sz*0.8; g.add(h.g); }
    if(type==='bomb'){ const fu=mk(cyl(0.05,0.05,0.35,6),lam('#c9a46a'),false); fu.position.y=sz*0.95; g.add(fu); const sp=mk(sph(0.1),emat('#ffd23f','#ff6a00'),false); sp.position.y=sz*1.15; g.add(sp); }
    if(type==='spit'){ const sn=mk(cyl(0.12,0.18,0.3,8),lam('#c26a00'),false); sn.rotation.x=Math.PI/2; sn.position.set(0,sz*0.3,sz/2+0.12); g.add(sn); }
    let x,z; if(at){ x=at[0]; z=at[1]; } else { const a=Math.random()*TAU, r=rand(12,17.5); x=clamp(Math.cos(a)*r,-18.5,18.5); z=clamp(Math.sin(a)*r,-18.5,18.5); }
    g.position.set(x,0,z); g.scale.setScalar(0.01); this.scene.add(g);
    const hp=Math.ceil(T.hp*(1+Math.max(0,this.wave-6)*0.12));
    const s={g,mt,T,type,x,y:0,z,vx:0,vy:0,vz:0,hp,max:hp,r:sz*0.5,hopT:rand(0.5,1.2),ground:true,sq:0,flash:0,born:at?0.5:0,dead:false,shotT:rand(1.5,3),fuse:0};
    if(at){ s.vy=6; s.ground=false; s.vx=rand(-4,4); s.vz=rand(-4,4); }
    this.slimes.push(s); burst(this.scene,x,0.5,z,T.color,8,4); return s;
  },
  nextWave(){
    this.wave++; const w=this.wave, n=Math.min(2+w*2,20), q=[];
    for(let i=0;i<n;i++){ const r=Math.random(); let t='green';
      if(w>=6&&r<0.12) t='bomb'; else if(w>=5&&r<0.24) t='spit'; else if(w>=3&&r<0.36) t='split'; else if(w>=4&&r<0.5) t='purple'; else if(w>=2&&r<0.68) t='blue'; q.push(t); }
    if(w%5===0) q[0]='king';
    this.queue=q; this.toSpawn=n; this.spawnT=0.3;
    if(w>S.best.arena){ S.best.arena=w; saveSoon(); }
    const nw={3:'🥬 Nouveau : le slime qui se divise !',5:'🧡 Nouveau : le slime cracheur !',6:'💣 Nouveau : le slime bombe ! Frappe-le près des autres'}[w];
    banner(w%5===0?'Vague '+w+' : le Roi Slime ! 👑':nw||'Vague '+w); sfx('cp');
  },
  updSlimes(dt){
    const L=this.slimes;
    for(const s of L){
      if(s.born<1) s.born=Math.min(1,s.born+dt*3);
      const dx=P.x-s.x, dz=P.z-s.z, d=Math.hypot(dx,dz)||1;
      s.hopT-=dt;
      if(s.ground&&s.hopT<=0&&s.born>=1&&s.fuse<=0){ const away=s.T.ranged&&d<7?-1:1; s.vx=dx/d*s.T.spd*away; s.vz=dz/d*s.T.spd*away; s.vy=rand(6,8)*(s.type==='king'?1.1:1); s.ground=false; s.hopT=rand(0.55,1.05)*(s.type==='king'?1.4:1); }
      s.vy-=24*dt; s.x+=s.vx*dt; s.y+=s.vy*dt; s.z+=s.vz*dt;
      if(s.y<=0){ s.y=0; if(!s.ground){ s.sq=1; if(s.type==='king'&&s.born>=1) this.slam(s); } s.ground=true; s.vy=0; const f=Math.exp(-12*dt); s.vx*=f; s.vz*=f; }
      const lim=19.5-s.r; s.x=clamp(s.x,-lim,lim); s.z=clamp(s.z,-lim,lim);
      for(const [px,pz] of PILLARS){ const hx=1.2+s.r, ox=s.x-px, oz=s.z-pz;
        if(Math.abs(ox)<hx&&Math.abs(oz)<hx&&s.y<3.4){
          if(hx-Math.abs(ox)<hx-Math.abs(oz)){ s.x=px+(ox<0?-hx:hx); s.vx=0; if(Math.abs(s.vz)<1.5) s.vz=(oz>=0?1:-1)*s.T.spd; }
          else { s.z=pz+(oz<0?-hx:hx); s.vz=0; if(Math.abs(s.vx)<1.5) s.vx=(ox>=0?1:-1)*s.T.spd; } } }
      if(s.T.ranged&&s.born>=1&&!this.over){ s.shotT-=dt; if(s.shotT<=0&&d<16){ s.shotT=rand(2.2,3.2); this.goo(s); } }
      if(s.T.bomb&&s.born>=1){ if(s.fuse<=0&&d<2.6) { s.fuse=1.1; sfx('nope'); } if(s.fuse>0){ s.fuse-=dt; s.flash=0.2; if(s.fuse<=0) this.explode(s,true); } }
    }
    for(let a=0;a<L.length;a++) for(let b=a+1;b<L.length;b++){ const A=L[a], B=L[b], dx=B.x-A.x, dz=B.z-A.z, d=Math.hypot(dx,dz), m=A.r+B.r;
      if(d<m&&d>0.001){ const p=(m-d)/2, nx=dx/d, nz=dz/d; A.x-=nx*p; A.z-=nz*p; B.x+=nx*p; B.z+=nz*p; } }
    for(const s of L){ if(s.dead) continue;
      s.sq=Math.max(0,s.sq-dt*4);
      const air=s.ground?0:clamp(s.vy*0.03,-0.15,0.2), fz=s.fuse>0?1+Math.sin(this.time*30)*0.08:1;
      const sy=(1-s.sq*0.35+air)*s.born*fz, sxz=(1+s.sq*0.25-air*0.5)*s.born*fz;
      s.g.scale.set(sxz,sy,sxz); s.g.position.set(s.x,s.y,s.z); s.g.rotation.y=Math.atan2(P.x-s.x,P.z-s.z);
      if(s.flash>0){ s.flash-=dt; const f=Math.max(0,Math.min(0.8,s.flash*5)); if(s.fuse>0) s.mt.emissive.setRGB(Math.floor(this.time*10)%2?0.9:0.2,0,0); else s.mt.emissive.setRGB(f,f,f); }
      if(s.born>=1&&P.inv<=0&&!this.over){ const hd=Math.hypot(P.x-s.x,P.z-s.z);
        if(hd<s.r+0.38&&s.y<P.y+1.7&&s.y+s.T.size*0.8>P.y){ this.hurt(s.x,s.z); if(this.up.thorns){ s.hp--; s.flash=0.16; if(s.hp<=0) this.kill(s); } } }
    }
  },
  goo(s){ const g=mk(sph(0.28),emat('#ffb020','#a05000'),false); const dx=P.x-s.x, dz=P.z-s.z, d=Math.hypot(dx,dz)||1, T=Math.max(0.6,d/11);
    g.position.set(s.x,s.y+0.6,s.z); this.scene.add(g); this.goos.push({g,x:s.x,y:s.y+0.6,z:s.z,vx:dx/T,vz:dz/T,vy:(P.y+0.8-(s.y+0.6))/T+12*T,t:T+0.6}); sfx('boing'); },
  slam(s){ sfx('boom'); for(let k=0;k<18;k++){ const a=k/18*TAU; burst(this.scene,s.x+Math.cos(a)*3.5,0.3,s.z+Math.sin(a)*3.5,'#ff5d73',2,3); }
    if(Math.hypot(P.x-s.x,P.z-s.z)<4.2&&P.y<0.6&&P.inv<=0) this.hurt(s.x,s.z); },
  explode(s,fused){ if(s.dead) return; s.dead=true; this.scene.remove(s.g); s.mt.dispose(); sfx('boom');
    burst(this.scene,s.x,0.8,s.z,'#ff6a00',22,8,true); burst(this.scene,s.x,0.8,s.z,'#3b3b3b',10,5);
    for(const o of this.slimes){ if(o===s||o.dead) continue; if(Math.hypot(o.x-s.x,o.z-s.z)<3.6){ o.hp-=3; o.flash=0.2; if(o.hp<=0) this.kill(o); } }
    if(fused&&Math.hypot(P.x-s.x,P.z-s.z)<3.2&&P.inv<=0) this.hurt(s.x,s.z);
    if(!fused){ this.kills++; for(let i=0;i<s.T.coins;i++) makeCoin(this,s.x+rand(-0.8,0.8),0.8,s.z+rand(-0.8,0.8)); } },
  hurt(fx,fz){
    if(this.pw.sh){ this.pw.sh=false; P.inv=1.2; sfx('cp'); burst(this.scene,P.x,P.y+1,P.z,'#8fd0ff',16,5,true); banner('🛡️ Le bouclier t\'a protégé !'); return; }
    this.hearts--; P.inv=1.6; const dx=P.x-fx, dz=P.z-fz, d=Math.hypot(dx,dz)||1;
    P.vx=dx/d*10; P.vz=dz/d*10; P.vy=6; P.onGround=false; P.knock=0.25; sfx('hurt'); flashHurt(); this.combo=0;
    if(this.hearts<=0) this.lose();
  },
  onAction(){
    if(this.over||this.swingCd>0) return; this.swingCd=0.3; PA.swing=0.28; sfx('swing');
    let best=null, bd=4.5;
    for(const s of this.slimes){ if(s.dead) continue; const d=Math.hypot(s.x-P.x,s.z-P.z); if(d<bd){ bd=d; best=s; } }
    if(best) P.yaw=Math.atan2(best.x-P.x,best.z-P.z);
    const fx=Math.sin(P.yaw), fz=Math.cos(P.yaw), fire=this.pw.fire>0;
    this.hitN++; const whirl=this.up.whirl&&this.hitN%4===0, reach=(2.8*(1+0.25*(this.up.reach||0)))*(fire?1.3:1)*(whirl?1.15:1), dmg=(1+(this.up.dmg||0))*(fire?2:1);
    if(whirl){ for(let k=0;k<14;k++){ const a=k/14*TAU; burst(this.scene,P.x+Math.cos(a)*reach*0.8,P.y+1,P.z+Math.sin(a)*reach*0.8,'#bfe9ff',1,2,true); } }
    if(fire) burst(this.scene,P.x+fx*1.6,P.y+1.1,P.z+fz*1.6,'#ff8a1f',6,4,true);
    let hit=0;
    for(const s of this.slimes){ if(s.born<1||s.dead) continue;
      const dx=s.x-P.x, dz=s.z-P.z, d=Math.hypot(dx,dz);
      if(d>reach+s.r*0.6||Math.abs(s.y-P.y)>2.2) continue;
      if(!whirl&&d>0.5&&(dx*fx+dz*fz)/d<-0.1) continue;
      s.hp-=dmg; s.flash=0.16; const n=d||1; if(s.type!=='king'){ s.vx=dx/n*9; s.vz=dz/n*9; s.vy=5; s.ground=false; s.hopT=0.9; } hit++;
      sfx('hit'); burst(this.scene,s.x,s.y+s.r,s.z,fire?'#ff8a1f':'#ffffff',4,3);
      if(s.hp<=0){ if(s.T.bomb) this.explode(s,false); else this.kill(s); }
    }
    if(hit){ this.combo+=hit; this.comboT=1.8; if(this.combo>this.bestCombo) this.bestCombo=this.combo;
      if(this.combo>=10&&Math.floor((this.combo-hit)/10)<Math.floor(this.combo/10)){ addCoins(5); banner('🔥 Combo x'+this.combo+' ! +5 🪙'); this.crowd.cheer=1.2; } }
  },
  onTap(){ this.onAction(); },
  kill(s){
    if(s.dead) return; s.dead=true; this.scene.remove(s.g); s.mt.dispose(); this.kills++;
    burst(this.scene,s.x,s.y+s.r,s.z,s.T.color,16,6); sfx('poof');
    for(let i=0;i<s.T.coins;i++) makeCoin(this,s.x+rand(-0.8,0.8),0.8,s.z+rand(-0.8,0.8));
    if(s.T.split) for(let i=0;i<3;i++) this.spawnSlime('green',[s.x+rand(-0.5,0.5),s.z+rand(-0.5,0.5)]);
    if(s.type==='king'){ this.crowd.cheer=2.5; this.drop('heart',s.x+1,s.z); this.drop(['fire','shield','speed'][Math.floor(Math.random()*3)],s.x-1,s.z); }
    else if(this.wave>=2&&Math.random()<0.13) this.drop(['heart','speed','fire','shield'][Math.floor(Math.random()*4)],s.x,s.z);
  },
  drop(k,x,z){ const sp=textSprite(128,128,1.1); setSprite(sp,ARENA_PW[k].ic,'rgba(255,255,255,.85)'); sp.position.set(x,1,z); this.scene.add(sp); this.drops.push({k,sp,x,z,t:12}); },
  takePw(d){ const k=d.k; sfx('gem'); burst(this.scene,d.x,1,d.z,'#ffd23f',12,4,true);
    if(k==='heart'){ this.hearts=Math.min(this.maxH,this.hearts+1); banner('❤️ +1 cœur'); }
    else if(k==='speed'){ this.pw.spd=8; banner('⚡ Super vitesse !'); }
    else if(k==='fire'){ this.pw.fire=8; banner('🔥 Épée de feu : dégâts doublés !'); }
    else if(k==='shield'){ this.pw.sh=true; banner('🛡️ Bouclier : il bloque le prochain coup'); } },
  offerUpgrade(){
    const pool=ARENA_UP.filter(u=>!(u.k==='whirl'&&this.up.whirl)&&!(u.k==='magnet'&&this.up.magnet)&&!(u.k==='thorns'&&this.up.thorns)).sort(()=>Math.random()-0.5).slice(0,3);
    this.chT=15; this.offer=pool;
    openChoice({title:'⭐ Choisis une amélioration',sub:'Bravo pour la vague '+this.wave+' ! (choix automatique dans 15 s)',close:false,items:pool.map(u=>({ic:u.ic,t:u.t,d:u.d,cb:()=>this.applyUp(u)}))});
  },
  applyUp(u){ this.up[u.k]=(this.up[u.k]||0)+1; this.offer=null; sfx('buy'); this.crowd.cheer=1.5;
    if(u.k==='heart'){ this.maxH++; this.hearts=this.maxH; }
    banner(u.ic+' '+u.t+' !'); },
  update(dt){
    this.swingCd-=dt; const pw=this.pw; if(pw.spd>0) pw.spd-=dt; if(pw.fire>0) pw.fire-=dt;
    if(this.comboT>0){ this.comboT-=dt; if(this.comboT<=0) this.combo=0; }
    if(this.choiceOpen){ this.chT-=dt; if(this.chT<=0&&this.offer){ const u=this.offer[0]; closeChoice(); this.applyUp(u); } }
    else if(this.breakT>0){ this.breakT-=dt; if(this.breakT<=0) this.nextWave(); }
    else if(this.toSpawn>0){ this.spawnT-=dt; if(this.spawnT<=0){ this.spawnT=0.55; this.toSpawn--; this.spawnSlime(this.queue.pop()||'green'); } }
    else if(this.slimes.length===0&&this.wave>0){
      this.breakT=2.6; addCoins(this.wave*3); if(this.hearts<this.maxH) this.hearts++; this.crowd.cheer=2;
      sfx('cp'); banner('Vague '+this.wave+' réussie ! +'+this.wave*3+' 🪙');
      if(this.wave%3===0) setTimeout(()=>{ if(G===this&&!this.over) this.offerUpgrade(); },900);
    }
    this.updSlimes(dt);
    if(this.slimes.some(s=>s.dead)) this.slimes=this.slimes.filter(s=>!s.dead);
    for(let i=this.goos.length-1;i>=0;i--){ const q=this.goos[i]; q.t-=dt; q.vy-=24*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.z+=q.vz*dt; q.g.position.set(q.x,q.y,q.z);
      const hitP=Math.hypot(q.x-P.x,q.z-P.z)<0.7&&q.y>P.y&&q.y<P.y+1.9;
      if(hitP||q.y<0||q.t<=0){ this.scene.remove(q.g); this.goos.splice(i,1); burst(this.scene,q.x,Math.max(0.1,q.y),q.z,'#ffb020',6,3); if(hitP&&P.inv<=0&&!this.over) this.hurt(q.x-q.vx,q.z-q.vz); } }
    for(let i=this.drops.length-1;i>=0;i--){ const d=this.drops[i]; d.t-=dt; d.sp.position.y=1+Math.sin(this.time*3+i)*0.2;
      if(this.up.magnet){ const dx=P.x-d.x, dz=P.z-d.z, dd=Math.hypot(dx,dz); if(dd<7&&dd>0.1){ d.x+=dx/dd*6*dt; d.z+=dz/dd*6*dt; d.sp.position.x=d.x; d.sp.position.z=d.z; } }
      if(d.t<3) d.sp.visible=Math.floor(this.time*8)%2===0;
      if(Math.hypot(P.x-d.x,P.z-d.z)<1.3&&P.y<2){ this.takePw(d); this.scene.remove(d.sp); this.drops.splice(i,1); }
      else if(d.t<=0){ this.scene.remove(d.sp); this.drops.splice(i,1); } }
    if(pw.sh&&!this.shM){ const m=new THREE.MeshBasicMaterial({color:'#8fd0ff',transparent:true,opacity:0.22,depthWrite:false}); m.userData.own=true; this.shM=new THREE.Mesh(sph(1.3),m); this.scene.add(this.shM); }
    if(this.shM){ this.shM.visible=pw.sh; this.shM.position.set(P.x,P.y+0.95,P.z); this.shM.scale.set(1,1.15,1); }
    if(pw.fire>0&&Math.random()<0.5) burst(this.scene,P.x+Math.sin(P.yaw)*0.6+rand(-0.2,0.2),P.y+1.2,P.z+Math.cos(P.yaw)*0.6,'#ff8a1f',1,1.5,true);
    if(pw.spd>0&&Math.hypot(P.vx,P.vz)>3&&Math.random()<0.4) burst(this.scene,P.x,P.y+0.2,P.z,'#ffe14d',1,1,true);
    for(const f of this.fires){ const k=0.85+Math.sin(this.time*13+f.ph)*0.08+Math.sin(this.time*7.3+f.ph*2)*0.07; f.f.scale.set(k,k*1.1,k); f.L.intensity=1.1+(k-0.85)*3; }
    this.posCrowd(dt);
    updateCoins(this,dt,1,true);
  },
  idle(dt){ this.updSlimes(dt); this.posCrowd(dt); },
  lose(){
    this.over=true; save(); closeChoice();
    showResult({icon:'💥',title:'Perdu !',sub:'Les slimes ont gagné cette fois… Retente ta chance !',stats:[['Vague atteinte',this.wave],['Slimes battus',this.kills],['Meilleur combo','x'+this.bestCombo],['Pièces gagnées','+'+this.earned]]});
  },
  stop(){ closeChoice(); },
  hud(){
    if(this._h!==this.hearts||this._m!==this.maxH){ this._h=this.hearts; this._m=this.maxH; const e=$('hHearts'); if(e) e.innerHTML=Array.from({length:this.maxH},(_,i)=>HEART(i<this.hearts)).join(''); }
    setText('hWave','Vague '+Math.max(1,this.wave)); setText('hLeft',this.slimes.length+this.toSpawn);
    const pc=$('pCombo'); if(pc){ pc.style.display=this.combo>=3?'':'none'; setText('hCombo','x'+this.combo); }
    const kg=this.slimes.find(s=>s.type==='king'&&!s.dead), pb=$('pBossA'); if(pb){ pb.style.display=kg?'':'none'; if(kg) setText('hBossA','█'.repeat(Math.max(0,Math.ceil(kg.hp/kg.max*8)))+'░'.repeat(8-Math.max(0,Math.ceil(kg.hp/kg.max*8)))); }
    const pw=this.pw, txt=(pw.spd>0?'⚡'+Math.ceil(pw.spd)+' ':'')+(pw.fire>0?'🔥'+Math.ceil(pw.fire)+' ':'')+(pw.sh?'🛡️':''), pp=$('pPw'); if(pp){ pp.style.display=txt?'':'none'; setText('hPw',txt.trim()); }
  }
};
