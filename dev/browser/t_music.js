const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), out=[];
document.getElementById('bMusic').click(); document.getElementById('bMusic').click(); await wait(300);
out.push('menu:'+T.BGM.id+' ctx:'+(T.getAC()&&T.getAC().state));
for(const id of ['obby','arena','brainrot']){ T.startGame(id); await wait(1500); out.push(id+':'+T.BGM.id+' gain:'+(T.BGM.g?T.BGM.g.gain.value.toFixed(2):'aucun')); if(id==='arena') await __shot('intro_arena_late'); T.exitGame(); await wait(200); }
T.startGame('island'); await wait(450); await __shot('intro_island'); T.exitGame();
out.push('retour:'+T.BGM.id);
return out.join(' | ');
