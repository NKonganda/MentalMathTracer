import type { Step, Strategy } from '../types';
import { fmt, step } from '../util';

const SHORTCUTS = [5, 10, 12.5, 20, 25, 50, 75];

/** 50% = ÷2, 25% = ÷4, 12.5% = ÷8, 75% = ¾, 20% = ÷5, 10% = ÷10, 5% = half of 10%. */
export const pctShortcut: Strategy = {
  id: 'pct-shortcut',
  name: 'Fraction shortcut',
  explain: 'Special percentages are simple fractions: 50% = ÷2, 25% = ÷4, 12.5% = ÷8.',
  applies: (p) => p.op === 'pct' && SHORTCUTS.includes(p.a) && p.b >= 2,
  expand(p) {
    const { a, b } = p;
    const steps: Step[] = [];
    const halve = (n: number, note?: string) => {
      steps.push(step(`half of ${fmt(n)}`, n / 2, 'halve', [n], note));
      return n / 2;
    };
    switch (a) {
      case 50:
        halve(b, '50% = ÷2');
        break;
      case 25:
        halve(halve(b, '25% = ÷4: halve twice'));
        break;
      case 12.5:
        halve(halve(halve(b, '12.5% = ÷8: halve three times')));
        break;
      case 75: {
        steps.push(step(`${fmt(b)} ÷ 4`, b / 4, 'div', [b, 4], '75% = ¾'));
        steps.push(step(`${fmt(b / 4)} × 3`, (b / 4) * 3, 'mul', [b / 4, 3]));
        break;
      }
      case 20: {
        steps.push(step(`${fmt(b)} ÷ 10`, b / 10, 'shift', [b, 10], '20% = ÷10 then ×2'));
        steps.push(step(`${fmt(b / 10)} × 2`, b / 5, 'double', [b / 10]));
        break;
      }
      case 10:
        steps.push(step(`${fmt(b)} ÷ 10`, b / 10, 'shift', [b, 10], '10% = ÷10'));
        break;
      case 5: {
        steps.push(step(`${fmt(b)} ÷ 10`, b / 10, 'shift', [b, 10], '5% = half of 10%'));
        halve(b / 10);
        break;
      }
    }
    return { steps, answer: (a * b) / 100 };
  },
};
