
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSavedItems } from '@/hooks/use-saved-items';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlightCard } from '@/components/cards/flight-card';
import { HotelCard } from '@/components/cards/hotel-card';
import { PlaneIcon, HotelIcon, StarIcon, SearchIcon, Loader2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Temporary import for placeholder data (should be part of a context or fetched if not in savedItems)
const { placeholderFlights, placeholderHotels } = require('@/lib/placeholder-data');


export default function SavedItemsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser");
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.replace('/login?redirect=/saved'); 
      }
      setIsAuthLoading(false);
    }
  }, [router]);

  const { 
    savedFlights, 
    savedHotels, 
    addFlightToSaved, 
    removeFlightFromSaved, 
    isFlightSaved,
    addHotelToSaved,
    removeHotelFromSaved,
    isHotelSaved,
    isLoading: isLoadingSavedItems 
  } = useSavedItems();


  const handleToggleFlightSave = (flightId: string) => {
    const flightIsInSavedList = savedFlights.find(f => f.id === flightId);
    if (isFlightSaved(flightId) && flightIsInSavedList) {
        removeFlightFromSaved(flightId);
        toast({
            title: "Flight Unsaved",
            description: `${flightIsInSavedList.airline} - ${flightIsInSavedList.flightNumber} removed.`,
        });
    } else if (!isFlightSaved(flightId)) {
       const flightToAdd = placeholderFlights.find((f:any) => f.id === flightId);
       if(flightToAdd) {
            addFlightToSaved(flightToAdd);
            toast({
                title: "Flight Saved!",
                description: `${flightToAdd.airline} - ${flightToAdd.flightNumber} added to saved items.`,
            });
       }
    }
  };

  const handleToggleHotelSave = (hotelId: string) => {
    const hotelIsInSavedList = savedHotels.find(h => h.id === hotelId);
    if (isHotelSaved(hotelId) && hotelIsInSavedList) {
        removeHotelFromSaved(hotelId);
        toast({
            title: "Hotel Unsaved",
            description: `${hotelIsInSavedList.name} removed from saved items.`,
        });
    } else if(!isHotelSaved(hotelId)) {
       const hotelToAdd = placeholderHotels.find((h:any) => h.id === hotelId);
       if(hotelToAdd) {
            addHotelToSaved(hotelToAdd);
            toast({
                title: "Hotel Saved!",
                description: `${hotelToAdd.name} added to saved items.`,
            });
       }
    }
  };
  
  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need to be logged in to view your saved items.
            <Button asChild variant="link" className="px-1">
              <Link href="/login?redirect=/saved">Login</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoadingSavedItems) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
            <StarIcon className="mx-auto h-12 w-12 text-accent mb-2" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold">Your Saved Trips</h1>
            <p className="text-muted-foreground">Loading your favorite flights and hotels...</p>
        </div>
        <Tabs defaultValue="flights" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="flights"><PlaneIcon className="mr-2 h-4 w-4" />Flights</TabsTrigger>
                <TabsTrigger value="hotels"><HotelIcon className="mr-2 h-4 w-4" />Hotels</TabsTrigger>
            </TabsList>
            <TabsContent value="flights">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2].map(i => <Skeleton key={i} className="h-[300px] w-full rounded-lg" />)}
                </div>
            </TabsContent>
            <TabsContent value="hotels">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-lg" />)}
                </div>
            </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <StarIcon className="mx-auto h-12 w-12 text-accent mb-2" />
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Your Saved Trips</h1>
        <p className="text-muted-foreground">Revisit your favorite flights and hotels.</p>
      </div>

      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="flights" className="py-3 text-base">
            <PlaneIcon className="mr-2 h-5 w-5" /> Flights ({savedFlights.length})
          </TabsTrigger>
          <TabsTrigger value="hotels" className="py-3 text-base">
            <HotelIcon className="mr-2 h-5 w-5" /> Hotels ({savedHotels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights">
          {savedFlights.length === 0 ? (
            <Alert className="mt-6">
              <SearchIcon className="h-4 w-4" />
              <AlertTitle>No Saved Flights</AlertTitle>
              <AlertDescription>
                You haven't saved any flights yet. Start exploring and save your favorites!
                <Button asChild variant="link" className="px-1 text-accent">
                    <Link href="/flights/search">Find Flights</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedFlights.map((flight) => (
                <FlightCard 
                  key={flight.id} 
                  flight={flight}
                  isSaved={isFlightSaved(flight.id)}
                  onToggleSave={() => handleToggleFlightSave(flight.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hotels">
          {savedHotels.length === 0 ? (
            <Alert className="mt-6">
              <SearchIcon className="h-4 w-4" />
              <AlertTitle>No Saved Hotels</AlertTitle>
              <AlertDescription>
                You haven't saved any hotels yet. Discover amazing places to stay!
                <Button asChild variant="link" className="px-1 text-accent">
                    <Link href="/hotels/search">Find Hotels</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedHotels.map((hotel) => (
                <HotelCard 
                  key={hotel.id} 
                  hotel={hotel}
                  isSaved={isHotelSaved(hotel.id)}
                  onToggleSave={() => handleToggleHotelSave(hotel.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
