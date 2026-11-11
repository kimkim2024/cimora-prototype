import { SiteHeader } from './components/SiteHeader';
import { ProductionLine } from './sections/ProductionLine/ProductionLine';

/**
 * The new UI starts here. For now the app hosts the one section being rebuilt
 * out of the prototype; the rest of the product page and its routes follow.
 */
export default function App() {
  return (
    <div className="min-h-dvh bg-canvas font-sans text-ink">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-[1200px] px-10 pb-4 pt-20">
          <h1 className="max-w-[16ch] text-[48px] font-medium leading-[1.1] tracking-[-0.035em] text-ink">
            Stop scattering your story across different tools.
          </h1>
          <a
            href="#/app"
            className="mt-10 inline-flex h-11 items-center rounded-xl bg-ink px-5 text-[14px] font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
          >
            Open demo workspace
          </a>
        </section>

        <ProductionLine />
      </main>
    </div>
  );
}
