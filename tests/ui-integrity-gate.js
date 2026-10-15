'use strict';
/** Prevent repeats of missing assets, clipped Planning dialogs, and oversized Master Data tabs. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const context={window:{},URLSearchParams,console};
vm.runInNewContext(read('assets/clean-page-registry.js'),context,{filename:'clean-page-registry.js',timeout:5000});
const pages=context.window.P40_CLEAN_PAGES;
assert.ok(pages&&Object.keys(pages).length>=60,'The canonical page registry must be available');
let assets=0;
for(const [name,page] of Object.entries(pages)){
  for(const src of [...(page.scripts||[]).map(s=>s.src),...(page.styles||[])]){
    if(typeof src!=='string'||!src.startsWith('assets/'))continue;
    const filepath=src.split('?')[0];
    assert.ok(fs.existsSync(path.join(root,filepath)),`Missing runtime asset: ${filepath} on ${name}`);
    assets++;
  }
}
const planning=read('assets/planning-domains.js');
const portalCss=read('assets/portal.css');
const sharedCss=read('assets/global-ui-canonical.css');
const registry=read('assets/clean-page-registry.js');
assert.ok(planning.includes("document.createElement('dialog')"),'Planning overlay must be a native top-layer dialog');
assert.ok(planning.includes('dialog.showModal()'),'Planning dialog must open in the browser top layer');
assert.ok(planning.includes('document.body.appendChild(dialog)'),'Dialog must not sit inside fixed sidebar/content stacking contexts');
assert.ok(planning.includes("dialog.querySelectorAll('[data-close]')")&&planning.includes("dialog.querySelector('[data-save]')"),'Modal Close/Cancel/Save handlers must be bound to the live dialog');
assert.ok(planning.includes('stationRecords(rows(d))'),'Planning workspace must materialize one visible row or card per station');
assert.ok(planning.includes('await GEStore.flush()'),'Record changes must persist before confirmation');
assert.ok(portalCss.includes('#planningDialog.planning-dialog::backdrop'),'Planning modal requires a dedicated backdrop');
assert.ok(portalCss.includes('.ge-master-tabs-panel{min-height:0'),'Master Data tabs must override inherited dashboard min-height');
assert.ok(registry.includes('ge-panel ge-master-tabs-panel'),'Master Data tab group must have a semantic compact class');
assert.ok(sharedCss.includes('--ui-control-h:42px;')&&sharedCss.includes('--ui-button-weight:600;'),'Shared button geometry must have one central token set');
assert.ok(!portalCss.includes('.planning-dialog-body-level .planning-modal'),'Old Planning modal rules must be removed, not layered');
console.log(`UI_INTEGRITY_GATE_PASS pages=${Object.keys(pages).length} assetReferences=${assets}`);
