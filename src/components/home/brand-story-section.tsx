export function BrandStorySection() {
  return (
    <section
      aria-labelledby="brand-story-title"
      className="border-y border-border bg-brand-beige/40 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.7fr_1.3fr] md:items-center lg:gap-16">
        <div className="flex min-h-52 items-center justify-center rounded-2xl bg-brand-burgundy p-8 text-center text-primary-foreground">
          <div>
            <p className="font-heading text-5xl tracking-[0.14em]">PRIYA</p>
            <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-brand-champagne">
              A story in the making
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
            A NOTE FROM PRIYA
          </p>
          <h2
            id="brand-story-title"
            className="mt-3 max-w-2xl text-3xl leading-tight font-medium sm:text-4xl"
          >
            Style should leave room for you.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            PRIYA is being created as a place to explore clothing, jewellery,
            and accessories in one considered edit. This first look is a
            design preview; the boutique story and collection details will be
            added as they are ready.
          </p>
        </div>
      </div>
    </section>
  );
}
