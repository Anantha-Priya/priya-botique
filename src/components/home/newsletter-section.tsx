import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  return (
    <section
      aria-labelledby="newsletter-title"
      className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl bg-brand-beige/55 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-center lg:px-14 lg:py-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
            NOTES FROM PRIYA
          </p>
          <h2
            id="newsletter-title"
            className="mt-3 text-3xl font-medium sm:text-4xl"
          >
            A little note, when we’re ready.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Newsletter sign-up is a preview only and will open when an email
            service is connected. No email address is collected here.
          </p>
        </div>
        <div
          role="group"
          aria-labelledby="newsletter-title"
          className="flex w-full max-w-lg flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            disabled
            className="h-12 min-w-0 flex-1 rounded-lg border border-border bg-background px-4 text-sm text-muted-foreground placeholder:text-muted-foreground/75 disabled:cursor-not-allowed disabled:opacity-80"
          />
          <Button size="lg" disabled className="rounded-lg px-5">
            Coming soon
          </Button>
        </div>
      </div>
    </section>
  );
}
