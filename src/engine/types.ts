/** The parsed arithmetic problem. */
export type Op = 'add' | 'sub' | 'mul' | 'div' | 'square' | 'pct';

export interface Problem {
  op: Op;
  /** For pct, a is the percentage (15 in "15% of 240"). For square, a === b. */
  a: number;
  b: number;
  raw: string;
}

/**
 * The kind of mental operation a step is, used by the cost model.
 * 'shift' = multiply/divide by a power of ten (just move digits).
 * 'recall' = retrieving a pattern (complement digits, "append 25", a factoring).
 */
export type StepOp = 'add' | 'sub' | 'mul' | 'div' | 'halve' | 'double' | 'shift' | 'recall';

export interface Step {
  /** Rendered as "expr → result", e.g. "75 × 5". */
  expr: string;
  result: number;
  op: StepOp;
  /** The values the step actually manipulates; the cost model reads these. */
  operands: number[];
  note?: string;
  substeps?: Step[];
}

export interface StepTree {
  steps: Step[];
  answer: number;
}

export interface Strategy {
  id: string;
  name: string;
  /** One line: when is this trick good? */
  explain: string;
  applies(p: Problem): boolean;
  expand(p: Problem): StepTree;
}

export interface CostItem {
  label: string;
  amount: number;
}

export interface CostBreakdown {
  items: CostItem[];
  total: number;
}

export interface ScoredStrategy {
  strategy: Strategy;
  tree: StepTree;
  cost: CostBreakdown;
}
