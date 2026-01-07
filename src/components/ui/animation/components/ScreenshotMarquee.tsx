"use client";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ScreenshotMarqueeProps = {
    /** Array of image src strings */
    items: string[];
    /** Number of vertical columns (default: 4) */
    columns?: number;
    /**
     * Default direction for all columns (default: "up").
     * Override per-column with `columnDirections`.
     */
    direction?: "up" | "down";
    /**
     * Per-column direction — e.g. ["up","down","up","down"].
     * Falls back to `direction` for missing entries.
     */
    columnDirections?: ("up" | "down")[];
    /** Base speed — px/frame at 60 fps (default: 1) */
    baseVelocity?: number;
    /**
     * Apply CSS 3D perspective tilt to the grid (default: false).
     * Produces the isometric card-wall look.
     */
    is3D?: boolean;
    /**
     * 3D rotation preset (default: "left").
     * "left"  — tilts top-left toward the viewer (classic hero wall)
     * "right" — mirror of left
     */
    tiltDirection?: "left" | "right";
    /** Vertical gap between cards in px (default: 16) */
    gap?: number;
    /** Card height in px — used for loop maths (default: 280) */
    cardHeight?: number;
    /** Card width in px (default: 220) */
    cardWidth?: number;
    /** Gap between columns in px (default: 16) */
    columnGap?: number;
    /**
     * Tailwind classes on the outer container for sizing.
     * e.g. "h-screen w-full" or "h-[600px]"
     * (default: "h-screen w-full")
     */
    className?: string;
    /** Pause on hover (default: false) */
    pauseOnHover?: boolean;
    /**
     * Per-column speed multipliers.
     * Defaults to alternating 1 / 0.72.
     */
    columnSpeeds?: number[];
    /**
     * Show a radial vignette overlay that fades edges (default: true).
     * Useful to soften the 3D effect.
     */
    vignette?: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const wrapV = (val: number, total: number) =>
    ((val % total) + total) % total - total;

// ── Component ─────────────────────────────────────────────────────────────────

const ScreenshotMarquee = ({
    items,
    columns = 4,
    direction = "up",
    columnDirections,
    baseVelocity = 1,
    is3D = false,
    tiltDirection = "left",
    gap = 16,
    cardHeight = 280,
    cardWidth = 220,
    columnGap = 16,
    className = "h-screen w-full",
    pauseOnHover = false,
    columnSpeeds,
    vignette = true,
}: ScreenshotMarqueeProps) => {
    // Distribute items round-robin
    const cols = Array.from({ length: columns }, (_, ci) =>
        items.filter((_, i) => i % columns === ci)
    );

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

        // Stagger starting positions
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

                    const colDir = columnDirections?.[ci] ?? direction;
                    const sign = colDir === "up" ? -1 : 1;
                    const speedMult =
                        columnSpeeds?.[ci] ?? (ci % 2 === 0 ? 1 : 0.72);
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

    // ── 3D transform ──────────────────────────────────────────────────────────
    const rotateZ = tiltDirection === "left" ? "-18deg" : "18deg";
    const perspectiveStyle: React.CSSProperties = is3D
        ? {
            transform: `perspective(900px) rotateX(24deg) rotateZ(${rotateZ}) scale(1.2)`,
            transformOrigin: "50% 48%",
        }
        : {};

    // Flat mode: fade top + bottom edges
    const maskStyle: React.CSSProperties = !is3D
        ? {
            WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            maskImage:
                "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }
        : {};

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
            {/* Column grid */}
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
                                {display.map((src, i) => (
                                    <div
                                        key={i}
                                        className="shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl"
                                        style={{ width: cardWidth, height: cardHeight }}
                                    >
                                        <Image
                                            src={src}
                                            alt={`screenshot-${i}`}
                                            width={cardWidth}
                                            height={cardHeight}
                                            sizes="(max-width: 768px) 50vw, 100vw"
                                            className="object-cover object-top w-full h-full"
                                            draggable={false}
                                            fetchPriority="high"
                                            priority
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Vignette overlay */}
            {is3D && vignette && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%)",
                    }}
                />
            )}
        </div>
    );
};

export default ScreenshotMarquee;
