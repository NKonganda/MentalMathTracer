import type { Problem, Strategy } from '../types';
import { countBorrows, fmt, isInt, step } from '../util';

function landmark(p: Problem): number | null {
  if (p.op !== 'sub' || !isInt(p.a) || !isInt(p.b)) return null;
  if (p.b < 10 || p.b >= p.a || p.b % 10 === 0) return null;
  let r = Math.ceil(p.b / 100) * 100;
  if (r >= p.a) r = Math.ceil(p.b / 10) * 10;
  if (r >= p.a) return null;
  return r;
}

export const addUp: Strategy = {
  id: 'add-up',
  name: 'Subtract by adding up',
  explain: 'Climb from the smaller number to a landmark, then to the target; add the two hops.',
  applies: (p) => landmark(p) !== null,
  expand(p) {
    const r = landmark(p)!;
    const d1 = r - p.b;
    const d2 = p.a - r;
    const s1 = step(`${fmt(p.b)} → ${fmt(r)}`, d1, 'sub', [r, p.b], `hop up to ${r}`);
    const s2 = step(`${fmt(r)} → ${fmt(p.a)}`, d2, 'sub', [p.a, r]);
    const s3 = step(`${fmt(d1)} + ${fmt(d2)}`, d1 + d2, 'add', [d1, d2]);
    // adding up beats direct subtraction when the subtrahend exceeds the
    // difference (71−68: Peters et al. 2010) or the direct route needs ≥ 2
    // borrows (Torbeyns et al. 2011): tagged hops skip carry/borrow
    // penalties and earn the SBA discount
    if (p.b > p.a - p.b || countBorrows(p.a, p.b) >= 2) {
      s1.tags = ['sba'];
      s2.tags = ['sba'];
    }
    return { steps: [s1, s2, s3], answer: d1 + d2 };
  },
};
