/* =========================================================
   16. Voleurs d'Œufs : ferme, alarmes, animaux brillants,
       œuf doré et compagnon qui te suit
   ========================================================= */
{ const E=GAMES.eggs, st=E.start;
  E.start=function(){
    st.call(this); const sc=this.scene;
    addSky(this,{top:'#4aa8f5',mid:'#9fd8ff',bot:'#fff1c8',sun:{u:0.28,el:28,r:20,c:'#fff8d8'},hills:[['#9ad27a',22,0,0.011],['#7cc35a',12,0,0.02]],near:45,far:125});
    setLights(this,{hemi:['#fff8e6','#8a7a50',0.66],sun:['#fff4dc',0.7],dir:[16,28,14]});
    const zk=[['meadow','#ffffff'],['sand','#ffffff'],['snow','#ffffff'],['rock','#ffffff']];
    for(const b of this.solids){ if(b.y0!==-1||b.y1!==0) continue; const om=b.m.material;
      if(b.z1>=16) b.m.material=texMat('meadow','#ffffff',16,10);
      else { const k=clamp(Math.floor((-4-b.z1)/25+0.01),0,3); b.m.material=texMat(zk[k][0],zk[k][1],16,12.5); }
      if(om&&om.userData&&om.userData.own){ if(om.map) om.map.dispose(); om.dispose(); } }
    // chemin de terre entre les zones
    const path=mk(box(4,0.02,118),texMat('dirt','#ffffff',2,59),false); path.position.set(0,0.011,-44); path.receiveShadow=true; sc.add(path);
    // clôtures
    const wood=texC('wood');
    for(const x of [-16.2,16.2]){ for(let z=14;z>-104;z-=3){ const p=mk(box(0.25,1.1,0.25),wood); p.position.set(x,0.55,z); sc.add(p); }
      const r1=mk(box(0.12,0.12,118),wood); r1.position.set(x,0.8,-44.5); sc.add(r1); const r2=r1.clone(); r2.position.y=0.45; sc.add(r2); }
    // grange et moulin
    const barn=new THREE.Group(), red=lam('#c0392b'), wht=lam('#ffffff');
    const bb=mk(box(8,5,6),red); bb.position.y=2.5; barn.add(bb); const rf=mk(cyl(0.01,4.6,8,4),lam('#7a2a20')); rf.rotation.set(0,Math.PI/4,Math.PI/2); rf.scale.set(1,1,0.8); rf.position.y=5.4; barn.add(rf);
    const door=mk(box(3,3.4,0.1),lam('#8a2a20')); door.position.set(0,1.7,3.02); barn.add(door); for(const r of [0.78,-0.78]){ const x_=mk(box(3.6,0.2,0.12),wht); x_.rotation.z=r; x_.position.set(0,1.7,3.06); barn.add(x_); }
    barn.position.set(10,0,21); barn.rotation.y=Math.PI; sc.add(barn);
    const mill=new THREE.Group(); const tw=mk(cyl(1.1,1.6,7,8),lam('#f2e6d0')); tw.position.y=3.5; mill.add(tw); const cap=mk(cone(1.5,1.6,8),lam('#a0502a')); cap.position.y=7.8; mill.add(cap);
    const hub=new THREE.Group(); hub.position.set(0,6.4,1.5); mill.add(hub); for(let i=0;i<4;i++){ const bl=mk(box(0.6,4.2,0.08),wht); bl.position.y=2.1; const arm=new THREE.Group(); arm.rotation.z=i*Math.PI/2; arm.add(bl); hub.add(arm); }
    mill.position.set(-21,0,-16); mill.rotation.y=Math.PI/2; sc.add(mill); this.mill=hub;
    for(let i=0;i<6;i++){ const hay=mk(cyl(0.8,0.8,1.2,10),lam('#f2c94c')); hay.rotation.z=Math.PI/2; hay.position.set(i%2?18.5:-18.5,0.8,8-i*5); sc.add(hay); }
    addAmb(this,{kind:'snow',color:'#ffffff',size:0.2,n:160,fixed:true,cx:0,cz:-66.5,w:32,h:14});
    addAmb(this,{kind:'embers',color:'#ff8a2a',size:0.2,n:110,glow:true,fixed:true,cx:0,cz:-91.5,w:30,h:10});
    addAmb(this,{kind:'petals',color:'#fff3a0',size:0.16,n:60,fixed:true,cx:0,cz:-16.5,w:30,h:8});
    for(const n of this.nests){ const al=textSprite(96,96,0.9); setSprite(al,'❗','rgba(230,57,70,.9)'); al.visible=false; sc.add(al); n.guard.al=al; }
    this.goldT=rand(50,75); this.gold=null; this.pet=null; this.petSp=null; this.introS='Vole les œufs, fais-les éclore et protège ta base !';
    for(const B of this.bases) for(const s of B.slots) if(s.item&&s.item.sh) this.updLabel(s);
  };
  const ul=E.updLabel; E.updLabel=function(s){ ul.call(this,s); const it=s.item; if(it&&it.kind==='pet'&&it.sh) setSprite(s.lbl,'✨ '+PET_BY_ID[it.sp].n,'rgba(120,80,0,.75)','#ffe680'); };
  const ht=E.hatch; E.hatch=function(B,s){ ht.call(this,B,s); const it=s.item; if(it&&it.kind==='pet'&&Math.random()<0.08){ it.sh=1; this.updLabel(s); if(B===this.home){ banner('✨ Incroyable : un '+PET_BY_ID[it.sp].n+' BRILLANT ! (×3 pièces)'); sfx('win'); this.persistSoon(); } } };
  E.persistSoon=function(){ S.egg.slots=this.home.slots.map(s=>s.item?{k:s.item.kind,r:s.item.r,sp:s.item.sp||null,t:s.item.t||0,sh:s.item.sh?1:0}:null); saveSoon(); };
  const up=E.update; E.update=function(dt){
    up.call(this,dt); const t=this.time, sc=this.scene;
    if(this.mill) this.mill.rotation.z+=dt*0.8;
    for(const n of this.nests){ const g=n.guard; if(!g.al) continue; g.al.visible=!!g.target&&g.stun<=0; if(g.al.visible) g.al.position.set(g.x,3.4+Math.abs(Math.sin(t*8))*0.2,g.z); }
    for(const s of this.home.slots){ const it=s.item; if(it&&it.kind==='pet'&&it.sh){ S.egg.bank+=RAR[it.r].inc*2*dt; if(Math.random()<dt*3) burst(sc,s.x+rand(-0.4,0.4),1+rand(0,0.6),s.z+rand(-0.4,0.4),'#ffe680',1,1.5,true); } }
    for(const B of this.bases) if(B!==this.home) for(const s of B.slots){ const it=s.item; if(it&&it.sh&&Math.random()<dt*2) burst(sc,s.x,1.2,s.z,'#ffe680',1,1.5,true); }
    // œuf doré surprise dans la Prairie
    if(!this.gold){ this.goldT-=dt; if(this.goldT<=0){ const x=rand(-12,12), z=rand(-27,-7), m=eggMesh('L'); m.scale.setScalar(1.3); m.position.set(x,0,z); sc.add(m);
        const bm=new THREE.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:0.3,depthWrite:false}); bm.userData.own=true; const beam=new THREE.Mesh(cyl(0.3,0.3,30,8),bm); beam.position.y=15; m.add(beam);
        this.gold={m,x,z,t:35}; banner('🌟 Un œuf doré est apparu dans la Prairie !'); sfx('gem'); } }
    else { const gd=this.gold; gd.t-=dt; gd.m.rotation.y+=dt*2; gd.m.position.y=Math.abs(Math.sin(t*3))*0.25;
      if(!this.me.carry&&Math.hypot(P.x-gd.x,P.z-gd.z)<1.4&&P.y<1.5&&P.inv<=0){ sc.remove(gd.m); this.gold=null; this.goldT=rand(80,110); this.pickup(this.me,newEgg('L'),{gold:true}); banner('🌟 Œuf doré ! Ramène-le vite à ta base 🏠'); }
      else if(gd.t<=0){ sc.remove(gd.m); this.gold=null; this.goldT=rand(80,110); }
      else if(gd.t<5) gd.m.visible=Math.floor(t*8)%2===0; }
    // ton plus bel animal te suit
    let best=null; for(const s of this.home.slots){ const it=s.item; if(it&&it.kind==='pet'&&(!best||RAR[it.r].rank+(it.sh?0.5:0)>RAR[best.r].rank+(best.sh?0.5:0))) best=it; }
    const sp=best?best.sp:null;
    if(sp!==this.petSp){ if(this.pet){ sc.remove(this.pet.m); this.pet=null; } this.petSp=sp; if(sp){ const m=petMesh(sp); m.scale.setScalar(0.55); sc.add(m); this.pet={m,x:P.x+1,z:P.z+1,yaw:0}; } }
    if(this.pet){ const pt=this.pet, bx=P.x-Math.sin(P.yaw)*1.4+Math.cos(P.yaw)*0.8, bz=P.z-Math.cos(P.yaw)*1.4-Math.sin(P.yaw)*0.8, dx=bx-pt.x, dz=bz-pt.z, d=Math.hypot(dx,dz);
      if(d>12){ pt.x=bx; pt.z=bz; } else if(d>0.3){ const k=Math.min(1,dt*4); pt.x+=dx*k; pt.z+=dz*k; pt.yaw=Math.atan2(dx,dz); }
      pt.m.position.set(pt.x,P.y*0.6+(d>0.5?Math.abs(Math.sin(t*12))*0.15:0),pt.z); pt.m.rotation.y=pt.yaw; }
  };
}
