import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RECIPES, WORK_STORY, WORKS } from '../../data/home';
import { label } from './label';

const FILTERS = ['Featured works', 'Story', 'Comic', 'Video'] as const;

/** "03 / Made of imagination": the work grid, filtered. */
export function Works() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Featured works');

  const showStory = filter === 'Featured works' || filter === 'Story';
  const works = WORKS.filter((work) => {
    if (filter === 'Comic') return work.comic;
    if (filter === 'Video') return work.motion;
    return true;
  });

  return (
    <section className="container-page pt-24">
      <div className="flex items-end justify-between gap-6">
        {label('03 / Made of imagination', 'Every story has its own light.')}
        <Link to="/showcase" className="text-[12px] text-ink underline underline-offset-4">
          Explore showcase
        </Link>
      </div>

      <div role="group" aria-label="Filter works" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const active = option === filter;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option)}
              className={
                'h-9 rounded-full border px-4 text-[12px] transition-colors ' +
                (active
                  ? 'border-ink bg-ink text-ink-inverse'
                  : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink')
              }
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {showStory && (
          <article>
            <Link to="/resources" className="group block overflow-hidden rounded-xl border border-hairline bg-paper">
              <div className="relative">
                <img
                  src={WORK_STORY.cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-paper/85 px-2.5 py-1 text-[9px] text-ink backdrop-blur">
                  Story
                </span>
              </div>
            </Link>
            <h3 className="mt-3 text-[13px] font-medium text-ink">{WORK_STORY.title}</h3>
            <p className="mt-1 text-[10px] text-ink-muted">
              {WORK_STORY.tag}
              <span className="block text-[9px] text-ink-quiet">{WORK_STORY.note}</span>
            </p>
          </article>
        )}

        {works.map((work) => (
          <article key={work.title}>
            <Link to="/showcase" className="group block overflow-hidden rounded-xl border border-hairline bg-paper">
              <div className="relative">
                <img
                  src={work.cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-paper/85 px-2.5 py-1 text-[9px] text-ink backdrop-blur">
                  {work.type}
                </span>
              </div>
            </Link>
            <h3 className="mt-3 text-[13px] font-medium text-ink">{work.title}</h3>
            <p className="mt-1 text-[10px] text-ink-muted">
              {work.tag}
              <span className="block text-[9px] text-ink-quiet">Original demo</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** "A good place to start": three recipes. */
export function Recipes() {
  return (
    <section className="container-page pt-24">
      <div className="flex items-end justify-between gap-6">
        {label('', 'Let a good method be your next starting point.')}
        <Link to="/templates" className="text-[12px] text-ink underline underline-offset-4">
          Open skills & template market
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {RECIPES.map((recipe) => (
          <Link
            key={recipe.title}
            to="/templates"
            className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-paper transition-colors hover:border-hairline-strong"
          >
            <div
              className={
                'relative flex h-[168px] items-end p-4 ' +
                (recipe.tone === 'accent'
                  ? 'bg-accent'
                  : recipe.tone === 'ink'
                    ? 'bg-ink'
                    : 'bg-paper-sunken')
              }
            >
              <span
                className={
                  'text-[15px] font-medium leading-[1.3] ' +
                  (recipe.tone === 'ink' ? 'text-ink-inverse' : 'text-ink')
                }
              >
                {recipe.title.split('·')[0].trim()}
              </span>
              <span aria-hidden className="absolute right-4 top-4 flex gap-1">
                <span className="h-4 w-4 rounded-full bg-paper/70" />
                <span className="h-4 w-4 rounded-full bg-paper/50" />
                <span className="h-4 w-4 rounded-full bg-paper/30" />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <small className="text-[9px] uppercase tracking-[0.12em] text-ink-quiet">
                {recipe.category} / {recipe.author}
              </small>
              <h3 className="mt-2 text-[14px] font-medium leading-[1.35] text-ink">{recipe.title}</h3>
              <p className="mt-2 text-[11px] leading-[1.6] text-ink-muted">{recipe.desc}</p>
              <span className="mt-auto pt-4 text-[11px] text-ink underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
                View recipe
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
