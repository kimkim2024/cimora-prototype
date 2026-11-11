import { Link } from 'react-router-dom';
import { ARTICLES, CASES, TEMPLATES } from '../data/site';
import { ArticleCard, CaseCard, TemplateCard } from '../components/ui/Cards';
import { Section } from '../components/ui/PageHero';
import { ClosingCta } from '../sections/ClosingCta';
import { Capabilities } from '../sections/home/Capabilities';
import { Composer } from '../sections/home/Composer';
import { HeroCarousel } from '../sections/home/HeroCarousel';

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
      <HeroCarousel />
      <Composer />
      <Capabilities />

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
          {ARTICLES.slice(0, 3).map((item) => (
            <ArticleCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <ClosingCta />
    </>
  );
}
