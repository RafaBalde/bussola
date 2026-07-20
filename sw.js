const CACHE="bussola-v17";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("message",e=>{if(e.data==="skipWaiting")self.skipWaiting();});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.origin!==location.origin) return; // deixa passar APIs externas (Finnhub, fontes)
  const isDoc=r.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith("index.html");
  if(isDoc){
    // network-first: a app fica sempre atualizada quando há ligação
    e.respondWith(fetch(r).then(resp=>{const cc=resp.clone();caches.open(CACHE).then(ca=>ca.put(r,cc));return resp;}).catch(()=>caches.match(r).then(c=>c||caches.match("./index.html"))));
    return;
  }
  // restantes recursos: usa cache mas atualiza em segundo plano
  e.respondWith(caches.match(r).then(c=>{const net=fetch(r).then(resp=>{const cc=resp.clone();caches.open(CACHE).then(ca=>ca.put(r,cc));return resp;}).catch(()=>c);return c||net;}));
});
