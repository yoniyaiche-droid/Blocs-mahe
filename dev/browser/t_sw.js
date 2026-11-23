const wait=ms=>new Promise(r=>setTimeout(r,ms));
await wait(3000);
const regs=navigator.serviceWorker?await navigator.serviceWorker.getRegistrations():[];
const cards=document.querySelectorAll('#home button, #home .card').length;
return 'service worker: '+regs.length+' · éléments du menu: '+cards+' · build: '+document.querySelector('meta[name=build]').content;
