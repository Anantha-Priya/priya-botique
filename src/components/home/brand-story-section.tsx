import { Sparkles } from "lucide-react";



export function BrandStorySection() {
  return (
    <section
      aria-labelledby="brand-story-title"
      className="border-y border-border bg-brand-beige/40 px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1fr] md:gap-12 lg:gap-20">

        {/* Left Content */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
            A NOTE FROM PRIYA
          </p>

          <h2
            id="brand-story-title"
            className="mt-3 max-w-xl text-3xl leading-tight font-medium sm:text-4xl lg:text-5xl"
          >
            Where elegance meets your individuality.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Every style tells a story, and yours deserves to be beautiful.
            Discover thoughtfully chosen clothing, jewellery, and
            accessories that celebrate your uniqueness, inspire confidence,
            and make every moment feel special.
          </p>
        </div>



{/* Right Branding Block */}
<div className="relative flex min-h-52 items-center justify-center overflow-hidden rounded-2xl bg-brand-burgundy px-4 py-10 text-center text-primary-foreground sm:min-h-64 sm:px-6 md:min-h-72 lg:min-h-80">

  {/* Decorative Circles */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -top-20 -right-14 size-64 rounded-full border border-white/15 sm:size-96"
  />

  <div
    aria-hidden="true"
    className="pointer-events-none absolute -top-8 -right-2 size-48 rounded-full border border-white/10 sm:size-72"
  />

  {/* Brand Content */}
  <div className="relative z-10 flex w-full flex-col items-center justify-center">

    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <p className="whitespace-nowrap font-heading text-2xl tracking-[0.07em] sm:text-4xl md:text-4xl lg:text-5xl">
        PRIYA&apos;S BOUTIQUE
      </p>

      <Sparkles
        aria-hidden="true"
        className="size-5 shrink-0 text-brand-champagne sm:size-6"
      />
    </div>

    <p className="mt-4 max-w-full text-[0.55rem] font-medium uppercase leading-relaxed tracking-[0.12em] text-brand-champagne sm:text-[0.65rem] sm:tracking-[0.2em]">
      An Expression of Grace, A Reflection of You.
    </p>

  </div>
</div>



      </div>
    </section>
  );
}


