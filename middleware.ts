import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!host.toLowerCase().startsWith("www.")) {
    return NextResponse.next();
  }

  const canonicalHost = host.slice(4);
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const { pathname, search } = request.nextUrl;
  return NextResponse.redirect(`${proto}://${canonicalHost}${pathname}${search}`, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
