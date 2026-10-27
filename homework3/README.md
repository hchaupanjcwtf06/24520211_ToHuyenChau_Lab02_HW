# Homework 3 — Vietnam 11.11 Flash-Sale Engine

React + TypeScript + Vite simulation of a high-concurrency flash-sale checkout queue, based on Lab 02 slide 32.

## Requirements covered

- Five-minute midnight-sale simulation timer derived from absolute `Date.now()` deadline and RAF (not counting `setInterval` ticks).
- In-memory inventory state machine with lock expiry (15 seconds), checkout, cancellation, stable reservation IDs and conservation invariant.
- FIFO request serialization with a 20-buyer concurrent `Promise.all` burst to demonstrate no oversell.
- Responsive accessible-ish interface: countdown, stock metrics, action buttons, reservation list and log.
- Automated deterministic tests for timer drift, overselling, FIFO, expiry and cancellation.

## Run on Windows CMD

From the **existing repository root**:

```cmd
cd homework3
node -v
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

Open the URL printed by Vite, generally `http://127.0.0.1:5173/`. Node >= 22 is recommended for the built-in TS stripping test runner. Press Ctrl+C to stop Vite. Run `npm run preview` for production preview.

## Expected manual verification (one pass)

1. Initial stock reads Available 12, Locked 0, Sold 0.
2. Countdown decreases from about five minutes; switching away/returning does not cause cumulative drift.
3. `Reserve one item`: available decreases 1, locked increases 1, new reservation appears.
4. `Checkout`: locked decreases 1, sold increases 1, available unchanged.
5. `Cancel`: locked decreases 1 and available increases 1.
6. Leave a lock uncompleted for 15 seconds: it expires and the unit returns to available.
7. On a fresh page, `Simulate 20 buyers`: exactly 12 locks, 8 rejected when stock starts at 12, no negative available count.
8. Wait for sale deadline: future requests reject `SALE_NOT_ACTIVE`.
9. Check DevTools Console for application errors, responsive viewport, and `npm test`/`npm run build` output.

## Design contracts

`src/core/anti-drift-timer.ts`: clock abstraction, `remainingUntil`, `createAntiDriftTimer` with cleanup.

`src/core/inventory.ts`: state transitions `LOCKED → CHECKED_OUT | CANCELLED | EXPIRED`. Stock is `total - locked - sold`; expired locks are reclaimed. The same reservation cannot be checked out twice.

`src/core/request-queue.ts`: serialized operations, FIFO even on failures.

`src/core/sale.ts`: sale gate checks current deadline inside queue, not when request is initially enqueued.

`src/App.tsx`: simulated traffic, event log, inventory UI.

## Scope boundaries

**Academic simulation only.** The client clock can be changed, browser tabs are not isolated like a server, and the in-memory FIFO queue cannot coordinate different devices or processes. No real Shopee or Lazada API, payment processing, database transaction, distributed lock, or guaranteed 60 fps is claimed.

The course requires at least **8 discrete Conventional Commits** for HW3. Make meaningful changes and independently verify each; if starting from the completed starter, identify commits as grouping preexisting source, not falsely as stepwise generation history. Refer to `GIT_AND_TEST_GUIDE.md`.

`AI_FAILURE_AUDIT.md` documents 3 reproducible risks, not invented real AI-output errors. Supplement with real prompt/diff/manual-fix evidence when available.
