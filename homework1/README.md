# Homework 1 — Accessible Enterprise Data Grid

**Course:** Lab 02 — Modern React Architecture, Virtual DOM & State Machines  
**Stack:** React, TypeScript, Vite  
**Repository layout:** One repository with `homework1/`, `homework2/`, and `homework3/`. Only Homework 1 is implemented in this milestone.

## 1. Objective

Implement an enterprise-style data table with sorting, filtering, pagination, keyboard navigation, and accessible semantic markup. The design targets WCAG 2.2 AA principles; automated scores alone do not constitute full conformance.

## 2. Project structure

```text
homework1/
├── src/
│   ├── components/DataGrid.tsx  # table interaction and accessible markup
│   ├── data/employees.ts       # sample records
│   ├── types/grid.ts           # TypeScript contracts
│   ├── App.tsx                 # app composition
│   ├── main.tsx                # React entry point
│   └── styles.css              # layout, focus styles, responsiveness
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── project-rules.md
├── TASK_DECOMPOSITION.md
├── AI_FAILURE_AUDIT.md
└── README.md
```

## 3. Setup and run

Requirements: Node.js 20.19+ or 22.12+ compatible with the installed Vite version, and npm.

From the repository root:

```bash
cd homework1
npm install
npm run dev
```

Open the local URL printed by Vite.

Type-check and production build:

```bash
npm run typecheck
npm run build
npm run preview
```

To stop a running server, press `Ctrl+C` in its terminal.

## 4. Features and usage

- **Sort:** Click a sortable column heading to alternate ascending/descending ordering. Header buttons expose the sort state.
- **Filter:** Type in “Search all columns”; search covers the displayed data fields.
- **Pagination:** Five employees per page; use Previous page and Next page to navigate.
- **Keyboard:** Tab to a grid cell, then use the four arrow keys to move within the currently displayed page; Home/End jump to the first/last column.
- **Selection:** Enter or Space on a focused cell toggles that row's selection. `Selected rows` shows the total selected items.
- **Accessibility:** Semantic HTML table with grid/row/gridcell roles, `aria-label`, `aria-selected`, `aria-sort`, live result summary, and visible keyboard focus.
- **Responsive layout:** Horizontal scrolling lets users access columns on narrower viewports.

## 5. Verification results

The following reflects the developer's manual test session; attach screenshots for submission.

| Check | Result |
| --- | --- |
| TypeScript `typecheck` and production `build` | Completed without reported errors |
| Arrow navigation within visible cells | Manual test passed |
| Enter selects the “Son Vu” row | Manual test passed |
| Selected count `0` → `1` | Confirmed in screenshot |
| `aria-selected="false"` → `"true"` | Confirmed in DevTools screenshot |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | Initially 96 because of a browser extension error; user reported extension-free rerun was OK — retain final screenshot |

**Still to verify:** Space toggle separately, focus continuity on changing pages, a 320px viewport, screen-reader announcements, manual contrast checks, XSS regression, and stable identity following sorting/filtering. See `AI_FAILURE_AUDIT.md`.

## 6. Git workflow

Work is divided into independent milestones rather than a single monolithic commit:

1. `e675ef5` — project rules and structure
2. `d369be3` — React + TypeScript + Vite setup
3. `ea4ea79` — DataGrid contracts
4. `f59d128` — employee dataset
5. `88656f2` — accessible DataGrid engine
6. `29dcfaa` — interface and responsive styles

Documentation/audit evidence is maintained separately. Run `git log --oneline` for the authoritative current history.

## 7. Known limitations

- Arrow keys navigate cells on the **current page**, not across page boundaries.
- Sorting headers and pagination controls are reached with Tab rather than the cell-arrow navigation model.
- Focus after paging/filtering has not been fully evaluated with assistive technology.
- Lighthouse 100 does not certify compliance with every WCAG 2.2 AA success criterion.
- The sample dataset is local; no API/server persistence is implemented.

## 8. Submission checklist

- [x] Separate project under `homework1` within one shared repository
- [x] Source code, TypeScript contracts, and Git milestone commits
- [x] Working sorting/filtering/pagination and basic keyboard selection implementation
- [x] Lighthouse Accessibility 100 reported
- [ ] Attach final extension-free Best Practices screenshot
- [ ] Complete manual accessibility checks
- [ ] Complete pending AI-risk reproduction checks or clearly label them unverified
- [ ] Add proof screenshots and review the final Git diff
- [ ] Push repository to GitHub

## 9. Engineering accountability

See `project-rules.md` and `TASK_DECOMPOSITION.md` for the contract-first workflow and work breakdown; see `AI_FAILURE_AUDIT.md` for reproducible risks, confirmed results, and evidence requirements. Do not present potential failure modes as actual observed AI defects without proof.
