const CACHE='pres-cost-v15';
const ASSETS=['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

// Estrategia "red primero": siempre intenta traer la versión más nueva de internet.
// Solo usa la copia guardada (caché) si no hay conexión. Así las actualizaciones futuras
// se ven de inmediato, sin depender de subir manualmente el número de versión cada vez.
self.addEventListener('fetch',function(e){
  e.respondWith(
    fetch(e.request).then(function(fresh){
      caches.open(CACHE).then(function(cache){cache.put(e.request,fresh.clone());});
      return fresh;
    }).catch(function(){
      return caches.match(e.request).then(function(cached){
        return cached || caches.match('./index.html');
      });
    })
  );
});
