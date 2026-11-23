/* =========================================================
   12. Parcours Arc-en-ciel : 4 mondes, pièges, étoiles, fantôme
   ========================================================= */
function openChoice(o){
  const c=$('choice'); if(!c) return; c.innerHTML=''; const box_=el('div','ch-box'), h=el('div','ch-h'), t=el('b'); t.textContent=o.title; h.appendChild(t);
  if(o.close!==false){ const x=el('button','iconbtn'); x.textContent='✖️'; x.setAttribute('aria-label','Fermer'); x.addEventListener('click',()=>{ sfx('click'); closeChoice(); if(o.onClose) o.onClose(); }); h.appendChild(x); }
  box_.appendChild(h); if(o.sub){ const p=el('p','ch-sub'); p.textContent=o.sub; box_.appendChild(p); }
  const grid=el('div','ch-grid'+(o.wide?' wide':'')); box_.appendChild(grid);
  o.items.forEach(it=>{ const b=el('button','ch-it'+(it.lock?' lock':'')+(it.on?' on':'')); if(it.bg) b.style.background=it.bg;
    const i=el('span','ic'), n=el('b'), d=el('span','d'); i.textContent=it.lock?'🔒':it.ic; n.textContent=it.t; d.textContent=it.d||''; b.appendChild(i); b.appendChild(n); b.appendChild(d);
    if(it.tag){ const g=el('span','tag'); g.textContent=it.tag; b.appendChild(g); }
    b.addEventListener('click',()=>{ if(it.lock){ sfx('nope'); return; } sfx('click'); closeChoice(); it.cb(); }); grid.appendChild(b); });
  c.appendChild(box_); c.classList.add('on'); if(G) G.choiceOpen=true;
}
function closeChoice(){ const c=$('choice'); if(c) c.classList.remove('on'); if(G) G.choiceOpen=false; }
const GHKEY='blocsmahe-ghost-v1'; let OB_PICKED=false;
function ghostLoad(w){ try{ const a=JSON.parse(localStorage.getItem(GHKEY)||'{}')[w]; return Array.isArray(a)&&a.length>=8&&a.every(Number.isFinite)?a:null; }catch(e){ return null; } }
function ghostSave(w,rec){ try{ const all=JSON.parse(localStorage.getItem(GHKEY)||'{}'); all[w]=rec; localStorage.setItem(GHKEY,JSON.stringify(all)); }catch(e){} }
const OBW=[
  {n:'Bonbons',ic:'🍭',bg:'linear-gradient(140deg,#ff8fc7,#ffb36b)',grav:1,
    sky:{top:'#7fb6ff',mid:'#ffb8dd',bot:'#ffe4bd',sun:{u:0.3,el:16,r:22,c:'#fff3d6',glow:'rgba(255,190,220,.8)',gl:7},near:60,far:230},
    lights:{hemi:['#fff0fa','#c49ad6',0.7],sun:['#fff1e0',0.7]},amb:{kind:'petals',color:'#ff9ecb',size:0.22,n:220,rel:true}},
  {n:'Volcan',ic:'🌋',bg:'linear-gradient(140deg,#7a1020,#ff6a1f)',grav:1,
    sky:{top:'#1c0712',mid:'#5a1620',bot:'#ff7a3a',sun:{u:0.6,el:6,r:30,c:'#ffb070',glow:'rgba(255,90,30,.8)',gl:6},hills:[['#3a1010',38,0,0.012],['#250808',24,0,0.02]],near:40,far:170},
    lights:{hemi:['#ffb08a','#4a1010',0.55],sun:['#ffa060',0.8]},amb:{kind:'embers',color:'#ff8a2a',size:0.2,n:240,glow:true,rel:true}},
  {n:'Glace',ic:'❄️',bg:'linear-gradient(140deg,#5fb4ff,#c8f1ff)',grav:1,
    sky:{top:'#5aa8f0',mid:'#a8dcff',bot:'#eef8ff',sun:{u:0.2,el:22,r:16},hills:[['#dfeefc',44,0,0.01],['#c8e0f6',26,0,0.018]],near:50,far:200},
    lights:{hemi:['#eaf6ff','#9cb8d8',0.72],sun:['#ffffff',0.65]},amb:{kind:'snow',color:'#ffffff',size:0.2,n:320,rel:true}},
  {n:'Espace',ic:'🚀',bg:'linear-gradient(140deg,#140a33,#6b4cff)',grav:0.45,
    sky:{top:'#04020c',mid:'#120a2e',bot:'#2b1d63',stars:1100,nebula:['rgba(255,79,216,.22)','rgba(90,140,255,.22)','rgba(43,255,213,.12)'],planet:{u:0.72,el:24,r:46,c:'#ff9f6b',glow:'rgba(255,160,120,.35)',ring:'rgba(255,230,200,.7)',band:'rgba(120,40,20,.25)'},near:80,far:300,spin:0.004},
    lights:{hemi:['#c9b8ff','#3a2a6a',0.6],sun:['#ffffff',0.85]},amb:{kind:'dust',color:'#c9d6ff',size:0.18,n:200,glow:true,rel:true}}
];
GAMES.obby={
  hint:MOVE_HINT,
  hudHTML:'<div class="pill ia" id="obW">🗺️ <b id="hW">1</b></div><div class="pill">⏱ <b id="hTime">0:00</b></div><div class="pill">🚩 <b id="hCp">0/2</b></div><div class="pill">⭐ <b id="hSt">0/3</b></div>',
  get grav(){ return OBW[this.w||0].grav; },
  start(){
    const w=this.w=clamp(S.ob.w|0,0,OBW.length-1), W=OBW[w];
    setupScene(this.scene,W.sky.top,W.sky.bot,W.sky.near,W.sky.far); addSky(this,W.sky); setLights(this,W.lights);
    Object.assign(this,{cp:0,deaths:0,movers:[],padSq:0,fallers:[],blinks:[],spins:[],jets:[],convs:[],stars:[],got:0,rec:[],recT:0,ghost:null,gdata:ghostLoad(w)});
    this.introT=OBW[w].ic+' '+W.n; this.introS='Monde '+(w+1)+' sur '+OBW.length;
    const lava=new THREE.MeshLambertMaterial({color:w===0?'#ff5fb0':'#ff6a1f',emissive:w===0?'#c0006a':'#ff3300'}); lava.userData.own=true; this.lava=lava;
    this['build'+w](); this.decor(w);
    addAmb(this,W.amb);
    if(this.gdata){ const A=makeAvatar(S.avatar,'👻 Record',{}); A.root.traverse(o=>{ if(o.isMesh){ const ms=Array.isArray(o.material)?o.material:[o.material]; o.material=ms.map(m=>{ const c=m.clone(); c.transparent=true; c.opacity=0.35; c.depthWrite=false; c.userData.own=true; return c; }); if(o.material.length===1) o.material=o.material[0]; o.castShadow=false; } });
      this.scene.add(A.root); this.ghost=A; }
    P.x=this.cps[0].x; P.y=this.cps[0].y; P.z=this.cps[0].z; P.yaw=Math.PI; cam.yaw=0;
    banner(W.ic+' Monde '+(w+1)+' : '+W.n+' — atteins le trophée !');
    const nOpen=1+OBW.filter((_,i)=>S.ob.done[i]).length, picked=OB_PICKED; OB_PICKED=false; if(nOpen>1&&!picked) setTimeout(()=>{ if(G===this&&this.time<2) this.pickWorld(); },400);
  },
  pickWorld(){
    openChoice({title:'🗺️ Choisis ton monde',sub:'Termine un monde pour débloquer le suivant. Trouve les 3 ⭐ de chaque monde !',
      items:OBW.map((W,i)=>{ const lock=i>0&&!S.ob.done[i-1], st=S.ob.st[i]|0, n=(st&1)+(st>>1&1)+(st>>2&1);
        return {ic:W.ic,t:'Monde '+(i+1)+' · '+W.n,d:lock?'Termine le monde '+i+' pour l\'ouvrir':(S.ob.best[i]?'🏆 '+fmtTime(S.ob.best[i])+' · ':'')+'⭐ '+n+'/3',lock,on:i===this.w,bg:lock?'':W.bg,cb:()=>{ if(i===this.w&&this.time<3) return; S.ob.w=i; save(); OB_PICKED=true; startGame('obby'); }}; })});
  },
  /* ---------- outils de construction ---------- */
  plat(x,top,z,sx,sz,m,props,th){ const b=addBox(this,x-sx/2,top-(th||0.6),z-sz/2,x+sx/2,top,z+sz/2,m,props);
    if(props&&(props.mv||props.fall||props.conv)){ b.b0=[b.x0,b.x1,b.y0,b.y1,b.z0,b.z1]; b.dx=0; b.dy=0; b.dz=0; }
    if(props&&props.mv){ if(!props.mv.ax) props.mv.ax='x'; b.mv=props.mv; b.bx0=b.x0; b.bx1=b.x1; this.movers.push(b); }
    if(props&&props.fall){ b.fs=0; b.ft=0; b.fv=0; this.fallers.push(b); }
    if(props&&props.blink){ const mt=b.m.material.clone(); mt.transparent=true; mt.userData.own=true; b.m.material=mt; b.b0=[b.x0,b.x1,b.y0,b.y1,b.z0,b.z1]; this.blinks.push(b); }
    if(props&&props.conv){ const mt=texMat('metal','#5a6478',Math.max(1,sx/1.5),Math.max(1,sz/1.5)); b.m.material=mt; b.cm=mt; this.convs.push(b); }
    return b; },
  star(x,y,z){ const g=new THREE.Group(), m=mk(oct(0.45),emat('#ffd23f','#b07a00')); m.scale.set(1,1,0.45); g.add(m);
    const halo=new THREE.Mesh(sph(0.75),matC('starHalo',()=>new THREE.MeshBasicMaterial({color:'#fff3a0',transparent:true,opacity:0.25,depthWrite:false}))); g.add(halo);
    g.position.set(x,y,z); this.scene.add(g); const i=this.stars.length, had=(S.ob.st[this.w]|0)>>i&1; if(had){ m.material=matC('starGot',()=>new THREE.MeshLambertMaterial({color:'#c9c4e0',transparent:true,opacity:0.6})); }
    this.stars.push({g,m,x,y,z,i,taken:false,had}); },
  spin(x,y,z,L,spd,ph){ const g=new THREE.Group(); g.position.set(x,y,z); const bar=mk(box(L,0.36,0.36),emat('#ff2e4d','#d0002a'),false); g.add(bar);
    const hub=mk(cyl(0.45,0.55,0.7,12),lam('#3a2a6a')); hub.position.y=-0.15; g.add(hub); this.scene.add(g); this.spins.push({g,x,y,z,L,spd,ph,a:ph}); },
  jet(x,top,z,per,on,ph){ const g=new THREE.Group(); g.position.set(x,top,z); const nz=mk(cyl(0.6,0.75,0.3,10),lam('#2a1a1a')); nz.position.y=0.15; g.add(nz);
    const fm=new THREE.MeshBasicMaterial({color:'#ffb030',transparent:true,opacity:0.85}); fm.userData.own=true; const f=new THREE.Mesh(cyl(0.25,0.6,3,10),fm); f.position.y=1.8; g.add(f); this.scene.add(g);
    this.jets.push({g,f,fm,x,top,z,per,on,ph,act:false,box:{x0:x-0.7,x1:x+0.7,y0:top,y1:top+3.3,z0:z-0.7,z1:z+0.7}}); },
  finish(x,top,z,mat){ this.fin=this.plat(x,top,z,6,6,mat||tmat('#ffd23f'),{finish:true},1.0);
    const glass=new THREE.MeshLambertMaterial({color:'#bfe9ff',transparent:true,opacity:0.3}); glass.userData.own=true;
    addBox(this,x-3,top,z-3.4,x+3,top+3.5,z-3,glass,{noCam:true},undefined,false);
    const chkT=(()=>{ const c=makeCanvas(64,16), g=c.getContext('2d'); for(let i=0;i<8;i++)for(let j=0;j<2;j++){ g.fillStyle=(i+j)%2?'#1d1846':'#ffffff'; g.fillRect(i*8,j*8,8,8); }
      const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.isOwn=true; const m=new THREE.MeshLambertMaterial({map:t}); m.userData.own=true; return m; })();
    addBox(this,x-2.9,top,z+1.9,x-2.5,top+3.5,z+2.3,lam('#ffffff'),null,null); addBox(this,x+2.5,top,z+1.9,x+2.9,top+3.5,z+2.3,lam('#ffffff'),null,null);
    addBox(this,x-3,top+3.5,z+1.8,x+3,top+4.2,z+2.4,chkT,null,null);
    const tr=new THREE.Group(), gold=emat('#ffc83d','#5a3a00');
    const tb=mk(box(0.9,0.3,0.9),lam('#5b4a8a')); tb.position.y=0.15; const ts=mk(box(0.22,0.5,0.22),gold); ts.position.y=0.55;
    const tc=mk(cyl(0.55,0.3,0.75,16),gold); tc.position.y=1.17; const h1=mk(box(0.16,0.4,0.1),gold); h1.position.set(0.62,1.25,0); const h2=h1.clone(); h2.position.x=-0.62;
    tr.add(tb,ts,tc,h1,h2); tr.position.set(x,top,z-1.3); this.scene.add(tr); this.trophy=tr; },
  /* ---------- monde 1 : Bonbons (le parcours d'origine, redécoré) ---------- */
  build0(){
    let ci=0; const CAN=['#ff8fc7','#ffd23f','#7fe3c4','#b9a6ff','#ff9f6b','#8fd0ff','#c7f464'], R=()=>tmat(CAN[(ci++)%CAN.length]);
    const p=(...a)=>this.plat(...a), W=texC('candy'), Wh=tmat('#fff4fb');
    p(0,0,0,8,8,Wh,{cp:0},1.2);
    p(0,0,-6.5,3,3,R()); p(2,0.8,-10.5,3,3,R()); p(0,1.6,-14.5,3,3,R()); p(-2,2.4,-18.5,3,3,R());
    p(-2,2.4,-24.5,1.2,7,R());
    p(-2,2.4,-32,6,6,W,{cp:1},1.0);
    addBox(this,-10,-0.6,-64,10,0.4,-35.5,this.lava,{lava:true},this.hazards,false);
    p(0,2.4,-37.5,2,2,R()); p(2.5,2.9,-41,2,2,R()); p(0,3.4,-44.5,2,2,R()); p(-2.5,3.9,-48,2,2,R()); p(0,4.4,-51.5,2,2,R());
    p(0,4.4,-56,3,3,tmat('#ffffff'),{mv:{amp:3,spd:1.1,ph:0}});
    p(0,4.4,-61,3,3,tmat('#ffffff'),{mv:{amp:3,spd:1.1,ph:Math.PI}});
    p(0,4.4,-67,6,6,W,{cp:2},1.0);
    p(0,4.4,-77,4,14,tmat('#fde6f3'),null,1.0);
    const kill=emat('#ff2e4d','#b0001a');
    [-74,-78,-82].forEach(z=>addBox(this,-2,4.4,z-0.3,2,4.8,z+0.3,kill,{lava:true},this.hazards));
    p(1.5,5.4,-86.5,2,2,R()); p(-1.5,6.4,-89.5,2,2,R()); p(1.5,7.4,-92.5,2,2,R()); p(-1.5,8.4,-95.5,2,2,R());
    this.pad=p(0,8.4,-99.5,3,3,emat('#ff4fd8','#6a0058'),{bounce:20});
    this.finish(0,13.5,-106,texC('candy','#ffe680'));
    this.cps=[{x:0,y:0,z:1.5},{x:-2,y:2.4,z:-31},{x:0,y:4.4,z:-66}];
    this.flags={1:makeFlag(this,0.4,2.4,-34.4),2:makeFlag(this,2.4,4.4,-69.4)};
    [[0,1.2,-6.5],[2,2,-10.5],[0,2.8,-14.5],[-2,3.6,-18.5],[-2,3.6,-22.5],[-2,3.6,-26.5],[2.5,4.1,-41],[-2.5,5.1,-48],[0,5.6,-51.5],
     [0,5.6,-76],[0,5.6,-80],[1.5,6.6,-86.5],[-1.5,9.6,-95.5],[0,14.6,-102.5]].forEach(q=>makeCoin(this,q[0],q[1],q[2]));
    p(4.2,1.2,-14.5,1.6,1.6,R()); this.star(4.2,2.5,-14.5);
    this.star(0,6.4,-58.5);
    p(-4.6,6.4,-89.5,1.6,1.6,R()); this.star(-4.6,7.7,-89.5);
  },
  /* ---------- monde 2 : Volcan ---------- */
  build1(){
    const p=(...a)=>this.plat(...a), RK=texC('rock','#b39a9a'), ST=texC('stone','#c9b0a0'), BR=texC('rock','#ffd0b0');
    addBox(this,-30,-1.4,-120,30,-0.4,25,this.lava,{lava:true},this.hazards,false);
    p(0,0,0,8,8,ST,{cp:0},1.2);
    p(0,0,-6.5,3,3,RK); p(2.2,0.6,-10.5,2.6,2.6,RK); p(-0.5,1.2,-14.5,2.6,2.6,BR,{fall:true}); p(1.5,1.6,-18.5,2.6,2.6,BR,{fall:true}); p(0,2,-22.5,3,3,RK);
    p(0,2,-28.5,6,6,ST,{cp:1},1.0);
    p(0,2,-38.5,3,14,RK,null,1.0);
    this.jet(0,2,-34.5,2.6,1.1,0); this.jet(0,2,-38.5,2.6,1.1,0.9); this.jet(0,2,-42.5,2.6,1.1,1.8);
    p(0,2,-49,3,3,RK,{mv:{ax:'z',amp:2,spd:1,ph:0}});
    p(0,2.6,-55.5,3,3,RK,{mv:{ax:'x',amp:3,spd:1.2,ph:1}});
    p(0,3,-62,6,6,ST,{cp:2},1.0);
    p(2,3.6,-66.5,2.4,2.4,BR,{fall:true}); p(-1,4.2,-70,2.4,2.4,BR,{fall:true}); p(1.5,4.8,-73.5,2.4,2.4,BR,{fall:true}); p(-1.5,5.4,-77,2.4,2.4,RK);
    this.pad=p(0,5.4,-81.5,3,3,emat('#ffb020','#7a3a00'),{bounce:20});
    this.finish(0,10.5,-88,texC('stone','#ffd23f'));
    this.cps=[{x:0,y:0,z:1.5},{x:0,y:2,z:-27},{x:0,y:3,z:-61}];
    this.flags={1:makeFlag(this,0.4,2,-30.9),2:makeFlag(this,2.4,3,-64.4)};
    [[0,1.2,-6.5],[2.2,1.8,-10.5],[1.5,2.8,-18.5],[0,3.2,-36.5],[0,3.2,-40.5],[0,3.2,-49],[0,3.8,-55.5],[2,4.8,-66.5],[1.5,6,-73.5],[0,11.6,-85]].forEach(q=>makeCoin(this,q[0],q[1],q[2]));
    this.star(-0.5,2.9,-14.5); this.star(0,3.7,-38.5);
    p(-4.5,5.4,-73.5,2,2,RK); this.star(-4.5,6.7,-73.5);
  },
  /* ---------- monde 3 : Glace ---------- */
  build2(){
    const p=(...a)=>this.plat(...a), SN=texC('snow','#ffffff'), IC=texC('ice','#ffffff',{transparent:true,opacity:0.92});
    const water=new THREE.MeshLambertMaterial({color:'#4fb6e8',transparent:true,opacity:0.8,emissive:'#0a3a5a'}); water.userData.own=true;
    addBox(this,-30,-1.6,-120,30,-0.6,25,water,{lava:true},this.hazards,false);
    p(0,0,0,8,8,SN,{cp:0},1.2);
    p(0,0,-6.5,3,3,IC,{ice:true}); p(0,0,-12.5,3,7,IC,{ice:true}); p(2.5,0.8,-18.5,2.6,2.6,IC,{ice:true});
    p(0,1.6,-22.5,2.6,2.6,tmat('#bfe9ff'),{blink:{per:3,on:2,ph:0}}); p(-2.5,2.2,-26.5,2.6,2.6,tmat('#bfe9ff'),{blink:{per:3,on:2,ph:1.5}});
    p(-1,2.2,-32.5,6,6,SN,{cp:1},1.0);
    p(-1,2.2,-42.5,3,12,SN,{conv:[0,2.4]},1.0);
    p(-1,2.2,-54,7,7,SN,null,1.0); this.spin(-1,2.6,-54,6.4,1.6,0);
    p(-1,3,-62.5,6,6,SN,{cp:2},1.0);
    p(1.5,3.6,-67,2.4,2.4,tmat('#bfe9ff'),{blink:{per:2.6,on:1.8,ph:0}}); p(-1,4.2,-70.5,2.4,2.4,tmat('#bfe9ff'),{blink:{per:2.6,on:1.8,ph:1.3}});
    p(1.5,4.8,-74,2.4,2.4,IC,{ice:true}); p(-1,5.4,-77.5,2.4,2.4,IC,{ice:true});
    this.pad=p(0,5.4,-82,3,3,emat('#5ffbf1','#0a6a6a'),{bounce:20});
    this.finish(0,10.5,-88.5,texC('ice','#ffe680'));
    this.cps=[{x:0,y:0,z:1.5},{x:-1,y:2.2,z:-31},{x:-1,y:3,z:-61}];
    this.flags={1:makeFlag(this,-0.6,2.2,-34.9),2:makeFlag(this,1.4,3,-64.9)};
    [[0,1.2,-6.5],[0,1.2,-11],[0,1.2,-14],[2.5,2,-18.5],[-1,3.4,-38.5],[-1,3.4,-42.5],[-1,3.4,-46.5],[1.5,4.8,-67],[1.5,6,-74],[0,11.6,-85.5]].forEach(q=>makeCoin(this,q[0],q[1],q[2]));
    this.star(2.6,1.3,-12.5); this.star(-1,3.6,-44);
    p(-4.4,4.8,-74,2,2,IC,{ice:true}); this.star(-4.4,6.1,-74);
  },
  /* ---------- monde 4 : Espace (gravité faible) ---------- */
  build3(){
    const p=(...a)=>this.plat(...a), MT=texC('metal','#d6dcef'), AS=texC('stone','#9a8ad8');
    p(0,0,0,8,8,MT,{cp:0},1.2);
    p(0,1,-8,3,3,AS); p(4,2.5,-14.5,3,3,AS,{mv:{ax:'y',amp:1.2,spd:1,ph:0}}); p(0,4,-21,3,3,AS); p(-4,5,-27.5,2.8,2.8,AS,{mv:{ax:'x',amp:2.5,spd:0.9,ph:0.5}});
    p(0,6,-34,6,6,MT,{cp:1},1.0);
    p(0,6,-46,4,16,MT,null,1.0); this.spin(0,6.35,-42,5,1.3,0); this.spin(0,6.35,-50,5,-1.6,1);
    p(0,7,-60,6,6,MT,{cp:2},1.0);
    p(0,8,-68,3,3,AS,{mv:{ax:'x',amp:3,spd:1,ph:0}}); p(0,9.5,-76,3,3,AS,{mv:{ax:'y',amp:1.2,spd:1.1,ph:0}}); p(0,11,-84,3,3,tmat('#b9a6ff'),{blink:{per:3,on:2.2,ph:0}});
    this.pad=p(0,11,-91,3,3,emat('#2bffd5','#0a6a5a'),{bounce:14});
    this.finish(0,16.5,-99.5,texC('metal','#ffe680'));
    this.cps=[{x:0,y:0,z:1.5},{x:0,y:6,z:-33},{x:0,y:7,z:-59}];
    this.flags={1:makeFlag(this,0.4,6,-36.4),2:makeFlag(this,2.4,7,-62.4)};
    [[0,2.2,-8],[4,4,-14.5],[0,5.2,-21],[0,7.3,-40],[0,7.3,-46],[0,7.3,-52],[0,9.2,-68],[0,10.8,-76],[0,12.2,-84],[0,17.6,-96.5]].forEach(q=>makeCoin(this,q[0],q[1],q[2]));
    this.star(4,6.4,-14.5); this.star(0,8.6,-46);
    p(-5,9.5,-76,2,2,AS); this.star(-5,10.9,-76);
  },
  decor(w){
    const sc=this.scene;
    if(w===0){ const cols=['#ff4d6d','#ff9f1c','#ffd23f','#3ad17a','#2ec4b6','#4f7bff','#9b5de5'];
      cols.forEach((c,i)=>{ const g=new THREE.TorusGeometry(70-i*2.4,1.25,8,48,Math.PI); g.userData.own=true; const m=new THREE.MeshBasicMaterial({color:c,fog:false}); m.userData.own=true; const t=new THREE.Mesh(g,m); t.position.set(0,-6,-170); sc.add(t); });
      for(let i=0;i<14;i++){ const side=i%2?1:-1, x=side*rand(9,22), z=rand(-110,10), y=rand(-6,10), g=new THREE.Group(); const st=mk(cyl(0.12,0.12,3,6),lam('#ffffff')); st.position.y=-1.5; g.add(st);
        const c=mk(cyl(1.1,1.1,0.3,18),texC('candy',['#ffffff','#fff0a0','#c8f7ff'][i%3])); c.rotation.x=Math.PI/2; g.add(c); g.position.set(x,y,z); g.rotation.y=rand(-0.5,0.5); sc.add(g); }
      addClouds(this,26,[12,40],[-14,26],[-130,15]); }
    else if(w===1){ for(let i=0;i<22;i++){ const side=i%2?1:-1, x=side*rand(8,24), z=rand(-110,10), h=rand(3,10); const r=mk(cone(rand(1.5,3),h,6),texC('rock','#a08080')); r.position.set(x,-0.4+h/2,z); sc.add(r); } }
    else if(w===2){ for(let i=0;i<18;i++){ const side=i%2?1:-1, x=side*rand(8,22), z=rand(-110,10), g=new THREE.Group(); for(let j=0;j<3;j++){ const c=mk(cone(+(1.6-j*0.4).toFixed(1),1.6,8),lam('#2f7d6a')); c.position.y=1+j*1.1; g.add(c); const s=mk(cone(+(1.1-j*0.3).toFixed(1),0.5,8),lam('#ffffff')); s.position.y=1.7+j*1.1; g.add(s); }
        const ice=mk(box(rand(2,5),0.6,rand(2,5)),texC('ice')); ice.position.y=-0.3; g.add(ice); g.position.set(x,rand(-1,1),z); sc.add(g); }
      addClouds(this,14,[14,40],[10,26],[-120,15]); }
    else { for(let i=0;i<30;i++){ const x=(i%2?1:-1)*rand(10,40), z=rand(-130,20), y=rand(-12,30), r=rand(0.6,2.4); const a=mk(oct(r),texC('stone','#7a6ab8')); a.position.set(x,y,z); a.rotation.set(rand(0,3),rand(0,3),0); sc.add(a); this.rocks=(this.rocks||[]).concat([a]); } }
  },
  /* ---------- boucle ---------- */
  preStep(dt){
    const t=this.time;
    for(const b of this.movers){ const m=b.mv, off=Math.sin(t*m.spd+m.ph)*m.amp, q=b.b0;
      const ox=m.ax==='x'?off:0, oy=m.ax==='y'?off:0, oz=m.ax==='z'?off:0;
      b.dx=q[0]+ox-b.x0; b.dy=q[2]+oy-b.y0; b.dz=q[4]+oz-b.z0;
      b.x0=q[0]+ox; b.x1=q[1]+ox; b.y0=q[2]+oy; b.y1=q[3]+oy; b.z0=q[4]+oz; b.z1=q[5]+oz;
      b.m.position.set((b.x0+b.x1)/2,(b.y0+b.y1)/2,(b.z0+b.z1)/2); }
    for(const b of this.fallers){ b.dx=0; b.dz=0; b.dy=0;
      if(b.fs===0&&P.onGround&&P.ground===b){ b.fs=1; b.ft=0.55; sfx('nope'); }
      if(b.fs===1){ b.ft-=dt; b.m.position.x=(b.x0+b.x1)/2+Math.sin(t*60)*0.06; if(b.ft<=0){ b.fs=2; b.fv=0; } }
      else if(b.fs===2){ b.fv=Math.min(18,b.fv+22*dt); const d=b.fv*dt; b.y0-=d; b.y1-=d; b.dy=-d; b.m.position.y=(b.y0+b.y1)/2; if(b.y1<-25){ b.fs=3; b.ft=3; b.m.visible=false; b.y0-=1000; b.y1-=1000; } }
      else if(b.fs===3){ b.ft-=dt; if(b.ft<=0){ const q=b.b0; [b.x0,b.x1,b.y0,b.y1,b.z0,b.z1]=q; b.m.position.set((q[0]+q[1])/2,(q[2]+q[3])/2,(q[4]+q[5])/2); b.m.visible=true; b.fs=0; burst(this.scene,b.m.position.x,b.y1,b.m.position.z,'#ffb070',8,3); } } }
    for(const b of this.blinks){ const bl=b.blink; const k=((t+bl.ph)%bl.per+bl.per)%bl.per, on=k<bl.on;
      if(on){ if(b.off){ b.off=false; [b.x0,b.x1,b.y0,b.y1,b.z0,b.z1]=b.b0; b.m.visible=true; }
        b.m.material.opacity=k>bl.on-0.6?(Math.floor(t*12)%2?0.35:0.95):0.95; }
      else if(!b.off){ b.off=true; b.y0-=1000; b.y1-=1000; b.m.visible=false; } }
    for(const b of this.convs){ const c=b.conv; b.dx=c[0]*dt; b.dz=c[1]*dt; b.dy=0; if(b.cm&&b.cm.map) b.cm.map.offset.y+=c[1]*dt/1.5; }
    this.lava.emissive.setRGB(0.75+Math.sin(t*3)*0.15,this.w===0?0.05:0.18,this.w===0?0.4:0);
  },
  update(dt){
    updateCoins(this,dt,2); const t=this.time;
    this.trophy.rotation.y+=dt*1.5;
    for(const k in this.flags) this.flags[k].f.rotation.y=Math.sin(t*3+(+k))*0.25;
    if(this.padSq>0){ this.padSq=Math.max(0,this.padSq-dt*3); this.pad.m.scale.y=1-this.padSq*0.5; }
    if(this.rocks) for(const r of this.rocks){ r.rotation.y+=dt*0.2; r.rotation.x+=dt*0.1; }
    for(const s of this.stars){ if(s.taken) continue; s.g.rotation.y+=dt*2.2; s.g.position.y=s.y+Math.sin(t*2.5+s.i)*0.15;
      if(Math.hypot(P.x-s.x,P.y+0.9-s.y,P.z-s.z)<1.5){ s.taken=true; this.scene.remove(s.g); this.got++; sfx('gem'); burst(this.scene,s.x,s.y,s.z,'#ffd23f',18,5,true);
        if(!s.had){ S.ob.st[this.w]=(S.ob.st[this.w]|0)|(1<<s.i); addCoins(10); saveSoon(); } banner('⭐ Étoile '+this.got+'/3 !'); } }
    for(const sp of this.spins){ sp.a+=sp.spd*dt; sp.g.rotation.y=sp.a;
      const dx=P.x-sp.x, dz=P.z-sp.z, c=Math.cos(sp.a), s=Math.sin(sp.a), along=dx*c-dz*s, perp=dx*s+dz*c;
      if(Math.abs(along)<sp.L/2+P.hw&&Math.abs(perp)<0.18+P.hw&&P.y<sp.y+0.18&&P.y+P.h>sp.y-0.18) return this.die(); }
    for(const j of this.jets){ const k=((t+j.ph)%j.per+j.per)%j.per, act=k<j.on, warn=!act&&k>j.per-0.5; j.act=act;
      j.f.visible=act||warn; j.f.scale.set(act?1:0.4,act?1+Math.sin(t*30)*0.08:0.15,act?1:0.4); j.f.position.y=act?1.8:0.4; j.fm.opacity=act?0.85:0.6;
      if(act&&Math.random()<0.4) burst(this.scene,j.x+rand(-0.3,0.3),j.top+rand(0.5,3),j.z+rand(-0.3,0.3),Math.random()<0.5?'#ff6a00':'#ffd23f',1,2,true);
      if(act&&touching(j.box)) return this.die(); }
    if(P.onGround&&P.ground){ const g=P.ground;
      if(g.cp!==undefined&&g.cp>this.cp){ this.cp=g.cp; sfx('cp'); banner('🚩 Point de contrôle !'); const f=this.flags[g.cp]; if(f) f.fm.color.set('#22c55e'); burst(this.scene,P.x,P.y+1,P.z,'#22c55e',10,4); }
      if(g.bounce){ P.vy=g.bounce; P.onGround=false; P.ground=null; P.coyote=0; sfx('boing'); this.padSq=1; }
      else if(g.finish) return this.win();
    }
    for(const hz of this.hazards) if(touching(hz)) return this.die();
    if(P.y<-8) return this.die();
    this.recT-=dt; if(this.recT<=0&&this.rec.length<6000){ this.recT=0.1; this.rec.push(+P.x.toFixed(2),+P.y.toFixed(2),+P.z.toFixed(2),+P.yaw.toFixed(2)); }
    if(this.ghost){ const a=this.gdata, n=a.length/4, f=t/0.1, i=Math.min(n-1,Math.floor(f)), j=Math.min(n-1,i+1), u=Math.min(1,f-i), A=this.ghost;
      const gx=lerp(a[i*4],a[j*4],u), gy=lerp(a[i*4+1],a[j*4+1],u), gz=lerp(a[i*4+2],a[j*4+2],u), sp=Math.hypot(a[j*4]-a[i*4],a[j*4+2]-a[i*4+2])*10;
      A.root.position.set(gx,gy,gz); A.root.rotation.y=a[i*4+3]; animAvatar(A,dt,i>=n-1?0:sp,true); A.root.visible=i<n-1||Math.floor(t*2)%2===0; }
  },
  die(){
    this.deaths++; sfx('hurt'); burst(this.scene,P.x,P.y+1,P.z,this.w===2?'#bfe9ff':'#ff7a5a',12,5); banner('Oups !'); flashHurt();
    const c=this.cps[this.cp]; P.x=c.x; P.y=c.y; P.z=c.z; P.vx=P.vy=P.vz=0; P.onGround=false; P.ground=null; snapCam();
  },
  win(){
    this.over=true; sfx('win'); confetti(this.scene,P.x,P.y+2.2,P.z);
    const w=this.w, t=this.time, rec=!S.ob.best[w]||t<S.ob.best[w]; if(rec){ S.ob.best[w]=t; if(this.rec.length>8) ghostSave(w,this.rec); }
    if(w===0&&(!S.best.obby||t<S.best.obby)) S.best.obby=t;
    const first=!S.ob.done[w]; S.ob.done[w]=true; addCoins(50+w*25); save();
    const next=w+1<OBW.length?OBW[w+1]:null, st=S.ob.st[w]|0, n=(st&1)+(st>>1&1)+(st>>2&1);
    showResult({icon:'🏆',title:'Monde '+(w+1)+' terminé !',sub:first&&next?'🔓 Monde '+(w+2)+' '+next.ic+' '+next.n+' débloqué ! Appuie sur « Rejouer » puis choisis-le.':(rec&&this.gdata?'👻 Tu as battu ton fantôme !':'Bravo, '+S.name+' !'),
      stats:[['Temps',fmtTime(t)+(rec?' ⭐ Record !':'')],['Étoiles','⭐ '+n+'/3'],['Chutes',this.deaths],['Pièces gagnées','+'+this.earned]]});
  },
  stop(){ closeChoice(); if(this.ghost) disposeAvatar(this.ghost); },
  hud(){ setText('hW',OBW[this.w].ic+' '+(this.w+1)); setText('hTime',fmtTime(this.time)); setText('hCp',this.cp+'/2'); setText('hSt',this.got+'/3'); }
};
$('hud').addEventListener('click',e=>{ const t=e.target; if(!t||!t.closest||!t.closest('#obW')) return; if(G&&G.id==='obby'&&!G.over){ sfx('click'); G.pickWorld(); } });
