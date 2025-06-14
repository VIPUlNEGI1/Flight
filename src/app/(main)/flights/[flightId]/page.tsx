
"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { placeholderFlights } from '@/lib/placeholder-data';
import type { Flight } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlaneIcon, CalendarDaysIcon, ClockIcon, UsersIcon, CheckCircleIcon, XCircleIcon, InfoIcon, HeartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useSavedItems } from '@/hooks/use-saved-items';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function FlightDetailPage() {
  const params = useParams();
  const flightId = params.flightId as string;
  const { savedFlights, addFlightToSaved, removeFlightFromSaved, isFlightSaved, isLoading } = useSavedItems();
  const { toast } = useToast();

  // In a real app, fetch flight by ID
  const flight = placeholderFlights.find((f) => f.id === flightId);

  const handleToggleSave = () => {
    if (!flight) return;
    if (isFlightSaved(flight.id)) {
      removeFlightFromSaved(flight.id);
      toast({
        title: "Flight Unsaved",
        description: `${flight.airline} - ${flight.flightNumber} removed from your saved items.`,
      });
    } else {
      addFlightToSaved(flight);
      toast({
        title: "Flight Saved!",
        description: `${flight.airline} - ${flight.flightNumber} added to your saved items.`,
      });
    }
  };
  
  if (isLoading && !flight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!flight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircleIcon className="h-4 w-4" />
          <AlertTitle>Flight Not Found</AlertTitle>
          <AlertDescription>The flight you are looking for does not exist or has been removed.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
          {flight.airline} - Flight {flight.flightNumber}
        </h1>
        <p className="text-xl text-muted-foreground">
          {flight.from} to {flight.to}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><PlaneIcon className="mr-2 h-6 w-6 text-primary" /> Flight Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-lg">{flight.from}</p>
                  <p className="text-sm text-muted-foreground">{flight.departureAirport}</p>
                  <p className="text-sm">{format(new Date(flight.departureTime), 'EEE, MMM d, yyyy - HH:mm')}</p>
                </div>
                <PlaneIcon className="h-8 w-8 text-primary mx-4" />
                <div>
                  <p className="font-medium text-lg text-right">{flight.to}</p>
                  <p className="text-sm text-muted-foreground text-right">{flight.arrivalAirport}</p>
                  <p className="text-sm text-right">{format(new Date(flight.arrivalTime), 'EEE, MMM d, yyyy - HH:mm')}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><ClockIcon className="inline mr-2 h-4 w-4" />Duration: {flight.duration}</div>
                <div><UsersIcon className="inline mr-2 h-4 w-4" />Stops: {flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</div>
                <div>Aircraft: {flight.aircraftType || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><InfoIcon className="mr-2 h-6 w-6 text-primary" /> Amenities & Info</CardTitle>
            </CardHeader>
            <CardContent>
              {flight.amenities && flight.amenities.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {flight.amenities.map(amenity => <li key={amenity}><CheckCircleIcon className="inline mr-2 h-4 w-4 text-primary" />{amenity}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific amenities listed for this flight.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-4">${flight.price.toFixed(2)}</p>
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Book Now</Button>
               <Button 
                variant="outline" 
                size="lg" 
                className="w-full mt-2"
                onClick={handleToggleSave}
              >
                <HeartIcon className={`mr-2 h-5 w-5 ${isFlightSaved(flight.id) ? 'fill-accent text-accent' : ''}`} />
                {isFlightSaved(flight.id) ? 'Saved' : 'Save Flight'}
              </Button>
            </CardContent>
          </Card>
           {flight.airlineLogoUrl && (
            <Card>
                <CardContent className="p-4 flex justify-center items-center">
                    <Image src={flight.airlineLogoUrl} alt={`${flight.airline} logo`} width={100} height={100} className="rounded-md" data-ai-hint="airline logo"/>
                </CardContent>
            </Card>
           )}
        </div>
      </div>
    </div>
  );
}
