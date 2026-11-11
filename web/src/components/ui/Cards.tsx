import { Link } from 'react-router-dom';
import { artUrl } from '../../data/art';
import type { Article, CaseStudy, Template, Tool } from '../../data/site';
import { legacyUrl } from '../../lib/legacy';

const CARD = 'group block overflow-hidden rounded-2xl border border-hairline bg-paper transition-colors hover:border-hairline-strong';
const IMAGE = 'aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]';
const BODY = 'p-5';
const META = 'type-meta tracking-[0.02em] text-ink-quiet';
const TITLE = 'mt-2 type-sub font-medium leading-[1.35] tracking-[-0.01em] text-ink';
const BODY_COPY = 'mt-2 type-copy leading-[1.65] text-ink-muted';

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a href={legacyUrl(`/tools/${tool.id}`)} className={CARD}>
      <img src={artUrl(tool.art)} alt="" loading="lazy" className={IMAGE} />
      <div className={BODY}>
        <div className="flex items-center justify-between gap-3">
          <span className={META}>{tool.group}</span>
          <span className="rounded-full border border-hairline px-2 py-0.5 type-label text-ink-quiet">{tool.stage}</span>
        </div>
        <h3 className={TITLE}>{tool.title}</h3>
        <p className={BODY_COPY}>{tool.desc}</p>
        <span className="mt-4 inline-block type-list text-ink underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
          Open tool
        </span>
      </div>
    </a>
  );
}

export function CaseCard({ item, delay = 0 }: { item: CaseStudy; delay?: number }) {
  return (
    <Link to={`/showcase/${item.id}`} className={CARD} style={{ transitionDelay: `${delay}ms` }}>
      <img src={artUrl(item.art)} alt="" loading="lazy" className={IMAGE} />
      <div className={BODY}>
        <span className={META}>
          {item.tag} / original story
        </span>
        <h3 className={TITLE}>{item.title}</h3>
        <p className={BODY_COPY}>{item.subtitle}</p>
      </div>
    </Link>
  );
}

export function TemplateCard({ item }: { item: Template }) {
  return (
    <Link to={`/templates/${item.id}`} className={CARD}>
      <img src={artUrl(item.art)} alt="" loading="lazy" className={IMAGE} />
      <div className={BODY}>
        <span className={META}>{item.type}</span>
        <h3 className={TITLE}>{item.title}</h3>
        <p className={BODY_COPY}>{item.desc}</p>
      </div>
    </Link>
  );
}

export function ArticleCard({ item }: { item: Article }) {
  return (
    <Link to={`/resources/${item.id}`} className={CARD}>
      <img src={artUrl(item.art)} alt="" loading="lazy" className={IMAGE} />
      <div className={BODY}>
        <span className={META}>
          {item.category} · {item.time} read
        </span>
        <h3 className={TITLE}>{item.title}</h3>
      </div>
    </Link>
  );
}
