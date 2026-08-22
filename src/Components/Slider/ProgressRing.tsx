import { cn } from "@/lib/utils";

interface IProps {
  /** Slide duration in seconds — one full revolution of the ring. */
  duration: number;
  /** Bumped on every slide change so the ring resets cleanly. */
  autoplayKey: number;
  activeIndex: number;
  className?: string;
}

const VIEWBOX = 100;
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Animated progress ring that wraps the featured slide thumbnail.
 *
 * It fills clockwise once per slide and stays synchronized with the slider.
 * The gradient stroke (transparent → primary) plus the soft glow read as a
 * moving light travelling around the dish rather than a loading spinner.
 * It always runs alongside the bottom progress bar — both reset together
 * whenever the slide changes.
 */
const ProgressRing = ({
  duration,
  autoplayKey,
  activeIndex,
  className,
}: IProps) => {
  const gradientId = `progress-ring-gradient-${activeIndex}-${autoplayKey}`;

  return (
    <svg
      key={`${activeIndex}-${autoplayKey}`}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      aria-hidden
      className={cn(
        "absolute -inset-1.5 h-[calc(100%+12px)] w-[calc(100%+12px)] -rotate-90",
        className,
      )}
      style={{
        filter:
          "drop-shadow(0 0 6px color-mix(in oklch, var(--primary) 45%, transparent))",
      }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
          <stop
            offset="40%"
            style={{ stopColor: "var(--primary)", stopOpacity: 0.4 }}
          />
          <stop
            offset="70%"
            style={{ stopColor: "var(--primary)", stopOpacity: 0.7 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--primary)", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      {/* Faint track — keeps the circle visible between slides */}
      <circle
        cx={VIEWBOX / 2}
        cy={VIEWBOX / 2}
        r={RADIUS}
        fill="none"
        style={{ stroke: "var(--primary)", strokeOpacity: 0.14 }}
        strokeWidth="2"
      />

      {/* Animated progress arc */}
      <circle
        className="progress-ring-arc"
        cx={VIEWBOX / 2}
        cy={VIEWBOX / 2}
        r={RADIUS}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        style={{
          strokeDashoffset: CIRCUMFERENCE,
          animation: `progress-ring-fill ${duration}s linear forwards`,
        }}
      />
    </svg>
  );
};

export default ProgressRing;
