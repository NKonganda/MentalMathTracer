import type { Strategy } from '../types';
import { fmt, isInt, step } from '../util';

export const squareNear100: Strategy = {
  id: 'square-near-100',
  name: 'Anchor at 100',
  explain: '(100 ± d)² = 10000 ± 200d + d².',
  applies: (p) => p.op === 'square' && isInt(p.a) && p.a >= 85 && p.a <= 115 && p.a !== 100,
  expand(p) {
    const n = p.a;
    const d = n - 100;
    const ad = Math.abs(d);
    const mid = 10000 + 200 * d;
    const s1 = step('100²', 10000, 'mul', [100, 100], 'anchor at 100');
    const s2 = step(`${fmt(2 * ad)} × 100`, 200 * ad, 'shift', [2 * ad, 100], 'double d, in hundreds');
    const s3 = step(
      `10000 ${d > 0 ? '+' : '−'} ${fmt(200 * ad)}`,
      mid,
      d > 0 ? 'add' : 'sub',
      [10000, 200 * ad],
    );
    const s4 = step(`${fmt(ad)}²`, d * d, 'mul', [ad, ad]);
    const s5 = step(`${fmt(mid)} + ${fmt(d * d)}`, n * n, 'add', [mid, d * d]);
    return { steps: [s1, s2, s3, s4, s5], answer: n * n };
  },
};
