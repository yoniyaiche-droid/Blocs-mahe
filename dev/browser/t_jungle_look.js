const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
window.addEventListener('error',e=>log.push('erreur: '+e.message+' @'+e.lineno));
const S=T.getS(); S.gfx='high'; T.gfxApply(); S.jungle.lv=2;
for(let li=0;li<3;li++){
  T.startGame('jungle'); await wait(1000); let G=T.getG();
  document.querySelectorAll('#choice .ch-it')[li].click(); await wait(600); if(li===0) await window.__shot('j0_niveaux');
  document.querySelectorAll('#choice .ch-it')[li].click(); await wait(1500);
  T.joy.y=1; await wait(1300); T.joy.y=0; await wait(300); await window.__shot('j'+(li+1)+'_a');
  if(li===0){ const c=G.crates.find(c=>c.k==='l'); const P_=T.P; P_.x=c.x; P_.z=c.z+1.6; P_.y=0; await wait(300); G.doSpin(); await wait(250); await window.__shot('j1_toupie'); }
  if(li===1){ const P_=T.P; const w=G.rows.findIndex(r=>r.indexOf('n')>=0); P_.x=0; P_.z=-(w-1)*1.5; P_.y=0; await wait(800); await window.__shot('j2_riviere'); }
  if(li===2){ const P_=T.P; const sw=G.swings[0]; P_.x=0; P_.z=sw.z+4; P_.y=0; await wait(900); await window.__shot('j3_balancier'); P_.x=G.goal.x; P_.z=G.goal.z+3; await wait(800); await window.__shot('j3_arrivee'); }
  T.exitGame(); await wait(300);
}
return log.join('\n')||'ok';
