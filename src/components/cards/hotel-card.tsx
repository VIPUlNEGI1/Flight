
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Hotel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HotelIcon, MapPinIcon, StarIcon, TagIcon, HeartIcon } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  isSaved: boolean;
  onToggleSave: (hotelId: string) => void;
}

export function HotelCard({ hotel, isSaved, onToggleSave }: HotelCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {hotel.thumbnailUrl && (
        <div className="relative w-full h-48">
          <Image 
            src={hotel.thumbnailUrl} 
            alt={hotel.name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={hotel.thumbnailHint || "hotel exterior"}
          />
        </div>
      )}
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
            <CardTitle className="font-headline text-lg">{hotel.name}</CardTitle>
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < hotel.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                ))}
            </div>
        </div>
        <CardDescription className="flex items-center text-xs">
            <MapPinIcon className="mr-1 h-3 w-3" /> {hotel.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
            <p className="text-sm">
                From <span className="font-semibold text-primary text-lg">${hotel.pricePerNight.toFixed(2)}</span> / night
            </p>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleSave(hotel.id)}
                aria-label={isSaved ? "Unsave hotel" : "Save hotel"}
                className={isSaved ? "text-accent" : "text-muted-foreground"}
            >
                <HeartIcon className={`h-5 w-5 ${isSaved ? 'fill-accent' : ''}`} />
            </Button>
        </div>
        
        {hotel.amenities.slice(0, 3).length > 0 && (
          <div className="mt-3">
            <h4 className="text-xs font-medium mb-1">Top Amenities:</h4>
            <div className="flex flex-wrap gap-1">
              {hotel.amenities.slice(0, 3).map(amenity => (
                <Badge key={amenity} variant="outline" className="text-xs">{amenity}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-secondary/50 p-4 flex justify-end">
        <Button asChild variant="default" size="sm">
          <Link href={`/hotels/${hotel.id}`}>View Details <HotelIcon className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
