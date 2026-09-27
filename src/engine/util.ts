import type { Step, StepOp } from './types';

export const isInt = (n: number): boolean => Number.isInteger(n);

export const numDigits = (n: number): number => Math.abs(Math.trunc(n)).toString().length;

/** 350 → 35, 1600 → 16, 0 → 0 */
export function stripZeros(n: number): number {
  n = Math.abs(n);
  while (n !== 0 && n % 10 === 0) n /= 10;
  return n;
}

/** Carries required to add a + b column by column. */
export function countCarries(a: number, b: number): number {
  if (!isInt(a) || !isInt(b) || a < 0 || b < 0) return 0;
  let carries = 0;
  let carry = 0;
  while (a > 0 || b > 0) {
    const s = (a % 10) + (b % 10) + carry;
    carry = s >= 10 ? 1 : 0;
    if (carry) carries++;
    a = Math.trunc(a / 10);
    b = Math.trunc(b / 10);
  }
  return carries;
}

/** Borrows required to compute a − b column by column (a ≥ b ≥ 0). */
export function countBorrows(a: number, b: number): number {
  if (!isInt(a) || !isInt(b) || b < 0 || a < b) return 0;
  let borrows = 0;
  let borrow = 0;
  while (b > 0 || borrow > 0) {
    const d = (a % 10) - (b % 10) - borrow;
    borrow = d < 0 ? 1 : 0;
    if (borrow) borrows++;
    a = Math.trunc(a / 10);
    b = Math.trunc(b / 10);
    if (a === 0 && b === 0) break;
  }
  return borrows;
}

/** 770 → true (halving forces a split), 460 → false (halves clean). */
export function tensDigitOdd(n: number): boolean {
  return Math.trunc(Math.abs(n) / 10) % 2 === 1;
}

/** True if a × b reduces to a times-table fact once trailing zeros are stripped. */
export function isTimesTable(a: number, b: number): boolean {
  const x = stripZeros(a);
  const y = stripZeros(b);
  return isInt(x) && isInt(y) && x >= 1 && x <= 12 && y >= 1 && y <= 12;
}

/**
 * Fact retrieval grade for a step, if any.
 * 'table'  — instant retrieval: times tables (after stripping zeros, so 70×5
 *            is as free as 7×5), memorized squares ≤ 25², single-digit add/sub.
 * 'anchor' — quick but derived: quarter facts on 25/50/75/100 (75×5 = 375 is
 *            fast, but not as automatic as 7×5 = 35).
 */
export type FactKind = 'table' | 'anchor';

export function factKind(op: StepOp, operands: number[], result: number): FactKind | null {
  const abs = operands.map(Math.abs);
  if (op === 'mul') {
    const [a, b] = abs;
    if (isTimesTable(a, b)) return 'table';
    if (a === b && a <= 25) return 'table';
    if (
      [25, 50, 75, 100].some((k) => abs.includes(k)) &&
      Math.min(a, b) <= 20 &&
      isInt(result) &&
      result % 25 === 0
    ) {
      return 'anchor';
    }
  }
  if (op === 'div') {
    const [a, b] = abs;
    if (isTimesTable(b, Math.abs(result))) return 'table';
    if (isTimesTable(stripZeros(a), b)) return 'table';
  }
  if (op === 'add' || op === 'sub') {
    if (abs.every((x) => x < 10)) return 'table';
  }
  return null;
}

export function step(
  expr: string,
  result: number,
  op: StepOp,
  operands: number[],
  note?: string,
  substeps?: Step[],
): Step {
  const s: Step = { expr, result, op, operands };
  if (note) s.note = note;
  if (substeps) s.substeps = substeps;
  return s;
}

export const fmt = (n: number): string =>
  Number.isInteger(n) ? String(n) : String(Math.round(n * 10000) / 10000);
