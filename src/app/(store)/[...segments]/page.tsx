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
      description:
        "PRIYA'S BOUTIQUE was born from a love for timeless elegance, beautiful details, and personal style. We believe every woman deserves to feel confident, graceful, and beautiful in her own way. From clothing to jewellery and accessories, we bring together thoughtful styles that make everyday moments and special occasions more memorable. Because true elegance isn't just what you wear; it's how you feel.",
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

  if (segments.join("/") === "about") {
    return (
      <main className="relative min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/south-indian-bridal-editorial.jpg')" }}
        />
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-burgundy">
            GET TO KNOW US
          </p>
          <h1 className="mt-4 font-heading text-4xl font-medium sm:text-5xl">
            The Story Behind PRIYA
          </h1>
          <div className="mt-6 space-y-4 text-base leading-7 text-foreground/90">
            <p>PRIYA&apos;S BOUTIQUE was born from a love for timeless elegance, beautiful details, and personal style.</p>
            <p>We believe every woman deserves to feel confident, graceful, and beautiful in her own way.</p>
            <p>From clothing to jewellery and accessories, we bring together thoughtful styles that make everyday moments and special occasions more memorable.</p>
            <p>Because true elegance isn&apos;t just what you wear; it&apos;s how you feel.</p>
          </div>
        </div>
      </main>
    );
  }

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
