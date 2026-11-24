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
  const choiceTitle=p=>ev(p,()=>{ const c=document.querySelector('#choice.on .ch-h b'); return c?c.textContent:''; });
  await ev(J,()=>{ const S=__t.getS(); S.name='Léo'; S.build=[[0,0,0,1],[1,0,0,2]]; });
  await ev(H,()=>{ const S=__t.getS(); S.name='Mahé'; S.build=[]; });
  // 1. salon
  await ev(H,()=>{ __t.netOpenPanel(); return __t.netHost(); }); await wait(2000);
  const code=await ev(H,()=>__t.NET.code);
  await ev(J,c=>{ __t.netOpenPanel(); return __t.netJoin(c); },code); await wait(2500);
  const l1=await ev(J,()=>({role:__t.NET.role,mode:__t.getMode(),card:document.querySelector('.netcard')&&document.querySelector('.netcard').textContent}));
  ok(l1.role==='guest'&&l1.mode==='menu'&&/En ligne/.test(l1.card),'Léo rejoint le salon et attend à l\'accueil ('+(l1.card||'').slice(0,60)+')');
  await J.bringToFront(); await ev(J,()=>__shot('m0_salon_invite'));
  await ev(J,()=>{ const c=[...document.querySelectorAll('#pane-play .card')]; c[2].click(); }); await wait(800);
  ok(await ev(J,()=>__t.getMode())==='menu','toucher un jeu chez l\'invité ne le lance pas tout seul');
  // 2. Île au Trésor : monde au hasard mais identique
  await ev(H,()=>{ __t.netClosePanel(); __t.startGame('island'); }); await wait(2500);
  const isl=await Promise.all([H,J].map(p=>ev(p,()=>{ const G=__t.getG(); return {g:G&&G.id,h:G&&G.H?Array.from(G.H).join(''):'',r:G&&G.netR}; })));
  ok(isl[1].g==='island','Léo suit Mahé dans l\'Île au Trésor');
  ok(isl[0].h.length>100&&isl[0].h===isl[1].h,'même île chez les deux (relief identique)');
  await ev(J,()=>{ __t.joy.y=1; }); await wait(1500); await ev(J,()=>{ __t.joy.y=0; }); await wait(700);
  const seeJ=await ev(H,()=>{ const p=__t.NET.players.get('p1'); return {vis:!!(p&&p.A&&p.A.root.visible),x:p&&p.x,z:p&&p.z}; });
  const jp=await ev(J,()=>[__t.P.x,__t.P.z]);
  ok(seeJ.vis&&Math.hypot(seeJ.x-jp[0],seeJ.z-jp[1])<1.5,'Mahé voit Léo se déplacer sur l\'île');
  await wait(1200);
  const board=await ev(H,()=>document.getElementById('netBoard').textContent);
  ok(/Léo/.test(board)&&/💎/.test(board),'tableau des scores : « '+board+' »');
  { const hp=await ev(H,()=>[__t.P.x,__t.P.y,__t.P.z,__t.cam.yaw]); await ev(J,h=>{ const P=__t.P; P.x=h[0]+1.5*Math.cos(h[3])-2*Math.sin(h[3]); P.z=h[2]-1.5*Math.sin(h[3])-2*Math.cos(h[3]); },hp); await wait(1200); await H.bringToFront(); await wait(600); await ev(H,()=>__shot('m1_ile_hote')); }
  // 3. Saute-Nuage : héros chacun, monde choisi par l'hôte
  await ev(H,()=>__t.startGame('plat')); await wait(1500);
  ok(await ev(J,()=>__t.getG()&&__t.getG().id)==='plat','Léo suit dans le Royaume Saute-Nuage');
  await pick(J,1); await wait(600);
  const jt=await choiceTitle(J); ok(/⏳/.test(jt),'Léo a choisi son héros et attend le monde : « '+jt+' »');
  await J.bringToFront(); await ev(J,()=>__shot('m2_attente_monde'));
  await pick(H,0); await wait(500); await pick(H,0); await wait(1800);
  const pw=await Promise.all([H,J].map(p=>ev(p,()=>{ const G=__t.getG(); return {wi:G.wi,ready:G.ready,hero:G.hero&&G.hero.id}; })));
  ok(pw[0].ready&&pw[1].ready&&pw[0].wi===pw[1].wi,'même monde chez les deux (monde '+(pw[0].wi+1)+')');
  const look=await ev(J,()=>{ const p=__t.NET.players.get('h'); return p&&p.look; });
  ok(look===pw[0].hero,'Léo voit Mahé avec son héros ('+look+')');
  await ev(J,h=>{ const P=__t.P; P.x=h+1.4; },await ev(H,()=>__t.P.x)); await wait(1500);
  await H.bringToFront(); await wait(500); await ev(H,()=>__shot('m3_plat_hote'));
  // 4. Turbo Bolides : départ commun, voitures, classement à 7
  await ev(H,()=>__t.startGame('race')); await wait(2000);
  await pick(H,0); await wait(1200);
  const w1=await ev(H,()=>__t.getG().phase);
  ok(w1==='wait','Mahé attend que Léo ait choisi (phase '+w1+')');
  await pick(J,2); await wait(1500);
  const ph=await Promise.all([H,J].map(p=>ev(p,()=>__t.getG().phase)));
  ok(ph.every(x=>x==='count'||x==='race'),'départ en même temps ('+ph.join(' / ')+')');
  await wait(4500);
  const rc=await ev(J,()=>{ const p=__t.NET.players.get('h'); return {car:!!(p&&p.veh&&p.veh.g.visible),pos:document.getElementById('rcPos').textContent}; });
  ok(rc.car,'Léo voit la voiture de Mahé'); ok(/\/7$/.test(rc.pos),'classement avec les vrais joueurs : '+rc.pos);
  await ev(J,()=>{ __t.joy.y=1; }); await wait(2500);
  await J.bringToFront(); await ev(J,()=>__shot('m4_course_invite')); await ev(J,()=>{ __t.joy.y=0; });
  // 5. Bataille Royale : mode choisi par l'hôte, même île
  await ev(H,()=>__t.startGame('royale')); await wait(2500);
  const jr=await choiceTitle(J); ok(/⏳/.test(jr),'Léo attend le mode de jeu : « '+jr+' »');
  await pick(H,1); await wait(1500);
  const ry=await Promise.all([H,J].map(p=>ev(p,()=>{ const G=__t.getG(); return {mode:G.mode,ch:G.modeChosen,tr:G.chests.map(c=>Math.round(c.x)+','+Math.round(c.z)).join(';')}; })));
  ok(ry[1].ch&&ry[0].mode===ry[1].mode,'même mode chez les deux ('+ry[1].mode+')');
  ok(ry[0].tr.length>5&&ry[0].tr===ry[1].tr,'coffres aux mêmes endroits');
  // 6. Bâtisseur : on construit ensemble
  await ev(H,()=>__t.startGame('build')); await wait(2500);
  const b0=await ev(J,()=>__t.getG().blocks.size);
  ok(b0===0,'Léo arrive dans la construction de Mahé (sans la sienne) : '+b0+' bloc');
  await ev(H,()=>{ const G=__t.getG(); G.addBlock(3,0,3,4,false); G.addBlock(3,1,3,5,false); }); await wait(900);
  ok(await ev(J,()=>__t.getG().blocks.size)===2,'les blocs de Mahé apparaissent chez Léo');
  await ev(J,()=>{ const G=__t.getG(); G.addBlock(-2,0,5,7,false); G.removeBlock(G.blocks.keys().next().value); }); await wait(900);
  const hb=await ev(H,()=>__t.getG().blocks.size);
  ok(hb===2,'Léo pose et casse des blocs chez Mahé ('+hb+' blocs)');
  await ev(H,()=>__t.exitGame()); await wait(1500);
  const jb=await ev(J,()=>({mode:__t.getMode(),b:JSON.stringify(__t.getS().build)}));
  ok(jb.mode==='menu','quand Mahé revient à l\'accueil, Léo aussi');
  ok(jb.b==='[[0,0,0,1],[1,0,0,2]]','la construction de Léo est intacte');
  const hs=await ev(H,()=>__t.getS().build.length); ok(hs===2,'la construction commune est gardée chez Mahé ('+hs+' blocs)');
  // 7. Parcours, Jungle, Temple, Bestioles : tout le monde arrive
  for(const g of ['obby','jungle','temple','beast','arena','eggs','brainrot','pirates']){
    await ev(H,g=>__t.startGame(g),g); await wait(2200);
    for(let k=0;k<3;k++){ if(await ev(H,()=>!!document.querySelector('#choice.on .ch-it'))) { await pick(H,0); await wait(700); } if(await ev(J,()=>!!document.querySelector('#choice.on .ch-it'))) { await pick(J,0); await wait(700); } }
    await wait(1500);
    const r=await Promise.all([H,J].map(p=>ev(p,()=>{ const G=__t.getG(); return {g:G&&G.id,w:G&&(G.w!==undefined?G.w:G.li),n:__t.netPeers().length}; })));
    ok(r[1].g===g&&r[0].n===1&&r[1].n===1&&r[0].w===r[1].w,g+' : les deux joueurs sont ensemble'+(r[0].w!==undefined?' (niveau '+r[0].w+')':''));
  }
  // 8. fin de partie annoncée
  await ev(H,()=>{ __t.getG(); window.__t.showResult&&0; }); 
  await ev(J,()=>{ __t.netSay(8); }); await wait(600);
  const fd=await ev(H,()=>document.getElementById('netFeed').textContent); ok(/On fait la course/.test(fd),'nouveaux messages rapides');
  await ev(H,()=>{ __t.exitGame(); __t.netLeave(); }); await wait(2500);
  ok(await ev(J,()=>__t.NET.role)===null,'fin du salon');
  console.log(fails?'\nÉCHECS : '+fails:'\nTOUT EST OK');
  await b.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log('ÉCHEC',e.stack||e.message); process.exit(1); });
