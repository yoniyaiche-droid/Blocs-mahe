const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
window.addEventListener('error',e=>log.push('window.error: '+e.message+' @'+e.lineno));
const P=T.P, cam=T.cam;
T.startGame('royale'); await wait(1500);
let G=T.getG(); await window.__shot('r1_choix');
G.setMode('duo'); await wait(2500); await window.__shot('r2_montgolfiere');
P.jumpBuf=0.2; let n=0; while(!G.pEnt.landed&&n<200){ await wait(100); n++; }
log.push('atterri '+G.pEnt.landed+' allié '+(G.ally&&G.ally.landed));
G.bots.forEach(b=>{ if(b.alive&&!b.ally){ b.x=60; b.z=60; b.think=999; b.tgt=null; b.loot=null; b.roam=[b.x,b.z]; } });
// vue de la fontaine et d'un champignon
P.x=6; P.z=8; P.y=0; P.vx=P.vy=P.vz=0; cam.yaw=Math.atan2(6,8); cam.pitch=0.25; cam.dist=9; await wait(1200); await window.__shot('r3_fontaine');
// kart
const k=G.karts[0]; P.x=k.x+1.2; P.z=k.z; P.y=0; await wait(600); await window.__shot('r4_pres_kart');
G.toggleKart(); cam.yaw=k.yaw+Math.PI; await wait(400); T.joy.y=1; await wait(1200); T.joy.y=0; await wait(300); await window.__shot('r5_en_kart');
log.push('kart vitesse ok, en kart='+!!G.kart); G.toggleKart();
// champignon puis vol plané
const pd=G.pads[0]; P.x=pd.x; P.z=pd.z; P.y=0; P.vy=0; cam.yaw=Math.atan2(pd.x,pd.z)+Math.PI; cam.pitch=0.3; await wait(1100); await window.__shot('r6_plane');
log.push('plané glide='+G.glide+' fall='+P.fall+' y='+P.y.toFixed(1));
let m=0; while(!P.onGround&&m<80){ await wait(100); m++; }
// phare et moulin
P.x=-50; P.z=50; P.y=0; cam.yaw=Math.atan2(50-62, -50+62)+Math.PI; cam.yaw=Math.atan2(P.x+62,P.z-62); cam.pitch=0.12; cam.dist=10; await wait(1200); await window.__shot('r7_phare');
P.x=48; P.z=-46; P.y=0; cam.yaw=Math.atan2(P.x-60,P.z+58); await wait(1200); await window.__shot('r8_moulin');
// ravitaillement + combat (chiffres de dégâts)
G.spawnDrop(); const d=G.drops[G.drops.length-1]; P.x=d.x+8; P.z=d.z+8; P.y=0; cam.yaw=Math.atan2(8,8); cam.pitch=-0.05; cam.dist=7; await wait(2500); await window.__shot('r9_ravitaillement');
const sp=[d.x+8,d.z+8]; cam.pitch=0.18; cam.dist=5.5;
const tb=G.bots.find(b=>b.alive&&!b.ally); tb.x=P.x; tb.z=P.z-8; tb.y=0; tb.hp=100; tb.sh=60; tb.think=999; tb.roam=[tb.x,tb.z]; cam.yaw=0;
G.inv[1]={w:'shotgun',r:3}; G.inv[2]={w:'grenade',r:1,n:3}; G.inv[3]={w:'grapple',r:1,n:4}; G.select(1); await wait(500);
for(let i=0;i<3;i++){ G.fireCd=0; G.tryFire(); await wait(250); tb.x=P.x; tb.z=P.z-8; }
await wait(80); await window.__shot('r10_degats');
log.push('bot pv='+Math.round(tb.hp)+' sh='+Math.round(tb.sh)+' murs='+G.pieces.length+' nombres='+document.getElementById('dmgNums').children.length);
// fin de partie : victoire
G.bots.forEach(b=>{ if(b.alive&&!b.ally) G.dmgEnt(b,999,G.pEnt); });
await wait(2500); await window.__shot('r11_victoire');
log.push('fin over='+G.over+' résultat='+document.getElementById('result').classList.contains('on'));
T.exitGame(); await wait(500);
return log.join('\n');
