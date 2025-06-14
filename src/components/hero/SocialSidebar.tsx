
"use client";

import { Facebook, Twitter, Instagram } from 'lucide-react';

const SocialSidebar = () => {
  return (
    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 hidden md:block">
      <div className="flex flex-col space-y-3 bg-card/50 p-2 rounded-r-lg shadow-lg">
        <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
          <Facebook size={20} />
        </a>
        <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
          <Twitter size={20} />
        </a>
        <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
          <Instagram size={20} />
        </a>
      </div>
    </div>
  );
};

export default SocialSidebar;
