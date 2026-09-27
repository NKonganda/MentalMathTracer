import type { Problem, Step, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

const NICE = [5, 10, 20, 25, 50, 75];

function swappable(p: Problem): boolean {
  if (p.op !== 'pct' || !isInt(p.a) || !isInt(p.b)) return false;
  if (!NICE.includes(p.b) || NICE.includes(p.a) || p.a === 100) return false;
  if ((p.b === 25 || p.b === 75) && p.a % 4 !== 0) return false;
  if (p.b === 50 && p.a % 2 !== 0) return false;
  return true;
}

/** a% of b = b% of a — flip it so the percentage becomes the easy one. */
export const pctSwap: Strategy = {
  id: 'pct-swap',
  name: 'Swap the percentage',
  explain: 'a% of b equals b% of a — flip so the easy number becomes the percentage.',
  applies: swappable,
  expand(p) {
    const { a, b } = p;
    const note = `${fmt(a)}% of ${fmt(b)} = ${fmt(b)}% of ${fmt(a)}`;
    const steps: Step[] = [];
    switch (b) {
      case 50:
        steps.push(step(`half of ${fmt(a)}`, a / 2, 'halve', [a], note));
        break;
      case 25:
        steps.push(step(`${fmt(a)} ÷ 4`, a / 4, 'div', [a, 4], note));
        break;
      case 75: {
        steps.push(step(`${fmt(a)} ÷ 4`, a / 4, 'div', [a, 4], note));
        steps.push(step(`${fmt(a / 4)} × 3`, (a / 4) * 3, 'mul', [a / 4, 3]));
        break;
      }
      case 20: {
        steps.push(step(`${fmt(a)} ÷ 10`, a / 10, 'shift', [a, 10], note));
        steps.push(step(`${fmt(a / 10)} × 2`, a / 5, 'double', [a / 10]));
        break;
      }
      case 10:
        steps.push(step(`${fmt(a)} ÷ 10`, a / 10, 'shift', [a, 10], note));
        break;
      case 5: {
        steps.push(step(`${fmt(a)} ÷ 10`, a / 10, 'shift', [a, 10], note));
        steps.push(step(`half of ${fmt(a / 10)}`, a / 20, 'halve', [a / 10]));
        break;
      }
    }
    return { steps, answer: (a * b) / 100 };
  },
};
