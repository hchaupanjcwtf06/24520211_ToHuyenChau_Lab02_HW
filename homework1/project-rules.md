# Project Rules — HW1

1. Contract-first: define `ColumnDef<T>` and `DataGridProps<T>` before implementation.
2. Work in atomic slices; verify each slice independently before its Git commit.
3. Use React + TypeScript + Vite (implementation choice; not an explicit slide tooling mandate).
4. Use semantic `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, `<button>` and proper WAI-ARIA grid semantics.
5. Prefer text nodes and React escaping; never render raw user content with `dangerouslySetInnerHTML`.
6. No `var`, `keypress`, `keyCode`, inline HTML handlers, or direct unsafe DOM injection.
7. Keyboard controls: arrow keys navigate body cells, Enter/Space toggle row selection.
8. Accessible names, visible keyboard focus, status feedback, sufficient contrast, responsive layout.
9. Validate with browser DevTools, keyboard-only interaction, screen reader, Lighthouse and build. Never claim WCAG certification based only on Lighthouse.
10. Keep HW2 and HW3 independent; do not implement them during HW1.
