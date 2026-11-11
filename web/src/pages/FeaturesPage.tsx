import { useParams } from 'react-router-dom';
import { artUrl } from '../data/art';
import { FEATURES, TOOLS } from '../data/site';
import { Faq } from '../components/ui/Faq';
import { Section } from '../components/ui/PageHero';
import { ToolCard } from '../components/ui/Cards';
import { legacyUrl } from '../lib/legacy';
import NotFound from './NotFound';
import { useTitle } from '../lib/useTitle';

/** /features/:id — one of the three production stories. */
export default function FeaturesPage() {
  const { id } = useParams();
  const feature = FEATURES.find((item) => item.id === id);
  if (!feature) return <NotFound />;

  const tools = TOOLS.filter((tool) => feature.tools.includes(tool.id));
  useTitle(`${feature.tag} · Cimora`);

  return (
    <>
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-[1.05fr_1fr] items-center gap-14 px-10 pt-20">
        <div>
          <h1 className="max-w-[18ch] text-[44px] font-medium leading-[1.1] tracking-[-0.035em] text-ink">
            {feature.title}
          </h1>
          <div className="mt-8 flex items-center gap-3">
            <a
              href={legacyUrl(`/app/new?source=${feature.source}`)}
              className="inline-flex h-11 items-center rounded-xl bg-ink px-5 text-[14px] font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
            >
              Start here
            </a>
            <a
              href={legacyUrl('/app')}
              className="inline-flex h-11 items-center rounded-xl border border-hairline-strong px-5 text-[14px] font-medium text-ink transition-colors hover:border-ink hover:bg-paper-muted"
            >
              Open the studio
            </a>
          </div>
        </div>
        <figure className="relative overflow-hidden rounded-2xl border border-hairline bg-paper-sunken">
          <img src={artUrl(feature.art)} alt="" className="aspect-[5/4] w-full object-cover" />
        </figure>
      </section>

      <Section title="From idea to deliverable work.">
        <div className="grid grid-cols-4 gap-8 border-t border-hairline pt-6">
          {feature.steps.map((step, i) => (
            <div key={step}>
              <span className="text-[11px] tabular-nums text-ink-quiet">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-[15px] font-medium leading-[1.4] text-ink">{step}</h3>
              <p className="mt-2 text-[12px] leading-[1.7] text-ink-muted">{feature.points[i % feature.points.length]}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-2 items-center gap-14 border-t border-hairline px-10 pt-16">
        <figure className="overflow-hidden rounded-2xl border border-hairline bg-paper-sunken">
          <img src={artUrl(feature.art + 3)} alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
        </figure>
        <div>
          <h2 className="text-[30px] font-medium leading-[1.25] tracking-[-0.025em] text-ink">
            Creation is not a gacha pull. Every step can be refined further.
          </h2>
          <ul className="mt-6 space-y-4">
            {feature.points.map((point) => (
              <li key={point} className="flex gap-3 text-[13px] leading-[1.7] text-ink-muted">
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section title="Tools that connect" action={<span className="text-[12px] text-ink-quiet">{tools.length} related tools</span>}>
        <div className="grid grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </Section>

      <Section title="A few things to know" className="pb-24">
        <Faq />
      </Section>
    </>
  );
}
