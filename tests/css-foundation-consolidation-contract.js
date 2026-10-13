'use strict';

const assert = require('node:assert');
const fs = require('node:fs');

const app = fs.readFileSync('app.html', 'utf8');
const css = fs.readFileSync('assets/global-ui-canonical.css', 'utf8');

assert(app.includes('assets/global-ui-canonical.css?v=r1'), 'Canonical UI foundation stylesheet is missing.');
assert.equal((css.match(/:root\s*\{/g) || []).length, 1, 'UI foundation must have one token source.');
assert(css.includes('--ui-control-h:38px'), 'Standard control height must remain 38px.');
assert(css.includes('--ui-compact-h:34px'), 'Compact control height must remain 34px.');
assert(!css.includes('!important'), 'UI foundation must not introduce !important.');
assert(!/\b(?:R107|R108|CBNR R4)\b/.test(css), 'Historical revision layers must not return.');
assert(!/--(?:ui|ge)-[\w-]*(?:control|button)[\w-]*:\s*48px/.test(css), 'The obsolete 48px control token must not return.');
assert(css.includes('.btn:not(.primary):not(.danger):not(.btn-danger)'), 'Shared secondary button contract is missing.');
assert(css.includes('.btn.primary'), 'Shared primary button contract is missing.');
assert(css.includes('.btn.danger'), 'Shared danger button contract is missing.');
assert(css.includes('select:not([multiple])'), 'Shared select contract is missing.');
assert(css.includes('.modal-backdrop') && css.includes('[role="dialog"]'), 'Shared overlay contract is missing.');

let depth = 0;
let minimumDepth = 0;
for (const character of css) {
  if (character === '{') depth += 1;
  if (character === '}') depth -= 1;
  minimumDepth = Math.min(minimumDepth, depth);
}
assert.equal(depth, 0, 'UI foundation braces are unbalanced.');
assert.equal(minimumDepth, 0, 'UI foundation closes a block before it opens.');

console.log('CSS_FOUNDATION_CONSOLIDATION_CONTRACT_PASS');
