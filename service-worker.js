const CACHE='ge-portal-static-canonical-20261016b';
const CORE=['/app.html','/login.html','/assets/portal.css','/assets/clean-shell.css','/assets/global-ui-canonical.css','/assets/portal-shell.js','/assets/clean-page-registry.js','/assets/portal-ui-runtime.js','/assets/table-runtime.js','/assets/edition1-store.js','/assets/edition1-business-runtime.js','/assets/edition1-page-boot.js','/assets/form-management.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith('ge-portal-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function networkFirst(req){const cache=await caches.open(CACHE);try{const res=await fetch(req);if(res&&res.ok)await cache.put(req,res.clone());return res}catch(_e){return (await cache.match(req,{ignoreSearch:false}))||(await cache.match(new URL(req.url).pathname,{ignoreSearch:true}))||Response.error()}}
async function staleWhileRevalidate(req){const cache=await caches.open(CACHE);const hit=await cache.match(req,{ignoreSearch:true});const network=fetch(req).then(res=>{if(res&&res.ok)cache.put(req,res.clone());return res}).catch(()=>null);return hit||(await network)||Response.error()}
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/functions/'))return;
 const isAppShell=url.pathname==='/app.html'||url.pathname.endsWith('/app.html');
 const isDocument=req.mode==='navigate'||url.pathname==='/'||url.pathname.endsWith('.html');
 // app.html is a static shell; serve it immediately from cache on repeat navigation and refresh it in background.
 if(isAppShell){event.respondWith(staleWhileRevalidate(req));return}
 // Login/other documents stay network-first so auth entry points are never pinned to stale HTML.
 if(isDocument){event.respondWith(networkFirst(req));return}
 if(/\.(?:js|css|png|jpg|jpeg|webp|svg|woff2?|xlsx?|csv|wasm|gz)$/i.test(url.pathname))event.respondWith(staleWhileRevalidate(req));
});
