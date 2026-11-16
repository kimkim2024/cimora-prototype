import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs } from '../../components/ui/Tabs';
import { artUrl } from '../../data/art';
import { KINDS, SHOWCASE_TABS, WORKS, type Work, type WorkKind } from '../../data/studio';
import { useStudio } from '../../lib/studioStore';

const KIND_LABEL = (work: Work) =>
  work.type === 'motion' ? 'Video' : work.type === 'both' ? 'Comic and video' : 'Comic';

/** /app/community — the showroom: five feeds, kind filters and search. */
export default function ShowcasePage() {
  const { follows, favorites } = useStudio();
  const [tab, setTab] = useState<(typeof SHOWCASE_TABS)[number]>('Featured');
  const [kind, setKind] = useState<'all' | WorkKind>('all');
  const [query, setQuery] = useState('');

  const works = useMemo(() => {
    let list = [...WORKS];
    if (tab === 'Latest updates') list.sort((a, b) => b.published.localeCompare(a.published));
    if (tab === 'Following') list = list.filter((work) => follows.includes(work.id));
    if (tab === 'Saved') list = list.filter((work) => favorites.includes(work.id));
    if (tab === 'My publishes') list = [];
    if (kind !== 'all') list = list.filter((work) => work.kinds.includes(kind));
    const needle = query.trim().toLowerCase();
    if (needle) {
      list = list.filter((work) => `${work.title} ${work.author} ${work.tag} ${work.desc}`.toLowerCase().includes(needle));
    }
    return list;
  }, [tab, kind, query, follows, favorites]);

  const empty =
    tab === 'Following'
      ? 'You are not following anyone yet. Follow a creator from a work page and their updates land here.'
      : tab === 'My publishes'
        ? 'Nothing published under this local account yet. Open a project and publish a work snapshot.'
        : query.trim()
          ? 'No work matches that search. Try another title, author or genre.'
          : 'Nothing here yet. Save a world you like, or publish your own snapshot.';

  return (
    <>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-medium leading-[1.2] tracking-[-0.025em] text-ink">Every kind of imagination deserves to be seen.</h1>
          <p className="mt-2 max-w-[62ch] type-copy text-ink-muted">
            Meet new characters, worlds and creators. Publishing a work starts from a chapter inside a project, and never exposes the project file.
          </p>
        </div>
        <Link
          to="/app/projects"
          className="inline-flex h-10 shrink-0 items-center rounded-xl bg-ink px-4 type-copy font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
        >
          Publish my work
        </Link>
      </header>

      <div className="mt-8">
        <Tabs options={SHOWCASE_TABS} value={tab} onChange={setTab} label="Showcase feeds" />
      </div>

      {tab === 'Featured' && (
        <section className="relative mt-6 h-[340px] overflow-hidden rounded-2xl border border-hairline">
          <img src={artUrl(10)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.88),rgba(17,17,17,0.46)_46%,rgba(17,17,17,0.06)_78%,rgba(17,17,17,0))]" />
          <div className="relative flex h-full max-w-[46%] flex-col justify-center px-11">
            <p className="type-micro text-white/70">Cimora originals · featured</p>
            <h2 className="mt-3 text-[33px] font-medium leading-[1.1] text-white">Star Sea Post Office</h2>
            <p className="mt-3 max-w-[32ch] type-copy leading-[1.65] text-white/75">
              Send the words left unsaid to where the stars live.
            </p>
            <Link
              to="/app/community/sky-public"
              className="mt-5 inline-flex h-10 w-fit items-center rounded-full bg-white px-5 type-copy font-medium text-ink transition-colors hover:bg-paper-muted"
            >
              Step into this world
            </Link>
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
        <div role="group" aria-label="Filter by kind" className="flex flex-wrap items-center gap-2">
          {KINDS.map((option) => {
            const active = option.value === kind;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setKind(option.value)}
                className={
                  'h-8 rounded-full border px-3.5 type-list transition-colors ' +
                  (active
                    ? 'border-ink bg-ink text-ink-inverse'
                    : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink')
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="grid gap-1.5">
          <span className="type-micro text-ink-quiet">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, author or genre"
            aria-label="Search works"
            className="h-9 w-[260px] rounded-lg border border-hairline bg-paper px-3 type-copy text-ink outline-none transition-colors placeholder:text-ink-quiet focus:border-hairline-strong"
          />
        </label>
      </div>

      <p className="mt-4 type-meta text-ink-quiet">
        {works.length} {works.length === 1 ? 'work' : 'works'} in this view · original demo works, no invented popularity numbers
      </p>

      {works.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-hairline px-5 py-9 type-copy text-ink-muted">{empty}</p>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-x-6 gap-y-8">
          {works.map((work) => (
            <Link key={work.id} to={`/app/community/${work.id}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-paper-muted">
                <img
                  src={artUrl(work.art)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 left-3 rounded bg-ink/80 px-2 py-1 type-micro text-ink-inverse">
                  {KIND_LABEL(work)}
                </span>
              </div>
              <h3 className="mt-3 type-body font-medium text-ink">{work.title}</h3>
              <p className="mt-1 type-meta text-ink-muted">
                {work.author} <span className="text-ink-quiet">· {work.tag}</span>
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-hairline pt-2 type-micro text-ink-quiet">
                <span>
                  {work.chapters.length} {work.chapters.length === 1 ? 'chapter' : 'chapters'}
                </span>
                <span>{work.published}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
