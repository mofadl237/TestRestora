import { ContactFaq } from "@/src/Components/Contact/ContactFaq";
import { ContactFooterCta } from "@/src/Components/Contact/ContactFooterCta";
import { ContactFormSection } from "@/src/Components/Contact/ContactFormSection";
import { ContactHero } from "@/src/Components/Contact/ContactHero";
import { ContactInfo } from "@/src/Components/Contact/ContactInfo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata, getRestaurantForSeo } from "@/src/lib/seo/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [restaurant, t] = await Promise.all([
    getRestaurantForSeo(locale),
    getTranslations({ locale, namespace: "contact.meta" }),
  ]);

  return buildPageMetadata(restaurant, locale, "/contact", {
    title: t("title"),
    description: t("description"),
  });
}

export default function ContactPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <ContactHero />
      <ContactInfo />
      <ContactFormSection />
      <ContactFaq />
      <ContactFooterCta />
    </main>
  );
}
