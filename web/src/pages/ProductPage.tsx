import { legacyUrl } from '../lib/legacy';
import { ClosingCta } from '../sections/ClosingCta';
import { ModeComparison } from '../sections/ModeComparison';
import { ProductionLine } from '../sections/ProductionLine/ProductionLine';
import { ProductWorld } from '../sections/ProductWorld';

/** #/product — the whole page, now in React. */
export default function ProductPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1200px] px-10 pb-4 pt-20 text-center">
        <h1 className="mx-auto max-w-[18ch] text-[48px] font-medium leading-[1.1] tracking-[-0.035em] text-ink">
          Stop scattering your story across different tools.
        </h1>
        <a
          href={legacyUrl('/app')}
          className="mt-10 inline-flex h-11 items-center rounded-xl bg-ink px-6 text-[14px] font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
        >
          Open demo workspace
        </a>
      </section>

      <ProductWorld />
      <ProductionLine />
      <ModeComparison />
      <ClosingCta />
    </>
  );
}
