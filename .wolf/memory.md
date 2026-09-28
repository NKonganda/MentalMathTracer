# Memory — Mental Math Path

## 2026-09-27 — initial build (engine + tests, UI deferred)
- Scaffolded Vite/React/TS/Tailwind4/Vitest from scratch; wrote pure-TS strategy engine: 28 strategies, cost model, ranker, parser.
- 287 tests green (parse, per-strategy applies/expand, rank ordering, 500-problem property test). tsc clean.
- Required orderings verified: 77×5→round-down-75 (x10-halve NOT top), 46×5→x10-halve, 23×17→difference-of-squares, 48²→near-50 (no bogus 50²−2² anywhere), 16×25→factor-regroup, 1000−423→complement.
- Cost-model decisions that make the required orderings work (see buglog too):
  - halve step cost keyed on tens-digit parity of the operand (770 hard, 460 easy)
  - shift steps get no round-number bonus and no digit penalty (their roundness is automatic)
  - subtracting a single-digit number incurs no borrow penalty ("counting back") — this is what lets 400−9 stay cheap so difference-of-squares wins 23×17
  - per-step known-fact discount includes times tables (after stripping trailing zeros), squares ≤25², and 25/50/75/100 quarter facts
  - rank() dedupes identical step trees (round-down at 20 vs place-value split of 23 collide)
- UI intentionally NOT built yet: user asked to review ranking output and tune weights first.

## 2026-09-27 — UI built ("Complete the construction"); weights accepted as-is
- Built the full UI per spec: big autofocus input (Enter to parse, inline errors, aria-invalid/alert), top-3 strategy cards with step chains + cost badges + collapsible "why this cost" breakdowns, "Show all N strategies" expander, ?debug=1 shows all with breakdowns open, try-these chips, mobile-friendly.
- Design: editorial math-notebook (Fraunces + IBM Plex Mono/Sans, graph-paper paper bg, vermilion/pen-blue accents) — see anatomy.md.
- Verified in browser via Playwright: desktop + 390px mobile screenshots, cost breakdown toggle, error state, debug banner, headline prettification (raw "48^2" → "48²" via formatProblem in App.tsx). Only console error was favicon 404 → fixed with inline SVG data-URI icon.
- Added .github/workflows/deploy.yml (Pages: npm ci → test → build → deploy dist). Final state: 287 tests green, tsc clean, prod build 79 kB gzip JS.
- Not committed to git — user hasn't asked; note the repo's git root appears to be above the project dir.

## 2026-09-27 — cost model retune (user correction) + research prompt
- User: 77×5 should rank place-value-split first (70×5 is table-grade via 70×10/2, 7×5 is a table fact); the flat known-fact discount overvalued 75×5. See cerebrum.md.
- Replaced isKnownFact with factKind('table'|'anchor') in util.ts; WEIGHTS now: timesTableDiscount 1.25, anchorFactDiscount 0.5, divisionFactDiscount 0.75, smallAddSubDiscount 0.75, recall 0.25 (knownFactDiscount removed). rank.test 77×5 expectation updated to place-value-split.
- New 77×5 order: place-value 2.25, round-down 2.50, x10-halve 2.75. All other required orderings unchanged; 287 tests green.
- Wrote docs/research-prompt.md — deep-research prompt (cognitive arithmetic literature → weight recommendations); keep it in sync with cost.ts on future retunes.

## 2026-09-27 — repo created and published to GitHub
- Initialized standalone git repo (previously the project sat inside a git repo rooted at the home directory — no repo of its own).
- Added README.md, ignored .playwright-mcp in .gitignore, initial commit on main.
- Published public repo https://github.com/NKonganda/MentalMathTracer (gh repo create --push).
- Enabled Pages with build_type=workflow via API; first workflow run failed at deploy-pages (404, Pages not yet enabled), rerun succeeded. Live at https://nkonganda.github.io/MentalMathTracer/.

## 2026-09-27 — Tree trace mock UI
Built `mocks/tree-trace.html`: standalone (no Vite) mock showing mental-math paths as a tree. Root = problem (77 × 5), three strategy columns (×10-then-halve / split-the-tens / round-up-&-repair), all wires converge on a single answer node (385). SVG connector layer computed via getBoundingClientRect (redrawn on resize); substeps rendered as dashed satellite nodes off to the side. Click a path (or Enter/Space, cols are focusable) to trace it: segments draw sequentially via stroke-dashoffset, nodes light in accent, answer pulses; winner auto-traces on load; reduced-motion skips animation. Matches app design language (Fraunces/Plex Mono/paper grid/vermilion/pen-blue, hard-offset shadows). Verified in Playwright over local http server (file:// is blocked by the Playwright MCP).
| 16:25 | Recalibrated cost model to research-derived weights (graded fact bases 1.25–1.75, div +0.25, 2-digit 3.5, shift 0.15, double 0.4, halveHard 2.5, superlinear digit penalty ^1.2, high-carry +0.75, graded WM holds 0.5/1.25, discount tiers 1.25/1.0/0.75/0.5, SBA −1.0) | src/engine/cost.ts, util.ts, types.ts, strategies/addUp.ts, docs/research-prompt.md | 287/287 tests pass, build clean | ~9k |
| 17:16 | Analyzed 810/9 ranking: zero-strip division (strip trailing 0 → table fact → shift back) is not modeled; only factor-divisor applies (cost 2.50) | src/engine/strategies/ | gap identified, not yet implemented | ~2k |
| 17:30 | Recalibrated cost model v2 to the completed evidence audit (user pasted deliverable of research-prompt): fact NETS by op×size×tie (Campbell 2008), graded carries by column sum (Klein 2010), borrows 0.65 ×0.9 taper (Imbo 2007), WM holds 0.25/intervening step (Hitch 1978), per-odd-digit halving, per-high-digit doubling, seq-difficulty surcharge, addUp SBA trigger = subtrahend>difference or ≥2 borrows; 77×5 rank test flipped to x10-halve per audit A/B #1 | src/engine/cost.ts, util.ts, strategies/addUp.ts, rank.test.ts, docs/research-prompt.md | 287/287 tests pass, build clean | ~14k |
| 2026-09-28 | Stripped start screen to title + textbox + Enter hint (removed subtitle, try-these chips, footer); results output unchanged | src/ui/App.tsx, .wolf/anatomy.md | tsc clean | ~4k |
| 11:32 | Assessed feasibility of live trace-on-keystroke (no code changes) | src/ui/App.tsx | assessment only | ~3k |
| 11:41 | Implemented live trace-on-keystroke (300ms debounce, errors only on Enter, first-reveal-only animation); verified in browser via Playwright; 287 tests + build pass | src/ui/App.tsx, src/ui/ResultCard.tsx | success | ~12k |
| 11:52 | Removed debounce + result animations: trace renders synchronously in onChange; verified instant in browser; 287 tests + build pass | src/ui/App.tsx, src/ui/ResultCard.tsx | success | ~6k |
