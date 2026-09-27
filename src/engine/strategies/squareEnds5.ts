import type { Strategy } from '../types';
import { fmt, isInt, step } from '../util';

export const squareEnds5: Strategy = {
  id: 'square-ends-5',
  name: 'Ends in 5: n(n+1), append 25',
  explain: 'For a number ending in 5: multiply the tens digit by one more than itself, write 25 after it.',
  applies: (p) => p.op === 'square' && isInt(p.a) && p.a % 10 === 5 && p.a >= 15 && p.a <= 245,
  expand(p) {
    const n = p.a;
    const k = (n - 5) / 10;
    const m = k * (k + 1);
    const s1 = step(`${fmt(k)} × ${fmt(k + 1)}`, m, 'mul', [k, k + 1], 'tens digit × one more');
    const s2 = step(`${fmt(m)}…25`, m * 100 + 25, 'recall', [m, 25], 'write it, then append 25');
    return { steps: [s1, s2], answer: m * 100 + 25 };
  },
};
