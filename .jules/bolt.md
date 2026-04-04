## 2024-05-18 - [Optimizing Pure Components with complex props]
**Learning:** Pure components like `DasaTimeline`, `MuhurthamFinder`, and `RasiChart` that take large objects/arrays as props can trigger expensive reconciliations if their parents re-render frequently (e.g. `App.tsx` handling many state values).
**Action:** Use `React.memo` for components rendering lists, charts, or heavy DOM structures. Always ensure that the parent state passes stable references (e.g., from `useState` or `useMemo`) to these props so `React.memo`'s shallow comparison doesn't falsely fail.

## 2024-10-24 - [Astrology Calculation & Architecture Conventions]
**Learning:** The application heavily relies on pure Drik Ganita and Kerala traditions. All major computations (Tarabalam, Kuja Ashtamam, exact Rahu Kaal, etc.) must utilize exact astronomical logic via `astronomy-engine`, and should not be mocked or hardcoded.
**Action:** When creating new features relying on complex calculations, offload them to `src/workers/astro.worker.ts` to prevent UI thread blocking. Ensure star names align strictly with Kerala Malayalam terminology.
