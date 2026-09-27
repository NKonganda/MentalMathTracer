/* Prints the full ranking for the tuning cases. Run: npm run rankings */
import { parse } from '../src/engine/parse';
import { rank } from '../src/engine/rank';
import { fmt } from '../src/engine/util';

const CASES = [
  '77 × 5',
  '46 × 5',
  '23 × 17',
  '48²',
  '16 × 25',
  '1000 − 423',
  '15% of 240',
  '68 + 57',
  '144 ÷ 12',
];

for (const c of CASES) {
  const r = parse(c);
  if (!r.ok) {
    console.log(`\n${c}: PARSE ERROR — ${r.error}`);
    continue;
  }
  const { answer, ranked } = rank(r.problem);
  console.log(`\n=== ${c} = ${fmt(answer)} ===`);
  ranked.forEach((s, i) => {
    const chain = s.tree.steps.map((st) => `${st.expr} → ${fmt(st.result)}`).join('  ;  ');
    console.log(`  ${i + 1}. [${s.cost.total.toFixed(2).padStart(6)}] ${s.strategy.id.padEnd(22)} ${chain}`);
  });
}
