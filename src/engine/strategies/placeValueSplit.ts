import type { Problem, Strategy } from '../types';
import { fmt, isInt, numDigits, step } from '../util';

function pickSplit(p: Problem): { x: number; y: number } | null {
  if (p.op !== 'mul' || !isInt(p.a) || !isInt(p.b)) return null;
  const cands = [
    [p.a, p.b],
    [p.b, p.a],
  ].filter(([x]) => x >= 13 && x <= 999 && x % 10 !== 0);
  if (cands.length === 0) return null;
  cands.sort((l, r) => numDigits(r[0]) - numDigits(l[0]));
  const [x, y] = cands[0];
  return { x, y };
}

export const placeValueSplit: Strategy = {
  id: 'place-value-split',
  name: 'Place-value split',
  explain: 'Break one number by place value, multiply each part, add. Always works; best when both parts are times-table facts.',
  applies: (p) => pickSplit(p) !== null,
  expand(p) {
    const { x, y } = pickSplit(p)!;
    const pow = 10 ** (numDigits(x) - 1);
    const hi = Math.trunc(x / pow) * pow;
    const lo = x - hi;
    const s1 = step(`${fmt(hi)} × ${fmt(y)}`, hi * y, 'mul', [hi, y]);
    const s2 = step(`${fmt(lo)} × ${fmt(y)}`, lo * y, 'mul', [lo, y]);
    const s3 = step(`${fmt(s1.result)} + ${fmt(s2.result)}`, x * y, 'add', [s1.result, s2.result]);
    return { steps: [s1, s2, s3], answer: x * y };
  },
};
