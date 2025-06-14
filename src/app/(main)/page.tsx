
import HeroSection from "@/components/hero/HeroSection";
// HotelSearchForm import removed as the section is being removed
// import { HotelSearchForm } from "@/components/forms/hotel-search-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { HotelIcon } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      
      {/* The "Find Your Perfect Stay" section below has been removed. */}
      
      <Separator className="my-8 md:my-12" />

      {/* Placeholder for other content sections if needed later */}
      {/* 
        Example:
        <section className="py-12 md:py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">Explore Destinations</h2>
            <p className="text-muted-foreground mb-8">Discover amazing places around the world.</p>
            <Button asChild size="lg">
              <Link href="/inspiration">Get Inspired</Link>
            </Button>
          </div>
        </section> 
      */}
    </>
  );
}
