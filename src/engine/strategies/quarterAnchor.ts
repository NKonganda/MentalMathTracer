import type { Problem, Step, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

const ANCHORS = [25, 50, 75];

function pick(p: Problem): { anchor: number; x: number } | null {
  if (p.op !== 'mul' || !isInt(p.a) || !isInt(p.b)) return null;
  for (const [anchor, x] of [
    [p.a, p.b],
    [p.b, p.a],
  ]) {
    if (ANCHORS.includes(anchor) && x >= 2 && x <= 99) return { anchor, x };
  }
  return null;
}

export const quarterAnchor: Strategy = {
  id: 'quarter-anchor',
  name: 'Think in quarters',
  explain: '25, 50, 75 are quarters of 100 — count quarters like money, then cash them in.',
  applies: (p) => pick(p) !== null,
  expand(p) {
    const { anchor, x } = pick(p)!;
    const k = anchor / 25;
    const q = x * k;
    const steps: Step[] = [];
    if (k > 1) {
      steps.push(step(`${fmt(x)} × ${k}`, q, 'mul', [x, k], `${anchor} is ${k} quarters`));
    }
    steps.push(
      step(`${fmt(q)} × 25`, q * 25, 'mul', [q, 25], `${q} quarters of 100`),
    );
    return { steps, answer: q * 25 };
  },
};
