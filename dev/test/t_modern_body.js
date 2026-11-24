
const SS=T.getS();
console.log('PARCOURS : 4 MONDES');
function reach(G,w){
  const g=30*T.OBW[w].grav, v=11, sp=6.5;
  const plats=G.solids.filter(b=>{ const q=b.b0||[b.x0,b.x1,b.y0,b.y1,b.z0,b.z1]; return b.m&&q[3]-q[2]<1.3&&q[3]>-0.5; }).map(b=>{ const q=b.b0||[b.x0,b.x1,b.y0,b.y1,b.z0,b.z1]; let r={x0:q[0],x1:q[1],z0:q[4],z1:q[5],top:q[3],b};
    if(b.mv){ const a=b.mv.amp; if(b.mv.ax==='x'){ r.x0-=a; r.x1+=a; } else if(b.mv.ax==='z'){ r.z0-=a; r.z1+=a; } else r.top+=a*0.5; } return r; });
  const start=plats.find(p=>p.b.cp===0), fin=plats.find(p=>p.b.finish);
  const gap=(A,B)=>Math.hypot(Math.max(0,A.x0-B.x1,B.x0-A.x1),Math.max(0,A.z0-B.z1,B.z0-A.z1));
  const can=(A,B)=>{ const vv=A.b.bounce||v, dy=B.top-A.top, peak=vv*vv/(2*g)-0.15; if(dy>peak) return false; const t=(vv+Math.sqrt(Math.max(0,vv*vv-2*g*dy)))/g; return gap(A,B)<=sp*t*0.8; };
  const seen=new Set([start]), q=[start]; while(q.length){ const A=q.shift(); for(const B of plats) if(!seen.has(B)&&can(A,B)){ seen.add(B); q.push(B); } }
  const stars=G.stars.map(s=>[...seen].some(p=>s.x>p.x0-1.3&&s.x<p.x1+1.3&&s.z>p.z0-1.3&&s.z<p.z1+1.3&&s.y-(p.top+0.9)>=-1&&s.y-(p.top+0.9)<=v*v/(2*g)+1.2));
  return {ok:seen.has(fin),n:seen.size,tot:plats.length,stars};
}
for(let w=0;w<4;w++){
  SS.ob.w=w; T.startGame('obby'); let G=T.getG(); frames(30);
  check(G.w===w&&P.onGround&&Math.abs(P.y-G.cps[0].y)<0.05,'monde '+(w+1)+' '+T.OBW[w].n+' : départ au sol');
  const r=reach(G,w);
  check(r.ok,'monde '+(w+1)+' : le trophée est atteignable en sautant ('+r.n+'/'+r.tot+' plateformes accessibles)');
  check(r.stars.length===3&&r.stars.every(Boolean),'monde '+(w+1)+' : les 3 étoiles sont atteignables ('+r.stars.join(',')+')');
  if(w===1){ // plateforme qui tombe + jet de feu
    const f=G.fallers[0]; place((f.x0+f.x1)/2,f.y1,(f.z0+f.z1)/2); frames(2); check(P.ground===f&&f.fs===1,'Volcan : la plateforme tremble quand on marche dessus');
    frames(50); check(f.fs>=2&&f.y1<f.b0[3]-0.2,'Volcan : puis elle tombe'); frames(400); check(f.fs===0&&Math.abs(f.y1-f.b0[3])<1e-6,'Volcan : elle réapparaît');
    const j=G.jets[0]; let died=false; const d0=G.deaths; for(let i=0;i<400&&!died;i++){ place(j.x,j.top,j.z); frames(1); died=G.deaths>d0; } check(died,'Volcan : le jet de feu fait tomber');
  }
  if(w===2){ const ic=G.solids.find(b=>b.ice); place((ic.x0+ic.x1)/2,ic.y1,(ic.z0+ic.z1)/2); frames(3); P.vx=6; P.vz=0; T.joy.x=0; T.joy.y=0; frames(10);
    const vIce=Math.abs(P.vx); place(0,0,1.5); frames(3); P.vx=6; frames(10); const vSnow=Math.abs(P.vx); check(vIce>vSnow*3&&vIce>1,'Glace : on glisse sur la glace ('+vIce.toFixed(2)+' contre '+vSnow.toFixed(2)+')');
    const bl=G.blinks[0]; let on=0, off=0; for(let i=0;i<240;i++){ frames(1); if(bl.off) off++; else on++; } check(on>0&&off>0,'Glace : les plateformes clignotent ('+on+'/'+off+')');
    const cv=G.convs[0]; place((cv.x0+cv.x1)/2,cv.y1,(cv.z0+cv.z1)/2); frames(3); const z0=P.z; frames(30); check(P.z-z0>0.8,'Glace : le tapis roulant pousse ('+(P.z-z0).toFixed(2)+')');
    const sp=G.spins[0]; let died=false; const d0=G.deaths; for(let i=0;i<300&&!died;i++){ place(sp.x+1.5,sp.y-0.4,sp.z); frames(1); died=G.deaths>d0; } check(died,'Glace : la barre qui tourne fait tomber');
  }
  if(w===3){ check(Math.abs(G.grav-0.45)<1e-9,'Espace : gravité faible'); place(0,0,1.5); frames(3); P.jumpBuf=0.2; let mx=0; for(let i=0;i<120;i++){ frames(1); mx=Math.max(mx,P.y); } check(mx>3.5,'Espace : on saute très haut ('+mx.toFixed(1)+')'); }
  // étoile
  const s=G.stars[0], had=(SS.ob.st[w]|0)&1; place(s.x,s.y-0.9,s.z); frames(2); check(G.got===1&&((SS.ob.st[w]|0)&1)===1,'monde '+(w+1)+' : ramasser une étoile');
  // arrivée
  place(G.fin.x0+3,G.fin.y1,G.fin.z0+3); frames(3); check(G.over&&SS.ob.done[w],'monde '+(w+1)+' : le trophée termine le monde');
  T.exitGame();
}
check(SS.ob.best.every(t=>t>0),'meilleurs temps des 4 mondes enregistrés');
{ const gh=JSON.parse(lsData.get('blocsmahe-ghost-v1')||'{}'); check(Array.isArray(gh[3])&&gh[3].length>=8,'le fantôme du record est sauvegardé'); }
SS.ob.w=0; T.startGame('obby'); { const G=T.getG(); frames(5); check(!!G.ghost,'le fantôme apparaît à la partie suivante'); } T.exitGame();

console.log('ARÈNE');
T.startGame('arena'); { let G=T.getG(); frames(10); G.breakT=999;
  const sp=G.spawnSlime('split'); sp.born=1; frames(1); const n0=G.slimes.length; G.kill(sp); frames(1); check(G.slimes.filter(s=>!s.dead).length===n0-1+3,'le slime géant se divise en 3');
  G.slimes.forEach(s=>{ s.dead=true; G.scene.remove(s.g); }); G.slimes=[];
  const sp2=G.spawnSlime('spit'); sp2.born=1; sp2.x=P.x; sp2.z=P.z-10; sp2.shotT=0; frames(3); check(G.goos.length>=1,'le slime cracheur crache');
  const h0=G.hearts; P.inv=0; for(let i=0;i<200&&G.hearts===h0;i++){ frames(1); sp2.shotT=Math.max(sp2.shotT,5); }
  check(G.hearts<h0||G.goos.length===0,'la boule de bave touche ou s\'écrase');
  G.slimes.forEach(s=>{ s.dead=true; G.scene.remove(s.g); }); G.slimes=[]; G.hearts=5;
  const b=G.spawnSlime('bomb'), v=G.spawnSlime('green'); b.born=v.born=1; b.x=P.x+8; b.z=P.z; v.x=P.x+9; v.z=P.z; v.hp=2; b.hopT=99; v.hopT=99;
  G.explode(b,false); frames(2); check(b.dead&&(v.dead||v.hp<=0),'la bombe abîme les slimes autour');
  G.drop('fire',P.x+0.5,P.z); frames(2); check(G.pw.fire>0,'ramasser le bonus épée de feu');
  G.slimes.forEach(s=>{ s.dead=true; G.scene.remove(s.g); }); G.slimes=[]; G.wave=3; G.toSpawn=0; G.breakT=0;
  G.offerUpgrade(); check(G.choiceOpen&&G.offer.length===3,'3 améliorations proposées');
  for(let i=0;i<16*60;i++) frames(1); check(!G.choiceOpen&&Object.keys(G.up).length===1,'choix automatique au bout de 15 s ('+Object.keys(G.up)+')');
  G.up={}; G.maxH=5; G.hearts=5; G.applyUp({k:'heart',ic:'',t:''}); check(G.maxH===6&&G.hearts===6,'amélioration cœur : 6 cœurs');
} T.exitGame();

console.log('ÎLE');
T.startGame('island'); { const G=T.getG(); frames(10);
  check(G.xs.length===3&&G.crabs.length>=1,'3 trésors enfouis et des crabes ('+G.crabs.length+')');
  const x=G.xs[0], L=G.limit; place(x.x,x.y,x.z); frames(2); G.onAction(); check(x.dug&&G.trFound===1&&G.limit===L+20,'creuser la croix : trésor et +20 s');
  const c=G.crabs[0]; place(c.x,Math.max(1,G.hgt(c.x,c.z)),c.z); P.inv=0; frames(3); check(c.pinch>0,'un crabe pince');
} T.exitGame();

console.log('BÂTISSEUR');
SS.build=[]; SS.buildEnv=2; T.startGame('build'); { let G=T.getG(); frames(5);
  check(G.env===T.BENV[2],'ambiance Nuit chargée');
  const fakeBase=(x,z)=>[{object:G.base.m,point:{x,y:0,z},face:{normal:{x:0,y:1,z:0}}}];
  G.ray={setFromCamera(){},far:0,intersectObjects:()=>fakeBase(5.5,5.5)}; G.setMode('place'); G.onTap(0,0,0); check(G.blocks.size===1,'poser un bloc');
  G.undo(); check(G.blocks.size===0,'annuler retire le bloc');
  G.setMode('fill'); G.ray.intersectObjects=()=>fakeBase(2.5,2.5); G.onTap(0,0,0); G.ray.intersectObjects=()=>fakeBase(4.5,3.5); G.onTap(0,0,0);
  check(G.blocks.size===6,'remplir une zone de 3×2 ('+G.blocks.size+' blocs)'); G.undo(); check(G.blocks.size===0,'annuler le remplissage');
  G.setColor(20); G.setMode('place'); G.ray.intersectObjects=()=>fakeBase(6.5,6.5); G.onTap(0,0,0); const k=[...G.blocks.keys()][0];
  G.setColor(0); G.setMode('pick'); G.ray.intersectObjects=()=>[{object:G.meshes[0],point:{},face:{normal:{x:0,y:1,z:0}}}]; G.onTap(0,0,0); check(G.ci===20,'la pipette copie la matière ('+G.ci+')');
  G.persist(); T.exitGame(); SS.buildEnv=1; T.startGame('build'); G=T.getG(); frames(3); check(G.blocks.size===1&&G.env===T.BENV[1]&&!!G.sea,'changer d\'ambiance garde la construction');
} T.exitGame(); SS.buildEnv=0;

console.log('ŒUFS');
check(T.sanitizeItem({k:'pet',r:'L',sp:T.PET_BY_ID[Object.keys(T.PET_BY_ID)[0]].id,sh:1}).sh===1,'un animal brillant reste brillant en sauvegarde');
T.startGame('eggs'); { const G=T.getG(); frames(10); G.goldT=0; frames(2); check(!!G.gold,'un œuf doré apparaît');
  const gd=G.gold; place(gd.x,0,gd.z); P.inv=0; frames(2); check(G.me.carry&&G.me.carry.r==='L','ramasser l\'œuf doré (légendaire)');
  check(G.nests.every(n=>n.guard.al),'chaque gardien a son ❗');
} T.exitGame();

console.log('BRAINROT');
T.startGame('brainrot'); { const G=T.getG(); frames(10); G.bots.forEach(b=>{ b.state='think'; b.t=999; b.raidT=999; });
  SS.br.cash=1e7; let w=G.spawnWalker(P.x,true); let guard=0; while(!w.mut&&guard<4000){ G.removeWalker(w); w=G.spawnWalker(P.x,true); guard++; }
  check(!!w.mut&&w.d.price===T.BR_BY_ID[w.d.id].price*T.BRMUT[w.mut].x,'un brainrot muté coûte plus cher ('+w.mut+')');
  G.home.slots.forEach(s=>{ if(s.id) G.clearSlot(G.home,s); });
  place(w.x,0,1.8); frames(1); G.onAction(); frames(300); const s=G.home.slots.find(s=>s.id===w.d.id);
  check(s&&s.mut===w.mut,'il garde sa mutation dans la base');
  const b0=SS.br.bank; frames(60); const gain=SS.br.bank-b0, base=T.BR_BY_ID[s.id].inc;
  check(gain>base*T.BRMUT[w.mut].x*0.9,'il rapporte ×'+T.BRMUT[w.mut].x+' ('+gain.toFixed(1)+' en 1 s pour '+base+'/s)');
  check(SS.br.dex.indexOf(s.id)>=0,'il est ajouté à l\'album');
  G.disco=10; const b1=SS.br.bank; frames(60); check(SS.br.bank-b1>gain*1.8,'fête disco : revenus doublés');
  G.persistSoon(); T.exitGame(); T.startGame('brainrot'); const G2=T.getG(); frames(3); const s2=G2.home.slots.find(x=>x.id===w.d.id); check(s2&&s2.mut===w.mut,'la mutation est rechargée');
} T.exitGame();
check(finite(),'valeurs du joueur valides');
console.log(fails.length?'\nÉCHECS : '+fails.length:'\nTOUT EST OK'); process.exit(fails.length?1:0);
