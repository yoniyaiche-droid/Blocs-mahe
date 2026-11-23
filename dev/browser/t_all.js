const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
const err=(w,e)=>log.push(w+' → '+(e&&e.stack?e.stack.split('\n').slice(0,3).join(' | '):e));
window.addEventListener('error',e=>log.push('window.error: '+e.message+' @'+e.lineno));
const ids=Object.keys(T.GAMES);
log.push('jeux: '+ids.join(','));
for(const id of ids){
  try{ T.startGame(id); }catch(e){ err('start '+id,e); continue; }
  await wait(600);
  try{ T.joy.y=1; await wait(700); T.joy.y=0; T.joy.x=1; await wait(300); T.joy.x=0; const G=T.getG(); if(G&&G.onAction) G.onAction(); await wait(300); }catch(e){ err('jeu '+id,e); }
  const G=T.getG(); log.push(id+': '+(G?'ok t='+(G.time||0).toFixed(1):'pas de jeu'));
  try{ T.exitGame(); }catch(e){ err('exit '+id,e); }
  await wait(300);
}
return log.join('\n');
