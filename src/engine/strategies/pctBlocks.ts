import type { Step, Strategy } from '../types';
import { fmt, isInt, step } from '../util';

/** Build any multiple-of-5 percentage out of 10% and 5% blocks. */
export const pctBlocks: Strategy = {
  id: 'pct-blocks',
  name: '10% and 5% building blocks',
  explain: '10% is a shift, 5% is half of that — stack blocks to reach any multiple of 5.',
  applies: (p) =>
    p.op === 'pct' &&
    isInt(p.a) &&
    p.a % 5 === 0 &&
    p.a >= 15 &&
    p.a <= 95 &&
    ![25, 50, 75].includes(p.a),
  expand(p) {
    const { a, b } = p;
    const tens = Math.trunc(a / 10);
    const hasFive = a % 10 === 5;
    const ten = b / 10;
    const steps: Step[] = [step(`10% of ${fmt(b)}`, ten, 'shift', [b, 10])];
    let main = ten;
    if (tens > 1) {
      main = ten * tens;
      steps.push(step(`${fmt(ten)} × ${fmt(tens)}`, main, 'mul', [ten, tens], `${tens * 10}%`));
    }
    if (hasFive) {
      const five = ten / 2;
      steps.push(step(`half of ${fmt(ten)}`, five, 'halve', [ten], '5%'));
      steps.push(step(`${fmt(main)} + ${fmt(five)}`, main + five, 'add', [main, five]));
      return { steps, answer: main + five };
    }
    return { steps, answer: main };
  },
};
