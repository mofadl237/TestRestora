import { AboutHero } from "@/src/Components/About/AboutHero";
import { GalleryPreview } from "@/src/Components/About/GalleryPreview";
import { MeetChefs } from "@/src/Components/About/MeetChefs";
import { MenuCta } from "@/src/Components/About/MenuCta";
import { OurPhilosophy } from "@/src/Components/About/OurPhilosophy";
import { OurStory } from "@/src/Components/About/OurStory";
import { RestaurantStats } from "@/src/Components/About/RestaurantStats";
import { WhyChooseUs } from "@/src/Components/About/WhyChooseUs";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AboutPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <AboutHero />
      <OurStory />
      <RestaurantStats />
      <OurPhilosophy />
      <MeetChefs />
      <WhyChooseUs />
      <GalleryPreview />
      <MenuCta />
    </main>
  );
}
