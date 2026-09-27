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

- Base operation costs: add/subtract 1.0; multiply/divide by a single-digit number 1.5;
  by a two-digit number 3.0; digit-shift (×10, ×100) 0.25; doubling 0.75; halving 0.5
  when the tens digit is even (460→230) but 2.0 when odd (770→385, forces a split);
  pattern recall (e.g. nines-complement digits, "append 25") 0.25.
- Penalties: +0.5 per operand digit beyond 2; +1.0 per carry or borrow (waived when
  subtracting a single-digit number — "counting back"); +0.75 per intermediate value
  that must be held in working memory while another computation runs.
- Discounts: −1.25 for a times-table fact (7×5, also 70×5 after stripping zeros, and
  memorized squares ≤ 25²); −0.5 for "anchor" facts on 25/50/75/100 (75×5=375 — fast
  but derived); −0.75 for division facts (retrieved via inverse multiplication); −0.5
  when a step lands on a round number (multiple of 10/25/100).

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
