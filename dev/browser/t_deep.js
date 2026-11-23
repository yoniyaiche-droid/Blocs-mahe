const T=window.__t, wait=ms=>new Promise(r=>setTimeout(r,ms)), log=[];
const err=(w,e)=>log.push('✘ '+w+' → '+(e&&e.stack?e.stack.split('\n').slice(0,3).join(' | '):e));
window.addEventListener('error',e=>log.push('✘ window.error: '+e.message+' @'+e.lineno));
const step=async(n,f)=>{ try{ await f(); log.push('✔ '+n); }catch(e){ err(n,e); } };
// ---- PIRATES
T.startGame('pirates'); await wait(800); let G=T.getG(); await __shot('p1');
for(const f of Object.keys(T.FRUITS)) await step('fruit '+f,async()=>{ G.owned.add(f); G.eat(f); await wait(400); G.pcd=0; G.power(); await wait(700); if(f==='fire') await __shot('p_fire'); if(f==='cat') await __shot('p_cat'); if(f==='drag') await __shot('p_drag'); if(f==='giant') await __shot('p_giant'); });
await step('forme normale',async()=>{ G.setForm(null); await wait(300); });
await step('panneau fruits',async()=>{ G.openPanel('fruits'); await wait(300); await __shot('p_fruits'); G.closePanel(); });
await step('boutique',async()=>{ G.openPanel('shop'); await wait(200); await __shot('p_shop'); G.closePanel(); });
await step('bateau',async()=>{ const ta=Math.atan2(G.isl[1].z,G.isl[1].x); let e=null; for(let r=2;r<45;r++){ const x=Math.cos(ta)*r,z=Math.sin(ta)*r; if(G.hgt(x,z)<=0){ e=[Math.cos(ta)*(r-1.5),Math.sin(ta)*(r-1.5)]; break; } } T.P.x=e[0]; T.P.z=e[1]; T.P.y=G.hgt(e[0],e[1]); await wait(300); G.summonBoat(); if(!G.sail) throw 'pas de bateau'; T.joy.y=1; await wait(1500); T.joy.y=0; await __shot('p_boat'); G.disembark(); });
await step('épée',async()=>{ G.acd=0; G.slash(); await wait(300); });
await step('boss',async()=>{ const b=G.enemies.find(e=>e.kind==='boss'); T.P.x=b.x; T.P.z=b.z-6; T.P.y=G.hgt(T.P.x,T.P.z)+0.1; T.P.yaw=0; await wait(800); await __shot('p_boss'); });
T.exitGame(); await wait(300);
// ---- MINECRAFT
T.startGame('mc'); await wait(1500); G=T.getG(); await __shot('m1');
await step('armes',async()=>{ for(const id of [150,151,152,153,154]){ G.inv[id]=1; G.hot[G.sel]=id; G.wcd=0; G.onAction(); await wait(400); } await __shot('m_weap'); });
await step('boutique mc',async()=>{ G.openPanel('shop'); await wait(300); await __shot('m_shop'); G.closePanel&&G.closePanel(); });
await step('missions',async()=>{ G.openPanel('missions'); await wait(300); await __shot('m_miss'); G.closePanel&&G.closePanel(); });
await step('alliés',async()=>{ T.getS().mc.cash=999; for(const k of Object.keys(T.ALLY)) G.hireAlly(k); await wait(500); G.spawnWave&&G.spawnWave(); await wait(1500); await __shot('m_ally'); });
await step('fusée',async()=>{ const v=G.addVehicle('rocket','#f4f4f4',T.P.x+3,T.P.y,T.P.z,0); if(!v) throw 'addVehicle absent'; G.enterVehicle(v); await wait(300); G.onAction(); await wait(3500); T.inp.jumpHeld=true; T.keys.add('Space'); await wait(3000); T.keys.delete('Space'); await __shot('m_rocket'); log.push('  altitude '+T.P.y.toFixed(0)); });
try{T.exitGame();}catch(e){err('exit mc',e);} await wait(300);
return log.join('\n');
