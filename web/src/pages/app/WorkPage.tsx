import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { artUrl } from '../../data/art';
import { WORKS, type Work } from '../../data/studio';
import { isReadable, studio, useStudio } from '../../lib/studioStore';

const MODES = ['Story text', 'Comic pages', 'Shot list'] as const;
type Mode = (typeof MODES)[number];

const kindLabel = (work: Work) =>
  work.type === 'motion' ? 'Video' : work.type === 'both' ? 'Comic and video' : 'Comic';

/** /app/community/:id — a work page: chapters, unlocks and three reading modes. */
export default function WorkPage() {
  const { id } = useParams();
  const work = WORKS.find((item) => item.id === id);
  const { favorites, follows, unlocks, wallet } = useStudio();
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('Comic pages');
  const [message, setMessage] = useState<string | null>(null);

  if (!work) {
    return (
      <div className="py-16">
        <h1 className="text-[22px] font-medium text-ink">Work not found</h1>
        <p className="mt-3 type-copy text-ink-muted">The link may point at a work that only exists in the prototype.</p>
        <Link to="/app/community" className="mt-6 inline-flex h-10 items-center rounded-xl border border-hairline px-4 type-copy">
          Back to the showroom
        </Link>
      </div>
    );
  }

  const saved = favorites.includes(work.id);
  const followed = follows.includes(work.id);
  const open = work.chapters.find((chapter) => chapter.id === openId) ?? null;

  return (
    <>
      <Link to="/app/community" className="type-meta text-ink-quiet transition-colors hover:text-ink">
        Back to Showcase
      </Link>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_300px] gap-6">
        <section>
          <div className="relative h-[300px] overflow-hidden rounded-2xl border border-hairline">
            <img src={artUrl(work.art)} alt="" className="h-full w-full object-cover" />
            <span className="absolute bottom-4 left-4 rounded bg-ink/80 px-2 py-1 type-micro text-ink-inverse">
              Cimora original demo
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-hairline bg-paper p-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">{work.title}</h1>
                <p className="mt-2 type-copy text-ink-muted">
                  {work.author} · {work.tag}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-pressed={followed}
                  onClick={() => studio.toggleFollow(work.id)}
                  className={
                    'h-9 rounded-lg border px-3.5 type-copy transition-colors ' +
                    (followed ? 'border-ink bg-ink text-ink-inverse' : 'border-hairline text-ink hover:bg-paper-muted')
                  }
                >
                  {followed ? 'Following' : 'Follow creator'}
                </button>
                <button
                  type="button"
                  aria-pressed={saved}
                  onClick={() => studio.toggleFavorite(work.id)}
                  className={
                    'h-9 rounded-lg border px-3.5 type-copy transition-colors ' +
                    (saved ? 'border-ink bg-ink text-ink-inverse' : 'border-hairline text-ink hover:bg-paper-muted')
                  }
                >
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <p className="mt-4 max-w-[62ch] type-copy leading-[1.75] text-ink-muted">{work.desc}</p>

            <div className="mt-5 flex flex-wrap items-center gap-5 border-y border-hairline py-3 type-meta text-ink-quiet">
              <span>
                {work.chapters.length} {work.chapters.length === 1 ? 'chapter' : 'chapters'}
              </span>
              <span>{kindLabel(work)}</span>
              <span>{work.published}</span>
            </div>

            <div>
              {work.chapters.map((chapter, index) => {
                const readable = isReadable(unlocks, work.id, chapter);
                const isOpen = chapter.id === openId;
                return (
                  <div
                    key={chapter.id}
                    className={
                      'grid grid-cols-[32px_minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-hairline py-3 last:border-b-0 ' +
                      (isOpen ? 'bg-paper-muted' : '')
                    }
                  >
                    <span className="type-micro tabular-nums text-ink-quiet">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <strong className="block type-copy font-medium text-ink">{chapter.title}</strong>
                      <small className="type-micro text-ink-quiet">
                        {chapter.pages} {chapter.pages === 1 ? 'page' : 'pages'}
                        {chapter.text ? ' · with story text' : ''}
                      </small>
                    </div>
                    {chapter.free ? (
                      <span className="rounded-full border border-accent-deep bg-accent/20 px-2.5 py-1 type-micro text-accent-deep">
                        Free
                      </span>
                    ) : readable ? (
                      <span className="rounded-full border border-hairline px-2.5 py-1 type-micro text-ink-muted">Unlocked</span>
                    ) : (
                      <span className="rounded-full border border-hairline px-2.5 py-1 type-micro text-ink-muted">
                        {chapter.price} credits
                      </span>
                    )}
                    {readable ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenId(chapter.id);
                          setMessage(null);
                        }}
                        className="h-8 rounded-lg border border-hairline px-3 type-list text-ink transition-colors hover:bg-paper-muted"
                      >
                        {isOpen ? 'Reading' : 'Read chapter'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const error = studio.unlock(work, chapter);
                          if (error) {
                            setMessage(error);
                            return;
                          }
                          setOpenId(chapter.id);
                          setMessage(null);
                        }}
                        className="h-8 rounded-lg bg-ink px-3 type-list font-medium text-ink-inverse transition-transform hover:-translate-y-px"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {message && (
              <p className="mt-4 rounded-lg border border-hairline bg-paper-muted px-3 py-2 type-meta text-ink">{message}</p>
            )}

            {open && (
              <section className="mt-6 rounded-xl border border-hairline bg-paper-muted p-5">
                <header className="flex items-baseline justify-between gap-4">
                  <h2 className="type-body font-medium text-ink">{open.title}</h2>
                  <small className="type-micro text-ink-quiet">
                    {open.pages} sample {open.pages === 1 ? 'page' : 'pages'} · demo content, not a finished chapter
                  </small>
                </header>

                <div role="group" aria-label="Reading mode" className="mt-4 inline-flex gap-1 rounded-full border border-hairline bg-paper p-1">
                  {MODES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={mode === option}
                      onClick={() => setMode(option)}
                      className={
                        'h-7 rounded-full px-3 type-micro transition-colors ' +
                        (mode === option ? 'bg-ink text-ink-inverse' : 'text-ink-muted hover:bg-paper-muted hover:text-ink')
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {mode === 'Story text' &&
                  (open.text ? (
                    <div className="mt-5 grid max-w-[64ch] gap-4">
                      {open.text.map((paragraph) => (
                        <p key={paragraph.slice(0, 24)} className="type-copy leading-[1.95] text-ink-muted">
                          {paragraph}
                        </p>
                      ))}
                      <p className="type-micro text-ink-quiet">
                        Sample chapter text for the demo. The studio script holds the full episode.
                      </p>
                    </div>
                  ) : (
                    <p className="mt-5 type-copy text-ink-muted">
                      This chapter has no story text in the demo. Switch to Comic pages to see the page previews.
                    </p>
                  ))}

                {mode === 'Comic pages' && (
                  <>
                    <div className="mt-5 grid grid-cols-4 gap-3.5">
                      {Array.from({ length: Math.min(open.pages, 4) }, (_, page) => (
                        <figure key={page} className="m-0 grid gap-1.5">
                          <img
                            src={artUrl(work.art + page)}
                            alt={`${open.title} sample page ${page + 1}`}
                            className="aspect-[3/4] w-full rounded-lg border border-hairline bg-paper object-cover"
                          />
                          <figcaption className="type-micro tabular-nums text-ink-quiet">
                            Page {String(page + 1).padStart(2, '0')} / {open.pages}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                    <p className="mt-4 type-micro text-ink-quiet">
                      Page previews only. Full page creation and export stay inside the studio.
                    </p>
                  </>
                )}

                {mode === 'Shot list' &&
                  (open.shots ? (
                    <>
                      <ol className="mt-5 list-none p-0">
                        {open.shots.map((shot) => (
                          <li key={shot.n} className="grid grid-cols-[30px_minmax(0,1fr)] gap-3.5 border-t border-hairline py-3.5 first:border-t-0">
                            <span className="type-micro tabular-nums text-ink-quiet">{String(shot.n).padStart(2, '0')}</span>
                            <div>
                              <strong className="type-list font-medium text-ink">{shot.framing}</strong>
                              <p className="mt-0.5 type-copy leading-[1.7] text-ink-muted">{shot.action}</p>
                              <small className="type-micro text-ink-quiet">{shot.line}</small>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-4 type-micro text-ink-quiet">
                        Shots carry the same panel and asset links as the storyboard in the studio; motion is not rendered in this demo.
                      </p>
                    </>
                  ) : (
                    <p className="mt-5 type-copy text-ink-muted">This chapter has no shot list in the demo.</p>
                  ))}
              </section>
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-hairline bg-paper p-6">
          <p className="type-micro text-ink-quiet">Behind the story</p>
          <h2 className="mt-2 type-lead font-medium leading-[1.35] text-ink">The craft behind the story.</h2>
          <p className="mt-3 type-copy leading-[1.7] text-ink-muted">
            Showing a work and licensing its source pipeline are managed separately. Author prompts, assets and project files are never published here automatically.
          </p>
          <ul className="mt-4 grid list-disc gap-1.5 pl-4 type-meta leading-[1.7] text-ink-muted">
            <li>Chapters unlock with credits in this local demo.</li>
            <li>Following a creator only fills the Following feed.</li>
            <li>Reading never exposes the project file.</li>
          </ul>
          <div className="mt-5 border-t border-hairline pt-4 type-meta">
            <p className="text-ink-quiet">
              Available credits <span className="tabular-nums text-ink">· {wallet}</span>
            </p>
            <Link to="/app/market" className="mt-2 inline-block text-ink transition-colors hover:text-ink-hover">
              Browsing related creative resources
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
