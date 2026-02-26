import { NextRequest, NextResponse } from "next/server";

// Simple proxy/middleware for route protection
// NextAuth v5 beta + Next.js 16 compatibility
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow API routes, static files, public assets
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (NextAuth v5 uses "authjs.session-token")
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;
  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";

  // Already logged in → redirect away from login
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in → redirect to login (except root and login page)
  if (!isLoggedIn && !isLoginPage && !isRootPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
