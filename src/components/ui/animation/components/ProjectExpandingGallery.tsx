"use client";

import { useState } from "react";
import Image from "next/image";

const galleryItems = [
    {
        src: "https://images.unsplash.com/photo-1633885274964-d5a5d914bcb3?q=80&w=687&auto=format&fit=crop",
        alt: "Abstract Art",
        title: "Abstract Art",
        description: "Explore vibrant colors and modern geometric designs",
    },
    {
        src: "https://images.unsplash.com/photo-1589194837807-30a2f9540ad9?q=80&w=687&auto=format&fit=crop",
        alt: "Nature Photography",
        title: "Nature Photography",
        description: "Breathtaking landscapes and natural wonders",
    },
    {
        src: "https://images.unsplash.com/photo-1582644826651-f71401f0f3f6?q=80&w=687&auto=format&fit=crop",
        alt: "Urban Design",
        title: "Urban Design",
        description: "Modern architecture and city life captured beautifully",
    },
    {
        src: "https://images.unsplash.com/photo-1614679967638-fe153775eff6?q=80&w=765&auto=format&fit=crop",
        alt: "Creative Workspace",
        title: "Creative Workspace",
        description: "Inspiring workspaces for creative professionals",
    },
    {
        src: "https://images.unsplash.com/photo-1617195737496-bc30194e3a19?q=80&w=735&auto=format&fit=crop",
        alt: "Digital Innovation",
        title: "Digital Innovation",
        description: "The future of technology and creative tools",
    },
];

const ProjectExpandingGallery = () => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const isAnyExpanded = expandedIndex !== null;

    const getColumnFlex = (index: number) => {
        if (isAnyExpanded) return expandedIndex === index ? 3 : 0.5;
        if (hoveredIndex !== null) return hoveredIndex === index ? 3 : 0.5;
        return 1;
    };

    const handleClick = (index: number) => {
        setExpandedIndex((prev) => (prev === index ? null : index));
    };

    const isOverlayVisible = (index: number) =>
        expandedIndex === index || (expandedIndex === null && hoveredIndex === index);

    const isMobileExpanded = (index: number) => expandedIndex === index;

    return (
        <div className="w-full max-w-3xl mx-auto p-5">
            <div className="flex max-md:flex-col gap-3 h-112.5 max-md:h-auto overflow-hidden">
                {galleryItems.map((item, index) => (
                    <div
                        key={index}
                        className={[
                            "group relative cursor-pointer overflow-hidden rounded-3xl",
                            "max-md:flex-none max-md:transition-[height] max-md:duration-800 max-md:ease-in-out",
                            isMobileExpanded(index) ? "max-md:h-87.5" : "max-md:h-30",
                            "transition-[flex] duration-800 ease-in-out",
                        ].join(" ")}
                        style={{ flex: getColumnFlex(index) }}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Image */}
                        <div className="relative w-full h-full overflow-hidden rounded-3xl">
                            <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                fetchPriority="high"
                                priority
                                sizes="(max-width: 768px) 50vw, 100vw"
                                className="object-cover object-center rounded-3xl transition-transform duration-800 ease-in-out group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div
                                className={[
                                    "absolute bottom-0 left-0 right-0 px-5 py-7.5",
                                    "bg-[linear-gradient(to_top,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.12)_40%,transparent_100%)]",
                                    "transition-[transform,opacity] duration-800 ease-in-out",
                                    isOverlayVisible(index)
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-full opacity-0",
                                ].join(" ")}
                            >
                                <h3 className="mb-2 font-mono text-[22px] font-bold text-white truncate">
                                    {item.title}
                                </h3>
                                <p className="font-mono text-sm font-normal leading-relaxed text-white line-clamp-2">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectExpandingGallery;
