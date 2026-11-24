import { Suspense } from "react";
import { notFound } from "next/navigation";
import { shippingPolicy, returnsPolicy } from "@/lib/policy-content";

interface PlaceholderPage {
  title: string;
  description: string;
  sections?: readonly {
    heading: string;
    paragraphs: readonly string[];
  }[];
}

const placeholderPages: Record<string, PlaceholderPage> = {
    about: {
      title: "About PRIYA",
      description: "The boutique story will be added when its details are provided.",
    },
    contact: {
      title: "Contact",
      description:
        "Customer support submissions are not available yet. This page is a placeholder, not a working support channel.",
    },
    search: {
      title: "Search",
      description: "Product search will be available after the catalogue is added.",
    },
    login: {
      title: "My account",
      description: "Customer accounts will be available in a later phase.",
    },
    wishlist: {
      title: "Wishlist",
      description: "Wishlist features will be available in a later phase.",
    },
    cart: {
      title: "Shopping bag",
      description: "Shopping bag features will be available in a later phase.",
    },
    "policies/shipping": shippingPolicy,
    "policies/returns": returnsPolicy,
    "policies/privacy": {
      title: "Privacy policy",
      description: "The privacy policy will be published after it is finalized.",
    },
    "policies/terms": {
      title: "Terms of service",
      description: "Terms will be published after they are finalized.",
    },
  };

export function generateStaticParams() {
  return Object.keys(placeholderPages).map((path) => ({
    segments: path.split("/"),
  }));
}

interface PlaceholderRouteProps {
  params: Promise<{ segments: string[] }>;
}

export default function PlaceholderRoute({ params }: PlaceholderRouteProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-16 sm:px-6 lg:px-8">
          <p role="status" className="text-muted-foreground">
            Loading page...
          </p>
        </main>
      }
    >
      <PlaceholderContent params={params} />
    </Suspense>
  );
}

async function PlaceholderContent({ params }: PlaceholderRouteProps) {
  const { segments } = await params;
  const page = placeholderPages[segments.join("/")];

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-burgundy">
        PRIYA Boutique
      </p>
      <h1 className="mt-4 text-4xl font-semibold">{page.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
        {page.description}
      </p>
      {page.sections ? (
        <div className="mt-10 max-w-3xl space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-2xl font-medium">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          This is a temporary page while the storefront is being built.
        </p>
      )}
    </main>
  );
}
