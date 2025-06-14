
"use client";

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, LogInIcon, UserPlusIcon, LogOutIcon, HomeIcon, HotelIcon, PlaneIcon, BriefcaseIcon, StarIcon, MapIcon, LifeBuoyIcon, GemIcon } from 'lucide-react'; // Added more icons
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon; // Made icon optional to match header's navItems
}

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentUser: CurrentUser | null;
  userSpecificLinks: NavItem[];
  hotelOwnerLinks: NavItem[];
  superAdminLinks: NavItem[];
  onLogout: () => void;
}

const iconMap: { [key: string]: LucideIcon } = {
    'Home': HomeIcon,
    'Hotels': HotelIcon,
    'Flights': PlaneIcon,
    'Tours & Cruises': MapIcon,
    'Ultra Lux': GemIcon,
    'Inspiration': LifeBuoyIcon,
};


export function Sidebar({ 
    isOpen, 
    onClose, 
    navItems, 
    currentUser, 
    userSpecificLinks, 
    hotelOwnerLinks, 
    superAdminLinks, 
    onLogout 
}: SidebarProps) {

  const NavLinkButton = ({ href, children, icon: Icon, currentPath }: { href: string; children: React.ReactNode; icon?: React.ElementType; currentPath?: string }) => (
    <Button variant="ghost" asChild className="w-full justify-start text-base py-3 text-gray-700 hover:bg-gray-100 hover:text-[#005aa7]" onClick={onClose}>
      <Link href={href}>
        {Icon && <Icon className="mr-3 h-5 w-5" />}
        {children}
      </Link>
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[300px] p-0 pt-0 flex flex-col bg-white text-[#1a1a1a]">
        <SheetHeader className="px-4 py-3 border-b border-gray-200 flex flex-row justify-between items-center">
          <SheetTitle className="text-left">
            <Link href="/" className="text-xl font-bold tracking-tight" onClick={onClose}>
              <span className="text-black">LUXURY</span>
              <span className="text-black font-extrabold">ESCAPES</span>
            </Link>
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="text-[#555] hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-1">
          {navItems.map(item => (
            <NavLinkButton key={item.to} href={item.to} icon={iconMap[item.label] || BriefcaseIcon}>
              {item.label}
            </NavLinkButton>
          ))}

          {currentUser && (
            <>
              <Separator className="my-3 bg-gray-200" />
              {userSpecificLinks.map(link => (
                <NavLinkButton key={link.to} href={link.to} icon={link.icon}>
                    {link.label}
                </NavLinkButton>
              ))}
              
              <Separator className="my-3 bg-gray-200" />
              <div className="px-2 py-1.5">
                  <p className="text-sm font-medium leading-none text-[#1a1a1a]">{currentUser.fullName}</p>
                  <p className="text-xs leading-none text-[#555] mt-1">
                    {currentUser.email}
                  </p>
                  <p className="text-xs leading-none text-[#555] mt-1 capitalize">
                    Role: {currentUser.role.replace('_', ' ')}
                  </p>
              </div>

              {currentUser.role === 'hotel_owner' && hotelOwnerLinks.length > 0 && (
                <>
                  <Separator className="my-3 bg-gray-200" />
                  <p className="px-2 pt-2 pb-1 text-xs font-semibold text-[#555]">Hotel Owner</p>
                  {hotelOwnerLinks.map(link => (
                     <NavLinkButton key={link.to} href={link.to} icon={link.icon}>
                        {link.label}
                    </NavLinkButton>
                  ))}
                </>
              )}

              {currentUser.role === 'super_admin' && superAdminLinks.length > 0 && (
                <>
                  <Separator className="my-3 bg-gray-200" />
                  <p className="px-2 pt-2 pb-1 text-xs font-semibold text-[#555]">Super Admin</p>
                  {superAdminLinks.map(link => (
                    <NavLinkButton key={link.to} href={link.to} icon={link.icon}>
                        {link.label}
                    </NavLinkButton>
                  ))}
                </>
              )}
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 mt-auto space-y-2">
          {currentUser ? (
              <Button variant="outline" className="w-full justify-start text-base py-3 border-red-500 text-red-600 hover:bg-red-50" onClick={() => { onLogout(); onClose(); }}>
                  <LogOutIcon className="mr-3 h-5 w-5" />Log out
              </Button>
          ) : (
              <>
                  <NavLinkButton href="/login" icon={LogInIcon}>Log In</NavLinkButton>
                  <NavLinkButton href="/signup" icon={UserPlusIcon}>Sign Up</NavLinkButton>
              </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
