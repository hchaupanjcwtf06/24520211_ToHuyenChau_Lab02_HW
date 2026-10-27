# HW3 Task Decomposition (WBS)

Source: Lab 02 slide 32 + slide 5 AI-assisted workflow.

- [x] Contract 1: absolute-deadline countdown and injectable clock.
- [x] Contract 2: inventory states `LOCKED` / `CHECKED_OUT` / `EXPIRED` / `CANCELLED`.
- [x] Engine 1: RAF anti-drift timer with cleanup.
- [x] Engine 2: inventory conservation and lock expiry.
- [x] Engine 3: FIFO serialized request simulation.
- [x] UI 1: countdown, pricing, live stock dashboard.
- [x] UI 2: simulated burst, reservation table, checkout / cancel and event logs.
- [x] Tests: deterministic timing, oversell, expiry, checkout and FIFO.
- [ ] Verification on student's Windows machine: npm install / typecheck / test / build / Chrome interaction.
- [ ] Capture actual screenshots and record observations in evidence/.
- [ ] Audit: document >=3 risks and measured proof; existing examples are not claimed as observed AI mistakes.
- [ ] Create >=8 meaningful commits (slide 32) and push within existing repo; do not reset prior history.
