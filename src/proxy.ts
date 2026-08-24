import { NextRequest, NextResponse } from "next/server";

/**
 * Repair a malformed historical URL that was indexed literally as [slug].
 * Keep this narrow so normal product requests do not pay for extra work.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/shop/[slug]" || pathname === "/shop/%5Bslug%5D") {
    return NextResponse.redirect(new URL("/shop", request.url), 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/shop/:path*"],
};
