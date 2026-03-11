import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { i18nConfig } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { AdminShell } from "./_components/AdminShell";
import { Lexend } from "next/font/google";
import "@/app/style/admin/globals.css";

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-lexend",
});

const themeScript = `(function(){try{var t=document.cookie.match(/(?:^|;)\\s*theme=(light|dark)/);if(t)document.documentElement.setAttribute("data-theme",t[1]);else{var s=localStorage.getItem("theme-preference");if(s==="dark"||s==="light"){document.documentElement.setAttribute("data-theme",s);document.cookie="theme="+s+";path=/;max-age=31536000;SameSite=Lax"}}}catch(e){}})();`;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("admin-locale")?.value;
  const locale = i18nConfig.locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : i18nConfig.defaultLocale;
  const dictionary = await getDictionary(locale);
  const themeCookie = cookieStore.get("theme")?.value;
  const serverTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <html lang={locale} data-theme={serverTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={lexend.variable}>
        <AdminShell locale={locale} dictionary={dictionary}>
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
