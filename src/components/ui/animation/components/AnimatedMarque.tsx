"use client";
import gsap from "gsap";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TextItem = {
    text: string;
    /**
     * ""           — white, bold, uppercase (default)
     * "--accent"   — lime / brand colour
     * "--outline"  — transparent fill, white stroke
     * "sep"        — separator symbol (dim, smaller, not bold)
     */
    mod?: "" | "--accent" | "--outline" | "sep";
};

type MarqueeItem = string | StaticImageData | TextItem | React.ReactNode;

const isTextItem = (item: MarqueeItem): item is TextItem =>
    typeof item === "object" && item !== null && "text" in item && !("type" in item && "props" in item);

// ── Helpers ───────────────────────────────────────────────────────────────────

const wrap = (val: number, totalWidth: number) =>
    ((val % totalWidth) + totalWidth) % totalWidth - totalWidth;

/** Returns Tailwind classes + inline style for a text item based on its mod */
const textStyle = (mod: TextItem["mod"] = "") => {
    const base = "font-black uppercase tracking-tight whitespace-nowrap leading-none select-none";
    switch (mod) {
        case "--accent":
            return { className: `${base} text-[#b9f900]`, style: {} };
        case "--outline":
            return { className: `${base} text-transparent`, style: { WebkitTextStroke: "1.5px white" } };
        case "sep":
            return { className: "text-white/30 font-normal whitespace-nowrap leading-none select-none", style: {} };
        default:
            return { className: `${base} text-white`, style: {} };
    }
};

// ── Props ─────────────────────────────────────────────────────────────────────

type MarqueeProps = {
    items: MarqueeItem[];
    /** 1 = left, -1 = right */
    direction?: 1 | -1;
    /** Base speed — px/frame at 60 fps */
    baseVelocity?: number;
    /**
     * Width of each item in px.
     * For text mode set this to the approximate rendered width of one item.
     */
    itemWidth?: number;
    /** Gap between items in px (default: 0) */
    gap?: number;
    /** Opacity 0–1 (default: 1) */
    opacity?: number;
    /** Font-size Tailwind class used for text items (default: "text-5xl") */
    textSize?: string;
    /** Allow click-drag to scrub */
    draggable?: boolean;
    /**
     * "auto"        — always playing (default)
     * "scroll"      — only plays while scrolling; pauses otherwise
     * "hover-pause" — plays normally, pauses on hover
     */
    playMode?: "auto" | "scroll" | "hover-pause";
    /**
     * Only applies with playMode="scroll".
     * true (default) — scroll-up reverses direction permanently while scrolling.
     * false          — direction stays fixed.
     */
    scrollReverse?: boolean;
    /**
     * Scroll-boost — works on ANY playMode.
     * Scroll down → temporarily faster in the defined direction.
     * Scroll up   → temporarily faster in the opposite direction.
     * Scroll stop → velocity decays smoothly back to normal (no stutter / snap).
     */
    scrollBoost?: boolean;
    /** How many × faster when scrolling down (default: 4) */
    scrollBoostMultiplierDown?: number;
    /** How many × faster when scrolling up / opposite direction (default: same as scrollBoostMultiplierDown) */
    scrollBoostMultiplierUp?: number;
};

// ── Component ─────────────────────────────────────────────────────────────────

const ParallaxMarquee = ({
    items,
    direction = 1,
    baseVelocity = 2.5,
    itemWidth = 200,
    gap = 0,
    opacity = 1,
    textSize = "text-5xl",
    draggable = false,
    playMode = "auto",
    scrollReverse = true,
    scrollBoost = false,
    scrollBoostMultiplierDown = 4,
    scrollBoostMultiplierUp = scrollBoostMultiplierDown,
}: MarqueeProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const xRef = useRef(0);

    // play / pause
    const hoverPaused = useRef(false);
    const scrollActive = useRef(false);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollModeDir = useRef<1 | -1>(direction);

    /**
     * velScale — direction-independent multiplier lerped each frame.
     *  1  = normal speed in defined direction
     *  N  = N× speed in defined direction   (scroll down)
     * -N  = N× speed in OPPOSITE direction  (scroll up)
     * Both direction=1 and direction=-1 experience the same lerp path
     * (1→N or 1→-N) so they always accelerate at exactly the same rate.
     */
    const velScale = useRef(1);
    const targetScale = useRef(1);
    const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // drag
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragStartMotionX = useRef(0);
    const lastDragX = useRef(0);
    const dragVelocity = useRef(0);

    const lastTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const itemStride = itemWidth + gap;
    const totalWidth = items.length * itemStride;
    const displayItems = [...items, ...items, ...items];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const isPlaying = () => {
            if (isDragging.current) return false;
            if (playMode === "hover-pause" && hoverPaused.current) return false;
            if (playMode === "scroll" && !scrollActive.current) return false;
            return true;
        };

        // ── Wheel ─────────────────────────────────────────────────────
        const onWheel = (e: WheelEvent) => {
            const scrollingDown = e.deltaY > 0;

            // scroll-mode: permanent direction flip
            if (playMode === "scroll") {
                scrollModeDir.current = (!scrollReverse || scrollingDown)
                    ? direction
                    : (direction * -1) as 1 | -1;

                scrollActive.current = true;
                if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
                scrollTimerRef.current = setTimeout(() => {
                    scrollActive.current = false;
                }, 300);
            }

            // scroll-boost: set targetScale symmetrically (direction-independent)
            // scroll down →  +multiplier (same direction, faster)
            // scroll up   →  -multiplier (opposite direction, same speed)
            if (scrollBoost) {
                const multiplier = scrollingDown ? scrollBoostMultiplierDown : scrollBoostMultiplierUp;
                targetScale.current = scrollingDown ? multiplier : -multiplier;

                if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
                boostTimerRef.current = setTimeout(() => {
                    targetScale.current = 1; // reset to normal
                }, 500);
            }
        };

        window.addEventListener("wheel", onWheel, { passive: true });

        // ── RAF loop ───────────────────────────────────────────────────
        const tick = (time: number) => {
            const delta = lastTimeRef.current ? time - lastTimeRef.current : 0;
            lastTimeRef.current = time;

            // Lerp velScale toward targetScale — frame-rate independent
            // Both direction=1 and direction=-1 lerp the same path (1→N or 1→-N)
            if (scrollBoost) {
                const t = 1 - Math.pow(0.92, delta / (1000 / 60));
                velScale.current += (targetScale.current - velScale.current) * t;
            }

            if (isPlaying()) {
                if (Math.abs(dragVelocity.current) > 0.5) {
                    xRef.current = wrap(xRef.current + dragVelocity.current, totalWidth);
                    dragVelocity.current *= 0.92;
                } else {
                    dragVelocity.current = 0;
                    // velScale is direction-independent: direction × base × scale
                    const activeVel = scrollBoost
                        ? direction * baseVelocity * velScale.current
                        : scrollModeDir.current * baseVelocity;
                    const vel = activeVel * (delta / 1000) * 60;

                    xRef.current = wrap(xRef.current + vel, totalWidth);
                }
            }

            gsap.set(track, { x: xRef.current });
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener("wheel", onWheel);
            if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
            if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
        };
    }, [direction, baseVelocity, totalWidth, itemStride, playMode, scrollReverse, scrollBoost, scrollBoostMultiplierDown, scrollBoostMultiplierUp]);

    // ── Drag handlers ──────────────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        dragVelocity.current = e.clientX - lastDragX.current;
        lastDragX.current = e.clientX;
        xRef.current = wrap(dragStartMotionX.current + (e.clientX - dragStartX.current), totalWidth);
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!draggable) return;
        isDragging.current = true;
        dragStartX.current = e.clientX;
        dragStartMotionX.current = xRef.current;
        lastDragX.current = e.clientX;
        dragVelocity.current = 0;
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!draggable) return;
        isDragging.current = true;
        dragStartX.current = e.touches[0].clientX;
        dragStartMotionX.current = xRef.current;
        lastDragX.current = e.touches[0].clientX;
        dragVelocity.current = 0;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        dragVelocity.current = e.touches[0].clientX - lastDragX.current;
        lastDragX.current = e.touches[0].clientX;
        xRef.current = wrap(dragStartMotionX.current + (e.touches[0].clientX - dragStartX.current), totalWidth);
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div
            className="overflow-hidden relative select-none bg-transparent!"
            style={{ opacity, cursor: draggable ? "grab" : "default" }}
            onMouseEnter={() => { if (playMode === "hover-pause") hoverPaused.current = true; }}
            onMouseLeave={() => {
                if (playMode === "hover-pause") hoverPaused.current = false;
                if (isDragging.current) handleMouseUp();
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClickCapture={(e) => {
                if (draggable && Math.abs(lastDragX.current - dragStartX.current) > 3) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
        >
            <div
                ref={trackRef}
                className="flex items-center bg-transparent!"
                style={{
                    width: `${totalWidth * 3}px`,
                    gap: `${gap}px`,
                }}
            >
                {displayItems.map((item, i) => {
                    if (isTextItem(item)) {
                        const { className, style } = textStyle(item.mod);
                        return (
                            <div
                                key={i}
                                className="shrink-0 flex items-center justify-center bg-transparent!"
                                style={{ width: itemWidth }}
                            >
                                <span
                                    className={`${textSize} ${className}`}
                                    style={style}
                                >
                                    {item.text}
                                </span>
                            </div>
                        );
                    }

                    if (typeof item !== 'string' && !(item && typeof item === 'object' && 'src' in item)) {
                        return (
                            <div
                                key={i}
                                className="shrink-0 bg-transparent! flex justify-center items-center"
                                style={{ width: itemWidth }}
                            >
                                {item as React.ReactNode}
                            </div>
                        );
                    }

                    return (
                        <div
                            key={i}
                            className="shrink-0 pointer-events-none bg-transparent! flex justify-center items-center"
                            style={{ width: itemWidth, height: 150 }}
                        >
                            <Image
                                src={item as string | StaticImageData}
                                alt="marquee item"
                                width={itemWidth}
                                height={150}
                                className="object-contain w-full h-auto max-w-25"
                                draggable={false}
                                sizes="(max-width: 768px) 50vw, 100vw"
                                fetchPriority="high"
                                priority
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ParallaxMarquee;
