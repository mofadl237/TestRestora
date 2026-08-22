import { getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n/routing";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">{t("title")}</h2>
      <p className="text-muted-foreground">{t("description")}</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:opacity-80 transition"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
