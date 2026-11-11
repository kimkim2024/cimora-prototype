import { BreathingStage } from '../sections/home/BreathingStage';
import { Capabilities } from '../sections/home/Capabilities';
import { Composer } from '../sections/home/Composer';
import { Engineering } from '../sections/home/Engineering';
import { FinalCta } from '../sections/home/FinalCta';
import { HeroCarousel } from '../sections/home/HeroCarousel';
import { Process } from '../sections/home/Process';
import { Recipes, Works } from '../sections/home/Works';

/** `/` — the site home, rebuilt from the prototype page. */
export default function HomePage() {
  return (
    <>
      <BreathingStage>
        <HeroCarousel />
        <Composer />
        <Capabilities />
      </BreathingStage>

      <Process />
      <Engineering />
      <Works />
      <Recipes />
      <FinalCta />
    </>
  );
}
