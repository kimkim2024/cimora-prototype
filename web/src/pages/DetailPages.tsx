import { Link, useParams } from 'react-router-dom';
import { artUrl } from '../data/art';
import { ARTICLES, CASES, TEMPLATES, TOOLS, UPDATES } from '../data/site';
import { PageHero, Section } from '../components/ui/PageHero';
import { ToolCard } from '../components/ui/Cards';
import { legacyUrl } from '../lib/legacy';
import NotFound from './NotFound';
import { useTitle } from '../lib/useTitle';

/** /showcase/:id — one story, from first frame to delivery. */
export function CasePage() {
  const { id } = useParams();
  const item = CASES.find((entry) => entry.id === id);
  if (!item) return <NotFound />;
  const tools = TOOLS.slice(1, 4);
  useTitle(`${item.title} · Showcase · Cimora`);

  return (
    <>
      <PageHero
        title={item.title}
        lead={item.subtitle}
        className="pb-10"
      >
        <p className="mt-4 text-[12px] text-ink-quiet">
          {item.tag} / original story · {item.shots} comic panels · {item.seconds}s of video
        </p>
      </PageHero>

      <section className="container-page">
        <figure className="overflow-hidden rounded-2xl border border-hairline bg-paper-sunken">
          <img src={artUrl(item.art)} alt={item.title} className="aspect-[16/7] w-full object-cover" />
        </figure>

        <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-10 rounded-2xl border border-hairline p-8">
          <div>
            <h2 className="text-[22px] font-medium leading-[1.3] tracking-[-0.02em] text-ink">
              One world, two ways to tell it.
            </h2>
            <p className="mt-3 max-w-[52ch] text-[13px] leading-[1.7] text-ink-muted">
              The comic is the source of truth for visuals and story; the video reuses the same characters, scenes and
              voice. Every step in between stays in one project.
            </p>
          </div>
          <div className="flex items-end justify-start gap-3">
            <a
              href={legacyUrl(`/app/projects/${item.id}`)}
              className="inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-medium text-ink-inverse transition-opacity hover:opacity-85"
            >
              Open this demo project
            </a>
            <Link
              to="/showcase"
              className="inline-flex h-10 items-center rounded-xl border border-hairline-strong px-4 text-[13px] font-medium text-ink transition-colors hover:border-ink"
            >
              All stories
            </Link>
          </div>
        </div>
      </section>

      <Section title="Behind the frame, every step is traceable.">
        <div className="grid grid-cols-4 gap-8 border-t border-hairline pt-6">
          {[
            'Lock characters and rainy-day style',
            'Confirm storyboard and dialogue',
            'Stable draft and key enhancements',
            'Final review and version delivery',
          ].map((step, i) => (
            <div key={step}>
              <span className="text-[11px] tabular-nums text-ink-quiet">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-[15px] font-medium leading-[1.4] text-ink">{step}</h3>
              <p className="mt-2 text-[12px] leading-[1.7] text-ink-muted">
                Done in one project, with existing versions and candidates always kept.
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Continue with these tools" className="pb-24">
        <div className="grid grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </Section>
    </>
  );
}

/** /templates/:id — a starting point, explained. */
export function TemplatePage() {
  const { id } = useParams();
  const item = TEMPLATES.find((entry) => entry.id === id);
  useTitle(item ? `${item.title} · Templates · Cimora` : 'Templates · Cimora');
  if (!item) return <NotFound />;

  return (
    <>
      <section className="container-page grid grid-cols-[1fr_1fr] items-center gap-14 pt-20">
        <div>
          <p className="text-[11px] text-ink-quiet">{item.type}</p>
          <h1 className="mt-3 max-w-[18ch] text-[44px] wide:text-[48px] mega:text-[52px] font-medium leading-[1.1] tracking-[-0.035em] text-ink">
            {item.title}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.7] text-ink-muted">{item.desc}</p>
          <a
            href={legacyUrl('/app/new?template=' + item.id)}
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-ink px-5 text-[14px] font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
          >
            Use this template
          </a>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-hairline bg-paper-sunken">
          <img src={artUrl(item.art)} alt="" className="aspect-[5/4] w-full object-cover" />
        </figure>
      </section>

      <Section title="Three steps to make it your own." className="pb-24">
        <div className="grid grid-cols-3 gap-8 border-t border-hairline pt-6">
          {['Choose or import your visuals', 'Replace characters and dialogue', 'Confirm the pacing and add to a chapter'].map(
            (step, i) => (
              <div key={step}>
                <span className="text-[11px] tabular-nums text-ink-quiet">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-[15px] font-medium leading-[1.4] text-ink">{step}</h3>
                <p className="mt-2 text-[12px] leading-[1.7] text-ink-muted">
                  Adjust unsatisfying parts locally; existing versions are kept.
                </p>
              </div>
            ),
          )}
        </div>
      </Section>
    </>
  );
}

/** /resources/:id — a guide, step by step. */
export function ArticlePage() {
  const { id } = useParams();
  if (id === 'updates') return <UpdatesPage />;


  const item = ARTICLES.find((entry) => entry.id === id);
  useTitle(item ? `${item.title} · Cimora` : 'Guides · Cimora');
  if (!item) return <NotFound />;

  return (
    <article className="container-prose pb-24 pt-20">
      <p className="text-[11px] text-ink-quiet">
        {item.category} · {item.time} read
      </p>
      <h1 className="mt-3 text-[44px] font-medium leading-[1.12] tracking-[-0.035em] text-ink">{item.title}</h1>

      <figure className="mt-10 overflow-hidden rounded-2xl border border-hairline bg-paper-sunken">
        <img src={artUrl(item.art)} alt="" className="aspect-[16/8] w-full object-cover" />
      </figure>

      <p className="mt-10 text-[14px] leading-[1.8] text-ink-muted">
        A complete creative flow should let you focus on the story itself. This guide uses “Before the Rain Ends” to
        show how to plan each step and keep existing results when you edit.
      </p>

      {item.steps.map((step, i) => (
        <section key={step} className="mt-10">
          <span className="text-[11px] tabular-nums text-ink-quiet">STEP {String(i + 1).padStart(2, '0')}</span>
          <h2 className="mt-2 text-[22px] font-medium leading-[1.35] tracking-[-0.02em] text-ink">{step}</h2>
          <p className="mt-3 text-[13px] leading-[1.8] text-ink-muted">
            {
              [
                'First decide what you want the audience to feel in this chapter. Express the plot goal in short scenes and dialogue, and avoid batch-generating frames before the story is confirmed.',
                'Choose confirmed references and asset versions. Set specific constraints on hairstyle, outfit and emotion so later frames have a stable basis.',
                'Limit issues to the affected frames and shots, compare candidates, then adopt one yourself. Old versions are kept for rollback and review.',
                'Before delivery, check order, subtitles and versions. A comic can be exported on its own or continue into the video canvas.',
              ][i]
            }
          </p>
        </section>
      ))}

      <div className="mt-12 rounded-2xl border border-hairline bg-paper-muted p-8">
        <h2 className="text-[17px] font-medium text-ink">Try it yourself</h2>
        <p className="mt-2 text-[13px] leading-[1.7] text-ink-muted">
          Open the local demo project and follow the steps. No paid models are called.
        </p>
        <a
          href={legacyUrl('/app/projects/rain')}
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-medium text-ink-inverse transition-opacity hover:opacity-85"
        >
          Open “Before the Rain Ends”
        </a>
      </div>
    </article>
  );
}

/** /resources/updates — the changelog. */
export function UpdatesPage() {
  useTitle('Product updates · Cimora');

  return (
    <div className="container-prose pb-24 pt-20">
      <h1 className="text-[44px] font-medium leading-[1.12] tracking-[-0.035em] text-ink">Keep making creation better.</h1>
      <div className="mt-10 divide-y divide-hairline border-t border-hairline">
        {UPDATES.map(([date, title, body]) => (
          <div key={date + title} className="py-7">
            <span className="text-[11px] tabular-nums text-ink-quiet">{date}</span>
            <h2 className="mt-2 text-[22px] font-medium leading-[1.35] tracking-[-0.02em] text-ink">{title}</h2>
            <p className="mt-2 max-w-[70ch] text-[13px] leading-[1.7] text-ink-muted">{body}</p>
          </div>
        ))}
      </div>
      <Link to="/resources" className="mt-10 inline-block text-[13px] text-ink underline underline-offset-4">
        Back to guides
      </Link>
    </div>
  );
}
