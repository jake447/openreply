import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/automations", "/logs", "/settings"];

// Private instance: the project's public marketing pages are hidden and send
// visitors to sign-in (or the dashboard when signed in). Privacy, terms and
// data deletion stay public because the Meta app needs those URLs.
const HIDDEN_PAGES = [
  "/brand",
  "/comment-link-automation",
  "/contributors",
  "/instagram-comment-to-dm-templates",
  "/instagram-dm-automation-agencies",
  "/manychat-alternative",
  "/meta-review",
  "/sponsors",
  "/templates",
];

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token")
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isLogin = pathname === "/login";
  const isAuthenticated = hasSessionCookie(request);

  const isHidden =
    pathname === "/" ||
    HIDDEN_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));
  if (isHidden) {
    return NextResponse.redirect(new URL(isAuthenticated ? "/dashboard" : "/login", request.url));
  }

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/automations/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/login",
    "/",
    "/brand",
    "/comment-link-automation",
    "/contributors",
    "/instagram-comment-to-dm-templates",
    "/instagram-dm-automation-agencies",
    "/manychat-alternative",
    "/meta-review",
    "/sponsors",
    "/templates/:path*",
  ],
};
