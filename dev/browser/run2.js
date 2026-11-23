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
  // Le joueur invité a déjà son propre monde
  await ev(J,()=>{ localStorage.setItem('cubiverse-mc-v1',JSON.stringify({seed:4242,ch2:[1,30,1,5]})); const S=__t.getS(); S.name='Léo'; });
  await ev(H,()=>{ __t.getS().name='Mahé'; });
  // 1. l'hôte ouvre une partie depuis le menu
  await ev(H,()=>{ __t.netOpenPanel(); return __t.netHost(); }); await wait(2500);
  const h1=await ev(H,()=>({role:__t.NET.role,code:__t.NET.code,g:__t.getG()&&__t.getG().id,seed:__t.getG()&&__t.getG().seed}));
  ok(h1.role==='host'&&/^[A-Z2-9]{5}$/.test(h1.code)&&h1.g==='mc','l\'hôte crée la partie (code '+h1.code+') et entre dans le Monde de Blocs');
  // un bloc posé avant l'arrivée de l'invité
  const B1=await ev(H,()=>{ const G=__t.getG(), P=__t.P; G.panel&&G.closePanel&&G.closePanel(); const x=Math.floor(P.x)+2, z=Math.floor(P.z), y=Math.floor(P.y)+3; G.setB(x,y,z,6); return [x,y,z]; });
  await H.bringToFront(); await wait(400); await ev(H,()=>__shot('net_host1'));
  // 2. code faux
  await ev(J,()=>{ __t.netOpenPanel(); return __t.netJoin('ZZZZZ'); }); await wait(2500);
  const j0=await ev(J,()=>({role:__t.NET.role,err:__t.NET.err}));
  ok(j0.role===null&&/Aucune partie/.test(j0.err),'un mauvais code affiche « Aucune partie avec ce code »');
  await J.bringToFront(); await ev(J,()=>__shot('net_badcode'));
  // 3. l'invité rejoint
  await ev(J,c=>__t.netJoin(c),h1.code); await wait(4000);
  const j1=await ev(J,B=>{ const G=__t.getG(); return {role:__t.NET.role,g:G&&G.id,seed:G&&G.seed,b:G&&G.get(B[0],B[1],B[2]),pl:[...__t.NET.players.keys()],guest:G&&G.netGuest,mode:__t.getMode()}; },B1);
  ok(j1.role==='guest'&&j1.g==='mc'&&j1.mode==='game','l\'invité rejoint et entre dans le monde');
  ok(j1.seed===h1.seed,'même monde que l\'hôte (graine '+j1.seed+')');
  ok(j1.b===6,'le bloc posé par l\'hôte avant l\'arrivée est là ('+j1.b+')');
  ok(j1.pl.includes('h'),'l\'invité voit l\'hôte dans la liste');
  await wait(1500);
  const vis=await ev(H,()=>{ const p=__t.NET.players.get('p1'); return {n:__t.NET.players.size,name:p&&p.name,avatar:!!(p&&p.A),pos:p&&p.s&&p.s.slice(0,3)}; });
  const jp=await ev(J,()=>{ const P=__t.P; return [P.x,P.y,P.z]; });
  ok(vis.n===1&&vis.name==='Léo'&&vis.avatar,'l\'hôte voit l\'avatar de Léo');
  ok(vis.pos&&Math.hypot(vis.pos[0]-jp[0],vis.pos[2]-jp[2])<1.5,'position de Léo synchronisée');
  const jv=await ev(J,()=>{ const p=__t.NET.players.get('h'); return {avatar:!!(p&&p.A),name:p&&p.name}; });
  ok(jv.avatar&&jv.name==='Mahé','Léo voit l\'avatar de Mahé');
  // 4. blocs en direct dans les deux sens
  const B2=await ev(H,()=>{ const G=__t.getG(), P=__t.P; const x=Math.floor(P.x)-2, z=Math.floor(P.z)+1, y=Math.floor(P.y)+4; G.setB(x,y,z,9); return [x,y,z]; }); await wait(800);
  ok(await ev(J,B=>__t.getG().get(B[0],B[1],B[2]),B2)===9,'un bloc posé par l\'hôte apparaît chez Léo');
  const B3=await ev(J,()=>{ const G=__t.getG(), P=__t.P; const x=Math.floor(P.x)+1, z=Math.floor(P.z)-2, y=Math.floor(P.y)+5; G.setB(x,y,z,11); return [x,y,z]; }); await wait(800);
  ok(await ev(H,B=>__t.getG().get(B[0],B[1],B[2]),B3)===11,'un bloc posé par Léo apparaît chez l\'hôte');
  await ev(J,B=>__t.getG().setB(B[0],B[1],B[2],0),B2); await wait(800);
  ok(await ev(H,B=>__t.getG().get(B[0],B[1],B[2]),B2)===0,'un bloc cassé par Léo disparaît chez l\'hôte');
  // 5. déplacement
  await ev(J,()=>{ __t.joy.y=1; }); await wait(1200); await ev(J,()=>{ __t.joy.y=0; }); await wait(600);
  const jp2=await ev(J,()=>[__t.P.x,__t.P.z]); const hs=await ev(H,()=>{ const p=__t.NET.players.get('p1'); return [p.x,p.z]; });
  ok(Math.hypot(jp2[0]-jp[0],jp2[1]-jp[2])>1&&Math.hypot(hs[0]-jp2[0],hs[1]-jp2[1])<1,'l\'hôte voit Léo bouger');
  // 6. messages rapides
  await ev(J,()=>__t.netSay(0)); await wait(600);
  const feed=await ev(H,()=>document.getElementById('netFeed').textContent);
  ok(/Léo : 👋 Salut/.test(feed),'message rapide reçu : « '+feed.slice(-20)+' »');
  // images
  const hp=await ev(H,()=>[__t.P.x,__t.P.y,__t.P.z,__t.cam.yaw]); await ev(J,h=>{ const P=__t.P, G=__t.getG(); G.closePanel&&G.closePanel(); P.x=h[0]+1.8*Math.cos(h[3])-1.5*Math.sin(h[3]); P.z=h[2]-1.8*Math.sin(h[3])-1.5*Math.cos(h[3]); P.y=h[1]+0.5; },hp); await H.bringToFront(); await wait(1500); await ev(H,()=>__shot('net_host2'));
  await J.bringToFront(); await ev(J,()=>{ document.getElementById('netChatB').click(); }); await wait(300); await ev(J,()=>__shot('net_guest'));
  await ev(J,()=>{ document.getElementById('netChat').classList.remove('on'); __t.netOpenPanel(); }); await wait(300); await ev(J,()=>__shot('net_guest_panel'));
  // 7. Léo quitte : l'hôte le voit partir, et le monde de Léo n'a pas été touché
  await ev(J,()=>{ document.getElementById('netPanel').classList.remove('on'); __t.exitGame(); }); await wait(1200);
  ok(await ev(H,()=>__t.NET.players.size)===0,'quand Léo quitte, il disparaît chez l\'hôte');
  const own=await ev(J,()=>JSON.parse(localStorage.getItem('cubiverse-mc-v1')));
  ok(own&&own.seed===4242,'le monde à Léo est intact (graine '+(own&&own.seed)+')');
  // 8. Léo revient, puis l'hôte ferme
  await ev(J,c=>{ __t.netOpenPanel(); return __t.netJoin(c); },h1.code); await wait(3500);
  ok(await ev(J,()=>__t.NET.role)==='guest','Léo peut revenir dans la partie');
  await ev(H,()=>__t.exitGame()); await wait(4000);
  const end=await ev(J,()=>({role:__t.NET.role,mode:__t.getMode()}));
  ok(end.role===null&&end.mode==='menu','quand l\'hôte quitte, Léo revient au menu');
  await ev(H,()=>__t.netOpenPanel()); await H.bringToFront(); await wait(300); await ev(H,()=>__shot('net_menu_panel'));
  console.log(fails?'\nÉCHECS : '+fails:'\nTOUT EST OK');
  await b.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log('ÉCHEC',e.stack||e.message); process.exit(1); });
