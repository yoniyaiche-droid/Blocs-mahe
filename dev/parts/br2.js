/* =========================================================
   17. Brainrot Bazar : marché de nuit aux néons, mutations,
       fête disco, pluie de billets et album
   ========================================================= */
const BRMUT={gold:{n:'Or',ic:'🥇',x:2,c:'#ffd23f',p:0.07},dia:{n:'Diamant',ic:'💎',x:4,c:'#5ffbf1',p:0.025},rain:{n:'Arc-en-ciel',ic:'🌈',x:8,c:'#ff6bd6',p:0.008}};
function rollMut(){ const r=Math.random(); if(r<BRMUT.rain.p) return 'rain'; if(r<BRMUT.rain.p+BRMUT.dia.p) return 'dia'; if(r<BRMUT.rain.p+BRMUT.dia.p+BRMUT.gold.p) return 'gold'; return null; }
function mutDeco(m,mut,sc){
  const M=BRMUT[mut]; if(!M) return null; const g=new THREE.Group();
  const rm=new THREE.MeshBasicMaterial({color:M.c,transparent:true,opacity:0.55,depthWrite:false}); rm.userData.own=true;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.06,6,28),rm); ring.geometry.userData.own=true; ring.rotation.x=Math.PI/2; ring.position.y=0.15; g.add(ring);
  const hm=new THREE.MeshBasicMaterial({color:M.c,transparent:true,opacity:0.12,depthWrite:false}); hm.userData.own=true;
  const halo=new THREE.Mesh(sph(1.1),hm); halo.position.y=1.1; g.add(halo); m.add(g); g.userData={rm,hm,mut,ring}; return g;
}
{ const R=GAMES.brainrot, st=R.start;
  R.start=function(){
    const muts=(S.br.muts||[]).slice();
    st.call(this); const sc=this.scene;
    addSky(this,{top:'#0a0620',mid:'#2a1458',bot:'#c2408a',stars:500,moon:{u:0.8,el:44,r:14,c:'#ffe9ff'},skyline:{c:'#140c2a',win:['#ffd23f','#ff4fd8','#2bffd5','#8fd0ff']},near:50,far:150});
    setLights(this,{hemi:['#d8b8ff','#2a1838',0.62],sun:['#ffb8e8',0.5],dir:[10,30,-14]});
    for(const b of this.solids){ if(b.y0===-1&&b.y1===0){ const om=b.m.material; b.m.material=texMat('asphalt','#ffffff',34,24); if(om&&om.userData&&om.userData.own){ if(om.map) om.map.dispose(); om.dispose(); } } }
    // lampadaires néon
    const neon=['#ff4fd8','#2bffd5','#ffd23f','#8f7cff'];
    this.lamps=[];
    [[-24,-4],[-8,-4],[8,-4],[24,-4],[-24,4],[-8,4],[8,4],[24,4]].forEach(([x,z],i)=>{ const post=mk(box(0.25,4.2,0.25),lam('#2a2740')); post.position.set(x,2.1,z); sc.add(post);
      const arm=mk(box(1.2,0.15,0.15),lam('#2a2740')); arm.position.set(x+(z<0?0:0),4.2,z+(z<0?0.5:-0.5)); arm.rotation.y=Math.PI/2; sc.add(arm);
      const bulb=mk(sph(0.32),new THREE.MeshBasicMaterial({color:neon[i%4]}),false); bulb.material.userData.own=true; bulb.position.set(x,4.05,z+(z<0?1:-1)); sc.add(bulb); this.lamps.push(bulb);
      if(i%4===0){ const pl=new THREE.PointLight(neon[i%4],1.1,18,1.8); pl.position.copy(bulb.position); sc.add(pl); } });
    const sign=textSprite(512,128,2.2); setSprite(sign,'✨ BRAINROT BAZAR ✨','rgba(20,10,40,.85)','#ff8ff0'); sign.position.set(0,7.5,-24); sc.add(sign);
    const sign2=textSprite(512,128,1.6); setSprite(sign2,'🪩 Marché de nuit','rgba(20,10,40,.85)','#2bffd5'); sign2.position.set(0,6.2,24); sc.add(sign2);
    addAmb(this,{kind:'rise',color:'#ff8ff0',size:0.14,n:120,glow:true,rel:true});
    // disco
    this.disco=0; this.rain=0; this.evT=rand(45,70); this.bills=[]; this.spots=[];
    const cols=['#ff4fd8','#2bffd5','#ffd23f'];
    for(let i=0;i<3;i++){ const L=new THREE.SpotLight(cols[i],0,60,0.35,0.6,1); L.position.set(0,18,0); sc.add(L); sc.add(L.target); this.spots.push(L); }
    const ball=new THREE.Mesh(sph(1.2),matC('disco',()=>new THREE.MeshPhongMaterial({color:'#e8eef7',emissive:'#334455',specular:'#ffffff',shininess:120,flatShading:true}))); ball.position.set(0,16,0); ball.visible=false; sc.add(ball); this.dball=ball;
    // mutations rechargées
    this.home.slots.forEach((s,i)=>{ if(s.id&&BRMUT[muts[i]]) this.setMut(this.home,s,muts[i]); });
    for(const s of this.home.slots) if(s.id) this.dex(s.id);
    this.persistSoon();
    this.introS='Achète, vole et collectionne les brainrots les plus rares !';
  };
  R.dex=function(id){ if(!S.br.dex) S.br.dex=[]; if(S.br.dex.indexOf(id)<0){ S.br.dex.push(id); saveSoon(); if(this.time>1) banner('📖 Nouveau dans ton album : '+BR_BY_ID[id].n+' !'); } };
  R.setMut=function(B,s,mut){ s.mut=mut||null; if(s.deco){ if(s.mesh) s.mesh.remove(s.deco); s.deco=null; }
    if(!mut||!s.mesh) return; const d=BR_BY_ID[s.id], M=BRMUT[mut]; s.deco=mutDeco(s.mesh,mut);
    label2(s.lbl,M.ic+' '+d.n,M.n+' ×'+M.x+' · +'+fmtCash(d.inc*M.x)+'/s',M.c); };
  const sw=R.spawnWalker; R.spawnWalker=function(x,quiet){ const w=sw.call(this,x,quiet); const mut=rollMut();
    if(mut){ const M=BRMUT[mut], d=w.d; w.d=Object.assign({},d,{price:d.price*M.x,inc:d.inc*M.x,mut}); w.mut=mut; w.deco=mutDeco(w.m,mut);
      label2(w.lbl,M.ic+' '+d.n,M.n+' · 💵'+fmtCash(w.d.price)+' · +'+fmtCash(w.d.inc)+'/s',M.c);
      if(!quiet&&mut!=='gold'){ banner(M.ic+' Un brainrot '+M.n+' arrive sur le tapis !'); sfx('gem'); } }
    return w; };
  const by=R.buy; R.buy=function(who,w){ const mut=w.mut, ok=by.call(this,who,w); if(ok&&mut){ const mv=this.movers[this.movers.length-1]; if(mv&&mv.s) mv.s.mutNext=mut; } return ok; };
  const pb=R.placeBR; R.placeBR=function(B,s,id){ const mut=s.mutNext||this._mutNext||null; s.mutNext=null; pb.call(this,B,s,id); s.deco=null; if(mut) this.setMut(B,s,mut); else s.mut=null; if(B===this.home){ this.dex(id); this.persistSoon(); } };
  const cs=R.clearSlot; R.clearSlot=function(B,s){ s.lastMut=s.mut||null; s.mut=null; s.deco=null; cs.call(this,B,s); };
  const pk=R.pickup; R.pickup=function(who,id,origin){ pk.call(this,who,id,origin); if(who.carry) who.carry.mut=origin&&origin.slot?origin.slot.lastMut:null; if(who.carry&&who.carry.mut&&who.cm) mutDeco(who.cm,who.carry.mut); };
  const dl=R.deliver; R.deliver=function(who,B){ this._mutNext=who.carry&&who.carry.mut||null; try{ return dl.call(this,who,B); } finally{ this._mutNext=null; } };
  const dr=R.drop; R.drop=function(who){ this._mutNext=who.carry&&who.carry.mut||null; try{ return dr.call(this,who); } finally{ this._mutNext=null; } };
  const ps=R.persistSoon; R.persistSoon=function(){ ps.call(this); S.br.muts=this.home.slots.map(s=>s.id&&s.mut?s.mut:null); };
  const up=R.update; R.update=function(dt){
    up.call(this,dt); const t=this.time, sc=this.scene;
    let extra=0; for(const s of this.home.slots) if(s.id&&s.ready){ const inc=BR_BY_ID[s.id].inc, x=s.mut?BRMUT[s.mut].x:1; extra+=inc*(x-1)+(this.disco>0?inc*x:0); }
    S.br.bank+=extra*dt; this.inc+=extra;
    // anneaux qui tournent et arc-en-ciel animé
    const deco=[]; for(const B of this.bases) for(const s of B.slots) if(s.deco) deco.push(s.deco); for(const w of this.walkers) if(w.deco) deco.push(w.deco);
    for(const g of deco){ g.userData.ring.rotation.z+=dt*2; if(g.userData.mut==='rain'){ const c=new THREE.Color().setHSL((t*0.3)%1,0.9,0.6); g.userData.rm.color.copy(c); g.userData.hm.color.copy(c); } g.userData.hm.opacity=0.1+Math.sin(t*3)*0.05; }
    this.lamps.forEach((b,i)=>{ b.scale.setScalar(1+Math.sin(t*4+i)*0.08); });
    if(this.belt&&this.belt.map) this.belt.map.offset.x-=dt*2.2/2;
    // événements
    if(this.disco<=0&&this.rain<=0){ this.evT-=dt; if(this.evT<=0){ this.evT=rand(100,140);
        if(Math.random()<0.5){ this.disco=30; banner('🪩 FÊTE DISCO ! Tes brainrots rapportent ×2 pendant 30 s'); sfx('win'); }
        else { this.rain=20; banner('💸 Pluie de billets ! Ramasse-les vite !'); sfx('win'); } } }
    if(this.disco>0){ this.disco-=dt; this.dball.visible=true; this.dball.rotation.y+=dt*1.5;
      this.spots.forEach((L,i)=>{ L.intensity=2.2; const a=t*1.4+i*TAU/3; L.target.position.set(Math.cos(a)*14,0,Math.sin(a*1.3)*10); });
      if(Math.random()<dt*8) burst(sc,rand(-20,20),rand(3,8),rand(-14,14),['#ff4fd8','#2bffd5','#ffd23f'][Math.floor(Math.random()*3)],2,2,true);
      if(this.disco<=0){ this.spots.forEach(L=>L.intensity=0); this.dball.visible=false; banner('La fête est finie 🪩'); } }
    if(this.rain>0){ this.rain-=dt; if(Math.random()<dt*5){ const b=textSprite(96,96,0.9); setSprite(b,'💵','rgba(0,0,0,0)'); const x=rand(-30,30), z=rand(-21,21); b.position.set(x,14,z); sc.add(b); this.bills.push({b,x,z,y:14,t:14}); } }
    for(let i=this.bills.length-1;i>=0;i--){ const q=this.bills[i]; q.t-=dt; q.y=Math.max(0.6,q.y-dt*5); q.b.position.set(q.x+Math.sin(t*3+i)*0.3,q.y+(q.y<=0.6?Math.abs(Math.sin(t*4+i))*0.15:0),q.z);
      if(q.y<=0.7&&Math.hypot(P.x-q.x,P.z-q.z)<1.3){ const v=Math.max(25,Math.floor(this.inc*4)); S.br.cash+=v; sfx('coin'); burst(sc,q.x,1,q.z,'#7dff7a',8,3); sc.remove(q.b); this.bills.splice(i,1); }
      else if(q.t<=0){ sc.remove(q.b); this.bills.splice(i,1); } }
  };
  R.openDex=function(){ const dex=S.br.dex||[]; openChoice({title:'📖 Album des brainrots ('+dex.length+'/'+BRAINROTS.length+')',sub:'Les brainrots que tu as déjà eus dans ta base. Mutations : 🥇 Or ×2 · 💎 Diamant ×4 · 🌈 Arc-en-ciel ×8',wide:true,
    items:BRAINROTS.map(b=>{ const has=dex.indexOf(b.id)>=0; return {ic:has?'🧠':'❓',t:has?b.n:'???',d:BRR[b.r].n+(has?' · +'+fmtCash(b.inc)+'/s':''),bg:has?BRR[b.r].c+'55':'',cb:()=>{}}; })}); };
}
$('bDex').addEventListener('click',()=>{ if(G&&G.id==='brainrot'){ sfx('click'); G.openDex(); } });
