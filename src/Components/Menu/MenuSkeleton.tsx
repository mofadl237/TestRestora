"use client";

import { motion } from "framer-motion";

/**
 * Skeleton shown while the menu catalog is fetched for the first time.
 * Mirrors the real menu layout (header, search, category chips, product grid)
 * so the user never sees empty or fake data before the real payload arrives.
 */
export function MenuSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header placeholder */}
      <div className="flex items-center justify-between px-0 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="w-14" />
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[4.75rem] z-30 -mx-4 border-b border-border/40 bg-background/95 px-4 pb-2.5 pt-2 backdrop-blur-md md:-mx-6 md:px-6 lg:-mx-12 lg:px-12">
        {/* Search */}
        <div className="flex items-center gap-2.5 rounded-[0.875rem] border border-border/60 bg-card/80 px-3.5 py-2.5">
          <div className="h-[15px] w-[15px] shrink-0 rounded-full bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>

        {/* Section chips */}
        <div className="mt-2 flex w-max gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`sec-${i}`}
              className="h-8 w-20 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>

        {/* Category cards */}
        <div className="mt-2 flex w-max gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`cat-${i}`}
              className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-2 py-1.5"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
              <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="space-y-5 pb-12 pt-3">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <motion.section
            key={groupIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, delay: groupIndex * 0.04 }}
          >
            <div className="mb-2 h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2.5 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((__, cardIndex) => (
                <div
                  key={cardIndex}
                  className="flex gap-3 rounded-xl border border-border/60 bg-card p-3"
                >
                  <div className="h-24 w-24 shrink-0 animate-pulse rounded-lg bg-muted" />
                  <div className="flex flex-1 flex-col gap-2 py-1">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="mt-auto h-4 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
