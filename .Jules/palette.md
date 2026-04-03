## 2026-04-03 - Added ARIA labels to icon-only buttons
**Learning:** Found multiple instances of icon-only buttons (e.g., menu toggles, modal close buttons, back buttons) across the application (`App.tsx`, `DailyHoroscopeModal.tsx`, `PoruthamDetailModal.tsx`) missing descriptive `aria-label` attributes, which hinders screen reader navigation.
**Action:** Always ensure any `<button>` containing only an icon (like Lucide's `<X />` or Google Material Symbols) has a clear, context-aware `aria-label` added for proper accessibility.
