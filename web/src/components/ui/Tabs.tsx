/** Underline tabs, used by the showroom feeds and the creator centre. */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-7 border-b border-hairline">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={
              '-mb-px whitespace-nowrap border-b-2 pb-3 type-copy transition-colors ' +
              (active ? 'border-ink text-ink' : 'border-transparent text-ink-quiet hover:text-ink')
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
