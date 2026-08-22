"use client";
import { motion, Variants } from "framer-motion";

interface IProps {
  title: string;
  subTitle: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0, filter: "blur(8px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const titleVariants: Variants = {
  hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const underlineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.55,
    },
  },
};

const MainSection = ({ subTitle, title }: IProps) => {
  return (
    <motion.div
      className="relative marginSection text-center py-10 md:py-15 lg:py-20 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Ambient glow — tighter and centered for more refined presence */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-1/2 w-1/3 rounded-full bg-primary/6 blur-3xl" />
      </div>

      {/* Subtitle */}
      <motion.p
        className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
        variants={itemVariants}
      >
        <span className="mr-2 text-primary">—</span>
        {subTitle}
        <span className="ml-2 text-primary">—</span>
      </motion.p>

      {/* Title */}
      <motion.h2
        className="font-bold tracking-tight text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
        variants={titleVariants}
      >
        {title}
      </motion.h2>

      {/* Gradient underline — grows symmetrically from center */}
      <motion.div
        className="mx-auto mt-5 h-px w-16"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-primary), transparent)",
          transformOrigin: "center",
        }}
        variants={underlineVariants}
      />
    </motion.div>
  );
};

export default MainSection;
