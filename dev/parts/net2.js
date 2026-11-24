/* =========================================================
   25. Jeu en ligne dans tous les jeux
   L'hôte crée une partie depuis l'accueil puis choisit n'importe
   quel jeu : les invités le suivent automatiquement. Le monde est
   le même chez tout le monde (graine commune : Math.random est
   remplacé par un générateur à graine pendant start() et les
   constructions), chacun voit l'avatar ou le héros des copains,
   un petit tableau des scores, les messages rapides et les fins
   de partie. Un nouveau jeu en profite sans rien faire ; il peut
   ajouter : netScore() (texte court), netState()/netDraw(p,dt)
   (affichage propre, ex. voitures), netMsg(de,m) + netMsg(m,à)
   (messages de jeu), netPause()/netHide() (scène à part),
   netWelcome(conn) (état initial envoyé par l'hôte), et utiliser
   netShare/netGet/netWait pour les choix faits par l'hôte.
   ========================================================= */
function netOn(){ return NET.role==='host'||NET.role==='guest'; }
function netLive(){ return netOn()&&!!G&&!!G.netR&&!!NET.game&&NET.game.r===G.netR; }
function netIsGuest(){ return NET.role==='guest'&&netLive(); }
function netHostName(){ if(NET.role==='host') return S.name; const h=NET.players.get('h'); return h?h.name:'ton copain'; }
function netWhat(){ const gl=NET.game?GAME_LIST.find(x=>x.id===NET.game.g):null; return gl?gl.ic+' '+gl.t:'à l\'accueil'; }
function netCleanO(o){ const r={}; if(!o||typeof o!=='object') return r; let n=0;
  for(const k of Object.keys(o)){ if(n>=16||!/^[a-zA-Z]{1,10}$/.test(k)) continue; const v=o[k];
    if(typeof v==='number'&&isFinite(v)) r[k]=v; else if(typeof v==='string'&&v.length<=20) r[k]=v; else if(typeof v==='boolean') r[k]=v; else continue; n++; }
  return r; }
/* hasard commun : même graine + même étape = même monde chez tout le monde */
function netSeeded(fn,salt){ const g=G; if(!g||!g.netR||!g.netSeed) return fn();
  let h=(g.netSeed^0x5bd1e995)>>>0; const t=String(salt); for(let i=0;i<t.length;i++) h=Math.imul(h^t.charCodeAt(i),16777619)>>>0;
  const old=Math.random; Math.random=mulberry32(h); try{ return fn(); } finally{ Math.random=old; } }
/* choix faits par l'hôte (monde, niveau, mode…) */
function netShare(k,v){ if(NET.role!=='host'||!netLive()) return; NET.game.o[k]=v; const o={}; o[k]=v; netBroadcast({t:'opt',r:NET.game.r,o},null); }
function netGet(k,d){ return netIsGuest()&&NET.game.o[k]!==undefined?NET.game.o[k]:d; }
function netWait(k,fn,txt){ if(!netIsGuest()) return false; const v=NET.game.o[k];
  if(v!==undefined){ closeChoice(); fn(v); return true; }
  NET.wait[k]=fn;
  openChoice({title:'⏳ '+(txt||'En attente…'),sub:netHostName()+' choisit pour tout le monde. Ça arrive !',close:false,items:[]});
  return true; }
function netWaitFire(o){ for(const k of Object.keys(o)){ const fn=NET.wait[k]; if(fn&&G&&G.netR){ delete NET.wait[k]; closeChoice(); try{ fn(o[k]); }catch(e){ console.warn(e); } } } }
/* messages propres à un jeu (to = id d'un joueur, sinon tout le monde) */
function netMsg(m,to){ if(!netLive()) return; const d={t:'x',r:G.netR,m}; if(to) d.to=to;
  if(NET.role==='host'){ d.id='h'; if(!to) netBroadcast(d,null); else { const c=NET.conns.get(to); if(c){ try{ c.send(d); }catch(e){} } } }
  else netSend(d); }
function netPeers(){ const out=[], g=G, now=performance.now(); if(!netLive()) return out;
  NET.players.forEach((p,id)=>{ if(p.k===g.netR&&p.s&&now-p.st<2500) out.push(p); }); return out; }
function netEvent(m){ if(!netOn()) return; netSend({t:'ev',m:netCleanTxt(m,90)}); }
/* suivre l'hôte */
function netFollow(){ const gm=NET.game; if(!gm||!GAMES[gm.g]) return; netClosePanel(); $('result').classList.remove('on');
  NET.starting=true; try{ startGame(gm.g); } finally{ NET.starting=false; } }
function netSync(){ if(NET.role!=='guest') return; if(!NET.game){ toast('⏳ '+netHostName()+' n\'a pas encore choisi de jeu'); return; } netSend({t:'sync'}); toast('⏳ On te ramène dans la partie…'); }
function netSuggest(id){ const gl=GAME_LIST.find(x=>x.id===id);
  if(NET.game&&NET.game.g===id){ netSync(); return; }
  netSend({t:'sug',g:id}); toast('💡 Proposé à '+netHostName()+' : '+(gl?gl.t:id)); }
function netAdopt(){ if(!G) return; NET.game={g:G.id,seed:G.netSeed||0,r:++NET.round,o:{}}; NET.wait={}; G.netR=NET.game.r; $('hud').classList.add('net'); }
/* lancement / sortie (appelés par startGame / exitGame) */
function netPreStart(id){
  const g=G; g.netR=0; g.netSeed=0;
  if(NET.role==='host'){ NET.game={g:id,seed:1+((Math.random()*2147480000)|0),r:++NET.round,o:{}}; NET.wait={}; }
  else if(NET.role==='guest'){ if(!NET.game||NET.game.g!==id){ $('hud').classList.add('net'); return; } NET.wait={}; }
  else { $('hud').classList.remove('net'); return; }
  g.netR=NET.game.r; g.netSeed=NET.game.seed; NET.sT=0; NET.scT=0.5; NET.scV=''; NET.bT=0; NET.lx=P.x; NET.lz=P.z; NET.lt=0;
  $('hud').classList.add('net');
}
function netPostStart(){
  const g=G; if(!g||NET.role!=='host'||!g.netR) return;
  NET.conns.forEach(c=>{ try{ netSendGo(c); }catch(e){} });
  const h=GAME_LIST.find(x=>x.id===g.id); if(NET.conns.size) netFeed('🎮 Tes copains arrivent dans '+(h?h.t:'le jeu'));
}
function netWelcomeTo(c){ const g=G; if(g&&g.netR&&NET.game&&g.netR===NET.game.r&&g.netWelcome){ try{ g.netWelcome(c); }catch(e){ console.warn(e); } } }
function netPreExit(){
  NET.players.forEach(p=>netFreeP(p));
  const g=G; if(!g||!g.netR) return;
  if(NET.role==='host'&&!NET.sw&&NET.game&&NET.game.r===g.netR){ NET.game=null; NET.wait={}; netBroadcast({t:'home'},null); }
  NET.wait={}; const b=$('netBoard'); if(b){ b.classList.remove('on'); b.innerHTML=''; b._h=''; }
}
/* état envoyé 10 fois par seconde : position, direction, vitesse, drapeaux, héros, taille */
function netDefState(g){
  const sp=Math.min(30,Math.hypot(P.x-NET.lx,P.z-NET.lz)/Math.max(0.05,NET.lt)); NET.lx=P.x; NET.lz=P.z; NET.lt=0;
  const hid=!PA||!PA.root.visible||!!(g.netHide&&g.netHide()), hi=g.hero?HEROES.indexOf(g.hero)+1:0;
  return [netR2(P.x),netR2(P.y),netR2(P.z),netR2(P.yaw),netR2(sp),(P.fly?1:0)|(P.onGround?2:0)|(PA&&PA.sit?4:0)|(PA&&PA.swing>0?8:0)|(hid?16:0),hi,netR2(PA?PA.root.scale.x:1)];
}
function netDrawDefault(g,p,dt){
  const s=p.s, hi=typeof s[6]==='number'?s[6]|0:0, h=hi>0&&hi<=HEROES.length?HEROES[hi-1]:null, look=h?h.id:'av';
  if(p.A&&p.look!==look){ if(p.A.root.parent) p.A.root.parent.remove(p.A.root); disposeAvatar(p.A); p.A=null; }
  if(!p.A){ p.look=look; p.A=makeAvatar(h?h.av:p.av,p.name,{hand:g.id==='royale'}); g.scene.add(p.A.root); p.x=s[0]; p.y=s[1]; p.z=s[2]; p.yaw=s[3]; }
  const k=Math.min(1,dt*12);
  if(Math.hypot(p.x-s[0],p.y-s[1],p.z-s[2])>12){ p.x=s[0]; p.y=s[1]; p.z=s[2]; }
  p.x=lerp(p.x,s[0],k); p.y=lerp(p.y,s[1],k); p.z=lerp(p.z,s[2],k); p.yaw=angLerp(p.yaw,s[3],k);
  const A=p.A, sc=typeof s[7]==='number'&&s[7]>0.2&&s[7]<4?s[7]:1;
  A.root.position.set(p.x,p.y,p.z); A.root.rotation.y=p.yaw; A.root.scale.setScalar(sc); A.sit=!!(s[5]&4); if((s[5]&8)&&!(A.swing>0)) A.swing=0.28;
  animAvatar(A,dt,s[4],!!(s[5]&3));
}
function netScoreOf(g){ try{ const v=g.netScore?g.netScore():(g.earned?'🪙 '+g.earned:''); return netCleanTxt(v||'',30); }catch(e){ return ''; } }
function netBoard(g){
  const b=$('netBoard'); if(!b) return; const rows=netPeers().map(p=>[p.name,p.sc,0]);
  if(!rows.length){ if(b._h){ b._h=''; b.innerHTML=''; b.classList.remove('on'); } return; }
  rows.unshift([S.name,netScoreOf(g),1]); const key=JSON.stringify(rows); if(b._h===key) return; b._h=key; b.innerHTML='';
  for(const [n,v,me] of rows){ const d=el('div',me?'me':''); d.textContent=(me?'⭐ ':'👤 ')+n+(v?' · '+v:''); b.appendChild(d); }
  b.classList.add('on');
}

/* ---------- réglages propres à chaque jeu ---------- */
{ const O=GAMES.obby, st=O.start, pw=O.pickWorld;
  O.start=function(){ const w=netGet('w',null);
    if(w!==null&&OBW[w|0]){ const old=S.ob.w; S.ob.w=w|0; OB_PICKED=true; try{ st.call(this); } finally{ S.ob.w=old; } }
    else st.call(this);
    netShare('w',this.w); };
  O.pickWorld=function(){ if(netIsGuest()){ toast('🗺️ C\'est '+netHostName()+' qui choisit le monde'); return; } return pw.apply(this,arguments); };
  O.netScore=function(){ return '🚩 '+this.cp+'/2 · ⭐ '+this.got; }; }
{ const L=GAMES.plat, pw=L.pickWorld, bd=L.build;
  L.pickWorld=function(){ if(netWait('wi',v=>this.build(clamp(v|0,0,PWORLDS.length-1)),'Le monde va être choisi…')) return; return pw.apply(this,arguments); };
  L.build=function(wi){ netShare('wi',wi); return netSeeded(()=>bd.call(this,wi),'wi'); };
  L.netScore=function(){ return this.ready?'⭐ '+this.nStars()+'/3 · 🪙 '+this.coinsGot:''; }; }
{ const J=GAMES.jungle, pl=J.pickLevel, bd=J.build;
  J.pickLevel=function(){ if(netWait('li',v=>this.build(clamp(v|0,0,JLV.length-1)),'Le niveau va être choisi…')) return; return pl.apply(this,arguments); };
  J.build=function(li){ netShare('li',li); return netSeeded(()=>bd.call(this,li),'li'); };
  J.netScore=function(){ return this.ready?'📦 '+this.crGot+'/'+this.crTot:''; }; }
{ const T=GAMES.temple, bd=T.build;
  T.build=function(){ return netSeeded(()=>bd.apply(this,arguments),'b'); };
  T.netScore=function(){ return this.ready?'🏺 '+this.got+'/5':''; }; }
{ const B=GAMES.beast, bd=B.build;
  B.build=function(){ return netSeeded(()=>bd.apply(this,arguments),'b'); };
  B.netScore=function(){ return '📖 '+S.beast.caught.length+'/'+BS_IDS.length; };
  B.netPause=function(){ return !!this.inB; }; B.netHide=function(){ return !!this.inB; }; }
{ const R=GAMES.royale, st=R.start, sm=R.setMode;
  R.start=function(){ const r=st.apply(this,arguments); if(netIsGuest()){ closeChoice(); netWait('mode',k=>this.setMode(RB_MODES[k]?k:'classic'),'Le mode de jeu va être choisi…'); } return r; };
  R.setMode=function(k){ if(!this.modeChosen) netShare('mode',RB_MODES[k]?k:'classic'); return sm.apply(this,arguments); };
  R.netScore=function(){ return '🎯 '+this.kills+(this.pEnt&&this.pEnt.alive?'':' · 💀'); }; }
GAMES.arena.netScore=function(){ return 'Vague '+Math.max(1,this.wave); };
GAMES.island.netScore=function(){ return '💎 '+this.found+'/'+this.total; };
GAMES.pirates.netScore=function(){ return '🗝️ '+this.keys+'/3'; };
GAMES.eggs.netScore=function(){ return this.home?'🥚 '+this.home.slots.filter(s=>s.item).length:''; };
GAMES.brainrot.netScore=function(){ return '💵 '+fmtCash(S.br.cash); };
/* Turbo Bolides : voitures des copains, départ commun, classement avec les vrais joueurs */
{ const R=GAMES.race, ch=R.chosen, up=R.update, pl=R.place, hd=R.hud;
  R.chosen=function(h){ const r=ch.apply(this,arguments);
    if(netLive()&&NET.players.size){ this.phase='wait'; this.waitT=0; banner('⏳ On attend tout le monde…'); netMsg({rdy:1}); }
    return r; };
  R.netGo=function(){ if(this.phase!=='wait') return; this.phase='count'; this.cnt=3.6; this.lastC=4; banner('Prêt ?'); };
  R.netMsg=function(from,m){ if(m&&m.rdy) (this.rdy=this.rdy||new Set()).add(from); };
  R.update=function(dt){
    if(this.phase==='wait'){ this.waitT=(this.waitT||0)+dt; this.placeAIs(dt);
      if(NET.role==='host'||!netLive()){ const ps=netPeers(), all=ps.every(p=>this.rdy&&this.rdy.has(p.id));
        if(!netLive()||all||this.waitT>25){ netShare('go',1); this.netGo(); } }
      else if(NET.game&&NET.game.o.go!==undefined) this.netGo();
      return; }
    return up.apply(this,arguments); };
  R.place=function(){ let r=pl.call(this); if(this.done) return r; const p=this.prog();
    for(const q of netPeers()){ const s=q.s; if(s.length>=14&&(s[13]>0||s[12]>p)) r++; } return r; };
  R.hud=function(){ const r=hd.apply(this,arguments); if(netLive()&&this.phase!=='pick'&&this.phase!=='wait') setText('rcPos',this.place()+'/'+(6+netPeers().length)); return r; };
  R.netState=function(){ const c=this.car, s=netDefState(this); s.push(netR2(c.x),netR2(c.y),netR2(c.z),netR2(c.h),this.prog(),this.done?this.fplace:0); return s; };
  R.netDraw=function(p,dt){ const s=p.s, hi=typeof s[6]==='number'?s[6]|0:0, h=hi>0?HEROES[hi-1]:null;
    const vk=h&&h.car&&s.length>=14?'rc'+h.id:'';
    if(p.vk!==vk){ if(p.veh){ if(p.veh.g.parent) p.veh.g.parent.remove(p.veh.g); p.veh=null; } p.vk=vk; if(vk){ p.veh=rcCarMesh(h.car.c,h.car.s); this.scene.add(p.veh.g); p.cx=s[8]; p.cy=s[9]; p.cz=s[10]; p.ch=s[11]; } }
    netDrawDefault(this,p,dt); if(p.A){ p.A.root.rotation.order='YXZ'; }
    if(p.veh){ const k=Math.min(1,dt*12); if(Math.hypot(p.cx-s[8],p.cz-s[10])>12){ p.cx=s[8]; p.cy=s[9]; p.cz=s[10]; }
      p.cx=lerp(p.cx,s[8],k); p.cy=lerp(p.cy,s[9],k); p.cz=lerp(p.cz,s[10],k); p.ch=angLerp(p.ch,s[11],k);
      p.veh.g.position.set(p.cx,p.cy,p.cz); p.veh.g.rotation.set(0,p.ch,0); } };
  R.netScore=function(){ const c=this.car; return this.done?'🏁 '+this.fplace+(this.fplace===1?'er':'e'):this.phase==='race'?'Tour '+clamp(c.lap,1,RC_LAPS)+'/'+RC_LAPS:'🚦 départ'; }; }
/* Bâtisseur : on construit ensemble dans le monde de l'hôte */
{ const B=GAMES.build, st=B.start, ab=B.addBlock, rb=B.removeBlock, pe=B.persist, ca=B.clearAll, ev=B.pickEnv;
  B.start=function(){
    if(netIsGuest()){ const ob=S.build, oe=S.buildEnv; S.build=[]; S.buildEnv=clamp(netGet('env',oe)|0,0,BENV.length-1); this.netGuest=true;
      try{ return st.apply(this,arguments); } finally{ S.build=ob; S.buildEnv=oe; } }
    const r=st.apply(this,arguments); netShare('env',S.buildEnv|0); return r; };
  B.addBlock=function(x,y,z,ci,silent){ const ok=ab.apply(this,arguments); if(ok&&!this.netIn&&netLive()) (this.netOut=this.netOut||[]).push('a',x,y,z,ci); return ok; };
  B.removeBlock=function(k){ const e=this.blocks.get(k); rb.apply(this,arguments); if(e&&!this.blocks.has(k)&&!this.netIn&&netLive()) (this.netOut=this.netOut||[]).push('d',e.x,e.y,e.z,0); };
  B.persist=function(){ if(this.netGuest) return; return pe.apply(this,arguments); };
  B.clearAll=function(){ if(netIsGuest()){ toast('🧹 Seul '+netHostName()+' peut tout effacer'); return; } const r=ca.apply(this,arguments); if(netLive()) netMsg({clr:1}); return r; };
  if(ev) B.pickEnv=function(){ if(netIsGuest()){ toast('🎨 C\'est '+netHostName()+' qui choisit l\'ambiance'); return; } return ev.apply(this,arguments); };
  B.netTick=function(){ const o=this.netOut; if(o&&o.length){ netMsg({b:o.splice(0,2500)}); } };
  B.netWelcome=function(c){ const all=[]; for(const e of this.blocks.values()) all.push('a',e.x,e.y,e.z,e.ci);
    for(let i=0;i<all.length;i+=2500) c.send({t:'x',id:'h',r:this.netR,m:{b:all.slice(i,i+2500)}}); };
  B.netMsg=function(from,m){
    if(m.clr){ this.netIn=true; try{ for(const e of this.blocks.values()) this.scene.remove(e.m); this.blocks.clear(); this.meshes=[]; this.pops=[]; if(!this.netGuest) this.persist(); } finally{ this.netIn=false; } return; }
    const b=m.b; if(!Array.isArray(b)) return; this.netIn=true;
    try{ for(let i=0;i+4<b.length;i+=5){ const t=b[i], x=b[i+1], y=b[i+2], z=b[i+3], ci=b[i+4];
        if(![x,y,z,ci].every(Number.isInteger)||x<-this.L||x>=this.L||z<-this.L||z>=this.L||y<0||y>60) continue;
        if(t==='a'&&ci>=0&&ci<PAL.length) this.addBlock(x,y,z,ci,false); else if(t==='d') this.removeBlock(bkey(x,y,z)); }
      this.saveT=0.8; } finally{ this.netIn=false; } };
  B.netScore=function(){ return '🧱 '+this.blocks.size; }; }
/* Bataille Royale : on se tire dessus entre vrais joueurs.
   Le tireur décide s'il touche (sur la position qu'il voit) et prévient sa cible ;
   les tirs des copains sont rejoués pour le décor seulement (fx : sans dégâts). */
{ const R=GAMES.royale, up=R.update, im=R.impact, el2=R.eliminate, ap=R.aimPoint;
  R.netState=function(){ const s=netDefState(this); s.push(this.pEnt&&this.pEnt.alive?1:0); return s; };
  R.netHide=function(){ return !(this.pEnt&&this.pEnt.alive); };
  R.netFoes=function(){ const d=this.netDead||new Set(); return netPeers().filter(q=>q.s.length>=9&&q.s[8]===1&&!d.has(q.id)); };
  R.netGhost=function(id){ const q=NET.players.get(id); this.netG=this.netG||{}; let g=this.netG[id];
    if(!g) g=this.netG[id]={net:true,id,team:-1,isPlayer:false,alive:true,name:'Copain',col:'#ffffff',x:0,y:0,z:0};
    if(q){ g.name=q.name; g.x=q.x||0; g.y=q.y||0; g.z=q.z||0; } return g; };
  R.netHitTest=function(x,y,z){ for(const q of this.netFoes()) if(Math.abs(x-q.x)<0.45&&Math.abs(z-q.z)<0.45&&y>q.y&&y<q.y+1.9) return q; return null; };
  R.netHit=function(q,dmg){ dmg=Math.round(dmg*10)/10; if(!(dmg>0)) return; netMsg({hit:dmg},q.id); this.dealt+=dmg;
    const c=$('crosshair'); if(c){ c.classList.add('hit'); clearTimeout(this._hm); this._hm=setTimeout(()=>c.classList.remove('hit'),120); } sfx('hit');
    if(this.dmgNum) this.dmgNum({x:q.x,y:q.y,z:q.z,alive:true},dmg,false); };
  R.netShots=function(from,a){ const own=this.netGhost(from);
    for(let i=0;i+11<a.length&&i<12*16;i+=12){ const x=a[i],y=a[i+1],z=a[i+2],vx=a[i+3],vy=a[i+4],vz=a[i+5],life=a[i+6];
      if(![x,y,z,vx,vy,vz,life].every(Number.isFinite)) continue;
      const col=typeof a[i+11]==='string'&&/^#[0-9a-f]{6}$/i.test(a[i+11])?a[i+11]:'#ffffff';
      let m=this.pPool.pop(); if(!m){ m=new THREE.Mesh(sph(0.13),lam('#ffffff')); m.castShadow=false; this.scene.add(m); }
      m.material=lam(col); m.scale.setScalar(clamp(+a[i+10]||1,0.5,3)); m.visible=true; m.position.set(x,y,z);
      this.proj.push({x,y,z,vx,vy,vz,owner:own,dmg:0,life:clamp(life,0,6),splash:+a[i+7]||0,grav:+a[i+8]||0,bomb:a[i+9]?1:0,m,col,fx:true}); } };
  R.netWin=function(){ if(this.over||!this.pEnt.alive||!this.modeChosen) return; if(this.bots.every(b=>!b.alive||b.team===0)&&!this.netFoes().length) this.end(true); };
  R.netMsg=function(from,m){
    if(Array.isArray(m.sh)) this.netShots(from,m.sh);
    if(typeof m.hit==='number'&&isFinite(m.hit)&&this.pEnt.alive&&!this.over) this.dmgEnt(this.pEnt,clamp(m.hit,0,150)*0.6,this.netGhost(from));
    if(m.ko){ const q=NET.players.get(from), n=q?q.name:'Copain'; this.kills++; banner('🎯 Tu as éliminé '+n+' !'); sfx('cp'); this.feed(S.name+' a éliminé 👤 '+n); (this.netDead=this.netDead||new Set()).add(from); this.netWin(); }
    if(m.dead){ (this.netDead=this.netDead||new Set()).add(from); this.netWin(); } };
  R.netSendShots=function(){ const out=[]; for(const p of this.proj) if(p.owner===this.pEnt&&!p.ns){ p.ns=1;
      out.push(netR2(p.x),netR2(p.y),netR2(p.z),netR2(p.vx),netR2(p.vy),netR2(p.vz),netR2(p.life),p.splash||0,p.grav||0,p.bomb?1:0,netR2(p.m?p.m.scale.x:1),p.col||'#ffffff'); }
    if(out.length) netMsg({sh:out}); };
  R.update=function(dt){ const live=netLive(); if(live) this.netSendShots();
    const r=up.apply(this,arguments);
    if(live){ this.netSendShots(); this.nwT=(this.nwT||0)-dt; if(this.nwT<=0){ this.nwT=1; this.netWin(); } }
    return r; };
  R.impact=function(p,hit){
    if(p.fx){ if(p.splash){ sfx('boom'); confetti(this.scene,p.x,p.y+0.3,p.z); } else if(hit.t==='s'||hit.t==='g') this.splat(p.x,p.y,p.z,p.col); return; }
    if(hit.t==='n'){ this.netHit(hit.q,p.dmg); this.splat(p.x,p.y,p.z,p.col); return; }
    if(p.splash&&p.owner===this.pEnt&&netLive()) for(const q of this.netFoes()){ const d=Math.hypot(q.x-p.x,q.y+0.9-p.y,q.z-p.z); if(d<p.splash) this.netHit(q,p.dmg*(1-d/p.splash*0.5)); }
    return im.apply(this,arguments); };
  R.eliminate=function(e,by){ const live=e.isPlayer&&netLive(); if(live&&by&&by.net) this.netNoEv=true;
    const r=el2.apply(this,arguments);
    if(live){ if(by&&by.net){ netMsg({ko:1},by.id); netEvent('🎯 '+by.name+' a éliminé '+S.name); } netMsg({dead:1}); }
    return r; };
  R.aimPoint=function(range){ const t=ap.apply(this,arguments); if(t.e||!netLive()) return t;
    const tol=IS_TOUCH?0.2:0.08; let best=null, ba=tol;
    for(const q of this.netFoes()){ const dx=q.x-cam.px, dy=q.y+1.1-cam.py, dz=q.z-cam.pz, l=Math.hypot(dx,dy,dz); if(l>range+cam.d) continue;
      const a=Math.acos(clamp((dx*cam.fx+dy*cam.fy+dz*cam.fz)/l,-1,1)); if(a<ba&&this.los(this.pEnt,{x:q.x,y:q.y,z:q.z})){ ba=a; best=q; } }
    return best?{x:best.x,y:best.y+1.1,z:best.z}:t; }; }
