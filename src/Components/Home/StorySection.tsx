"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/src/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function StorySection() {
  const t = useTranslations("home.story");
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative aspect-[4/5] overflow-hidden rounded-3xl"
          >
            <motion.div style={{ y: imageY }} className="absolute inset-0">
              <Image
                src="/images/pizza1.png"
                alt={t("imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Overlay badge */}
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {t("brandLine")}
              </p>
              <p className="text-2xl font-bold text-white">{t("foundedYear")}</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <span className="mr-2">&mdash;</span>
              {t("kicker")}
              <span className="ml-2">&mdash;</span>
            </p>

            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("titleStart")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h2>

            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("paragraph1")}
            </p>

            <p className="text-base leading-relaxed text-muted-foreground/80">
              {t("paragraph2")}
            </p>

            <div className="pt-2">
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-fit font-semibold",
                )}
              >
                {t("exploreMenu")}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
