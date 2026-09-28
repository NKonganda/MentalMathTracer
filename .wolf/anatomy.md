# Anatomy — Mental Math Path

Vite + React 19 + TypeScript + Tailwind v4 (via @tailwindcss/vite). Vitest for tests. No backend; deployed to GitHub Pages (`base: './'` in vite.config.ts) — repo: https://github.com/NKonganda/MentalMathTracer, live: https://nkonganda.github.io/MentalMathTracer/.

## Layout
- `src/engine/` — pure TS strategy engine, no React imports
  - `types.ts` — Problem, Step (carries `op` + `operands` + optional cost-model `tags` like 'sba'), StepTree, Strategy, ScoredStrategy
  - `parse.ts` — input parser (`77*5`, `77 x 5`, `48^2`, `48²`, `15% of 240`, unicode × ÷ −); `n×n` becomes a square
  - `util.ts` — digit/carry/borrow counting, `carryColumnSums` (graded carry effect), `countMulCarries`, `factKind` (incl. teen sub facts 13−6), `oddDigitsAboveUnits` (halving), `highDigits` (doubling), `step()` builder
  - `cost.ts` — `WEIGHTS` config + `scoreTree()`; scale 1 unit ≈ 1000 ms net RT (2026 evidence audit); fact-retrieval nets by op × size × tie, graded carries/borrows, per-step WM holds, sequential-difficulty surcharge
  - `rank.ts` — `rank(problem)`: applies → expand → correctness-verify (never show wrong answers) → score → sort → dedupe identical trees
  - `strategies/` — one file per strategy (28 registered in `strategies/index.ts`)
  - `*.test.ts` — parse (26), strategies (253, table-driven), rank (7, explicit ordering), property (500 random problems)
- `scripts/rankings.ts` — prints full rankings for the tuning cases (`npm run rankings`)
- `src/ui/` — React, consumes engine output only
  - `App.tsx` — minimal start screen (title + input + hint only; no subtitle/chips/footer), live trace-as-you-type (300ms debounce via `useDebounced`; parse failures mid-typing keep last result, errors surface only on Enter; entrance animation plays on first reveal only), headline (`formatProblem` prettifies), top-3 cut + "Show all N", `?debug=1` shows everything with breakdowns open
  - `ResultCard.tsx` — strategy card: name, explain, step chain (mono, pen-blue intermediates, vermilion final), cost badge, collapsible per-item cost breakdown; `animate` prop gates the rise entrance
- `.github/workflows/deploy.yml` — GitHub Pages deploy (test → build → upload dist)
- `mocks/tree-trace.html` — standalone mock (no build step): tree-trace visualization of strategy paths — problem root → strategy columns → converging answer node, SVG wires drawn by JS, click-to-trace animation. Serve over http (file:// blocked in Playwright); design tokens duplicated inline from src/index.css.

## Design language
Editorial math-notebook: Fraunces display serif, IBM Plex Mono for equations, IBM Plex Sans body; warm paper bg with faint graph-paper grid (CSS gradients on body), hard-offset shadows, vermilion `--color-accent` for answers, `--color-pen` blue for intermediates. Tokens in `@theme` in `src/index.css`. Staggered `.rise` entrance animation, reduced-motion respected.

## Commands
- `npm test` / `npx vitest run`
- `npm run rankings` — cost-tuning output
- `npm run dev`, `npm run build` (tsc --noEmit + vite build)
