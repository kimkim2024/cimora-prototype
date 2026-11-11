import { HeroMarquee } from '../components/ui/HeroMarquee';
import { PRODUCT_WORLD } from '../data/product';
import { ClosingCta } from '../sections/ClosingCta';
import { ModeComparison } from '../sections/ModeComparison';
import { ProductionLine } from '../sections/ProductionLine/ProductionLine';

/** /product — the whole page, now in React. */
export default function ProductPage() {
  return (
    <>
      <HeroMarquee
        tagline="Local demo · no signup"
        title="Stop scattering your story"
        titleTail="across different tools."
        description="The comic is the source of truth for visuals and story; the video reuses the same characters, scenes and voice."
        ctaText="Open demo workspace"
        ctaTo="/app"
        shots={PRODUCT_WORLD.map((tile) => ({ src: tile.src, alt: tile.alt, label: tile.label }))}
      />
      <ProductionLine />
      <ModeComparison />
      <ClosingCta />
    </>
  );
}
