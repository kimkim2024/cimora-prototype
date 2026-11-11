import { useState } from 'react';
import { Link } from 'react-router-dom';
import { label } from './label';

type GraphState = 'ready' | 'changed' | 'failed' | 'recovered';

const NODES = ['Character assets', 'Storyboard sketches', 'Comic layout', 'Motion shot'];

function nodeStatus(state: GraphState, index: number) {
  const changed = state === 'changed';
  const failed = state === 'failed';
  const recovered = state === 'recovered';
  if (index === 0) return changed ? 'v2 · new version' : 'v1 · pinned';
  if (index === 1) return changed ? 'Needs review' : 'Done';
  if (index === 2) return changed ? 'Source updated' : 'Stable version kept';
  return failed ? 'Generation failed' : recovered ? 'Recovered' : changed ? 'Source updated' : 'Stable base';
}

function nodeTone(state: GraphState, index: number) {
  if (state === 'changed' && index > 0) return 'border-accent-line bg-accent-soft';
  if (state === 'failed' && index === 3) return 'border-negative/40 bg-negative/10';
  if (state === 'recovered' && index === 3) return 'border-positive/40 bg-positive/10';
  return 'border-hairline bg-paper';
}

const STATUS: Record<GraphState, { head: string; body: string }> = {
  ready: {
    head: 'One project to manage every stage of your story’s growth.',
    body: 'See clearly how characters, chapters, candidates, and delivery connect.',
  },
  changed: {
    head: '3 downstream steps need review.',
    body: 'Previously adopted versions and visuals are kept; you decide when to sync.',
  },
  failed: {
    head: 'Video step timed out; successful results kept.',
    body: 'Comic layout and the stable base remain usable; recover the failed step on its own.',
  },
  recovered: {
    head: 'Only the motion step was recovered; nothing else was redone.',
    body: 'Sample recovery complete; no model was called and no real cost was incurred.',
  },
};

/** "02 / Built for keeping going": a small graph that reacts to the buttons. */
export function Engineering() {
  const [state, setState] = useState<GraphState>('ready');
  const status = STATUS[state];

  return (
    <section className="container-page pt-24">
      {label(
        '02 / Built for keeping going',
        'Great creation needs a project that can keep going.',
        'Connect different model APIs, while keeping inputs, versions, and every retry under control.',
      )}

      <div className="mt-10 grid grid-cols-[0.75fr_1.25fr] items-center gap-12">
        <div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setState('changed')}
              className="inline-flex h-10 items-center rounded-xl border border-hairline-strong px-4 text-[12px] text-ink transition-colors hover:border-ink hover:bg-paper-muted"
            >
              Try an asset version update
            </button>
            <button
              type="button"
              onClick={() => setState('failed')}
              className="inline-flex h-10 items-center rounded-xl border border-hairline-strong px-4 text-[12px] text-ink transition-colors hover:border-ink hover:bg-paper-muted"
            >
              Try failure recovery
            </button>
            <button
              type="button"
              onClick={() => setState('recovered')}
              className="inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[12px] font-medium text-ink-inverse transition-opacity hover:opacity-90"
            >
              Recover only the failed step
            </button>
          </div>

          <p className="mt-6 text-[15px] leading-[1.8] text-ink-muted">
            Change one thing, see what it affects.
            <br />
            One step fails; keep everything already done.
          </p>

          <Link to="/app" className="mt-5 inline-block text-[12px] text-ink underline underline-offset-4">
            Open my studio
          </Link>
          <p className="mt-4 text-[10px] text-ink-quiet">
            This interactive demo is separate from your projects and never changes real work.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-paper-sunken/60 p-5">
          <div className="flex items-center justify-between gap-3 text-[10px] text-ink-muted">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-deep" />
              Before the Rain Ends / chapter 01
            </span>
            <span className="rounded border border-hairline bg-paper px-2 py-0.5 text-[9px] text-ink-quiet">
              Standalone sample project
            </span>
          </div>

          <div className="mt-7 flex items-center gap-2">
            {NODES.map((node, i) => (
              <div key={node} className="flex flex-1 items-center gap-2">
                <div className={'flex-1 rounded-lg border px-2 py-3 text-center transition-colors ' + nodeTone(state, i)}>
                  <strong className="block text-[10px] font-medium text-ink">{node}</strong>
                  <small className="mt-1 block text-[8px] text-ink-muted">{nodeStatus(state, i)}</small>
                </div>
                {i < NODES.length - 1 && (
                  <span aria-hidden className="text-[11px] text-ink-quiet">
                    –
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 border-t border-hairline pt-4" role="status">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-ink" />
            <div>
              <strong className="block text-[11px] font-medium text-ink">{status.head}</strong>
              <p className="mt-1 text-[10px] leading-[1.7] text-ink-muted">{status.body}</p>
            </div>
            {state !== 'ready' && (
              <button
                type="button"
                onClick={() => setState('ready')}
                className="ml-auto text-[10px] text-ink-quiet underline underline-offset-2 hover:text-ink"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
