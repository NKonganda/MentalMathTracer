import type { Step, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

function placeParts(n: number): number[] {
  const parts: number[] = [];
  let pow = 10 ** (String(n).length - 1);
  while (pow >= 1) {
    const part = Math.trunc(n / pow) * pow;
    if (part > 0) parts.push(part);
    n -= part;
    pow /= 10;
  }
  return parts;
}

export const leftToRight: Strategy = {
  id: 'left-to-right',
  name: 'Left to right',
  explain: 'Work the big places first: add or subtract hundreds, then tens, then ones.',
  applies: (p) =>
    (p.op === 'add' || p.op === 'sub') &&
    isInt(p.a) &&
    isInt(p.b) &&
    p.a >= 10 &&
    p.b >= 10 &&
    p.b <= 9999 &&
    (p.op === 'add' || p.a >= p.b),
  expand(p) {
    const adding = p.op === 'add';
    const sign = adding ? 1 : -1;
    const sym = adding ? '+' : '−';
    const steps: Step[] = [];
    let cur = p.a;
    for (const part of placeParts(p.b)) {
      const next = cur + sign * part;
      steps.push(step(`${fmt(cur)} ${sym} ${fmt(part)}`, next, adding ? 'add' : 'sub', [cur, part]));
      cur = next;
    }
    return { steps, answer: cur };
  },
};
