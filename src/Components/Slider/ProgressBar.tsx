import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  duration: number;
  isPaused?: boolean;
  autoplayKey: number;
  activeIndex: number;
  className?: string;
}

const ProgressBar = ({
  duration,
  isPaused,
  autoplayKey,
  activeIndex,
  className,
}: ProgressBarProps) => {
  const isRTL = useLocale() === "ar";

  return (
    <div className={className}>
      <motion.div
        key={`${activeIndex}-${autoplayKey}`} // Crucial for reset
        className={cn(
          "h-full rounded-full from-primary to-orange-400",
          isRTL ? "bg-linear-to-l" : "bg-linear-to-r",
        )}
        style={{
          transformOrigin: isRTL ? "right" : "left",
          boxShadow:
            "0 0 6px 0 color-mix(in oklch, var(--primary) 55%, transparent), 0 0 12px 0 color-mix(in oklch, var(--primary) 30%, transparent)",
        }}
        initial={{
          scaleX: 0,
        }}
        animate={
          !isPaused
            ? {
                scaleX: 1,
              }
            : {}
        }
        transition={{ duration: isPaused ? 0 : duration, ease: "linear" }}
      />
    </div>
  );
};

export default ProgressBar;
