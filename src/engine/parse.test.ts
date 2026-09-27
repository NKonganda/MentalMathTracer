import { describe, expect, it } from 'vitest';
import { parse } from './parse';

function expectProblem(input: string, op: string, a: number, b: number) {
  const r = parse(input);
  expect(r.ok, `${input} should parse`).toBe(true);
  if (r.ok) {
    expect(r.problem.op).toBe(op);
    expect(r.problem.a).toBe(a);
    expect(r.problem.b).toBe(b);
  }
}

describe('parse: accepted formats', () => {
  it('parses star multiplication', () => expectProblem('77*5', 'mul', 77, 5));
  it('parses x multiplication with spaces', () => expectProblem('77 x 5', 'mul', 77, 5));
  it('parses x multiplication without spaces', () => expectProblem('77x5', 'mul', 77, 5));
  it('parses unicode ×', () => expectProblem('77×5', 'mul', 77, 5));
  it('parses caret squares', () => expectProblem('48^2', 'square', 48, 48));
  it('parses unicode ²', () => expectProblem('48²', 'square', 48, 48));
  it('parses subtraction', () => expectProblem('1000-423', 'sub', 1000, 423));
  it('parses unicode minus', () => expectProblem('1000−423', 'sub', 1000, 423));
  it('parses percent-of', () => expectProblem('15% of 240', 'pct', 15, 240));
  it('parses percent-of with tight spacing', () => expectProblem('15%of 240', 'pct', 15, 240));
  it('parses decimal percent', () => expectProblem('12.5% of 240', 'pct', 12.5, 240));
  it('parses addition', () => expectProblem('68+57', 'add', 68, 57));
  it('parses slash division', () => expectProblem('144/12', 'div', 144, 12));
  it('parses unicode ÷', () => expectProblem('144÷12', 'div', 144, 12));
  it('tolerates whitespace', () => expectProblem('  16 × 25  ', 'mul', 16, 25));
  it('treats n×n as a square', () => expectProblem('48*48', 'square', 48, 48));
});

describe('parse: rejections', () => {
  const bad = ['', '   ', 'abc', 'seven times five', '2+3+4', '7++5', '12 +', '5 of 10', '48^3', '9/0'];
  for (const input of bad) {
    it(`rejects ${JSON.stringify(input)}`, () => {
      expect(parse(input).ok).toBe(false);
    });
  }
});
