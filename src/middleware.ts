import { NextRequest, NextResponse } from "next/server";

// Next.js Middleware - runs on every request before rendering
// Must be in src/middleware.ts (or root middleware.ts) to be picked up by Next.js
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow API routes, static files, public assets
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/uploads/")
  ) {
    return NextResponse.next();
  }

  // ===== MAINTENANCE MODE CHECK =====
  const isMaintenancePage = pathname === "/maintenance";
  const isAdminPath =
    pathname.startsWith("/settings") || pathname.startsWith("/login");

  let isMaintenanceOn = false;
  try {
    const apiUrl = new URL("/api/settings/maintenance-status", req.url);
    const res = await fetch(apiUrl.toString(), { cache: "no-store" });
    const data = await res.json();
    isMaintenanceOn = data.maintenance === true;

    if (isMaintenanceOn) {
      // Maintenance is ON → redirect to /maintenance (except admin paths and the page itself)
      if (!isMaintenancePage && !isAdminPath) {
        return NextResponse.redirect(new URL("/maintenance", req.url));
      }
    } else {
      // Maintenance is OFF → redirect away from /maintenance page
      if (isMaintenancePage) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  } catch {
    // If check fails, allow request through (fail open)
    if (isMaintenancePage) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // If on maintenance page and allowed, skip auth check
  if (isMaintenancePage) {
    return NextResponse.next();
  }

  // ===== AUTH CHECK =====
  // Check for session cookie (NextAuth v5 uses "authjs.session-token")
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;
  const isLoginPage = pathname === "/login";

  // Public routes that don't require login (landing/public-facing pages)
  // All sub-paths are also allowed (e.g. /gallery/123, /news/456)
  const PUBLIC_PATHS = [
    "/",
    "/login",
    "/gallery",
    "/news",
    "/about",
    "/departments",
    "/maintenance",
    "/contact",
    "/documents",
    "/administration",
  ];

  // Check if the current path is public
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Already logged in → redirect away from login page
  if (isLoggedIn && isLoginPage) {
    if (isMaintenanceOn) {
      return NextResponse.redirect(new URL("/settings", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in → redirect to login only for private (dashboard) routes
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)" ],
};
