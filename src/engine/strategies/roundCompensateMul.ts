import type { Problem, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

interface Pick {
  x: number;
  y: number;
  r: number;
  d: number;
}

function target(x: number, dir: 'up' | 'down'): { r: number; d: number } | null {
  if (!isInt(x) || x < 13 || x % 10 === 0 || x % 25 === 0) return null;
  const cands =
    dir === 'up'
      ? [Math.ceil(x / 10) * 10, Math.ceil(x / 25) * 25]
      : [Math.floor(x / 10) * 10, Math.floor(x / 25) * 25];
  let best: { r: number; d: number } | null = null;
  for (const r of cands) {
    const d = Math.abs(x - r);
    if (d >= 1 && d <= 5 && (!best || d < best.d)) best = { r, d };
  }
  return best;
}

function pick(p: Problem, dir: 'up' | 'down'): Pick | null {
  if (p.op !== 'mul' || !isInt(p.a) || !isInt(p.b)) return null;
  let best: Pick | null = null;
  for (const [x, y] of [
    [p.a, p.b],
    [p.b, p.a],
  ]) {
    if (Math.abs(y) > 99) continue;
    const t = target(x, dir);
    if (t && (!best || t.d < best.d)) best = { x, y, ...t };
  }
  return best;
}

function make(dir: 'up' | 'down'): Strategy {
  const up = dir === 'up';
  return {
    id: up ? 'round-up-compensate' : 'round-down-compensate',
    name: up ? 'Round up, compensate' : 'Round down, compensate',
    explain: up
      ? 'Multiply from a round number just above, then subtract the overshoot. Good when the number sits just under a round anchor.'
      : 'Multiply from a round number just below, then add the rest. Good when the number sits just over a round anchor.',
    applies: (p) => pick(p, dir) !== null,
    expand(p) {
      const { x, y, r, d } = pick(p, dir)!;
      const s1 = step(`${fmt(r)} × ${fmt(y)}`, r * y, 'mul', [r, y], `round ${x} ${dir} to ${r}`);
      const s2 = step(`${fmt(d)} × ${fmt(y)}`, d * y, 'mul', [d, y]);
      const s3 = up
        ? step(`${fmt(r * y)} − ${fmt(d * y)}`, x * y, 'sub', [r * y, d * y])
        : step(`${fmt(r * y)} + ${fmt(d * y)}`, x * y, 'add', [r * y, d * y]);
      return { steps: [s1, s2, s3], answer: x * y };
    },
  };
}

export const roundUpCompensate = make('up');
export const roundDownCompensate = make('down');
