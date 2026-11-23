const puppeteer=require('/opt/npm-tools/node_modules/puppeteer');
const fs=require('fs');
(async()=>{
  const url=process.argv[2], shot=process.argv[3]||'shot.png', script=process.argv[4];
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage(); await p.setViewport({width:400,height:860,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await p.setRequestInterception(true);
  p.on('request',r=>{ const u=r.url(); if(u.includes('three.min.js')) r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('/home/claude/browser/three.min.js')}); else if(u.startsWith('http://127.0.0.1')||u.startsWith('data:')||u.startsWith('blob:')) r.continue(); else { console.log('BLOQUÉ',u.slice(0,90)); r.abort(); } });
  p.on('console',m=>{ if(m.type()==='error'||m.type()==='warning') console.log('CONSOLE',m.type(),m.text().slice(0,300)); });
  await p.exposeFunction('__shot',async n=>{ await p.screenshot({path:n+'.png'}); return 1; });
  const seen=new Map(); p.on('pageerror',e=>{ const k=e.message; const n=(seen.get(k)||0)+1; seen.set(k,n); if(n<=2) console.log('ERREUR PAGE',(e.stack||e.message).split('\n').slice(0,5).join(' | ').slice(0,600)); });
  await p.goto(url,{waitUntil:'load'}); await new Promise(r=>setTimeout(r,2500));
  if(script){ const code=fs.readFileSync(script,'utf8'); const out=await p.evaluate(new Function('return (async()=>{'+code+'})()')); if(out) console.log('RÉSULTAT',typeof out==='string'?out:JSON.stringify(out)); }
  await p.screenshot({path:shot}); await b.close();
})().catch(e=>{ console.log('ÉCHEC',e.message); process.exit(1); });
