import type { Strategy } from '../types';
import { fmt, isInt, step } from '../util';

/** General (a ± b)² from the nearest round base; defers to the specialized anchors. */
export const squareExpand: Strategy = {
  id: 'square-expand',
  name: 'Expand from a round base',
  explain: '(base ± d)² = base² ± 2·base·d + d², anchored at the nearest multiple of 10.',
  applies: (p) => {
    if (p.op !== 'square' || !isInt(p.a)) return false;
    const n = p.a;
    if (n < 13 || n > 250) return false;
    if (n % 10 === 0 || n % 10 === 5) return false;
    if (n >= 41 && n <= 59) return false; // near-50 anchor owns these
    if (n >= 85 && n <= 115) return false; // near-100 anchor owns these
    return true;
  },
  expand(p) {
    const n = p.a;
    const b0 = Math.round(n / 10) * 10;
    const d = n - b0;
    const ad = Math.abs(d);
    const mid = b0 * b0 + 2 * b0 * d;
    const s1 = step(`${fmt(b0)}²`, b0 * b0, 'mul', [b0, b0], `anchor at ${b0}`);
    const s2 = step(`${fmt(2 * b0)} × ${fmt(ad)}`, 2 * b0 * ad, 'mul', [2 * b0, ad], 'double the base, times the offset');
    const s3 = step(
      `${fmt(b0 * b0)} ${d > 0 ? '+' : '−'} ${fmt(2 * b0 * ad)}`,
      mid,
      d > 0 ? 'add' : 'sub',
      [b0 * b0, 2 * b0 * ad],
    );
    const s4 = step(`${fmt(ad)}²`, d * d, 'mul', [ad, ad]);
    const s5 = step(`${fmt(mid)} + ${fmt(d * d)}`, n * n, 'add', [mid, d * d]);
    return { steps: [s1, s2, s3, s4, s5], answer: n * n };
  },
};
