
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Flight } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaneIcon, ArrowRightIcon, CalendarDaysIcon, ClockIcon, UsersIcon, TagIcon, HeartIcon } from 'lucide-react';
import { format } from 'date-fns';

interface FlightCardProps {
  flight: Flight;
  isSaved: boolean;
  onToggleSave: (flightId: string) => void;
}

export function FlightCard({ flight, isSaved, onToggleSave }: FlightCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-secondary/50 p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {flight.airlineLogoUrl && (
                <Image 
                    src={flight.airlineLogoUrl} 
                    alt={`${flight.airline} logo`} 
                    width={32} 
                    height={32} 
                    className="rounded-sm"
                    data-ai-hint="airline logo"
                />
              )}
              <CardTitle className="font-headline text-lg">{flight.airline}</CardTitle>
            </div>
            <Badge variant={flight.stops === 0 ? "default" : "secondary"} className="text-xs">
              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
            </Badge>
        </div>
        <CardDescription className="text-xs">{flight.flightNumber}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col items-start">
            <span className="font-medium">{flight.from}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(flight.departureTime), 'HH:mm')}</span>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-primary mx-2" />
          <div className="flex flex-col items-end">
            <span className="font-medium">{flight.to}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(flight.arrivalTime), 'HH:mm')}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center"><CalendarDaysIcon className="mr-2 h-3 w-3" /> {format(new Date(flight.departureTime), 'EEE, MMM d')}</div>
            <div className="flex items-center"><ClockIcon className="mr-2 h-3 w-3" /> Duration: {flight.duration}</div>
        </div>

        <div className="flex items-center justify-between pt-2">
            <p className="text-xl font-semibold text-primary">
                ${flight.price.toFixed(2)}
            </p>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleSave(flight.id)}
                aria-label={isSaved ? "Unsave flight" : "Save flight"}
                className={isSaved ? "text-accent" : "text-muted-foreground"}
            >
                <HeartIcon className={`h-5 w-5 ${isSaved ? 'fill-accent' : ''}`} />
            </Button>
        </div>
      </CardContent>
      <CardFooter className="bg-secondary/50 p-4 flex justify-end">
        <Button asChild variant="default" size="sm">
          <Link href={`/flights/${flight.id}`}>View Details <PlaneIcon className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
