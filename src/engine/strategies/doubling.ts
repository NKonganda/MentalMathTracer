import type { Problem, Step, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

const KS = [8, 6, 4]; // prefer more doublings of the smaller partner

function pick(p: Problem): { k: number; x: number } | null {
  if (p.op !== 'mul' || !isInt(p.a) || !isInt(p.b)) return null;
  for (const k of KS) {
    if (p.a === k && p.b >= 3) return { k, x: p.b };
    if (p.b === k && p.a >= 3) return { k, x: p.a };
  }
  return null;
}

export const doubling: Strategy = {
  id: 'doubling',
  name: 'Double your way there',
  explain: '×4 is double-double, ×8 is double-double-double, ×6 is ×3 then double.',
  applies: (p) => pick(p) !== null,
  expand(p) {
    const { k, x } = pick(p)!;
    const steps: Step[] = [];
    let cur = x;
    if (k === 6) {
      steps.push(step(`${fmt(x)} × 3`, x * 3, 'mul', [x, 3]));
      cur = x * 3;
      steps.push(step(`${fmt(cur)} × 2`, cur * 2, 'double', [cur]));
      cur *= 2;
    } else {
      const times = k === 4 ? 2 : 3;
      for (let i = 0; i < times; i++) {
        steps.push(step(`${fmt(cur)} × 2`, cur * 2, 'double', [cur]));
        cur *= 2;
      }
    }
    return { steps, answer: cur };
  },
};
