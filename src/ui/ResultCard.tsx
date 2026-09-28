import type { ScoredStrategy, Step } from '../engine/types';
import { fmt } from '../engine/util';

function StepLines({ steps, final }: { steps: Step[]; final: number }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {steps.map((s, i) => {
        const isFinal = s.result === final && i === steps.length - 1;
        return (
          <li key={i}>
            <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-[15px]">
              <span>{s.expr}</span>
              <span className="text-rule">→</span>
              <span className={isFinal ? 'font-semibold text-accent' : 'font-medium text-pen'}>
                {fmt(s.result)}
              </span>
              {s.note && <span className="text-xs italic text-faint">— {s.note}</span>}
            </div>
            {s.substeps && s.substeps.length > 0 && (
              <div className="ml-3 mt-1.5 border-l-2 border-rule pl-3">
                <StepLines steps={s.substeps} final={final} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface Props {
  scored: ScoredStrategy;
  place: number;
  delayMs: number;
  animate?: boolean;
  defaultOpen?: boolean;
}

export function ResultCard({ scored, place, delayMs, animate = true, defaultOpen }: Props) {
  const { strategy, tree, cost } = scored;
  return (
    <article
      className={`${animate ? 'rise ' : ''}relative border border-rule bg-card p-5 shadow-[3px_3px_0_0_var(--color-rule)] sm:p-6`}
      style={animate ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-3 right-4 select-none font-display text-5xl font-semibold italic text-rule"
      >
        {place}
      </span>

      <header className="pr-10">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-xl font-semibold">{strategy.name}</h3>
          <span className="border border-rule px-1.5 py-0.5 font-mono text-xs text-faint">
            cost {cost.total.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-sm text-faint">{strategy.explain}</p>
      </header>

      <div className="mt-4">
        <StepLines steps={tree.steps} final={tree.answer} />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-rule pt-3">
        <details className="cost min-w-0 grow" open={defaultOpen}>
          <summary className="font-mono text-xs text-faint transition-colors hover:text-ink">
            <span className="chev">▸</span> why this cost
          </summary>
          <ul className="mt-2 flex flex-col gap-1 font-mono text-xs">
            {cost.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span className="min-w-0 truncate text-faint" title={item.label}>
                  {item.label}
                </span>
                <span className={item.amount < 0 ? 'shrink-0 text-good' : 'shrink-0 text-ink'}>
                  {item.amount < 0 ? '−' : '+'}
                  {Math.abs(item.amount).toFixed(2)}
                </span>
              </li>
            ))}
            <li className="mt-1 flex justify-between gap-4 border-t border-rule pt-1 font-semibold">
              <span>total</span>
              <span>{cost.total.toFixed(2)}</span>
            </li>
          </ul>
        </details>
        <p className="shrink-0 font-mono text-lg">
          <span className="text-faint">= </span>
          <span className="font-semibold text-accent">{fmt(tree.answer)}</span>
        </p>
      </div>
    </article>
  );
}
