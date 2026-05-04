import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect from "/" to "/chat"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // Let next-intl middleware handle locale management
  // With localePrefix: "never", it automatically reads NEXT_LOCALE cookie
  // and passes the locale to server components via headers
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_static|_external|favicon.ico|.*\\..*).*)"],
};
