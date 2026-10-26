import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';

// Deliberately flawed examples are isolated in this audit script, not shipped in the UI.
const evidence = [];
function caseCheck(id, title, buggyFn, correctedFn, invariant) {
  let before = 'UNEXPECTED_PASS';
  let after = 'FAIL';
  try { assert.ok(invariant(buggyFn())); } catch { before = 'FAIL_REPRODUCED'; }
  try { assert.ok(invariant(correctedFn())); after = 'PASS'; } catch { after = 'FAIL'; }
  evidence.push({ id, title, before, after });
  assert.equal(before, 'FAIL_REPRODUCED', `${id}: bug not reproduced`);
  assert.equal(after, 'PASS', `${id}: corrected behavior failed`);
}

const testValue = '<img src=x onerror=alert(1)>';
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
caseCheck('01', 'HTML injection',
  () => `<td>${testValue}</td>`,
  () => `<td>${escapeHtml(testValue)}</td>`,
  (html) => !html.includes('<img') && html.includes('&lt;img'));

function countCallbacks(attachTwice) {
  const emitter = new EventTarget();
  let count = 0;
  const handler1 = () => { count += 1; };
  const handler2 = () => { count += 1; };
  emitter.addEventListener('click', handler1);
  if (attachTwice) emitter.addEventListener('click', handler2);
  emitter.dispatchEvent(new Event('click'));
  return count;
}
caseCheck('02', 'Duplicate event listener',
  () => countCallbacks(true),
  () => countCallbacks(false),
  (count) => count === 1);

const beforeRows = [{ id: 114, name: 'Son Vu' }, { id: 200, name: 'Lan Pham' }];
const afterRows = [beforeRows[1], beforeRows[0]];
function selectedAfterReorder(keyer) {
  const selectedKey = keyer(beforeRows[0], 0);
  return afterRows.find((row, index) => keyer(row, index) === selectedKey)?.id;
}
caseCheck('03', 'Unstable index key on reorder',
  () => selectedAfterReorder((_row, index) => index),
  () => selectedAfterReorder((row) => row.id),
  (id) => id === 114);

mkdirSync(new URL('./evidence/', import.meta.url), { recursive: true });
const lines = [
  'HW1 — Controlled before/after bug reproduction',
  'These are deliberately constructed demonstrations, NOT historical AI mistakes.',
  ...evidence.map((r) => `${r.id} ${r.title}: BEFORE=${r.before}; AFTER=${r.after}`),
  'RESULT: 3/3 flaws reproduced; 3/3 corrections passed.'
];
const output = lines.join('\n') + '\n';
writeFileSync(new URL('./evidence/audit-run.txt', import.meta.url), output);
process.stdout.write(output);
