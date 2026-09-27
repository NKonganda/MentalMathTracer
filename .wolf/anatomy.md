# Anatomy — Mental Math Path

Vite + React 19 + TypeScript + Tailwind v4 (via @tailwindcss/vite). Vitest for tests. No backend; deployed to GitHub Pages (`base: './'` in vite.config.ts) — repo: https://github.com/NKonganda/MentalMathTracer, live: https://nkonganda.github.io/MentalMathTracer/.

## Layout
- `src/engine/` — pure TS strategy engine, no React imports
  - `types.ts` — Problem, Step (carries `op` + `operands` for the cost model), StepTree, Strategy, ScoredStrategy
  - `parse.ts` — input parser (`77*5`, `77 x 5`, `48^2`, `48²`, `15% of 240`, unicode × ÷ −); `n×n` becomes a square
  - `util.ts` — digit/carry/borrow counting, `isKnownFact`, `tensDigitOdd` (halving difficulty), `step()` builder
  - `cost.ts` — `WEIGHTS` config object + `scoreTree()`; all tuning happens in WEIGHTS
  - `rank.ts` — `rank(problem)`: applies → expand → correctness-verify (never show wrong answers) → score → sort → dedupe identical trees
  - `strategies/` — one file per strategy (28 registered in `strategies/index.ts`)
  - `*.test.ts` — parse (26), strategies (253, table-driven), rank (7, explicit ordering), property (500 random problems)
- `scripts/rankings.ts` — prints full rankings for the tuning cases (`npm run rankings`)
- `src/ui/` — React, consumes engine output only
  - `App.tsx` — input (parse on Enter, inline errors), try-these chips, headline (`formatProblem` prettifies), top-3 cut + "Show all N", `?debug=1` shows everything with breakdowns open
  - `ResultCard.tsx` — strategy card: name, explain, step chain (mono, pen-blue intermediates, vermilion final), cost badge, collapsible per-item cost breakdown
- `.github/workflows/deploy.yml` — GitHub Pages deploy (test → build → upload dist)

## Design language
Editorial math-notebook: Fraunces display serif, IBM Plex Mono for equations, IBM Plex Sans body; warm paper bg with faint graph-paper grid (CSS gradients on body), hard-offset shadows, vermilion `--color-accent` for answers, `--color-pen` blue for intermediates. Tokens in `@theme` in `src/index.css`. Staggered `.rise` entrance animation, reduced-motion respected.

## Commands
- `npm test` / `npx vitest run`
- `npm run rankings` — cost-tuning output
- `npm run dev`, `npm run build` (tsc --noEmit + vite build)
