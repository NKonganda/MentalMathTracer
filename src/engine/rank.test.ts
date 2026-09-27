import { describe, expect, it } from 'vitest';
import type { Step } from './types';
import { parse } from './parse';
import { rank } from './rank';

function rankOf(input: string) {
  const r = parse(input);
  if (!r.ok) throw new Error(`parse failed for ${input}: ${r.error}`);
  return rank(r.problem);
}

function allSteps(steps: Step[]): Step[] {
  return steps.flatMap((s) => [s, ...(s.substeps ? allSteps(s.substeps) : [])]);
}

describe('rank: digit-sensitive ordering', () => {
  it('77×5: place-value split wins (70×5 and 7×5 are both table-grade); ×10-halve is NOT top (halving 770 is hard)', () => {
    const ids = rankOf('77*5').ranked.map((r) => r.strategy.id);
    expect(ids[0]).toBe('place-value-split');
    expect(ids.indexOf('x10-halve')).toBeGreaterThan(0); // still offered, just not first
  });

  it('46×5: ×10-halve IS top (halving 460 is trivial)', () => {
    const { ranked } = rankOf('46*5');
    expect(ranked[0].strategy.id).toBe('x10-halve');
  });

  it('23×17: difference of squares is top', () => {
    const { ranked } = rankOf('23 x 17');
    expect(ranked[0].strategy.id).toBe('difference-of-squares');
  });

  it('48²: near-50 is top and the bogus 50²−2² appears nowhere', () => {
    const { answer, ranked } = rankOf('48^2');
    expect(answer).toBe(2304);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].strategy.id).toBe('square-near-50');
    for (const r of ranked) {
      expect(r.strategy.id).not.toBe('difference-of-squares');
      expect(r.tree.answer).toBe(2304);
      // 50² − 2² = 2496: that wrong intermediate must never be produced
      for (const s of allSteps(r.tree.steps)) {
        expect(s.result).not.toBe(2496);
      }
    }
  });

  it('16×25: factor-and-regroup is top', () => {
    const { ranked } = rankOf('16*25');
    expect(ranked[0].strategy.id).toBe('factor-regroup');
  });

  it('1000−423: complement trick is top', () => {
    const { ranked } = rankOf('1000-423');
    expect(ranked[0].strategy.id).toBe('complement');
  });
});

describe('rank: safety', () => {
  it('every ranked tree carries the true answer', () => {
    for (const input of ['77*5', '46*5', '23*17', '48^2', '16*25', '1000-423', '15% of 240', '68+57', '144/12']) {
      const { answer, ranked } = rankOf(input);
      expect(ranked.length).toBeGreaterThan(0);
      for (const r of ranked) {
        expect(r.tree.answer).toBeCloseTo(answer, 9);
      }
    }
  });
});
