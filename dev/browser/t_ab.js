const wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
const pickAll=async()=>{ for(let k=0;k<4;k++){ const it=[...document.querySelectorAll('#choice.on .ch-it')].filter(e=>!e.classList.contains('lock')); if(!it.length) break; it[0].click(); await wait(700); } };
const set=(on)=>{ const Q=__t.getGFX().post; if(Q&&Q.comp){ Q.comp.uniforms.film.value=on?0.55:0; Q.comp.uniforms.shp.value=on?0.16:0; } const g=__t.getG(); if(g&&g.skyDome&&g.skyDome.userData.sunSp) g.skyDome.userData.sunSp.visible=on; };
for(const g of ['island','obby','royale','race','plat','arena']){
  __t.startGame(g); await wait(1300); await pickAll(); await wait(1500);
  __t.cam.yaw=Math.atan2(14,10)+Math.PI*0.95; __t.cam.pitch=0.12; await wait(500);
  set(false); await wait(250); await window.__shot('ab_'+g+'_0'); set(true); await wait(250); await window.__shot('ab_'+g+'_1');
  log.push(g+' soleil:'+!!(__t.getG().skyDome&&__t.getG().skyDome.userData.sunSp));
  __t.exitGame(); await wait(300);
}
return log.join('\n');
