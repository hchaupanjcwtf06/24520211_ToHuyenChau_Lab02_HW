# HW3 — AI Failure Mode Audit

**Evidence integrity:** These are three *reproducible failure modes and engineering protections*. They are **not** claims that AI actually introduced all three into the submitted source. Record an actual AI-produced bug only if it was truly found in a prompt/output/diff and fixed. This distinction matters for the Lab 02 slide 29 evaluation requirement.

## 01 — Timer drift from interval counter

- **Unsafe pattern (conceptual):** `remaining -= 1000` every `setInterval(...,1000)` tick.
- **Failure:** browser throttling/background tabs delay ticks and the countdown runs late.
- **Protection:** `remainingUntil(deadlineMs, clock.now())` and RAF re-evaluation based on the original deadline.
- **Automated proof:** `npm test`: `remaining time uses absolute deadline` and `anti-drift timer handles delayed RAF`.
- **Tested expected behavior:** a simulated delayed RAF jump returns 1300 ms, then 0, without accumulated error.
- **Actual AI-generated bug found?** Not documented.

## 02 — Overselling on concurrent requests

- **Unsafe pattern (conceptual):** read `available` then `await` before decrementing, allowing competing requests to consume the same last unit.
- **Failure:** negative inventory / more successful purchases than stock.
- **Protection:** serialized FIFO request controller and synchronous `InventoryStore.reserve` in this single-process simulation.
- **Automated proof:** `npm test`: `no oversell after concurrent orders for the last units`.
- **Tested expected behavior:** 25 requests, stock 3 → exactly 3 locks and 22 rejected.
- **Boundary:** This does NOT establish a distributed lock or cross-device consistency.
- **Actual AI-generated bug found?** Not documented.

## 03 — Expired reservation is checked out

- **Unsafe pattern (conceptual):** accept checkout simply when `status === 'LOCKED'`, ignoring `expiresAt`.
- **Failure:** stale inventory sold after lock expiry.
- **Protection:** expiry sweep before every checkout/cancel, immutable status transition and inventory conservation invariant.
- **Automated proof:** `npm test`: `reservation lifecycle checkout and idempotent rejection`.
- **Tested expected behavior:** expired reservation refuses checkout and releases the unit.
- **Actual AI-generated bug found?** Not documented.

## Evidence status

- [ ] Local run: copy terminal output `npm test` into `evidence/test-output.txt`.
- [ ] Screenshot: sale timer and remaining stock.
- [ ] Screenshot: 20-buyer burst and invariant.
- [ ] Screenshot: expired lock and rejected checkout evidence (deterministic test output is acceptable).
- [ ] If an actual AI mistake is observed, document its *prompt, erroneous code, Git diff, manual fix, and retest*; do not fabricate an event.
