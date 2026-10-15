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
const pages=context.window.GE_PAGE_REGISTRY;
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
assert.ok(planning.includes("shell.className='planning-overlay'"),'Planning overlay must use the canonical shared overlay');
assert.ok(planning.includes('document.body.appendChild(shell)'),'Planning modal must be promoted outside page stacking contexts');
assert.ok(planning.includes("shell.querySelectorAll('[data-close]')")&&planning.includes("shell.querySelector('[data-save]')"),'Modal Close/Cancel/Save handlers must be bound to the live overlay');
assert.ok(sharedCss.includes('.planning-overlay{position:fixed')&&sharedCss.includes('z-index:2147483600'),'Canonical Planning overlay must cover the portal shell and remain interactive');
assert.ok(planning.includes('stationEntries('),'Planning workspace must materialize one visible row or card per station');
assert.ok(planning.includes('await GEStore.flush()'),'Record changes must persist before confirmation');
assert.ok(sharedCss.includes('background:rgba(8,31,57,.64)'),'Canonical planning overlay requires a dedicated backdrop');
assert.ok(portalCss.includes('.ge-master-tabs-panel{min-height:0'),'Master Data tabs must override inherited dashboard min-height');
assert.ok(registry.includes('ge-panel ge-master-tabs-panel'),'Master Data tab group must have a semantic compact class');
assert.ok(sharedCss.includes('--ui-control-h:42px;')&&sharedCss.includes('--ui-button-weight:600;'),'Shared button geometry must have one central token set');
assert.ok(!portalCss.includes('.planning-dialog-body-level .planning-modal'),'Old Planning modal rules must be removed, not layered');

// Canonical replacement cleanup guard: runtime assets and current behavior must not regress to patch/version identities.
const runtimeFiles=fs.readdirSync(path.join(root,'assets')).filter(name=>/\.(?:js|css|html)$/i.test(name));
const versionedRuntimeFiles=runtimeFiles.filter(name=>/(?:^|[-_])(?:r|p|v)\d+/i.test(name));
assert.deepEqual(versionedRuntimeFiles,[],'Runtime asset filenames must use domain names, not R/P/V patch identities');
assert.ok(!/[?&]v=[rpv]\d+/i.test(registry),'Canonical registry must not carry historical cache identities');
for(const removed of ['assets/app.js','assets/lounge-planning.js','assets/v254-project.js','assets/v2544-modal-fix.js','assets/v2554-stability.js','assets/global-select-standard.js']){
  assert.ok(!registry.includes(removed),`Superseded runtime must not be registered: ${removed}`);
  assert.ok(!fs.existsSync(path.join(root,removed)),`Superseded runtime must be deleted: ${removed}`);
}
assert.ok(!portalCss.includes('!important'),'Canonical portal CSS must not use !important overrides');
const canonicalRuntime=read('assets/edition1-business-runtime.js');
for(const legacy of ['GE_INITIATIVE_VIEW_R4','geInitiativeFilteredRowsR31','geInitiativeListActionsR32','ge-map-thumb-r32','planning-domain-card-r32']){
  assert.ok(!canonicalRuntime.includes(legacy)&&!portalCss.includes(legacy),`Migrated behavior must not fall back to ${legacy}`);
}
console.log(`UI_INTEGRITY_GATE_PASS pages=${Object.keys(pages).length} assetReferences=${assets}`);
