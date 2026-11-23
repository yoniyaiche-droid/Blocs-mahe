/* =========================================================
   11. Ambiances : ciels, lumières, sols, particules, musique
   Chaque jeu a son propre décor et sa propre musique.
   ========================================================= */
function skyCanvas(o){
  const W=1024, H=512, c=makeCanvas(W,H), g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,o.top); gr.addColorStop(0.3,o.mid||o.top); gr.addColorStop(0.5,o.bot); gr.addColorStop(0.56,o.bot); gr.addColorStop(1,o.under||o.bot);
  g.fillStyle=gr; g.fillRect(0,0,W,H);
  const rnd=mulberry32(o.seed||7);
  if(o.stars){ for(let i=0;i<o.stars;i++){ const x=rnd()*W, y=Math.pow(rnd(),1.6)*H*0.46, r=rnd()<0.08?1.6:0.5+rnd()*0.8; g.globalAlpha=0.35+rnd()*0.65*(1-y/(H*0.5)); g.fillStyle=rnd()<0.15?'#ffe9b0':'#ffffff'; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); } g.globalAlpha=1; }
  if(o.nebula){ for(let i=0;i<6;i++){ const x=rnd()*W, y=rnd()*H*0.38, r=60+rnd()*120, n=g.createRadialGradient(x,y,0,x,y,r); n.addColorStop(0,o.nebula[i%o.nebula.length]); n.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=n; g.fillRect(x-r,y-r,r*2,r*2); } }
  const disc=(u,el,rad,col,glow,gr2)=>{ const x=u*W, y=H*0.5-el/90*H*0.5;
    if(glow){ const q=g.createRadialGradient(x,y,0,x,y,rad*gr2); q.addColorStop(0,glow); q.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=q; g.fillRect(x-rad*gr2,y-rad*gr2,rad*gr2*2,rad*gr2*2); }
    g.fillStyle=col; g.beginPath(); g.arc(x,y,rad,0,TAU); g.fill(); return [x,y]; };
  if(o.sun) disc(o.sun.u||0.25,o.sun.el||25,o.sun.r||18,o.sun.c||'#fff6d0',o.sun.glow||'rgba(255,240,190,.75)',o.sun.gl||6);
  if(o.moon){ const [x,y]=disc(o.moon.u||0.7,o.moon.el||35,o.moon.r||16,o.moon.c||'#f4f1ff','rgba(200,200,255,.35)',5); g.fillStyle='rgba(180,170,220,.35)'; for(const [dx,dy,r] of [[-5,-4,4],[6,3,3],[-2,7,2.5]]){ g.beginPath(); g.arc(x+dx,y+dy,r,0,TAU); g.fill(); } }
  if(o.planet){ const p=o.planet, [x,y]=disc(p.u,p.el,p.r,p.c,p.glow,2.2); g.save(); g.beginPath(); g.arc(x,y,p.r,0,TAU); g.clip(); g.fillStyle=p.band||'rgba(255,255,255,.18)'; for(let i=-3;i<=3;i++) g.fillRect(x-p.r,y+i*p.r*0.28,p.r*2,p.r*0.1); g.restore();
    if(p.ring){ g.strokeStyle=p.ring; g.lineWidth=5; g.beginPath(); g.ellipse(x,y,p.r*1.9,p.r*0.45,-0.25,0,TAU); g.stroke(); } }
  if(o.skyline){ const s=o.skyline; let x=0; while(x<W){ const w=14+rnd()*34, h=(0.03+rnd()*0.09)*H; g.fillStyle=s.c; g.fillRect(x,H*0.5-h,w,h+2);
      for(let wy=H*0.5-h+5;wy<H*0.5-4;wy+=7) for(let wx=x+3;wx<x+w-4;wx+=6) if(rnd()<0.45){ g.fillStyle=s.win[Math.floor(rnd()*s.win.length)]; g.fillRect(wx,wy,2.5,3); }
      x+=w+rnd()*4; } }
  if(o.hills){ for(const [col,amp,base,f] of o.hills){ g.fillStyle=col; g.beginPath(); g.moveTo(0,H); for(let x=0;x<=W;x+=8){ g.lineTo(x,H*0.5-base-amp*(Math.sin(x*f+ (o.seed||1))*0.6+Math.sin(x*f*2.7+1.3)*0.4)); } g.lineTo(W,H); g.fill(); } }
  return c;
}
function addSky(G,o){
  const sc=G.scene; if(sc.background&&sc.background.isTexture) sc.background.dispose();
  sc.background=new THREE.Color(o.bot);
  if(sc.fog){ sc.fog.color.set(o.fog||o.bot); if(o.near!==undefined){ sc.fog.near=o.near; sc.fog.far=o.far; } }
  const t=new THREE.CanvasTexture(skyCanvas(o)); t.isOwn=true;
  const m=new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false,depthWrite:false}); m.userData.own=true;
  const geo=new THREE.SphereGeometry(320,40,20); geo.userData.own=true;
  const s=new THREE.Mesh(geo,m); s.renderOrder=-10; s.frustumCulled=false; if(o.spin) s.userData.spin=o.spin; sc.add(s); G.skyDome=s; return s;
}
function setLights(G,o){
  const sc=G.scene, h=sc.userData.hemi, s=sc.userData.sun;
  if(h&&o.hemi){ h.color.set(o.hemi[0]); h.groundColor.set(o.hemi[1]); h.intensity=o.hemi[2]; }
  if(s&&o.sun){ s.color.set(o.sun[0]); s.intensity=o.sun[1]; }
  if(o.dir) G.sunOff=o.dir;
  if(o.amb){ const a=new THREE.AmbientLight(o.amb[0],o.amb[1]); sc.add(a); }
}
/* ---------- textures de sol dessinées ---------- */
const TEXC={};
function texCanvas(kind){
  if(TEXC[kind]) return TEXC[kind];
  const N=128, c=makeCanvas(N,N), g=c.getContext('2d'), rnd=mulberry32(kind.length*7919+kind.charCodeAt(0)*31+kind.charCodeAt(kind.length-1));
  const speck=(cols,n,s)=>{ for(let i=0;i<n;i++){ g.fillStyle=cols[Math.floor(rnd()*cols.length)]; const z=s*(0.5+rnd()); g.fillRect(Math.floor(rnd()*N),Math.floor(rnd()*N),z,z); } };
  switch(kind){
    case 'grass': g.fillStyle='#8fd16a'; g.fillRect(0,0,N,N); speck(['#7cc35a','#9edc76','#86ca62','#a8e381'],900,2); speck(['#6db24d'],160,3); break;
    case 'meadow': g.fillStyle='#8fd16a'; g.fillRect(0,0,N,N); speck(['#7cc35a','#9edc76','#86ca62','#a8e381'],900,2); speck(['#ffffff','#ffe066','#ff9ec4','#b9a6ff'],22,3); break;
    case 'stone': { g.fillStyle='#8a8296'; g.fillRect(0,0,N,N); const rows=4;
      for(let r=0;r<rows;r++){ const y=r*N/rows, off=r%2?N/8:0; for(let x=-off;x<N;x+=N/4){ const sh=180+Math.floor(rnd()*40); g.fillStyle='rgb('+sh+','+(sh-8)+','+(sh+12)+')'; g.fillRect(x+2,y+2,N/4-4,N/rows-4); } }
      speck(['rgba(0,0,0,.08)','rgba(255,255,255,.1)'],700,2); break; }
    case 'sand': g.fillStyle='#f3dc9c'; g.fillRect(0,0,N,N); speck(['#e9cf88','#f8e7b4','#dfc27a','#fff2cc'],1100,2); break;
    case 'snow': g.fillStyle='#f3f8ff'; g.fillRect(0,0,N,N); speck(['#e3eefc','#ffffff','#d8e7fa'],900,2); break;
    case 'dirt': g.fillStyle='#b98a57'; g.fillRect(0,0,N,N); speck(['#a87a4a','#c99b66','#9a6d40'],1000,2); break;
    case 'rock': g.fillStyle='#4a3b3b'; g.fillRect(0,0,N,N); speck(['#3d3030','#5a4848','#352a2a'],1000,3); g.strokeStyle='#ff6a1f'; g.lineWidth=2; for(let i=0;i<5;i++){ g.beginPath(); let x=rnd()*N, y=rnd()*N; g.moveTo(x,y); for(let k=0;k<4;k++){ x+=rnd()*30-15; y+=rnd()*30-15; g.lineTo(x,y); } g.stroke(); } break;
    case 'asphalt': g.fillStyle='#2a2740'; g.fillRect(0,0,N,N); speck(['#24213a','#332f4d','#2e2a47'],1000,2); g.strokeStyle='rgba(255,79,216,.55)'; g.lineWidth=2; g.strokeRect(1,1,N-2,N-2); g.strokeStyle='rgba(43,255,213,.25)'; g.beginPath(); g.moveTo(N/2,0); g.lineTo(N/2,N); g.moveTo(0,N/2); g.lineTo(N,N/2); g.stroke(); break;
    case 'wood': for(let i=0;i<4;i++){ const sh=150+Math.floor(rnd()*35); g.fillStyle='rgb('+(sh+40)+','+(sh-10)+','+(sh-70)+')'; g.fillRect(0,i*N/4,N,N/4); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,i*N/4,N,2); g.fillRect(Math.floor(rnd()*N),i*N/4,2,N/4); } speck(['rgba(80,40,10,.15)'],300,2); break;
    case 'brick': g.fillStyle='#d9d0c6'; g.fillRect(0,0,N,N); for(let r=0;r<8;r++){ const off=r%2?N/8:0; for(let x=-off;x<N;x+=N/4){ const sh=Math.floor(rnd()*30); g.fillStyle='rgb('+(190+sh)+','+(70+sh)+','+(55+sh)+')'; g.fillRect(x+2,r*N/8+2,N/4-4,N/8-4); } } break;
    case 'gold': { const q=g.createLinearGradient(0,0,N,N); q.addColorStop(0,'#fff3a8'); q.addColorStop(0.5,'#ffcc33'); q.addColorStop(1,'#e0a100'); g.fillStyle=q; g.fillRect(0,0,N,N); g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=4; g.strokeRect(6,6,N-12,N-12); break; }
    case 'leaves': g.fillStyle='#3fae4a'; g.fillRect(0,0,N,N); speck(['#2f9a44','#4cc157','#5fd36a','#267d38'],700,4); break;
    case 'ice': { const q=g.createLinearGradient(0,0,N,N); q.addColorStop(0,'#e8fbff'); q.addColorStop(1,'#a9e4ff'); g.fillStyle=q; g.fillRect(0,0,N,N); g.strokeStyle='rgba(255,255,255,.8)'; g.lineWidth=3; for(let i=0;i<4;i++){ g.beginPath(); const x=rnd()*N; g.moveTo(x,0); g.lineTo(x+30,N); g.stroke(); } break; }
    case 'candy': for(let i=0;i<8;i++){ g.fillStyle=i%2?'#ffffff':'#ff7ab8'; g.beginPath(); g.moveTo(i*N/4-N,0); g.lineTo(i*N/4-N+N/8,0); g.lineTo(i*N/4+N/8,N); g.lineTo(i*N/4,N); g.fill(); } break;
    case 'metal': g.fillStyle='#b8c0cc'; g.fillRect(0,0,N,N); g.strokeStyle='rgba(0,0,0,.18)'; g.lineWidth=2; g.strokeRect(2,2,N-4,N-4); g.fillStyle='rgba(0,0,0,.25)'; for(const [x,y] of [[8,8],[N-10,8],[8,N-10],[N-10,N-10]]) g.fillRect(x,y,3,3); speck(['rgba(255,255,255,.15)'],200,2); break;
    default: g.fillStyle='#ffffff'; g.fillRect(0,0,N,N);
  }
  return TEXC[kind]=c;
}
function texMat(kind,color,rep,repY,extra){
  const t=new THREE.CanvasTexture(texCanvas(kind)); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep||1,repY||rep||1); t.anisotropy=8; t.isOwn=true;
  const m=new THREE.MeshLambertMaterial(Object.assign({color:color||'#ffffff',map:t},extra||{})); m.userData.own=true; return m;
}
const texC=(kind,color,extra)=>matC('X'+kind+(color||'')+(extra?JSON.stringify(extra):''),()=>{ const t=new THREE.CanvasTexture(texCanvas(kind)); t.anisotropy=4; return new THREE.MeshLambertMaterial(Object.assign({color:color||'#ffffff',map:t},extra||{})); });
/* ---------- particules d'ambiance ---------- */
const dotTex=(()=>{ const c=makeCanvas(32,32), g=c.getContext('2d'), q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(255,255,255,1)'); q.addColorStop(0.35,'rgba(255,255,255,.85)'); q.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })();
function addAmb(G,o){
  const n=o.n||260, W=o.w||70, H=o.h||26, pos=new Float32Array(n*3), ph=new Float32Array(n);
  const cx=o.cx!==undefined?o.cx:P.x, cz=o.cz!==undefined?o.cz:P.z, y0=o.y0||0;
  for(let i=0;i<n;i++){ pos[i*3]=cx+rand(-W/2,W/2); pos[i*3+1]=y0+rand(0,H); pos[i*3+2]=cz+rand(-W/2,W/2); ph[i]=rand(0,TAU); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.userData.own=true;
  const m=new THREE.PointsMaterial({color:o.color||'#ffffff',size:o.size||0.25,map:dotTex,transparent:true,depthWrite:false,opacity:o.op||0.9,blending:o.glow?THREE.AdditiveBlending:THREE.NormalBlending,fog:!o.glow}); m.userData.own=true;
  const p=new THREE.Points(geo,m); p.frustumCulled=false; G.scene.add(p);
  const a={p,pos,ph,o,W,H,n,fixed:o.fixed}; (G.amb||(G.amb=[])).push(a); return a;
}
function updAmb(G,dt){
  if(!G.amb) return; const t=G.time||0;
  for(const a of G.amb){ const pos=a.pos, o=a.o, k=o.kind, W=a.W, H=a.H, cx=a.fixed?o.cx:P.x, cz=a.fixed?o.cz:P.z, cy=a.fixed?(o.y0||0):(o.rel?P.y-4:(o.y0||0));
    for(let i=0;i<a.n;i++){ let x=pos[i*3], y=pos[i*3+1], z=pos[i*3+2]; const f=a.ph[i];
      if(k==='snow'){ y-=dt*(0.9+(f%1)*0.8); x+=Math.sin(t*0.8+f)*dt*0.7; }
      else if(k==='embers'){ y+=dt*(1.2+(f%1)*1.6); x+=Math.sin(t*2+f)*dt*0.6; }
      else if(k==='fireflies'){ x+=Math.sin(t*0.7+f)*dt*0.9; y+=Math.sin(t*1.3+f*2)*dt*0.5; z+=Math.cos(t*0.6+f)*dt*0.9; }
      else if(k==='petals'){ y-=dt*(0.7+(f%1)*0.5); x+=Math.sin(t*1.4+f)*dt*1.1; z+=dt*0.35; }
      else if(k==='dust'){ x+=Math.sin(t*0.3+f)*dt*0.3; y+=Math.sin(t*0.5+f)*dt*0.2; }
      else if(k==='rise'){ y+=dt*(0.6+(f%1)*0.8); }
      if(x-cx<-W/2) x+=W; else if(x-cx>W/2) x-=W; if(z-cz<-W/2) z+=W; else if(z-cz>W/2) z-=W;
      if(y<cy) y+=H; else if(y>cy+H) y-=H;
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z; }
    a.p.geometry.attributes.position.needsUpdate=true;
    if(k==='fireflies') a.p.material.opacity=(o.op||0.9)*(0.65+Math.sin(t*2.6)*0.35); }
}
function envFrame(dt){
  if(!G) return;
  const sd=G.skyDome; if(sd){ sd.position.copy(camera.position); if(sd.userData.spin) sd.rotation.y+=dt*sd.userData.spin; }
  updAmb(G,dt);
}
/* ---------- écran-titre au lancement ---------- */
function introCard(ic,title,sub,bg){
  const e=$('intro'); if(!e) return; e.innerHTML=''; const i=el('div','ic'), b=el('b'), s=el('span');
  i.textContent=ic; b.textContent=title; s.textContent=sub||''; e.appendChild(i); e.appendChild(b); if(sub) e.appendChild(s);
  e.style.background=bg||'linear-gradient(140deg,#7b4ff0,#ff4f8b)'; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show');
}
/* ---------- musique de fond (une par jeu) ---------- */
const NOTE=m=>440*Math.pow(2,(m-69)/12);
const SONGS={
  menu:{bpm:96,root:60,scale:[0,2,4,7,9],lead:'triangle',bass:'sine',prog:[0,5,3,4],mel:[4,null,2,null,1,2,null,0, 2,null,4,null,3,null,2,null, 4,null,2,null,1,2,null,0, 1,null,0,null,-1,null,0,null],drum:'k...h...k...h...',vol:0.8},
  obby:{bpm:138,root:64,scale:[0,2,4,7,9],lead:'square',bass:'triangle',prog:[0,3,4,3],mel:[0,2,4,2,5,4,2,null, 4,5,7,5,4,2,0,null, 0,2,4,2,5,4,7,null, 5,4,2,4,0,null,0,null],drum:'k.h.s.h.k.k.s.h.',vol:0.7},
  arena:{bpm:124,root:57,scale:[0,2,3,5,7,8,10],lead:'sawtooth',bass:'sawtooth',prog:[0,5,6,4],mel:[0,null,0,2,3,null,2,0, 4,null,3,2,3,null,null,null, 0,null,0,2,3,null,5,4, 3,2,1,2,0,null,null,null],drum:'k.hhs.hhk.kks.hh',vol:0.6},
  island:{bpm:112,root:62,scale:[0,2,4,5,7,9,11],lead:'triangle',bass:'sine',prog:[0,3,4,0],mel:[4,null,4,5,4,2,0,null, 3,null,3,4,3,1,null,null, 4,null,4,5,6,5,4,2, 1,2,3,1,0,null,null,null],drum:'k..hs.h.k.khs.h.',vol:0.75,pluck:true},
  build:{bpm:84,root:60,scale:[0,2,4,7,9],lead:'sine',bass:'triangle',prog:[0,4,5,3],mel:[2,null,null,4,null,null,3,null, 2,null,null,1,null,null,0,null, 4,null,null,5,null,null,4,null, 2,null,null,3,null,null,2,null],drum:'k.......s.......',vol:0.8,soft:true},
  eggs:{bpm:128,root:65,scale:[0,2,4,5,7,9,11],lead:'square',bass:'triangle',prog:[0,4,5,3],mel:[0,null,2,4,4,null,2,0, 1,null,3,5,5,null,4,null, 4,5,6,4,5,4,2,0, 1,null,3,1,0,null,null,null],drum:'k.h.s.hhk.h.s.h.',vol:0.65,pluck:true},
  brainrot:{bpm:118,root:57,scale:[0,3,5,7,10],lead:'sawtooth',bass:'square',prog:[0,0,3,4],mel:[0,null,0,2,null,3,null,2, 4,null,3,2,0,null,null,null, 0,null,0,2,null,3,4,5, 4,3,2,null,0,null,null,null],drum:'k.hsk.hsk.hsk.hs',vol:0.6,octBass:true},
  royale:{bpm:140,root:55,scale:[0,2,3,5,7,8,10],lead:'square',bass:'sawtooth',prog:[0,6,5,4],mel:[0,2,3,null,4,null,3,2, 3,null,2,null,0,null,null,null, 0,2,3,null,4,null,6,5, 4,null,3,null,4,null,null,null],drum:'k.hsk.hsk.hsk.ks',vol:0.55},
  mc:{bpm:72,root:60,scale:[0,2,4,7,9],lead:'sine',bass:'sine',prog:[0,4,5,3],mel:[4,null,null,null,2,null,null,null, 3,null,null,null,null,null,null,null, 2,null,null,null,4,null,null,null, 1,null,null,null,null,null,null,null],drum:'................',vol:0.7,soft:true},
  pirates:{bpm:132,root:62,scale:[0,2,3,5,7,8,10],lead:'triangle',bass:'triangle',prog:[0,6,5,4],mel:[0,null,2,3,null,4,3,null, 2,null,0,null,6,null,null,null, 0,null,2,3,null,4,5,null, 4,null,3,null,0,null,null,null],drum:'k..s..k..s..k.s.',vol:0.7,pluck:true}
};
const BGM={song:null,id:null,step:0,next:0,g:null};
function bgmPlay(id){ if(BGM.id===id) return; bgmStop(); BGM.id=id; BGM.song=SONGS[id]||null; BGM.step=0; }
function bgmStop(){ BGM.song=null; BGM.id=null; if(BGM.g&&AC){ const g=BGM.g; try{ g.gain.setTargetAtTime(0,AC.currentTime,0.15); setTimeout(()=>{ try{ g.disconnect(); }catch(e){} },900); }catch(e){} } BGM.g=null; }
function mnote(f,t,dur,type,vol,att){ const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+(att||0.01)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(BGM.g); o.start(t); o.stop(t+dur+0.05); }
function mdrum(k,t){
  if(k==='k'){ const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(42,t+0.12); g.gain.setValueAtTime(0.16,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.18); o.connect(g); g.connect(BGM.g); o.start(t); o.stop(t+0.2); return; }
  const src=AC.createBufferSource(); src.buffer=engNoise(); const f=AC.createBiquadFilter(); f.type=k==='h'?'highpass':'bandpass'; f.frequency.value=k==='h'?7500:1700; const g=AC.createGain(), d=k==='h'?0.035:0.11;
  g.gain.setValueAtTime(k==='h'?0.035:0.07,t); g.gain.exponentialRampToValueAtTime(0.001,t+d); src.connect(f); f.connect(g); g.connect(BGM.g); src.start(t,Math.random()*0.5); src.stop(t+d+0.02);
}
function bgmTick(){
  const s=BGM.song; if(!s||!AC||!S.sound||S.music===false||AC.state!=='running'){ if(BGM.g&&AC&&(!S.sound||S.music===false)){ try{ BGM.g.gain.setTargetAtTime(0,AC.currentTime,0.1); }catch(e){} BGM.g=null; } return; }
  if(!BGM.g){ BGM.g=AC.createGain(); BGM.g.gain.value=0; BGM.g.connect(AC.destination); BGM.g.gain.setTargetAtTime(s.vol||0.7,AC.currentTime,0.6); BGM.next=AC.currentTime+0.12; }
  const spb=60/s.bpm/2, now=AC.currentTime;
  if(BGM.next<now-0.5) BGM.next=now+0.05;
  while(BGM.next<now+0.3){
    const st=BGM.step, t=BGM.next, bar=Math.floor(st/8)%s.prog.length, ch=s.prog[bar], sc=s.scale, L=sc.length;
    const deg=d=>{ const q=d+ch, o=Math.floor(q/L); return s.root+sc[((q%L)+L)%L]+12*o; };
    const m=s.mel[st%s.mel.length];
    if(m!==null&&m!==undefined) mnote(NOTE(deg(m)+12),t,spb*(s.soft?3.2:s.pluck?1.1:1.6),s.lead,s.lead==='sawtooth'||s.lead==='square'?0.022:0.045,s.soft?0.06:0.008);
    if(st%4===0) mnote(NOTE(deg(0)-12),t,spb*(s.soft?7:3.4),s.bass,s.bass==='sawtooth'||s.bass==='square'?0.026:0.06,0.02);
    if(s.octBass&&st%4===2) mnote(NOTE(deg(0)),t,spb*1.2,s.bass,0.022,0.01);
    if(s.soft&&st%8===0){ mnote(NOTE(deg(2)),t,spb*7,'sine',0.02,0.25); mnote(NOTE(deg(4)),t,spb*7,'sine',0.016,0.3); }
    const dk=s.drum[st%s.drum.length]; if(dk&&dk!=='.') mdrum(dk,t);
    BGM.step=(st+1)%(s.mel.length*Math.max(1,Math.round(s.prog.length*8/s.mel.length))); BGM.next+=spb;
  }
}
