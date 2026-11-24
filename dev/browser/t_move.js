const puppeteer=require('/opt/npm-tools/node_modules/puppeteer'); const fs=require('fs');
const OLD='https://yoniyaiche-droid.github.io/Blocs-mahe/', NEW='https://blocs-mahe.vercel.app/'; let newUp=true;
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  const html=fs.readFileSync('game_t.html','utf8');
  await p.setRequestInterception(true);
  p.on('request',r=>{ const u=r.url();
    if(u.startsWith(NEW+'icon-192.png')) return newUp?r.respond({status:200,contentType:'image/png',body:fs.readFileSync('/home/claude/blocs-mahe/icon-192.png')}):r.respond({status:404,body:''});
    if(u.startsWith(OLD)||u.startsWith(NEW)){ if(/\.(png|json|webmanifest|js)(\?|$)/.test(u.split('#')[0])&&!u.includes('three')) return r.respond({status:404,body:''}); return r.respond({status:200,contentType:'text/html; charset=utf-8',body:html}); }
    if(u.includes('three.min.js')) return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('three.min.js')});
    if(u.startsWith('data:')||u.startsWith('blob:')) return r.continue(); r.abort(); });
  const nav=[]; p.on('framenavigated',f=>{ if(f===p.mainFrame()) nav.push(f.url().replace(/(#transfert=.).*/,'$1…')); });
  p.on('pageerror',e=>console.log('ERREUR PAGE',e.message.slice(0,200)));
  const wait=ms=>new Promise(r=>setTimeout(r,ms)); let fails=0; const ok=(c,t)=>{ console.log((c?'  ✔ ':'  ✘ ')+t); if(!c) fails++; };
  // 1. une vraie sauvegarde (prise dans le jeu), puis la nouvelle adresse redevient vierge
  await p.goto(NEW,{waitUntil:'load'}); await wait(2500);
  const real=await p.evaluate(()=>{ const c=JSON.parse(JSON.stringify(__t.getS())); c.coins=4321; c.name='Mahé'; c.owned.hat.push('helmet'); return JSON.stringify(c); });
  await p.evaluate(()=>{ window.__moving=true; localStorage.clear(); });
  ok(real.length>200,'sauvegarde de test prête ('+real.length+' caractères)');
  // 2. l'ancienne adresse a la vraie progression
  await p.goto('about:blank');
  await p.goto(OLD+'?prep=1',{waitUntil:'domcontentloaded'}).catch(()=>{});
  // on écrit la progression sur l'ancienne origine sans laisser le déménagement partir : page vide servie à part
  await p.setRequestInterception(false); await p.setRequestInterception(true);
  p.removeAllListeners('request');
  let prep=true;
  p.on('request',r=>{ const u=r.url();
    if(prep&&u.startsWith(OLD)) return r.respond({status:200,contentType:'text/html',body:'<html><body>prep</body></html>'});
    if(u.startsWith(NEW+'icon-192.png')) return newUp?r.respond({status:200,contentType:'image/png',body:fs.readFileSync('/home/claude/blocs-mahe/icon-192.png')}):r.respond({status:404,body:''});
    if(u.startsWith(OLD)||u.startsWith(NEW)){ if(/\.(png|json|webmanifest|js)(\?|$)/.test(u.split('#')[0])&&!u.includes('three')) return r.respond({status:404,body:''}); return r.respond({status:200,contentType:'text/html; charset=utf-8',body:html}); }
    if(u.includes('three.min.js')) return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('three.min.js')});
    if(u.startsWith('data:')||u.startsWith('blob:')) return r.continue(); r.abort(); });
  await p.goto(OLD,{waitUntil:'load'});
  const big=JSON.stringify({seed:4242,ch2:Array.from({length:60000},(_,i)=>i%97)});
  await p.evaluate((big,real)=>{ localStorage.setItem('cubiverse-save-v1',real); localStorage.setItem('cubiverse-mc-v1',big); localStorage.setItem('blocsmahe-ghost-v1','[1,2,3]'); localStorage.setItem('autre-site','x'); },big,real);
  prep=false; nav.length=0;
  // 2b. si la nouvelle adresse ne répond pas, on reste et on joue sur l'ancienne
  newUp=false; await p.goto(OLD,{waitUntil:'load'}); await wait(4000);
  const st=await p.evaluate(()=>({url:location.href,coins:window.__t&&__t.getS().coins,moving:!!window.__moving}));
  ok(st.url===OLD&&!st.moving&&st.coins===4321,'nouvelle adresse injoignable : on reste et on joue normalement ('+st.coins+' pièces)');
  newUp=true; nav.length=0;
  // 3. on ouvre l'ancienne adresse : elle déménage
  await p.goto(OLD,{waitUntil:'load'}); await wait(7000);
  console.log('  navigations :',nav.join(' → '));
  const r=await p.evaluate(()=>({url:location.href,coins:window.__t&&__t.getS().coins,name:window.__t&&__t.getS().name,hats:window.__t&&__t.getS().owned.hat.join(','),mc:(localStorage.getItem('cubiverse-mc-v1')||'').length,gh:localStorage.getItem('blocsmahe-ghost-v1'),autre:localStorage.getItem('autre-site'),share:window.__t&&1}));
  ok(r.url===NEW,'on arrive sur la nouvelle adresse, sans rien de plus dans la barre ('+r.url+')');
  ok(r.coins===4321&&r.name==='Mahé','la progression est arrivée ('+r.coins+' pièces, '+r.name+')');
  ok(/helmet/.test(r.hats||''),'les objets achetés aussi ('+r.hats+')');
  ok(r.mc===big.length,'le Monde de Blocs aussi ('+r.mc+' caractères)');
  ok(r.gh==='[1,2,3]'&&r.autre===null,'records du parcours transférés, rien d\'autre');
  const tl=nav.find(u=>u.includes('#transfert='))||''; ok(tl.includes('#transfert=z'),'données compressées dans l\'adresse');
  // 4. revenir sur l'ancienne avec une vieille progression plus petite ne doit rien écraser
  await p.evaluate(()=>{ window.__moving=true; const s=JSON.parse(localStorage.getItem('cubiverse-save-v1')); s.coins=9999; s.owned.hat.push('explorer','leaf','flowers'); localStorage.setItem('cubiverse-save-v1',JSON.stringify(s)); });
  await p.goto(OLD,{waitUntil:'load'}); await wait(6000);
  const r2=await p.evaluate(()=>({url:location.href,coins:__t.getS().coins}));
  ok(r2.url===NEW&&r2.coins===9999,'une progression plus récente sur la nouvelle adresse est gardée ('+r2.coins+')');
  const sh=await p.evaluate(()=>{ __t.switchTab('play'); return document.getElementById('bShare')?1:0; });
  console.log(fails?'\nÉCHECS : '+fails:'\nTOUT EST OK'); await b.close(); process.exit(fails?1:0);
})().catch(e=>{ console.log('ÉCHEC',e.stack||e.message); process.exit(1); });
