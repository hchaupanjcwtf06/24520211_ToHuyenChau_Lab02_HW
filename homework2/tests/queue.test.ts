import assert from 'node:assert/strict';
import test from 'node:test';
import { AudioTaskQueue } from '../src/audio-task-queue.ts';

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

test('FIFO: three rapidly enqueued jobs run one at a time in original order', async () => {
  const order: string[] = [];
  let active = 0;
  let maxActive = 0;
  const queue = new AudioTaskQueue(async (url: string) => {
    active++;
    maxActive = Math.max(maxActive, active);
    order.push(url);
    await tick();
    active--;
    return url.toUpperCase();
  });
  const jobs = [queue.enqueue('A'), queue.enqueue('B'), queue.enqueue('C')];
  assert.deepEqual(await Promise.all(jobs), ['A', 'B', 'C']);
  assert.deepEqual(order, ['A', 'B', 'C']);
  assert.equal(maxActive, 1);
  assert.equal(queue.snapshot().completed, 3);
  queue.dispose();
});

test('cancelPending rejects queued tasks while active one can finish', async () => {
  let unblock: (() => void) | undefined;
  const blocker = new Promise<void>((resolve) => { unblock = resolve; });
  const queue = new AudioTaskQueue(async (url: string) => {
    if (url === 'A') await blocker;
    return url;
  });
  const a = queue.enqueue('A');
  const b = queue.enqueue('B');
  const c = queue.enqueue('C');
  const outcomes = Promise.allSettled([a, b, c]);
  queue.cancelPending();
  unblock!();
  const results = await outcomes;
  assert.deepEqual(results.map((r) => r.status), ['fulfilled', 'rejected', 'rejected']);
  assert.equal(queue.snapshot().cancelled, 2);
  queue.dispose();
});

test('cancelActive signals abortion and proceeds to the next queued job', async () => {
  let begin!: () => void;
  const started = new Promise<void>((resolve) => { begin = resolve; });
  const queue = new AudioTaskQueue(async (url: string, signal: AbortSignal) => {
    if (url !== 'A') return url;
    begin();
    await new Promise<void>((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }));
    return 'ignored';
  });
  const first = queue.enqueue('A');
  const second = queue.enqueue('B');
  const results = Promise.allSettled([first, second]);
  await started;
  queue.cancelActive();
  const output = await results;
  assert.equal(output[0].status, 'rejected');
  assert.deepEqual(output[1], { status: 'fulfilled', value: 'B' });
  assert.equal(queue.snapshot().cancelled, 1);
  queue.dispose();
});

test('one execution error does not block later items', async () => {
  const queue = new AudioTaskQueue(async (url: string) => {
    if (url === 'bad') throw new Error('decode failed');
    return url;
  });
  const result = await Promise.allSettled([queue.enqueue('bad'), queue.enqueue('good')]);
  assert.equal(result[0].status, 'rejected');
  assert.deepEqual(result[1], { status: 'fulfilled', value: 'good' });
  queue.dispose();
});

test('dispose rejects pending tasks and disallows further enqueue', async () => {
  const queue = new AudioTaskQueue<string>(async () => 'ok');
  queue.dispose();
  await assert.rejects(queue.enqueue('later'), /disposed/);
});
