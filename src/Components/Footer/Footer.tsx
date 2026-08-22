"use client";

import { motion, Variants } from "framer-motion";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";
import { FooterContact } from "./FooterContact";
import { FooterNewsletter } from "./FooterNewsletter";
import { FooterBottom } from "./FooterBottom";
import { usePublicSettings } from "./data";
import type { CSSProperties } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Footer() {
  const primaryColor = usePublicSettings()?.branding?.primaryColor?.trim();
  const style: CSSProperties | undefined = primaryColor
    ? ({ "--primary": primaryColor, "--ring": primaryColor } as CSSProperties)
    : undefined;

  return (
    <footer
      style={style}
      className="dark mt-auto overflow-hidden border-t border-border/40 bg-background pt-16 text-foreground md:pt-20 lg:pt-24 pb-8 border-t border-border/60 shadow-[0_-8px_40px_-24px_rgba(0,0,0,0.1)]"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col"
        >
          {/* Main Top Section */}
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 xl:gap-16">
            <FooterBrand variants={itemVariants} />
            <FooterContact variants={itemVariants} />
            <FooterLinks variants={itemVariants} />
            <FooterNewsletter variants={itemVariants} />
          </div>

          {/* Bottom Section */}
          <FooterBottom variants={itemVariants} />
        </motion.div>
      </div>
    </footer>
  );
}
