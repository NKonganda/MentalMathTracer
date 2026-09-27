import type { CostBreakdown, CostItem, Step, StepTree } from './types';
import {
  countBorrows,
  countCarries,
  factKind,
  isInt,
  numDigits,
  stripZeros,
  tensDigitOdd,
} from './util';

/** All tunable knobs live here. Lower total cost = easier in your head. */
export const WEIGHTS = {
  addSub: 1,
  mulDivSingleDigit: 1.5,
  mulDivTwoDigit: 3,
  shift: 0.25,
  double: 0.75,
  halveEasy: 0.5,
  halveHard: 2,
  recall: 0.25,
  digitPenaltyPerDigit: 0.5,
  carryPenalty: 1,
  // graded fact retrieval: a times-table fact (7×5) is near-instant, an anchor
  // fact (75×5) is quick but derived, and division facts are retrieved through
  // inverse multiplication so they discount less than multiplication facts
  timesTableDiscount: 1.25,
  anchorFactDiscount: 0.5,
  divisionFactDiscount: 0.75,
  smallAddSubDiscount: 0.75,
  roundNumberBonus: 0.5,
  workingMemoryHold: 0.75,
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

function baseCost(s: Step, w: Weights): number {
  switch (s.op) {
    case 'add':
    case 'sub':
      return w.addSub;
    case 'mul': {
      // difficulty tracks the "small" factor: 20 × 17 is really 2 × 17
      const eff = Math.min(...s.operands.map((o) => numDigits(stripZeros(o))));
      return eff <= 1 ? w.mulDivSingleDigit : w.mulDivTwoDigit;
    }
    case 'div': {
      const divisor = s.operands[1] ?? s.operands[0];
      return numDigits(stripZeros(divisor)) <= 1 ? w.mulDivSingleDigit : w.mulDivTwoDigit;
    }
    case 'halve':
      return tensDigitOdd(s.operands[0]) ? w.halveHard : w.halveEasy;
    case 'double':
      return w.double;
    case 'shift':
      return w.shift;
    case 'recall':
      return w.recall;
  }
}

function stepItems(s: Step, w: Weights): CostItem[] {
  const items: CostItem[] = [];
  items.push({ label: `${s.expr}: ${OP_LABEL[s.op]}`, amount: baseCost(s, w) });

  // digit-count penalty (shift/recall move digits without arithmetic on them)
  if (s.op !== 'shift' && s.op !== 'recall') {
    const extra = s.operands.reduce((acc, o) => acc + Math.max(0, numDigits(o) - 2), 0);
    if (extra > 0) {
      items.push({ label: `${s.expr}: long operands`, amount: extra * w.digitPenaltyPerDigit });
    }
  }

  if (s.op === 'add' && s.operands.length === 2) {
    const c = countCarries(s.operands[0], s.operands[1]);
    if (c > 0) {
      items.push({ label: `${s.expr}: ${c} carr${c === 1 ? 'y' : 'ies'}`, amount: c * w.carryPenalty });
    }
  }
  if (s.op === 'sub' && s.operands.length === 2 && s.operands[1] > 10) {
    // subtracting a single-digit number is just counting back — no borrow cost
    const c = countBorrows(s.operands[0], s.operands[1]);
    if (c > 0) {
      items.push({ label: `${s.expr}: ${c} borrow${c === 1 ? '' : 's'}`, amount: c * w.carryPenalty });
    }
  }

  const kind = factKind(s.op, s.operands, s.result);
  if (kind) {
    let amount: number;
    let label: string;
    if (s.op === 'div') {
      amount = w.divisionFactDiscount;
      label = 'inverse times-table fact';
    } else if (s.op === 'add' || s.op === 'sub') {
      amount = w.smallAddSubDiscount;
      label = 'single-digit fact';
    } else if (kind === 'table') {
      amount = w.timesTableDiscount;
      label = 'times-table fact';
    } else {
      amount = w.anchorFactDiscount;
      label = 'quarter/anchor fact';
    }
    items.push({ label: `${s.expr}: ${label}`, amount: -amount });
  }

  // a shift's result is round by construction — no credit for that
  if (
    s.op !== 'shift' &&
    isInt(s.result) &&
    s.result !== 0 &&
    (s.result % 10 === 0 || s.result % 25 === 0)
  ) {
    items.push({ label: `${s.expr}: lands on a round number`, amount: -w.roundNumberBonus });
  }

  return items;
}

/**
 * Intermediate values that must be held while another computation runs:
 * a step result consumed later than the immediately-next step, plus every
 * extra parallel branch at each level of the tree.
 */
function heldValues(steps: Step[]): number {
  let held = 0;
  for (let i = 0; i < steps.length; i++) {
    for (let j = i + 2; j < steps.length; j++) {
      if (steps[j].operands.includes(steps[i].result)) {
        held++;
        break;
      }
    }
  }
  for (const s of steps) {
    if (s.substeps && s.substeps.length > 0) {
      held += s.substeps.length - 1 + heldValues(s.substeps);
    }
  }
  return held;
}

export function scoreTree(tree: StepTree, w: Weights = WEIGHTS): CostBreakdown {
  const items: CostItem[] = [];
  const walk = (steps: Step[]) => {
    for (const s of steps) {
      items.push(...stepItems(s, w));
      if (s.substeps) walk(s.substeps);
    }
  };
  walk(tree.steps);

  const held = heldValues(tree.steps);
  if (held > 0) {
    items.push({
      label: `hold ${held} value${held === 1 ? '' : 's'} in your head`,
      amount: held * w.workingMemoryHold,
    });
  }

  const total = Math.round(items.reduce((acc, i) => acc + i.amount, 0) * 100) / 100;
  return { items, total };
}
