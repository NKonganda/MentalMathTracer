import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

const other = (p: Problem) => (p.a === 25 ? p.b : p.a);

export const x100Quarter: Strategy = {
  id: 'x100-quarter',
  name: '×100, then quarter',
  explain: '×25 is ×100 then ÷4. Strong when the other number divides by 4.',
  applies: (p) =>
    p.op === 'mul' && (p.a === 25 || p.b === 25) && isInt(p.a) && isInt(p.b) && other(p) >= 2,
  expand(p) {
    const x = other(p);
    const s1 = step(`${fmt(x)} × 100`, x * 100, 'shift', [x, 100]);
    const s2 = step(`${fmt(x * 100)} ÷ 4`, x * 25, 'div', [x * 100, 4]);
    return { steps: [s1, s2], answer: x * 25 };
  },
};
