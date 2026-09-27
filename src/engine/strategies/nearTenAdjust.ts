import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

function pick(p: Problem, k: number): number | null {
  if (p.op !== 'mul' || !isInt(p.a) || !isInt(p.b)) return null;
  if (p.a === k && p.b >= 3) return p.b;
  if (p.b === k && p.a >= 3) return p.a;
  return null;
}

export const x9Adjust: Strategy = {
  id: 'x9-adjust',
  name: '×9 = ×10 − one',
  explain: '9 is one less than 10: shift, then subtract the number once.',
  applies: (p) => pick(p, 9) !== null,
  expand(p) {
    const x = pick(p, 9)!;
    const s1 = step(`${fmt(x)} × 10`, x * 10, 'shift', [x, 10]);
    const s2 = step(`${fmt(x * 10)} − ${fmt(x)}`, x * 9, 'sub', [x * 10, x]);
    return { steps: [s1, s2], answer: x * 9 };
  },
};

export const x11Adjust: Strategy = {
  id: 'x11-adjust',
  name: '×11 = ×10 + one',
  explain: '11 is one more than 10: shift, then add the number once.',
  applies: (p) => pick(p, 11) !== null,
  expand(p) {
    const x = pick(p, 11)!;
    const s1 = step(`${fmt(x)} × 10`, x * 10, 'shift', [x, 10]);
    const s2 = step(`${fmt(x * 10)} + ${fmt(x)}`, x * 11, 'add', [x * 10, x]);
    return { steps: [s1, s2], answer: x * 11 };
  },
};

export const x11DigitSum: Strategy = {
  id: 'x11-digit-sum',
  name: '×11 digit-sum trick',
  explain: 'For a 2-digit number × 11: write the two digits with their sum slotted between.',
  applies: (p) => {
    const x = pick(p, 11);
    if (x === null || x < 10 || x > 99) return false;
    return Math.trunc(x / 10) + (x % 10) <= 9;
  },
  expand(p) {
    const x = pick(p, 11)!;
    const d1 = Math.trunc(x / 10);
    const d0 = x % 10;
    const mid = d1 + d0;
    const result = d1 * 100 + mid * 10 + d0;
    const s1 = step(`${d1} + ${d0}`, mid, 'add', [d1, d0], 'add the two digits');
    const s2 = step(`${d1} ${mid} ${d0}`, result, 'recall', [x, 11], `slot ${mid} between ${d1} and ${d0}`);
    return { steps: [s1, s2], answer: result };
  },
};
