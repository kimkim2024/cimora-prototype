import { useState } from 'react';
import { CASES, TEMPLATES, ARTICLES } from '../data/site';
import { ArticleCard, CaseCard, TemplateCard } from '../components/ui/Cards';
import { Chips } from '../components/ui/Chips';
import { PageHero, Section } from '../components/ui/PageHero';
import { TEMPLATE_TYPES } from '../data/site';
import { Link } from 'react-router-dom';
import { ClosingCta } from '../sections/ClosingCta';

/** /showcase — original stories. */
export function ShowcasePage() {
  return (
    <>
      <PageHero title={<>In these stories, see your next possibility.</>} centered className="pb-12" />
      <section className="container-page">
        <div className="grid grid-cols-3 gap-5">
          {CASES.map((item, i) => (
            <CaseCard key={item.id} item={item} delay={i * 40} />
          ))}
        </div>
        <p className="mt-6 text-[12px] text-ink-quiet">
          Original demo works · sample art and workflows, no customer work included.
        </p>
      </section>
      <ClosingCta />
    </>
  );
}

/** /templates — starting points, filterable by type. */
export function TemplatesPage() {
  const [type, setType] = useState<(typeof TEMPLATE_TYPES)[number]>('All');
  const items = TEMPLATES.filter((item) => type === 'All' || item.type === type);

  return (
    <>
      <PageHero title="Give inspiration a starting point." centered className="pb-10" />
      <section className="container-page">
        <Chips options={TEMPLATE_TYPES} value={type} onChange={setType} label="Template type" />
        <div className="mt-8 grid grid-cols-3 ultra:grid-cols-4 gap-5">
          {items.map((item) => (
            <TemplateCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      <ClosingCta />
    </>
  );
}

/** /resources — the guide index. */
export function ResourcesPage() {
  return (
    <>
      <PageHero title="The methods behind making a story." centered className="pb-12" />
      <section className="container-page">
        <div className="grid grid-cols-3 gap-5">
          {ARTICLES.map((item) => (
            <ArticleCard key={item.id} item={item} />
          ))}
        </div>
        <Section className="!px-0 pt-12">
          <Link to="/resources/updates" className="text-[13px] text-ink underline underline-offset-4">
            View product updates
          </Link>
        </Section>
      </section>
      <ClosingCta />
    </>
  );
}
