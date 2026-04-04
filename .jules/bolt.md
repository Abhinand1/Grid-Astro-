## 2024-05-18 - [Optimizing Pure Components with complex props]
**Learning:** Pure components like `DasaTimeline`, `MuhurthamFinder`, and `RasiChart` that take large objects/arrays as props can trigger expensive reconciliations if their parents re-render frequently (e.g. `App.tsx` handling many state values).
**Action:** Use `React.memo` for components rendering lists, charts, or heavy DOM structures. Always ensure that the parent state passes stable references (e.g., from `useState` or `useMemo`) to these props so `React.memo`'s shallow comparison doesn't falsely fail.
