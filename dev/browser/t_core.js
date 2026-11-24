const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
const S=T.getS(); S.gfx='high'; T.gfxApply(); await wait(800);
log.push('post='+(T.GFX.post?('ok msaa='+T.GFX.post.msaa):String(T.GFX.post))+' niveau='+T.GFX.lv);
S.avatar=Object.assign({},T.HEROES.find(h=>h.id==='rako').av); document.querySelector('[data-tab="shop"]').click(); await wait(600); await window.__shot('c1_boutique');
document.querySelector('[data-tab="play"]').click();
for(const id of ['tibo','ines','zelie','comete']){ S.avatar=Object.assign({},T.HEROES.find(h=>h.id===id).av); document.querySelector('[data-tab="avatar"]').click(); await wait(500); await window.__shot('c2_'+id); }
T.startGame('brainrot'); await wait(2500); await window.__shot('c3_brainrot_haute');
S.gfx='low'; T.gfxApply(); await wait(1200); await window.__shot('c4_brainrot_basse');
S.gfx='high'; T.gfxApply(); T.exitGame(); await wait(300);
T.startGame('obby'); await wait(2500); await window.__shot('c5_obby_haute'); T.exitGame();
return log.join('\n');
