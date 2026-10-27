import test from 'node:test';
import assert from 'node:assert/strict';
import { remainingUntil, createAntiDriftTimer, formatRemaining } from '../src/core/anti-drift-timer.ts';
import { InventoryStore } from '../src/core/inventory.ts';
import { RequestQueue } from '../src/core/request-queue.ts';
import { FlashSale } from '../src/core/sale.ts';

test('remaining time uses absolute deadline; no interval accumulation/drift', () => {
  assert.equal(remainingUntil(10000, 1000), 9000);
  assert.equal(remainingUntil(10000, 9999), 1);
  assert.equal(remainingUntil(10000, 12500), 0);
  assert.equal(formatRemaining(61000), '00:01:01');
});
test('anti-drift timer handles delayed RAF and cleans up', () => {
  let now = 1000;
  let next: (() => void) | undefined;
  let cancelled = -1;
  const values: number[] = [];
  const stop = createAntiDriftTimer(5000, n => values.push(n), {
    clock: { now: () => now },
    raf: cb => { next = () => cb(0); return 17; },
    cancelRaf: id => { cancelled = id; },
  });
  assert.deepEqual(values, [5000]);
  now = 4700; next?.();
  assert.deepEqual(values, [5000,1300]);
  now = 6600; next?.();
  assert.deepEqual(values, [5000,1300,0]);
  stop(); assert.equal(cancelled, 17);
});
test('no oversell after concurrent orders for the last units', async () => {
  let now = 100;
  const sale = new FlashSale(3, 10000, 5000, {now: () => now});
  const results = await Promise.all(Array.from({length: 25},(_,i) => sale.reserve(`buyer-${i}`)));
  assert.equal(results.filter(r => r.ok).length, 3);
  assert.equal(sale.inventory.snapshot().available, 0);
  assert.ok(sale.inventory.assertInvariants());
  now = 15000;
  assert.deepEqual(await sale.reserve('late'), {ok: false, reason: 'SALE_NOT_ACTIVE'});
});
test('reservation lifecycle checkout and idempotent rejection', () => {
  let now = 0;
  const store = new InventoryStore(2, 1000, {now: () => now});
  const first = store.reserve('A');
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(store.checkout(first.reservation.id).ok, true);
  assert.deepEqual(store.checkout(first.reservation.id), {ok: false, reason:'NOT_LOCKED'});
  assert.equal(store.snapshot().sold, 1);
  const second = store.reserve('B');
  assert.equal(second.ok, true);
  if (!second.ok) return;
  now = 1000;
  assert.deepEqual(store.checkout(second.reservation.id), {ok:false,reason:'EXPIRED'});
  assert.equal(store.snapshot().available, 1);
  assert.equal(store.snapshot().sold, 1);
  assert.ok(store.assertInvariants());
});
test('cancel returns available stock and invalid quantity cannot corrupt it', () => {
  const store = new InventoryStore(1, 5000, {now:()=>1});
  assert.deepEqual(store.reserve('A', -1), {ok:false,reason:'INVALID_QUANTITY'});
  assert.deepEqual(store.reserve('A', 1.5), {ok:false,reason:'INVALID_QUANTITY'});
  const lock = store.reserve('A'); assert.equal(lock.ok, true);
  if (!lock.ok) return;
  assert.equal(store.snapshot().available, 0);
  assert.equal(store.cancel(lock.reservation.id).ok, true);
  assert.equal(store.snapshot().available, 1);
});
test('FIFO queue processes in arrival order, including after rejection', async () => {
  const q = new RequestQueue();
  const events: number[] = [];
  const tasks = [1,2,3].map(n => q.enqueue(() => { events.push(n); if(n===2) throw Error('expected'); return n; }));
  const settled = await Promise.allSettled(tasks);
  assert.deepEqual(events,[1,2,3]);
  assert.equal(settled[1].status,'rejected');
  assert.equal(q.pending,0);
});
