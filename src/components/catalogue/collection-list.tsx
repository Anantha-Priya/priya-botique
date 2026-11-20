import Link from "next/link";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { getActiveCollections } from "@/lib/catalogue";
import { Breadcrumbs } from "./breadcrumbs";

export async function CollectionList() {
  const collections = await getActiveCollections();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections" },
        ]}
      />
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
          THE PRIYA EDIT
        </p>
        <h1 className="mt-3 font-heading text-4xl font-medium sm:text-5xl">
          Collections
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Thoughtfully curated edits from the PRIYA Boutique catalogue.
        </p>
      </header>

      {collections.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={`/collections/${collection.slug}`}
                className="group flex h-full min-h-48 flex-col justify-between rounded-xl border border-border bg-white p-6 transition-colors hover:border-brand-champagne focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Layers3
                  aria-hidden="true"
                  className="size-7 text-brand-burgundy"
                />
                <span className="mt-8 flex items-end justify-between gap-4">
                  <span>
                    <span className="block font-heading text-2xl font-medium">
                      {collection.name}
                    </span>
                    {collection.description ? (
                      <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                        {collection.description}
                      </span>
                    ) : null}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-brand-burgundy transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-brand-champagne bg-white/70 px-6 py-14 text-center">
          <h2 className="font-heading text-2xl font-medium">
            Collections are being curated
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Published collections will appear here when they are ready.
          </p>
        </div>
      )}
    </main>
  );
}
