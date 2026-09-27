# Cerebrum — Mental Math Path

## Preferences
- User thinks in graded fact-retrieval terms: times-table facts (incl. zero-stripped ones like 70×5, which they mentally do as 70×10/2) are "very low cost"; anchor facts like 75×5 are NOT equally free. Ranking must reflect this.
- User wants evidence-grounded weights: keep `docs/research-prompt.md` in sync with the cost model whenever weights change, so their online research stays applicable.

## Learnings
- 2026-09-27: User overrode their original spec for 77×5 (spec said round-to-75/80 top; user now wants place-value-split top because 70×5 + 7×5 are both table-grade). rank.test.ts updated accordingly — the spec document is not immutable; user's latest word wins.
- Cost model now uses graded discounts (timesTableDiscount 1.25 > divisionFactDiscount 0.75 > anchorFactDiscount 0.5; smallAddSubDiscount 0.75; recall 0.25). When retuning, re-verify ALL six rank.test orderings — they are tightly coupled (16×25 factor-regroup vs x100-quarter nearly flipped during this change).

## Do-Not-Repeat
- Do not give one flat "known fact" discount to both times-table facts and 25/50/75 anchor facts — that's what made round-down-compensate incorrectly beat place-value-split on 77×5.
