
"use client";

import VerticalCarousel from "./VerticalCarousel";
import SocialSidebar from "./SocialSidebar";
import PlacesGallery from './PlacesGallery';
import { FlightBooking } from "@/components/forms/FlightBooking";

const HeroSection = () => {
  return (
    <>
      <div className="relative h-[600px] flex items-center">
        {/* Background Gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0e3c47, #136f63, #1a5f7a)'
        }}></div>

        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://static.coral.org/uploads/2024/06/4-Blog-Why-Clean-Water-is-Vital-for-the-Future-of-Our-Oceans.jpg')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63] opacity-50"></div>
        </div>

        <SocialSidebar />

        {/* Main Content: FlightBooking on left, VerticalCarousel on right */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 flex items-center justify-between w-full">
          {/* Left Side container for FlightBooking, allowing it to be positioned by its wrapper */}
          <div className="flex-1"> {/* Occupies available space, pushing carousel to right */}
            <div className="relative w-full max-w-5xl mx-auto"> {/* Centering and max-width for the content area of form */}
              {/* This div absolutely positions the FlightBooking form */}
              <div className="absolute -top-52 left-1/2 transform -translate-x-1/2 z-20 w-full px-2 sm:px-0">
                <FlightBooking />
              </div>
            </div>
          </div>

          {/* Right Side - Vertical Carousel */}
          <div className="hidden lg:flex justify-end ml-8"> {/* ml-8 for spacing from form area */}
            <VerticalCarousel />
          </div>
        </div>
      </div>

      {/* Bottom Places Gallery (ensure it's not overlapped too much) */}
      <div className="relative z-0"> {/* z-0 to be behind form if form is very tall */}
        <PlacesGallery />
      </div>
    </>
  );
};

export default HeroSection;
