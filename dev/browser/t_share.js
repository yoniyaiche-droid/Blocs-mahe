const wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
await wait(800);
try{ Object.defineProperty(navigator,'share',{value:undefined,configurable:true}); }catch(e){}
document.getElementById('bShare').click(); await wait(600); await window.__shot('s2_menu');
const c=document.getElementById('choice'); log.push('menu visible: '+(getComputedStyle(c).display)+' parent='+c.parentNode.id+'|'+c.parentNode.tagName);
const it=[...document.querySelectorAll('#choice .ch-it')]; it[3].click(); await wait(500); await window.__shot('s3_copie');
log.push('après copie parent='+(c.parentNode.id||c.parentNode.tagName)+' toast='+document.getElementById('toast').textContent);
document.getElementById('bShare').click(); await wait(300); document.querySelector('#choice .ch-h .iconbtn').click(); await wait(300);
log.push('après ✖ parent='+(c.parentNode.id||c.parentNode.tagName)+' display='+getComputedStyle(c).display);
// partage natif simulé
let got=null; Object.defineProperty(navigator,'share',{value:async d=>{ got=d; },configurable:true});
document.getElementById('bShare').click(); await wait(300); log.push('partage natif: '+JSON.stringify(got));
window.__t.startGame('beast'); await wait(1200); log.push('choix en jeu visible: '+getComputedStyle(c).display+' parent='+c.parentNode.id); window.__t.exitGame();
return log.join('\n');
