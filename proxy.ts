import { NextRequest, NextResponse } from "next/server";
import { i18nConfig, localeCookieName } from "@/lib/i18n/config";

const locales = [...i18nConfig.locales];
const defaultLocale = i18nConfig.defaultLocale;

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  if (
    cookieLocale &&
    locales.includes(cookieLocale as (typeof locales)[number])
  ) {
    return cookieLocale;
  }

  const acceptLang = request.headers.get("accept-language");

  if (acceptLang) {
    const langs = acceptLang
      .split(",")
      .map((part) => part.split(";")[0]?.trim().toLowerCase())
      .filter((part): part is string => !!part);

    for (const lang of langs) {
      if (lang.startsWith("en")) return "en";
      if (lang.startsWith("vi")) return "vi";
    }
  }

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
  ];
  if (
    staticFiles.includes(pathname) ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/img/") ||
    /^\/[^/]+\.(png|svg|gif|ico|webp|jpg|jpeg)$/.test(pathname)
  )
    return;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    const localeFromPath = locales.find(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    const currentCookieLocale = request.cookies.get(localeCookieName)?.value;
    if (!localeFromPath || currentCookieLocale === localeFromPath) return;

    const response = NextResponse.next();
    response.cookies.set(localeCookieName, localeFromPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon\.\\w+|img|images|fonts|public|robots\.txt|sitemap\.xml|manifest\.webmanifest|llms\.txt|service-worker\.js|firebase-messaging-sw\.js|[^/]+\.(?:png|svg|gif|ico|webp|jpg|jpeg)).*)",
  ],
};
