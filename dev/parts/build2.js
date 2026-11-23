/* =========================================================
   15. Bâtisseur : ambiances, annuler, remplir, pipette,
       nouvelles matières
   ========================================================= */
PAL.push({c:'#ffffff',tex:'brick',n:'Brique'},{c:'#ffffff',tex:'wood',n:'Bois'},{c:'#ffffff',tex:'stone',n:'Pierre'},{c:'#ffffff',tex:'leaves',n:'Feuilles'},
  {c:'#ffffff',tex:'sand',n:'Sable'},{c:'#ffffff',tex:'snow',n:'Neige'},{c:'#ffffff',tex:'gold',n:'Or'},{c:'#fff6d0',lamp:true,n:'Lampe'},
  {c:'#ff4fd8',neon:true,n:'Néon rose'},{c:'#2bffd5',neon:true,n:'Néon turquoise'});
const BENV=[
  {n:'Prairie',ic:'☀️',bg:'linear-gradient(140deg,#4cb8ff,#7ccf63)',sky:{top:'#3f9bff',mid:'#8fd3ff',bot:'#e4f6ff',sun:{u:0.25,el:30,r:18},hills:[['#9fd98a',16,0,0.012]]},ground:['meadow','#ffffff'],lights:{hemi:['#ffffff','#8a7f70',0.62],sun:['#ffffff',0.66]},clouds:true},
  {n:'Plage',ic:'🏖️',bg:'linear-gradient(140deg,#1fc3d6,#ffd98a)',sky:{top:'#2f9cf5',mid:'#8fe0ff',bot:'#fff0cf',sun:{u:0.7,el:16,r:22,c:'#fff3c4',glow:'rgba(255,220,150,.85)',gl:7}},ground:['sand','#ffffff'],sea:true,lights:{hemi:['#fff4dc','#a08a60',0.68],sun:['#fff0d0',0.74]},clouds:true},
  {n:'Nuit',ic:'🌙',bg:'linear-gradient(140deg,#15123a,#5a3fd1)',sky:{top:'#050418',mid:'#15123a',bot:'#2c2a5e',stars:900,moon:{u:0.3,el:40,r:18}},ground:['grass','#6f8f82'],lights:{hemi:['#8f9cff','#202040',0.45],sun:['#b9c6ff',0.38]},amb:{kind:'fireflies',color:'#d8ff7a',size:0.25,n:120,glow:true,rel:true}},
  {n:'Neige',ic:'❄️',bg:'linear-gradient(140deg,#9fd0ff,#ffffff)',sky:{top:'#7cb8f0',mid:'#c4e2fb',bot:'#f4f9ff',sun:{u:0.2,el:18,r:15},hills:[['#e6f0fb',30,0,0.012]]},ground:['snow','#ffffff'],lights:{hemi:['#eef6ff','#9cb0c8',0.72],sun:['#ffffff',0.6]},amb:{kind:'snow',color:'#ffffff',size:0.2,n:300,rel:true},pines:true}];
{ const B=GAMES.build, st=B.start;
  B.hint='Clic : poser / casser · Clic droit : casser · 1-9 : couleur · F : voler · Z : annuler · R : remplir · P : pipette';
  B.start=function(){
    const e=BENV[clamp(S.buildEnv|0,0,BENV.length-1)], keep=addClouds; if(!e.clouds) addClouds=function(){};
    try{ st.call(this); } finally{ addClouds=keep; }
    this.env=e; this.hist=[]; this.fillA=null;
    addSky(this,Object.assign({near:45,far:150},e.sky)); setLights(this,e.lights);
    const L=this.L, om=this.base.m.material; this.base.m.material=texMat(e.ground[0],e.ground[1],L); if(om&&om.userData&&om.userData.own){ if(om.map) om.map.dispose(); om.dispose(); }
    if(e.amb) addAmb(this,e.amb);
    const sc=this.scene;
    if(e.sea){ const pg=new THREE.PlaneGeometry(400,400); pg.userData.own=true; const wm=new THREE.MeshLambertMaterial({color:'#1fc3d6',transparent:true,opacity:0.85}); wm.userData.own=true;
      const w=new THREE.Mesh(pg,wm); w.rotation.x=-Math.PI/2; w.position.y=-0.35; sc.add(w); this.sea=w;
      for(let i=0;i<10;i++){ const a=i/10*TAU+0.2, r=L+5+rand(0,4), x=Math.cos(a)*r, z=Math.sin(a)*r; const isl=mk(cyl(2.2,2.6,0.8,10),texC('sand')); isl.position.set(x,-0.2,z); sc.add(isl);
        const p=palmMesh(rand(3.5,5),rand(-0.8,0.8),Math.random); p.g.position.set(x,0.2,z); p.g.rotation.y=rand(0,TAU); sc.add(p.g); } }
    if(e.pines){ for(let i=0;i<26;i++){ const a=i/26*TAU, r=L+3+rand(0,6), g=new THREE.Group(); for(let j=0;j<3;j++){ const c=mk(cone(+(1.7-j*0.4).toFixed(1),1.7,8),lam('#2f6d5a')); c.position.y=1.1+j*1.1; g.add(c); const s=mk(cone(+(1.2-j*0.3).toFixed(1),0.5,8),lam('#ffffff')); s.position.y=1.8+j*1.1; g.add(s); }
        g.position.set(Math.cos(a)*r,0,Math.sin(a)*r); sc.add(g); } }
    if(e===BENV[2]){ const L2=this.L; for(const [x,z] of [[-L2,-L2],[L2,-L2],[-L2,L2],[L2,L2]]){ const post=mk(box(0.3,4,0.3),lam('#3a3550')); post.position.set(x,2,z); sc.add(post); const bulb=mk(sph(0.4),emat('#fff2a8','#ffd23f'),false); bulb.position.set(x,4.2,z); sc.add(bulb); const pl=new THREE.PointLight('#ffd98a',0.9,26,1.6); pl.position.set(x,4.2,z); sc.add(pl); } }
    const mm=new THREE.MeshBasicMaterial({color:'#ffd23f',wireframe:true}); mm.userData.own=true; this.marker=new THREE.Mesh(box(1.04,1.04,1.04),mm); this.marker.visible=false; sc.add(this.marker);
    this.introS='Ambiance '+e.ic+' '+e.n+' · construis tout ce que tu veux !';
    this.setMode('place');
  };
  B.setMode=function(m){ this.mode=m; $('mPlace').classList.toggle('on',m==='place'); $('mBreak').classList.toggle('on',m==='break'); const f=$('mFill'); if(f) f.classList.toggle('on',m==='fill'); const p=$('bPick'); if(p) p.classList.toggle('on',m==='pick');
    if(m!=='fill'&&this.fillA){ this.fillA=null; if(this.marker) this.marker.visible=false; } };
  B.target=function(h){ let x,y,z;
    if(h.object===this.base.m){ x=Math.floor(h.point.x); y=0; z=Math.floor(h.point.z); }
    else { const e=this.blocks.get(h.object.userData.k); if(!e) return null; const n=h.face.normal; x=e.x+Math.round(n.x); y=e.y+Math.round(n.y); z=e.z+Math.round(n.z); }
    if(x<-this.L||x>=this.L||z<-this.L||z>=this.L||y<0||y>60) return null; return [x,y,z]; };
  B.inPlayer=function(x,y,z){ return P.x-P.hw<x+1&&P.x+P.hw>x&&P.y<y+1&&P.y+P.h>y&&P.z-P.hw<z+1&&P.z+P.hw>z; };
  B.onTap=function(sx,sy,btn){
    const r=this.ray||(this.ray=new THREE.Raycaster());
    r.setFromCamera(new THREE.Vector2(sx/innerWidth*2-1,-(sy/innerHeight)*2+1),camera); r.far=45;
    const hits=r.intersectObjects([this.base.m].concat(this.meshes),false);
    if(!hits.length) return;
    const h=hits[0];
    if(this.mode==='pick'){ if(h.object!==this.base.m){ const e=this.blocks.get(h.object.userData.k); if(e){ this.setColor(e.ci); sfx('cp'); banner('💧 Couleur copiée !'); } } return; }
    if(this.mode==='break'||btn===2){ if(h.object!==this.base.m){ const e=this.blocks.get(h.object.userData.k); if(e){ this.hist.push({a:[],r:[[e.x,e.y,e.z,e.ci]]}); this.removeBlock(h.object.userData.k); } } return; }
    const tg=this.target(h); if(!tg) return; const [x,y,z]=tg;
    if(this.mode==='fill'){
      if(!this.fillA){ this.fillA=tg; this.marker.visible=true; this.marker.position.set(x+0.5,y+0.5,z+0.5); sfx('click'); banner('🟦 Touche le 2e coin de la zone à remplir'); return; }
      const A=this.fillA; this.fillA=null; this.marker.visible=false; const add=[];
      const x0=Math.min(A[0],x), x1=Math.max(A[0],x), y0=Math.min(A[1],y), y1=Math.max(A[1],y), z0=Math.min(A[2],z), z1=Math.max(A[2],z);
      if((x1-x0+1)*(y1-y0+1)*(z1-z0+1)>800){ sfx('nope'); banner('Zone trop grande (800 blocs max)'); return; }
      for(let a=x0;a<=x1;a++) for(let b=y0;b<=y1;b++) for(let c=z0;c<=z1;c++){ if(this.inPlayer(a,b,c)) continue; if(this.addBlock(a,b,c,this.ci,add.length>60)) add.push([a,b,c,this.ci]); }
      if(add.length){ this.hist.push({a:add,r:[]}); sfx('place'); banner('🟦 '+add.length+' blocs posés'); this.saveT=0.8; } return; }
    if(this.inPlayer(x,y,z)) return;
    if(this.addBlock(x,y,z,this.ci,false)){ sfx('place'); this.saveT=0.8; this.hist.push({a:[[x,y,z,this.ci]],r:[]}); if(this.hist.length>60) this.hist.shift(); }
  };
  B.undo=function(){ const op=this.hist.pop(); if(!op){ sfx('nope'); banner('Rien à annuler'); return; }
    for(const [x,y,z] of op.a){ const k=bkey(x,y,z); if(this.blocks.has(k)) this.removeBlock(k); }
    for(const [x,y,z,ci] of op.r) this.addBlock(x,y,z,ci,false);
    sfx('click'); this.saveT=0.8; };
  const ca=B.clearAll; B.clearAll=function(){ const r=Array.from(this.blocks.values(),e=>[e.x,e.y,e.z,e.ci]); ca.call(this); if(r.length) this.hist.push({a:[],r}); };
  const ok=B.onKey; B.onKey=function(code){ if(code==='KeyZ') this.undo(); else if(code==='KeyR') this.setMode(this.mode==='fill'?'place':'fill'); else if(code==='KeyP') this.setMode(this.mode==='pick'?'place':'pick'); else ok.call(this,code); };
  const up=B.update; B.update=function(dt){ up.call(this,dt); if(this.sea) this.sea.position.y=-0.35+Math.sin(this.time*1.2)*0.05; if(this.marker&&this.marker.visible){ const k=1+Math.sin(this.time*8)*0.04; this.marker.scale.setScalar(k); } };
  B.pickEnv=function(){ openChoice({title:'🎨 Choisis une ambiance',sub:'Ta construction est gardée, seul le décor change.',items:BENV.map((e,i)=>({ic:e.ic,t:e.n,d:i===(S.buildEnv|0)?'Ambiance actuelle':'',bg:e.bg,on:i===(S.buildEnv|0),cb:()=>{ if(i===(S.buildEnv|0)) return; this.persist(); S.buildEnv=i; save(); startGame('build'); }}))}); };
}
$('mFill').addEventListener('click',()=>{ if(G&&G.id==='build'){ sfx('click'); G.setMode(G.mode==='fill'?'place':'fill'); if(G.mode==='fill') banner('🟦 Touche 2 coins pour remplir la zone'); } });
$('bUndo').addEventListener('click',()=>{ if(G&&G.id==='build') G.undo(); });
$('bPick').addEventListener('click',()=>{ if(G&&G.id==='build'){ sfx('click'); G.setMode(G.mode==='pick'?'place':'pick'); if(G.mode==='pick') banner('💧 Touche un bloc pour copier sa couleur'); } });
$('bEnv').addEventListener('click',()=>{ if(G&&G.id==='build'){ sfx('click'); G.pickEnv(); } });
