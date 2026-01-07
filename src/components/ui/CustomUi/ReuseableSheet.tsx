"use client";

import React, { useCallback, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../sheet";

interface ReusableSheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement;
    title: string | React.ReactNode;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    side?: "right" | "left" | "top" | "bottom";
    width?: string;
}

function ReusableSheet({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    footer,
    side = "right",
    width = "sm:max-w-md",
}: ReusableSheetProps) {

    // ── 1. Lock body scroll whenever the sheet is open ──────────────────────
    // @base-ui/react/dialog does NOT lock body scroll by default.
    // Without this, mouse-wheel events still reach <body> and scroll the page.
    useEffect(() => {
        if (!open) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // ── 2. Trap wheel events inside the scroll container ────────────────────
    // useCallback ref fires the moment the node is actually attached to the DOM
    // (unlike useRef + useEffect which can miss the initial mount in portals).
    const scrollRefCallback = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;

        const handleWheel = (e: WheelEvent) => {
            // Always stop the event from reaching <body>
            e.stopPropagation();

            const { scrollTop, scrollHeight, clientHeight } = node;
            const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;
            const canScrollUp = scrollTop > 0;

            // If content is not scrollable, or we're at the boundary — block
            if (
                (e.deltaY < 0 && !canScrollUp) ||
                (e.deltaY > 0 && !canScrollDown)
            ) {
                e.preventDefault();
            }
        };

        node.addEventListener("wheel", handleWheel, { passive: false });

        // Cleanup when node unmounts (portal teardown)
        const cleanup = () => node.removeEventListener("wheel", handleWheel);
        node.addEventListener("unmount", cleanup, { once: true });
    }, []);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger render={trigger} />}

            <SheetContent side={side} className={`${width} flex flex-col p-0`}>
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
                    <SheetTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-color!">
                        {title}
                    </SheetTitle>
                    {description && (
                        <SheetDescription>{description}</SheetDescription>
                    )}
                </SheetHeader>

                <div
                    ref={scrollRefCallback}
                    className="flex-1 overflow-y-auto px-6 py-5"
                >
                    {children}
                </div>

                {footer && (
                    <SheetFooter className="px-6 pb-6 pt-2 border-t border-border flex-shrink-0">
                        {footer}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default ReusableSheet;
