// Audit d'affichage : node audit.js 320x568,390x844 [jeux] [shots]
const puppeteer=require('/opt/npm-tools/node_modules/puppeteer'); const fs=require('fs');
const VPS=(process.argv[2]||'320x568').split(',').map(v=>v.split('x').map(Number));
const GAMESL=(process.argv[3]&&process.argv[3]!=='all'?process.argv[3].split(','):null);
const SHOTS=process.argv[4]!=='0';
const AUD=`window.__aud=function(){
  const W=innerWidth,H=innerHeight,out=[];
  const vis=e=>{ const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05) return false; const r=e.getBoundingClientRect(); return r.width>2&&r.height>2; };
  const desc=e=>(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).join('.'):''))+(e.textContent?' «'+e.textContent.trim().replace(/\\s+/g,' ').slice(0,24)+'»':'');
  const rr=r=>'['+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'×'+Math.round(r.height)+']';
  const scrollP=e=>{ for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){ const cs=getComputedStyle(p); if((/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+2)||(/(auto|scroll)/.test(cs.overflowX)&&p.scrollWidth>p.clientWidth+2)) return p; } return null; };
  let root=document.querySelector('#netPanel.on')||document.querySelector('#result.on')||document.querySelector('#choice.on')||document.querySelector('#confirm.on')||document.querySelector('#hud.on')||document.querySelector('#home.on');
  if(!root) return ['(aucun écran)'];
  const els=[...root.querySelectorAll('button,.pill,canvas,.rbtn,.card,.stat,input,.ch-it,.tab,.iconbtn,.hud-top>*,#gx>*,.joy,#joy,#feed,#netBoard,#netFeed,#compass,.bsCard,.bsPanel,#bsMsg,.logo,h3,h4,b,p')].filter(vis);
  const top=els.filter(e=>!scrollP(e));
  for(const e of top){ const r=e.getBoundingClientRect(); if(r.left<-1||r.top<-1||r.right>W+1||r.bottom>H+1) out.push('DÉPASSE '+desc(e)+' '+rr(r)); }
  for(const e of els){ if(e.scrollWidth>e.clientWidth+3&&getComputedStyle(e).overflowX!=='visible'&&!/(auto|scroll)/.test(getComputedStyle(e).overflowX)) out.push('TEXTE COUPÉ '+desc(e)); }
  const ctl=top.filter(e=>e.matches('button,.pill,canvas,.rbtn,.iconbtn,.joy,#joy,#netBoard,#compass,.bsCard,.bsPanel,.hud-top>*'));
  for(let i=0;i<ctl.length;i++) for(let j=i+1;j<ctl.length;j++){ const a=ctl[i], b=ctl[j]; if(a.contains(b)||b.contains(a)) continue;
    const A=a.getBoundingClientRect(), B=b.getBoundingClientRect(), ix=Math.min(A.right,B.right)-Math.max(A.left,B.left), iy=Math.min(A.bottom,B.bottom)-Math.max(A.top,B.top);
    if(ix>4&&iy>4){ const ov=ix*iy/Math.min(A.width*A.height,B.width*B.height); if(ov>0.15) out.push('CHEVAUCHE '+desc(a)+' '+rr(A)+' ↔ '+desc(b)+' '+rr(B)+' '+Math.round(ov*100)+'%'); } }
  if(document.documentElement.scrollWidth>W+1) out.push('DÉFILEMENT HORIZONTAL '+document.documentElement.scrollWidth);
  return [...new Set(out)];
};`;
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage();
  await p.setRequestInterception(true);
  p.on('request',r=>{ const u=r.url(); if(u.includes('three.min.js')) r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('/home/claude/browser/three.min.js')}); else if(u.startsWith('http://127.0.0.1')||u.startsWith('data:')||u.startsWith('blob:')) r.continue(); else r.abort(); });
  const seen=new Map(); p.on('pageerror',e=>{ const k=e.message; const n=(seen.get(k)||0)+1; seen.set(k,n); if(n<=1) console.log('ERREUR PAGE',(e.stack||e.message).split('\n').slice(0,3).join(' | ').slice(0,300)); });
  await p.evaluateOnNewDocument(AUD);
  const W0=VPS[0]; await p.setViewport({width:W0[0],height:W0[1],deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await p.goto('http://127.0.0.1:8767/game_t.html',{waitUntil:'load'}); await new Promise(r=>setTimeout(r,2500));
  const ev=(f,...a)=>p.evaluate(f,...a), wait=ms=>new Promise(r=>setTimeout(r,ms));
  await ev(()=>{ const S=__t.getS(); S.coins=999; S.gfx='low'; S.name='Mahé'; });
  const report={};
  const snap=async(vp,name)=>{ const a=await ev(()=>window.__aud()); report[vp+' '+name]=a; if(SHOTS) await p.screenshot({path:'au_'+vp+'_'+name+'.png'}); };
  const pickAll=async()=>{ for(let k=0;k<4;k++){ const n=await ev(()=>{ const it=[...document.querySelectorAll('#choice.on .ch-it')].filter(e=>!e.classList.contains('lock')); if(!it.length) return 0; it[0].click(); return 1; }); if(!n) break; await wait(700); } };
  const games=GAMESL||await ev(()=>Object.keys(__t.GAMES));
  for(const [w,h] of VPS){ const vp=w+'x'+h;
    await p.setViewport({width:w,height:h,deviceScaleFactor:1,isMobile:true,hasTouch:true}); await wait(700);
    await ev(()=>{ if(__t.getG()) __t.exitGame(); __t.switchTab('play'); }); await wait(600); await snap(vp,'accueil');
    await ev(()=>__t.switchTab('avatar')); await wait(400); await snap(vp,'avatar');
    await ev(()=>__t.switchTab('shop')); await wait(400); await snap(vp,'boutique');
    await ev(()=>{ __t.switchTab('play'); __t.netOpenPanel(); }); await wait(400); await snap(vp,'enligne'); await ev(()=>__t.netClosePanel());
    for(const g of games){
      await ev(g=>__t.startGame(g),g); await wait(1500);
      if(await ev(()=>!!document.querySelector('#choice.on'))) await snap(vp,g+'_menu');
      await pickAll(); await wait(1200);
      if(process.env.NETFAKE) await ev(()=>{ const h=document.getElementById('hud'); h.classList.add('net'); const b=document.getElementById('netBoard'); b.innerHTML='<div class="me">⭐ Mahé · 💎 3/10</div><div>👤 Léo · 💎 1/10</div><div>👤 Zoé · 💎 0/10</div>'; b._h='x'; b.classList.add('on'); const f=document.getElementById('netFeed'); f.innerHTML='<div class="nf">👋 Zoé a rejoint la partie</div>'; });
      await snap(vp,g);
      if(g==='beast'){ await ev(()=>{ const G=__t.getG(); G.startBattle([__t.bsNew('zeclair',6)],false); }); await wait(2600); await snap(vp,'beast_combat'); await ev(()=>{ const G=__t.getG(); if(G.inB) G.endBattle&&0; }); }
    }
    await ev(()=>__t.showResult({icon:'👑',title:'Champion de l\'île !',sub:'Tu es le dernier debout, bravo Mahé ! (Classique)',stats:[['Place','1re / 16'],['Éliminations','3 🏅 record !'],['Dégâts','258'],['Pièces gagnées','+82']]})); await wait(1400); await snap(vp,'resultat');
    await ev(()=>__t.exitGame()); await wait(500);
    console.log('fini',vp);
  }
  fs.writeFileSync('audit.json',JSON.stringify(report,null,1));
  let n=0; for(const k of Object.keys(report)) if(report[k].length){ n+=report[k].length; console.log('== '+k); for(const l of report[k].slice(0,12)) console.log('   '+l); if(report[k].length>12) console.log('   … +'+(report[k].length-12)); }
  console.log('TOTAL',n); await b.close();
})().catch(e=>{ console.log('ÉCHEC',e.stack||e.message); process.exit(1); });
