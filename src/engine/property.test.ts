import { expect, it } from 'vitest';
import type { Op, Problem } from './types';
import { trueAnswer } from './rank';
import { allStrategies } from './strategies';

// deterministic PRNG so failures reproduce
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(42);
const ri = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
const pickFrom = <T,>(arr: T[]): T => arr[ri(0, arr.length - 1)];

const P = (op: Op, a: number, b: number): Problem => ({ op, a, b, raw: '' });

function randomProblem(): Problem {
  switch (ri(0, 5)) {
    case 0:
      return P('add', ri(11, 999), ri(11, 999));
    case 1: {
      const a = ri(100, 2000);
      return P('sub', a, ri(10, a - 1));
    }
    case 2: {
      const b = rnd() < 0.5 ? pickFrom([4, 5, 6, 8, 9, 11, 25, 125]) : ri(3, 99);
      return P('mul', ri(11, 99), b);
    }
    case 3: {
      const b = ri(2, 25);
      const q = ri(2, 40);
      const messy = rnd() < 0.3 && b > 1 ? ri(1, b - 1) : 0;
      return P('div', q * b + messy, b);
    }
    case 4: {
      const n = ri(13, 130);
      return P('square', n, n);
    }
    default:
      return P('pct', pickFrom([5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90]), ri(20, 990));
  }
}

it('500 random problems: every strategy that applies produces the exact answer', () => {
  for (let i = 0; i < 500; i++) {
    const p = randomProblem();
    const expected = trueAnswer(p);
    for (const s of allStrategies) {
      if (!s.applies(p)) continue;
      const tree = s.expand(p);
      const msg = `${s.id} on ${p.op}(${p.a}, ${p.b})`;
      expect(Number.isFinite(tree.answer), `${msg}: non-finite answer`).toBe(true);
      expect(Math.abs(tree.answer - expected), `${msg}: wrong answer ${tree.answer} ≠ ${expected}`).toBeLessThan(1e-9);
      expect(tree.steps.length, `${msg}: empty tree`).toBeGreaterThan(0);
      expect(
        Math.abs(tree.steps[tree.steps.length - 1].result - tree.answer),
        `${msg}: last step disagrees with answer`,
      ).toBeLessThan(1e-9);
    }
  }
});
