# Cerebrum — Mental Math Path

## Preferences
- User thinks in graded fact-retrieval terms: times-table facts (incl. zero-stripped ones like 70×5, which they mentally do as 70×10/2) are "very low cost"; anchor facts like 75×5 are NOT equally free. Ranking must reflect this.
- User wants evidence-grounded weights: keep `docs/research-prompt.md` in sync with the cost model whenever weights change, so their online research stays applicable.
- 2026-09-28: User wants a minimal start screen — only the title, the input textbox, and the hint. No subtitle, no try-these example chips, no footer. Post-input results output stays full.
- 2026-09-28: User prioritises showing the trace ASAP over polish: NO debounce and NO entrance animation on the results section — trace renders synchronously on every keystroke. (Transient intermediate answers while typing multi-digit numbers are accepted.) Header/input entrance `.rise` stays.

## Learnings
- 2026-09-27: User overrode their original spec for 77×5 (spec said round-to-75/80 top; user now wants place-value-split top because 70×5 + 7×5 are both table-grade). rank.test.ts updated accordingly — the spec document is not immutable; user's latest word wins.
- Cost model now uses graded discounts (timesTableDiscount 1.25 > divisionFactDiscount 0.75 > anchorFactDiscount 0.5; smallAddSubDiscount 0.75; recall 0.25). When retuning, re-verify ALL six rank.test orderings — they are tightly coupled (16×25 factor-regroup vs x100-quarter nearly flipped during this change).
- 2026-09-27 (recalibration): weights now research-derived — fact bases graded 1.25/1.5/1.75 by smaller factor, div +0.25, 2-digit mul 3.5, shift 0.15, double 0.4, halveHard 2.5, digit penalty 0.5×extra^1.2, mul carries penalized (+1.0, +0.75 extra when carry > 1; skipped for retrieved facts), WM holds graded 0.5 first / 1.25 each extra, table discounts tiered −1.25 tie/small/fives vs −1.0 large, anchor −0.75, division fact −0.5, SBA −1.0 (via 'sba' step tag from addUp when distance < 20; tagged hops also skip carry/borrow).
- The "fives effect" is load-bearing: ×5 table facts must sit in the easy discount tier (−1.25) or round-down-compensate beats place-value-split on 77×5 (7×5 would grade "large"). Easy tier = tie || min factor ≤ 3 || a five operand.
- Round-number bonus applies to multiples of 10 ONLY. Odd multiples of 25 (375, 425) are anchor territory — giving them the round bonus double-counts the anchor fact discount and re-creates the 77×5 regression.

- 2026-09-27 (audit v2): cost model rebuilt to the evidence audit the user's research prompt produced (Campbell 2008, Klein 2010, Imbo 2007, Hitch 1978). Scale now 1 unit ≈ 1000 ms net RT. Facts are priced by NET (op × size × tie lookup: add tie 0.4 / small 0.5 / teen 0.9; sub 0.7/1.4; mul tie 0.4 / small-or-five 0.5 / large 1.0; div = mul + 0.2), not by a discount tier. Carries graded by column sum (0.5 / 0.75); borrows 0.65 with ×0.9 taper; WM holds 0.25 × intervening steps (×1.5 past 3 concurrent); halving 0.5 + 0.4 per odd digit above units; doubling 0.5 + 0.25 per digit ≥ 5; round bonus 0.3; addUp SBA triggers on subtrahend > difference or ≥ 2 borrows.
- 2026-09-27 (audit v2): the audit REVERSED the user's earlier 77×5 preference — per-odd-digit halving prices 770÷2 at 1.3, so x10-halve (1.95) now beats place-value-split (2.45), exactly as the audit's A/B table #1 predicts. rank.test.ts updated. If the user objects, the knob is `halvePerOddDigit` (0.4 → ~0.65 restores split-top).
- The "fives effect" survives audit v2: a five operand puts a mul fact in the small net (0.5) regardless of product size. The old "min factor ≤ 3" easy-tier criterion was replaced by the audit's product ≤ 25 convention (Campbell & Xue 2001).
- Anchor facts must stay a DISCOUNT off the procedural base (−0.75), never a flat net: a flat 0.75 net made two-digit anchors (16×25) as cheap as 7×8 and quarter-anchor wrongly topped 16×25.
- NOT yet implemented from the audit: explicit error-probability term (folded into fact nets — large fact 1.0 sits inside the recommended 0.9–1.1 band), skill profiles (general vs trained: hold ×0.5, two-digit-square fact set), and the ~18 missing strategies in the audit's trigger table (constant difference, Nikhilam, ×11/×12 rules, aliquot division, close-together…).

- 2026-09-28 (live trace): results trace synchronously in the input's onChange (no debounce, no effect, no result animations — user's explicit preference; the initial 300ms-debounce version was replaced same day). Parse failures mid-typing silently keep the last result (no error flicker); parse errors surface only on Enter; empty input clears results; "Show all" only resets when the parsed problem actually changes.

## Do-Not-Repeat
- Do not give one flat "known fact" discount to both times-table facts and 25/50/75 anchor facts — that's what made round-down-compensate incorrectly beat place-value-split on 77×5.
