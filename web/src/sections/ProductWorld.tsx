import { PRODUCT_WORLD } from '../data/product';

/** Four stills, side by side: the same story at each stage of production. */
export function ProductWorld() {
  return (
    <section className="container-page pt-14" aria-label="One story at four stages">
      <div className="grid grid-cols-4 gap-3 rounded-2xl border border-hairline bg-paper p-3">
        {PRODUCT_WORLD.map((tile) => (
          <figure key={tile.id} className="group relative overflow-hidden rounded-lg bg-paper-sunken">
            <img
              src={tile.src}
              alt={tile.alt}
              loading="lazy"
              className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-ink/72 px-3 py-2 text-[12px] text-ink-inverse backdrop-blur-[2px]">
              {tile.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
