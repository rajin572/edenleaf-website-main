"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import LocaleLink from '@/components/i18n/LocaleLink';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IMAGES = [
    "https://bzm-graphics-2026.vercel.app/portfolio/bb-mascara-01.png",
    "https://bzm-graphics-2026.vercel.app/portfolio/smakk-raquel.jpg",
    "https://bzm-graphics-2026.vercel.app/portfolio/floof-hero.png",
    "https://bzm-graphics-2026.vercel.app/portfolio/aziza-and-chineze.jpg",
    "https://bzm-graphics-2026.vercel.app/portfolio/veggie-loops.webp",
    "https://bzm-graphics-2026.vercel.app/video/work-cycle.gif",
];

export default function HorizontalScroll() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const section = sectionRef.current;
            const container = containerRef.current;
            if (!section || !container) return;

            const cards = gsap.utils.toArray<HTMLElement>(".scroll-card");

            // totalScroll: push until last card fully exits left side of screen
            const totalScroll = container.scrollWidth - window.innerWidth;
            // const totalScroll = container.scrollWidth - (window.innerWidth - container.offsetWidth);

            const scrollTrack = gsap.to(container, {
                x: -totalScroll,
                duration: totalScroll,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => `+=${totalScroll}`,
                    scrub: true,
                    pin: true,
                    anticipatePin: 1,
                },
            });

            cards.forEach((card) => {
                gsap.fromTo(
                    card,
                    { opacity: 0.7, y: "50%", scale: 0.8 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "left 95%",
                            end: "center 90%",
                            scrub: true,
                            containerAnimation: scrollTrack,
                        },
                    }
                );
            });
        },
        { scope: sectionRef }
    );

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden w-full h-screen"
            style={{ background: "inherit" }}
        >
            <div
                ref={containerRef}
                className="flex flex-nowrap items-center h-full w-full"
                style={{ willChange: "transform" }}
            >
                {IMAGES.map((src, i) => (
                    <LocaleLink
                        href={src}
                        target="_blank"
                        data-cursor-label={`Visit site `}
                        data-cursor="view-card"
                        key={i}
                        className="scroll-card flex-none w-screen md:w-[50vw] h-full opacity-0"
                        style={{ willChange: "transform, opacity" }}
                    >
                        <Image
                            width={1000}
                            height={1000}
                            src={src}
                            alt={`Card ${i + 1}`}
                            sizes="(max-width: 768px) 50vw, 100vw"
                            className="w-full h-full object-cover"
                            draggable={false}
                            fetchPriority="high"
                            priority
                        />
                    </LocaleLink>
                ))}
            </div>
        </section>
    );
}