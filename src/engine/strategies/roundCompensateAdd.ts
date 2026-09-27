import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

function near(x: number): { r: number; d: number } | null {
  if (!isInt(x) || x < 10) return null;
  const ones = x % 10;
  if (ones >= 8) return { r: x + (10 - ones), d: 10 - ones };
  return null;
}

function applies(p: Problem): boolean {
  if (!isInt(p.a) || !isInt(p.b)) return false;
  if (p.op === 'add') return near(p.a) !== null || near(p.b) !== null;
  if (p.op === 'sub') return p.a > p.b && (near(p.b) !== null || near(p.a) !== null);
  return false;
}

export const roundCompensateAdd: Strategy = {
  id: 'round-compensate',
  name: 'Round, then compensate',
  explain: 'Nudge a number up to the nearest ten, compute, then undo the nudge.',
  applies,
  expand(p) {
    if (p.op === 'add') {
      const useA = near(p.a) !== null;
      const x = useA ? p.a : p.b;
      const y = useA ? p.b : p.a;
      const { r, d } = near(x)!;
      const s1 = step(`${fmt(r)} + ${fmt(y)}`, r + y, 'add', [r, y], `${x} rounded up to ${r}`);
      const s2 = step(`${fmt(r + y)} − ${fmt(d)}`, p.a + p.b, 'sub', [r + y, d], 'undo the nudge');
      return { steps: [s1, s2], answer: p.a + p.b };
    }
    // subtraction
    const nb = near(p.b);
    if (nb) {
      const { r, d } = nb;
      const s1 = step(`${fmt(p.a)} − ${fmt(r)}`, p.a - r, 'sub', [p.a, r], `${p.b} rounded up to ${r}`);
      const s2 = step(`${fmt(p.a - r)} + ${fmt(d)}`, p.a - p.b, 'add', [p.a - r, d], 'give the nudge back');
      return { steps: [s1, s2], answer: p.a - p.b };
    }
    const { r, d } = near(p.a)!;
    const s1 = step(`${fmt(r)} − ${fmt(p.b)}`, r - p.b, 'sub', [r, p.b], `${p.a} rounded up to ${r}`);
    const s2 = step(`${fmt(r - p.b)} − ${fmt(d)}`, p.a - p.b, 'sub', [r - p.b, d], 'undo the nudge');
    return { steps: [s1, s2], answer: p.a - p.b };
  },
};
