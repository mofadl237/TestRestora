"use client";

import { motion } from "framer-motion";

/**
 * Skeleton shown while the home payload is fetched for the first time.
 * Mirrors the home layout so the user never sees empty sections before the
 * real products, categories and offers arrive.
 */
export function HomeSkeleton() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      {/* Hero placeholder */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          <div className="h-10 w-3/4 max-w-md animate-pulse rounded-xl bg-background/40" />
          <div className="h-5 w-1/2 max-w-sm animate-pulse rounded-lg bg-background/30" />
          <div className="mt-4 h-11 w-36 animate-pulse rounded-full bg-background/40" />
        </div>
      </div>

      {/* Categories placeholder */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="px-4 md:px-6 lg:px-0">
            <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="flex justify-center gap-3 overflow-x-auto px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex shrink-0 flex-col items-center gap-2"
                >
                  <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-3 w-14 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product sections placeholder */}
      <div className="space-y-10 px-4 pb-12 md:px-6 lg:px-0">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <motion.section
            key={sectionIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, delay: sectionIndex * 0.04 }}
          >
            <div className="mx-auto mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((__, cardIndex) => (
                <div
                  key={cardIndex}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card"
                >
                  <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                      <div className="h-8 w-20 animate-pulse rounded-xl bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </main>
  );
}
