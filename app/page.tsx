import { redirect } from "next/navigation";
import { getI18nRuntimeConfig } from "@/src/i18n/config";

export const dynamic = "force-dynamic";

interface IRootPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RootPage({ searchParams }: IRootPageProps) {
  const { defaultLocale } = await getI18nRuntimeConfig();
  const params = await searchParams;

  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }

  const queryString = query.toString();

  redirect(`/${defaultLocale}${queryString ? `?${queryString}` : ""}`);
}
