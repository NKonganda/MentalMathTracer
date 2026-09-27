import type { Strategy } from '../types';
import { fmt, isInt, step } from '../util';

const POWERS = [100, 1000, 10000];

export const complement: Strategy = {
  id: 'complement',
  name: 'Complement trick',
  explain: 'Subtracting from 100/1000: take each digit from 9 (no borrows!), then add 1.',
  applies: (p) =>
    p.op === 'sub' && isInt(p.b) && POWERS.includes(p.a) && p.b >= 10 && p.b < p.a,
  expand(p) {
    const c = p.a - 1 - p.b;
    const s1 = step(
      `${fmt(p.a - 1)} − ${fmt(p.b)}`,
      c,
      'recall',
      [p.a - 1, p.b],
      'each digit from 9 — no borrows',
    );
    const s2 = step(`${fmt(c)} + 1`, c + 1, 'add', [c, 1]);
    return { steps: [s1, s2], answer: c + 1 };
  },
};
