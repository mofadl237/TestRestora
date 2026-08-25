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
 * Premium location-selection experience for multi-branch restaurants.
 *
 * Shown ONCE before the website when a customer has not picked a location
 * yet (or followed a shareable `?branch=` link). Uses only the restaurant's
 * own identity — logo, primary color, cover and branch imagery from the
 * Public API; never stock photos.
 *
 * Performance: by the time this screen mounts, the ONLY network payload is
 * the light `/branches` list plus the shared `/restaurant` snapshot. No menu
 * data is requested before a branch is selected.
 */
export default function BranchSelection({ branches, onSelect }: IBranchSelectionProps) {
  const t = useTranslations("branches");
  const reduceMotion = useReducedMotion();
  const settings = usePublicSettings();
  const coverImageRef = useRef<HTMLDivElement>(null);

  const restaurantName = settings?.restaurantName?.trim() ?? "";
  const logo = settings?.branding?.logo || null;
  const cover = settings?.branding?.coverImage || null;

  // Subtle GSAP Ken Burns reveal on the ambient cover image — complements
  // the Framer Motion entrance without over-animating the selection itself.
  useEffect(() => {
    if (reduceMotion || !cover || !coverImageRef.current) return;
    const el = coverImageRef.current;
    gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 2.5, ease: "power2.out" });
    return () => { gsap.killTweensOf(el); };
  }, [cover, reduceMotion]);

  const containerV = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.09, delayChildren: 0.05 },
    },
  };

  const fadeUp = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
  };

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Ambient layer — the restaurant's own cover imagery when available,
          otherwise a restrained brand-tinted vignette. One effect, one reason. */}
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
                className="object-cover opacity-20 dark:opacity-15"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          </>
        ) : (
          <div
            className="absolute inset-x-0 top-0 h-[45vh]"
            style={{
              background:
                "radial-gradient(60% 90% at 50% -20%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)",
            }}
          />
        )}
      </div>

      <motion.div
        variants={containerV}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-12 pt-12 md:px-6 md:pt-20"
      >
        {/* ── Brand header ── */}
        <motion.div variants={fadeUp} className="flex flex-col items-center text-center">
          <span className="relative mb-6 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-[0_18px_50px_-18px_color-mix(in_oklab,var(--primary)_65%,transparent)] ring-1 ring-border/60 md:h-24 md:w-24">
            {logo ? (
              <Image src={logo} alt="" fill priority sizes="96px" className="object-cover" />
            ) : (
              <span className="font-heading text-2xl font-semibold">
                {(restaurantName || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </span>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {restaurantName || t("fallbackName")}
          </p>
          <h1 className="mt-3 max-w-xl font-heading text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* ── Branch cards ── */}
        <motion.ul
          variants={containerV}
          className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} onSelect={onSelect} />
          ))}
        </motion.ul>
      </motion.div>
    </main>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

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
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
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
          "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-start",
          "shadow-sm transition-all duration-300",
          "hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_24px_60px_-28px_color-mix(in_oklab,var(--primary)_40%,transparent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:translate-y-0 active:scale-[0.99]",
        )}
      >
        {/* Imagery — branch photo when provided, branded monogram fallback. */}
        <div className="relative h-36 w-full overflow-hidden sm:h-40">
          {branch.image ? (
            <Image
              src={branch.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(140deg, color-mix(in oklab, var(--primary) 22%, transparent), color-mix(in oklab, var(--primary) 8%, transparent))",
              }}
              aria-hidden="true"
            >
              <span className="font-heading text-4xl font-semibold text-primary/80">
                {branch.name.charAt(0).toUpperCase()}
              </span>
            </span>
          )}

          {/* Status pill */}
          <span
            className={cn(
              "absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
              branch.isOpenNow
                ? "bg-emerald-950/55 text-emerald-300 ring-1 ring-emerald-400/30"
                : "bg-red-950/55 text-red-300 ring-1 ring-red-400/30",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                branch.isOpenNow ? "bg-emerald-400" : "bg-red-400",
              )}
              aria-hidden="true"
            />
            {branch.isOpenNow ? t("openNow") : t("closed")}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-heading text-lg font-bold leading-snug text-foreground">
            {branch.name}
          </h3>

          {addressLine ? (
            <p className="flex items-start gap-1.5 text-sm leading-snug text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{addressLine}</span>
            </p>
          ) : null}

          {branch.openingHoursSummary ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground/90">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{branch.openingHoursSummary}</span>
            </p>
          ) : null}

          {/* Contact links — stopPropagation prevents card selection */}
          {(branch.phone || branch.mapsUrl) && (
            <div
              className="flex items-center gap-2 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {branch.phone ? (
                <a
                  href={`tel:${branch.phone}`}
                  className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-3.5 shrink-0" aria-hidden="true" />
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
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{t("card.directions")}</span>
                </a>
              ) : null}
            </div>
          )}

          {/* CTA row */}
          <span className="mt-auto flex items-center justify-between pt-3">
            <span
              className={cn(
                "text-sm font-semibold",
                branch.isOpenNow ? "text-primary" : "text-muted-foreground",
              )}
            >
              {branch.isOpenNow ? t("orderOnline") : t("viewMenu")}
            </span>
            <IconNextCircle
              className="size-6 text-primary transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </motion.li>
  );
}
