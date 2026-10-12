const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root,'assets/lounge-planning-v29.js'),'utf8');
const css = fs.readFileSync(path.join(root,'assets/portal.css'),'utf8');
const cases = [
  ['station supports legacy airport field', /x\.airport\|\|x\.station/.test(js)],
  ['record IDs are not coerced to Number', !/Number\(x\.id\)/.test(js)],
  ['record IDs are encoded for inline handlers', /encodeURIComponent\(String\(x\.id\)\)\.replace\(\/'\/g,'%27'\)/.test(js)],
  ['file storage failure is not silently ignored', js.includes("Document storage is unavailable")],
  ['duplicate region filter population removed', (js.match(/put\(region,\(data\.lounges/g)||[]).length===1],
  ['English form guidance', js.includes('Use either Price Schedule or a single Price per Pax')],
  ['canonical lounge controls', css.includes('Lounge/Tenant directory: canonical control treatment')],
  ['station confirmation buttons', js.includes('data-action="cancel"') && js.includes('data-action="done"')],
];
for (const [name,ok] of cases){assert.ok(ok,name);console.log('PASS',name)}
