import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

interface Pick {
  x: number;
  y: number;
  f: number;
  g: number;
}

function roundness(n: number): number {
  if (n % 100 === 0) return 3;
  if (n % 10 === 0 || n % 25 === 0) return 2;
  return 0;
}

function pick(p: Problem): Pick | null {
  if (p.op !== 'mul' || !isInt(p.a) || !isInt(p.b)) return null;
  for (const [x, y] of [
    [p.a, p.b],
    [p.b, p.a],
  ]) {
    if (x < 4 || x > 144) continue;
    let best: { f: number; g: number; score: number } | null = null;
    for (let f = 2; f <= 12; f++) {
      if (x % f !== 0) continue;
      const g = x / f;
      if (g < 2 || g > 12) continue;
      const score = roundness(f * y);
      if (score > 0 && (!best || score > best.score)) best = { f, g, score };
    }
    if (best) return { x, y, f: best.f, g: best.g };
  }
  return null;
}

export const factorRegroup: Strategy = {
  id: 'factor-regroup',
  name: 'Factor and regroup',
  explain: 'Split one factor so a piece of it turns the other number round, e.g. 16×25 = 4×(4×25).',
  applies: (p) => pick(p) !== null,
  expand(p) {
    const { x, y, f, g } = pick(p)!;
    const s1 = step(`${fmt(x)} = ${fmt(g)} × ${fmt(f)}`, x, 'recall', [g, f], 'factor it');
    const s2 = step(`${fmt(f)} × ${fmt(y)}`, f * y, 'mul', [f, y]);
    const s3 = step(`${fmt(g)} × ${fmt(f * y)}`, x * y, 'mul', [g, f * y]);
    return { steps: [s1, s2, s3], answer: x * y };
  },
};
