/* =========================================================
   28. Bonus : mode photo + album, défis du jour, série de jours,
   vibrations, sauvegarde à garder de côté (export / import)
   ========================================================= */
/* ---------- photos ---------- */
const PHOTO={want:0,src:'',KEY:'blocsmahe-photos-v1',MAX:12};
function photoTake(src){ if(mode!=='game') return; PHOTO.want=1; PHOTO.src=src||''; }
function photoGrab(){
  PHOTO.want=0;
  try{ const c=renderer.domElement, w=Math.min(720,c.width), h=Math.round(c.height*w/c.width), t=document.createElement('canvas'); t.width=w; t.height=h;
    t.getContext('2d').drawImage(c,0,0,w,h); const url=t.toDataURL('image/jpeg',0.82);
    let all=photoAll(); const gl=G&&GAME_LIST.find(x=>x.id===G.id); all.unshift({u:url,g:gl?gl.ic+' '+gl.t:'',d:Date.now()});
    while(all.length>PHOTO.MAX) all.pop();
    for(let k=0;k<4;k++){ try{ localStorage.setItem(PHOTO.KEY,JSON.stringify(all)); break; }catch(e){ all.pop(); } }
    sfx('cp'); const f=$('flashShot'); if(f){ f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
    toast('📸 Photo enregistrée dans ton album (accueil → 📸 Mes photos)');
  }catch(e){ toast('📸 Impossible de prendre la photo ici'); }
}
function photoAll(){ try{ const a=JSON.parse(localStorage.getItem(PHOTO.KEY)||'[]'); return Array.isArray(a)?a.filter(p=>p&&typeof p.u==='string'&&p.u.indexOf('data:image/jpeg')===0):[]; }catch(e){ return []; } }
function photoAlbum(){
  const all=photoAll(), m=$('album'); if(!m) return;
  const grid=m.querySelector('.al-grid'); grid.innerHTML='';
  if(!all.length){ const p=el('p','al-empty'); p.textContent='Pas encore de photo. En jeu : 🏠 → 📸 Prendre une photo, ou le bouton 📸 du drone.'; grid.appendChild(p); }
  all.forEach((p,i)=>{ const b=el('button','al-it'), im=new Image(); im.src=p.u; im.alt='Photo '+(i+1); b.appendChild(im); const s=el('span'); s.textContent=p.g; b.appendChild(s);
    b.addEventListener('click',()=>photoOpen(i)); grid.appendChild(b); });
  m.classList.add('on');
}
function photoOpen(i){
  const all=photoAll(), p=all[i]; if(!p) return;
  openChoiceHome({title:'📸 Photo',items:[
    {ic:'💾',t:'Enregistrer',d:'Sur ton téléphone',cb:()=>{ const a=document.createElement('a'); a.href=p.u; a.download='blocs-mahe-photo-'+(i+1)+'.jpg'; document.body.appendChild(a); a.click(); a.remove(); }},
    {ic:'📤',t:'Partager',d:'Envoyer la photo',cb:()=>photoShare(p)},
    {ic:'🗑️',t:'Supprimer',d:'Effacer de l\'album',cb:()=>{ all.splice(i,1); try{ localStorage.setItem(PHOTO.KEY,JSON.stringify(all)); }catch(e){} photoAlbum(); }}]});
}
function photoShare(p){
  try{ const b=atob(p.u.split(',')[1]), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i);
    const f=new File([u],'blocs-mahe.jpg',{type:'image/jpeg'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){ navigator.share({files:[f],title:'Blocs Mahé',text:'Regarde ma photo dans Blocs Mahé ! '+SHARE_URL}).catch(()=>{}); return; }
  }catch(e){}
  toast('Ton téléphone ne sait pas partager la photo : utilise « Enregistrer »');
}
/* fenêtre de choix utilisable à l'accueil (comme le partage) */
function openChoiceHome(o){ const c=$('choice'), par=c.parentNode, nx=c.nextSibling, moved=!G&&par!==document.body;
  if(moved){ document.body.appendChild(c); c.classList.add('home'); }
  const back=()=>{ if(moved&&c.parentNode===document.body){ c.classList.remove('home'); par.insertBefore(c,nx); } };
  openChoice(Object.assign({},o,{onClose:()=>{ back(); if(o.onClose) o.onClose(); },items:o.items.map(it=>Object.assign({},it,{cb:()=>{ back(); it.cb(); }}))})); }
/* 📸 dans le menu pause */
{ const pm=pauseMenu; pauseMenu=function(){ pm(); const grid=document.querySelector('#choice.on .ch-grid'); if(!grid||!G) return;
    const b=el('button','ch-it'); b.style.background='#fff4d6'; b.innerHTML='<span class="ic">📸</span><b>Prendre une photo</b><span class="d">Sans les boutons</span>';
    b.addEventListener('click',()=>{ sfx('click'); closeChoice(); PAUSE=Math.max(0,PAUSE-1); photoTake('pause'); });
    grid.insertBefore(b,grid.children[1]||null); }; }

/* ---------- défis du jour + série de jours ---------- */
function dayKey(t){ const d=t?new Date(t):new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function dailyEnsure(){
  const k=dayKey(), D=S.daily;
  if(D.day===k) return D;
  const y=dayKey(Date.now()-86400000);
  D.streak=D.day===y?Math.min(99,(D.streak||0)+1):1; D.day=k; D.prog={}; D.done={}; D.games=[];
  const seed=k.split('-').reduce((a,b)=>a*31+(+b),7), r=mulberry32(seed), ids=GAME_LIST.map(g=>g.id);
  D.feat=ids[Math.floor(r()*ids.length)];
  const pool=[{k:'coins',n:120},{k:'games',n:3},{k:'time',n:8},{k:'ends',n:3}];
  const a=pool[Math.floor(r()*pool.length)]; let b=pool[Math.floor(r()*pool.length)]; if(b.k===a.k) b=pool[(pool.indexOf(a)+1)%pool.length];
  D.list=[{k:'feat',n:1},a,b];
  const bonus=Math.min(100,10+D.streak*10); S.coins+=bonus; D.bonus=bonus; save();
  setTimeout(()=>toast('🔥 Série de '+D.streak+' jour'+(D.streak>1?'s':'')+' : +'+bonus+' 🪙 !'),900);
  return D;
}
function dailyTxt(c){ const gl=GAME_LIST.find(g=>g.id===S.daily.feat);
  return c.k==='feat'?'Joue à '+(gl?gl.ic+' '+gl.t:'un jeu'):c.k==='coins'?'Gagne '+c.n+' 🪙 en jouant':c.k==='games'?'Joue à '+c.n+' jeux différents':c.k==='time'?'Joue '+c.n+' minutes':'Termine '+c.n+' parties'; }
function dailyAdd(k,v){ const D=dailyEnsure(); D.prog[k]=(D.prog[k]||0)+v;
  D.list.forEach((c,i)=>{ if(D.done[i]) return; const p=c.k==='feat'?(D.prog.feat||0):c.k==='time'?Math.floor((D.prog.time||0)/60):(D.prog[c.k]||0);
    if(p>=c.n){ D.done[i]=1; S.coins+=60; sfx('buy'); toast('🎯 Défi réussi : '+dailyTxt(c)+' · +60 🪙'); if(mode==='game') banner('🎯 Défi du jour réussi ! +60 🪙'); } });
  saveSoon(); }
function dailyCard(p){
  const D=dailyEnsure(), b=el('div','daily'), h=el('div','dh'); h.innerHTML='<b>🎯 Défis du jour</b><span>🔥 '+D.streak+' jour'+(D.streak>1?'s':'')+'</span>'; b.appendChild(h);
  D.list.forEach((c,i)=>{ const r=el('div','dr'+(D.done[i]?' ok':'')), p=c.k==='feat'?(D.prog.feat||0):c.k==='time'?Math.floor((D.prog.time||0)/60):(D.prog[c.k]||0), t=el('span','dt'), bar=el('i'), f=el('u');
    t.textContent=(D.done[i]?'✅ ':'')+dailyTxt(c); f.style.width=Math.min(100,p/c.n*100)+'%'; bar.appendChild(f); const v=el('em'); v.textContent=D.done[i]?'+60 🪙':Math.min(p,c.n)+'/'+c.n;
    r.appendChild(t); r.appendChild(v); r.appendChild(bar); b.appendChild(r); });
  p.appendChild(b);
}
{ const sg=startGame; startGame=function(id){ const r=sg.apply(this,arguments); try{ const D=dailyEnsure(); if(D.games.indexOf(id)<0){ D.games.push(id); dailyAdd('games',1); } if(id===D.feat) dailyAdd('feat',1); }catch(e){} return r; }; }
{ const ac=addCoins; addCoins=function(n){ const r=ac.apply(this,arguments); try{ if(n>0&&mode==='game') dailyAdd('coins',n); }catch(e){} return r; }; }
{ const sr=showResult; showResult=function(o){ const r=sr.apply(this,arguments); try{ dailyAdd('ends',1); }catch(e){} return r; }; }
let dailyT=0;
function dailyTick(dt){ if(mode!=='game'||PAUSE) return; dailyT+=dt; if(dailyT>=15){ dailyAdd('time',dailyT); dailyT=0; } }

/* ---------- vibrations ---------- */
function vib(ms){ try{ if(S.vib!==false&&navigator.vibrate) navigator.vibrate(ms); }catch(e){} }
{ const fh=flashHurt; flashHurt=function(){ vib(45); return fh.apply(this,arguments); }; }

/* ---------- sauvegarde à garder de côté ---------- */
function saveExport(){
  save(); const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(/^(cubiverse|blocsmahe)/.test(k)&&k!==PHOTO.KEY) o[k]=localStorage.getItem(k); }
  const txt='BLOCSMAHE1:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'})); a.download='blocs-mahe-sauvegarde-'+dayKey()+'.txt';
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500);
  toast('💾 Fichier de sauvegarde enregistré (dossier Téléchargements)');
}
function saveImport(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.txt,text/plain';
  inp.addEventListener('change',()=>{ const f=inp.files&&inp.files[0]; if(!f) return; const rd=new FileReader();
    rd.onload=()=>{ try{ const t=String(rd.result||'').trim(); if(t.indexOf('BLOCSMAHE1:')!==0) throw 0;
        const o=JSON.parse(decodeURIComponent(escape(atob(t.slice(11))))); let n=0;
        for(const k in o) if(/^(cubiverse|blocsmahe)/.test(k)&&typeof o[k]==='string'){ localStorage.setItem(k,o[k]); n++; }
        if(!n) throw 0; window.__moving=true; toast('✅ Sauvegarde chargée !'); setTimeout(()=>location.reload(),700);
      }catch(e){ toast('⚠️ Ce fichier n\'est pas une sauvegarde de Blocs Mahé'); } };
    rd.readAsText(f); });
  inp.click();
}
function moreMenu(){
  openChoiceHome({title:'⭐ Plus',items:[
    {ic:'📸',t:'Mes photos',d:photoAll().length+' photo(s)',cb:()=>photoAlbum()},
    {ic:'💾',t:'Garder ma sauvegarde',d:'Fichier à mettre de côté',cb:saveExport},
    {ic:'📂',t:'Charger une sauvegarde',d:'Depuis un fichier',cb:saveImport},
    {ic:S.vib===false?'📴':'📳',t:'Vibrations',d:S.vib===false?'Coupées':'Activées',cb:()=>{ S.vib=S.vib===false; save(); vib(60); toast(S.vib?'📳 Vibrations activées':'📴 Vibrations coupées'); }},
    {ic:'🎮',t:'Aides de jeu',d:S.ez.aim&&S.ez.cam?'Visée auto + caméra auto':'Coupées',cb:()=>{ const on=!(S.ez.aim&&S.ez.cam); S.ez.aim=S.ez.cam=on; save(); toast(on?'🎮 Aides activées : visée et caméra automatiques':'🎮 Aides coupées : tu vises et tournes la caméra toi-même'); }},
    {ic:'❓',t:'Revoir les tutoriels',d:'Au prochain lancement',cb:()=>{ S.tuto={}; save(); toast('❓ Les tutoriels reviendront au prochain lancement de chaque jeu'); }}]});
}
function moreCard(p){
  const w=el('div','morerow'), a=el('button','morebtn'), b=el('button','morebtn');
  a.innerHTML='<span>📸</span><b>Mes photos</b>'; b.innerHTML='<span>⭐</span><b>Plus</b>';
  a.addEventListener('click',()=>{ sfx('click'); photoAlbum(); }); b.addEventListener('click',()=>{ sfx('click'); moreMenu(); });
  w.appendChild(a); w.appendChild(b); p.appendChild(w);
}

/* éléments de page : album, flash */
try{ const m=el('div','modal'); m.id='album'; m.innerHTML='<div class="box al-box"><div class="al-h"><b>📸 Mes photos</b><button class="iconbtn al-x" aria-label="Fermer">✖️</button></div><div class="al-grid"></div></div>';
  document.body.appendChild(m); m.querySelector('.al-x').addEventListener('click',()=>{ sfx('click'); m.classList.remove('on'); });
  m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('on'); });
  const f=el('div',''); f.id='flashShot'; document.body.appendChild(f); }catch(e){}

/* ---------- réalisme : halo du soleil dans les ciels de jour ---------- */
const SUNTEX=(()=>{ try{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'), r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,'rgba(255,255,242,1)'); r.addColorStop(0.1,'rgba(255,251,225,0.95)'); r.addColorStop(0.28,'rgba(255,232,175,0.32)'); r.addColorStop(1,'rgba(255,220,150,0)');
  g.fillStyle=r; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); }catch(e){ return null; } })();
{ const as=addSky; addSky=function(Gm,o){ const s=as.apply(this,arguments);
    try{ const top=new THREE.Color(o.top||'#000000'), lum=0.299*top.r+0.587*top.g+0.114*top.b;
      if(SUNTEX&&lum>0.3&&!o.noSun&&!o.spin){ const m=new THREE.SpriteMaterial({map:SUNTEX,color:'#ffffff',transparent:true,depthWrite:false,depthTest:false,fog:false,blending:THREE.AdditiveBlending}); m.userData.own=true;
        const sp=new THREE.Sprite(m); sp.scale.setScalar(150); sp.renderOrder=-9; s.add(sp); s.userData.sunSp=sp; } }catch(e){}
    return s; }; }
function sunGlow(){ const g=G; if(!g||!g.skyDome) return; const sp=g.skyDome.userData.sunSp; if(!sp) return;
  const d=g.sunOff||[14,30,10], l=Math.hypot(d[0],d[1],d[2])||1; sp.position.set(d[0]/l*300,Math.max(0.12,d[1]/l)*300,d[2]/l*300); }
