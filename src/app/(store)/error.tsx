"use client";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
        PRIYA BOUTIQUE
      </p>
      <h1 className="mt-4 font-heading text-3xl font-medium">
        We couldn’t load the catalogue
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Please try again. If the problem continues, the catalogue service may
        be temporarily unavailable.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 rounded-md bg-brand-burgundy px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Try again
      </button>
    </main>
  );
}
