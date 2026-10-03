/* ==============================================================
   Canonical shared table controls
   Every table: 10 / 20 / 50 rows + clickable sortable headers.
   The displayed "No" value stays attached to its original row.
   ============================================================== */
const GETableState = new WeakMap();

function geComparable(text){
  const s=String(text??'').trim();
  const normalized=s.replace(/\s+/g,' ');
  if(/^[-+]?\d+(?:[.,]\d+)?%?$/.test(normalized)){
    return {type:'number', value:Number(normalized.replace('%','').replace(',','.'))};
  }
  const idDate=normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(idDate)return {type:'number',value:new Date(+idDate[3],+idDate[2]-1,+idDate[1]).getTime()};
  const iso=normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(iso)return {type:'number',value:new Date(+iso[1],+iso[2]-1,+iso[3]).getTime()};
  const currency=normalized.match(/^(IDR|USD|SGD|AUD|JPY|CNY|SAR|MYR)\s*([\d.,]+)/i);
  if(currency)return {type:'number',value:Number(currency[2].replace(/[.,]/g,''))};
  return {type:'text',value:normalized.toLocaleLowerCase('id-ID')};
}
function geCompare(a,b){
  if(a.type==='number'&&b.type==='number')return a.value-b.value;
  return String(a.value).localeCompare(String(b.value),'id',{numeric:true,sensitivity:'base'});
}
function geTableApply(table){
  const state=GETableState.get(table); if(!state)return;
  const tbody=table.tBodies[0]; if(!tbody)return;
  const rows=[...tbody.rows];
  const total=rows.length;
  const pages=Math.max(1,Math.ceil(total/state.size));
  state.page=Math.min(state.page,pages);
  const start=(state.page-1)*state.size, end=start+state.size;
  rows.forEach((r,i)=>r.style.display=(i>=start&&i<end)?'':'none');

  const from=total?start+1:0, to=Math.min(end,total);
  state.info.textContent=`Menampilkan ${from}–${to} dari ${total} data`;
  state.pageInfo.textContent=`Halaman ${state.page} / ${pages}`;
  state.prev.disabled=state.page<=1;
  state.next.disabled=state.page>=pages;
}
function geTableSort(table,col,th){
  const state=GETableState.get(table); if(!state)return;
  const tbody=table.tBodies[0]; if(!tbody)return;
  const dir=(state.sortCol===col && state.sortDir==='asc')?'desc':'asc';
  state.sortCol=col; state.sortDir=dir; state.page=1;
  [...table.tHead.querySelectorAll('th')].forEach(h=>{h.classList.remove('sort-asc','sort-desc');h.removeAttribute('aria-sort')});
  th.classList.add(dir==='asc'?'sort-asc':'sort-desc');
  th.setAttribute('aria-sort',dir==='asc'?'ascending':'descending');

  const rows=[...tbody.rows].map((row,idx)=>({row,idx,key:geComparable(row.cells[col]?.innerText||'')}));
  rows.sort((a,b)=>{const c=geCompare(a.key,b.key); return (c===0?a.idx-b.idx:c)*(dir==='asc'?1:-1)});
  state.muting=true;
  rows.forEach(x=>tbody.appendChild(x.row));
  state.muting=false;
  geTableApply(table);
}
function geEnhanceTable(table){
  if(GETableState.has(table) || !table.tHead || !table.tBodies.length)return;
  const wrap=table.closest('.table-scroll,.card')||table.parentElement;
  const controls=document.createElement('div');
  controls.className='table-controls';
  controls.innerHTML=`<div class="table-size-control"><span>Tampilkan</span>
    <select aria-label="Jumlah data per halaman"><option>10</option><option>20</option><option>50</option></select>
    <span>data</span></div>
    <div class="table-page-control"><span class="table-info"></span>
      <button type="button" class="table-page-btn prev" aria-label="Halaman sebelumnya">‹</button>
      <span class="table-page-info"></span>
      <button type="button" class="table-page-btn next" aria-label="Halaman berikutnya">›</button>
    </div>`;
  wrap.insertBefore(controls,table);

  const state={
    size:10,page:1,sortCol:null,sortDir:null,muting:false,
    info:controls.querySelector('.table-info'),
    pageInfo:controls.querySelector('.table-page-info'),
    prev:controls.querySelector('.prev'),
    next:controls.querySelector('.next')
  };
  GETableState.set(table,state);
  controls.querySelector('select').addEventListener('change',e=>{state.size=Number(e.target.value);state.page=1;geTableApply(table)});
  state.prev.addEventListener('click',()=>{if(state.page>1){state.page--;geTableApply(table)}});
  state.next.addEventListener('click',()=>{state.page++;geTableApply(table)});

  [...table.tHead.querySelectorAll('th')].forEach((th,col)=>{
    th.classList.add('sortable-th');
    th.tabIndex=0;
    th.title='Klik untuk mengurutkan data';
    th.addEventListener('click',()=>geTableSort(table,col,th));
    th.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();geTableSort(table,col,th)}});
  });

  const obs=new MutationObserver(()=>{
    if(state.muting)return;
    state.page=1;
    requestAnimationFrame(()=>geTableApply(table));
  });
  obs.observe(table.tBodies[0],{childList:true});
  geTableApply(table);
}
function geEnhanceAllTables(){
  document.querySelectorAll('table').forEach(geEnhanceTable);
}
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(geEnhanceAllTables,0);
  const pageObserver=new MutationObserver(()=>geEnhanceAllTables());
  pageObserver.observe(document.body,{childList:true,subtree:true});
});


