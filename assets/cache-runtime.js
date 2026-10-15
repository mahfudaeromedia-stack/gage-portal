/* Fast navigation support. Static portal resources use a local service-worker cache; API/Firebase traffic stays live. */
(function(){'use strict';
if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
const warm=()=>{try{const pages=window.P40_CLEAN_PAGES||{},urls=new Set(['/app.html']);Object.values(pages).forEach(def=>{(def.styles||[]).forEach(x=>urls.add('/'+String(x).replace(/^\//,'')));(def.scripts||[]).forEach(x=>{if(x?.src)urls.add('/'+String(x.src).replace(/^\//,''))})});const run=()=>Promise.allSettled([...urls].map(url=>fetch(url,{credentials:'same-origin',cache:'force-cache'})));('requestIdleCallback'in window)?requestIdleCallback(run,{timeout:2500}):setTimeout(run,800)}catch(e){console.warn('[Portal cache warmup]',e)}};
window.addEventListener('load',async()=>{try{await navigator.serviceWorker.register('/service-worker.js',{scope:'/'});if(navigator.serviceWorker.controller)warm();else navigator.serviceWorker.ready.then(warm)}catch(err){console.warn('[Portal cache]',err)}});
})();
