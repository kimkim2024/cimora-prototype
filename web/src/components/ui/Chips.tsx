/** Single-select filter row used by the catalog pages. */
export function Chips<T extends string>({
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
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            className={
              'h-9 rounded-full border px-4 type-copy transition-colors ' +
              (active
                ? 'border-ink bg-ink text-ink-inverse'
                : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink')
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
