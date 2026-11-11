import { HeroSpotlight } from '../sections/HeroSpotlight';
import { ClosingCta } from '../sections/ClosingCta';
import { ModeComparison } from '../sections/ModeComparison';
import { ProductionLine } from '../sections/ProductionLine/ProductionLine';

/** /product — the whole page, now in React. */
export default function ProductPage() {
  return (
    <>
      <HeroSpotlight
        title="Stop scattering your story"
        titleTail="across different tools."
        description="The comic is the source of truth for visuals and story; the video reuses the same characters, scenes and voice."
        ctaText="Open demo workspace"
        ctaTo="/app"
      />
      {/* the hero sticks under these, so they need their own paper ground */}
      <div className="relative z-10 bg-paper">
        <ProductionLine />
        <ModeComparison />
        <ClosingCta />
      </div>
    </>
  );
}
