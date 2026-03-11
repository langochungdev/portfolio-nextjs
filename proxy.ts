import { NextRequest, NextResponse } from "next/server";

const locales = ["vi", "en"];
const defaultLocale = "vi";

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang?.includes("en")) return "en";
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) return;

  const staticFiles = [
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
    "/llms.txt",
    "/service-worker.js",
    "/firebase-messaging-sw.js",
    "/apple-touch-icon.png",
  ];
  if (
    staticFiles.includes(pathname) ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/img/")
  )
    return;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon\\.\\w+|img|images|fonts|public|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|llms\\.txt|service-worker\\.js|firebase-messaging-sw\\.js|icon-.*\\.png|apple-touch-icon\\.png).*)",
  ],
};
