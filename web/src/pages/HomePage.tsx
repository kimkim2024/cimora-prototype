import { Link } from 'react-router-dom';
import { artUrl } from '../data/art';
import { CASES, TEMPLATES } from '../data/site';
import { ArticleCard, CaseCard, TemplateCard } from '../components/ui/Cards';
import { Section } from '../components/ui/PageHero';
import { ClosingCta } from '../sections/ClosingCta';

const CAPABILITIES = [
  { title: 'Comic creation', line: 'Let your story unfold, panel by panel.', art: 1 },
  { title: 'Video creation', line: 'Give your visuals a little life.', art: 6 },
  { title: 'OC character sheet', line: 'Make every appearance feel familiar.', art: 2 },
  { title: 'Infinite canvas', line: 'Ideas roam free, connections stay clear.', art: 7 },
  { title: 'Mini tools', line: 'Start with a small idea.', art: 4 },
];

const STEPS = [
  'First, tell the story well.',
  'Let words grow into storyboards.',
  'Keep your character unmistakably themselves.',
  'One story, another way to tell it.',
];

const STEP_COPY = [
  'One line is enough to begin. Expand the plot, polish the dialogue, and split it into chapters ready to produce.',
  'Storyboards follow the script, so every shot has a reason to exist before a single frame is drawn.',
  'Characters, outfits and scenes share versions, so the face in chapter three still matches chapter one.',
  'The same project delivers a comic, a motion chapter or a trailer, without rebuilding the world.',
];

/** `/` — the site home. */
export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1200px] px-10 pt-16">
        <div className="text-center">
          <h1 className="mx-auto max-w-[20ch] text-[52px] font-medium leading-[1.08] tracking-[-0.035em] text-ink">
            Turn the worlds you love, into your own work.
          </h1>
          <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-ink-muted">
            From a single spark, to a comic chapter, to a story that moves.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link
              to="/product"
              className="inline-flex h-12 items-center rounded-xl bg-ink px-6 text-[14px] font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
            >
              See how it works
            </Link>
            <Link
              to="/app"
              className="inline-flex h-12 items-center rounded-xl border border-hairline-strong px-6 text-[14px] font-medium text-ink transition-colors hover:border-ink hover:bg-paper-muted"
            >
              Open the studio
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-4">
          {CASES.map((item) => (
            <Link key={item.id} to={`/showcase/${item.id}`} className="group relative overflow-hidden rounded-2xl">
              <img
                src={artUrl(item.art)}
                alt=""
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-5 pb-4 pt-10">
                <p className="text-[15px] font-medium text-ink-inverse">{item.title}</p>
                <p className="mt-1 text-[11px] text-ink-inverse/75">{item.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Section title="Every step of creating, firmly in your hands.">
        <div className="grid grid-cols-5 gap-4">
          {CAPABILITIES.map((item) => (
            <figure key={item.title} className="group">
              <div className="overflow-hidden rounded-xl border border-hairline bg-paper-sunken">
                <img
                  src={artUrl(item.art)}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="mt-3">
                <h3 className="text-[13px] font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-[11px] leading-[1.6] text-ink-muted">{item.line}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="From creating, to keeping on creating.">
        <div className="grid grid-cols-4 gap-8 border-t border-hairline pt-6">
          {STEPS.map((step, i) => (
            <div key={step}>
              <span className="text-[11px] tabular-nums text-ink-quiet">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-[15px] font-medium leading-[1.4] text-ink">{step}</h3>
              <p className="mt-2 text-[12px] leading-[1.7] text-ink-muted">{STEP_COPY[i]}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Every story has its own light."
        action={
          <Link to="/showcase" className="text-[13px] text-ink underline underline-offset-4">
            Explore showcase
          </Link>
        }
      >
        <div className="grid grid-cols-3 gap-4">
          {CASES.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section
        title="Let a good method be your next starting point."
        action={
          <Link to="/templates" className="text-[13px] text-ink underline underline-offset-4">
            Open templates
          </Link>
        }
      >
        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.slice(0, 3).map((item) => (
            <TemplateCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section title="Field notes for creators" className="pb-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'first-chapter', title: 'From one story to your first comic chapter', category: 'Getting started', time: '6 min', art: 0, steps: [] },
            { id: 'consistent-characters', title: 'Keeping your character looking like themselves', category: 'Characters & assets', time: '5 min', art: 1, steps: [] },
            { id: 'stable-motion', title: 'Limited animation can still tell a great story', category: 'Video production', time: '8 min', art: 6, steps: [] },
          ].map((item) => (
            <ArticleCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <ClosingCta />
    </>
  );
}
