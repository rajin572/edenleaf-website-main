"use client"
import { usePathname } from "next/navigation";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const currentLocation = usePathname();

    const stairParentRef = useRef(null);
    const childRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.to(stairParentRef.current, {
            display: "block",
        });

        tl.from(".stairing", {
            height: 0,
            stagger: {
                amount: -0.25,
            },
        });

        tl.to(".stairing", {
            y: "100%",
            stagger: {
                amount: -0.25,
            },
        });

        tl.to(stairParentRef.current, {
            display: "none",
        });

        tl.to(".stairing", {
            y: "0%",
        });

        gsap.from(childRef.current, {
            opacity: 0,
            delay: 1.2,
        });
    }, [currentLocation]);

    return (
        <div>
            <div
                ref={stairParentRef}
                className="h-screen w-full fixed overflow-hidden z-999999! "
            >
                <div className="h-full w-full flex">
                    <div className="stairing h-full w-1/5 bg-secondary"></div>
                    <div className="stairing h-full w-1/5 bg-secondary"></div>
                    <div className="stairing h-full w-1/5 bg-secondary"></div>
                    <div className="stairing h-full w-1/5 bg-secondary"></div>
                    <div className="stairing h-full w-1/5 bg-secondary"></div>
                </div>
            </div>
            <div ref={childRef}>{children}</div>
        </div>
    );
};

export default PageTransition;
