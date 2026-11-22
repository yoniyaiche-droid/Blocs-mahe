// Blocs Mahé : permet de rejouer même sans connexion après la première visite
const CACHE='blocs-mahe-v1';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const THREE_JS='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(LOCAL).then(()=>c.add(THREE_JS).catch(()=>{}))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  if(r.mode==='navigate'){ // la page : d'abord internet (pour avoir les mises à jour), sinon la copie gardée
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return res; }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res&&(res.ok||res.type==='opaque')){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));
});
