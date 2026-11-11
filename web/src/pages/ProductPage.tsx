import { HeroMockup } from '../components/ui/HeroMockup';
import { ClosingCta } from '../sections/ClosingCta';
import { ModeComparison } from '../sections/ModeComparison';
import { ProductionLine } from '../sections/ProductionLine/ProductionLine';

/** /product — the whole page, now in React. */
export default function ProductPage() {
  return (
    <>
      <HeroMockup
        title="Stop scattering your story"
        titleTail="across different tools."
        description="The comic is the source of truth for visuals and story; the video reuses the same characters, scenes and voice."
        ctaText="Open demo workspace"
        ctaTo="/app"
      />
      <ProductionLine />
      <ModeComparison />
      <ClosingCta />
    </>
  );
}
