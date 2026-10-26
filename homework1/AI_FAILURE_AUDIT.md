# HW1 — AI Failure Audit: Controlled Reproduction and Manual Verification

**Project:** Accessible Enterprise Data Grid (React + TypeScript + Vite)  
**Scope:** Homework 1 only  
**Evidence:** `reproduce-audit.mjs`, `evidence/audit-run.txt`, plus browser/DevTools checks reported during development.

> **Evidence integrity:** The original saved DataGrid source contains the mitigations below. There is no historical Git diff showing three AI-generated failures previously introduced into the production component. To demonstrate engineering understanding, the audit supplies **three intentionally constructed, reproducible failing variants** and corrected variants. They are real failures of the isolated tests, **not claims that an AI previously caused these bugs in the submitted application**. The production app is not modified by the reproduction script.

## How to reproduce all three failures and fixes

From `homework1/` run:

```bash
node reproduce-audit.mjs
```

The script tests the **flawed implementation (BEFORE)**, confirms the invariant fails, then tests the **corrected implementation (AFTER)**, confirms it passes, and writes `evidence/audit-run.txt`. No extra npm package is needed; Node.js provides the built-in assertions and EventTarget.

## Case 01 — Unsafe HTML interpolation / XSS

**Flawed variant (isolated):** embedding untrusted content in an HTML string without escaping, modeled as `` `<td>${value}</td>` ``. Given `<img src=x onerror=alert(1)>`, the resulting HTML contains a real tag if inserted into the DOM with an HTML-parsing API.

**Observed in controlled test:** BEFORE = `FAIL_REPRODUCED` (raw `<img` remains in HTML).  
**Correction:** escape special HTML characters in the isolated string-rendering example. In the **actual React DataGrid**, render `String(item[column.accessorKey])` as text within JSX and avoid `dangerouslySetInnerHTML` for untrusted data.  
**Controlled retest:** AFTER = `PASS` (`&lt;img` is encoded).  
**Browser check already performed:** test input appeared literally in the cell and DevTools showed escaped markup rather than an injected `<img>` element. This demonstrates resistance for the tested vector, not immunity to all XSS vectors.

## Case 02 — Duplicate event listener attachment

**Flawed variant (isolated):** attach two distinct `click` listeners for the same behavior and dispatch a single click.

**Observed in controlled test:** BEFORE = `FAIL_REPRODUCED` (one click invoked the callback twice).  
**Correction:** attach the intended listener once, or clean up listeners when an effect re-runs. The **actual React DataGrid** uses React event props rather than registering custom document listeners per render.  
**Controlled retest:** AFTER = `PASS` (one callback per click).  
**Browser check already performed:** DevTools inspection showed a click listener count of `1` on the checked cell before and after repeated interactions. This is preliminary evidence only and does not prove the absence of all memory leaks.

## Case 03 — Index keys do not preserve row identity

**Flawed variant (isolated):** use each row's list index as its identity. After changing order, the former selected index points at a different employee.

**Observed in controlled test:** BEFORE = `FAIL_REPRODUCED` (selection follows the position and resolves to the wrong employee).  
**Correction:** use a stable record identifier (`key={item.id}`) and track selection by `item.id`, as in the **actual DataGrid**.  
**Controlled retest:** AFTER = `PASS` (the selected ID is still `114`, Son Vu).  
**Browser check already performed:** Son Vu remained selected after sort and filter; no different employee became selected. Note: the isolated test models the identity bug rather than running React reconciliation itself.

## Additional HW1 checks reported

| Check | Outcome | Evidence level |
|---|---|---|
| Sorting / filtering / pagination | Working | User-tested in browser |
| Arrow keys within the visible grid | Working | User-tested in browser |
| Enter to select, Space to deselect | Working | User-tested in browser |
| `aria-selected` false → true and selected count 0 → 1 | PASS | DevTools screenshot |
| Keyboard activation of pagination | Focus remained accessible | User-tested in browser |
| Lighthouse Accessibility | 100 | User-reported browser result |
| Lighthouse Best Practices | 100 after extension isolation | User-reported browser result; previous 96 caused by a Chrome extension console error |
| Complete WCAG 2.2 AA conformance, NVDA/VoiceOver | Not established | Requires manual screen-reader and comprehensive accessibility testing |

## Output of automated controlled audit

```text
01 HTML injection: BEFORE=FAIL_REPRODUCED; AFTER=PASS
02 Duplicate event listener: BEFORE=FAIL_REPRODUCED; AFTER=PASS
03 Unstable index key on reorder: BEFORE=FAIL_REPRODUCED; AFTER=PASS
RESULT: 3/3 flaws reproduced; 3/3 corrections passed.
```

## Submission evidence and limitations

- `reproduce-audit.mjs` is the executable reproduction and before/after test specification.
- `evidence/audit-run.txt` records the verified Node.js execution result.
- The prior DevTools screenshots of XSS output, `aria-selected`, and Lighthouse should be added to `evidence/` from the student's actual Chrome session if required by the instructor. The automated script cannot generate authentic browser screenshots.
- The current app's source was **not changed** by the deliberately flawed test cases. They must not be represented as a historical AI mistake followed by a real Git fix in the app.
- If the instructor explicitly requires **three actual AI mistakes from the development history**, that requirement is **not yet evidenced** by this controlled reproduction; only genuine, traceable past errors and repairs qualify.
