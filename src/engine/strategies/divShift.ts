import type { Strategy } from '../types';
import { fmt, isInt, step } from '../util';

/** ÷5 = ×2 then ÷10, ÷25 = ×4 then ÷100, ÷50 = ×2 then ÷100. */
export const divShift: Strategy = {
  id: 'div-shift',
  name: 'Scale up, shift down',
  explain: 'Dividing by 5/25/50: multiply into a power of ten, then just move the decimal.',
  applies: (p) => p.op === 'div' && [5, 25, 50].includes(p.b) && isInt(p.a) && p.a >= 10,
  expand(p) {
    const { a, b } = p;
    if (b === 5) {
      const s1 = step(`${fmt(a)} × 2`, a * 2, 'double', [a]);
      const s2 = step(`${fmt(a * 2)} ÷ 10`, a / 5, 'shift', [a * 2, 10]);
      return { steps: [s1, s2], answer: a / 5 };
    }
    if (b === 25) {
      const s1 = step(`${fmt(a)} × 4`, a * 4, 'mul', [a, 4], 'double twice');
      const s2 = step(`${fmt(a * 4)} ÷ 100`, a / 25, 'shift', [a * 4, 100]);
      return { steps: [s1, s2], answer: a / 25 };
    }
    const s1 = step(`${fmt(a)} × 2`, a * 2, 'double', [a]);
    const s2 = step(`${fmt(a * 2)} ÷ 100`, a / 50, 'shift', [a * 2, 100]);
    return { steps: [s1, s2], answer: a / 50 };
  },
};
