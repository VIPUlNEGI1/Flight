
"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Hotel, Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HotelIcon as HotelBuildingIcon, MapPinIcon, StarIcon, CheckCircleIcon, XCircleIcon, BedDoubleIcon, CalendarDaysIcon, HeartIcon, Loader2, ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react';
import { useSavedItems } from '@/hooks/use-saved-items';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import { getHotelById } from '@/lib/hotel-data';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge'; // Added import for Badge

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

const BOOKINGS_DB_KEY = 'appBookingsDB';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.hotelId as string;
  const { addHotelToSaved, removeHotelFromSaved, isHotelSaved, isLoading: isLoadingSaved } = useSavedItems();
  const { toast } = useToast();
  
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined); 
  const [isLoadingHotel, setIsLoadingHotel] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthorizedToView, setIsAuthorizedToView] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) { console.error("Failed to parse current user", e); }
      }
    }
  }, []);

  const fetchHotelDetails = useCallback(() => {
    if (hotelId) {
      setIsLoadingHotel(true);
      const foundHotel = getHotelById(hotelId);
      setHotel(foundHotel);
      setIsLoadingHotel(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchHotelDetails();
  }, [fetchHotelDetails]);

  useEffect(() => {
    if (hotel === null || !hotel) { 
        setIsAuthorizedToView(false);
        return;
    }
    if (hotel.isApproved) {
        setIsAuthorizedToView(true);
    } else if (currentUser) {
        if (currentUser.role === 'super_admin' || currentUser.email === hotel.ownerEmail) {
            setIsAuthorizedToView(true);
        } else {
            setIsAuthorizedToView(false);
        }
    } else {
        setIsAuthorizedToView(false); 
    }
  }, [hotel, currentUser]);


  const handleToggleSave = () => {
    if (!hotel) return;
    if (isHotelSaved(hotel.id)) {
      removeHotelFromSaved(hotel.id);
      toast({
        title: "Hotel Unsaved",
        description: `${hotel.name} removed from your saved items.`,
      });
    } else {
      addHotelToSaved(hotel);
      toast({
        title: "Hotel Saved!",
        description: `${hotel.name} added to your saved items.`,
      });
    }
  };

  const handleBookHotel = () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to book a hotel." });
      router.push(`/login?redirect=/hotels/${hotelId}`);
      return;
    }
    if (!hotel) {
      toast({ variant: "destructive", title: "Error", description: "Hotel details not available." });
      return;
    }

    // Simplified booking logic for now
    const numberOfNights = 2; // Example
    const guests = 1; // Example
    const checkIn = addDays(new Date(), 1); // Tomorrow
    const checkOut = addDays(checkIn, numberOfNights);

    const newBooking: Booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.email,
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelLocation: hotel.location,
      hotelOwnerEmail: hotel.ownerEmail,
      checkInDate: format(checkIn, 'yyyy-MM-dd'),
      checkOutDate: format(checkOut, 'yyyy-MM-dd'),
      guests: guests,
      totalPrice: hotel.pricePerNight * numberOfNights,
      bookedAt: new Date().toISOString(),
      status: 'Confirmed',
    };

    if (typeof window !== "undefined") {
      const existingBookingsString = localStorage.getItem(BOOKINGS_DB_KEY);
      let bookingsDB: Booking[] = [];
      if (existingBookingsString) {
        try {
          bookingsDB = JSON.parse(existingBookingsString);
        } catch (e) {
          console.error("Error parsing bookingsDB", e);
        }
      }
      bookingsDB.push(newBooking);
      localStorage.setItem(BOOKINGS_DB_KEY, JSON.stringify(bookingsDB));
      
      toast({
        title: "Booking Confirmed!",
        description: `Your stay at ${hotel.name} from ${newBooking.checkInDate} to ${newBooking.checkOutDate} is confirmed.`,
      });
      router.push('/my-bookings');
    }
  };


  if (isLoadingHotel || isLoadingSaved) {
     return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (hotel === null) { 
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircleIcon className="h-4 w-4" />
          <AlertTitle>Hotel Not Found</AlertTitle>
          <AlertDescription>The hotel you are looking for (ID: {hotelId}) does not exist or has been removed.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!isAuthorizedToView) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <ShieldAlertIcon className="h-4 w-4" />
          <AlertTitle>Access Denied or Hotel Not Available</AlertTitle>
          <AlertDescription>
            This hotel is currently not approved for public viewing, or you do not have permission to view it.
            {!hotel?.isApproved && currentUser?.role === 'hotel_owner' && currentUser?.email === hotel?.ownerEmail && (
                <span className="block mt-2 text-sm">Your hotel '{hotel.name}' is still pending Super Admin approval.</span>
            )}
          </AlertDescription>
           <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </Alert>
      </div>
    );
  }
  
  if (!hotel) { 
      return <div className="container mx-auto px-4 py-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{hotel.name}</h1>
                <p className="text-lg text-muted-foreground flex items-center">
                    <MapPinIcon className="mr-2 h-5 w-5" /> {hotel.location}
                </p>
                {!hotel.isApproved && (
                    <Badge variant="outline" className="mt-1 border-yellow-500 text-yellow-600">Pending Approval</Badge>
                )}
                 {hotel.isApproved && (
                    <Badge variant="outline" className="mt-1 border-green-500 text-green-700 flex items-center">
                        <ShieldCheckIcon className="mr-1 h-3 w-3"/> Approved
                    </Badge>
                )}
            </div>
            <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-6 w-6 ${i < hotel.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">({hotel.rating}.0)</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {hotel.images && hotel.images.length > 0 && (
            <Card className="overflow-hidden">
              <div className="relative w-full h-96">
                <Image 
                  src={hotel.images[0]} 
                  alt={`${hotel.name} primary image`} 
                  layout="fill" 
                  objectFit="cover" 
                  className="rounded-t-lg" 
                  data-ai-hint={hotel.imageHints?.[0] || "hotel interior"} 
                />
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">About this hotel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{hotel.description || "No description available."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {hotel.amenities && hotel.amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  {hotel.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center">
                        <CheckCircleIcon className="mr-2 h-4 w-4 text-primary shrink-0" />
                        <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No amenities listed for this hotel.</p>
              )}
            </CardContent>
          </Card>
          
          {hotel.roomTypes && hotel.roomTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><BedDoubleIcon className="mr-2 h-6 w-6 text-primary" /> Room Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hotel.roomTypes.map((room, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{room.name}</h4>
                    <p className="font-semibold text-primary">${room.price.toFixed(2)}</p>
                  </div>
                  <ul className="list-disc list-inside text-xs text-muted-foreground pl-2">
                    {room.features.map(feature => <li key={feature}>{feature}</li>)}
                  </ul>
                  {index < (hotel.roomTypes?.length ?? 0) - 1 && <Separator className="my-3"/>}
                </div>
              ))}
            </CardContent>
          </Card>
          )}

        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Book Your Stay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-1">${hotel.pricePerNight.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ night</span></p>
              <p className="text-xs text-muted-foreground mb-4">(Price for standard room, may vary)</p>
              <div className="space-y-2 mb-4">
                  <p className="text-sm flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-in: {hotel.checkInTime || 'N/A'}</p>
                  <p className="text-sm flex items-center"><CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Check-out: {hotel.checkOutTime || 'N/A'}</p>
              </div>
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleBookHotel}>
                Book Now (Simplified)
              </Button>
               <Button 
                variant="outline" 
                size="lg" 
                className="w-full mt-2"
                onClick={handleToggleSave}
                disabled={isLoadingSaved}
              >
                <HeartIcon className={`mr-2 h-5 w-5 ${isHotelSaved(hotel.id) ? 'fill-accent text-accent' : ''}`} />
                {isHotelSaved(hotel.id) ? 'Saved' : 'Save Hotel'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
