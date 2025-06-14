
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Phone, Heart, ChevronDown, Search as SearchIcon, LogInIcon, UserPlusIcon, LogOutIcon, UserCircle, BriefcaseIcon, LayoutDashboard, ListChecksIcon, ListOrdered, DollarSign, UsersIcon, ShieldCheckIcon, FileCheckIcon, Trash2Icon, LineChartIcon, HotelIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from './Sidebar'; // New Sidebar component

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Hotels', to: '/hotels/search' }, 
  { label: 'Flights', to: '/flights/search' }, 
  { label: 'Tours & Cruises', to: '/tours' },
  { label: 'Ultra Lux', to: '/ultra-lux' },
  { label: 'Inspiration', to: '/inspiration' },
];

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadUser = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setCurrentUser(userObj);
        } catch (e) {
          console.error("Header: Failed to parse currentUser from localStorage", e);
          localStorage.removeItem("currentUser");
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    loadUser();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "currentUser") loadUser();
    };
    const handleAuthChange = () => loadUser();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isClient, pathname, loadUser]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      window.dispatchEvent(new CustomEvent('authChange'));
    }
    setCurrentUser(null);
    setSidebarOpen(false);
    router.push('/');
    router.refresh();
  };

  const commonNavLinks = navItems;
  const userSpecificLinks = currentUser ? [
    { label: 'Saved', to: '/saved', icon: Heart },
    { label: 'My Bookings', to: '/my-bookings', icon: ListChecksIcon },
  ] : [];
  
  const hotelOwnerLinks = currentUser?.role === 'hotel_owner' ? [
    { label: 'Analytics', to: '/hotel-owner/dashboard', icon: LayoutDashboard },
    { label: 'Register Hotel', to: '/hotel-owner/register-hotel', icon: HotelIcon },
    { label: 'My Hotels', to: '/hotel-owner/my-hotels', icon: ListChecksIcon },
    { label: 'Manage Bookings', to: '/hotel-owner/manage-bookings', icon: ListOrdered },
    { label: 'Earnings', to: '/hotel-owner/earnings', icon: DollarSign },
  ] : [];

  const superAdminLinks = currentUser?.role === 'super_admin' ? [
    { label: 'Overview', to: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Platform Hotels', to: '/super-admin/manage-platform-hotels', icon: HotelIcon },
    { label: 'Manage Users', to: '/super-admin/manage-users', icon: UsersIcon },
    { label: 'Approve Hotels', to: '/super-admin/approve-hotels', icon: FileCheckIcon },
    { label: 'Remove Listings', to: '/super-admin/remove-listings', icon: Trash2Icon },
    { label: 'Revenue Reports', to: '/super-admin/revenue-reports', icon: LineChartIcon },
  ] : [];


  return (
    <div className="relative border-b border-gray-200 text-[#1a1a1a] bg-white">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        navItems={commonNavLinks}
        currentUser={currentUser}
        userSpecificLinks={userSpecificLinks}
        hotelOwnerLinks={hotelOwnerLinks}
        superAdminLinks={superAdminLinks}
        onLogout={handleLogout}
      />

      {sidebarOpen && isClient && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex justify-between items-center text-sm px-4 py-1 text-[#555]">
        <div className="flex gap-4">
          <span>Google 4.7/5</span>
          <span>·</span>
          <span>Trustpilot 4.8/5</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer">
          <span>Contact us 7 days</span>
          <Phone className="text-xs" />
          <span className="font-medium">+91 803 783 5334</span>
          <ChevronDown className="text-base" />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="text-2xl text-[#1a1a1a] cursor-pointer" />
          </button>
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-black">LUXURY</span>
            <span className="text-black font-extrabold">ESCAPES</span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-6 hidden md:flex items-center bg-[#f2f2f2] rounded-md px-4 py-2">
          <SearchIcon className="text-gray-500 w-5 h-5 mr-2" />
          <input
            type="text"
            placeholder="Search our exclusive travel offers"
            className="bg-transparent w-full focus:outline-none text-sm placeholder:text-[#333]"
          />
        </div>

        <div className="items-center gap-3 text-sm hidden md:flex">
          <div className="flex items-center gap-1 cursor-pointer">
            <span role="img" aria-label="flag">🇮🇳</span>
            <span>INR</span>
            <ChevronDown className="text-base" />
          </div>
          <Link href="/saved" className="flex items-center gap-1 text-[#1a1a1a] hover:text-[#005aa7]" aria-label="Trip Plans">
            <Heart className="text-lg" />
            <span className="hidden lg:inline">Trip Plans</span>
          </Link>

          {isClient && currentUser ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                   <UserCircle className="h-7 w-7 text-[#1a1a1a]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 bg-white border-gray-200 shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-[#1a1a1a]">{currentUser.fullName}</p>
                    <p className="text-xs leading-none text-[#555]">
                      {currentUser.email}
                    </p>
                     <p className="text-xs leading-none text-[#555] capitalize pt-1">
                      Role: {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200"/>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100">
                    <Link href="/my-bookings" className="flex items-center w-full px-3 py-2 text-[#1a1a1a]">
                        <ListChecksIcon className="mr-2 h-4 w-4" />My Bookings
                    </Link>
                </DropdownMenuItem>
                {currentUser.role === 'hotel_owner' && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-200"/>
                    <DropdownMenuLabel className="px-3 py-2 text-xs text-[#555]">Hotel Owner</DropdownMenuLabel>
                    {hotelOwnerLinks.map(link => (
                         <DropdownMenuItem key={link.to} asChild className="cursor-pointer hover:bg-gray-100">
                            <Link href={link.to} className="flex items-center w-full px-3 py-2 text-[#1a1a1a]">
                                {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                                {link.label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                  </>
                )}
                {currentUser.role === 'super_admin' && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-200"/>
                     <DropdownMenuLabel className="px-3 py-2 text-xs text-[#555]">Super Admin</DropdownMenuLabel>
                     {superAdminLinks.map(link => (
                         <DropdownMenuItem key={link.to} asChild className="cursor-pointer hover:bg-gray-100">
                            <Link href={link.to} className="flex items-center w-full px-3 py-2 text-[#1a1a1a]">
                                {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                                {link.label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator className="bg-gray-200"/>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-gray-100 flex items-center px-3 py-2 text-red-600">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isClient ? (
            <>
              <Button onClick={() => router.push('/login')} variant="outline" className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-md hover:bg-gray-100 text-sm h-auto">
                Log in
              </Button>
              <Button onClick={() => router.push('/signup')} className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-md hover:bg-[#333] text-sm h-auto">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <div className="h-8 w-16 rounded-md bg-gray-200 animate-pulse" />
              <div className="h-8 w-20 rounded-md bg-gray-200 animate-pulse" />
            </>
          )}
        </div>
         {/* Mobile Auth Trigger (only if no user, otherwise handled by sidebar) */}
        <div className="md:hidden flex items-center">
            {isClient && !currentUser && (
                <Button onClick={() => router.push('/login')} variant="ghost" size="sm" className="text-[#1a1a1a] p-1">
                    <LogInIcon className="h-5 w-5" />
                </Button>
            )}
             {isClient && currentUser && ( 
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" onClick={() => setSidebarOpen(true)}>
                   <UserCircle className="h-6 w-6 text-[#1a1a1a]" />
                </Button>
            )}
        </div>

      </div>

      <nav className="hidden md:flex items-center justify-center gap-x-6 py-2.5 border-t border-gray-200">
        {navItems.map((item) => {
          const isActive = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
          return (
            <Link
              key={item.label}
              href={item.to}
              className={`text-sm font-medium px-2 py-1 rounded-sm transition-colors ${
                isActive ? 'text-[#005aa7] border-b-2 border-[#005aa7]' : 'text-[#1a1a1a] hover:text-[#005aa7]'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
