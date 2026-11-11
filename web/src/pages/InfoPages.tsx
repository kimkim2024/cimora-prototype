import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES, FAQS, HELP_CATEGORIES, LEGAL_NOTICE, LEGAL_SECTIONS, LEGAL_TITLES, TOOL_GROUPS, TOOLS } from '../data/site';
import { Chips } from '../components/ui/Chips';
import { Faq } from '../components/ui/Faq';
import { PageHero, Section } from '../components/ui/PageHero';
import { ToolCard } from '../components/ui/Cards';
import { useParams } from 'react-router-dom';
import NotFound from './NotFound';
import { useTitle } from '../lib/useTitle';

/** /help — categories, then the questions. */
export function HelpPage() {
  return (
    <>
      <PageHero title={<>Stuck while creating? Keep moving from here.</>} centered className="pb-10" />
      <section className="container-page">
        <div className="grid grid-cols-4 gap-4">
          {HELP_CATEGORIES.map((category, i) => {
            const article = ARTICLES.find((entry) => entry.id === category.articleId);
            return (
              <Link
                key={category.title}
                to={`/resources/${category.articleId}`}
                className="group rounded-2xl border border-hairline bg-paper p-6 transition-colors hover:border-hairline-strong"
              >
                <span className="type-meta tabular-nums text-ink-quiet">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 type-lead font-medium leading-[1.4] text-ink">{category.title}</h3>
                <p className="mt-2 type-list text-ink-muted">{article ? `${article.time} read` : 'Step guide'}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <Section title="Common questions" className="pb-24">
        <Faq items={FAQS} />
      </Section>
    </>
  );
}

/** /legal/:doc — the same disclosure, four ways in. */
export function LegalPage() {
  const { doc } = useParams();
  const title = doc ? LEGAL_TITLES[doc] : undefined;
  useTitle(title ? `${title} · Cimora` : 'Usage policy · Cimora');
  if (!title) return <NotFound />;

  return (
    <article className="container-prose pb-24 pt-20">
      <h1 className="text-[44px] font-medium leading-[1.12] tracking-[-0.035em] text-ink">{title}</h1>

      <p className="mt-8 rounded-2xl border border-hairline bg-paper-muted p-6 type-copy leading-[1.7] text-ink-muted">
        {LEGAL_NOTICE}
      </p>

      <div className="mt-10 divide-y divide-hairline border-t border-hairline">
        {LEGAL_SECTIONS.map(([heading, body]) => (
          <section key={heading} className="py-8">
            <h2 className="text-[22px] font-medium leading-[1.35] tracking-[-0.02em] text-ink">{heading}</h2>
            <p className="mt-3 type-copy leading-[1.8] text-ink-muted">{body}</p>
          </section>
        ))}
      </div>

      <nav aria-label="Other policies" className="mt-6 flex flex-wrap gap-2">
        {Object.entries(LEGAL_TITLES).map(([key, label]) => (
          <Link
            key={key}
            to={`/legal/${key}`}
            className={
              'inline-flex h-9 items-center rounded-full border px-4 type-list transition-colors ' +
              (key === doc
                ? 'border-ink bg-ink text-ink-inverse'
                : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink')
            }
          >
            {label}
          </Link>
        ))}
      </nav>
    </article>
  );
}

/** /tools — the hub of 14 small tools. */
export function ToolsPage() {
  const [group, setGroup] = useState<(typeof TOOL_GROUPS)[number]>('All');
  const items = TOOLS.filter((tool) => group === 'All' || tool.group === group);

  return (
    <>
      <PageHero title={<>Every step of creating, has a handy tool.</>} centered className="pb-10">
        <p className="mt-3 type-list text-ink-quiet">14 standalone tools · local demo · no real API calls</p>
      </PageHero>

      <section className="container-page pb-24">
        <div className="flex items-center justify-between gap-6">
          <Chips options={TOOL_GROUPS} value={group} onChange={setGroup} label="Tool group" />
          <span className="type-list text-ink-quiet">{items.length} tools</span>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-4">
          {items.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </>
  );
}
