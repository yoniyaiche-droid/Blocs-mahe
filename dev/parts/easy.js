/* =========================================================
   26. Jeu plus simple pour les enfants
   - 🏠 ouvre un menu pause (Continuer / Revoir le tutoriel / Accueil)
   - la caméra suit toute seule (jeux à la 3e personne sans caméra propre)
   - Bataille Royale : cible verrouillée automatiquement, tir automatique,
     meilleure arme choisie seule, boussole vers les coffres / la zone sûre
   - tutoriel animé (main + phrases sur les vrais boutons) au 1er lancement
     de chaque jeu ; TUTO[id] = liste d'étapes {g,at,t,d}
       g : 'drag' (joystick), 'tap', 'hold', 'swipe' (caméra), 'point', 'none'
       at : sélecteur CSS ou {x,y} (fraction de l'écran)
   Un nouveau jeu : ajouter TUTO.monjeu=[…] et, si besoin, G.tutoReady().
   ========================================================= */
let PAUSE=0, lastDragT=0;
canvas.addEventListener('pointermove',()=>{ if(mode==='game'&&camPtr&&camPtr.moved>8) lastDragT=performance.now(); });
/* ---------- pause ---------- */
function pauseMenu(){
  if(!G||mode!=='game') return;
  if(TU.on) tutoEnd(false);
  PAUSE++; let left=false; const back=()=>{ if(!left){ left=true; PAUSE=Math.max(0,PAUSE-1); } };
  const gl=GAME_LIST.find(x=>x.id===G.id), items=[{ic:'▶️',t:'Continuer',d:'Reprendre la partie',bg:'#e2fbe9',cb:back}];
  if(TUTO[G.id]) items.push({ic:'❓',t:'Revoir le tutoriel',d:'Comment on joue',bg:'#e7efff',cb:()=>{ back(); tutoStart(G.id); }});
  items.push({ic:'🏠',t:'Retour à l\'accueil',d:'Quitter '+(gl?gl.t:'ce jeu'),bg:'#ffe4ea',cb:()=>{ back(); exitGame(); }});
  openChoice({title:'⏸️ Pause',sub:netLive()?'Tes copains continuent de jouer pendant ta pause.':'Le jeu est en pause.',onClose:back,items});
}
/* ---------- caméra qui suit toute seule ---------- */
function autoCam(dt){
  const g=G; if(!g||g.fp||g.camUpd||g.noAutoCam||S.ez.cam===false||PAUSE||g.over) return;
  if(camPtr&&camPtr.moved>8) return; if(performance.now()-lastDragT<1400) return;
  const t=g.camTarget&&g.camTarget();
  if(t){ const yc=Math.atan2(P.x-t.x,P.z-t.z); cam.yaw=angLerp(cam.yaw,yc,damp(3.4,dt)); return; }
  const m=Math.min(1,Math.hypot(inp.x,inp.y)); if(m<0.3) return;
  const want=P.yaw+Math.PI, d=Math.atan2(Math.sin(want-cam.yaw),Math.cos(want-cam.yaw)); if(Math.abs(d)>2.4) return;
  cam.yaw+=d*Math.min(1,dt*1.5*m);
}
/* ---------- Bataille Royale : visée et tir automatiques ---------- */
{ const R=GAMES.royale, up=R.update, ap=R.aimPoint, hd=R.hud;
  const gun=it=>{ const w=it&&WPN[it.w]; return w&&it.w!=='pickaxe'&&!w.hook&&!w.toss?w:null; };
  R.camTarget=function(){ return S.ez.aim!==false&&this.lock?this.lock:null; };
  R.tutoReady=function(){ return !!this.modeChosen; };
  R.ezFind=function(rng){
    const fx=cam.fx, fz=cam.fz, fl=Math.hypot(fx,fz)||1; let best=null, bs=1e9;
    const consider=(x,y,z,ref,net)=>{ const dx=x-P.x, dz=z-P.z, d=Math.hypot(dx,dz); if(d>rng||d<0.4) return;
      const a=Math.acos(clamp((dx*fx+dz*fz)/(d*fl),-1,1)); if(a>1.35&&d>9) return;
      if(!this.los(this.pEnt,{x,y,z})) return;
      const sc=d+a*6-(ref===this.lockRef?5:0); if(sc<bs){ bs=sc; best={x,y,z,ref,net}; } };
    for(const e of this.ents) if(!e.isPlayer&&e.alive&&e.team!==0&&e.landed!==false) consider(e.x,e.y,e.z,e,false);
    if(this.netFoes&&netLive()) for(const q of this.netFoes()) consider(q.x,q.y,q.z,q,true);
    return best; };
  R.ezTick=function(dt){
    const pe=this.pEnt, on=S.ez.aim!==false&&pe&&pe.alive&&pe.landed&&!this.over&&!this.kart;
    if(!on){ this.lock=null; this.lockRef=null; }
    else { this.ezT=(this.ezT||0)-dt;
      if(this.ezT<=0){ this.ezT=0.12; let rng=0; for(const it of this.inv){ const w=gun(it); if(w) rng=Math.max(rng,w.range); } const f=rng?this.ezFind(Math.min(rng,36)):null; this.lock=f; this.lockRef=f&&f.ref; }
      const l=this.lock; if(l&&l.ref){ if(l.net){ l.x=l.ref.x; l.y=l.ref.y; l.z=l.ref.z; } else if(l.ref.alive){ l.x=l.ref.x; l.y=l.ref.y; l.z=l.ref.z; } else { this.lock=null; this.lockRef=null; } } }
    let it=this.inv[this.sel], W=gun(it);
    if(this.lock&&!W){ let bi=-1, bv=-1; this.inv.forEach((x,i)=>{ const w=gun(x); if(w){ const v=(x.r||0)*100+w.dmg*(w.pel||1)/w.rate; if(v>bv){ bv=v; bi=i; } } });
      if(bi>=0){ this.select(bi); it=this.inv[bi]; W=gun(it); } }
    if(this.lock&&W&&this.fireCd<=0&&!PAUSE){ const d=Math.hypot(this.lock.x-P.x,this.lock.z-P.z); if(d<=W.range) this.tryFire(); }
    this.ezMark(dt); const ch=$('crosshair'); if(ch) ch.classList.toggle('lock',!!this.lock);
  };
  R.ezMark=function(dt){
    if(!this.ezM){ const mat=new THREE.MeshBasicMaterial({color:0xff3355,transparent:true,opacity:0.9,depthTest:false,side:THREE.DoubleSide}); mat.userData.own=1;
      const g=new THREE.Group(), ring=new THREE.Mesh(new THREE.RingGeometry(0.6,0.82,32),mat), arrow=new THREE.Mesh(new THREE.ConeGeometry(0.24,0.44,4),mat);
      ring.rotation.x=-Math.PI/2; ring.position.y=0.07; arrow.rotation.x=Math.PI; arrow.position.y=2.55; ring.renderOrder=arrow.renderOrder=20; g.add(ring); g.add(arrow); g.visible=false; this.scene.add(g); this.ezM=g; }
    const g=this.ezM, l=this.lock; g.visible=!!l; if(!l) return;
    g.position.set(l.x,l.y,l.z); g.rotation.y+=dt*2.6; g.children[1].position.y=2.55+Math.sin(performance.now()*0.006)*0.15; };
  R.aimPoint=function(range){ const l=this.lock; if(l&&S.ez.aim!==false&&Math.hypot(l.x-P.x,l.z-P.z)<=range+1) return l.net?{x:l.x,y:l.y+1.05,z:l.z}:{x:l.x,y:l.y+1.05,z:l.z,e:l.ref}; return ap.apply(this,arguments); };
  R.update=function(dt){ const r=up.apply(this,arguments); try{ this.ezTick(dt); }catch(e){ console.warn(e); } return r; };
  R.hud=function(){ const r=hd.apply(this,arguments);
    /* guidage : sans arme → coffre le plus proche ; hors zone → zone sûre */
    const pe=this.pEnt, hud=$('hud'); let t=null, lab='';
    if(pe&&pe.alive&&pe.landed&&!this.over){
      const st=this.st, dz=st?Math.hypot(P.x-st.cx,P.z-st.cz):0;
      if(st&&dz>st.r-4){ t={x:st.cx,z:st.cz}; lab='🛡️ Zone sûre · '+Math.max(0,Math.round(dz-st.r))+' m'; }
      else if(!this.inv.some(gun)){ let bd=1e9; for(const c of this.chests){ if(c.open) continue; const d=Math.hypot(c.x-P.x,c.z-P.z); if(d<bd){ bd=d; t=c; } } if(t) lab='✨ Coffre · '+Math.round(bd)+' m'; } }
    hud.classList.toggle('guide',!!t); if(t) pointCompass(t.x,t.z,lab);
    return r; }; }
GAMES.mc.tutoReady=function(){ return !this.panel; };
GAMES.beast.tutoReady=function(){ return !this.inB; };

/* ---------- tutoriels animés ---------- */
const JOY={g:'drag',at:'#joy',t:'Fais glisser ce rond pour te déplacer.'}, CAMSW={g:'swipe',t:'Glisse ton doigt sur l\'écran pour regarder autour de toi. La caméra suit aussi toute seule !'}, JUMP={g:'tap',at:'#bJump',t:'Appuie ici pour sauter.'};
const TUTO={
  build:[{g:'none',t:'🏗️ Bienvenue dans le Bâtisseur ! Ici, tu construis tout ce que tu veux.'},JOY,CAMSW,
    {g:'tap',at:'#mPlace',t:'Choisis « Poser »…'},{g:'tap',at:{x:0.5,y:0.6},t:'… puis touche le sol pour poser un bloc. 🧱'},
    {g:'tap',at:'#mBreak',t:'« Casser » enlève les blocs. ↩️ annule la dernière action.'},{g:'tap',at:'#bFly',t:'✈️ pour voler et construire tout en haut.'},JUMP,{g:'none',t:'🎉 À toi de construire !'}],
  eggs:[{g:'none',t:'🥚 Vole les œufs, fais-les éclore et protège ta base !'},JOY,CAMSW,
    {g:'none',t:'Marche sur un œuf pour le prendre, puis rapporte-le dans ta base 🏠. La flèche te montre le chemin.'},
    {g:'tap',at:'#bAct',t:'🏏 Tape les voleurs qui viennent chez toi !'},{g:'tap',at:'#bSpeed',t:'⚡ Achète de la vitesse…'},{g:'tap',at:'#bPen',t:'… et agrandis ta base pour garder plus d\'œufs.'},JUMP,{g:'none',t:'🎉 C\'est parti !'}],
  brainrot:[{g:'none',t:'🧠 Achète, vole et collectionne les brainrots les plus rares !'},JOY,CAMSW,
    {g:'none',t:'Approche-toi d\'un brainrot qui passe pour l\'acheter. Dans ta base, il te rapporte de l\'argent 💵.'},
    {g:'tap',at:'#bAct',t:'🏏 Tape les voleurs pour récupérer ton brainrot !'},{g:'tap',at:'#bLock',t:'🔒 Verrouille ta base pour la protéger un moment.'},{g:'tap',at:'#bDex',t:'📖 Ton album de brainrots.'},{g:'none',t:'🎉 Bonne chasse !'}],
  royale:[{g:'none',t:'🪂 Bataille Royale : sois le dernier debout sur l\'île !'},{g:'tap',at:'#bJump',t:'Appuie ici pour sauter de la montgolfière.'},
    {g:'drag',at:'#joy',t:'Fais glisser pour courir. La caméra suit toute seule !'},
    {g:'none',t:'✨ Marche jusqu\'aux coffres : tu ramasses les armes tout seul. La flèche en haut te guide.'},
    {g:'point',at:'#hotbar',t:'Tes armes se rangent ici. Touche-en une pour la prendre.'},
    {g:'none',t:'🎯 Quand un ennemi est près de toi, un cercle rouge le montre et tu tires tout seul !'},
    {g:'tap',at:'#bFire',t:'💥 Tu peux aussi tirer toi-même, ou casser des arbres pour avoir du bois.'},{g:'tap',at:'#bBuild',t:'🏗️ Construis un mur pour te protéger.'},
    {g:'none',t:'⛈️ Reste dans la zone sûre : la tempête rétrécit ! Bonne chance !'}],
  mc:[{g:'none',t:'🧱 Monde de Blocs : explore, construis, survis !'},JOY,CAMSW,
    {g:'tap',at:{x:0.5,y:0.55},t:'Touche un bloc pour le casser, ou pour en poser un.'},{g:'point',at:'#mcHot',t:'Choisis ici le bloc ou l\'objet à utiliser.'},
    {g:'tap',at:'#mcInvB',t:'🎒 Ton inventaire.'},{g:'tap',at:'#mcShop',t:'🛒 La boutique : véhicules, fusée, drone…'},{g:'tap',at:'#bAct',t:'⚔️ Attaque les monstres.'},JUMP,{g:'none',t:'🎉 Amuse-toi bien !'}],
  pirates:[{g:'none',t:'🏴‍☠️ Océan des Fruits : trouve les 3 clés 🗝️ et bats le capitaine !'},JOY,CAMSW,
    {g:'tap',at:'#bAct',t:'⚔️ Attaque avec ton épée.'},{g:'tap',at:'#bFruit',t:'🍎 Mange un fruit magique pour avoir un pouvoir…'},{g:'tap',at:'#bPow',t:'✨ … et utilise-le ici !'},
    {g:'tap',at:'#bForm',t:'🌀 Transforme-toi.'},{g:'tap',at:'#bBoat',t:'🚤 Prends le bateau pour aller d\'île en île.'},JUMP,{g:'none',t:'🎉 À l\'abordage !'}],
  obby:[{g:'none',t:'🏃 Parcours : va jusqu\'au drapeau sans tomber !'},JOY,{g:'tap',at:'#bJump',t:'Appuie pour sauter. Garde le doigt appuyé pour sauter plus haut.'},CAMSW,
    {g:'none',t:'🚩 Les drapeaux gardent ta place si tu tombes. Ramasse les ⭐ !'}],
  arena:[{g:'none',t:'⚔️ Arène : survis aux vagues de slimes !'},JOY,{g:'tap',at:'#bAct',t:'Appuie pour frapper les slimes.'},CAMSW,JUMP,{g:'none',t:'Entre deux vagues, choisis un bonus ✨. Courage !'}],
  island:[{g:'none',t:'🏝️ Île au Trésor : 10 gemmes et 3 trésors avant la nuit !'},JOY,{g:'point',at:'#compass',t:'La flèche montre la gemme la plus proche.'},
    {g:'tap',at:'#bAct',t:'⛏️ Creuse quand tu es sur un trésor enfoui.'},JUMP,CAMSW,{g:'none',t:'🎉 Bonne chasse au trésor !'}],
  race:[{g:'none',t:'🏎️ Turbo Bolides : fais 3 tours et finis premier !'},{g:'drag',at:'#joy',dir:'lr',t:'La voiture avance toute seule. Glisse à gauche ou à droite pour tourner, vers le bas pour freiner.'},
    {g:'tap',at:'#gx [data-k="nitro"]',t:'🔥 Le turbo, pour aller encore plus vite !'},{g:'hold',at:'#gx [data-k="drift"]',t:'🌀 Garde appuyé pour déraper dans les virages.'},
    {g:'point',at:'#rcMap',t:'La carte montre ta place sur la piste.'},{g:'none',t:'🚦 Prêt ? Partez !'}],
  plat:[{g:'none',t:'🍄 Royaume Saute-Nuage : va jusqu\'au drapeau !'},{g:'drag',at:'#joy',dir:'lr',t:'Glisse à gauche ou à droite pour avancer.'},
    {g:'tap',at:'#bJump',t:'Saute ! Retombe sur les ennemis pour les écraser.'},{g:'none',t:'🪙 Ramasse les pièces et les 3 étoiles cachées ⭐.'}],
  jungle:[{g:'none',t:'🌴 Course de la Jungle : cours jusqu\'au bout du niveau !'},JOY,{g:'tap',at:'#bAct',t:'🌀 Fais la toupie pour casser les caisses et les ennemis.'},
    {g:'tap',at:'#bJump',t:'Saute par-dessus les trous et les troncs.'},{g:'none',t:'📦 Casse toutes les caisses pour gagner la gemme !'}],
  temple:[{g:'none',t:'🗿 Temple d\'Émeraude : trouve l\'idole cachée !'},JOY,JUMP,{g:'tap',at:'#bAct',t:'🎯 Tire sur les cibles pour ouvrir les portes.'},
    {g:'none',t:'Pousse les blocs sur les dalles, abaisse les leviers. Attention aux pièges !'},{g:'none',t:'🎉 Bonne exploration !'}],
  beast:[{g:'none',t:'🐾 Bestioles Magiques : attrape-les toutes !'},JOY,CAMSW,
    {g:'none',t:'Touche une bestiole sauvage pour commencer un combat.'},{g:'none',t:'En combat : choisis une attaque, puis lance un bocal 🫙 pour l\'attraper !'},
    {g:'tap',at:'#gx [data-k="team"]',t:'🐾 Ton équipe.'},{g:'tap',at:'#gx [data-k="dex"]',t:'📖 Ton album.'},{g:'none',t:'⛲ La fontaine du village soigne tes bestioles. Bonne aventure !'}]
};
const TU={on:false,i:0,t:0,gid:'',steps:null,el:null,knob:''};
function tutoStart(gid){
  const st=TUTO[gid]; if(!st||!G||TU.on) return;
  const o=el('div','ia'); o.id='tuto';
  o.innerHTML='<div class="tuRing"></div><div class="tuRip"></div><div class="tuHand">👆</div><div class="tuCap"><b></b></div><div class="tuBar"><div class="tuDots"></div><button class="tuSkip">Passer ⏭</button></div>';
  $('hud').appendChild(o);
  const dots=o.querySelector('.tuDots'); st.forEach(()=>dots.appendChild(el('i')));
  o.querySelector('.tuSkip').addEventListener('click',e=>{ e.stopPropagation(); sfx('click'); tutoEnd(true); });
  o.addEventListener('click',()=>{ if(TU.t>0.5) tutoNext(); });
  Object.assign(TU,{on:true,i:-1,t:0,gid,steps:st,el:o}); PAUSE++; $('hud').classList.add('tutoOn');
  tutoNext();
}
function tutoNext(){
  TU.i++; TU.t=0; const o=TU.el; if(!o) return;
  if(TU.i>=TU.steps.length){ tutoEnd(true); return; }
  const s=TU.steps[TU.i], last=TU.i===TU.steps.length-1;
  o.querySelector('.tuCap b').textContent=s.t; o.querySelector('.tuSkip').textContent=last?'C\'est parti ! ▶️':'Passer ⏭';
  o.querySelectorAll('.tuDots i').forEach((d,i)=>d.classList.toggle('on',i<=TU.i));
  const cap=o.querySelector('.tuCap'); cap.classList.remove('pop'); void cap.offsetWidth; cap.classList.add('pop');
  sfx('click'); tutoKnob(0,0);
}
function tutoEnd(seen){
  if(!TU.on) return; TU.on=false; tutoKnob(0,0,true);
  if(TU.el){ TU.el.remove(); TU.el=null; } $('hud').classList.remove('tutoOn'); PAUSE=Math.max(0,PAUSE-1);
  if(seen&&TU.gid){ S.tuto[TU.gid]=1; save(); }
}
function tutoKnob(x,y,reset){ const k=$('joyKnob'); if(!k) return; k.style.transform=reset||(!x&&!y)?'':'translate(calc(-50% + '+x.toFixed(1)+'px),calc(-50% + '+y.toFixed(1)+'px))'; }
function tutoTarget(at){
  const o=TU.el, or=o.getBoundingClientRect();
  if(at&&typeof at==='object') return {x:or.width*at.x,y:or.height*at.y,w:0,h:0,round:true};
  const e=at?document.querySelector(at):null; if(!e) return null;
  const r=e.getBoundingClientRect(), cs=getComputedStyle(e); if(r.width<4||r.height<4||cs.display==='none'||cs.visibility==='hidden') return null;
  return {x:r.left-or.left+r.width/2,y:r.top-or.top+r.height/2,w:r.width,h:r.height,round:parseFloat(cs.borderRadius)>=r.width*0.4};
}
function tutoTick(dt){
  if(!TU.on){
    const g=G; if(!g||mode!=='game'||g.over||PAUSE||!S.tuto||S.tuto[g.id]||!TUTO[g.id]||typeof document.querySelector!=='function') return;
    if(g.time<3.1||g.choiceOpen||document.querySelector('#choice.on')) return;
    if(g.tutoReady&&!g.tutoReady()) return;
    tutoStart(g.id); return;
  }
  const o=TU.el; if(!o) return; const s=TU.steps[TU.i]; if(!s) return;
  TU.t+=dt; const d=s.d||(s.g==='none'?3:3.6); if(TU.t>d){ tutoNext(); return; }
  const hand=o.querySelector('.tuHand'), ring=o.querySelector('.tuRing'), rip=o.querySelector('.tuRip'), cap=o.querySelector('.tuCap');
  const or=o.getBoundingClientRect(), W=or.width, H=or.height; let tg=null, hx=0, hy=0, press=false, show=true;
  if(s.g==='swipe'){ const ph=(TU.t*0.9)%2, u=ph<1?ph:2-ph; hx=W*(0.56+0.3*u); hy=H*0.46; press=true; }
  else if(s.g!=='none'){ tg=tutoTarget(s.at); if(!tg) show=false; }
  if(tg){
    if(s.g==='drag'){ const r=Math.max(18,tg.w*0.3), a=TU.t*2.4; let ox, oy;
      if(s.dir==='lr'){ ox=Math.sin(a)*r; oy=0; } else { ox=Math.sin(a)*r; oy=-Math.abs(Math.cos(a*0.5))*r; }
      hx=tg.x+ox; hy=tg.y+oy; press=true; tutoKnob(ox,oy); }
    else if(s.g==='point'){ hx=tg.x; hy=tg.y+tg.h/2+10+Math.sin(TU.t*5)*6; }
    else { hx=tg.x; hy=tg.y; const c=(TU.t%1); press=s.g==='hold'||(c>0.35&&c<0.6); }
    ring.style.display='block'; const pw=Math.max(54,tg.w+18), ph2=Math.max(54,tg.h+18);
    ring.style.width=pw+'px'; ring.style.height=ph2+'px'; ring.style.left=(tg.x-pw/2)+'px'; ring.style.top=(tg.y-ph2/2)+'px'; ring.style.borderRadius=tg.round?'50%':'20px';
  } else ring.style.display='none';
  hand.style.display=show&&s.g!=='none'?'block':'none';
  hand.style.left=(hx-20)+'px'; hand.style.top=(hy-4)+'px'; hand.classList.toggle('press',press);
  rip.style.display=show&&s.g!=='none'&&s.g!=='point'?'block':'none'; rip.style.left=(hx-30)+'px'; rip.style.top=(hy-30)+'px';
  /* phrase : en haut si la cible est en bas, sinon plus bas */
  const low=tg?tg.y>H*0.5:(s.g==='swipe'?false:true); cap.classList.toggle('top',low); cap.classList.toggle('mid',!low);
}
