const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
window.addEventListener('error',e=>log.push('erreur: '+e.message+' @'+e.lineno));
const S=T.getS(); S.gfx='high'; T.gfxApply(); S.plat.lv=3;
for(let w=0;w<4;w++){
  T.startGame('plat'); await wait(1200); let G=T.getG(); if(w===0) await window.__shot('p0_heros');
  document.querySelectorAll('#choice .ch-it')[w%3].click(); await wait(700); if(w===0) await window.__shot('p0_mondes');
  document.querySelectorAll('#choice .ch-it')[w].click(); await wait(1500);
  T.joy.x=1; await wait(w===2?2600:1500); T.joy.x=0; await wait(300); await window.__shot('p'+(w+1)+'_monde');
  if(w===0){ const b=Object.values(G.boxes).find(b=>b.ch==='P'); const P_=T.P; P_.x=b.m.position.x; P_.y=b.y-2.2; P_.vy=9; await wait(600); await window.__shot('p1_bonus'); }
  if(w===3){ const P_=T.P; P_.x=G.goal.x-0.5; P_.y=G.goal.y; await wait(1500); await window.__shot('p4_arrivee'); }
  T.exitGame(); await wait(300);
}
return log.join('\n')||'ok';
