"use client";
import gsap from "gsap";
import { useEffect, useRef } from "react";


const DaynamicCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLParagraphElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);

    // useRef instead of state (no re-render)
    const activeTarget = useRef<HTMLElement | null>(null);
    const lastMouse = useRef({ x: 0, y: 0 });

    const setLabel = (text: string) => {
        if (labelRef.current) {
            labelRef.current.innerText = text;
        }
    };

    const setBlend = (enabled: boolean) => {
        if (!cursorRef.current) return;
        cursorRef.current.classList.toggle("mix-blend-difference", enabled);
    };

    const handleHover = (target: HTMLElement) => {
        if (!cursorRef.current) return;

        const type = target?.dataset?.cursor || "";
        const label = target?.dataset?.cursorLabel || "";

        activeTarget.current = target;

        switch (type) {
            case "textview":
                setBlend(true);

                gsap.to(cursorRef.current, { scale: 10, duration: 0.5, ease: "power3", overwrite: "auto" });
                break;

            case "view-card":
                setLabel(label);

                gsap.to(cursorRef.current, { scale: 7, duration: 0.5, ease: "power3", overwrite: "auto" });
                gsap.to(labelRef.current, { opacity: 1, scale: 0.15, duration: 0 });
                break;

            case "hide":
                gsap.to(cursorRef.current, { opacity: 0, duration: 0.2, overwrite: "auto" });
                break;

            case "animated_circle":
                gsap.to(dotRef.current, { opacity: 0, scale: 0, duration: 0, overwrite: "auto" });
                gsap.to(badgeRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", overwrite: "auto" });

                break;

            default:
                break;
        }
    };

    const resetCursor = () => {
        if (!cursorRef.current) return;

        const type = activeTarget.current?.dataset?.cursor || "";

        switch (type) {
            case "textview":
                setBlend(false);
                break;

            case "view-card":
                setLabel("");
                gsap.to(labelRef.current, { opacity: 0, scale: 0, duration: 0 });
                break;

            case "hide":
                gsap.to(cursorRef.current, { opacity: 1, duration: 0.2 });
                break;

            case "animated_circle":
                gsap.to(badgeRef.current, { opacity: 0, scale: 0, duration: 0.5, overwrite: "auto" });
                gsap.to(dotRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)", overwrite: "auto" });
                return; // skip the generic scale reset below
        }

        gsap.to(cursorRef.current, { scale: 1, duration: 0.4, ease: "power3", overwrite: "auto" });
        activeTarget.current = null;
    };

    useEffect(() => {
        if (!cursorRef.current) return;

        gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
        gsap.set(badgeRef.current, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0 });

        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 1, ease: "back.out(1.4)" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 1, ease: "back.out(1.4)" });

        const badgeXTo = gsap.quickTo(badgeRef.current, "x", { duration: 1, ease: "back.out(1.4)" });
        const badgeYTo = gsap.quickTo(badgeRef.current, "y", { duration: 1, ease: "back.out(1.4)" });

        // Mouse move
        const onMove = (e: PointerEvent) => {
            lastMouse.current = { x: e.clientX, y: e.clientY };
            xTo(e.clientX);
            yTo(e.clientY);
            badgeXTo(e.clientX);
            badgeYTo(e.clientY);
        };

        // Pointer over
        const onPointerOver = (e: PointerEvent) => {
            const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
            if (!target) return;
            handleHover(target);
        };

        // Pointer out
        const onPointerOut = (e: PointerEvent) => {
            const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
            if (!target) return;
            resetCursor();
        };

        // Optimized scroll check
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const el = document.elementFromPoint(lastMouse.current.x, lastMouse.current.y) as HTMLElement | null;
                const newTarget = el?.closest("[data-cursor]") as HTMLElement | null;
                if (!newTarget && activeTarget.current) resetCursor();
                ticking = false;
            });
        };

        window.addEventListener("pointermove", onMove);
        document.addEventListener("pointerover", onPointerOver);
        document.addEventListener("pointerout", onPointerOut);
        window.addEventListener("scroll", onScroll, true);

        return () => {
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerover", onPointerOver);
            document.removeEventListener("pointerout", onPointerOut);
            window.removeEventListener("scroll", onScroll, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {/* Default dot cursor */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 size-7 rounded-full bg-transparent pointer-events-none z-9999 flex items-center justify-center"
            >
                <div ref={dotRef} className="size-2.5 rounded-full bg-white  flex items-center justify-center">
                    <p
                        ref={labelRef}
                        className="opacity-0 text-xs px-3 leading-snug whitespace-nowrap text-black"
                    /></div>
            </div>

            {/* CircleBadge cursor — shown on animated_circle hover */}
            <div
                ref={badgeRef}
                className="fixed top-0 left-0 pointer-events-none z-9999"
            >
                {/* <CircularBadge /> */}
            </div>
        </>
    );
};

export default DaynamicCursor;
