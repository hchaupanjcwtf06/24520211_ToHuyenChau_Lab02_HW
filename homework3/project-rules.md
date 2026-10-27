# Engineering Rules — HW3

1. Scope: only `homework3/` in the existing Lab 02 repository. Do not modify `homework1`/`homework2`.
2. Contract-first: `anti-drift-timer.ts` and `inventory.ts` types/invariants before UI.
3. Never derive elapsed time by incrementing a counter with `setInterval`. Always use an absolute deadline and current clock time.
4. Stock conservation invariant: `available + locked + sold === total`; never oversell or checkout an expired lock.
5. Treat reservation operations as atomic within a single runtime; queue simulated competing requests FIFO.
6. This is **not** a secure distributed production payment system. Do not claim a browser-local queue protects inventory across users/devices.
7. Do not use raw `innerHTML`, implicit globals, fake payment APIs or external assets.
8. Commit meaningful, tested changes separately; do not retroactively claim Git history proves real incremental development.
9. Maintain `AI_FAILURE_AUDIT.md` with >=3 documented AI-risk cases and genuine observed test evidence. Label intentionally injected regressions truthfully.
10. Run `npm test`, `npm run typecheck`, `npm run build` and complete the manual checklist prior to final push.
