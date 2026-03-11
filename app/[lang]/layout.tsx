import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "./_shared/DictionaryProvider";
import { NavBar } from "./_shared/NavBar";
import { EyesCat } from "./_shared/EyesCat";
import { StableVh } from "./_shared/StableVh";
import { AnimatedFavicon } from "./_shared/AnimatedFavicon";
import { i18nConfig } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { cookies } from "next/headers";
import { VT323, Lexend } from "next/font/google";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-vt323",
});

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-lexend",
});

const themeScript = `(function(){try{var t=document.cookie.match(/(?:^|;)\\s*theme=(light|dark)/);if(t)document.documentElement.setAttribute("data-theme",t[1]);else{var s=localStorage.getItem("theme-preference");if(s==="dark"||s==="light"){document.documentElement.setAttribute("data-theme",s);document.cookie="theme="+s+";path=/;max-age=31536000;SameSite=Lax"}}}catch(e){}})();`;

export function generateStaticParams() {
  return i18nConfig.locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = i18nConfig.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18nConfig.defaultLocale;
  const dictionary = await getDictionary(locale);
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const serverTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <html lang={locale} data-theme={serverTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${lexend.variable} ${vt323.variable}`}>
        <AnimatedFavicon />
        <StableVh />
        <DictionaryProvider dictionary={dictionary} locale={locale} serverTheme={serverTheme}>
          {children}
          <div className="bottom-bar">
            <NavBar />
            <EyesCat />
          </div>
        </DictionaryProvider>
      </body>
    </html>
  );
}
