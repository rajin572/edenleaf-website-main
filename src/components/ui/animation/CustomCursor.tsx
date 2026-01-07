"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

/**
 * DynamicCursor — mask-style GSAP cursor
 *
 * Add data attributes to any element to trigger cursor states:
 *
 *  data-cursor="hover"                          → dot scales up
 *  data-cursor="view"  data-cursor-label="OPEN" → circle mask expands + shows label
 *  data-cursor="hide"                           → cursor hidden
 */

export default function DynamicCursor() {
    const [cursorLabel, setCursorLabel] = useState("");
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorWrapperRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Let GSAP own all transforms — no Tailwind translate conflict
        gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.2, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.2, ease: "power3" });

        const onMove = (e: MouseEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        const onOver = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
            if (!target) return;

            // Coming from a child within the same element — already expanded, skip
            const related = e.relatedTarget as HTMLElement | null;
            if (related && target.contains(related)) return;

            const type = target.dataset.cursor;
            const label = target.dataset.cursorLabel ?? "";

            if (type === "hover") {
                // Pure mask — white circle expands, no label
                gsap.to(cursorWrapperRef.current, {
                    clipPath: "circle(50% at 50% 50%)",
                    duration: 0.5,
                    ease: "power3.out",
                    overwrite: true,
                });
            } else if (type === "view") {
                // Mask + label text
                setCursorLabel(label);
                gsap.to(cursorWrapperRef.current, {
                    clipPath: "circle(50% at 50% 50%)",
                    duration: 0.5,
                    ease: "power3.out",
                    overwrite: true,
                });
                gsap.to(".dc-label", { opacity: 1, duration: 0.25, delay: 0.2, overwrite: true });
            } else if (type === "hide") {
                gsap.to(cursorRef.current, { opacity: 0, duration: 0.2, overwrite: true });
            }
        };

        const onOut = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
            if (!target) return;

            // Still inside the same data-cursor element (moving between children) — ignore
            const related = e.relatedTarget as HTMLElement | null;
            if (related && target.contains(related)) return;

            const type = target.dataset.cursor;

            if (type === "hover") {
                gsap.to(cursorWrapperRef.current, {
                    clipPath: "circle(0% at 50% 50%)",
                    duration: 0.4,
                    ease: "power3.in",
                    overwrite: true,
                });
            } else if (type === "view") {
                gsap.to(".dc-label", { opacity: 0, duration: 0.1, overwrite: true });
                gsap.to(cursorWrapperRef.current, {
                    clipPath: "circle(0% at 50% 50%)",
                    duration: 0.4,
                    ease: "power3.in",
                    overwrite: true,
                    onComplete: () => setCursorLabel(""),
                });
            } else if (type === "hide") {
                gsap.to(cursorRef.current, { opacity: 1, duration: 0.2, overwrite: true });
            }
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseover", onOver);
        window.addEventListener("mouseout", onOut);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mouseout", onOut);
        };
    });

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 size-3.5 rounded-full bg-white pointer-events-none z-9999 flex items-center justify-center"
            style={{ willChange: "transform", mixBlendMode: "difference" }}
        >
            {/* Mask circle — expands on data-cursor="hover" or "view" */}
            <div
                ref={cursorWrapperRef}
                className="absolute size-36 rounded-full bg-white flex items-center justify-center overflow-hidden text-center font-semibold"
                style={{ clipPath: "circle(0% at 50% 50%)", willChange: "clip-path" }}
            >
                <p className="dc-label opacity-0 text-xs px-3 leading-snug select-none">
                    {cursorLabel}
                </p>
            </div>
        </div>
    );
}

//* Expands circle mask with label
// <div data-cursor="view" data-cursor-label="Open">...</div>

//* Scales the dot up
// <div data-cursor="hover">...</div>

//* Hides the cursor
// <div data-cursor="hide">...</div>
