// Deux « téléphones » séparés (contextes indépendants) reliés par un faux PeerJS routé par Node.
const puppeteer=require('/opt/npm-tools/node_modules/puppeteer');
const fs=require('fs');
const URL='http://127.0.0.1:8767/game_t.html';
const FAKE=`
(()=>{
  const peers={};
  window.__fpRecv=m=>{ const p=peers[m.to]; if(p) p._recv(m); };
  class Em{ constructor(){ this.h={}; } on(e,f){ (this.h[e]=this.h[e]||[]).push(f); return this; } emit(e,...a){ (this.h[e]||[]).slice().forEach(f=>{ try{ f(...a); }catch(err){ console.error('fake handler',err); } }); } }
  class Conn extends Em{ constructor(p,peer){ super(); this.p=p; this.peer=peer; this.open=false; this.closed=false; }
    send(d){ if(this.closed) return; window.__fpPost({k:'data',to:this.peer,from:this.p.id,d:JSON.parse(JSON.stringify(d))}); }
    close(){ if(this.closed) return; this.closed=true; window.__fpPost({k:'close',to:this.peer,from:this.p.id}); delete this.p.conns[this.peer]; this.emit('close'); } }
  class Peer extends Em{
    constructor(id,opt){ super(); if(typeof id!=='string') id='r'+Math.random().toString(36).slice(2,10); this.id=id; this.conns={}; this.destroyed=false; this.disconnected=false;
      window.__fpPost({k:'reg',id}).then(ok=>{ if(ok) { peers[id]=this; this.emit('open',id); } else this.emit('error',{type:'unavailable-id'}); }); }
    _recv(m){ if(this.destroyed) return;
      if(m.k==='conn'){ const c=new Conn(this,m.from); this.conns[m.from]=c; this.emit('connection',c); window.__fpPost({k:'ack',to:m.from,from:this.id}); setTimeout(()=>{ c.open=true; c.emit('open'); },20); }
      else if(m.k==='ack'){ const c=this.conns[m.from]; if(c){ c.acked=true; c.open=true; c.emit('open'); } }
      else if(m.k==='data'){ const c=this.conns[m.from]; if(c) c.emit('data',m.d); }
      else if(m.k==='close'){ const c=this.conns[m.from]; if(c&&!c.closed){ c.closed=true; delete this.conns[m.from]; c.emit('close'); } } }
    connect(id){ const c=new Conn(this,id); this.conns[id]=c; window.__fpPost({k:'conn',to:id,from:this.id}).then(ok=>{ if(!ok) setTimeout(()=>this.emit('error',{type:'peer-unavailable'}),300); }); return c; }
    destroy(){ if(this.destroyed) return; Object.values(this.conns).forEach(c=>c.close()); this.destroyed=true; delete peers[this.id]; window.__fpPost({k:'unreg',id:this.id}); }
    reconnect(){} }
  window.Peer=Peer;
})();`;
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const reg={}; const pages={};
  const mk=async name=>{
    const ctx=await b.createBrowserContext(); const p=await ctx.newPage(); pages[name]=p;
    await p.setViewport({width:400,height:760,isMobile:true,hasTouch:true});
    await p.exposeFunction('__fpPost',async m=>{
      if(m.k==='reg'){ if(reg[m.id]) return false; reg[m.id]=p; return true; }
      if(m.k==='unreg'){ if(reg[m.id]===p) delete reg[m.id]; return true; }
      const t=reg[m.to]; if(!t) return false; t.evaluate(x=>window.__fpRecv&&window.__fpRecv(x),m).catch(()=>{}); return true; });
    await p.exposeFunction('__shot',async n=>{ await p.screenshot({path:n+'.png'}); return 1; });
    await p.evaluateOnNewDocument(FAKE);
    await p.setRequestInterception(true);
    p.on('request',r=>{ const u=r.url(); if(u.includes('three.min.js')) r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('/home/claude/browser/three.min.js')}); else if(u.startsWith('http://127.0.0.1')||u.startsWith('data:')||u.startsWith('blob:')) r.continue(); else r.abort(); });
    const seen=new Map();
    p.on('pageerror',e=>{ const k=e.message, n=(seen.get(k)||0)+1; seen.set(k,n); if(n<=2) console.log('['+name+'] ERREUR PAGE',(e.stack||e.message).split('\n').slice(0,4).join(' | ').slice(0,500)); });
    p.on('console',m=>{ if(m.type()==='error') console.log('['+name+'] console',m.text().slice(0,200)); });
    await p.goto(URL,{waitUntil:'load'}); await new Promise(r=>setTimeout(r,1500));
    return p;
  };
  const H=await mk('hôte'), J=await mk('invité');
  const ev=(p,f,...a)=>p.evaluate(f,...a);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  let fails=0; const ok=(c,t)=>{ console.log((c?'  ✔ ':'  ✘ ')+t); if(!c) fails++; };
  const pick=(p,i)=>ev(p,i=>{ const it=document.querySelectorAll('#choice.on .ch-it'); if(!it.length) return 0; it[Math.min(i,it.length-1)].click(); return it.length; },i);
  await ev(J,()=>{ __t.getS().name='Léo'; }); await ev(H,()=>{ __t.getS().name='Mahé'; });
  await ev(H,()=>{ __t.netOpenPanel(); return __t.netHost(); }); await wait(2000);
  const code=await ev(H,()=>__t.NET.code);
  await ev(J,c=>{ __t.netOpenPanel(); return __t.netJoin(c); },code); await wait(2500);
  await ev(H,()=>{ __t.netClosePanel(); __t.startGame('royale'); }); await wait(2500);
  await pick(H,1); await wait(1500);
  // tout le monde saute et atterrit, sans robots
  for(const p of [H,J]) await ev(p,()=>{ const G=__t.getG(); for(const b of G.bots){ b.alive=false; if(b.A) b.A.root.visible=false; } });
  for(let k=0;k<40;k++){ const d=await Promise.all([H,J].map(p=>ev(p,()=>{ const G=__t.getG(); if(!G.pEnt.landed) __t.P.jumpBuf=0.2; return G.pEnt.landed; }))); if(d[0]&&d[1]) break; await wait(500); }
  const ld=await Promise.all([H,J].map(p=>ev(p,()=>__t.getG().pEnt.landed)));
  ok(ld[0]&&ld[1],'les deux joueurs ont atterri');
  // face à face, à 6 m
  await ev(H,()=>{ const P=__t.P, G=__t.getG(); P.x=10; P.z=10; P.y=G.pEnt.y=0; G.pEnt.x=10; G.pEnt.z=10; });
  await ev(J,()=>{ const P=__t.P, G=__t.getG(); P.x=10; P.z=16; P.y=0; G.pEnt.x=10; G.pEnt.z=16; });
  await wait(1500);
  const foes=await ev(H,()=>__t.getG().netFoes().map(q=>q.name+'@'+q.x.toFixed(1)+','+q.z.toFixed(1)));
  ok(foes.length===1&&/Léo/.test(foes[0]),'Mahé voit Léo comme adversaire ('+foes.join(' ')+')');
  await ev(J,()=>{ window.__fxMax=0; setInterval(()=>{ const G=__t.getG(); if(G&&G.proj) window.__fxMax=Math.max(window.__fxMax,G.proj.filter(p=>p.fx).length); },30); });
  const hp0=await ev(J,()=>__t.getG().pEnt.hp+__t.getG().pEnt.sh);
  // Mahé tire au blaster vers Léo
  for(let i=0;i<3;i++){ await ev(H,()=>{ const G=__t.getG(), q=G.netFoes()[0]; const ox=__t.P.x, oy=1.3, oz=__t.P.z+0.5; const dx=q.x-ox, dy=q.y+1.0-oy, dz=q.z-oz, l=Math.hypot(dx,dy,dz); G.shoot(G.pEnt,{w:'blaster',r:0},ox,oy,oz,dx/l,dy/l,dz/l,1); }); await wait(350); }
  await wait(800);
  const fx=await ev(J,()=>window.__fxMax);
  const hp1=await ev(J,()=>__t.getG().pEnt.hp+__t.getG().pEnt.sh);
  ok(hp1<hp0,'Léo perd de la vie quand Mahé le touche ('+hp0+' → '+hp1.toFixed(1)+')');
  ok(fx>0,'les tirs de Mahé sont rejoués chez Léo ('+fx+' en vol)');
  await J.bringToFront(); await ev(J,()=>__shot('pvp1_invite_touche'));
  // jusqu'à l'élimination (bazooka)
  for(let i=0;i<12;i++){ const al=await ev(J,()=>__t.getG().pEnt.alive); if(!al) break;
    await ev(H,()=>{ const G=__t.getG(), q=G.netFoes()[0]; if(!q) return; const ox=__t.P.x, oy=1.3, oz=__t.P.z+0.5; const dx=q.x-ox, dy=q.y+1.0-oy, dz=q.z-oz, l=Math.hypot(dx,dy,dz); G.shoot(G.pEnt,{w:'sniper',r:3},ox,oy,oz,dx/l,dy/l,dz/l,1); }); await wait(500); }
  await wait(1500);
  const jr=await ev(J,()=>({alive:__t.getG().pEnt.alive,sub:document.getElementById('rSub').textContent}));
  ok(!jr.alive&&/👤 Mahé/.test(jr.sub),'Léo est éliminé par Mahé : « '+jr.sub+' »');
  const hr=await ev(H,()=>({k:__t.getG().kills,over:__t.getG().over,t:document.getElementById('rTitle').textContent}));
  ok(hr.k===1,'Mahé compte l\'élimination ('+hr.k+')');
  ok(hr.over&&/Champion/.test(hr.t),'Mahé gagne : plus de robots ni de copains debout (« '+hr.t+' »)');
  await wait(1200); await H.bringToFront(); await ev(H,()=>__shot('pvp2_hote_gagne'));
  const feed=await ev(J,()=>document.getElementById('netFeed').textContent+' | '+document.getElementById('feed').textContent);
  ok(/Mahé/.test(feed),'annonce : '+feed.slice(0,90));
  console.log(fails?'\nÉCHECS : '+fails:'\nTOUT EST OK');
  await b.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log('ÉCHEC',e.stack||e.message); process.exit(1); });
