# HW3 — One-pass setup, verification and Git guide (Windows CMD)

## A. Integrate without touching homework1/2

1. Extract the ZIP. Copy **only** the `homework3` folder into `C:\Users\Windows\Documents\Lab02_24520211_HW\`.
2. Open VS Code **at the existing repository root**; do not initialize a new Git repository.
3. In VS Code > Terminal (CMD) run:

```cmd
cd C:\Users\Windows\Documents\Lab02_24520211_HW\homework3
node -v
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

If Node.js is below 22, install Node.js LTS compatible with Vite 7 and the Node TS test runner. Test runner warnings about experimental TS stripping are expected on some Node 22 versions. Dev URL is given by Vite. Stop with Ctrl+C.

## B. One-pass manual acceptance checklist

From a fresh refresh:

- [ ] Dashboard starts at 12 available, 0 locked, 0 sold; sale clock ~05:00.
- [ ] Reserve one: 11 available, 1 locked. Checkout it: 11 available, 0 locked, 1 sold.
- [ ] Reserve another then Cancel: stock returns (11 available, 0 locked, 1 sold).
- [ ] Reserve and wait 15 sec: it becomes EXPIRED and quantity returns to available.
- [ ] Refresh (fresh stock). Click Simulate 20 buyers: 12 locks, 8 rejected, no oversell.
- [ ] Event log reports burst and stock invariant remains valid.
- [ ] Countdown time still accurate when returning from a background tab.
- [ ] Test responsive window, keyboard Tab + Enter, and Console for app errors.
- [ ] `npm test` -> 6 tests pass; `npm run typecheck` and `npm run build` have zero errors.

Use CMD capture **real** stdout:

```cmd
npm test > evidence\test-output.txt 2>&1
npm run build > evidence\build-output.txt 2>&1
```

Take actual screenshots of the dashboard, the burst and the DevTools console. Do not mark checks complete unless observed.

## C. Git — important integrity clarification

Lab 02 slide 32 explicitly asks for **minimum 8 discrete Conventional Commits**. The complete starter is already authored, so staging it in batches now organizes commits but **does not prove it was authored, tested or verified incrementally**. Prefer making real changes and running tests per module, recording genuine diffs. Do not fabricate the development history or rewrite HW1/2 commits.

Run all Git commands from `C:\Users\Windows\Documents\Lab02_24520211_HW>` (use `cd ..` from homework3). The following grouping gives at least 8 modular commits; they are not proof of chronological code generation:

**Commit 1 — scaffold/contracts**

```cmd
git add homework3/index.html homework3/package.json homework3/tsconfig.json homework3/vite.config.ts homework3/project-rules.md
git commit -m "chore(hw3): scaffold Vite project and engineering rules"
```

**Commit 2 — anti-drift timer**

```cmd
git add homework3/src/core/anti-drift-timer.ts
git commit -m "feat(hw3): implement absolute-deadline countdown"
```

**Commit 3 — inventory state machine**

```cmd
git add homework3/src/core/inventory.ts
git commit -m "feat(hw3): implement reservation lifecycle and stock invariants"
```

**Commit 4 — FIFO concurrency**

```cmd
git add homework3/src/core/request-queue.ts homework3/src/core/sale.ts
git commit -m "feat(hw3): serialize concurrent reservation requests"
```

**Commit 5 — UI countdown**

```cmd
git add homework3/src/components/Countdown.tsx
git commit -m "feat(hw3): display countdown with RAF cleanup"
```

**Commit 6 — flash-sale UI**

```cmd
git add homework3/src/App.tsx homework3/src/main.tsx homework3/src/styles.css
git commit -m "feat(hw3): integrate flash sale UI and checkout controls"
```

**Commit 7 — deterministic tests**

```cmd
git add homework3/tests/engine.test.ts
git commit -m "test(hw3): verify timer inventory and FIFO invariants"
```

**Commit 8 — documentation and audit**

```cmd
git add homework3/README.md homework3/TASK_DECOMPOSITION.md homework3/AI_FAILURE_AUDIT.md homework3/GIT_AND_TEST_GUIDE.md homework3/evidence/README.md
git commit -m "docs(hw3): describe architecture verification and AI risks"
```

**Commit 9 — genuine evidence if collected**

```cmd
git add homework3/evidence
git diff --cached --stat
git commit -m "docs(hw3): attach local test and screenshot evidence"
```

Skip commit 9 if no new evidence. Before pushing:

```cmd
git status
git --no-pager log --oneline -12
git push origin main
```

If any commit says nothing to commit / pathspec error: stop and inspect `git status`; do not fabricate empty commits. Git should ignore `homework3/node_modules/` and `homework3/dist/` via root `.gitignore`.

## D. Defense / important reasoning

- Why zero drift? `deadline - Date.now()` is recalculated; `requestAnimationFrame` only schedules refreshes, not elapsed time.
- Why FIFO? In one JS process, requests execute in their enqueue order and mutate stock synchronously.
- Can browser simulation handle real 1M concurrent cross-device orders? No; production needs server transactions, database locking, idempotency, authentication and authoritative server time.
- What guarantees no oversell here? `reserve()` updates one shared in-memory store synchronously after checking stock; invariant always holds in this isolated runtime.
- How are reservations released? `sweep()` expires LOCKED entries at or after `expiresAt`, checkout refuses expired locks.
- What if user switches tabs? RAF may pause, but deadline recomputation catches up on resume. Visual update frequency is not a precision guarantee.
