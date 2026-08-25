"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Clock3, Phone, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { IconNextCircle } from "@/src/lib/i18n/DirectionalIcons";
import { usePublicSettings } from "@/src/Components/Footer/data";
import type { IApiBranch } from "@/src/store/api/publicApi";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface IBranchSelectionProps {
  branches: IApiBranch[];
  onSelect: (branch: IApiBranch) => void;
}

/**
 * Premium compact location-selection experience for multi-branch restaurants.
 *
 * Feels like a short cinematic transition, not a standalone directory.
 * The restaurant's identity dominates — logo, cover, primary color.
 */
export default function BranchSelection({ branches, onSelect }: IBranchSelectionProps) {
  const t = useTranslations("branches");
  const reduceMotion = useReducedMotion();
  const settings = usePublicSettings();
  const coverImageRef = useRef<HTMLDivElement>(null);

  const restaurantName = settings?.restaurantName?.trim() ?? "";
  const logo = settings?.branding?.logo || null;
  const cover = settings?.branding?.coverImage || null;
  const primaryColor = settings?.branding?.primaryColor || undefined;

  // Subtle GSAP Ken Burns on the cover image
  useEffect(() => {
    if (reduceMotion || !cover || !coverImageRef.current) return;
    const el = coverImageRef.current;
    gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 2.5, ease: "power2.out" });
    return () => { gsap.killTweensOf(el); };
  }, [cover, reduceMotion]);

  const containerV = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.06, delayChildren: 0.1 },
    },
  };

  const fadeUp = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
  };

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Cinematic cover layer — full bleed, darkened */}
      <div className="absolute inset-0" aria-hidden="true">
        {cover ? (
          <>
            <div ref={coverImageRef} className="absolute inset-0 origin-center">
              <Image
                src={cover}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-25 dark:opacity-15"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </>
        ) : (
          <div
            className="absolute inset-x-0 top-0 h-[50vh]"
            style={{
              background: primaryColor
                ? `radial-gradient(70% 80% at 50% -15%, color-mix(in oklab, ${primaryColor} 16%, transparent), transparent 70%)`
                : "radial-gradient(60% 90% at 50% -20%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)",
            }}
          />
        )}
      </div>

      <motion.div
        variants={containerV}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-10 md:px-6"
      >
        {/* Brand header — compact, elegant */}
        <motion.div variants={fadeUp} className="flex flex-col items-center text-center">
          {/* Logo as brand reveal */}
          <motion.div
            variants={fadeUp}
            className="relative mb-4 inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_40px_-14px_color-mix(in_oklab,var(--primary)_60%,transparent)] ring-1 ring-border/50 md:h-16 md:w-16"
          >
            {logo ? (
              <Image src={logo} alt="" fill priority sizes="64px" className="object-cover" />
            ) : (
              <span className="font-heading text-xl font-semibold">
                {(restaurantName || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </motion.div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {restaurantName || t("fallbackName")}
          </p>
          <h1 className="mt-2 max-w-lg font-heading text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Branch cards — compact grid */}
        <motion.ul
          variants={containerV}
          className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} onSelect={onSelect} />
          ))}
        </motion.ul>
      </motion.div>
    </main>
  );
}

// ─── Compact Branch Card ──────────────────────────────────────────────────────

function BranchCard({
  branch,
  onSelect,
}: {
  branch: IApiBranch;
  onSelect: (branch: IApiBranch) => void;
}) {
  const t = useTranslations("branches");
  const reduceMotion = useReducedMotion();

  const cardV = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
  };

  const addressLine = [branch.address, branch.city].filter(Boolean).join(", ");

  return (
    <motion.li variants={cardV} className="h-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(branch)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(branch);
          }
        }}
        aria-label={`${branch.name} — ${branch.isOpenNow ? t("openNow") : t("closed")}`}
        className={cn(
          "group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/90 text-start backdrop-blur-sm",
          "shadow-sm transition-all duration-300",
          "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_48px_-20px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:translate-y-0 active:scale-[0.99]",
        )}
      >
        {/* Branch image — compact height */}
        <div className="relative h-28 w-full overflow-hidden sm:h-32">
          {branch.image ? (
            <Image
              src={branch.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(140deg, color-mix(in oklab, var(--primary) 20%, transparent), color-mix(in oklab, var(--primary) 6%, transparent))",
              }}
              aria-hidden="true"
            >
              <span className="font-heading text-3xl font-semibold text-primary/70">
                {branch.name.charAt(0).toUpperCase()}
              </span>
            </span>
          )}

          {/* Status pill */}
          <span
            className={cn(
              "absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md",
              branch.isOpenNow
                ? "bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-400/25"
                : "bg-red-950/60 text-red-300 ring-1 ring-red-400/25",
            )}
          >
            <span
              className={cn(
                "size-1 rounded-full",
                branch.isOpenNow ? "bg-emerald-400" : "bg-red-400",
              )}
              aria-hidden="true"
            />
            {branch.isOpenNow ? t("openNow") : t("closed")}
          </span>
        </div>

        {/* Body — compact */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="font-heading text-base font-bold leading-snug text-foreground">
            {branch.name}
          </h3>

          {addressLine ? (
            <p className="flex items-start gap-1 text-xs leading-snug text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{addressLine}</span>
            </p>
          ) : null}

          {branch.openingHoursSummary ? (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <Clock3 className="size-3 shrink-0" aria-hidden="true" />
              <span>{branch.openingHoursSummary}</span>
            </p>
          ) : null}

          {/* Contact links */}
          {(branch.phone || branch.mapsUrl) && (
            <div
              className="flex items-center gap-2 text-[11px]"
              onClick={(e) => e.stopPropagation()}
            >
              {branch.phone ? (
                <a
                  href={`tel:${branch.phone}`}
                  className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-3 shrink-0" aria-hidden="true" />
                  <span>{branch.phone}</span>
                </a>
              ) : null}
              {branch.mapsUrl ? (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                  <span>{t("card.directions")}</span>
                </a>
              ) : null}
            </div>
          )}

          {/* CTA */}
          <span className="mt-auto flex items-center justify-between pt-2">
            <span
              className={cn(
                "text-xs font-semibold",
                branch.isOpenNow ? "text-primary" : "text-muted-foreground",
              )}
            >
              {branch.isOpenNow ? t("orderOnline") : t("viewMenu")}
            </span>
            <IconNextCircle
              className="size-5 text-primary transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </motion.li>
  );
}
