const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
const S=T.getS(); S.gfx='high'; T.gfxApply(); S.beast.team=[]; S.coins=200;
T.startGame('beast'); await wait(1000); let G=T.getG();
document.querySelectorAll('#choice .ch-it')[0].click(); await wait(600); document.querySelectorAll('#choice .ch-it')[2].click(); await wait(1600);
const P_=T.P, cam=T.cam; for(const o of G.roam){ o.gone=999; o.m.visible=false; }
const show=(zn,n)=>{ G.roam.filter(o=>o.z.n===zn).slice(0,n).forEach((o,i)=>{ o.gone=0; o.m.visible=true; o.x=o.z.x+(i-1)*2.4; o.zz=o.z.z+6; o.tx=o.x; o.tz=o.zz; }); };
show('Prairie',4); P_.x=30; P_.z=14; cam.yaw=0; cam.pitch=0.32; cam.dist=8; await wait(1200); await window.__shot('c1_prairie');
P_.x=0; P_.z=7; cam.yaw=0.3; cam.pitch=0.4; await wait(900); await window.__shot('c2_village');
for(const o of G.roam){ o.gone=999; o.m.visible=false; }
G.startBattle([T.bsNew('zeclair',6)],false); await wait(2600); await window.__shot('c3_combat');
document.querySelector('[data-k="m1"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); await wait(1100); await window.__shot('c4_attaque');
let n=0; while(G.inB&&G.inB.state!=='choose'&&n<80){ await wait(100); n++; }
G.foe().hp=1; document.querySelector('[data-k="jar"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); await wait(1500); await window.__shot('c5_bocal');
n=0; while(G.inB&&n<80){ await wait(100); n++; } await wait(400); G.dexMenu(); await wait(500); await window.__shot('c6_album');
log.push('équipe '+S.beast.team.map(c=>c.s+' '+c.lv).join(', '));
T.exitGame(); return log.join('\n');
