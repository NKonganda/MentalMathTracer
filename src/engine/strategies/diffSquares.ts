import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

function mid(p: Problem): { m: number; d: number } | null {
  if (p.op !== 'mul' || !isInt(p.a) || !isInt(p.b)) return null;
  if (p.a === p.b || p.a <= 0 || p.b <= 0) return null;
  if ((p.a + p.b) % 2 !== 0) return null;
  const m = (p.a + p.b) / 2;
  const d = Math.abs(p.a - p.b) / 2;
  if (d < 1 || d > 12 || m > 100) return null;
  const nice = m % 10 === 0 || m % 25 === 0 || m <= 25;
  return nice ? { m, d } : null;
}

export const diffSquares: Strategy = {
  id: 'difference-of-squares',
  name: 'Difference of squares',
  explain: 'When two numbers straddle a nice midpoint m at distance d: a × b = m² − d².',
  applies: (p) => mid(p) !== null,
  expand(p) {
    const { m, d } = mid(p)!;
    const s1 = step(`${fmt(m)}²`, m * m, 'mul', [m, m], `midpoint of ${p.a} and ${p.b}`);
    const s2 = step(`${fmt(d)}²`, d * d, 'mul', [d, d]);
    const s3 = step(`${fmt(m * m)} − ${fmt(d * d)}`, m * m - d * d, 'sub', [m * m, d * d]);
    return { steps: [s1, s2, s3], answer: m * m - d * d };
  },
};
