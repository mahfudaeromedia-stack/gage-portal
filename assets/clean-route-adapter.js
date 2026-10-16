(function(){
  function toClean(href){
    if(!href) return href;
    var m=href.match(/(?:^|\/)([^\/?#]+)\.html(?:\?([^#]*))?/);
    if(!m || m[1]==='login' || m[1]==='change-password') return href;
    var route=m[1], q=m[2]||'';
    if(route==='app'){
      var existing=new URLSearchParams(q);
      var requested=String(existing.get('page')||'index').trim().toLowerCase();
      var mapped=(window.GE_ROUTE_ALIASES||{})[requested]||requested;
      var canonical=(String(mapped).split('?')[0]||'index');
      existing.set('page',canonical==='app'?'index':canonical);
      return 'app.html?'+existing.toString();
    }
    var alias=(window.GE_ROUTE_ALIASES||{})[route]||route;
    var parts=alias.split('?'); route=parts[0];
    var params=new URLSearchParams(parts[1]||'');
    new URLSearchParams(q).forEach((v,k)=>params.set(k,v));
    params.set('page',route);
    return 'app.html?'+params.toString();
  }
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest('a[href]'); if(!a||a.hasAttribute('download')||a.target&&a.target!=='_self') return;
    var h=a.getAttribute('href'); if(!h || /^(https?:|mailto:|tel:|#|javascript:)/i.test(h)) return;
    var n=toClean(h);
    if(/^app\.html\?/i.test(n)&&typeof window.gePortalNavigate==='function'){
      e.preventDefault(); window.gePortalNavigate(n);
    }else if(n!==h){e.preventDefault(); location.href=n;}
  },true);
  window.p40CleanRoute=toClean;
})();