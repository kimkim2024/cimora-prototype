import { useState } from 'react';
import { Link } from 'react-router-dom';
import { artUrl } from '../../data/art';
import { label } from './label';

const STEPS = [
  {
    title: 'First, tell the story well.',
    desc: 'One line is enough to begin. Expand the plot, polish the dialogue, and split it into chapters ready to produce.',
    cta: 'Start with an idea',
    to: '/app/new',
    tag: 'Story room',
    kind: 'story' as const,
  },
  {
    title: 'Let words grow into storyboards.',
    desc: 'Confirm the narrative and action first, then generate sketches. Every panel dialogue, order, and detail stays editable.',
    cta: 'Explore comic creation',
    to: '/features/webtoon',
    tag: 'Storyboards',
    kind: 'boards' as const,
  },
  {
    title: 'Keep your character unmistakably themselves.',
    desc: 'Characters, scenes, and props belong to projects and chapters. Pinned versions keep every step traceable.',
    cta: 'See character sheets',
    to: '/tools',
    tag: 'World bible',
    kind: 'assets' as const,
  },
  {
    title: 'One story, another way to tell it.',
    desc: 'Lay out comics directly, or keep going with shots and sound for video. Switch freely between the workflow and the infinite canvas.',
    cta: 'Start with video',
    to: '/app',
    tag: 'Motion studio',
    kind: 'motion' as const,
  },
];

/** "01 / Make your story": four steps, each with the panel it produces. */
export function Process() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section className="container-page pt-24">
      {label('01 / Make your story', 'Every step of creating, firmly in your hands.', 'From the first line, to your first work.')}

      <div className="mt-10 grid grid-cols-[0.85fr_1.15fr] items-start gap-14">
        <div>
          {STEPS.map((item, i) => {
            const open = i === active;
            return (
              <article key={item.title} className={'border-l-2 pl-5 transition-colors ' + (open ? 'border-ink' : 'border-hairline')}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setActive(i)}
                    className={
                      'flex w-full items-center gap-4 py-4 text-left text-[17px] font-medium leading-[1.35] transition-colors ' +
                      (open ? 'text-ink' : 'text-ink-muted hover:text-ink')
                    }
                  >
                    <span className="text-[10px] tabular-nums text-ink-quiet">{String(i + 1).padStart(2, '0')}</span>
                    {item.title}
                  </button>
                </h3>
                {open && (
                  <div className="pb-5">
                    <p className="text-[13px] leading-[1.75] text-ink-muted">{item.desc}</p>
                    <Link to={item.to} className="mt-3 inline-block text-[12px] text-ink underline underline-offset-4">
                      {item.cta}
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-hairline bg-paper">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-quiet">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-deep" />
              Before the Rain Ends / sample project
            </span>
            <span>{step.tag}</span>
          </div>
          {step.kind === 'story' && <StoryPreview />}
          {step.kind === 'boards' && <BoardsPreview />}
          {step.kind === 'assets' && <AssetsPreview />}
          {step.kind === 'motion' && <MotionPreview />}
        </div>
      </div>
    </section>
  );
}

function StoryPreview() {
  return (
    <div className="px-7 py-6">
      <p className="text-[9px] uppercase tracking-[0.16em] text-ink-quiet">Chapter 01</p>
      <h4 className="mt-2 text-[22px] font-medium tracking-[-0.02em] text-ink">Reunion in the Rain</h4>
      <p className="mt-3 text-[13px] leading-[1.9] text-ink-muted">
        Seven years later, Lin Xia returns to the old bookstore on the corner.
        <br />
        The doorbell rings, and a familiar figure turns from behind the shelves.
      </p>
      <blockquote className="mt-5 border-l-2 border-ink pl-4 text-[14px] text-ink">
        “I thought you’d never come back.”
      </blockquote>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px]">
        {['Original idea', 'Story outline', 'Chapter content'].map((chip, i) => (
          <span
            key={chip}
            className={
              'rounded-md border px-2.5 py-1 ' +
              (i === 2 ? 'border-ink bg-ink text-ink-inverse' : 'border-hairline text-ink-muted')
            }
          >
            {chip}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[10px] text-ink-quiet">Editable candidates · original text kept separately</p>
    </div>
  );
}

function BoardsPreview() {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 px-5 py-5">
        {[
          { art: 0, no: '01', cap: 'Old bookstore · wide shot' },
          { art: 1, no: '02', cap: 'Meeting eyes · close-up' },
          { art: 3, no: '03', cap: 'Unsent letter · medium shot' },
        ].map((item) => (
          <figure key={item.no} className="overflow-hidden rounded-lg border border-hairline bg-paper-sunken">
            <img src={artUrl(item.art)} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
            <figcaption className="px-2.5 py-2 text-[9px] text-ink-muted">
              <span className="block text-[8px] text-ink-quiet">{item.no}</span>
              {item.cap}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-hairline px-5 py-3 text-[10px] text-ink-quiet">
        <span>Sketch v2</span>
        <span>Dialogue and reading order, saved together</span>
      </div>
    </>
  );
}

function AssetsPreview() {
  return (
    <div className="grid grid-cols-[0.9fr_1.1fr] gap-5 px-5 py-5">
      <div className="relative overflow-hidden rounded-lg">
        <img src={artUrl(1)} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/70 px-3 py-2 text-[12px] text-ink-inverse">
          Lin Xia <b className="text-[9px] font-normal text-ink-inverse/80">v2 · locked</b>
        </span>
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-[0.14em] text-ink-quiet">Pinned in this chapter</p>
        <div className="mt-2 divide-y divide-hairline">
          {[
            { art: 0, name: 'Old bookstore', version: 'Scene v1' },
            { art: 3, name: 'Unsent letter', version: 'Prop v1' },
            { art: 2, name: 'Chen Xu', version: 'Character v1' },
          ].map((row) => (
            <div key={row.name} className="flex items-center gap-3 py-2">
              <img src={artUrl(row.art)} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
              <div>
                <strong className="block text-[11px] font-medium text-ink">{row.name}</strong>
                <small className="text-[9px] text-ink-quiet">{row.version}</small>
              </div>
              <span aria-hidden className="ml-auto text-[10px] text-ink-quiet">
                ✓
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-[1.6] text-ink-quiet">
          You confirm new versions; existing visuals stay as they are.
        </p>
      </div>
    </div>
  );
}

function MotionPreview() {
  return (
    <>
      <div className="relative overflow-hidden">
        <img src={artUrl(2)} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
        <span className="absolute right-3 top-3 rounded bg-ink/60 px-2 py-1 text-[9px] text-ink-inverse/90">
          Camera preview · 48s
        </span>
        <span className="absolute inset-x-0 bottom-5 text-center text-[13px] text-ink-inverse drop-shadow">
          This time, let’s go together.
        </span>
      </div>
      <div className="flex gap-1.5 px-4 py-3">
        {[0, 1, 2, 3, 6, 7, 8].map((art) => (
          <img key={art} src={artUrl(art)} alt="" loading="lazy" className="h-10 flex-1 rounded object-cover" />
        ))}
      </div>
    </>
  );
}
