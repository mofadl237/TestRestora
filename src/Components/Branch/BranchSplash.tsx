"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FaPizzaSlice } from "react-icons/fa6";
import { usePublicSettings } from "@/src/Components/Footer/data";

/**
 * Minimal branded splash shown only while the branch context resolves
 * (a single light `/branches` request). Deliberately tiny: the customer
 * should never wait on a cinematic animation before ordering.
 */
export default function BranchSplash() {
  const settings = usePublicSettings();
  const logo = settings?.branding?.logo;
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg"
      >
        {logo ? (
          <Image
            src={logo}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            priority
          />
        ) : (
          <FaPizzaSlice className="text-2xl" aria-hidden="true" />
        )}
      </motion.div>

      <motion.span
        animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
        transition={
          reduceMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="h-1 w-24 rounded-full bg-muted-foreground/40"
        aria-hidden="true"
      />
    </div>
  );
}
