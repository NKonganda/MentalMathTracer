import type { CostBreakdown, CostItem, Step, StepTree } from './types';
import {
  carryColumnSums,
  countBorrows,
  countMulCarries,
  factKind,
  highDigits,
  isInt,
  numDigits,
  oddDigitsAboveUnits,
  stripZeros,
} from './util';

/**
 * All tunable knobs live here. Lower total cost = easier in your head.
 * Scale: 1 unit ≈ 1,000 ms of net processing time (RT minus a ~500 ms
 * encoding/response intercept). Values follow the 2026 evidence audit of
 * docs/research-prompt.md — chiefly Campbell (2008) for fact retrieval,
 * Klein et al. (2010) and Imbo et al. (2007) for carries/borrows, and
 * Hitch (1978) for working-memory holds.
 */
export const WEIGHTS = {
  addSub: 1,
  // problem-size effect: single-digit facts get harder as the smaller factor grows
  mulDivFactSmall: 1.25, // factor ≤ 3
  mulDivFactMid: 1.5, // factor 4–6
  mulDivFactLarge: 1.75, // factor 7–9
  mulDivTwoDigit: 3.5, // central-executive load of managing cross-products
  shift: 0.15,
  doubleBase: 0.5, // doubling = tie addition…
  doublePerHighDigit: 0.25, // …plus a carry for each digit ≥ 5
  halveTiny: 0.4, // n ≤ 20: inverse tie (half of 14 is as fast as 7+7)
  halveBase: 0.5,
  halvePerOddDigit: 0.4, // each odd digit above units sends a "+5" right — a carry
  recall: 0.25,
  digitPenaltyBase: 0.5,
  digitPenaltyExponent: 1.2, // superlinear: each extra digit loads WM more than the last
  // the carry effect is graded by the column sum (~44 ms/unit, Klein 2010),
  // not on/off; borrows run ~1.3× carries and extra borrows taper (Imbo 2007)
  carrySmall: 0.5, // column sum 10–13
  carryLarge: 0.75, // column sum 14+
  highCarryPenalty: 0.25, // a carried value ≥ 2 needs active phonological maintenance
  borrow: 0.65,
  borrowTaper: 0.9, // each borrow after the first costs ×0.9 (concave rise)
  // fact-retrieval nets: what a retrieved fact should cost AFTER the discount
  // item, from Campbell (2008) net-RT ratios (tie 0.75×, large 1.7–2× small;
  // subtraction facts 1.3–1.6× addition facts)
  addFactTie: 0.4,
  addFactSmall: 0.5, // sum ≤ 10
  addFactLarge: 0.9, // teen sums
  subFactSmall: 0.7, // minuend ≤ 10, and ties like 14−7
  subFactLarge: 1.4, // teen minuend: 13−6 is retrieved, but with interference
  factNetTie: 0.4, // 6×6 … 12×12
  factNetSmall: 0.5, // product ≤ 25, or a five operand (the "fives effect")
  factNetLarge: 1, // 7×8 territory: network interference, 3–5× the errors
  divFactExtra: 0.2, // division facts come via inverse multiplication (Mauro 2003)
  anchorFactDiscount: 0.75, // quarter facts on 25/50/75/100: quick but derived,
  // so a discount off the procedural base, not a flat retrieval net
  roundNumberBonus: 0.3,
  sbaDiscount: 1, // subtraction-by-addition: counting up replaces the borrow apparatus
  wmHoldPerStep: 0.25, // per held value per intervening step (decay, Hitch 1978)
  wmCapacity: 3, // beyond ~3 concurrent holds, everything gets dearer (Cowan 2001)
  wmOverloadFactor: 1.5,
  seqDifficultyThreshold: 1.5, // a step this hard degrades the one after it
  seqDifficultyFactor: 0.075, // ×1.05–1.10 (Uittenhove & Lemaire 2012)
};

export type Weights = typeof WEIGHTS;

const OP_LABEL: Record<Step['op'], string> = {
  add: 'add',
  sub: 'subtract',
  mul: 'multiply',
  div: 'divide',
  halve: 'halve',
  double: 'double',
  shift: 'shift digits',
  recall: 'recall',
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Problem-size-graded base cost of a single-digit fact (2×n cheap, 8×n dear). */
function factGrade(factor: number, w: Weights): number {
  if (factor <= 3) return w.mulDivFactSmall;
  if (factor <= 6) return w.mulDivFactMid;
  return w.mulDivFactLarge;
}

function baseCost(s: Step, w: Weights): number {
  switch (s.op) {
    case 'add':
    case 'sub':
      return w.addSub;
    case 'mul': {
      // difficulty tracks the "small" factor: 20 × 17 is really 2 × 17
      const eff = Math.min(...s.operands.map((o) => stripZeros(o)));
      return eff <= 9 ? factGrade(eff, w) : w.mulDivTwoDigit;
    }
    case 'div': {
      const divisor = stripZeros(s.operands[1] ?? s.operands[0]);
      return divisor <= 9 ? factGrade(divisor, w) + w.divFactExtra : w.mulDivTwoDigit;
    }
    case 'halve': {
      const n = Math.abs(s.operands[0]);
      if (n <= 20) return w.halveTiny;
      return w.halveBase + w.halvePerOddDigit * oddDigitsAboveUnits(n);
    }
    case 'double':
      return w.doubleBase + w.doublePerHighDigit * highDigits(s.operands[0]);
    case 'shift':
      return w.shift;
    case 'recall':
      return w.recall;
  }
}

/** Net cost of a retrieved times-table fact x × y (both zero-stripped). */
function mulFactNet(x: number, y: number, w: Weights): { net: number; label: string } {
  if (x === y && x <= 12) return { net: w.factNetTie, label: 'tie fact' };
  if (x === y) return { net: w.factNetLarge, label: 'memorized square' };
  if (x === 5 || y === 5 || x * y <= 25) {
    return { net: w.factNetSmall, label: 'times-table fact (small/fives)' };
  }
  return { net: w.factNetLarge, label: 'times-table fact (large)' };
}

/**
 * Fact-retrieval pricing: retrieved facts come out whole, so the discount
 * replaces the procedural base with a graded net cost — a lookup on
 * operation × size × tie status (Campbell 2008; Campbell & Xue 2001).
 */
function factNet(
  s: Step,
  kind: 'table' | 'anchor',
  base: number,
  w: Weights,
): { net: number; label: string } {
  const abs = s.operands.map(Math.abs);
  if (s.op === 'add') {
    const [a, b] = abs;
    if (a === b) return { net: w.addFactTie, label: 'tie fact' };
    if (a + b <= 10) return { net: w.addFactSmall, label: 'single-digit fact' };
    return { net: w.addFactLarge, label: 'teen fact' };
  }
  if (s.op === 'sub') {
    const [a, b] = abs;
    if (a <= 10 || b === Math.abs(s.result)) {
      return { net: w.subFactSmall, label: 'single-digit fact' };
    }
    return { net: w.subFactLarge, label: 'teen subtraction fact' };
  }
  if (s.op === 'div') {
    // retrieved through the inverse multiplication: 144 ÷ 12 is "12 × ? = 144"
    const [a, b] = abs;
    const q = stripZeros(Math.abs(s.result));
    const d = stripZeros(b);
    const pair: [number, number] = d <= 12 && q <= 12 ? [d, q] : [stripZeros(a), d];
    const m = mulFactNet(pair[0], pair[1], w);
    return { net: m.net + w.divFactExtra, label: `inverse ${m.label}` };
  }
  if (kind === 'anchor') {
    return { net: base - w.anchorFactDiscount, label: 'quarter/anchor fact' };
  }
  const [x, y] = s.operands.map((o) => stripZeros(o));
  return mulFactNet(x, y, w);
}

function stepItems(s: Step, w: Weights): CostItem[] {
  const items: CostItem[] = [];
  const base = baseCost(s, w);
  items.push({ label: `${s.expr}: ${OP_LABEL[s.op]}`, amount: base });

  // digit-count penalty (shift/recall move digits without arithmetic on them);
  // superlinear — each extra digit loads working memory more than the last
  if (s.op !== 'shift' && s.op !== 'recall') {
    const extra = s.operands.reduce((acc, o) => acc + Math.max(0, numDigits(o) - 2), 0);
    if (extra > 0) {
      items.push({
        label: `${s.expr}: long operands`,
        amount: w.digitPenaltyBase * Math.pow(extra, w.digitPenaltyExponent),
      });
    }
  }

  const kind = factKind(s.op, s.operands, s.result);

  // an SBA hop is counting up, not column arithmetic — no carries or borrows;
  // retrieved facts come out whole — only procedural steps pay carry/borrow
  const countUp = s.tags?.includes('sba') ?? false;
  if (s.op === 'add' && s.operands.length === 2 && !kind && !countUp) {
    const sums = carryColumnSums(s.operands[0], s.operands[1]);
    if (sums.length > 0) {
      const amount = sums.reduce((acc, cs) => acc + (cs <= 13 ? w.carrySmall : w.carryLarge), 0);
      const heavy = sums.some((cs) => cs > 13);
      items.push({
        label: `${s.expr}: ${sums.length} carr${sums.length === 1 ? 'y' : 'ies'}${heavy ? ' (big column sum)' : ''}`,
        amount,
      });
    }
  }
  if (s.op === 'sub' && s.operands.length === 2 && !kind && !countUp) {
    const c = countBorrows(s.operands[0], s.operands[1]);
    if (c > 0) {
      // extra borrows add cost at a slightly diminishing rate (Imbo 2007)
      items.push({
        label: `${s.expr}: ${c} borrow${c === 1 ? '' : 's'}`,
        amount: round2(w.borrow * (1 + w.borrowTaper * (c - 1))),
      });
    }
  }
  if (s.op === 'mul' && !kind && s.operands.length === 2) {
    const { carries, high } = countMulCarries(s.operands[0], s.operands[1]);
    if (carries > 0) {
      items.push({
        label: `${s.expr}: ${carries} carr${carries === 1 ? 'y' : 'ies'}`,
        amount: carries * w.carrySmall,
      });
    }
    if (high > 0) {
      // carrying a 3 must be actively rehearsed while the next column runs
      items.push({
        label: `${s.expr}: big carr${high === 1 ? 'y' : 'ies'} to hold`,
        amount: high * w.highCarryPenalty,
      });
    }
  }

  if (kind) {
    const { net, label } = factNet(s, kind, base, w);
    items.push({ label: `${s.expr}: ${label}`, amount: round2(net - base) });
  }

  // a shift's result is round by construction — no credit for that; odd
  // multiples of 25 (375, 425) are anchor territory, not round: the anchor
  // fact discount already prices them, and 375 + 10 is no easier than 350 + 35
  if (s.op !== 'shift' && isInt(s.result) && s.result !== 0 && s.result % 10 === 0) {
    items.push({ label: `${s.expr}: lands on a round number`, amount: -w.roundNumberBonus });
  }

  return items;
}

/**
 * Working-memory load of intermediate values: each result consumed later than
 * the immediately-next step decays across the steps it sits through (Hitch
 * 1978), so the load is (held values × intervening steps), plus every extra
 * parallel branch at each level of the tree.
 */
function holdLoad(steps: Step[]): { units: number; values: number; maxConcurrent: number } {
  const spans: Array<[number, number]> = [];
  for (let i = 0; i < steps.length; i++) {
    for (let j = i + 2; j < steps.length; j++) {
      if (steps[j].operands.includes(steps[i].result)) {
        spans.push([i, j]);
        break;
      }
    }
  }
  let units = spans.reduce((acc, [i, j]) => acc + (j - i - 1), 0);
  let values = spans.length;
  let maxConcurrent = 0;
  for (let k = 0; k < steps.length; k++) {
    const live = spans.filter(([i, j]) => k > i && k < j).length;
    if (live > maxConcurrent) maxConcurrent = live;
  }
  for (const s of steps) {
    if (s.substeps && s.substeps.length > 0) {
      const inner = holdLoad(s.substeps);
      units += s.substeps.length - 1 + inner.units;
      values += s.substeps.length - 1 + inner.values;
      maxConcurrent = Math.max(maxConcurrent, s.substeps.length - 1, inner.maxConcurrent);
    }
  }
  return { units, values, maxConcurrent };
}

export function scoreTree(tree: StepTree, w: Weights = WEIGHTS): CostBreakdown {
  const items: CostItem[] = [];
  let prevStep = 0;
  const walk = (steps: Step[]) => {
    for (const s of steps) {
      const stepIts = stepItems(s, w);
      const subtotal = stepIts.reduce((acc, i) => acc + i.amount, 0);
      items.push(...stepIts);
      // performance degrades right after a difficult step (Uittenhove & Lemaire)
      if (prevStep > w.seqDifficultyThreshold && subtotal > 0) {
        items.push({
          label: `${s.expr}: right after a hard step`,
          amount: round2(subtotal * w.seqDifficultyFactor),
        });
      }
      prevStep = subtotal;
      if (s.substeps) walk(s.substeps);
    }
  };
  walk(tree.steps);

  // subtraction by addition: climbing up replaces the borrow apparatus with counting
  const flat: Step[] = [];
  const collect = (steps: Step[]) => {
    for (const s of steps) {
      flat.push(s);
      if (s.substeps) collect(s.substeps);
    }
  };
  collect(tree.steps);
  if (flat.some((s) => s.tags?.includes('sba'))) {
    items.push({ label: 'count up instead of subtracting', amount: -w.sbaDiscount });
  }

  // held values decay across the steps they sit through; past ~3 concurrent
  // holds the whole juggling act gets disproportionately dearer
  const { units, values, maxConcurrent } = holdLoad(tree.steps);
  if (units > 0) {
    const overload = maxConcurrent > w.wmCapacity ? w.wmOverloadFactor : 1;
    items.push({
      label:
        `hold ${values} value${values === 1 ? '' : 's'} across ${units} step${units === 1 ? '' : 's'}` +
        (overload > 1 ? ' (overloaded)' : ''),
      amount: round2(units * w.wmHoldPerStep * overload),
    });
  }

  const total = round2(items.reduce((acc, i) => acc + i.amount, 0));
  return { items, total };
}
