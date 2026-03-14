import { getDictionary } from "@/lib/i18n/getDictionary";
import { AdminShell } from "./_components/AdminShell";
import { JetBrains_Mono, Lexend } from "next/font/google";
import "@/app/style/admin/globals.css";

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-lexend",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-code",
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary("vi");

  return (
    <html lang="vi" data-theme="dark" data-admin="true" suppressHydrationWarning>
      <head />
      <body className={`${lexend.variable} ${jetbrainsMono.variable}`}>
        <AdminShell locale="vi" dictionary={dictionary}>
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
