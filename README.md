# Mental Math Path

Type an arithmetic problem and get the best mental-math strategies for solving it, ranked by cognitive cost. Supports multiplication, squares, division, and percentages (`77*5`, `48²`, `15% of 240`), with step-by-step breakdowns for each strategy.

## How it works

- A pure TypeScript engine (`src/engine/`) applies 28 registered strategies to the parsed problem, expands each into a step tree, verifies correctness, then scores and ranks them with a tunable cost model (`src/engine/cost.ts`).
- A React UI (`src/ui/`) renders the top strategies as cards with the step chain and a collapsible per-step cost breakdown. Add `?debug=1` to see every strategy with breakdowns open.

## Development

```sh
npm install
npm run dev        # start the dev server
npm test           # run the vitest suite
npm run rankings   # print full rankings for the cost-tuning cases
npm run build      # typecheck + production build
```

Built with Vite, React 19, TypeScript, and Tailwind CSS v4. Deploys to GitHub Pages via `.github/workflows/deploy.yml`.
