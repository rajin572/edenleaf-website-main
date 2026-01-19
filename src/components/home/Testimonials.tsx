
"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Star } from "lucide-react";
import Container from "../ui/CustomUi/Container";
import { GradientSectionTitle } from "../ui/CustomUi/GradientSectionTitle";
import { useT } from "@/components/i18n/DictionaryProvider";

const wrap = (val: number, total: number) =>
    (((val % total) + total) % total) - total;

const MarqueeTrack = ({
    children,
    direction = 1,
    speed = 1.8,
}: {
    children: React.ReactNode;
    direction?: 1 | -1;
    speed?: number;
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const xRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const paused = useRef(false);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const totalWidth = track.scrollWidth / 3;

        const tick = (time: number) => {
            const delta = lastTimeRef.current ? time - lastTimeRef.current : 0;
            lastTimeRef.current = time;

            if (!paused.current) {
                const vel = direction * speed * (delta / 1000) * 60;
                xRef.current = wrap(xRef.current + vel, totalWidth);
                gsap.set(track, { x: xRef.current });
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [direction, speed]);

    return (
        <div
            className="overflow-hidden"
            onMouseEnter={() => {
                paused.current = true;
            }}
            onMouseLeave={() => {
                paused.current = false;
            }}
        >
            <div ref={trackRef} className="flex items-stretch">
                {children}
            </div>
        </div>
    );
};

const TestimonialCard = ({
    name,
    role,
    rating = 5,
    text,
}: {
    name: string;
    role: string;
    rating?: number;
    text: string;
}) => (
    <div className="shrink-0 w-72 sm:w-80 bg-surface rounded-2xl p-6 shadow-sm border border-border mx-3 flex flex-col gap-4">
        <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                <Image
                    src={`https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="40px"
                />
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
            </div>
        </div>
        <div className="flex gap-0.5">
            {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="text-yellow-400 w-4 h-4 fill-yellow-400" />
            ))}
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed flex-1">
            &ldquo;{text}&rdquo;
        </p>
    </div>
);

const Testimonials = () => {
    const t = useT();
    const reviews = t.testimonials.reviews;

    const half = Math.ceil(reviews.length / 2);
    const row1 = reviews.slice(0, half);
    const row2 = reviews.slice(half);

    return (
        <section id="testimonials" className="py-8 md:py-12 overflow-hidden relative bg-surface/30">
            <Container>
                <GradientSectionTitle
                    title={t.testimonials.title}
                />
            </Container>
            <section className="mt-8 relative">
                <div className="flex flex-col gap-6">
                    <MarqueeTrack direction={1} speed={0.5}>
                        {[...row1, ...row1, ...row1].map((item, i) => (
                            <TestimonialCard key={`r1-${i}`} {...item} />
                        ))}
                    </MarqueeTrack>

                    <MarqueeTrack direction={-1} speed={0.5}>
                        {[...row2, ...row2, ...row2].map((item, i) => (
                            <TestimonialCard key={`r2-${i}`} {...item} />
                        ))}
                    </MarqueeTrack>
                </div>
                <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
                <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
            </section>
        </section>
    );
};

export default Testimonials;

