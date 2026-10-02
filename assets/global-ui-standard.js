/* GLOBAL UI STANDARD — canonical runtime normalization for shared controls. */
(function(){
  'use strict';
  if(window.__GE_GLOBAL_UI_STANDARD__) return;
  window.__GE_GLOBAL_UI_STANDARD__=true;

  const labels=[
    [/^Simpan Perubahan$/i,'Save Changes'],
    [/^Simpan Update$/i,'Save Update'],
    [/^Simpan Service$/i,'Save Service'],
    [/^Simpan Kegiatan$/i,'Save Activity'],
    [/^Simpan Draft$/i,'Save Draft'],
    [/^Simpan Presentation$/i,'Save Presentation'],
    [/^Simpan Layout Draft$/i,'Save Layout Draft'],
    [/^Simpan Menu Draft$/i,'Save Menu Draft'],
    [/^Simpan$/i,'Save'],
    [/^Batal Koreksi$/i,'Cancel Correction'],
    [/^Batal$/i,'Cancel'],
    [/^Hapus$/i,'Delete'],
    [/^Tutup$/i,'Close'],
    [/^Unduh Template$/i,'Download Template'],
    [/^Unduh CSV Template$/i,'Download CSV Template'],
    [/^Unduh Data$/i,'Download Data'],
    [/^Unggah Data$/i,'Upload Data'],
    [/^Unggah Dokumen$/i,'Upload Document'],
    [/^Tambah (.+)$/i,'Add $1'],
    [/^\+ Tambah (.+)$/i,'+ Add $1'],
    [/^Kembali ke (.+)$/i,'Back to $1'],
    [/^Kembali$/i,'Back'],
    [/^Cari$/i,'Search'],
    [/^Reset$/i,'Reset']
  ];

  function actionElements(root=document){
    return root.querySelectorAll?.('#cleanPageOutlet button, #cleanPageOutlet a.btn, #cleanPageOutlet .ge-btn, #cleanPageOutlet input[type="button"], #cleanPageOutlet input[type="submit"], .modal-backdrop button, .modal-backdrop .btn, .modal-backdrop .ge-btn, .tp-modal-backdrop button, .tp-modal-backdrop .btn, .tp-modal-backdrop .ge-btn, .ge-viewport-overlay button, .ge-viewport-overlay .btn, .ge-viewport-overlay .ge-btn')||[];
  }
  function normalize(root=document){
    actionElements(root).forEach(el=>{
      if(el.dataset.uiStandardSkip==='1') return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      for(const [re,out] of labels){
        if(re.test(text)){
          el.textContent=out.replace('$1',text.replace(re,'$1'));
          break;
        }
      }
    });
  }
  function closeCombos(except){document.querySelectorAll('.search-filter-combo-v245.open').forEach(x=>{if(x!==except)x.classList.remove('open')});}
  function enhanceSelect(select){
    if(!select||select.tagName!=='SELECT'||select.multiple||select.dataset.searchableV245==='1'||select.closest('.search-filter-combo-v245'))return;
    const wrap=document.createElement('div');wrap.className='search-filter-combo-v245';const input=document.createElement('input');input.type='text';input.className='search-filter-input-v245';input.autocomplete='off';input.setAttribute('aria-label',select.getAttribute('aria-label')||'Search options');const toggle=document.createElement('button');toggle.type='button';toggle.className='search-filter-toggle-v245';toggle.setAttribute('aria-label','Open options');const menu=document.createElement('div');menu.className='search-filter-menu-v245';select.parentNode.insertBefore(wrap,select);wrap.append(input,toggle,menu,select);select.dataset.searchableV245='1';select.style.display='none';
    const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');const render=(query='',keep=true)=>{const q=String(query||'').trim().toLocaleLowerCase(),opts=[...select.options],visible=opts.filter(o=>!o.disabled&&(!q||o.textContent.trim().toLocaleLowerCase().includes(q)));menu.innerHTML=visible.length?visible.map(o=>`<button type="button" class="search-filter-option-v245${String(o.value)===String(select.value)?' selected':''}" data-value="${esc(o.value)}">${esc(o.textContent)}</button>`).join(''):'<div class="search-filter-empty-v245">No matching option</div>';if(!keep){const chosen=opts.find(o=>o.value===select.value);input.value=chosen?.textContent?.trim()||'';}};
    const choose=value=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));const chosen=[...select.options].find(o=>String(o.value)===String(value));input.value=chosen?.textContent?.trim()||'';render('',false);wrap.classList.remove('open')};toggle.onclick=()=>{closeCombos(wrap);wrap.classList.toggle('open');render('',false);input.focus()};input.onfocus=()=>{closeCombos(wrap);wrap.classList.add('open');input.select();render(input.value,true)};input.oninput=()=>{wrap.classList.add('open');render(input.value,true)};input.onkeydown=e=>{if(e.key==='Escape')wrap.classList.remove('open');if(e.key==='Enter'){const first=menu.querySelector('.search-filter-option-v245');if(first){e.preventDefault();choose(first.dataset.value)}}};menu.onclick=e=>{const b=e.target.closest('.search-filter-option-v245');if(b)choose(b.dataset.value)};select.addEventListener('change',()=>{const chosen=[...select.options].find(o=>o.value===select.value);input.value=chosen?.textContent?.trim()||'';render('',false)});render('',false);
  }
  function enhanceAllSelects(root=document){root.querySelectorAll?.('#cleanPageOutlet select:not([multiple])').forEach(enhanceSelect);window.GEGlobalSelect=true;}
  function enhanceTable(table){if(!table||table.dataset.geTableStandardV1==='1'||!table.tHead||!table.tBodies.length||table.closest('.ge-checklist-share'))return;table.dataset.geTableStandardV1='1';const wrap=table.closest('.table-scroll,.table-wrap,.card,.ge-table-wrap')||table.parentElement;if(!wrap)return;const controls=document.createElement('div');controls.className='ge-table-controls';controls.innerHTML='<label>Show <select aria-label="Rows per page"><option value="10">10</option><option value="20">20</option><option value="50">50</option></select></label><span class="ge-table-info"></span><div class="ge-table-nav"><button type="button" class="ge-table-prev" aria-label="Previous page">‹</button><span class="ge-table-page"></span><button type="button" class="ge-table-next" aria-label="Next page">›</button></div>';wrap.insertBefore(controls,table);const state={size:10,page:1,sortCol:null,sortDir:1};const apply=()=>{const rows=[...table.tBodies[0].rows],pages=Math.max(1,Math.ceil(rows.length/state.size));state.page=Math.min(state.page,pages);const start=(state.page-1)*state.size;rows.forEach((r,i)=>r.style.display=i>=start&&i<start+state.size?'':'none');controls.querySelector('.ge-table-info').textContent=`${rows.length?start+1:0}–${Math.min(start+state.size,rows.length)} of ${rows.length}`;controls.querySelector('.ge-table-page').textContent=`Page ${state.page} / ${pages}`;controls.querySelector('.ge-table-prev').disabled=state.page<=1;controls.querySelector('.ge-table-next').disabled=state.page>=pages};controls.querySelector('select').onchange=e=>{state.size=Number(e.target.value);state.page=1;apply()};controls.querySelector('.ge-table-prev').onclick=()=>{if(state.page>1){state.page--;apply()}};controls.querySelector('.ge-table-next').onclick=()=>{state.page++;apply()};[...table.tHead.rows[0].cells].forEach((th,col)=>{if(th.dataset.sortDisabled==='1')return;th.classList.add('sortable-th');th.tabIndex=0;const sort=()=>{const rows=[...table.tBodies[0].rows].map((row,i)=>({row,i,v:(row.cells[col]?.innerText||'').trim().toLocaleLowerCase()}));const dir=state.sortCol===col?-state.sortDir:1;state.sortCol=col;state.sortDir=dir;rows.sort((a,b)=>a.v.localeCompare(b.v,'id',{numeric:true})*dir);rows.forEach(x=>table.tBodies[0].appendChild(x.row));apply()};th.addEventListener('click',sort);th.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sort()}})});apply()}
  function enhanceAllTables(root=document){root.querySelectorAll?.('#cleanPageOutlet table').forEach(enhanceTable)}
  function init(){normalize(document);enhanceAllSelects(document);enhanceAllTables(document);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1){normalize(n);enhanceAllSelects(n);enhanceAllTables(n)}}))).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
