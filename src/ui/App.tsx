import { useMemo, useRef, useState } from 'react';
import { parse } from '../engine/parse';
import { rank, type RankResult } from '../engine/rank';
import { fmt } from '../engine/util';
import type { Problem } from '../engine/types';
import { ResultCard } from './ResultCard';

function formatProblem(p: Problem): string {
  switch (p.op) {
    case 'add':
      return `${fmt(p.a)} + ${fmt(p.b)}`;
    case 'sub':
      return `${fmt(p.a)} − ${fmt(p.b)}`;
    case 'mul':
      return `${fmt(p.a)} × ${fmt(p.b)}`;
    case 'div':
      return `${fmt(p.a)} ÷ ${fmt(p.b)}`;
    case 'square':
      return `${fmt(p.a)}²`;
    case 'pct':
      return `${fmt(p.a)}% of ${fmt(p.b)}`;
  }
}

const EXAMPLES = [
  '77 × 5',
  '46 × 5',
  '23 × 17',
  '48²',
  '1000 − 423',
  '15% of 240',
  '68 + 57',
  '144 ÷ 12',
  '16 × 25',
];

const TOP_N = 3;

interface Shown {
  label: string;
  result: RankResult;
}

export function App() {
  const debug = useMemo(
    () => new URLSearchParams(window.location.search).get('debug') === '1',
    [],
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (text: string) => {
    const parsed = parse(text);
    if (!parsed.ok) {
      setError(parsed.error);
      setShown(null);
      return;
    }
    setError(null);
    setShowAll(false);
    setShown({ label: formatProblem(parsed.problem), result: rank(parsed.problem) });
  };

  const tryExample = (ex: string) => {
    setInput(ex);
    submit(ex);
    inputRef.current?.focus();
  };

  const ranked = shown?.result.ranked ?? [];
  const visible = debug || showAll ? ranked : ranked.slice(0, TOP_N);
  const hidden = ranked.length - visible.length;

  return (
    <div className="min-h-screen font-body">
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:pt-16">
        <header className="rise">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Mental Math Path
          </h1>
          <p className="mt-2 text-faint">
            Type a problem — see the easiest ways to do it in your head.
          </p>
        </header>

        <div className="rise mt-8" style={{ animationDelay: '60ms' }}>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit(input);
            }}
            placeholder="77 × 5      48²      15% of 240"
            aria-label="Arithmetic problem"
            aria-invalid={error !== null}
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-none border-2 border-ink bg-card px-4 py-3.5 font-mono text-xl shadow-[4px_4px_0_0_var(--color-rule)] outline-none placeholder:text-rule focus:border-accent focus:shadow-[4px_4px_0_0_var(--color-accent)]"
          />
          {error ? (
            <p role="alert" className="mt-2 font-mono text-sm italic text-accent">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-sm text-faint">
              Press <span className="font-mono">Enter</span> to trace the paths.
            </p>
          )}
        </div>

        <div className="rise mt-5 flex flex-wrap gap-2" style={{ animationDelay: '120ms' }}>
          <span className="py-1 text-sm italic text-faint">Try these:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => tryExample(ex)}
              className="border border-rule bg-card px-2.5 py-1 font-mono text-sm text-ink transition-colors hover:border-ink"
            >
              {ex}
            </button>
          ))}
        </div>

        {debug && (
          <p className="mt-6 border border-dashed border-pen px-3 py-1.5 font-mono text-xs text-pen">
            debug — showing all strategies with full cost detail
          </p>
        )}

        {shown && (
          <section className="mt-10" key={shown.label + String(shown.result.answer)}>
            <h2 className="rise font-display text-3xl font-semibold sm:text-4xl">
              {shown.label} <span className="font-normal text-faint">=</span>{' '}
              <span className="text-accent">{fmt(shown.result.answer)}</span>
            </h2>

            {ranked.length === 0 ? (
              <p className="rise mt-6 border border-rule bg-card p-5 text-faint" style={{ animationDelay: '80ms' }}>
                No named trick fits this one — it&rsquo;s straight arithmetic.
              </p>
            ) : (
              <>
                <p className="rise mt-1 text-sm text-faint" style={{ animationDelay: '60ms' }}>
                  {ranked.length} {ranked.length === 1 ? 'path' : 'paths'} found, easiest first.
                </p>
                <div className="mt-5 flex flex-col gap-5">
                  {visible.map((s, i) => (
                    <ResultCard
                      key={s.strategy.id}
                      scored={s}
                      place={i + 1}
                      delayMs={100 + i * 90}
                      defaultOpen={debug}
                    />
                  ))}
                </div>
                {hidden > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="mx-auto mt-6 block border-b border-dashed border-faint pb-0.5 text-sm text-faint transition-colors hover:border-ink hover:text-ink"
                  >
                    Show all {ranked.length} strategies ↓
                  </button>
                )}
                {showAll && !debug && hidden === 0 && ranked.length > TOP_N && (
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="mx-auto mt-6 block border-b border-dashed border-faint pb-0.5 text-sm text-faint transition-colors hover:border-ink hover:text-ink"
                  >
                    Show top {TOP_N} only ↑
                  </button>
                )}
              </>
            )}
          </section>
        )}

        <footer className="mt-20 border-t border-rule pt-4 text-xs text-faint">
          Every path is checked against exact arithmetic — a wrong answer is never shown.
          Ranking weights live in <span className="font-mono">src/engine/cost.ts</span>.
        </footer>
      </main>
    </div>
  );
}
