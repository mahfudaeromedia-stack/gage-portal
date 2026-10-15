/* Fast navigation support. Static portal resources use a local service-worker cache; API/Firebase traffic stays live. */
(function(){'use strict';if(!('serviceWorker' in navigator)||location.protocol==='file:')return;window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).catch(err=>console.warn('[Portal cache]',err)))})();
