import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { getActiveCategories, getCatalogueProducts } from "@/lib/catalogue";
import {
  buildCatalogueHref,
  parseCatalogueFilters,
  type CatalogueSearchParams,
} from "@/lib/catalogue-filters";
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";
import { ProductCard } from "./product-card";

interface CatalogueBrowserProps {
  pathname: string;
  title: string;
  description?: string | null;
  searchParams: CatalogueSearchParams;
  categorySlug?: string;
  collectionSlug?: string;
  pinnedOnly?: boolean;
  breadcrumbs: BreadcrumbItem[];
  showCategoryFilter?: boolean;
}

export async function CatalogueBrowser({
  pathname,
  title,
  searchParams,
  categorySlug,
  collectionSlug,
  pinnedOnly,
  breadcrumbs,
  showCategoryFilter = true,
}: CatalogueBrowserProps) {
  const filters = parseCatalogueFilters(searchParams);
  const categories = showCategoryFilter ? await getActiveCategories() : [];
  const { products, total, pageSize, redirectPage } = await getCatalogueProducts({
    filters,
    categorySlug,
    collectionSlug,
    pinnedOnly,
  });

  if (redirectPage !== undefined) {
    redirect(buildCatalogueHref(pathname, filters, redirectPage));
  }

  const totalPages = Math.ceil(total / pageSize);
  const lastPage = Math.max(1, totalPages);

  if (filters.page > lastPage) {
    redirect(buildCatalogueHref(pathname, filters, lastPage));
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />
       <header className="mb-8 max-w-3xl sm:mb-10">
         <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
           PRIYA BOUTIQUE
         </p>
         <h1 className="mt-3 font-heading text-4xl font-medium sm:text-5xl">
           {title}
         </h1>
         <details className="group mt-4">
           <summary className="cursor-pointer text-xs font-medium text-brand-burgundy underline underline-offset-4">
             Apply Filter
           </summary>
           <form
             action={pathname}
             method="get"
             className="mt-3 rounded-xl border border-border bg-white p-4 sm:p-5"
           >
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
           {showCategoryFilter ? (
             <label className="grid gap-1.5 text-sm">
               <span>Category</span>
               <select
                 name="category"
                 defaultValue={filters.category}
                 className="h-11 rounded-md border border-border bg-white px-3"
               >
                 <option value="">All categories</option>
                 {categories.map((category) => (
                   <option key={category.id} value={category.slug}>
                     {category.name}
                   </option>
                 ))}
               </select>
             </label>
           ) : null}
           <label className="grid gap-1.5 text-sm">
             <span>Price range (INR)</span>
             <select
               name="priceRange"
               defaultValue={filters.priceRange}
               className="h-11 rounded-md border border-border bg-white px-3"
             >
               <option value="">All prices</option>
               <option value="0-5000">Under ₹5,000</option>
               <option value="5000-10000">₹5,000 – ₹10,000</option>
               <option value="10000-15000">₹10,000 – ₹15,000</option>
               <option value="15000-25000">₹15,000 – ₹25,000</option>
               <option value="25000-">Above ₹25,000</option>
             </select>
           </label>
           <label className="grid gap-1.5 text-sm">
             <span>Colour</span>
             <input
               type="search"
               name="color"
               defaultValue={filters.color}
               maxLength={40}
               placeholder="e.g. Maroon"
               className="h-11 rounded-md border border-border bg-white px-3"
             />
           </label>
           <label className="grid gap-1.5 text-sm">
             <span>Sort by</span>
             <select
               name="sort"
               defaultValue={filters.sort}
               className="h-11 rounded-md border border-border bg-white px-3"
             >
               <option value="newest">Newest</option>
               <option value="price-asc">Price: low to high</option>
               <option value="price-desc">Price: high to low</option>
             </select>
           </label>
           <label className="flex min-h-11 items-center gap-3 self-end text-sm">
             <input
               type="checkbox"
               name="inStock"
               value="1"
               defaultChecked={filters.inStock}
               className="size-4 accent-brand-burgundy"
             />
             In-stock items only
           </label>
           <div className="flex items-end gap-4">
             <button
               type="submit"
               className="min-h-11 rounded-md bg-brand-burgundy px-5 text-sm font-semibold text-white hover:bg-brand-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
             >
               Apply filters
             </button>
             <Link
               href={pathname}
               className="min-h-11 content-center text-sm font-medium text-brand-burgundy underline underline-offset-4"
             >
               Clear
             </Link>
           </div>
         </div>
       </form>
      </details>
     </header>

      <div
        aria-live="polite"
        className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"
      >
        <p>
          {total} {total === 1 ? "item" : "items"}
        </p>
        {filters.inStock ? <p>Showing in-stock products</p> : null}
      </div>

       {products.length > 0 ? (
         <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
           {products.map((product) => (
             <ProductCard key={product.id} product={product} />
           ))}
         </div>
       ) : (
         <div className="rounded-xl border border-dashed border-brand-champagne bg-white/70 px-6 py-14 text-center">
           <h2 className="font-heading text-2xl font-medium">
             No products available
           </h2>
           <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
             No products match the selected filters.
           </p>
           <Link
             href={pathname}
             className="mt-4 inline-block text-xs font-medium text-brand-burgundy underline underline-offset-4"
           >
             Clear filters
           </Link>
         </div>
       )}

      {totalPages > 1 ? (
        <nav
          aria-label="Catalogue pages"
          className="mt-10 flex items-center justify-center gap-5"
        >
          {filters.page > 1 ? (
            <Link
              rel="prev"
              href={buildCatalogueHref(pathname, filters, filters.page - 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium hover:border-brand-burgundy"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          {filters.page < totalPages ? (
            <Link
              rel="next"
              href={buildCatalogueHref(pathname, filters, filters.page + 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium hover:border-brand-burgundy"
            >
              Next
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
