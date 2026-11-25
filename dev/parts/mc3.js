/* =========================================================
   27. Monde de Blocs : drone + télécommande, espace agrandi
   - Drone 🚁 (170) + Télécommande 🎮 (171), achetés ensemble dans la boutique.
     Avec la télécommande en main : ⚔️ (ou toucher l'écran) = décoller.
     Le joueur reste sur place, la caméra suit le drone, joystick = avancer,
     ▲ / ▼ = monter / descendre, 📸 = photo, ✋ = le drone revient.
     Batterie (S.mc.st.drb), portée 110 m.
   - Espace : en plus de la Lune, Planète Rouge, Planète Glacée, Station
     spatiale (SPACE), chacune avec sa gravité, 3 cristaux d'étoile (+30 🪙)
     et un anneau « Retour sur Terre » ; boussole spatiale #spNav ;
     grande planète à anneaux dans le ciel de l'espace.
   ========================================================= */
MITEMS[170]={n:'Drone',ic:'🚁',drone:1,price:180,d:'Un drone à piloter avec la télécommande 🎮.'};
MITEMS[171]={n:'Télécommande',ic:'🎮',remote:1,price:180,d:'Prends-la en main puis appuie sur ⚔️ pour piloter le drone.'};
const SPACE=[
  {id:'moon',n:'Lune',ic:'🌙',x:MOON.x,z:MOON.z,y:MOON.y,R:MOON.R,grav:0.38,old:1},
  {id:'mars',n:'Planète Rouge',ic:'🔴',x:520,z:-380,y:300,R:56,top:'#c4532a',side:'#8e3317',deco:'#6e2410',grav:0.5},
  {id:'ice',n:'Planète Glacée',ic:'🧊',x:-540,z:320,y:300,R:52,top:'#eaf7ff',side:'#86bfe2',deco:'#bfe7ff',grav:0.42},
  {id:'station',n:'Station spatiale',ic:'🛰️',x:200,z:430,y:330,R:20,top:'#c9ced8',side:'#6f7686',deco:'#3d8bff',grav:1,station:1}];
{ const M=GAMES.mc;
  const W=(k,f)=>{ const o=M[k]; M[k]=function(){ return f.call(this,o,...arguments); }; };
  /* ---------- boutique ---------- */
  W('renderShop',function(o,body){ o.call(this,body);
    const creative=this.mode==='creative', own=this.canUse(170);
    const h=el('h4','set-h'); h.textContent='Drone 🚁'; body.appendChild(h);
    const R=this.mkRow('🚁','Drone + télécommande','Pilote un drone dans le ciel, va voir de loin et prends des photos 📸 !'), b=el('button','buy');
    b.textContent=creative?'Prendre':own?'✅ Équiper':'🪙 '+MITEMS[170].price;
    b.addEventListener('click',()=>{
      if(!this.canUse(170)){ if((S.mc.cash||0)<MITEMS[170].price){ banner('🪙 Il te manque '+(MITEMS[170].price-S.mc.cash)+' pièces'); sfx('nope'); return; }
        S.mc.cash-=MITEMS[170].price; S.mc.own.push(170,171); sfx('buy'); }
      this.giveHot(170); this.giveHot(171); banner('🎮 Télécommande en main : appuie sur ⚔️ pour faire décoller le drone !'); this.openPanel('shop'); });
    R.r.appendChild(b); body.appendChild(R.r); });
  W('canUse',function(o,id){ if(id===171&&!o.call(this,171)) return o.call(this,170); return o.call(this,id); });
  /* ---------- utiliser la télécommande ---------- */
  W('placeAt',function(o,h){ const id=this.hot[this.sel];
    if(id===171){ this.droneStart(); return; }
    if(id===170){ banner('🚁 Prends la télécommande 🎮 pour piloter ton drone'); return; }
    return o.call(this,h); });
  W('act',function(o,kind,sx,sy){ if(this.piloting) return; const id=this.hot[this.sel];
    if(id===171&&!this.ride){ this.droneStart(); return; }
    return o.call(this,kind,sx,sy); });
  W('onAction',function(o){
    if(this.piloting){ photoTake('drone'); return; }
    if(this.hot[this.sel]===171&&!this.ride){ this.droneStart(); return; }
    return o.call(this); });
  M.droneMesh=function(){
    const g=new THREE.Group(), add=(geo,mat,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; }, rot=[];
    add(box(0.7,0.2,0.7),lam('#2b2f3a'),0,0,0); add(box(0.5,0.08,0.5),lam('#ff4f8b'),0,0.14,0); add(box(0.36,0.12,0.2),lam('#3a4050'),0,-0.12,0.18);
    for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const a=add(box(0.66,0.06,0.09),lam('#cfd4de'),sx*0.36,0.03,sz*0.36); a.rotation.y=sx*sz>0?-Math.PI/4:Math.PI/4;
      add(cyl(0.07,0.07,0.16,8),lam('#2b2f3a'),sx*0.6,0.09,sz*0.6); const r=add(box(0.62,0.015,0.07),lam('#e8ecf3'),sx*0.6,0.19,sz*0.6); rot.push(r); }
    add(sph(0.1),lam('#0d0f14'),0,-0.12,0.3);
    add(box(0.07,0.07,0.07),emat('#3dff6e','#2bd44f'),0.33,0.02,0.35); add(box(0.07,0.07,0.07),emat('#ff4a4a','#e02020'),-0.33,0.02,0.35);
    return {g,rot}; };
  M.drUI=function(on){ let u=$('drUI');
    if(on&&!u){ u=el('div','ia'); u.id='drUI'; const b1=el('span','drB'), b2=el('span','drD'), x=el('button','drX'); b1.textContent='🔋 100%'; b2.textContent='📡 0 m'; x.textContent='✋ Arrêter';
      u.appendChild(b1); u.appendChild(b2); u.appendChild(x); u._b=b1; u._d=b2; $('hud').appendChild(u); x.addEventListener('click',e=>{ e.stopPropagation(); sfx('click'); this.droneStop(); }); }
    if(u) u.style.display=on?'flex':'none';
    const a=$('bAct'); if(a){ if(on){ if(!a.dataset.ic0) a.dataset.ic0=a.innerHTML; a.innerHTML='📸'; } else if(a.dataset.ic0){ a.innerHTML=a.dataset.ic0; delete a.dataset.ic0; } } };
  M.droneStart=function(){
    if(this.piloting) return; if(this.ride){ banner('🚗 Descends d\'abord du véhicule'); return; }
    if(!this.canUse(170)){ banner('🚁 Achète d\'abord le drone dans la boutique 🛒'); sfx('nope'); return; }
    const bat=S.mc.st.drb===undefined?100:S.mc.st.drb; if(bat<8){ banner('🔋 Le drone recharge encore ('+Math.round(bat)+'%)'); sfx('nope'); return; }
    if(this.setFly) this.setFly(false); if(this.closePanel) this.closePanel();
    if(!this.dr){ const m=this.droneMesh(); this.scene.add(m.g); const yw=P.yaw; this.dr={x:P.x+Math.sin(yw)*0.8,y:P.y+1.3,z:P.z+Math.cos(yw)*0.8,vx:0,vy:2,vz:0,yaw:yw,m,state:'fly'}; }
    else this.dr.state='fly';
    this.piloting=true; this.frozen=true; P.vx=P.vy=P.vz=0; PA.aim=false; this.drCam0={dist:cam.dist,pitch:cam.pitch}; cam.dist=4.6; cam.pitch=0.32;
    const self=this; this.camUpd=function(dt){ self.droneCam(dt); };
    $('hud').classList.add('flying','droneOn'); this.drUI(true); sfx('boing'); banner('🚁 Drone en vol ! ▲ monter · ▼ descendre · 📸 photo');
  };
  M.droneStop=function(){ if(!this.piloting) return; this.piloting=false; if(!this.ride) this.frozen=false; delete this.camUpd;
    if(this.drCam0){ cam.dist=this.drCam0.dist; cam.pitch=this.drCam0.pitch; } snapCam();
    $('hud').classList.remove('droneOn'); if(!this.ride&&!P.fly) $('hud').classList.remove('flying'); this.drUI(false);
    if(this.dr) this.dr.state='home'; banner('🚁 Le drone revient vers toi'); };
  M.droneCam=function(dt){ const d=this.dr; if(!d) return; const k=damp(10,dt);
    cam.tx=lerp(cam.tx,d.x,k); cam.ty=lerp(cam.ty,d.y+0.25,k); cam.tz=lerp(cam.tz,d.z,k);
    const cp=Math.cos(cam.pitch), dx=Math.sin(cam.yaw)*cp, dy=Math.sin(cam.pitch), dz=Math.cos(cam.yaw)*cp;
    const want=camCollide(cam.tx,cam.ty,cam.tz,dx,dy,dz,cam.dist); cam.d=want<cam.d?want:lerp(cam.d,want,damp(5,dt));
    cam.px=cam.tx+dx*cam.d; cam.py=cam.ty+dy*cam.d; cam.pz=cam.tz+dz*cam.d; cam.fx=-dx; cam.fy=-dy; cam.fz=-dz;
    camera.position.set(cam.px,cam.py,cam.pz); camera.lookAt(cam.tx,cam.ty,cam.tz); };
  M.droneTick=function(dt){
    const d=this.dr; let bat=S.mc.st.drb===undefined?100:S.mc.st.drb;
    if(!d){ if(bat<100) S.mc.st.drb=Math.min(100,bat+dt*4); return; }
    const free=(x,y,z)=>{ for(const [a,b] of [[0,0],[0.45,0],[-0.45,0],[0,0.45],[0,-0.45]]) for(const hh of [-0.15,0.2]) if(this.solidAt(x+a,y+hh,z+b)) return false; return true; };
    if(d.state==='fly'){
      const sn=Math.sin(cam.yaw), cs=Math.cos(cam.yaw); let ix=inp.x, iy=inp.y; const il=Math.hypot(ix,iy); if(il>1){ ix/=il; iy/=il; }
      const sp=12, wx=(-sn*iy+cs*ix)*sp, wz=(-cs*iy-sn*ix)*sp, wy=(inp.jumpHeld?6.5:0)-(inp.downHeld?6.5:0), k=Math.min(1,3*dt);
      d.vx+=(wx-d.vx)*k; d.vz+=(wz-d.vz)*k; d.vy+=(wy-d.vy)*k;
      const rx=d.x-P.x, rz=d.z-P.z, rd=Math.hypot(rx,rz); if(rd>110){ d.vx-=rx/rd*30*dt; d.vz-=rz/rd*30*dt; if(!this.drW){ this.drW=1; banner('📡 Trop loin : le signal est faible !'); } } else this.drW=0;
      bat-=dt*1.1; S.mc.st.drb=Math.max(0,bat);
      if(bat<=0){ this.droneStop(); banner('🔋 Batterie vide : le drone rentre'); }
      else if(bat<15&&!this.drLow){ this.drLow=1; banner('🔋 Batterie faible !'); } else if(bat>20) this.drLow=0;
      d.yaw=angLerp(d.yaw,cam.yaw+Math.PI,damp(4,dt));
      const tl=clamp(-(d.vx*sn+d.vz*cs)/sp,-1,1), sd=clamp((d.vx*cs-d.vz*sn)/sp,-1,1);
      d.m.g.rotation.set(-tl*0.28,d.yaw,-sd*0.28,'YXZ');
      const u=$('drUI'); if(u&&u._b){ u._b.textContent='🔋 '+Math.round(bat)+'%'; u._d.textContent='📡 '+Math.round(rd)+' m · ↕ '+Math.max(0,Math.round(d.y-P.y))+' m'; u.classList.toggle('low',bat<15); }
    } else {
      const tx=P.x, ty=P.y+1.4, tz=P.z, dx=tx-d.x, dy=ty-d.y, dz=tz-d.z, l=Math.hypot(dx,dy,dz);
      if(l<0.9){ this.scene.remove(d.m.g); this.dr=null; sfx('cp'); return; }
      const v=Math.min(16,l*3); d.vx=dx/l*v; d.vy=dy/l*v; d.vz=dz/l*v; d.m.g.rotation.y=Math.atan2(dx,dz);
      d.x+=d.vx*dt; d.y+=d.vy*dt; d.z+=d.vz*dt;
    }
    if(d.state==='fly'){
      const nx=d.x+d.vx*dt, nz=d.z+d.vz*dt; if(free(nx,d.y,d.z)) d.x=nx; else d.vx*=-0.3; if(free(d.x,d.y,nz)) d.z=nz; else d.vz*=-0.3;
      const g=this.vGround(d.x,d.z,d.y+0.5); let ny=d.y+d.vy*dt; ny=clamp(ny,g+0.3,g+95); if(free(d.x,ny,d.z)) d.y=ny; else d.vy=0; }
    d.m.g.position.set(d.x,d.y+Math.sin(this.time*3)*0.04,d.z); for(const r of d.m.rot) r.rotation.y+=dt*45;
  };
  /* ---------- espace agrandi ---------- */
  M.spaceExtras=function(){
    const sc=this.scene, disp=this.spaceDisp||(this.spaceDisp=[]), grp=new THREE.Group(); this.spG=grp; this.spBoxes=[]; this.spCr=[]; this.spPads=[];
    const own=(x)=>{ disp.push(x); return x; };
    const mk=(geo,mat,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); grp.add(m); return m; };
    for(const B of SPACE){
      if(!B.old){
        const top=own(new THREE.MeshLambertMaterial({color:B.top})), side=own(new THREE.MeshLambertMaterial({color:B.side})), deco=own(new THREE.MeshLambertMaterial({color:B.deco}));
        if(B.station){
          mk(own(new THREE.BoxGeometry(B.R*2,1.2,B.R*2)),top,B.x,B.y-0.6,B.z);
          mk(own(new THREE.CylinderGeometry(B.R*0.7,B.R*0.9,6,16)),side,B.x,B.y-4.2,B.z);
          const glass=own(new THREE.MeshLambertMaterial({color:'#9fd8ff',transparent:true,opacity:0.22,depthWrite:false})); mk(own(new THREE.SphereGeometry(B.R*0.55,24,12,0,TAU,0,Math.PI/2)),glass,B.x-6,B.y,B.z-6);
          const pan=own(new THREE.MeshLambertMaterial({color:'#2a5bd7',emissive:'#0b2a7a'}));
          for(const s of [-1,1]){ const p=mk(own(new THREE.BoxGeometry(26,0.2,7)),pan,B.x+s*(B.R+14),B.y-1,B.z); p.rotation.z=s*0.1; mk(box(4,0.4,0.4),side,B.x+s*(B.R+1.5),B.y-1,B.z); }
          mk(cyl(0.12,0.12,8,6),side,B.x+6,B.y+4,B.z+6); this.spBeacon=mk(sph(0.5),emat('#ff4f8b','#ff2266'),B.x+6,B.y+8.2,B.z+6);
        } else {
          mk(own(new THREE.BoxGeometry(B.R*2,4,B.R*2)),top,B.x,B.y-2,B.z);
          mk(own(new THREE.SphereGeometry(B.R*1.15,28,16)),side,B.x,B.y-2-B.R*1.15,B.z);
          const rng=mulberry32(B.id.length*977+B.R);
          for(let i=0;i<28;i++){ const x=B.x+(rng()*2-1)*(B.R-5), z=B.z+(rng()*2-1)*(B.R-5);
            if(B.id==='ice'){ const h=1.5+rng()*4; const c=mk(cone(0.6+rng()*0.8,h,6),deco,x,B.y+h/2,z); c.rotation.y=rng()*3; }
            else { const s=0.6+rng()*1.8; const r=mk(oct(s),deco,x,B.y+s*0.4,z); r.rotation.set(rng()*3,rng()*3,rng()*3); } }
          if(B.id==='mars'){ const probe=new THREE.Group(); probe.position.set(B.x-10,B.y,B.z+12); grp.add(probe);
            const m1=new THREE.Mesh(box(2.4,1.2,1.6),lam('#d9dde6')), m2=new THREE.Mesh(box(4,0.1,1.4),lam('#2a5bd7')); m1.position.y=1.1; m2.position.y=1.8; probe.add(m1); probe.add(m2);
            for(const [a,b] of [[1,0.6],[-1,0.6],[1,-0.6],[-1,-0.6]]){ const wh=new THREE.Mesh(cyl(0.45,0.45,0.3,10),lam('#30333b')); wh.rotation.z=Math.PI/2; wh.position.set(a*1.1,0.45,b); probe.add(wh); } }
        }
        const R=B.R, y=B.y, x=B.x, z=B.z, t=B.station?1.2:4;
        this.spBoxes.push({x0:x-R,x1:x+R,y0:y-t,y1:y,z0:z-R,z1:z+R},
          {x0:x-R-1,x1:x-R,y0:y,y1:y+4,z0:z-R-1,z1:z+R+1},{x0:x+R,x1:x+R+1,y0:y,y1:y+4,z0:z-R-1,z1:z+R+1},
          {x0:x-R,x1:x+R,y0:y,y1:y+4,z0:z-R-1,z1:z-R},{x0:x-R,x1:x+R,y0:y,y1:y+4,z0:z+R,z1:z+R+1});
      }
      /* cristaux d'étoile et anneau de retour */
      const rng=mulberry32(B.id.charCodeAt(0)*131+7);
      for(let i=0;i<3;i++){ const a=i*2.1+rng(), r=B.R*(0.35+rng()*0.45), cx=B.x+Math.cos(a)*r, cz=B.z+Math.sin(a)*r;
        const m=mk(oct(0.55),emat('#b9f3ff','#4fd6ff'),cx,B.y+1.3,cz); this.spCr.push({b:B,i,m,x:cx,z:cz}); }
      const pad=mk(own(new THREE.TorusGeometry(1.6,0.18,8,28)),emat('#7dffb0','#22d46b'),B.x+(B.station?-12:R0(B)),B.y+0.15,B.z+(B.station?8:0)); pad.rotation.x=Math.PI/2;
      this.spPads.push({b:B,m:pad,x:pad.position.x,z:pad.position.z,t:0});
    }
    /* grande planète à anneaux, dans le ciel de l'espace */
    const gp=new THREE.Group(); gp.position.set(-1400,620,-1700);
    const cv=document.createElement('canvas'); cv.width=256; cv.height=128; const c2=cv.getContext('2d');
    for(let yy=0;yy<128;yy+=4){ c2.fillStyle=['#e0b27a','#c98f55','#f0d2a2','#b97d48','#ead0a8'][(yy/4+((yy*7)%3))%5]; c2.fillRect(0,yy,256,4); }
    const gt=own(new THREE.CanvasTexture(cv)), gm=own(new THREE.MeshBasicMaterial({map:gt,fog:false})), gg=own(new THREE.SphereGeometry(260,32,20));
    gp.add(new THREE.Mesh(gg,gm));
    const rg=own(new THREE.RingGeometry(330,520,64)), rm=own(new THREE.MeshBasicMaterial({color:'#e9d6b0',transparent:true,opacity:0.55,side:THREE.DoubleSide,fog:false,depthWrite:false}));
    const ring=new THREE.Mesh(rg,rm); ring.rotation.x=Math.PI/2.4; gp.add(ring); gp.visible=false; sc.add(gp); this.spGiant=gp;
    sc.add(grp); grp.visible=false;
    function R0(B){ return B.R-8; }
  };
  W('buildSpace',function(o){ const r=o.call(this); try{ this.spaceExtras(); }catch(e){ console.warn(e); } return r; });
  M.bodyAt=function(x,z,y){ for(const B of SPACE){ if(B.old) continue; if(Math.abs(x-B.x)<B.R&&Math.abs(z-B.z)<B.R&&y>=B.y-1.5) return B; } return null; };
  W('query',function(o,x0,x1,y0,y1,z0,z1){ const out=o.call(this,x0,x1,y0,y1,z0,z1);
    if(this.spBoxes&&y1>290&&y0<340) for(const b of this.spBoxes) if(b.x1>x0&&b.x0<x1&&b.y1>y0&&b.y0<y1&&b.z1>z0&&b.z0<z1) out.push(b);
    return out; });
  W('vGround',function(o,x,z,y){ const B=this.bodyAt(x,z,y); return B?B.y:o.call(this,x,z,y); });
  Object.defineProperty(M,'grav',{get(){ if(S.mc.mods.moon||this.onMoon) return 0.38; const B=!this.ride&&P.y>250?this.bodyAt(P.x,P.z,P.y):null; return B?B.grav:1; },configurable:true});
  W('driveRocket',function(o,v,K,dt){ const air0=v.air; const r=o.call(this,v,K,dt);
    for(const B of SPACE){ if(B.old) continue; const t=B.station?1.2:4;
      if(Math.abs(v.x-B.x)<B.R&&Math.abs(v.z-B.z)<B.R&&v.y<B.y-t&&v.y+3.4>B.y-t){ v.y=B.y-t-3.4; v.vy=Math.min(0,v.vy); } }
    if(air0&&!v.air){ const B=this.bodyAt(v.x,v.z,v.y+0.1); if(B){ banner(B.ic+' Bienvenue '+(B.station?'à la ':'sur la ')+B.n+' !'+(B.grav<1?' La gravité est faible : saute !':'')); S.mc.st['v_'+B.id]=1; } }
    return r; });
  W('exitVehicle',function(o,force){ const v=this.ride, B=v&&v.type==='rocket'?this.bodyAt(v.x,v.z,v.y+0.1):null;
    const r=o.call(this,force); if(r!==false&&B&&!v.air){ P.x=v.x+2.6; P.z=v.z; P.y=B.y; P.vx=P.vy=P.vz=0; } return r; });
  M.spaceTick=function(dt){
    if(!this.spG) return; const hi=P.y>60||(this.ride&&this.ride.y>60);
    this.spG.visible=hi; this.spGiant.visible=this.spaceK>0.15;
    if(!hi){ const n=$('spNav'); if(n) n.style.display='none'; return; }
    const st=S.mc.st;
    for(const c of this.spCr){ const k='cr_'+c.b.id, got=(st[k]||0)&(1<<c.i); c.m.visible=!got; if(got) continue;
      c.m.rotation.y+=dt*2; c.m.position.y=c.b.y+1.3+Math.sin(this.time*2+c.i)*0.25;
      if(!this.ride&&Math.hypot(P.x-c.x,P.z-c.z)<1.3&&Math.abs(P.y-c.b.y)<2.5){ st[k]=(st[k]||0)|(1<<c.i); S.mc.cash=(S.mc.cash||0)+30; sfx('buy'); burst(this.scene,c.x,c.b.y+1.3,c.z,'#9ff3ff',14,4);
        let n=0; for(const B of SPACE) for(let i=0;i<3;i++) if((st['cr_'+B.id]||0)&(1<<i)) n++;
        banner('💎 Cristal d\'étoile ! +30 🪙 ('+n+'/'+SPACE.length*3+')'); if(n===SPACE.length*3&&!st.crAll){ st.crAll=1; S.mc.cash+=200; banner('🌌 Tous les cristaux d\'étoile ! +200 🪙'); }
        this.dirtySave=true; saveSoon(); } }
    for(const p of this.spPads){ p.m.rotation.z+=dt*1.5; const on=!this.ride&&Math.hypot(P.x-p.x,P.z-p.z)<1.4&&Math.abs(P.y-p.b.y)<1.5;
      if(on){ p.t+=dt; if(p.t>0.2&&p.t-dt<=0.2) banner('🌍 Reste sur l\'anneau pour rentrer sur Terre…'); if(p.t>1.6){ p.t=0; const s=this.spawn||[0,40,0]; P.x=s[0]; P.y=s[1]+0.5; P.z=s[2]; P.vx=P.vy=P.vz=0; snapCam(); sfx('boing'); banner('🌍 De retour sur Terre !'); } } else p.t=0; }
    if(this.spBeacon) this.spBeacon.visible=Math.floor(this.time*2)%2===0;
    /* boussole spatiale : vers le prochain astre pas encore visité */
    const B0=this.bodyAt(P.x,P.z,P.y)||(this.onMoon?SPACE[0]:null); if(B0) st['v_'+B0.id]=1;
    let tg=null, bd=1e9; const ref=this.ride||P;
    for(const B of SPACE){ if(B===B0) continue; const d=Math.hypot(B.x-ref.x,B.z-ref.z)+(st['v_'+B.id]?5000:0); if(d<bd){ bd=d; tg=B; } }
    let n=$('spNav'); if(!n){ n=el('div',''); n.id='spNav'; const ar=el('b','spA'), lb=el('span',''); ar.textContent='➤'; n.appendChild(ar); n.appendChild(lb); n._a=ar; n._l=lb; $('hud').appendChild(n); }
    const show=tg&&(this.spaceK>0.3||B0); n.style.display=show?'flex':'none'; if(!show) return;
    const dx=tg.x-ref.x, dz=tg.z-ref.z, sn=Math.sin(cam.yaw), cs=Math.cos(cam.yaw), a=Math.atan2(dx*cs-dz*sn,-dx*sn-dz*cs);
    if(n._a){ n._a.style.transform='rotate('+(a-Math.PI/2).toFixed(3)+'rad)'; n._l.textContent=tg.ic+' '+tg.n+' · '+Math.round(Math.hypot(dx,dz))+' m'; }
  };
  W('update',function(o,dt){ const r=o.call(this,dt); if(!this.over){ try{ this.droneTick(dt); this.spaceTick(dt); }catch(e){ console.warn(e); } } return r; });
  W('stop',function(o){ if(this.piloting) this.droneStop(); if(this.dr){ this.scene.remove(this.dr.m.g); this.dr=null; } for(const id of ['drUI','spNav']){ const u=$(id); if(u&&u.parentNode) u.parentNode.removeChild(u); } $('hud').classList.remove('droneOn'); return o.call(this); });
}
