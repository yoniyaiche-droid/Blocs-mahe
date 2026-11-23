/* =========================================================
   10. Jeu à distance avec des copains (Monde de Blocs)
   Connexion directe entre téléphones (WebRTC via PeerJS).
   L'hôte garde le monde ; les invités reçoivent la graine
   et les blocs modifiés, puis chaque bloc posé ou cassé
   est envoyé aux autres.
   ========================================================= */
const NET_VER=1, NET_PREFIX='blocsmahe-v1-', NET_MAX=6, NET_ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const NET_LIBS=['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js','https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
const NET_CHAT=['👋 Salut !','👍 D\'accord !','🏃 Viens ici !','👀 Regarde !','⛏️ On construit ?','🧟 Attention, monstres !','😂 Trop drôle !','❤️ Merci !'];
const NET={role:null,peer:null,host:null,code:'',conns:new Map(),players:new Map(),myId:'',world:null,wbuf:null,spawn:null,applying:false,out:[],sT:0,eT:0,dT:0,nid:0,busy:false,msg:'',err:'',tok:0,jt:0,starting:false};
function netCode(){ let s=''; for(let i=0;i<5;i++) s+=NET_ABC[Math.floor(Math.random()*NET_ABC.length)]; return s; }
function netLoadLib(){
  if(window.Peer) return Promise.resolve();
  return new Promise((res,rej)=>{ let i=0; const next=()=>{ if(window.Peer) return res(); if(i>=NET_LIBS.length) return rej({type:'lib'});
    const s=document.createElement('script'); s.src=NET_LIBS[i++]; s.async=true; let done=false;
    const t=setTimeout(()=>{ if(done) return; done=true; s.remove(); next(); },15000);
    s.onload=()=>{ if(done) return; done=true; clearTimeout(t); next(); };
    s.onerror=()=>{ if(done) return; done=true; clearTimeout(t); s.remove(); next(); };
    document.head.appendChild(s); }; next(); });
}
function netOpenPeer(id){
  return new Promise((res,rej)=>{
    let done=false, p;
    try{ p=id?new Peer(id,{debug:0}):new Peer({debug:0}); }catch(e){ rej({type:'browser-incompatible'}); return; }
    const t=setTimeout(()=>{ if(done) return; done=true; try{ p.destroy(); }catch(e){} rej({type:'timeout'}); },15000);
    p.on('open',()=>{ if(done) return; done=true; clearTimeout(t); res(p); });
    p.on('error',e=>{ if(!done){ done=true; clearTimeout(t); try{ p.destroy(); }catch(_){} rej(e||{}); } else if(NET.peer===p) netPeerError(e||{}); });
    p.on('disconnected',()=>{ setTimeout(()=>{ try{ if(NET.peer===p&&!p.destroyed&&p.disconnected) p.reconnect(); }catch(e){} },1500); });
  });
}
function netErrText(e){ const t=e&&e.type;
  if(t==='peer-unavailable') return 'Aucune partie avec ce code. Vérifie les lettres, et que ton copain est bien dans sa partie avec l\'écran allumé.';
  if(t==='lib') return 'Impossible de charger le jeu en ligne. Vérifie ta connexion Internet.';
  if(t==='browser-incompatible') return 'Ce navigateur ne permet pas le jeu en ligne. Ouvre Blocs Mahé dans Chrome ou Safari.';
  if(t==='connect') return 'La connexion avec ton copain n\'a pas marché. Essayez en Wi-Fi tous les deux, puis réessayez.';
  if(t==='full') return 'La partie est pleine ('+NET_MAX+' joueurs maximum).';
  if(t==='old') return 'Vous n\'avez pas la même version du jeu : fermez et rouvrez Blocs Mahé tous les deux.';
  return 'Impossible de joindre le serveur de connexion. Vérifie ta connexion Internet et réessaie.';
}
function netCleanName(n){ return (typeof n==='string'?n:'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,14)||'Copain'; }
function netCleanAv(a){ const d=DEF.avatar, o={}; a=a&&typeof a==='object'?a:{};
  for(const k of ['skin','shirt','pants','shoes']) o[k]=typeof a[k]==='string'&&/^#[0-9a-f]{6}$/i.test(a[k])?a[k]:d[k];
  o.face=FACES.some(f=>f.id===a.face)?a.face:d.face; o.hat=HATS.some(h=>h.id===a.hat)?a.hat:'none'; return o; }
function netAddPlayer(id,name,av){ const old=NET.players.get(id); if(old) netFreeP(old); const p={id,name:netCleanName(name),av:netCleanAv(av),A:null,s:null,veh:null,vk:''}; NET.players.set(id,p); netBadge(); return p; }
function netFreeP(p){ if(p.A){ if(p.A.root.parent) p.A.root.parent.remove(p.A.root); disposeAvatar(p.A); p.A=null; } if(p.veh){ if(p.veh.g.parent) p.veh.g.parent.remove(p.veh.g); p.veh=null; } p.vk=''; }
function netRemovePlayer(id){ const p=NET.players.get(id); if(!p) return; netFreeP(p); NET.players.delete(id); netBadge(); }
function netBadge(){ const b=$('netN'); if(b) b.textContent=String(NET.players.size+1); }
function netFeed(t){ const f=$('netFeed'); if(!f) return; const d=el('div','nf'); d.textContent=t; f.appendChild(d); while(f.children.length>4) f.removeChild(f.children[0]); setTimeout(()=>{ if(d.parentNode) d.parentNode.removeChild(d); },7000); }
function netStatus(t){ NET.msg=t; netRender(); }
function netReset(){
  clearTimeout(NET.jt); NET.tok++;
  NET.players.forEach(p=>netFreeP(p)); NET.players=new Map(); NET.conns=new Map();
  Object.assign(NET,{role:null,peer:null,host:null,code:'',myId:'',world:null,wbuf:null,spawn:null,out:[],busy:false,msg:''});
  const h=$('hud'); if(h) h.classList.remove('net'); const c=$('netChat'); if(c) c.classList.remove('on'); netBadge();
}
function netLeave(quiet){
  const was=NET.role, peer=NET.peer, host=NET.host, conns=Array.from(NET.conns.values());
  if(was==='host') for(const c of conns){ try{ c.send({t:'end'}); }catch(e){} }
  netReset();
  setTimeout(()=>{ for(const c of conns){ try{ c.close(); }catch(e){} } try{ if(host) host.close(); }catch(e){} try{ if(peer) peer.destroy(); }catch(e){} },400);
  if((was==='host'||was==='guest')&&!quiet) banner('👋 Tu as quitté la partie en ligne');
  netRender(); if(typeof renderPlay==='function'&&mode!=='game') renderPlay();
}
function netFail(e){ const peer=NET.peer; netReset(); try{ if(peer) peer.destroy(); }catch(_){} NET.err=netErrText(e); netOpenPanel(); }
function netLost(msg){
  if(!NET.role) return; const guest=NET.role==='guest'; netLeave(true); banner(msg); sfx('nope');
  if(guest) setTimeout(()=>{ if(mode==='game'&&G&&G.id==='mc'&&G.netGuest) exitGame(); },2500);
}
function netPeerError(e){ if(NET.role==='joining'&&e.type==='peer-unavailable') netFail(e); }
function netBroadcast(m,except){ NET.conns.forEach((c,k)=>{ if(k!==except){ try{ c.send(m); }catch(e){} } }); }
function netSend(m){ if(NET.role==='host'){ m.id='h'; netBroadcast(m,null); } else if(NET.role==='guest'&&NET.host){ try{ NET.host.send(m); }catch(e){} } }
/* ---------- créer une partie ---------- */
async function netHost(){
  if(NET.busy||NET.role) return; const tok=++NET.tok; NET.busy=true; NET.err=''; netStatus('⏳ Création de la partie…');
  try{
    await netLoadLib(); if(tok!==NET.tok) return;
    let p=null, code='';
    for(let i=0;i<5&&!p;i++){ code=netCode(); try{ p=await netOpenPeer(NET_PREFIX+code); }catch(e){ if(!e||e.type!=='unavailable-id') throw e; } if(tok!==NET.tok){ if(p) p.destroy(); return; } }
    if(!p) throw {type:'server'};
    Object.assign(NET,{peer:p,code,role:'host',myId:'h',nid:0,busy:false,msg:''});
    p.on('connection',c=>netAccept(c));
    if(!(mode==='game'&&G&&G.id==='mc')){ netClosePanel(); startGame('mc'); }
    $('hud').classList.add('net'); netBadge(); netRender();
    banner('👥 Partie ouverte ! Code : '+code); netFeed('🟢 Donne le code '+code+' à tes copains');
  }catch(e){ if(tok===NET.tok) netFail(e); }
}
function netAccept(c){
  let id=null;
  c.on('data',d=>{ try{
    if(!d||typeof d!=='object'||NET.role!=='host') return;
    if(!id){
      if(d.t!=='hello') return;
      if(d.v!==NET_VER){ c.send({t:'old'}); setTimeout(()=>c.close(),600); return; }
      if(NET.conns.size>=NET_MAX-1||!(G&&G.id==='mc'&&G.changes)){ c.send({t:'full'}); setTimeout(()=>c.close(),600); return; }
      id='p'+(++NET.nid); const pl=netAddPlayer(id,d.name,d.av);
      netSendWorld(c,id);
      netBroadcast({t:'join',id,name:pl.name,av:pl.av},null);
      NET.conns.set(id,c); netFeed('👋 '+pl.name+' a rejoint la partie'); sfx('cp'); netRender(); return;
    }
    netHandle(id,d);
  }catch(e){ console.warn(e); } });
  c.on('close',()=>{ if(id&&NET.conns.get(id)===c){ NET.conns.delete(id); const pl=NET.players.get(id); netRemovePlayer(id); netBroadcast({t:'bye',id},null); if(pl) netFeed('🚪 '+pl.name+' est parti'); netRender(); } });
  c.on('error',()=>{});
}
function netSendWorld(c,id){
  const g=G, ch2=[]; g.changes.forEach(q=>q.m.forEach((v,i)=>ch2.push(q.cx*16+(i&15),i>>8,q.cz*16+((i>>4)&15),v)));
  const players=[{id:'h',name:S.name,av:S.avatar}]; NET.players.forEach((p,k)=>{ if(k!==id) players.push({id:k,name:p.name,av:p.av}); });
  const pos=P.y>MCH+2||P.y<-5?g.spawn:[+P.x.toFixed(2),+P.y.toFixed(2),+P.z.toFixed(2)];
  c.send({t:'welcome',id,world:{seed:g.seed,lt:Array.from(g.looted||[]).slice(0,5000),time:+(g.dayT||0).toFixed(4)},pos,players,n:ch2.length});
  for(let i=0;i<ch2.length;i+=4000) c.send({t:'ch',d:ch2.slice(i,i+4000)});
  c.send({t:'ready'});
}
/* ---------- rejoindre ---------- */
async function netJoin(raw){
  if(NET.busy||NET.role) return;
  const code=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==5){ NET.err='Le code a 5 caractères (lettres et chiffres).'; netRender(); return; }
  const tok=++NET.tok; Object.assign(NET,{busy:true,err:'',code,role:'joining'}); netStatus('⏳ Connexion à la partie '+code+'…');
  try{
    await netLoadLib(); if(tok!==NET.tok) return;
    const p=await netOpenPeer(null); if(tok!==NET.tok){ try{ p.destroy(); }catch(e){} return; }
    NET.peer=p;
    const c=p.connect(NET_PREFIX+code,{reliable:true,serialization:'json'}); NET.host=c;
    NET.jt=setTimeout(()=>{ if(NET.role==='joining'&&tok===NET.tok) netFail({type:'connect'}); },25000);
    c.on('open',()=>{ if(NET.host===c){ netStatus('⏳ Chargement du monde de ton copain…'); c.send({t:'hello',v:NET_VER,name:S.name,av:S.avatar}); } });
    c.on('data',d=>{ if(NET.host===c){ try{ netGuestMsg(d); }catch(e){ console.warn(e); } } });
    c.on('close',()=>{ if(NET.host!==c) return; if(NET.role==='joining') netFail({type:'connect'}); else netLost('📴 La partie en ligne est terminée'); });
    c.on('error',()=>{});
  }catch(e){ if(tok===NET.tok) netFail(e); }
}
function netGuestMsg(d){
  if(!d||typeof d!=='object') return; const t=d.t;
  if(t==='welcome'){ const w=d.world||{}; if(!Number.isInteger(w.seed)) return netFail({type:'old'});
    NET.myId=String(d.id);
    NET.wbuf={seed:w.seed,lt:Array.isArray(w.lt)?w.lt.filter(k=>typeof k==='string'):[],time:typeof w.time==='number'&&isFinite(w.time)?w.time:0.3,ch2:[]};
    NET.spawn=Array.isArray(d.pos)&&d.pos.length===3&&d.pos.every(Number.isFinite)?[d.pos[0]+1.2,d.pos[1]+0.3,d.pos[2]+0.6]:null;
    if(Array.isArray(d.players)) for(const p of d.players) if(p&&typeof p.id==='string'&&p.id!==NET.myId) netAddPlayer(p.id,p.name,p.av);
    return; }
  if(t==='ch'){ if(NET.wbuf&&Array.isArray(d.d)) for(const v of d.d) NET.wbuf.ch2.push(v); return; }
  if(t==='ready'){ if(!NET.wbuf) return; clearTimeout(NET.jt);
    NET.world=NET.wbuf; NET.wbuf=null; NET.role='guest'; NET.busy=false; NET.msg=''; netClosePanel();
    NET.starting=true; try{ startGame('mc'); } finally{ NET.starting=false; NET.world=null; }
    banner('👥 Tu as rejoint la partie '+NET.code+' !'); netFeed('🟢 Tu joues dans le monde de ton copain'); return; }
  if(t==='full'||t==='old') return netFail({type:t});
  if(t==='end') return netLost('📴 Ton copain a fermé la partie');
  if(t==='join'&&typeof d.id==='string'){ if(d.id===NET.myId) return; const p=netAddPlayer(d.id,d.name,d.av); netFeed('👋 '+p.name+' a rejoint la partie'); sfx('cp'); netRender(); return; }
  if(t==='bye'&&typeof d.id==='string'){ const p=NET.players.get(d.id); netRemovePlayer(d.id); if(p) netFeed('🚪 '+p.name+' est parti'); netRender(); return; }
  if(t==='d'){ if(typeof d.v==='number'&&isFinite(d.v)&&G&&G.id==='mc') G.dayT=((d.v%1)+1)%1; return; }
  if(NET.role!=='guest') return;
  netHandle(typeof d.id==='string'?d.id:null,d);
}
/* ---------- messages de jeu ---------- */
function netHandle(from,d){
  const t=d.t, host=NET.role==='host';
  if(t==='s'){ if(Array.isArray(d.s)&&d.s.length>=6&&d.s.length<=12&&d.s.slice(0,6).every(Number.isFinite)){ netState(from,d.s); if(host) netBroadcast({t:'s',id:from,s:d.s},from); } }
  else if(t==='e'){ if(Array.isArray(d.d)&&d.d.length<=16000){ netApplyEdits(d.d); if(host) netBroadcast({t:'e',d:d.d},from); } }
  else if(t==='c'){ if(Number.isInteger(d.m)&&d.m>=0&&d.m<NET_CHAT.length){ netChat(from,d.m); if(host) netBroadcast({t:'c',id:from,m:d.m},from); } }
}
function netState(id,s){ const p=NET.players.get(id); if(p) p.s=s; }
function netApplyEdits(d){
  const g=G; if(!g||g.id!=='mc'||!g.changes) return;
  NET.applying=true;
  try{ for(let i=0;i+3<d.length;i+=4){ const x=d[i], y=d[i+1], z=d[i+2], v=d[i+3];
      if(!Number.isInteger(x)||!Number.isInteger(y)||!Number.isInteger(z)||y<0||y>=MCH||!(v===0||MB[v])) continue;
      if(g.CH.has(ck(x>>4,z>>4))){ if(g.get(x,y,z)!==v) g.setB(x,y,z,v); } else g.recordChange(x,y,z,v); } }
  finally{ NET.applying=false; }
}
function netChat(id,m){ const p=NET.players.get(id); netFeed('💬 '+(p?p.name:'Copain')+' : '+NET_CHAT[m]); if(p&&p.A) p.A.swing=0.28; sfx('click'); }
function netSay(i){ if(NET.role!=='host'&&NET.role!=='guest') return; netSend({t:'c',m:i}); netFeed('💬 '+S.name+' : '+NET_CHAT[i]); if(PA) PA.swing=0.28; $('netChat').classList.remove('on'); }
const netR2=v=>Math.round(v*100)/100;
function netMyState(g){
  const s=[netR2(P.x),netR2(P.y),netR2(P.z),netR2(P.yaw),netR2(Math.min(30,Math.hypot(P.vx,P.vz))),(P.fly?1:0)|(P.onGround?2:0)|(PA&&PA.sit?4:0)|(PA&&PA.swing>0?8:0)];
  const v=g.ride; if(v&&VEH[v.type]) s.push(v.type,v.col,netR2(v.x),netR2(v.y),netR2(v.z),netR2(v.yaw||0));
  return s;
}
function netTick(g,dt){
  if(NET.role!=='host'&&NET.role!=='guest') return;
  NET.sT-=dt; NET.eT-=dt; NET.dT-=dt;
  if(NET.sT<=0){ NET.sT=0.1; netSend({t:'s',s:netMyState(g)}); }
  if(NET.eT<=0&&NET.out.length){ NET.eT=0.1; netSend({t:'e',d:NET.out.splice(0,4000)}); }
  if(NET.role==='host'&&NET.dT<=0){ NET.dT=5; netBroadcast({t:'d',v:+(g.dayT||0).toFixed(4)},null); }
  NET.players.forEach(p=>netDrawPlayer(g,p,dt));
}
function netDrawPlayer(g,p,dt){
  const s=p.s; if(!s) return;
  if(!p.A){ p.A=makeAvatar(p.av,p.name,{hand:true}); g.scene.add(p.A.root); p.x=s[0]; p.y=s[1]; p.z=s[2]; p.yaw=s[3]; }
  const k=Math.min(1,dt*12);
  if(Math.hypot(p.x-s[0],p.y-s[1],p.z-s[2])>12){ p.x=s[0]; p.y=s[1]; p.z=s[2]; }
  p.x=lerp(p.x,s[0],k); p.y=lerp(p.y,s[1],k); p.z=lerp(p.z,s[2],k); p.yaw=angLerp(p.yaw,s[3],k);
  const A=p.A; A.root.position.set(p.x,p.y,p.z); A.root.rotation.y=p.yaw; A.sit=!!(s[5]&4); if((s[5]&8)&&!(A.swing>0)) A.swing=0.28;
  animAvatar(A,dt,s[4],!!(s[5]&2));
  const vt=s.length>=12&&typeof s[6]==='string'&&VEH[s[6]]&&typeof s[7]==='string'&&/^#[0-9a-f]{6}$/i.test(s[7])&&s.slice(8,12).every(Number.isFinite)?s[6]:null, vk=vt?vt+s[7]:'';
  if(p.vk!==vk){ if(p.veh){ if(p.veh.g.parent) p.veh.g.parent.remove(p.veh.g); p.veh=null; } p.vk=vk; if(vt){ p.veh=vehMesh(vt,s[7]); g.scene.add(p.veh.g); } }
  if(p.veh){ p.veh.g.position.set(s[8],s[9],s[10]); p.veh.g.rotation.y=s[11]; }
}
function netGuestSave(own){ const w=NET.world; return {seed:w.seed,ch2:w.ch2,lt:w.lt,time:w.time,inv:own&&own.inv,hot:own&&own.hot,pos:NET.spawn}; }
/* ---------- branchement dans le Monde de Blocs ---------- */
{ const M=GAMES.mc;
  const st=M.start; M.start=function(){ this.netGuest=!!NET.world; const r=st.apply(this,arguments); $('hud').classList.toggle('net',NET.role==='host'||NET.role==='guest'); netBadge(); return r; };
  const up=M.update; M.update=function(dt){ const r=up.call(this,dt); netTick(this,dt); return r; };
  const sp=M.stop; M.stop=function(){ NET.players.forEach(p=>netFreeP(p)); if(!NET.starting&&(NET.role==='host'||NET.role==='guest'||NET.role==='joining')) netLeave(); return sp.apply(this,arguments); };
  const sv=M.saveMC; M.saveMC=function(){ if(this.netGuest){ save(); return; } return sv.apply(this,arguments); };
  const sb=M.setB; M.setB=function(x,y,z,id){ const r=sb.call(this,x,y,z,id); if((NET.role==='host'||NET.role==='guest')&&!NET.applying&&this===G&&NET.out.length<40000) NET.out.push(x,y,z,id); return r; };
}
/* ---------- fenêtre « Jouer avec des copains » ---------- */
function netOpenPanel(){ $('netPanel').classList.add('on'); netRender(); }
function netClosePanel(){ $('netPanel').classList.remove('on'); }
function netCard(p){
  const b=el('button','netcard'), ic=el('span','ic'), tx=el('span','tx'), bb=el('b'), sm=el('span'), go=el('span','go');
  ic.textContent='👥'; bb.textContent='Jouer avec des copains'; sm.textContent=NET.role==='host'||NET.role==='guest'?'🟢 En ligne · code '+NET.code:'Monde de Blocs à plusieurs, chacun sur son téléphone'; go.textContent='▶';
  tx.appendChild(bb); tx.appendChild(sm); b.appendChild(ic); b.appendChild(tx); b.appendChild(go);
  b.addEventListener('click',()=>{ sfx('click'); netOpenPanel(); }); p.appendChild(b);
}
function netRender(){
  const b=$('netPanel'); if(!b||!b.classList.contains('on')) return; b.innerHTML='';
  const head=el('div','mcp-h'), t=el('span'), x=el('button','iconbtn'); t.textContent='👥 Jouer avec des copains'; x.textContent='✖️'; x.setAttribute('aria-label','Fermer'); x.addEventListener('click',()=>{ sfx('click'); netClosePanel(); });
  head.appendChild(t); head.appendChild(x); const body=el('div','mcp-b'); b.appendChild(head); b.appendChild(body);
  const para=(txt,cls)=>{ const q=el('p',cls); q.textContent=txt; body.appendChild(q); return q; };
  const btn=(txt,cls,fn)=>{ const q=el('button','net-btn'+(cls?' '+cls:'')); q.textContent=txt; q.addEventListener('click',()=>{ sfx('click'); fn(); }); body.appendChild(q); return q; };
  const h4=txt=>{ const q=el('h4'); q.textContent=txt; body.appendChild(q); };
  if(NET.busy||NET.role==='joining'){ para(NET.msg||'⏳ Connexion…','net-st'); btn('Annuler','gray',()=>{ netLeave(true); NET.err=''; netRender(); }); return; }
  if(NET.role==='host'||NET.role==='guest'){
    para(NET.role==='host'?'Ta partie est ouverte ! Donne ce code à tes copains :':'Tu joues dans le monde de ton copain. Code de la partie :');
    const cd=el('div','net-code'); cd.textContent=NET.code; body.appendChild(cd);
    if(NET.role==='host') para('Sur leur téléphone : Blocs Mahé → 👥 Jouer avec des copains → tape le code → Rejoindre. Garde le jeu ouvert pendant qu\'ils jouent.','net-small');
    h4('Joueurs ('+(NET.players.size+1)+'/'+NET_MAX+')');
    const row=(name,tag)=>{ const r=el('div','mod'), i=el('span','em'), tx=el('div','tx'), bb=el('b'), sp=el('span'); i.textContent='🧑'; bb.textContent=name; sp.textContent=tag; tx.appendChild(bb); tx.appendChild(sp); r.appendChild(i); r.appendChild(tx); body.appendChild(r); };
    row(S.name+' (toi)',NET.role==='host'?'👑 Hôte':'Invité');
    NET.players.forEach((p,id)=>row(p.name,id==='h'?'👑 Hôte':'Invité'));
    if(NET.role==='guest') para('Ce que tu construis reste dans le monde de ton copain. Tes pièces et ton monde à toi ne changent pas.','net-small');
    if(mode==='game'&&G&&G.id==='mc') btn('🎮 Retour au jeu','',netClosePanel);
    else btn('🎮 Retourner dans la partie','',()=>{ netClosePanel(); if(NET.role==='host') startGame('mc'); });
    btn('🚪 Quitter la partie en ligne','red',()=>{ const g=NET.role==='guest'; netLeave(); netClosePanel(); if(g&&mode==='game'&&G&&G.id==='mc') exitGame(); });
    return;
  }
  if(NET.err) para('⚠️ '+NET.err,'net-err');
  h4('🌍 Créer une partie');
  para(mode==='game'&&G&&G.id==='mc'?'Ouvre ce monde à tes copains : tu reçois un code à leur donner.':'Ouvre ton Monde de Blocs à tes copains : tu reçois un code à leur donner.','net-small');
  btn('🌍 Créer une partie','',()=>netHost());
  h4('🚪 Rejoindre un copain');
  para('Tape le code que ton copain voit sur son écran.','net-small');
  const r=el('div','net-join'), inp=el('input','net-in'); inp.maxLength=5; inp.placeholder='CODE'; inp.autocomplete='off'; inp.spellcheck=false; inp.setAttribute('autocapitalize','characters'); inp.setAttribute('aria-label','Code de la partie');
  inp.addEventListener('input',()=>{ const v=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,''); if(v!==inp.value) inp.value=v; });
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter') netJoin(inp.value); });
  const jb=el('button','net-btn'); jb.textContent='Rejoindre'; jb.addEventListener('click',()=>{ sfx('click'); netJoin(inp.value); });
  r.appendChild(inp); r.appendChild(jb); body.appendChild(r);
  para('Il faut Internet sur chaque téléphone, jusqu\'à '+NET_MAX+' joueurs. Le jeu en ligne marche dans l\'appli Blocs Mahé (le lien GitHub), pas dans l\'aperçu de Claude.','net-small');
}
$('mcNet').addEventListener('click',()=>{ sfx('click'); netOpenPanel(); });
$('netChatB').addEventListener('click',()=>{ sfx('click'); const c=$('netChat'); c.classList.toggle('on'); });
{ const c=$('netChat'); NET_CHAT.forEach((t,i)=>{ const b=el('button'); b.textContent=t; b.addEventListener('click',()=>netSay(i)); c.appendChild(b); }); }
