
"use client";

import Image from 'next/image';
import { Facebook, Instagram, Youtube, CreditCard, Star, Apple, Play } from 'lucide-react'; // Removed Pinterest

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63] text-white text-sm font-medium relative overflow-hidden">
      {/* Oceanic wave divider */}
      <div className="absolute top-0 left-0 w-full h-10 bg-[url('/wave-top.svg')] bg-cover bg-repeat-x opacity-20 z-0"></div>

      {/* Destinations */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-12 border-b border-teal-300/30 z-10 relative"> {/* Changed py-12 to pt-6 pb-12 */}
        <h3 className="text-2xl font-bold mb-6 text-[#aef0f4]">
          Explore top hotel destinations we love
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-6 mb-8">
          {[
            "Australia", "United States", "Indonesia", "Thailand", "United Kingdom", "Spain",
            "Malaysia", "Italy", "Portugal", "France", "New Zealand", "Mexico",
          ].map((country) => (
            <div key={country}>
              <div className="hover:text-[#d0f4f7] cursor-pointer transition duration-200">
                {country}
              </div>
              <div className="text-[#c8edf0cc] hover:text-white cursor-pointer text-xs">
                Hotels & Resorts
              </div>
            </div>
          ))}
        </div>
        <button className="border border-[#9fdde4] hover:bg-[#b6eef3]/10 rounded-full px-6 py-2 transition duration-200 text-[#b6eef3]">
          Show 69 countries
        </button>
      </div>

      {/* Trust & Reviews */}
      <div className="max-w-7xl mx-auto px-6 py-10 border-b border-teal-300/30 flex flex-col md:flex-row justify-between items-center gap-6 z-10 relative">
        <div className="flex items-center gap-3">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google"
            width={20}
            height={20}
            className="h-5 w-auto"
            data-ai-hint="google logo"
          />
          <span className="font-semibold text-lg text-white">4.7/5</span>
          <span className="text-[#c8edf0cc]">2.6k reviews</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="text-green-300 text-xl fill-green-300" /> {/* Placeholder for Trustpilot */}
          <span className="font-semibold">‘Excellent’</span>
          <span className="text-[#c8edf0cc]">10K reviews</span>
        </div>
        <div className="text-right">
          Trusted by <br />
          <span className="text-lg font-bold text-white">8 million members</span>
        </div>
      </div>

      {/* Social + Apps + Payment */}
      <div className="max-w-7xl mx-auto px-6 py-10 border-b border-teal-300/30 flex flex-col md:flex-row justify-between items-center gap-6 z-10 relative">
        <div className="flex gap-4 text-xl">
          <Facebook className="hover:text-blue-200 cursor-pointer" />
          <Instagram className="hover:text-pink-300 cursor-pointer" />
          <Youtube className="hover:text-red-300 cursor-pointer" />
          {/* Pinterest icon removed due to build error
          <Pinterest className="hover:text-red-300 cursor-pointer" /> 
          */}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center gap-2 bg-[#aef0f4] text-black px-4 py-2 rounded-xl shadow-lg shadow-[#0e3c47]/30 hover:bg-[#c3f7fa] transition">
            <Apple className="text-xl" />
            <div>
              <div className="text-xs font-medium">Free Download</div>
              <div className="font-semibold text-sm">App Store</div>
            </div>
          </button>
          <button className="flex items-center gap-2 bg-[#aef0f4] text-black px-4 py-2 rounded-xl shadow-lg shadow-[#0e3c47]/30 hover:bg-[#c3f7fa] transition">
            <Play className="text-xl" /> {/* Placeholder for Google Play */}
            <div>
              <div className="text-xs font-medium">Free Download</div>
              <div className="font-semibold text-sm">Google Play</div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4 text-[#b6eef3]">
          <CreditCard className="text-2xl" /> {/* Placeholder for Visa */}
          <CreditCard className="text-2xl" /> {/* Placeholder for Mastercard */}
          <CreditCard className="text-2xl" /> {/* Placeholder for Amex */}
          <span className="text-sm">Netbanking available</span>
        </div>
      </div>

      {/* Footer Links */}
      {/* Removed border-b border-teal-300/30 from this div */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm z-10 relative">
        <div>
          <h4 className="font-semibold mb-3 text-[#aef0f4] uppercase text-xs tracking-wide">
            LuxuryEscapes.com
          </h4>
          <ul className="space-y-2 text-[#c8edf0cc]">
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">About Us</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Best Price Guarantee</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Careers & Culture</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Become a Partner</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[#aef0f4] uppercase text-xs tracking-wide">Help</h4>
          <ul className="space-y-2 text-[#c8edf0cc]">
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Support</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Terms & Conditions</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Gift Cards</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Refund Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[#aef0f4] uppercase text-xs tracking-wide">
            Luxury Escapes Locations
          </h4>
          <ul className="space-y-2 text-[#c8edf0cc]">
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Melbourne</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Sydney</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Chadstone</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">London</li>
            <li className="hover:text-white hover:underline underline-offset-2 cursor-pointer">Singapore</li>
          </ul>
        </div>
      </div>

      {/* Logos + Copyright */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-between items-center text-xs text-[#c8edf0cc] z-10 relative">
        <div className="flex gap-4 items-center">
          {/* Ensure these logo paths are correct and images are in public/logos/ */}
          <Image src="/logos/iata.png" alt="IATA" width={50} height={24} className="h-6 w-auto" data-ai-hint="travel association logo" />
          <Image src="/logos/atia.png" alt="ATIA" width={50} height={24} className="h-6 w-auto" data-ai-hint="travel association logo" />
          <Image src="/logos/cato.png" alt="CATO" width={50} height={24} className="h-6 w-auto" data-ai-hint="travel association logo" />
          <Image src="/logos/award2024.png" alt="Award" width={50} height={24} className="h-6 w-auto" data-ai-hint="award logo" />
        </div>
        <div className="mt-4 md:mt-0">
          © 2017 - 2025 GrandeurNet. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
