# Lab 02 — Modern React Architecture, Virtual DOM & State Machines

**Student ID:** 24520211
**Repository:** [24520211_ToHuyenChau_Lab02_HW](https://github.com/hchaupanjcwtf06/24520211_ToHuyenChau_Lab02_HW)
**Course:** Web Application Development — Lab 02

## Overview

This repository contains three independent homework projects for Lab 02. Each homework lives in its own folder, with its own package configuration, source files, tests (where applicable), and documentation. All projects share a single Git repository and its `main` branch.

| Homework | Project | Main topics |
| --- | --- | --- |
| [Homework 1](./homework1/README.md) | Accessible Enterprise Data Grid | Sorting, filtering, pagination, keyboard navigation, ARIA grid and row selection |
| [Homework 2](./homework2/README.md) | Concurrent FIFO Audio Visualizer Queue Engine | Web Audio API, FIFO task queue, cancellation, FFT analysis, Canvas visualizer |
| [Homework 3](./homework3/README.md) | High-Concurrency Flash-Sale Engine | Anti-drift countdown, inventory state machine, reservation expiry, high-concurrency simulation |

## Repository structure

```text
Lab02_24520211_HW/
├── homework1/
│   ├── src/
│   ├── README.md
│   ├── project-rules.md
│   ├── TASK_DECOMPOSITION.md
│   └── AI_FAILURE_AUDIT.md
├── homework2/
│   ├── src/
│   ├── tests/
│   ├── evidence/
│   ├── README.md
│   ├── project-rules.md
│   ├── TASK_DECOMPOSITION.md
│   └── AI_FAILURE_AUDIT.md
├── homework3/
│   ├── src/
│   ├── tests/
│   ├── evidence/
│   ├── README.md
│   ├── project-rules.md
│   ├── TASK_DECOMPOSITION.md
│   ├── AI_FAILURE_AUDIT.md
│   └── GIT_AND_TEST_GUIDE.md
├── .gitignore
└── README.md
```

Other project-specific files include `package.json`, `index.html`, `tsconfig.json`, and Vite configuration as applicable.

## Requirements

- Node.js and npm (use a recent LTS release compatible with the installed Vite version).
- A modern browser such as Chrome or Edge.
- Git for version control.

## Run each homework

Run these commands from the **repository root** in separate terminal sessions. To stop a development server, press `Ctrl + C`.

### Homework 1 — Data Grid

```bash
cd homework1
npm install
npm run dev
```

### Homework 2 — Audio Visualizer

```bash
cd homework2
npm install
npm run dev
```

### Homework 3 — Flash Sale

```bash
cd homework3
npm install
npm run dev
```

Open the local URL printed by Vite. When switching between projects in a single terminal, return to the root with `cd ..` before entering another homework folder.

## Build and tests

Inside each homework folder, run:

```bash
npm run typecheck
npm run build
```

For Homework 2 and Homework 3, also run:

```bash
npm test
```

The code was prepared and checked with AI assistance. Local functional checks and automated-test outcomes are recorded in project-specific documentation; do not treat a passing unit test as proof of full browser, accessibility, security, or production readiness.

## Design and verification notes

### HW1

- Keyboard interaction in data grid cells; Enter/Space row selection.
- Filtering, sorting and pagination; accessible labels and selection state.
- Lighthouse Accessibility and Best Practices scores were reported as 100/100 during local checks.
- Manual full WCAG 2.2 AA conformance and screen-reader coverage are not claimed.

### HW2

- Audio playback and FFT visualization using browser APIs.
- FIFO order, cancellation and cleanup scenarios in the test suite.
- The missing favicon console warning was fixed locally; see the project README/audit for remaining verification notes.

### HW3

- Date-based countdown and an inventory reservation/checkout lifecycle.
- Tests cover core concurrency/inventory invariants and cancellation/expiry behaviors.
- The reservation table layout was adjusted for narrower screens.

## Engineering workflow and AI audit

The lab follows a contract-first, task-decomposition and independent-verification approach. Every homework includes `project-rules.md`, `TASK_DECOMPOSITION.md`, and `AI_FAILURE_AUDIT.md` to record scope, architectural choices, risks and tests.

**Evidence integrity:** Reproduced failure scenarios must be labeled as reproductions; they are not historical proof that AI actually generated those bugs. Git commits classify project changes and should not be misrepresented as a chronological record of generation when the files were prepared ahead of time.

## Submission guidance

Review each homework's README and evidence folder, confirm the working tree is clean, and run relevant checks before submission:

```bash
git status
git log --oneline -15
```

The three homework projects are submitted together through this repository. Do not commit `node_modules/`, `dist/`, secrets, or local environment files.
