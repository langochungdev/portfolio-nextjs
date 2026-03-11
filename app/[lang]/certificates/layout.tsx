import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = {
  title: "Cert",
};

export default async function CertificatesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: "Trang chủ", url: "https://langochung.me" },
            {
              name: "Certificates",
              url: `https://langochung.me/${lang}/certificates`,
            },
          ],
          "breadcrumb-certificates",
        )}
      />
      {children}
    </>
  );
}
