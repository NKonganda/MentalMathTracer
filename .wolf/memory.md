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
