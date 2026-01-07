"use client";
import gsap from "gsap";
import { useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Testimonial = {
    name: string;
    handle: string;
    quote: string;
    /** CSS gradient string for the avatar bubble */
    gradient?: string;
};

type TestimonialMarqueeProps = {
    items: Testimonial[];
    /** Number of vertical columns (default: 3) */
    columns?: number;
    /**
     * Default direction for all columns (default: "up").
     * Overridden per-column by `columnDirections`.
     */
    direction?: "up" | "down";
    /**
     * Per-column direction override.
     * e.g. ["up", "down", "up"] — length must match `columns`.
     * Columns without an entry fall back to `direction`.
     */
    columnDirections?: ("up" | "down")[];
    /** Base speed — px/frame at 60 fps (default: 1) */
    baseVelocity?: number;
    /** Apply CSS 3D perspective tilt to the whole grid (default: false) */
    is3D?: boolean;
    /** Vertical gap between cards in px (default: 16) */
    gap?: number;
    /** Fixed card height in px — used for loop maths (default: 180) */
    cardHeight?: number;
    /** Card width in px (default: 280) */
    cardWidth?: number;
    /** Gap between columns in px (default: 16) */
    columnGap?: number;
    /**
     * Tailwind classes applied to the outer container.
     * Use this to set height and width, e.g. "h-screen w-full" or "h-96 w-80".
     * (default: "h-[520px]")
     */
    className?: string;
    /** Pause scroll on hover (default: false) */
    pauseOnHover?: boolean;
    /**
     * Per-column velocity multipliers.
     * Length must match `columns`. Defaults to alternating 1 / 0.7.
     */
    columnSpeeds?: number[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const GRADIENTS = [
    "linear-gradient(135deg,#a8edea,#fed6e3)",
    "linear-gradient(135deg,#667eea,#764ba2)",
    "linear-gradient(135deg,#f6d365,#fda085)",
    "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    "linear-gradient(135deg,#fccb90,#d57eeb)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#fa709a,#fee140)",
];

const wrapV = (val: number, total: number) =>
    ((val % total) + total) % total - total;

// ── Card ──────────────────────────────────────────────────────────────────────

const TestimonialCard = ({
    item,
    width,
    height,
    gradientIndex,
}: {
    item: Testimonial;
    width: number;
    height: number;
    gradientIndex: number;
}) => (
    <div
        className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 shrink-0 overflow-hidden"
        style={{ width, height }}
    >
        <div className="flex items-center gap-3 mb-3">
            <div
                className="w-9 h-9 rounded-full shrink-0"
                style={{
                    background:
                        item.gradient ?? GRADIENTS[gradientIndex % GRADIENTS.length],
                }}
            />
            <div>
                <p className="font-semibold text-sm text-gray-900 leading-tight">
                    {item.name}
                </p>
                <p className="text-xs text-gray-400">{item.handle}</p>
            </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {item.quote}
        </p>
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const TestimonialMarquee = ({
    items,
    columns = 3,
    direction = "up",
    columnDirections,
    baseVelocity = 1,
    is3D = false,
    gap = 16,
    cardHeight = 180,
    cardWidth = 280,
    columnGap = 16,
    className = "h-130",
    pauseOnHover = false,
    columnSpeeds,
}: TestimonialMarqueeProps) => {
    const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
    const yRefs = useRef<number[]>(Array(columns).fill(0));
    const isPaused = useRef(false);
    const rafRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const stride = cardHeight + gap;
        const localCols = Array.from({ length: columns }, (_, ci) =>
            items.filter((_, i) => i % columns === ci)
        );

        // Stagger starting y per column for visual variety
        localCols.forEach((col, ci) => {
            const total = col.length * stride;
            if (total === 0) return;
            yRefs.current[ci] = wrapV(-(ci * stride * 1.5), total);
        });

        const tick = (time: number) => {
            const delta = lastTimeRef.current ? time - lastTimeRef.current : 0;
            lastTimeRef.current = time;

            if (!isPaused.current) {
                localCols.forEach((col, ci) => {
                    const total = col.length * stride;
                    if (total === 0) return;

                    // Per-column direction — falls back to the global `direction`
                    const colDir = columnDirections?.[ci] ?? direction;
                    const sign = colDir === "up" ? -1 : 1;
                    const speedMult =
                        columnSpeeds?.[ci] ?? (ci % 2 === 0 ? 1 : 0.7);
                    const vel =
                        sign * baseVelocity * speedMult * (delta / 1000) * 60;

                    yRefs.current[ci] = wrapV(yRefs.current[ci] + vel, total);
                    const track = trackRefs.current[ci];
                    if (track) gsap.set(track, { y: yRefs.current[ci] });
                });
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [
        columns,
        direction,
        columnDirections,
        baseVelocity,
        gap,
        cardHeight,
        items,
        columnSpeeds,
    ]);

    // Distribute items round-robin across columns (for render)
    const cols = Array.from({ length: columns }, (_, ci) =>
        items.filter((_, i) => i % columns === ci)
    );

    // ── 3D perspective style ───────────────────────────────────────────────────
    const perspectiveStyle: React.CSSProperties = is3D
        ? {
            transform:
                "perspective(1000px) rotateX(22deg) rotateZ(-18deg) scale(1.15)",
            transformOrigin: "50% 45%",
        }
        : {};

    const maskStyle: React.CSSProperties = is3D
        ? {}
        : {
            WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskImage:
                "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        };

    return (
        <div
            className={`relative overflow-hidden select-none ${className}`}
            style={maskStyle}
            onMouseEnter={() => {
                if (pauseOnHover) isPaused.current = true;
            }}
            onMouseLeave={() => {
                if (pauseOnHover) isPaused.current = false;
            }}
        >
            {/* Column grid — 3D transform lives here */}
            <div
                className="flex h-full w-full"
                style={{ gap: columnGap, ...perspectiveStyle }}
            >
                {cols.map((col, ci) => {
                    const stride = cardHeight + gap;
                    const totalH = col.length * stride;
                    const display = [...col, ...col, ...col];

                    return (
                        <div
                            key={ci}
                            className="relative overflow-hidden shrink-0 h-full"
                            style={{ width: cardWidth }}
                        >
                            <div
                                ref={(el) => {
                                    trackRefs.current[ci] = el;
                                }}
                                className="absolute top-0 left-0 flex flex-col"
                                style={{ height: totalH * 3, gap }}
                            >
                                {display.map((item, i) => (
                                    <TestimonialCard
                                        key={i}
                                        item={item}
                                        width={cardWidth}
                                        height={cardHeight}
                                        gradientIndex={i % col.length}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TestimonialMarquee;
