import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  centered?: boolean;
  lead?: string;
  children?: ReactNode;
  className?: string;
};

/** Page top: one title, nothing above it, optional actions underneath. */
export function PageHero({ title, centered, lead, children, className = '' }: Props) {
  return (
    <section
      className={
        'container-page pt-20 ' + (centered ? 'text-center ' : '') + className
      }
    >
      <h1
        className={
          'text-[44px] wide:text-[48px] mega:text-[52px] font-medium leading-[1.1] tracking-[-0.035em] text-ink ' +
          (centered ? 'mx-auto max-w-[20ch]' : 'max-w-[22ch]')
        }
      >
        {title}
      </h1>
      {lead && <p className={'mt-5 type-body leading-[1.7] text-ink-muted ' + (centered ? 'mx-auto max-w-[56ch]' : 'max-w-[56ch]')}>{lead}</p>}
      {children}
    </section>
  );
}

/** A titled band inside a page. */
export function Section({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={'container-page pt-16 ' + className}>
      {(title || action) && (
        <div className="mb-6 flex items-end justify-between gap-6">
          {title && <h2 className="text-[30px] wide:text-[32px] mega:text-[36px] font-medium leading-[1.25] tracking-[-0.025em] text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
