import { FAQS } from '../../data/site';

/** Disclosure list; the first answer stays closed so the page reads as a list. */
export function Faq({ items = FAQS }: { items?: [string, string][] }) {
  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {items.map(([question, answer]) => (
        <details key={question} className="group px-1 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[14px] text-ink marker:hidden">
            {question}
            <span className="text-[16px] text-ink-quiet transition-transform duration-200 group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-[70ch] text-[13px] leading-[1.7] text-ink-muted">{answer}</p>
        </details>
      ))}
    </div>
  );
}
