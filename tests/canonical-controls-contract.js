'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('assets/global-ui-canonical.css','utf8');
const compact=css.match(/html body \.btn\.compact,[\s\S]*?\n\}/g)||[];
assert.equal(compact.length,1,'Compact buttons must have one canonical definition, not conflicting duplicate definitions.');
assert.match(compact[0],/height:var\(--ui-control-h\)/,'Compact buttons must use the shared height.');
assert.match(compact[0],/font-size:var\(--ui-button-font\)/,'Compact buttons must use the shared font size.');
const checkbox=css.match(/\/\* Checkbox contract:[\s\S]*?(?=\/\* Canonical Lounge\/Tenant searchable)/)?.[0];
assert.ok(checkbox,'Shared checkbox contract missing.');
for(const surface of ['#cleanPageOutlet input[type="checkbox"]','#geGlobalRefModal input[type="checkbox"]','.planning-dialog-body-level .planning-modal input[type="checkbox"]']){
  assert.ok(checkbox.includes(surface),`Missing checkbox surface ${surface}`);
}
for(const property of ['width:16px','height:16px','min-height:16px','max-height:16px','accent-color:var(--ui-navy)']){
  assert.ok(checkbox.includes(property),`Checkbox contract missing ${property}`);
}
console.log('CANONICAL_CONTROLS_CONTRACT_PASS');
