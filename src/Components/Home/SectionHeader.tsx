"use client";

import { motion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, filter: "blur(8px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: EASE, delay: 0.3 },
  },
};

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      className={`relative text-center ${className ?? ""}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {eyebrow && (
        <motion.p
          variants={itemVariants}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
        >
          <span className="mr-2 text-primary">&mdash;</span>
          {eyebrow}
          <span className="ml-2 text-primary">&mdash;</span>
        </motion.p>
      )}

      <motion.h2
        variants={itemVariants}
        className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
      >
        {title}
      </motion.h2>

      <motion.div
        variants={lineVariants}
        className="mx-auto mt-5 h-px w-16"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-primary), transparent)",
          transformOrigin: "center",
        }}
      />

      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="mx-auto mt-4 max-w-md text-base text-muted-foreground"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
