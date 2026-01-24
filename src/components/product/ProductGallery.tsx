"use client";

import { useState } from "react";
import Image from "next/image";
import { useT } from "@/components/i18n/DictionaryProvider";
import { format } from "@/i18n/config";
import { ImagePreview } from "@/components/ui/CustomUi/ReuseImagePreview";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const ProductGallery = ({ images, name }: ProductGalleryProps) => {
  const t = useT();
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2 md:w-20 overflow-x-auto md:overflow-visible scrollbar-none">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={format(t.product.viewImage, { index: index + 1 })}
            aria-pressed={activeImage === image}
            onClick={() => setActiveImage(image)}
            className={`shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 rounded-md overflow-hidden ${
              activeImage === image
                ? "border-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Image
              src={image}
              alt=""
              aria-hidden
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="grow aspect-square relative border border-border rounded-lg overflow-hidden bg-card">
        <ImagePreview
          src={activeImage}
          alt={name}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
};

export default ProductGallery;
