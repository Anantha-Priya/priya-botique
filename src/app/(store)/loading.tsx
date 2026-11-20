export default function CatalogueLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
    >
      <p role="status" className="mb-6 text-sm text-muted-foreground">
        Loading catalogue…
      </p>
      <div className="mb-8 h-40 animate-pulse rounded-xl bg-brand-beige" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="aspect-[4/5] animate-pulse rounded-xl bg-brand-beige"
          />
        ))}
      </div>
    </main>
  );
}
