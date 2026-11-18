import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-burgundy">
        PRIYA Boutique
      </p>
      <h1 className="mt-4 max-w-2xl text-4xl font-semibold sm:text-5xl">
        Welcome to PRIYA
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
        The storefront is being prepared. Product collections and customer
        services will appear as the next stages are completed.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-flex min-h-11 w-fit items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Browse the shop preview
      </Link>
    </main>
  );
}
