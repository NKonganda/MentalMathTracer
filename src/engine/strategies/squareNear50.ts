import type { Strategy } from '../types';
import { fmt, isInt, step } from '../util';

export const squareNear50: Strategy = {
  id: 'square-near-50',
  name: 'Anchor at 50',
  explain: '(50 ± d)² = 2500 ± 100d + d² — the middle term is just d hundreds.',
  applies: (p) => p.op === 'square' && isInt(p.a) && p.a >= 41 && p.a <= 59 && p.a !== 50,
  expand(p) {
    const n = p.a;
    const d = n - 50;
    const ad = Math.abs(d);
    const mid = 2500 + 100 * d;
    const s1 = step('50²', 2500, 'mul', [50, 50], 'anchor at 50');
    const s2 = step(`${fmt(ad)} × 100`, ad * 100, 'shift', [ad, 100]);
    const s3 = step(
      `2500 ${d > 0 ? '+' : '−'} ${fmt(ad * 100)}`,
      mid,
      d > 0 ? 'add' : 'sub',
      [2500, ad * 100],
    );
    const s4 = step(`${fmt(ad)}²`, d * d, 'mul', [ad, ad]);
    const s5 = step(`${fmt(mid)} + ${fmt(d * d)}`, n * n, 'add', [mid, d * d]);
    return { steps: [s1, s2, s3, s4, s5], answer: n * n };
  },
};
