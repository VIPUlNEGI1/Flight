
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListChecksIcon, HotelIcon as HotelBuildingIcon, PlusCircleIcon, EditIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { Hotel } from "@/lib/types";
import { getHotels } from "@/lib/hotel-data";

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

export default function MyHotelsPage() {
  const [ownerHotels, setOwnerHotels] = useState<Hotel[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing currentUser", e);
        }
      }
    }
  }, []);

  const fetchMyHotels = useCallback(() => {
    if (currentUser && currentUser.role === 'hotel_owner') {
      setIsLoading(true);
      const allHotels = getHotels();
      setOwnerHotels(allHotels.filter(hotel => hotel.ownerEmail === currentUser.email));
      setIsLoading(false);
    } else if (currentUser === null && typeof window !== 'undefined' && localStorage.getItem("currentUser") === null) {
      // If no current user after initial check, stop loading
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMyHotels();
  }, [fetchMyHotels]);


  if (isLoading && typeof window !== 'undefined' && localStorage.getItem("currentUser")) { // Only show loader if user might exist
     return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== 'hotel_owner') {
    return (
        <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You need to be logged in as a Hotel Owner to view your hotels.</AlertDescription>
            </Alert>
        </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
            <ListChecksIcon className="mr-3 h-8 w-8 text-primary" /> My Hotels
          </h1>
          <p className="text-muted-foreground">Manage your listed properties, rooms, and availability.</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/hotel-owner/register-hotel">
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Hotel
          </Link>
        </Button>
      </div>

      {ownerHotels.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center"><HotelBuildingIcon className="mr-2 h-6 w-6 text-muted-foreground" />No Hotels Listed Yet</CardTitle>
            <CardDescription>
              You haven&apos;t registered any hotels yet or none are assigned to you. Add your first property to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
             <Alert variant="default" className="bg-card mb-6">
                <HotelBuildingIcon className="h-4 w-4" />
                <AlertTitle>Ready to list your property?</AlertTitle>
                <AlertDescription>
                    Click the button below to add your first hotel. It will require Super Admin approval.
                </AlertDescription>
            </Alert>
            <Button asChild size="lg">
              <Link href="/hotel-owner/register-hotel">Register Your First Hotel</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {ownerHotels.map((hotel) => (
            <Card key={hotel.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="font-headline text-xl">{hotel.name}</CardTitle>
                        <CardDescription>{hotel.location} - {hotel.roomTypes?.length || 0} room types</CardDescription>
                    </div>
                    <span className={`mt-2 sm:mt-0 px-2 py-1 text-xs rounded-full ${hotel.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {hotel.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Description: {hotel.description?.substring(0,100) || "N/A"}...
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled> {/* Edit functionality to be added */}
                        <EditIcon className="mr-2 h-4 w-4" /> Edit Hotel / Rooms
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/hotels/${hotel.id}`}>View Listing</Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
