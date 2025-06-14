
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListOrdered, SearchIcon, UserCheck, CalendarX, UserIcon, HotelIcon, CalendarDaysIcon, UsersIcon, DollarSignIcon, Loader2Icon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from 'react';
import type { Booking } from '@/lib/types';
import { format, isFuture, isPast } from 'date-fns';

const BOOKINGS_DB_KEY = 'appBookingsDB';

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

export default function ManageBookingsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [hotelBookings, setHotelBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(() => {
    if (currentUser && typeof window !== "undefined") {
      setIsLoading(true);
      const storedBookings = localStorage.getItem(BOOKINGS_DB_KEY);
      if (storedBookings) {
        try {
          const allBookings = JSON.parse(storedBookings) as Booking[];
          setHotelBookings(allBookings.filter(b => b.hotelOwnerEmail === currentUser.email).sort((a,b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()));
        } catch (e) {
          console.error("Error parsing bookingsDB for hotel owner:", e);
          setHotelBookings([]);
        }
      }
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) { console.error("Failed to parse current user for hotel owner bookings", e); }
      }
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  const upcomingBookings = hotelBookings.filter(b => 
    (b.status === "Confirmed" || b.status === "Pending") && isFuture(new Date(b.checkInDate))
  );
  const pastBookings = hotelBookings.filter(b => 
    b.status === "Completed" || b.status === "Cancelled" || isPast(new Date(b.checkOutDate))
  );


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading bookings for your hotels...</p>
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== 'hotel_owner') {
     return (
        <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You need to be logged in as a Hotel Owner to manage bookings.</AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
          <ListOrdered className="mr-3 h-8 w-8 text-primary" /> Manage Bookings
        </h1>
        <p className="text-muted-foreground">View and manage reservations for your properties.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming"><UserCheck className="mr-2 h-4 w-4" />Upcoming & Pending ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past"><CalendarX className="mr-2 h-4 w-4" />Past & Cancelled ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length === 0 ? (
            <Alert>
              <SearchIcon className="h-4 w-4" />
              <AlertTitle>No Upcoming Bookings</AlertTitle>
              <AlertDescription>There are no upcoming or pending bookings for your hotels at this time.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-lg flex items-center"><UserIcon className="mr-2 h-5 w-5 text-muted-foreground"/> Guest: {booking.userId}</CardTitle>
                            <CardDescription className="flex items-center mt-1"><HotelIcon className="mr-2 h-4 w-4 text-muted-foreground"/>Hotel: {booking.hotelName}</CardDescription>
                        </div>
                        <span className={`mt-2 sm:mt-0 px-2 py-1 text-xs rounded-full font-semibold ${
                            booking.status === 'Confirmed' ? 'bg-primary/20 text-primary' 
                            : booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                            {booking.status}
                        </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-in: {format(new Date(booking.checkInDate), 'EEE, MMM d, yyyy')}</div>
                    <div className="flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-out: {format(new Date(booking.checkOutDate), 'EEE, MMM d, yyyy')}</div>
                    <div className="flex items-center"><UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Guests: {booking.guests}</div>
                    <div className="flex items-center"><DollarSignIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Total Price: ${booking.totalPrice.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground pt-1">Booking ID: {booking.id}</p>
                     <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" disabled>View Details</Button>
                        {booking.status === "Pending" && <Button size="sm" disabled>Confirm Booking</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
           {pastBookings.length === 0 ? (
            <Alert>
              <SearchIcon className="h-4 w-4" />
              <AlertTitle>No Past Bookings</AlertTitle>
              <AlertDescription>There are no completed or cancelled bookings to display for your hotels.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {pastBookings.map(booking => (
                 <Card key={booking.id} className={booking.status === "Cancelled" ? "opacity-70" : ""}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-lg flex items-center"><UserIcon className="mr-2 h-5 w-5 text-muted-foreground"/> Guest: {booking.userId}</CardTitle>
                            <CardDescription className="flex items-center mt-1"><HotelIcon className="mr-2 h-4 w-4 text-muted-foreground"/>Hotel: {booking.hotelName}</CardDescription>
                        </div>
                        <span className={`mt-2 sm:mt-0 px-2 py-1 text-xs rounded-full font-semibold ${
                            booking.status === 'Completed' ? 'bg-green-100 text-green-700' 
                            : booking.status === 'Cancelled' ? 'bg-red-100 text-red-700'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                            {booking.status}
                        </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-in: {format(new Date(booking.checkInDate), 'EEE, MMM d, yyyy')}</div>
                    <div className="flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-out: {format(new Date(booking.checkOutDate), 'EEE, MMM d, yyyy')}</div>
                    <p className="text-xs text-muted-foreground pt-1">Booking ID: {booking.id}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
