import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

function pair(p: Problem): { f: number; g: number } | null {
  if (p.op !== 'div' || !isInt(p.a) || !isInt(p.b)) return null;
  if (p.b < 6 || p.b > 144 || p.a % p.b !== 0) return null;
  let best: { f: number; g: number } | null = null;
  for (let f = 2; f <= 12; f++) {
    if (p.b % f !== 0) continue;
    const g = p.b / f;
    if (g < 2 || g > 12) continue;
    // prefer the most balanced pair: ÷12 = ÷3 then ÷4 over ÷2 then ÷6
    if (!best || Math.abs(f - g) < Math.abs(best.f - best.g)) best = { f, g };
  }
  return best;
}

export const factorDivisor: Strategy = {
  id: 'factor-divisor',
  name: 'Factor the divisor',
  explain: 'Divide in two easy stages: ÷12 is ÷3 then ÷4.',
  applies: (p) => pair(p) !== null,
  expand(p) {
    const { f, g } = pair(p)!;
    const m = p.a / f;
    const s1 = step(`${fmt(p.a)} ÷ ${fmt(f)}`, m, 'div', [p.a, f], `÷${p.b} = ÷${f}, then ÷${g}`);
    const s2 = step(`${fmt(m)} ÷ ${fmt(g)}`, p.a / p.b, 'div', [m, g]);
    return { steps: [s1, s2], answer: p.a / p.b };
  },
};
