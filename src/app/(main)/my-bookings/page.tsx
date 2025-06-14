
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListChecksIcon, BriefcaseIcon, Loader2Icon, HotelIcon, CalendarDaysIcon, UsersIcon, DollarSignIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';

const BOOKINGS_DB_KEY = 'appBookingsDB';

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as CurrentUser;
          setCurrentUser(user);
          
          const storedBookings = localStorage.getItem(BOOKINGS_DB_KEY);
          if (storedBookings) {
            const allBookings = JSON.parse(storedBookings) as Booking[];
            setMyBookings(allBookings.filter(b => b.userId === user.email).sort((a,b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()));
          }
        } catch (e) {
          console.error("Error loading data for My Bookings:", e);
          localStorage.removeItem("currentUser"); // Clear corrupted data
          router.replace('/login?redirect=/my-bookings');
        }
      } else {
        router.replace('/login?redirect=/my-bookings');
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  if (!currentUser) { // Should be handled by redirect, but as a fallback
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need to be logged in to view your bookings.
            <Button asChild variant="link" className="px-1">
              <Link href="/login?redirect=/my-bookings">Login</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
            <BriefcaseIcon className="mx-auto sm:mx-0 h-12 w-12 text-primary mb-2" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your hotel reservations.</p>
        </div>
        <Button asChild size="lg">
            <Link href="/hotels/search">
                <SearchIcon className="mr-2 h-5 w-5" />
                Find More Hotels
            </Link>
        </Button>
      </div>

      {myBookings.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecksIcon className="mr-2 h-6 w-6 text-muted-foreground" />
              No Bookings Yet
            </CardTitle>
            <CardDescription>
              You haven&apos;t made any hotel bookings yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Alert variant="default" className="bg-card mb-6">
                <ListChecksIcon className="h-4 w-4" />
                <AlertTitle>Ready to explore?</AlertTitle>
                <AlertDescription>
                    Find your next adventure and book your stay.
                </AlertDescription>
            </Alert>
            {/* Button already present above, this specific one can be removed if redundant */}
            {/* <div className="mt-6 flex justify-center gap-4">
                <Button asChild>
                    <Link href="/hotels/search">Find Hotels</Link>
                </Button>
            </div> */}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {myBookings.map((booking) => (
            <Card key={booking.id} className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-xl flex items-center">
                        <HotelIcon className="mr-2 h-5 w-5 text-primary"/> {booking.hotelName}
                    </CardTitle>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' 
                        : booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                        {booking.status}
                    </span>
                </div>
                <CardDescription>{booking.hotelLocation}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-in: {format(new Date(booking.checkInDate), 'EEE, MMM d, yyyy')}</div>
                <div className="flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-out: {format(new Date(booking.checkOutDate), 'EEE, MMM d, yyyy')}</div>
                <div className="flex items-center"><UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Guests: {booking.guests}</div>
                <div className="flex items-center"><DollarSignIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Total Price: ${booking.totalPrice.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground pt-1">Booked on: {format(new Date(booking.bookedAt), 'MMM d, yyyy, HH:mm')}</p>
                <p className="text-xs text-muted-foreground">Booking ID: {booking.id}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/hotels/${booking.hotelId}`}>View Hotel</Link>
                </Button>
                {/* Add more actions if needed, e.g., Cancel Booking */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
