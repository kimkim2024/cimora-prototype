import { ClosingCta } from '../sections/ClosingCta';
import { ModeComparison } from '../sections/ModeComparison';
import { ProductionLine } from '../sections/ProductionLine/ProductionLine';
import { ProductHero } from '../sections/ProductHero';
import { ProductWorld } from '../sections/ProductWorld';

/** /product — the whole page, now in React. */
export default function ProductPage() {
  return (
    <>
      <ProductHero />
      <ProductWorld />
      <ProductionLine />
      <ModeComparison />
      <ClosingCta />
    </>
  );
}
