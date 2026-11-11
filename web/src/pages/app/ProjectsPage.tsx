import { useState } from 'react';
import { artUrl } from '../../data/art';
import { ASSET_COUNT, PROJECTS, type Project } from '../../data/app';
import { legacyUrl } from '../../lib/legacy';

const FILTERS = ['All', 'In progress', 'Script draft'] as const;

/** /app/projects — the folder of projects, as glass sheets rather than a table. */
export default function ProjectsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');

  const projects = PROJECTS.filter((project) => {
    const matchesQuery = (project.name + project.desc).toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === 'All' || project.chapters.some((chapter) => chapter.status === filter);
    return matchesQuery && matchesFilter;
  });

  return (
    <>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-medium leading-[1.2] tracking-[-0.025em] text-ink">My projects</h1>
          <p className="mt-2 type-copy text-ink-muted">
            {PROJECTS.length} project · {ASSET_COUNT} shared assets · everything stays on this device
          </p>
        </div>
        <a
          href={legacyUrl('/app/new')}
          className="inline-flex h-10 items-center rounded-xl bg-ink px-4 type-copy font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
        >
          New project
        </a>
      </header>

      <div className="mt-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-1.5" role="group" aria-label="Filter projects">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={
                'h-8 rounded-full border px-3.5 type-list transition-colors ' +
                (filter === option
                  ? 'border-ink bg-ink text-ink-inverse'
                  : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink')
              }
            >
              {option}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects"
          aria-label="Search projects"
          className="h-9 w-[240px] rounded-lg border border-hairline bg-paper px-3 type-copy text-ink outline-none transition-colors placeholder:text-ink-quiet focus:border-hairline-strong"
        />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectFolder key={project.id} project={project} />
        ))}

        <a
          href={legacyUrl('/app/new')}
          className="group flex h-[248px] flex-col items-center justify-center rounded-2xl border border-dashed border-hairline-strong text-center transition-colors hover:border-ink"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-ink-muted transition-colors group-hover:border-ink group-hover:text-ink">
            +
          </span>
          <span className="mt-3 type-copy text-ink">Start a new project</span>
          <span className="mt-1 type-meta text-ink-quiet">Story, comic or motion</span>
        </a>
      </div>

      {projects.length === 0 && (
        <p className="mt-10 type-copy text-ink-muted">No projects match this filter yet.</p>
      )}
    </>
  );
}

function ProjectFolder({ project }: { project: Project }) {
  const open = project.chapters.filter((chapter) => chapter.status !== 'Script draft').length;

  return (
    <a href={legacyUrl(`/app/projects/${project.id}`)} className="group block">
      <div className="relative h-[248px]">
        {/* the cover sits under the sheets, so the folder reads as a stack */}
        <img
          src={artUrl(project.art)}
          alt=""
          className="absolute left-1/2 top-0 h-[128px] w-[86%] -translate-x-1/2 rounded-xl border border-hairline object-cover opacity-75 transition-transform duration-300 group-hover:-translate-y-1"
        />

        <div className="absolute left-1/2 top-[56px] h-[112px] w-[72%] -translate-x-1/2 -rotate-2 rounded-lg border border-hairline bg-paper-muted shadow-sm" />

        <div className="absolute left-1/2 top-[68px] h-[112px] w-[84%] -translate-x-1/2 rotate-1 rounded-lg border border-hairline bg-paper-muted px-4 py-3">
          <div className="h-1.5 w-[56%] rounded-full bg-hairline" />
          <div className="mt-2 h-1.5 w-[72%] rounded-full bg-paper-sunken" />
          <div className="mt-2 h-1.5 w-[64%] rounded-full bg-paper-sunken" />
        </div>

        <div className="absolute inset-x-0 bottom-0 rounded-xl border border-hairline bg-paper/95 p-4 shadow-card backdrop-blur transition-transform duration-300 group-hover:-translate-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate type-lead font-medium leading-[1.35] text-ink">{project.name}</h2>
              <p className="mt-1 truncate type-meta text-ink-muted">{project.desc}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2 type-meta text-ink-quiet">
            <span>
              {project.chapters.length} chapters · {open} in progress
            </span>
            <span>{project.updated}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
