import Link from "next/link";
import { categoryNavigation, policyNavigation } from "@/data/navigation";
import { brand } from "@/lib/brand";

export function StoreFooter() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="rounded-sm font-heading text-2xl text-foreground">
            {brand.name}
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Clothing, jewellery, and accessories from PRIYA Boutique.
          </p>
        </div>

        <nav aria-label="Shop categories">
          <h2 className="font-semibold text-foreground">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {categoryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer support">
          <h2 className="font-semibold text-foreground">Customer care</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                href="/contact"
                className="rounded-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Contact us
              </Link>
            </li>
            {policyNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Policy details will be published after they are finalized.
          </p>
        </nav>

        <div>
          <h2 className="font-semibold text-foreground">Stay connected</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Official social links will be added when they are provided.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {brand.name} Boutique
        </p>
      </div>
    </footer>
  );
}
