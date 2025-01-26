"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
const ProductImages = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <div className="space-y-4">
      <Image
        src={images[currentIndex]}
        alt="current product image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
      />
      <div className="flex gap-2">
        {images.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "border cursor-pointer hover:border-orange-600",
              index === currentIndex && "border-orange-500"
            )}
          >
            <Image src={image} alt={image} width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
