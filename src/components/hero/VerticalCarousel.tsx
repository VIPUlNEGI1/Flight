
"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Changed to next/image
import { cn } from "@/lib/utils";

const carouselImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    alt: "Tropical Beach",
    hint: "tropical beach"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    alt: "Luxury Hotel Pool", // Changed alt to be more descriptive
    hint: "hotel pool"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    alt: "Forest Path",
    hint: "forest path"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    alt: "Sunlight Forest", // Changed alt
    hint: "sunlight forest"
  }
];

const VerticalCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col space-y-4 p-4">
      {carouselImages.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            "relative overflow-hidden rounded-lg cursor-pointer transition-all duration-500",
            index === activeIndex
              ? 'w-48 h-32 scale-105 shadow-2xl border-4 border-primary' // Use primary color for border
              : 'w-40 h-24 hover:scale-102 opacity-80 hover:opacity-100'
          )}
          onClick={() => setActiveIndex(index)}
        >
          <Image
            src={image.src}
            alt={image.alt}
            layout="fill" // Use layout fill
            objectFit="cover" // Use objectFit
            className="transition-transform duration-500 hover:scale-110"
            data-ai-hint={image.hint} // Added data-ai-hint
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

          {index === activeIndex && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full shadow-lg animate-pulse"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VerticalCarousel;

    