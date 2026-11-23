const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), S=T.getS(), log=[];
window.addEventListener('error',e=>log.push('ERR '+e.message+' @'+e.lineno));
for(let w=0;w<4;w++){ S.ob.w=w; S.ob.done=[true,true,true,false]; T.startGame('obby'); await wait(500); if(w===0) await __shot('L_intro'); document.getElementById('choice').classList.remove('on'); T.getG().choiceOpen=false; await wait(2600); T.joy.y=1; await wait(700); T.joy.y=0; await wait(300); await __shot('L_obby'+w); T.exitGame(); await wait(200); }
S.ob.w=0;
T.startGame('arena'); let G=T.getG(); await wait(3000); G.wave=6; G.breakT=0; G.toSpawn=0; ['king','split','spit','bomb','green','blue'].forEach(t=>G.spawnSlime(t)); G.drop('fire',T.P.x+2,T.P.z); await wait(1500); await __shot('L_arena'); G.offerUpgrade(); await wait(300); await __shot('L_arena_up'); T.exitGame(); await wait(200);
T.startGame('island'); await wait(3200); T.joy.y=1; await wait(800); T.joy.y=0; await __shot('L_island'); G=T.getG(); G.time=G.limit*0.92; await wait(500); await __shot('L_island_sunset'); T.exitGame(); await wait(200);
for(let e=0;e<4;e++){ S.buildEnv=e; T.startGame('build'); await wait(3000); await __shot('L_build'+e); T.exitGame(); await wait(200); }
S.buildEnv=0;
T.startGame('eggs'); await wait(3200); T.joy.y=1; await wait(1000); T.joy.y=0; await __shot('L_eggs'); T.exitGame(); await wait(200);
T.startGame('brainrot'); G=T.getG(); await wait(3200); G.disco=20; await wait(800); await __shot('L_br'); G.openDex(); await wait(300); await __shot('L_br_dex'); T.exitGame(); await wait(200);
return log.join('\n')||'ok';
