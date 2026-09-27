import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

function pick(p: Problem): { x: number; y: number; d: number } | null {
  if (p.op !== 'add' || !isInt(p.a) || !isInt(p.b)) return null;
  for (const [x, y] of [
    [p.a, p.b],
    [p.b, p.a],
  ]) {
    const ones = x % 10;
    if (x >= 10 && ones >= 6 && y > 10 - ones) return { x, y, d: 10 - ones };
  }
  return null;
}

export const makeRound: Strategy = {
  id: 'make-round',
  name: 'Make a round number',
  explain: 'Move a few units from one number to the other so one of them becomes round.',
  applies: (p) => pick(p) !== null,
  expand(p) {
    const { x, y, d } = pick(p)!;
    const s1 = step(`${fmt(y)} − ${fmt(d)}`, y - d, 'sub', [y, d], `lend ${d} to ${x}`);
    const s2 = step(`${fmt(x)} + ${fmt(d)}`, x + d, 'add', [x, d], 'now it is round');
    const s3 = step(`${fmt(x + d)} + ${fmt(y - d)}`, x + y, 'add', [x + d, y - d]);
    return { steps: [s1, s2, s3], answer: x + y };
  },
};
