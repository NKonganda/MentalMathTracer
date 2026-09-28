# Research prompt — grounding Mental Math Path's cost model in evidence

Paste the prompt below into a deep-research tool (ChatGPT Deep Research, Claude with web
search, Perplexity, Gemini). The engine's tunable weights it refers to live in
`src/engine/cost.ts`.

---

I'm building a tool that, given an arithmetic problem (e.g. 77×5, 48², 1000−423, 15% of
240), enumerates every applicable mental-math strategy, expands each into its
intermediate steps, and ranks them by predicted "mental cost" — how easy the path is to
execute in your head. I need you to research the cognitive science of mental arithmetic
and expert calculation practice, and turn it into concrete parameter recommendations for
my cost model.

## My current cost model (per step, summed over a strategy's step tree; lower = easier)

Scale: 1 unit ≈ 1,000 ms of net processing time (RT minus a ~500 ms encoding/response
intercept), per the 2026 evidence audit (Campbell 2008; Klein et al. 2010; Imbo et al.
2007; Hitch 1978).

- Base operation costs: add/subtract 1.0; multiply/divide by a single-digit number
  graded by the problem-size effect — 1.25 (factor ≤ 3), 1.5 (4–6), 1.75 (7–9), plus
  +0.2 for division (inverse-retrieval delay, Mauro et al. 2003); by a two-digit
  number 3.5 (central-executive load of cross-products); digit-shift (×10, ×100) 0.15;
  doubling 0.5 + 0.25 per digit ≥ 5 (each generates a carry); halving 0.4 for n ≤ 20
  (inverse tie), else 0.5 + 0.4 per odd digit above the units (each sends a
  Trachtenberg "+5" right — structurally a carry: 770→385 has two, 460→230 none);
  pattern recall (e.g. nines-complement digits, "append 25") 0.25.
- Penalties: superlinear operand-length load — 0.5 × (digits beyond 2)^1.2 per step;
  carries graded by column sum (Klein 2010) — +0.5 (sum 10–13) or +0.75 (14+);
  borrows +0.65 with each extra borrow at ×0.9 (concave rise, Imbo 2007); +0.25 extra
  for a multiplication carry ≥ 2 (active phonological maintenance); all waived on
  retrieved facts and on subtraction-by-addition hops (pure counting up);
  working-memory holds — 0.25 per held value per intervening step (decay, Hitch 1978),
  ×1.5 when more than 3 values are held concurrently (Cowan 2001); ×1.075 on a step
  right after one costing > 1.5 (sequential difficulty, Uittenhove & Lemaire 2012).
- Fact-retrieval nets (a retrieved fact costs this instead of the procedural base;
  lookup on operation × size × tie, Campbell 2008): addition tie 0.4, small (sum ≤ 10)
  0.5, teen 0.9; subtraction small/tie 0.7, teen (13−6) 1.4; multiplication tie
  (6×6…12×12) 0.4, small (product ≤ 25 or a five operand — the fives effect; also
  zero-stripped: 70×5 works like 7×5) 0.5, large non-tie 1.0, memorized two-digit
  squares (13²–25²) 1.0; division fact = its inverse multiplication fact + 0.2.
- Discounts: −0.75 off the procedural base for "anchor" facts on 25/50/75/100
  (75×5=375 — fast but derived); −0.3 when a step lands on a multiple of 10 (odd
  multiples of 25 are anchor territory, priced by the anchor discount instead); −1.0
  for subtraction by adding up, triggered when the subtrahend exceeds the difference
  (Peters et al. 2010) or the direct route needs ≥ 2 borrows (Torbeyns et al. 2011).

## What I need from you

1. **Fact retrieval.** What do reaction-time and error studies say about the relative
   cost of: small vs large times-table facts (the problem-size effect); ties (8×8) vs
   non-ties; multiplication vs division fact retrieval; single-digit vs teen addition?
   Key literature I'm aware of: Ashcraft (1992), Campbell & Xue (2001), LeFevre et al.,
   Zbrodoff & Logan. Give me RT ratios I can convert into discount magnitudes.
2. **Carries, borrows, and working memory.** How much do carry operations actually cost
   (Hitch 1978; Imbo, Vandierendonck et al. on WM load in arithmetic; Fürst & Hitch)?
   Is a carry closer to +0.3× or +2× the base operation? How does cost scale with the
   number of values held concurrently — linear, superlinear? Does phonological vs
   visuospatial load matter for the kinds of intermediate results my tool produces?
3. **Strategy selection in adults.** What does the strategy-choice literature (Siegler's
   ASCM/SCADS, LeFevre's work on procedure use in adults, Torbeyns et al. on
   subtraction-by-addition) say about which strategies people actually find easier, and
   when? Specifically: rounding-and-compensating vs decomposition (place-value split)
   for multi-digit problems — under what operand conditions does each win?
4. **Expert practice.** What step orderings and strategy preferences do expert mental
   calculators and standard trainers teach (Arthur Benjamin's *Secrets of Mental Math*,
   Trachtenberg system, Vedic math, soroban/anzan practitioners)? Where do their
   preferences contradict the lab literature, and why (practice effects)?
5. **Halving/doubling asymmetry.** Any evidence on the cost of halving numbers with odd
   tens digits (770÷2) vs even (460÷2), and doubling chains (×4 as double-double)?
6. **Missing strategies.** List named mental-math strategies my model should add beyond:
   place-value split, round-and-compensate, ×5=×10/2 (and ×25, ×125 analogues),
   difference of squares, factor-and-regroup, squares ending in 5, anchors at 50/100,
   left-to-right addition, complement subtraction, subtraction by adding up, factoring
   the divisor, percentage building blocks / swap / fraction shortcuts.

## Deliverable format

A table mapping each of my parameters (base costs, carry penalty, working-memory hold,
each discount tier, round-number bonus) to a recommended value or range, each with a
one-line justification and citation. Where the literature gives RTs, convert to relative
costs by normalizing a retrieved small times-table fact to ~0.25 and a one-carry
two-digit addition to ~2.0. Flag every recommendation that is extrapolation rather than
direct evidence. Finish with 10 test problems where your recommended weights would rank
strategies differently than mine would, so I can A/B the two parameterizations.

---
