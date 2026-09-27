import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

const other = (p: Problem) => (p.a === 5 ? p.b : p.a);

export const x10Halve: Strategy = {
  id: 'x10-halve',
  name: '×10, then halve',
  explain: '×5 is ×10 then ÷2. Great when the ×10 number halves cleanly (460 → 230); clumsy when it forces a split (770 → 385).',
  applies: (p) =>
    p.op === 'mul' && (p.a === 5 || p.b === 5) && isInt(p.a) && isInt(p.b) && other(p) >= 2,
  expand(p) {
    const x = other(p);
    const s1 = step(`${fmt(x)} × 10`, x * 10, 'shift', [x, 10]);
    const s2 = step(`${fmt(x * 10)} ÷ 2`, x * 5, 'halve', [x * 10]);
    return { steps: [s1, s2], answer: x * 5 };
  },
};
