/** Small numbered label above a section, as on the prototype home. */
export function label(kicker: string, title: string, desc = '') {
  return (
    <div className="max-w-[46ch]">
      {kicker && <span className="block type-label uppercase tracking-[0.18em] text-ink-quiet">{kicker}</span>}
      <h2 className="mt-3 text-[30px] wide:text-[32px] mega:text-[36px] font-medium leading-[1.25] tracking-[-0.025em] text-ink">{title}</h2>
      {desc && <p className="mt-3 type-copy leading-[1.7] text-ink-muted">{desc}</p>}
    </div>
  );
}
