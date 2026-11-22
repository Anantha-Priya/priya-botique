import "server-only";

import type { NextRequest } from "next/server";

export function isSameSiteRequest(request: NextRequest): boolean {
  const requestOrigin = request.headers.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!requestOrigin || !siteUrl) {
    return false;
  }

  try {
    return new URL(requestOrigin).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}
