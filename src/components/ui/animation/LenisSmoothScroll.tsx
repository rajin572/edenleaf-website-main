"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ReactLenis, LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

const LenisSmoothScroll = () => {
    const lenisRef = useRef<LenisRef>(null);

    useEffect(() => {
        function update(time: number) {
            lenisRef.current?.lenis?.raf(time * 500);
        }

        gsap.ticker.add(update);

        ScrollTrigger.refresh();

        return () => gsap.ticker.remove(update);
    }, []);

    return <ReactLenis root options={{ autoRaf: false, duration: 1.2 }} ref={lenisRef} />;
};

export default LenisSmoothScroll;