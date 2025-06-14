
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, UsersIcon, SearchIcon, HotelIcon as HotelBuildingIcon, MapPinIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function HotelSearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState('1');
  
  // Use useEffect to avoid hydration errors with date pickers' initial state
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (location) queryParams.set('location', location);
    if (checkInDate) queryParams.set('checkInDate', format(checkInDate, 'yyyy-MM-dd'));
    if (checkOutDate) queryParams.set('checkOutDate', format(checkOutDate, 'yyyy-MM-dd'));
    queryParams.set('guests', guests);

    router.push(`/hotels/search?${queryParams.toString()}`);
  };

  if (!isClient) {
    return (
        <Card className="w-full max-w-3xl shadow-lg bg-card/80 backdrop-blur-sm p-6 md:p-8 rounded-lg">
            <CardHeader className="p-0 mb-6">
                <CardTitle className="font-headline text-2xl md:text-3xl flex items-center text-foreground">
                    <HotelBuildingIcon className="mr-3 h-8 w-8" />Find Your Perfect Stay
                </CardTitle>
                <CardDescription className="text-muted-foreground">Search for hotels, resorts, and more.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-muted/30 rounded-md"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-10 bg-muted/30 rounded-md"></div>
                        <div className="h-10 bg-muted/30 rounded-md"></div>
                        <div className="h-10 bg-muted/30 rounded-md"></div>
                    </div>
                    <div className="h-12 bg-primary/50 rounded-md"></div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl shadow-lg bg-card/80 backdrop-blur-sm p-6 md:p-8 rounded-lg">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="font-headline text-2xl md:text-3xl flex items-center text-foreground">
            <HotelBuildingIcon className="mr-3 h-8 w-8" />Find Your Perfect Stay
        </CardTitle>
        <CardDescription className="text-muted-foreground">Search for hotels, resorts, and more.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">Where are you going?</Label>
            <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="location"
                    placeholder="e.g., London, Paris, Tokyo"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="pl-10 bg-background/70 border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
                />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin-date" className="text-foreground">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-background/70 border-border text-foreground hover:bg-background focus:bg-background"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {checkInDate ? format(checkInDate, 'dd MMM yyyy') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } 
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-date" className="text-foreground">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-background/70 border-border text-foreground hover:bg-background focus:bg-background"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {checkOutDate ? format(checkOutDate, 'dd MMM yyyy') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    disabled={(date) => checkInDate ? date <= checkInDate : date < new Date(new Date().setHours(0,0,0,0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
             <div className="space-y-2">
              <Label htmlFor="guests" className="text-foreground">Guests</Label>
               <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger id="guests" className="bg-background/70 border-border text-foreground hover:bg-background focus:bg-background">
                  <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={String(num)}>{num} Guest{num > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-6">
            <SearchIcon className="mr-2 h-5 w-5" /> Search Hotels
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
