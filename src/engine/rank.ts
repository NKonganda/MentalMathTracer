import type { Problem, ScoredStrategy } from './types';
import { scoreTree, WEIGHTS, type Weights } from './cost';
import { allStrategies } from './strategies';

export function trueAnswer(p: Problem): number {
  switch (p.op) {
    case 'add':
      return p.a + p.b;
    case 'sub':
      return p.a - p.b;
    case 'mul':
      return p.a * p.b;
    case 'div':
      return p.a / p.b;
    case 'square':
      return p.a * p.a;
    case 'pct':
      return (p.a * p.b) / 100;
  }
}

export interface RankResult {
  answer: number;
  ranked: ScoredStrategy[];
}

/**
 * Run every strategy, keep the applicable ones, verify each tree against the
 * true answer (a wrong answer must never be shown), score, sort easiest-first.
 */
export function rank(p: Problem, w: Weights = WEIGHTS): RankResult {
  const answer = trueAnswer(p);
  const ranked: ScoredStrategy[] = allStrategies
    .filter((s) => {
      try {
        return s.applies(p);
      } catch {
        return false;
      }
    })
    .flatMap((s) => {
      try {
        const tree = s.expand(p);
        if (!Number.isFinite(tree.answer) || Math.abs(tree.answer - answer) > 1e-9) return [];
        return [{ strategy: s, tree, cost: scoreTree(tree, w) }];
      } catch {
        return [];
      }
    })
    .sort((x, y) => x.cost.total - y.cost.total);
  // two strategies can produce the identical step tree (e.g. round-down at 20
  // and place-value split of 23 both give 20×17 + 3×17) — show it only once
  const seen = new Set<string>();
  const deduped = ranked.filter((r) => {
    const sig = r.tree.steps.map((s) => s.expr).join('|');
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });
  return { answer, ranked: deduped };
}
