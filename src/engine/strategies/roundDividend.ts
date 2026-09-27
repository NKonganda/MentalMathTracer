import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

function split(p: Problem): { t: number; rem: number } | null {
  if (p.op !== 'div' || !isInt(p.a) || !isInt(p.b) || p.b < 2 || p.b > 25) return null;
  const t = Math.floor(p.a / (10 * p.b)) * 10 * p.b;
  const rem = p.a - t;
  if (t <= 0 || rem <= 0 || rem % p.b !== 0) return null;
  return { t, rem };
}

export const roundDividend: Strategy = {
  id: 'round-dividend',
  name: 'Peel off an easy multiple',
  explain: 'Split the dividend at a multiple you know cold, divide each piece, add.',
  applies: (p) => split(p) !== null,
  expand(p) {
    const { t, rem } = split(p)!;
    const s1 = step(`${fmt(t)} ÷ ${fmt(p.b)}`, t / p.b, 'div', [t, p.b], `${p.a} = ${t} + ${rem}`);
    const s2 = step(`${fmt(rem)} ÷ ${fmt(p.b)}`, rem / p.b, 'div', [rem, p.b]);
    const s3 = step(`${fmt(t / p.b)} + ${fmt(rem / p.b)}`, p.a / p.b, 'add', [t / p.b, rem / p.b]);
    return { steps: [s1, s2, s3], answer: p.a / p.b };
  },
};
