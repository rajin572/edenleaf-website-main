"use client";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Tab<T extends string> = {
  label: string;
  value: T;
  disabled?: boolean;
  content: React.ReactNode;
};

type ReusableTabsProps<T extends string> = {
  tabs: Tab<T>[];
  activeTab: T;
  align?: "left" | "center" | "right";
  resetPage?: boolean;
  tabContentStyle?: string;
  tabName?: string;
  variant?: "default" | "bordered";
};

const ReusableTabs = <T extends string>({
  tabs,
  activeTab,
  align = "center",
  resetPage = false,
  tabContentStyle = "",
  tabName = "tab",
  variant = "default",
}: ReusableTabsProps<T>) => {
  const tabRowRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ offset: 0, width: 0 });
  // Per-tab clip-path inset (in px, from that tab's own left/right edges) describing
  // exactly how much of its white text overlay is hidden. Only the slice the pill is
  // currently over is left visible — so the wipe follows the pill pixel-for-pixel
  // instead of the whole label flipping white the moment any overlap starts.
  const [textClips, setTextClips] = useState<Record<string, { left: number; right: number }>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition(); // 2. Initialize transition

  // Breathing room around the tight text measurement — also doubles as a safety
  // margin against tiny width mismatches (e.g. a web font swapping in after the
  // first measurement), so a stale measurement clips into padding, not a letter.
  const PILL_PADDING_X = 8;

  const updateIndicator = (target: HTMLElement) => {
    const tabBounds = target.getBoundingClientRect();
    const rowBounds = tabRowRef.current?.getBoundingClientRect();

    if (rowBounds && indicatorRef.current && tabRowRef.current) {
      // Add scrollLeft to account for horizontal scroll
      const offset = tabBounds.left - rowBounds.left + tabRowRef.current.scrollLeft - PILL_PADDING_X;
      const width = tabBounds.width + PILL_PADDING_X * 2;

      setIndicatorStyle({ offset, width });
    }
  };

  // Runs on every animation frame while the pill slides — computes, per tab, exactly
  // how much of its label the pill's current bounds overlap, live.
  const handleIndicatorUpdate = (pillLeft: number, pillWidth: number) => {
    const row = tabRowRef.current;
    if (!row) return;

    const pillRight = pillLeft + pillWidth;
    const rowBounds = row.getBoundingClientRect();

    const next: Record<string, { left: number; right: number }> = {};
    row.querySelectorAll<HTMLElement>("[tab-value]").forEach((el) => {
      const bounds = el.getBoundingClientRect();
      const tabLeft = bounds.left - rowBounds.left + row.scrollLeft;
      const tabRight = tabLeft + bounds.width;
      const value = el.getAttribute("tab-value") ?? "";

      const overlapLeft = Math.max(tabLeft, pillLeft);
      const overlapRight = Math.min(tabRight, pillRight);

      next[value] = overlapRight > overlapLeft
        ? { left: overlapLeft - tabLeft, right: tabRight - overlapRight } // visible slice
        : { left: bounds.width, right: 0 }; // no overlap — fully hidden
    });

    setTextClips(next);
  };

  useEffect(() => {
    const measureActiveTab = () => {
      const activeTabElement = document.querySelector(
        `[tab-value="${activeTab}"]`
      );
      if (activeTabElement) {
        updateIndicator(activeTabElement as HTMLElement);
      }
    };

    measureActiveTab();

    // Local web fonts (Graphik/Cagliari) can swap in after this first paint —
    // re-measure once they're actually loaded so the tight text width is accurate.
    document.fonts?.ready?.then(measureActiveTab);

    const tabRowElement = tabRowRef.current;

    window.addEventListener('resize', measureActiveTab);
    tabRowElement?.addEventListener('scroll', measureActiveTab);

    return () => {
      window.removeEventListener('resize', measureActiveTab);
      tabRowElement?.removeEventListener('scroll', measureActiveTab);
    };
  }, [activeTab]);

  // Mirrors framer-motion's `initial={false}`: the very first placement of the
  // pill is instant (no slide-in from 0), only subsequent moves are tweened.
  const didPlaceIndicatorRef = useRef(false);

  useGSAP(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const targetX = indicatorStyle.offset - 4;
    const targetWidth = indicatorStyle.width;

    if (!didPlaceIndicatorRef.current) {
      didPlaceIndicatorRef.current = true;
      gsap.set(indicator, { x: targetX, width: targetWidth });
      handleIndicatorUpdate(targetX, targetWidth);
      return;
    }

    gsap.to(indicator, {
      x: targetX,
      width: targetWidth,
      duration: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        handleIndicatorUpdate(
          gsap.getProperty(indicator, "x") as number,
          gsap.getProperty(indicator, "width") as number
        );
      },
    });
  }, { dependencies: [indicatorStyle], scope: tabRowRef });

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const { replace } = router;

  const justifyClass =
    align === "left"
      ? "justify-start"
      : align === "right"
        ? "justify-end"
        : "justify-center";

  // Only pushes the new URL — the pill itself only ever moves in response to the
  // `activeTab` prop actually changing (see the effect above), so it never shows
  // a tab that isn't truly confirmed active yet.
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(tabName, value);
      if (resetPage) {
        params.set("page", "1");
        params.delete("search");
      }
    } else {
      params.delete(tabName);
    }

    startTransition(() => {
      replace(`${pathName}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="w-full h-fit pt-2 overflow-hidden">
      <div className={`w-full flex ${justifyClass}`}>
        <div
          ref={tabRowRef}
          className={`scrollbar-thin scrollbar-thumb-[#8B48FB] scrollbar-track-gray-200 hover:scrollbar-thumb-[#8B48FB55] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.1)]  ${variant === "bordered" ? " p-1 rounded-xl flex gap-2 relative overflow-x-auto"
            : "bg-[#ffffff]  p-1 rounded-xl flex gap-2 relative overflow-x-auto"}`}
        >
          {tabs.map((tab) => {
            const clip = textClips[tab.value];

            return (
              <button
                key={tab.value}
                disabled={tab.disabled || false}
                onClick={() => handleTabChange(tab.value)}
                className="px-4 z-10 py-1.5 rounded-md bg-transparent font-medium text-sm sm:text-base transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-nowrap"
              >
                {/* tab-value sits on the text itself (not the padded button) so the
                    pill measures and hugs only the label — no extra padding around it. */}
                {variant === "bordered" ? (
                  <span
                    tab-value={tab.value}
                    className={activeTab === tab.value ? "text-[#8B48FB]" : "text-[#707070]"}
                  >
                    {tab.label}
                  </span>
                ) : (
                  <span tab-value={tab.value} className="relative inline-block">
                    {/* Base layer — always the plain purple label */}
                    <span className="text-[#8B48FB]">{tab.label}</span>
                    {/* Overlay — white copy, clipped to only the slice the pill currently covers */}
                    <span
                      className="absolute inset-0 text-white pointer-events-none"
                      style={{
                        clipPath: clip
                          ? `inset(0 ${clip.right}px 0 ${clip.left}px)`
                          : "inset(0 100% 0 0)",
                      }}
                    >
                      {tab.label}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
          <div
            ref={indicatorRef}
            className={`${variant === "bordered" ? "indicator absolute bottom-1 top-1 border-b-2 border-secondary-color z-0" : "indicator absolute bottom-1 top-1 rounded-md bg-secondary-color z-0"} `}
          />
        </div>
      </div>

      <div className={cn("mt-10", tabContentStyle)}>
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  );
};

export default ReusableTabs;
