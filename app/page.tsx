import { redirect } from "next/navigation";
import { i18nConfig } from "@/lib/i18n/config";

export default function RootPage() {
  redirect(`/${i18nConfig.defaultLocale}`);
}
