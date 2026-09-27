import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

const other = (p: Problem) => (p.a === 125 ? p.b : p.a);

export const x1000Eighth: Strategy = {
  id: 'x1000-eighth',
  name: '×1000, then eighth',
  explain: '×125 is ×1000 then ÷8 — 125 is an eighth of 1000.',
  applies: (p) =>
    p.op === 'mul' && (p.a === 125 || p.b === 125) && isInt(p.a) && isInt(p.b) && other(p) >= 2,
  expand(p) {
    const x = other(p);
    const s1 = step(`${fmt(x)} × 1000`, x * 1000, 'shift', [x, 1000]);
    const s2 = step(`${fmt(x * 1000)} ÷ 8`, x * 125, 'div', [x * 1000, 8]);
    return { steps: [s1, s2], answer: x * 125 };
  },
};
