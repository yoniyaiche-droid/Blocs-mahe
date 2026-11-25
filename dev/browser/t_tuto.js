const wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[]; let fails=0; const ok=(c,t)=>{ log.push((c?'✔ ':'✘ ')+t); if(!c) fails++; };
const pickAll=async()=>{ for(let k=0;k<4;k++){ const it=[...document.querySelectorAll('#choice.on .ch-it')].filter(e=>!e.classList.contains('lock')); if(!it.length) break; it[0].click(); await wait(700); } };
const S=__t.getS(); S.tuto={}; S.coins=500;
const shots=['build','royale','race','mc','beast','pirates'];
for(const g of Object.keys(__t.GAMES)){
  __t.startGame(g); await wait(1300); await pickAll();
  if(g==='mc'){ const b=[...document.querySelectorAll('#mcPanel button')].find(x=>/Survie/.test(x.textContent)); if(b) b.click(); }
  let n=0; while(!__t.TU.on&&n<70){ await wait(100); n++; if(n%10===0) await pickAll(); }
  const on=__t.TU.on, steps=on?__t.TU.steps.length:0;
  const t0=__t.getG().time; await wait(800); const t1=__t.getG().time;
  ok(on&&Math.abs(t1-t0)<0.01,g+' : tutoriel lancé ('+steps+' étapes), jeu en pause');
  if(on){
    // vérifier que chaque étape trouve sa cible
    const miss=__t.TU.steps.filter(s=>s.at&&typeof s.at==='string'&&!document.querySelector(s.at)).map(s=>s.at);
    ok(!miss.length,g+' : toutes les cibles existent'+(miss.length?' (manque '+miss.join(', ')+')':''));
    if(shots.includes(g)){ document.querySelector('#tuto').click(); await wait(1500); await window.__shot('tu_'+g); }
    document.querySelector('#tuto .tuSkip').click(); await wait(300);
    ok(!__t.TU.on&&S.tuto[g]===1&&__t.getPause()===0,g+' : « Passer » ferme le tutoriel et il ne revient plus');
  }
  __t.exitGame(); await wait(300);
}
// menu pause
__t.startGame('arena'); await wait(1500);
document.getElementById('bHome').click(); await wait(400);
const items=[...document.querySelectorAll('#choice.on .ch-it b')].map(b=>b.textContent);
ok(items.length===4&&__t.getPause()===1,'🏠 ouvre la pause : '+items.join(' / '));
await window.__shot('tu_pause');
[...document.querySelectorAll('#choice.on .ch-it')].find(b=>/tutoriel/.test(b.textContent)).click(); await wait(600);
ok(__t.TU.on,'« Revoir le tutoriel » le relance'); document.querySelector('#tuto .tuSkip').click(); await wait(300);
document.getElementById('bHome').click(); await wait(300); document.querySelectorAll('#choice.on .ch-it')[0].click(); await wait(300);
ok(__t.getPause()===0&&__t.getMode()==='game','« Continuer » reprend le jeu');
document.getElementById('bHome').click(); await wait(300); [...document.querySelectorAll('#choice.on .ch-it')].find(b=>/accueil/.test(b.textContent)).click(); await wait(500);
ok(__t.getMode()==='menu'&&__t.getPause()===0,'« Retour à l\'accueil » quitte le jeu');
__t.startGame('arena'); await wait(1500); localStorage.removeItem('blocsmahe-photos-v1'); document.getElementById('bHome').click(); await wait(300); [...document.querySelectorAll('#choice.on .ch-it')].find(b=>/photo/.test(b.textContent)).click(); await wait(600);
ok(JSON.parse(localStorage.getItem('blocsmahe-photos-v1')||'[]').length===1&&__t.getPause()===0,'📸 Prendre une photo depuis la pause'); __t.exitGame(); await wait(300);
// Bataille Royale : visée et tir automatiques
__t.startGame('royale'); await wait(1500); await pickAll(); await wait(500);
let G=__t.getG(); for(let k=0;k<40&&!G.pEnt.landed;k++){ __t.P.jumpBuf=0.2; await wait(400); }
ok(G.pEnt.landed,'royale : atterri');
await wait(600); const guide=document.getElementById('hud').classList.contains('guide')&&/Coffre|Zone/.test(document.getElementById('cDist').textContent);
ok(guide,'royale : la flèche guide vers '+document.getElementById('cDist').textContent);
G.inv[1]={w:'blaster',r:1}; G.renderHotbar();
let b=null; for(let k=0;k<60&&!b;k++){ b=G.bots.find(x=>x.alive&&x.team!==0&&x.landed&&x.y<3); if(!b) await wait(300); }
for(const o of G.bots) if(o!==b){ o.alive=false; if(o.A) o.A.root.visible=false; }
const d0=G.dealt;
for(let k=0;k<12;k++){ if(b.alive){ b.x=__t.P.x+Math.sin(__t.cam.yaw+Math.PI)*8; b.z=__t.P.z+Math.cos(__t.cam.yaw+Math.PI)*8; b.state='idle'; b.t=999; } await wait(250); }
ok(!!b&&G.lock&&G.lock.ref===b||!b.alive,'royale : l\'ennemi devant est verrouillé (cercle rouge)');
ok(G.sel===1,'royale : la meilleure arme est prise toute seule');
ok(G.dealt>d0,'royale : tir automatique ('+Math.round(G.dealt-d0)+' de dégâts)');
await window.__shot('tu_royale_visee');
__t.exitGame();
log.push(fails?'ÉCHECS : '+fails:'TOUT EST OK'); return log.join('\n');
