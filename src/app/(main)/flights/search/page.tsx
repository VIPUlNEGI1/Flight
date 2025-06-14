
"use client";

import { Suspense, useMemo, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO, isValid, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plane, ChevronDown, ChevronUp, Filter, Clock, MapPin, AlertCircle, Zap, Star, SlidersHorizontal, Briefcase, Heart, MoreHorizontal, Percent, CreditCard, Users, Search, X, ArrowRightLeft, Calendar as CalendarIconLucide } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { FlightOffer, FlightOffersResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


const CLIENT_ID = "uAVfFRadqZNTpCPuD7vLIRtvqOXgcnQD";
const CLIENT_SECRET = "99hFf5XQGW7dzzPF";

const getAccessToken = async (): Promise<string> => {
  const url = "https://test.api.amadeus.com/v1/security/oauth2/token";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    console.error("Failed to get access token:", await res.text());
    throw new Error("Authentication failed. Unable to connect to flight services.");
  }

  const data = await res.json();
  return data.access_token as string;
};

const getFlightOffers = async (
  token: string,
  query: Record<string, string | undefined>
): Promise<FlightOffersResponse> => {
  const baseUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";
  const validQuery = Object.fromEntries(Object.entries(query).filter(([_, v]) => v !== undefined && v !== null && v !== "")) as Record<string, string>;
  const queryString = new URLSearchParams(validQuery).toString();
  const url = `${baseUrl}?${queryString}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ errors: [{ detail: "Unknown error fetching flight offers."}] }));
    console.error("Failed to fetch flight offers:", errData);
    throw new Error(errData?.errors?.[0]?.detail || "Failed to fetch flight offers. Please check your search criteria and try again.");
  }

  return (await res.json()) as FlightOffersResponse;
};


const popularIndianAirports = [
  { iata: "DEL", name: "New Delhi, India (DEL)" },
  { iata: "BOM", name: "Mumbai, India (BOM)" },
  { iata: "BLR", name: "Bengaluru, India (BLR)" },
  { iata: "MAA", name: "Chennai, India (MAA)" },
  { iata: "HYD", name: "Hyderabad, India (HYD)" },
  { iata: "CCU", name: "Kolkata, India (CCU)" },
  { iata: "AMD", name: "Ahmedabad, India (AMD)" },
  { iata: "PNQ", name: "Pune, India (PNQ)" },
  { iata: "GOI", name: "Goa, India (GOI)" },
  { iata: "JAI", name: "Jaipur, India (JAI)" },
  { iata: "COK", name: "Kochi, India (COK)" },
  { iata: "LKO", name: "Lucknow, India (LKO)" },
  { iata: "PAT", name: "Patna, India (PAT)" },
  { iata: "NAG", name: "Nagpur, India (NAG)" },
  { iata: "IDR", name: "Indore, India (IDR)" },
];

const travelClassMap: { [key: string]: string } = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business",
  FIRST: "First",
};

const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        return format(parsedDate, "EEE, MMM d, yyyy");
      }
      return "Select Date";
    } catch (e) {
      return "Select Date";
    }
};


function FlightResultsClientInternal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("price");
  const [activeSortTab, setActiveSortTab] = useState<string>("cheapest");

  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [stopFilters, setStopFilters] = useState<{ [key: string]: boolean }>({
    "0": true,
    "1": true,
    "2+": true,
  });
  const [selectedOutbound, setSelectedOutbound] = useState<string | null>(null);
  const [isAppliedFiltersOpen, setIsAppliedFiltersOpen] = useState(true);
  const [isPopularFiltersOpen, setIsPopularFiltersOpen] = useState(true);
  const [isDepartureAirportsOpen, setIsDepartureAirportsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);

  const queryOrigin = searchParams.get("originLocationCode") || "SYD";
  const queryDestination = searchParams.get("destinationLocationCode") || "MEL";
  const queryDepartureDateParam = searchParams.get("departureDate") || "";
  const queryReturnDateParam = searchParams.get("returnDate");
  const queryAdults = searchParams.get("adults") || "1";
  const queryChildren = searchParams.get("children") || "0";
  const queryInfants = searchParams.get("infants") || "0";
  const queryTravelClass = searchParams.get("travelClass") || "ECONOMY";
  const queryNonStop = searchParams.get("nonStop");

  const queryDepartureDate = useMemo(() => {
    try {
      return queryDepartureDateParam ? format(parseISO(queryDepartureDateParam), "yyyy-MM-dd") : format(addDays(new Date(), 1), "yyyy-MM-dd");
    } catch {
      return format(addDays(new Date(), 1), "yyyy-MM-dd");
    }
  }, [queryDepartureDateParam]);

  const queryReturnDate = useMemo(() => {
    try {
      return queryReturnDateParam ? format(parseISO(queryReturnDateParam), "yyyy-MM-dd") : undefined;
    } catch {
      return undefined;
    }
  }, [queryReturnDateParam]);

  const queryIsRoundTrip = !!queryReturnDateParam;

  const [formOrigin, setFormOrigin] = useState(queryOrigin);
  const [formDestination, setFormDestination] = useState(queryDestination);
  const [formDepartureDate, setFormDepartureDate] = useState(queryDepartureDate);
  const [formReturnDate, setFormReturnDate] = useState(queryReturnDate || "");
  const [formAdults, setFormAdults] = useState(queryAdults);
  const [formChildren, setFormChildren] = useState(queryChildren);
  const [formInfants, setFormInfants] = useState(queryInfants);
  const [formTravelClass, setFormTravelClass] = useState(queryTravelClass);
  const [formIsRoundTrip, setFormIsRoundTrip] = useState(queryIsRoundTrip);
  const [passengerPopoverOpen, setPassengerPopoverOpen] = useState(false);

  const parseDuration = (durationStr: string): number => {
    const timePart = durationStr?.replace("PT", "") || "";
    let hours = 0, minutes = 0;
    if (timePart.includes("H")) {
    const parts = timePart.split("H");
    hours = parseInt(parts[0]) || 0;
    if (parts[1]) {
        minutes = parseInt(parts[1].replace("M", "")) || 0;
    }
    } else if (timePart.includes("M")) {
    minutes = parseInt(timePart.replace("M", "")) || 0;
    }
    return hours * 60 + minutes;
  };

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    const resizeObserver = new ResizeObserver(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    });
    if (headerRef.current) {
        resizeObserver.observe(headerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const initialMinPrice = useMemo(() => {
      const validPrices = flights
        .map(f => parseFloat(f.price.total))
        .filter(p => !isNaN(p));
      return validPrices.length > 0 ? Math.floor(Math.min(...validPrices)) : 0;
  }, [flights]);

  const initialMaxPrice = useMemo(() => {
      const validPrices = flights
        .map(f => parseFloat(f.price.total))
        .filter(p => !isNaN(p));
      if (validPrices.length === 0) return 1; 
      const maxP = Math.ceil(Math.max(...validPrices));
      const minP = Math.floor(Math.min(...validPrices));
      return maxP > minP ? maxP : minP + 1; 
  }, [flights]);
  
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);

  useEffect(() => {
    setFormOrigin(queryOrigin);
    setFormDestination(queryDestination);
    setFormDepartureDate(queryDepartureDate);
    setFormReturnDate(queryReturnDate || "");
    setFormAdults(queryAdults);
    setFormChildren(queryChildren);
    setFormInfants(queryInfants);
    setFormTravelClass(queryTravelClass);
    setFormIsRoundTrip(queryIsRoundTrip);
  }, [queryOrigin, queryDestination, queryDepartureDate, queryReturnDate, queryAdults, queryChildren, queryInfants, queryTravelClass, queryIsRoundTrip]);

  useEffect(() => {
    if (queryNonStop === "true") {
      setStopFilters(prev => ({ ...prev, "0": true, "1": false, "2+": false }));
      if (flights.length > 0 && activeSortTab !== "nonStopFirst") setActiveSortTab("nonStopFirst");
    } else { 
      setStopFilters(prev => ({ ...prev, "0": true, "1": true, "2+": true }));
    }
  }, [queryNonStop, flights.length, activeSortTab]);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      setFlights([]);
      setFilteredFlights([]);

      if (!queryOrigin || !queryDestination || !queryDepartureDate) {
        setError("Missing required search parameters: origin, destination, or departure date.");
        setLoading(false);
        return;
      }

      const apiQuery = {
        originLocationCode: queryOrigin,
        destinationLocationCode: queryDestination,
        departureDate: queryDepartureDate,
        returnDate: formIsRoundTrip && formReturnDate ? formReturnDate : undefined,
        adults: queryAdults,
        children: queryChildren,
        infants: queryInfants,
        travelClass: queryTravelClass,
        nonStop: queryNonStop === "true" ? "true" : undefined,
        max: "25",
      };

      try {
        const token = await getAccessToken();
        const response = await getFlightOffers(token, apiQuery);
        
        const validPrices = response.data
            .map(f => parseFloat(f.price.total))
            .filter(p => !isNaN(p));

        if (validPrices.length > 0) {
            const minVal = Math.floor(Math.min(...validPrices));
            let maxVal = Math.ceil(Math.max(...validPrices));
            if (maxVal <= minVal) maxVal = minVal + 1; 
            setPriceRange([minVal, maxVal]);
        } else {
            setPriceRange([0,1]); 
        }
        setFlights(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching flights.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [queryOrigin, queryDestination, queryDepartureDate, queryReturnDate, queryAdults, queryChildren, queryInfants, queryTravelClass, queryNonStop, formIsRoundTrip, formReturnDate]); 

  useEffect(() => {
    let tempFiltered = [...flights];

    if (flights.length > 0 && priceRange[1] >= priceRange[0]) {
        tempFiltered = tempFiltered.filter(flight => {
            const price = parseFloat(flight.price.total);
            if (isNaN(price)) return false; 
            return price >= priceRange[0] && price <= priceRange[1];
        });
    }
    
    const activeStopFiltersEntries = Object.entries(stopFilters).filter(([_, val]) => val).map(([key, _]) => key);
    if (activeStopFiltersEntries.length > 0 && activeStopFiltersEntries.length < 3) { 
        tempFiltered = tempFiltered.filter((flight) => {
            const stops = flight.itineraries[0].segments.length - 1;
            if (stopFilters["0"] && stops === 0) return true;
            if (stopFilters["1"] && stops === 1) return true;
            if (stopFilters["2+"] && stops >= 2) return true;
            return false;
        });
    }

    if (sortOption === "price") {
      tempFiltered.sort((a, b) => {
          const priceA = parseFloat(a.price.total);
          const priceB = parseFloat(b.price.total);
          if (isNaN(priceA) && isNaN(priceB)) return 0;
          if (isNaN(priceA)) return 1;
          if (isNaN(priceB)) return -1;
          return priceA - priceB;
      });
    } else if (sortOption === "duration") {
      tempFiltered.sort((a, b) => {
        return parseDuration(a.itineraries[0].duration) - parseDuration(b.itineraries[0].duration);
      });
    } else if (sortOption === "departure") {
      tempFiltered.sort((a, b) => {
        const timeA = new Date(a.itineraries[0].segments[0].departure.at).getTime();
        const timeB = new Date(b.itineraries[0].segments[0].departure.at).getTime();
        return timeA - timeB;
      });
    } else if (sortOption === "nonStopFirst") {
      tempFiltered.sort((a,b) => {
        const stopsA = a.itineraries[0].segments.length - 1;
        const stopsB = b.itineraries[0].segments.length - 1;
        if (stopsA === 0 && stopsB !== 0) return -1;
        if (stopsA !== 0 && stopsB === 0) return 1;
        
        const priceA = parseFloat(a.price.total);
        const priceB = parseFloat(b.price.total);
        if (isNaN(priceA) && isNaN(priceB)) return 0;
        if (isNaN(priceA)) return 1;
        if (isNaN(priceB)) return -1;
        return priceA - priceB;
      });
    }

    setFilteredFlights(tempFiltered);
  }, [sortOption, flights, stopFilters, priceRange]);

  const getStopsLabel = (segments: FlightOffer["itineraries"][0]["segments"]): string => {
    const stops = segments.length - 1;
    return stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`;
  };

  const handleHeaderSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("originLocationCode", formOrigin.toUpperCase());
    params.set("destinationLocationCode", formDestination.toUpperCase());
    params.set("departureDate", formDepartureDate);
    if (formIsRoundTrip && formReturnDate) {
      params.set("returnDate", formReturnDate);
    } else {
      params.delete("returnDate");
    }
    params.set("adults", formAdults);
    params.set("children", formChildren);
    params.set("infants", formInfants);
    params.set("travelClass", formTravelClass);
    
    const nonStopFilterApplied = stopFilters["0"] && !stopFilters["1"] && !stopFilters["2+"];
    if (nonStopFilterApplied) {
        params.set("nonStop", "true");
    } else {
        params.delete("nonStop");
    }
    router.push(`/flights/search?${params.toString()}`);
  };

  const handleStopFilterChange = (stopKey: string) => {
    setStopFilters((prev) => {
      const newFilters = { ...prev, [stopKey]: !prev[stopKey] };
      const currentParams = new URLSearchParams(searchParams.toString());
      const nonStopApplied = newFilters["0"] && !newFilters["1"] && !newFilters["2+"];
      if (nonStopApplied) {
          currentParams.set("nonStop", "true");
      } else {
          currentParams.delete("nonStop");
      }
      // Use replace to avoid multiple history entries for filter changes
      router.replace(`/flights/search?${currentParams.toString()}`); 
      return newFilters;
    });
  };
  
  const clearAllFilters = () => {
    setStopFilters({ "0": true, "1": true, "2+": true });
    
    const validPrices = flights
        .map(f => parseFloat(f.price.total))
        .filter(p => !isNaN(p));

    if (validPrices.length > 0) {
        const minP = Math.floor(Math.min(...validPrices));
        let maxP = Math.ceil(Math.max(...validPrices));
        if (maxP <= minP) maxP = minP +1;
        setPriceRange([minP, maxP]);
    } else {
        setPriceRange([0, 1]);
    }
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("nonStop");
    router.push(`/flights/search?${currentParams.toString()}`);
  };

  const handleSortTabChange = (tabKey: string) => {
    setActiveSortTab(tabKey);
    if (tabKey === "cheapest") setSortOption("price");
    else if (tabKey === "nonStopFirst") setSortOption("nonStopFirst");
    else if (tabKey === "youMayPrefer") {
        setSortOption("duration"); 
    }
    else if (tabKey === "otherSort") setSortOption("departure"); 
  };

  const handleSelectFlight = (flightId: string, itineraryIdx: number) => {
    if (queryIsRoundTrip && itineraryIdx === 0 && !selectedOutbound) {
      setSelectedOutbound(flightId);
    } else {
      const selectedFlight = flights.find(f => f.id === flightId);
      if (selectedFlight) {
        const itinerary = selectedFlight.itineraries[itineraryIdx];
        if (!itinerary) return;

        const params = new URLSearchParams();
        params.set('flightId', selectedFlight.id);
        params.set('fareName', selectedFlight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'UNKNOWN');
        params.set('farePrice', selectedFlight.price.total);
        params.set('origin', itinerary.segments[0].departure.iataCode);
        params.set('destination', itinerary.segments[itinerary.segments.length - 1].arrival.iataCode);
        params.set('departureDate', itinerary.segments[0].departure.at);
        params.set('arrivalDate', itinerary.segments[itinerary.segments.length - 1].arrival.at);
        params.set('duration', itinerary.duration);
        params.set('airlineName', selectedFlight.validatingAirlineCodes[0] || itinerary.segments[0].carrierCode);
        params.set('flightNumber', itinerary.segments.map(s => s.number).join(', '));
        params.set('stops', (itinerary.segments.length - 1).toString());
        
        const travelerPricing = selectedFlight.travelerPricings[0];
        const firstSegmentFareDetails = travelerPricing?.fareDetailsBySegment[0];
        const cabinBaggage = "7 Kg"; 
        const checkInBaggage = firstSegmentFareDetails?.includedCheckedBags?.quantity 
                                ? `${firstSegmentFareDetails.includedCheckedBags.quantity} PC`
                                : (firstSegmentFareDetails?.includedCheckedBags?.weight && firstSegmentFareDetails?.includedCheckedBags?.weightUnit
                                    ? `${firstSegmentFareDetails.includedCheckedBags.weight} ${firstSegmentFareDetails.includedCheckedBags.weightUnit}`
                                    : "15 Kg"); 

        params.set('cabinBaggage', cabinBaggage);
        params.set('checkInBaggage', checkInBaggage);
        params.set('aircraftType', itinerary.segments[0].aircraft?.code || 'N/A');
        params.set('numSegments', itinerary.segments.length.toString());

        itinerary.segments.forEach((seg, i) => {
            params.set(`segment_${i}_departureAt`, seg.departure.at);
            params.set(`segment_${i}_departureIata`, seg.departure.iataCode);
            params.set(`segment_${i}_arrivalAt`, seg.arrival.at);
            params.set(`segment_${i}_arrivalIata`, seg.arrival.iataCode);
            params.set(`segment_${i}_duration`, seg.duration);
            params.set(`segment_${i}_carrierCode`, seg.carrierCode);
            params.set(`segment_${i}_number`, seg.number);
        });
        
        router.push(`/flights/review-booking?${params.toString()}`);
        setSelectedOutbound(null); 
      }
    }
  };

  const handleSwapLocations = () => {
    const temp = formOrigin;
    setFormOrigin(formDestination);
    setFormDestination(temp);
  };

  const passengerSummary = useMemo(() => {
    const adultsText = `${formAdults} Adult${parseInt(formAdults) !== 1 ? 's' : ''}`;
    const childrenText = parseInt(formChildren) > 0 ? `, ${formChildren} Child${parseInt(formChildren) !== 1 ? 'ren' : ''}` : '';
    const infantsText = parseInt(formInfants) > 0 ? `, ${formInfants} Infant${parseInt(formInfants) !== 1 ? 's' : ''}` : '';
    const travelClassText = travelClassMap[formTravelClass] || "Economy";
    return `${adultsText}${childrenText}${infantsText}, ${travelClassText}`;
  }, [formAdults, formChildren, formInfants, formTravelClass]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]">
        <Plane className="w-24 h-24 text-white animate-pulse mb-6" />
        <h2 className="text-2xl font-headline text-white mb-2">Searching for Skies...</h2>
        <p className="text-white/80">Please wait while we find the best flights for you.</p>
        <div className="w-full max-w-4xl mt-8 space-y-4">
          <Skeleton className="h-20 w-full bg-white/10" />
          <Skeleton className="h-40 w-full bg-white/10" />
          <Skeleton className="h-40 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]">
         <AlertCircle className="w-24 h-24 text-red-400 mb-6" />
        <h2 className="text-2xl font-headline text-red-400 mb-2">Oops! Something Went Wrong.</h2>
        <Alert variant="destructive" className="max-w-md text-left bg-red-500/20 border-red-500/50 text-red-300">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-300">Error Fetching Flights</AlertTitle>
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
        <Button
            onClick={handleHeaderSearch} 
            variant="outline"
            className="mt-8 bg-white/10 border-white/50 text-white hover:bg-white/20"
          >
            Try a Different Search
        </Button>
      </div>
    );
  }
  
  const currentFlightsToDisplay = filteredFlights;

  if (currentFlightsToDisplay.length === 0 && !loading) {
    return (
      <div className="flex flex-col flex-1 bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]">
        <header ref={headerRef} className="bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63] text-primary-foreground py-1 shadow-md sticky top-0 z-30">
            <div className="max-w-screen-xl mx-auto px-4 space-y-1.5">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-1 items-stretch">
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label htmlFor="tripTypeHeader" className="text-xs text-white opacity-90 block mb-0.5">TRIP TYPE</Label>
                        <Select value={formIsRoundTrip ? "roundTrip" : "oneWay"} onValueChange={(value) => setFormIsRoundTrip(value === "roundTrip")}>
                            <SelectTrigger id="tripTypeHeader" className="h-auto text-sm bg-transparent border-0 text-white focus:ring-0 focus:ring-offset-0 px-0 py-0.5 font-medium">
                                <SelectValue placeholder="Trip Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="oneWay">One Way</SelectItem>
                                <SelectItem value="roundTrip">Round Trip</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label htmlFor="formOriginHeader" className="text-xs text-white opacity-90 block mb-0.5">FROM</Label>
                        <Select value={formOrigin} onValueChange={setFormOrigin}>
                            <SelectTrigger id="formOriginHeader" className="h-auto text-sm bg-transparent border-0 text-white focus:ring-0 focus:ring-offset-0 px-0 py-0.5 font-medium truncate">
                                <SelectValue placeholder="Origin" />
                            </SelectTrigger>
                            <SelectContent>
                                {popularIndianAirports.map(airport => (
                                    <SelectItem key={airport.iata} value={airport.iata}>{airport.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center self-stretch">
                        <Button variant="ghost" size="icon" onClick={handleSwapLocations} className="h-7 w-7 text-white hover:bg-white/20 hover:text-white rounded-full">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label htmlFor="formDestinationHeader" className="text-xs text-white opacity-90 block mb-0.5">TO</Label>
                         <Select value={formDestination} onValueChange={setFormDestination}>
                            <SelectTrigger id="formDestinationHeader" className="h-auto text-sm bg-transparent border-0 text-white focus:ring-0 focus:ring-offset-0 px-0 py-0.5 font-medium truncate">
                                <SelectValue placeholder="Destination" />
                            </SelectTrigger>
                            <SelectContent>
                                {popularIndianAirports.map(airport => (
                                    <SelectItem key={airport.iata} value={airport.iata}>{airport.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label className="text-xs text-white opacity-90 block mb-0.5">DEPART</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-auto text-sm bg-transparent border-0 text-white hover:bg-transparent focus:ring-0 focus:ring-offset-0 px-0 py-0.5 w-full justify-start font-medium">
                                    <CalendarIconLucide className="mr-1.5 h-3.5 w-3.5 text-white opacity-70 flex-shrink-0" />
                                    <span className="truncate text-white">
                                        {formDepartureDate ? formatDateForDisplay(formDepartureDate) : "Select Date"}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formDepartureDate ? parseISO(formDepartureDate) : undefined}
                                    onSelect={(date) => date && setFormDepartureDate(format(date, "yyyy-MM-dd"))}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className={cn("rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5", !formIsRoundTrip && "opacity-50")}>
                        <Label className="text-xs text-white opacity-90 block mb-0.5">RETURN</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={!formIsRoundTrip}>
                                <Button variant="ghost" className="h-auto text-sm bg-transparent border-0 text-white hover:bg-transparent focus:ring-0 focus:ring-offset-0 px-0 py-0.5 w-full justify-start font-medium disabled:opacity-70">
                                    <CalendarIconLucide className="mr-1.5 h-3.5 w-3.5 text-white opacity-70 flex-shrink-0" />
                                    <span className="truncate text-white">
                                        {formReturnDate && formIsRoundTrip ? formatDateForDisplay(formReturnDate) : <span className="opacity-70">Select Return</span>}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formReturnDate ? parseISO(formReturnDate) : undefined}
                                    onSelect={(date) => date && setFormReturnDate(format(date, "yyyy-MM-dd"))}
                                    initialFocus
                                    disabled={(date) => date < (formDepartureDate ? parseISO(formDepartureDate) : new Date(new Date().setHours(0,0,0,0)))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label className="text-xs text-white opacity-90 block mb-0.5">PASSENGERS &amp; CLASS</Label>
                        <Popover open={passengerPopoverOpen} onOpenChange={setPassengerPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-auto text-sm bg-transparent border-0 text-white hover:bg-transparent focus:ring-0 focus:ring-offset-0 px-0 py-0.5 w-full justify-start font-medium truncate">
                                    {passengerSummary}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 space-y-3">
                                <div className="text-lg font-semibold mb-2">Select Passengers &amp; Class</div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Adults (12+ yrs)</Label>
                                    <Select value={formAdults} onValueChange={setFormAdults}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[...Array(9)].map((_,i) => <SelectItem key={`adult-h-${i+1}`} value={String(i+1)}>{i+1} Adult{i > 0 ? 's' : ''}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Children (2-12 yrs)</Label>
                                    <Select value={formChildren} onValueChange={setFormChildren}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[...Array(10)].map((_,i) => <SelectItem key={`child-h-${i}`} value={String(i)}>{i} {i === 1 ? 'Child' : 'Children'}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Infants (0-2 yrs)</Label>
                                    <Select value={formInfants} onValueChange={setFormInfants}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[...Array(5)].map((_,i) => <SelectItem key={`infant-h-${i}`} value={String(i)}>{i} {i === 1 ? 'Infant' : 'Infants'}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Travel Class</Label>
                                    <Select value={formTravelClass} onValueChange={setFormTravelClass}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(travelClassMap).map(([key, name]) => (
                                                <SelectItem key={key} value={key}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={() => setPassengerPopoverOpen(false)} className="w-full mt-3 bg-accent hover:bg-accent/90">Done</Button>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button 
                        onClick={handleHeaderSearch} 
                        className="bg-slate-200 hover:bg-slate-300 text-white font-bold rounded-lg h-full text-center leading-tight px-2 py-0.5 text-sm lg:px-2 lg:py-0.5"
                    >
                        SEARCH
                    </Button>
                </div>
              </div>
            </div>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
            <Briefcase className="w-24 h-24 text-white/60 mb-6" />
            <h2 className="text-2xl font-headline text-white mb-2">No Flights Found</h2>
            <p className="text-white/80 max-w-md mb-8">
            We couldn't find any flights matching your criteria. Try adjusting your filters or search parameters with the form above.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]">
      <header ref={headerRef} className="bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63] text-primary-foreground py-1 shadow-md sticky top-0 z-30">
            <div className="max-w-screen-xl mx-auto px-4 space-y-1.5">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-1 items-stretch">
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label htmlFor="tripTypeHeaderForm" className="text-xs text-white opacity-90 block mb-0.5">TRIP TYPE</Label>
                        <Select value={formIsRoundTrip ? "roundTrip" : "oneWay"} onValueChange={(value) => setFormIsRoundTrip(value === "roundTrip")}>
                            <SelectTrigger id="tripTypeHeaderForm" className="h-auto text-sm bg-transparent border-0 text-white focus:ring-0 focus:ring-offset-0 px-0 py-0.5 font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="oneWay">One Way</SelectItem>
                                <SelectItem value="roundTrip">Round Trip</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label htmlFor="formOriginHeaderForm" className="text-xs text-white opacity-90 block mb-0.5">FROM</Label>
                        <Select value={formOrigin} onValueChange={setFormOrigin}>
                            <SelectTrigger id="formOriginHeaderForm" className="h-auto text-sm bg-transparent border-0 text-white focus:ring-0 focus:ring-offset-0 px-0 py-0.5 font-medium truncate">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {popularIndianAirports.map(airport => (
                                    <SelectItem key={airport.iata} value={airport.iata}>{airport.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center self-stretch">
                        <Button variant="ghost" size="icon" onClick={handleSwapLocations} className="h-7 w-7 text-white hover:bg-white/20 hover:text-white rounded-full">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label htmlFor="formDestinationHeaderForm" className="text-xs text-white opacity-90 block mb-0.5">TO</Label>
                         <Select value={formDestination} onValueChange={setFormDestination}>
                            <SelectTrigger id="formDestinationHeaderForm" className="h-auto text-sm bg-transparent border-0 text-white focus:ring-0 focus:ring-offset-0 px-0 py-0.5 font-medium truncate">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {popularIndianAirports.map(airport => (
                                    <SelectItem key={airport.iata} value={airport.iata}>{airport.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label className="text-xs text-white opacity-90 block mb-0.5">DEPART</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-auto text-sm bg-transparent border-0 text-white hover:bg-transparent focus:ring-0 focus:ring-offset-0 px-0 py-0.5 w-full justify-start font-medium">
                                   <CalendarIconLucide className="mr-1.5 h-3.5 w-3.5 text-white opacity-70 flex-shrink-0" />
                                   <span className="truncate text-white">
                                    {formDepartureDate ? formatDateForDisplay(formDepartureDate) : "Select Date"}
                                   </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formDepartureDate ? parseISO(formDepartureDate) : undefined}
                                    onSelect={(date) => date && setFormDepartureDate(format(date, "yyyy-MM-dd"))}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className={cn("rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5", !formIsRoundTrip && "opacity-50")}>
                        <Label className="text-xs text-white opacity-90 block mb-0.5">RETURN</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={!formIsRoundTrip}>
                                <Button variant="ghost" className="h-auto text-sm bg-transparent border-0 text-white hover:bg-transparent focus:ring-0 focus:ring-offset-0 px-0 py-0.5 w-full justify-start font-medium disabled:opacity-70">
                                   <CalendarIconLucide className="mr-1.5 h-3.5 w-3.5 text-white opacity-70 flex-shrink-0" />
                                    <span className="truncate text-white">
                                     {formReturnDate && formIsRoundTrip ? formatDateForDisplay(formReturnDate) : <span className="opacity-70">Select Return</span>}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formReturnDate ? parseISO(formReturnDate) : undefined}
                                    onSelect={(date) => date && setFormReturnDate(format(date, "yyyy-MM-dd"))}
                                    initialFocus
                                    disabled={(date) => date < (formDepartureDate ? parseISO(formDepartureDate) : new Date(new Date().setHours(0,0,0,0)))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="rounded-md bg-white/10 flex flex-col justify-between p-1 lg:px-1 lg:py-0.5">
                        <Label className="text-xs text-white opacity-90 block mb-0.5">PASSENGERS &amp; CLASS</Label>
                        <Popover open={passengerPopoverOpen} onOpenChange={setPassengerPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-auto text-sm bg-transparent border-0 text-white hover:bg-transparent focus:ring-0 focus:ring-offset-0 px-0 py-0.5 w-full justify-start font-medium truncate">
                                    {passengerSummary}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 space-y-3">
                                <div className="text-lg font-semibold mb-2">Select Passengers &amp; Class</div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Adults (12+ yrs)</Label>
                                    <Select value={formAdults} onValueChange={setFormAdults}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[...Array(9)].map((_,i) => <SelectItem key={`adult-h-${i+1}`} value={String(i+1)}>{i+1} Adult{i > 0 ? 's' : ''}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Children (2-12 yrs)</Label>
                                    <Select value={formChildren} onValueChange={setFormChildren}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[...Array(10)].map((_,i) => <SelectItem key={`child-h-${i}`} value={String(i)}>{i} {i === 1 ? 'Child' : 'Children'}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Infants (0-2 yrs)</Label>
                                    <Select value={formInfants} onValueChange={setFormInfants}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>{[...Array(5)].map((_,i) => <SelectItem key={`infant-h-${i}`} value={String(i)}>{i} {i === 1 ? 'Infant' : 'Infants'}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-normal">Travel Class</Label>
                                    <Select value={formTravelClass} onValueChange={setFormTravelClass}>
                                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(travelClassMap).map(([key, name]) => (
                                                <SelectItem key={key} value={key}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={() => setPassengerPopoverOpen(false)} className="w-full mt-3 bg-accent hover:bg-accent/90">Done</Button>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button 
                        onClick={handleHeaderSearch} 
                        className="bg-slate-200 hover:bg-slate-300 text-white font-bold rounded-lg h-full text-center leading-tight px-2 py-0.5 text-sm lg:px-2 lg:py-0.5"
                    >
                        SEARCH
                    </Button>
                </div>
              </div>
            </div>
      </header>
      <div className="max-w-screen-xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        <aside 
          className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky self-start h-[calc(100vh-var(--header-actual-height,180px)-3rem)] overflow-y-auto pr-2"
          style={{ top: `calc(${headerHeight}px + 1.5rem)` }}
        > 
          <div className="bg-white shadow-xl rounded-lg p-4">
            <Collapsible open={isAppliedFiltersOpen} onOpenChange={setIsAppliedFiltersOpen} defaultOpen className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <CollapsibleTrigger className="flex-1 text-left">
                        <h3 className="text-md font-headline font-semibold text-gray-700">Applied Filters</h3>
                    </CollapsibleTrigger>
                    <Button variant="link" className="text-xs p-0 h-auto text-primary hover:text-accent" onClick={clearAllFilters}>Clear All</Button>
                </div>
                <CollapsibleContent className="space-y-2 animate-slide-down">
                    {(stopFilters["0"] && !stopFilters["1"] && !stopFilters["2+"]) && (
                        <div className="flex items-center justify-between p-1.5 bg-accent/10 rounded-md text-xs text-accent border border-accent/20">
                            <span>Non Stop</span>
                            <Button variant="ghost" size="icon" className="w-5 h-5 text-accent" onClick={() => {
                                setStopFilters({ "0": true, "1": true, "2+": true }); 
                                const currentParams = new URLSearchParams(searchParams.toString());
                                currentParams.delete("nonStop");
                                router.push(`/flights/search?${currentParams.toString()}`);
                            }}><X className="w-3 h-3"/></Button>
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
            <Collapsible open={isPopularFiltersOpen} onOpenChange={setIsPopularFiltersOpen} defaultOpen className="mb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-md font-headline font-semibold text-gray-700 hover:text-accent transition-colors mb-2">
                <span>Popular Filters</span>
                {isPopularFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2.5 mt-1 animate-slide-down">
                {["0", "1", "2+"].map((stopKey) => (
                  <div key={stopKey} className="flex items-center gap-2.5">
                    <Checkbox
                      id={`stop-filter-${stopKey}`}
                      checked={stopFilters[stopKey]}
                      onCheckedChange={() => handleStopFilterChange(stopKey)}
                      className="border-gray-400 data-[state=checked]:bg-accent data-[state=checked]:border-accent focus:ring-accent w-4 h-4 rounded"
                      aria-label={`Filter by ${stopKey === "0" ? "non-stop" : stopKey === "1" ? "1 stop" : "2+ stops"}`}
                    />
                    <label htmlFor={`stop-filter-${stopKey}`} className="text-sm font-medium text-gray-700 hover:text-accent transition-colors cursor-pointer">
                      {stopKey === "0" ? "Non-stop" : stopKey === "1" ? "1 Stop" : "2+ Stops"}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
            <Separator className="my-4 bg-gray-200"/>
            <Collapsible open={isDepartureAirportsOpen} onOpenChange={setIsDepartureAirportsOpen} className="mb-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-md font-headline font-semibold text-gray-700 hover:text-accent transition-colors mb-2">
                    <span>Departure Airports</span>
                    {isDepartureAirportsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2.5 mt-1 animate-slide-down">
                    <div className="flex items-center gap-2.5">
                        <Checkbox id="dep-airport-1" className="border-gray-400 data-[state=checked]:bg-accent data-[state=checked]:border-accent focus:ring-accent w-4 h-4 rounded"/>
                        <label htmlFor="dep-airport-1" className="text-sm font-medium text-gray-700 hover:text-accent transition-colors cursor-pointer">Hindon Airport (DZKm)</label>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Checkbox id="dep-airport-2" className="border-gray-400 data-[state=checked]:bg-accent data-[state=checked]:border-accent focus:ring-accent w-4 h-4 rounded"/>
                        <label htmlFor="dep-airport-2" className="text-sm font-medium text-gray-700 hover:text-accent transition-colors cursor-pointer">Indira Gandhi Intl Airport</label>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            <Separator className="my-4 bg-gray-200"/>
            <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen} defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-md font-headline font-semibold text-gray-700 hover:text-accent transition-colors mb-2">
                <span>One Way Price</span>
                {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2.5 mt-3 animate-slide-down px-1">
                 <Slider
                    value={priceRange}
                    min={initialMinPrice}
                    max={initialMaxPrice}
                    step={100}
                    onValueChange={(value) => setPriceRange(value as [number, number])} 
                    className="[&>span]:bg-accent [&>span>span]:bg-accent-foreground [&>span>span]:border-accent"
                    disabled={flights.length === 0 || initialMinPrice >= initialMaxPrice}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>
        <div className="lg:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2 text-white border-accent hover:bg-accent/10 font-semibold py-3 rounded-lg">
                <Filter className="w-5 h-5 text-accent" />
                Filters & Sort
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-4 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-lg font-headline font-semibold text-gray-800 flex items-center gap-2">
                   <Filter className="w-5 h-5 text-accent" /> Refine Your Search
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-5">
                 <Collapsible open={isPopularFiltersOpen} onOpenChange={setIsPopularFiltersOpen} defaultOpen className="mb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-accent transition-colors">
                        <span>Popular Filters</span>
                        {isPopularFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2.5 mt-2.5 animate-slide-down">
                        {["0", "1", "2+"].map((stop) => (
                        <div key={`stop-mobile-${stop}`} className="flex items-center gap-2.5">
                            <Checkbox
                            id={`stop-filter-mobile-${stop}`}
                            checked={stopFilters[stop]}
                            onCheckedChange={() => handleStopFilterChange(stop)}
                            className="border-gray-400 data-[state=checked]:bg-accent data-[state=checked]:border-accent focus:ring-accent w-4 h-4 rounded"
                            aria-label={`Filter by ${stop === "0" ? "non-stop" : stop === "1" ? "1 stop" : "2+ stops"}`}
                            />
                            <label htmlFor={`stop-filter-mobile-${stop}`} className="text-xs font-medium text-gray-700 hover:text-accent transition-colors cursor-pointer">
                            {stop === "0" ? "Non-stop" : stop === "1" ? "1 Stop" : "2+ Stops"}
                            </label>
                        </div>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
                <Separator className="bg-gray-200"/>
                <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen} defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-accent transition-colors">
                    <span>One Way Price</span>
                    {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2.5 mt-3 animate-slide-down px-1">
                     <Slider
                        value={priceRange}
                        min={initialMinPrice}
                        max={initialMaxPrice}
                        step={100}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="[&>span]:bg-accent [&>span>span]:bg-accent-foreground [&>span>span]:border-accent"
                        disabled={flights.length === 0 || initialMinPrice >= initialMaxPrice}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Separator className="bg-gray-200"/>
                <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 block">Sort by:</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            {key: "cheapest", label: "Cheapest", icon: Zap},
                            {key: "nonStopFirst", label: "Non Stop First", icon: Plane},
                            {key: "youMayPrefer", label: "You May Prefer", icon: Heart},
                            {key: "otherSort", label: "Other Sort", icon: MoreHorizontal}
                        ].map(tab => (
                             <Button key={tab.key} variant={activeSortTab === tab.key ? "default" : "outline"} size="sm" onClick={() => handleSortTabChange(tab.key)} 
                             className={cn("text-xs h-auto py-1.5 px-2.5 flex-col items-center justify-center h-16", activeSortTab === tab.key ? "bg-accent text-accent-foreground border-accent" : "border-input text-gray-700")}>
                                <tab.icon className="w-5 h-5 mb-1"/>{tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex-1">
          <h2 className="text-xl font-headline font-semibold text-white mb-3">Flights from {queryOrigin} to {queryDestination}</h2>
          <div className="hidden lg:flex items-stretch gap-1 mb-5 p-1 bg-white rounded-lg shadow-md border">
            {[
              { key: "cheapest", label: "Cheapest", icon: Zap, price: filteredFlights.length > 0 ? `₹${parseFloat(filteredFlights.slice().sort((a,b) => parseFloat(a.price.total) - parseFloat(b.price.total))[0]?.price.total).toFixed(0)}` : "N/A", duration: filteredFlights.length > 0 ? filteredFlights.slice().sort((a,b) => parseFloat(a.price.total) - parseFloat(b.price.total))[0]?.itineraries[0].duration.replace("PT","").replace("H","h ").replace("M","m") : "" },
              { key: "nonStopFirst", label: "Non Stop First", icon: Plane, price: filteredFlights.filter(f => f.itineraries[0].segments.length - 1 === 0).length > 0 ? `₹${parseFloat(filteredFlights.filter(f => f.itineraries[0].segments.length - 1 === 0).sort((a,b) => parseFloat(a.price.total) - parseFloat(b.price.total))[0]?.price.total).toFixed(0)}` : "N/A", duration: filteredFlights.filter(f => f.itineraries[0].segments.length - 1 === 0).length > 0 ? filteredFlights.filter(f => f.itineraries[0].segments.length - 1 === 0).sort((a,b) => parseFloat(a.price.total) - parseFloat(b.price.total))[0]?.itineraries[0].duration.replace("PT","").replace("H","h ").replace("M","m") : "" },
              { key: "youMayPrefer", label: "You May Prefer", icon: Heart, price: filteredFlights.length > 0 ? `₹${parseFloat(filteredFlights.slice().sort((a,b) => (parseDuration(a.itineraries[0].duration) + (a.itineraries[0].segments.length - 1)*300) - (parseDuration(b.itineraries[0].duration) + (b.itineraries[0].segments.length - 1)*300) )[0]?.price.total).toFixed(0)}` : "N/A", duration: filteredFlights.length > 0 ? filteredFlights.slice().sort((a,b) => (parseDuration(a.itineraries[0].duration) + (a.itineraries[0].segments.length - 1)*300) - (parseDuration(b.itineraries[0].duration) + (b.itineraries[0].segments.length - 1)*300) )[0]?.itineraries[0].duration.replace("PT","").replace("H","h ").replace("M","m") : "" }, 
              { key: "otherSort", label: "Other Sort", icon: MoreHorizontal, price: "", duration: "" }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeSortTab === tab.key ? "default" : "ghost"}
                onClick={() => handleSortTabChange(tab.key)}
                className={cn("text-xs font-medium h-auto py-2 px-3 rounded-md flex flex-col items-center justify-center flex-1 text-center",
                  activeSortTab === tab.key ? "bg-accent text-accent-foreground shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                {tab.label}
                {(tab.price || tab.duration) && (tab.price !== "N/A") && <span className="text-xxs opacity-80 mt-0.5">{tab.price}{tab.price && tab.duration && " | "}{tab.duration}</span>}
                 {(tab.price === "N/A") && <span className="text-xxs opacity-80 mt-0.5">Not Available</span>}
              </Button>
            ))}
          </div>
          <div className="mb-4 ml-1">
            <p className="text-sm text-white opacity-80">{filteredFlights.length} flights found</p>
            <p className="text-xs text-white opacity-80">Flights sorted by {sortOption.replace(/([A-Z])/g, ' $1').toLowerCase().replace("non stop", "non-stop")} on this route.</p>
          </div>
          <div className="mb-4 p-2 bg-accent/20 border border-accent/30 rounded-md text-center">
                <p className="text-sm text-accent-foreground font-medium">
                    ✨ Get FLAT ₹189 OFF using MMTSUPER | Upto 10% Off on UPI payment using code AVALUPI
                </p>
            </div>
          <div className="space-y-4">
            {currentFlightsToDisplay.map((flight) => {
                const numAdults = parseInt(queryAdults) || 1; 
                const pricePerAdult = (parseFloat(flight.price.total) / numAdults).toFixed(2);
                const displayItineraryIndex = queryIsRoundTrip && selectedOutbound ? 1 : 0;
                const itinerary = flight.itineraries[displayItineraryIndex];

                if (!itinerary) return null; 

                return (
                <Card
                  key={`${flight.id}-${displayItineraryIndex}`}
                  className={cn(
                    "overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-white"
                  )}
                  role="region"
                  aria-label={`Flight offer ${flight.id} ${queryIsRoundTrip && selectedOutbound ? "return" : "outbound"}`}
                >
                  <CardContent className="p-3 md:p-4">
                      <div className="mb-0 last:mb-0">
                        {queryIsRoundTrip && (
                          <h3 className="text-md font-headline font-semibold text-gray-800 mb-2 border-b pb-1.5">
                            {selectedOutbound ? "Return Journey" : "Outbound Journey"}
                          </h3>
                        )}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div className="flex items-center gap-2 mb-2 md:mb-0 w-full md:w-auto">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                                  {itinerary.segments[0].carrierCode}
                              </div>
                              <div>
                                  <div className="text-sm font-semibold text-gray-800">
                                      {itinerary.segments[0].carrierCode} Airlines 
                                  </div>
                                  <div className="text-xxs text-gray-500">
                                      {itinerary.segments.map(s => `${s.carrierCode}-${s.number}`).join(', ')}
                                  </div>
                              </div>
                          </div>
                          <div className="flex flex-1 items-center justify-around gap-2 w-full md:w-auto">
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold text-gray-900">
                                    {format(new Date(itinerary.segments[0].departure.at), "HH:mm")}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {itinerary.segments[0].departure.iataCode}
                                </div>
                            </div>
                            <div className="flex-grow flex flex-col items-center justify-center px-2 min-w-[80px] md:min-w-[100px]">
                                <div className="text-xs font-medium text-gray-600">
                                    {itinerary.duration.replace("PT", "").replace("H", "h ").replace("M", "m")}
                                </div>
                                <div className="w-full h-px bg-gray-300 relative my-1">
                                    {itinerary.segments.length -1 > 0 && Array.from({length: itinerary.segments.length -1}).map((_,i) => (
                                        <div key={i} className="absolute h-1.5 w-1.5 bg-gray-500 rounded-full top-1/2 -translate-y-1/2" style={{left: `${(i+1) * (100/(itinerary.segments.length))}%`}}></div>
                                    ))}
                                </div>
                                <div className="text-xs font-medium text-blue-600">
                                    {getStopsLabel(itinerary.segments)}
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <div className="text-xl font-bold text-gray-900">
                                    {format(new Date(itinerary.segments[itinerary.segments.length - 1].arrival.at), "HH:mm")}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}
                                </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center md:items-end justify-between gap-2 w-full md:w-auto md:min-w-[150px] mt-3 md:mt-0">
                                <div className="text-xl md:text-2xl font-extrabold text-gray-900 text-center md:text-right">
                                    ₹{pricePerAdult}
                                </div>
                                {parseInt(queryAdults) > 0 && <p className="text-xxs text-gray-500 -mt-1">per adult</p> }
                                {queryIsRoundTrip && !selectedOutbound ? (
                                <Button
                                    onClick={() => handleSelectFlight(flight.id, 0)}
                                    className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold px-4 py-2 rounded-md shadow-sm"
                                    aria-label={`Select outbound flight ${flight.id}`}
                                >
                                    Select Outbound
                                </Button>
                                ) : (
                                <Button
                                    onClick={() => handleSelectFlight(flight.id, displayItineraryIndex)}
                                    className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold px-4 py-2 rounded-md shadow-sm"
                                    aria-label={`View prices for flight ${flight.id}`}
                                >
                                    {queryIsRoundTrip && selectedOutbound ? 'Select Return' : 'View Prices'}
                                </Button>
                                )}
                           </div>
                        </div>
                        <div className="mt-3 border-t border-gray-200 pt-2">
                           <div className="flex justify-between items-center">
                             <Button variant="link" className="text-xs p-0 h-auto text-blue-600 hover:text-blue-700">Add to compare +</Button>
                             <Collapsible>
                                <CollapsibleTrigger
                                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors duration-300"
                                    onClick={() => setExpandedFlight(expandedFlight === `${flight.id}-${displayItineraryIndex}` ? null : `${flight.id}-${displayItineraryIndex}`)}
                                    aria-expanded={expandedFlight === `${flight.id}-${displayItineraryIndex}`}
                                    aria-controls={`flight-details-${flight.id}-${displayItineraryIndex}`}
                                >
                                    {expandedFlight === `${flight.id}-${displayItineraryIndex}` ? "Hide Details" : "View Flight Details"}
                                    {expandedFlight === `${flight.id}-${displayItineraryIndex}` ? (
                                    <ChevronUp className="w-3 h-3" />
                                    ) : (
                                    <ChevronDown className="w-3 h-3" />
                                    )}
                                </CollapsibleTrigger>
                                <CollapsibleContent id={`flight-details-${flight.id}-${displayItineraryIndex}`} className="mt-2 space-y-2 animate-slide-down bg-gray-100/70 p-2 rounded-md">
                                    {itinerary.segments.map((segment, segIdx) => (
                                    <div
                                        key={segment.id}
                                        className="text-xxs text-gray-500 border-l-2 border-accent/50 pl-2 py-1"
                                    >
                                        <div className="flex items-center gap-1 font-medium text-gray-800">
                                        <MapPin className="w-3 h-3 text-accent" />
                                        <span>
                                            {format(new Date(segment.departure.at), "HH:mm")} ({segment.departure.iataCode}) →{" "}
                                            {format(new Date(segment.arrival.at), "HH:mm")} ({segment.arrival.iataCode})
                                        </span>
                                        </div>
                                        <div className="text-xxs mt-0.5 ml-[0.875rem]">Flight: {segment.carrierCode} {segment.number}</div>
                                        <div className="flex items-center gap-1 mt-0.5 ml-[0.875rem]">
                                        <Clock className="w-3 h-3 text-accent" />
                                        Duration: {segment.duration.replace("PT", "").replace("H", "h ").replace("M", "m")}
                                        </div>
                                        {segIdx < itinerary.segments.length - 1 && itinerary.segments[segIdx + 1] && (
                                        <div className="mt-1 text-gray-500/80 ml-[0.875rem]">
                                            Layover at: {itinerary.segments[segIdx].arrival.iataCode} for {
                                                (() => {
                                                    const arrivalTime = new Date(segment.arrival.at).getTime();
                                                    const nextDepartureTime = new Date(itinerary.segments[segIdx+1].departure.at).getTime();
                                                    const layoverMillis = nextDepartureTime - arrivalTime;
                                                    const layoverHours = Math.floor(layoverMillis / (1000 * 60 * 60));
                                                    const layoverMinutes = Math.floor((layoverMillis % (1000 * 60 * 60)) / (1000 * 60));
                                                    return `${layoverHours}h ${layoverMinutes}m`;
                                                })()
                                            } (Departs:{" "}
                                            {format(new Date(itinerary.segments[segIdx + 1].departure.at), "HH:mm, d MMM")})
                                        </div>
                                        )}
                                    </div>
                                    ))}
                                </CollapsibleContent>
                                </Collapsible>
                           </div>
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-xs text-accent-foreground/90 bg-accent/30 p-1.5 rounded-md">
                                ✨ Get FLAT ₹{Math.floor(parseFloat(flight.price.total) * 0.02 + Math.random()*50).toFixed(0)} OFF using SpecificCard | Upto 10% Off on UPI
                            </p>
                        </div>
                      </div>
                  </CardContent>
                </Card>
                );
            })}
          </div>
        </main>
      </div>
      <footer className="mt-12 py-8 bg-card text-center text-muted-foreground border-t">
        <p className="text-sm font-medium">
          © {new Date().getFullYear()} Horizon Stays. All rights reserved.
        </p>
        <p className="text-xs mt-1">Flight data provided by Amadeus Self-Service APIs (Test Environment).</p>
      </footer>
      <style jsx global>{`
        :root {
          --header-actual-height: ${headerHeight}px;
        }
      `}</style>
    </div>
  );
}

export default function FlightResultsClient() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]">
        <Plane className="w-24 h-24 text-white animate-pulse mb-6" />
        <h2 className="text-2xl font-headline text-white mb-2">Loading Flight Details...</h2>
        <p className="text-white/80">One moment please.</p>
      </div>
    }>
      <TooltipProvider>
        <FlightResultsClientInternal />
      </TooltipProvider>
    </Suspense>
  );
}
