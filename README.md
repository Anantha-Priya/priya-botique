# PRIYA Boutique

The PRIYA boutique storefront is built with Next.js App Router, React, TypeScript, and Tailwind CSS. Its planned integrations include Supabase, Cloudinary, and Razorpay; those services are not configured in this foundation phase.

## Requirements

- Node.js 22.6 or newer
- npm

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` when configuring integrations. Keep real credentials in `.env.local`; it is ignored by Git. Never expose server-only secrets through `NEXT_PUBLIC_` variables.

## UI foundation

shadcn/ui is initialized. Add components with the shadcn CLI when they are needed by a later implementation phase.
