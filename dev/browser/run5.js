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
  const pick=(p,i)=>ev(p,i=>{ const it=document.querySelectorAll('#choice.on .ch-it'); if(!it.length) return 0; it[Math.min(i,it.length-1)].click(); return it.length; },i);
  await ev(J,()=>{ __t.getS().name='Léo'; }); await ev(H,()=>{ __t.getS().name='Mahé'; });
  await ev(H,()=>{ __t.netOpenPanel(); return __t.netHost(); }); await wait(2000);
  const code=await ev(H,()=>__t.NET.code);
  await ev(J,c=>{ __t.netOpenPanel(); return __t.netJoin(c); },code); await wait(2500);
  await ev(J,()=>__t.netOpenPanel()); await J.bringToFront(); await wait(400); await ev(J,()=>__shot('v_panel_invite')); await ev(J,()=>__t.netClosePanel());
  for(const g of ['obby','arena','eggs','brainrot','pirates','jungle','temple','beast','build','mc']){
    await ev(H,g=>{ __t.netClosePanel(); __t.startGame(g); },g); await wait(2300);
    for(let k=0;k<3;k++){ if(await ev(H,()=>!!document.querySelector('#choice.on .ch-it'))){ await pick(H,0); await wait(700); } if(await ev(J,()=>!!document.querySelector('#choice.on .ch-it'))){ await pick(J,0); await wait(700); } }
    await wait(1200);
    await ev(J,h=>{ const P=__t.P; P.x=h[0]+1.6*Math.cos(h[3])-2.2*Math.sin(h[3]); P.y=h[1]; P.z=h[2]-1.6*Math.sin(h[3])-2.2*Math.cos(h[3]); },await ev(H,()=>[__t.P.x,__t.P.y,__t.P.z,__t.cam.yaw]));
    await wait(1500); await H.bringToFront(); await wait(700); await ev(H,g=>__shot('v_'+g),g); await J.bringToFront();
  }
  console.log('RÉSULTAT ok'); await b.close(); process.exit(0);
})().catch(e=>{ console.log('ÉCHEC',e.stack||e.message); process.exit(1); });
