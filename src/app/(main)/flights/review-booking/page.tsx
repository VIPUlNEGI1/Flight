
"use client";

import { Suspense, useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, Clock, Briefcase, Gift, Tag, PlusCircle, ChevronDown, CheckCircle, Info, Settings2, CreditCard, User, Percent, ShoppingBag, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface SegmentDetail {
    departureAt: string;
    departureIata: string;
    arrivalAt: string;
    arrivalIata: string;
    duration: string;
    carrierCode: string;
    number: string;
}


function ReviewBookingContent() {
    const searchParams = useSearchParams();

    const flightId = searchParams.get('flightId');
    const fareName = searchParams.get('fareName');
    const farePrice = searchParams.get('farePrice'); 
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const arrivalDate = searchParams.get('arrivalDate');
    const duration = searchParams.get('duration'); 
    const airlineName = searchParams.get('airlineName'); 
    const flightNumber = searchParams.get('flightNumber'); 
    const stops = searchParams.get('stops');
    const cabinBaggage = searchParams.get('cabinBaggage');
    const checkInBaggage = searchParams.get('checkInBaggage');
    const aircraftType = searchParams.get('aircraftType');
    const numSegments = parseInt(searchParams.get('numSegments') || "0");

    const [clientBaseFare, setClientBaseFare] = useState<number | null>(null);
    const [clientTaxesAndSurcharges, setClientTaxesAndSurcharges] = useState<number | null>(null);
    const [clientTotalFare, setClientTotalFare] = useState<number | null>(null);
    const [cancellationFeeNow, setCancellationFeeNow] = useState<number | null>(null);
    const [cancellationFeeLater, setCancellationFeeLater] = useState<number | null>(null);


    useEffect(() => {
        const totalFareNum = parseFloat(farePrice || "0");
        if (!isNaN(totalFareNum) && totalFareNum > 0) {
            const randomFactor = 0.65 + Math.random() * 0.1; 
            const base = totalFareNum * randomFactor;
            const taxes = totalFareNum - base;
            setClientBaseFare(base);
            setClientTaxesAndSurcharges(taxes);
            setClientTotalFare(totalFareNum);

            setCancellationFeeNow(totalFareNum * (0.50 + Math.random() * 0.10)); 
            setCancellationFeeLater(totalFareNum * (0.75 + Math.random() * 0.10)); 
        }
    }, [farePrice]);


    const segments: SegmentDetail[] = [];
    for (let i = 0; i < numSegments; i++) {
        segments.push({
            departureAt: searchParams.get(`segment_${i}_departureAt`) || "",
            departureIata: searchParams.get(`segment_${i}_departureIata`) || "",
            arrivalAt: searchParams.get(`segment_${i}_arrivalAt`) || "",
            arrivalIata: searchParams.get(`segment_${i}_arrivalIata`) || "",
            duration: searchParams.get(`segment_${i}_duration`) || "",
            carrierCode: searchParams.get(`segment_${i}_carrierCode`) || "",
            number: searchParams.get(`segment_${i}_number`) || "",
        });
    }

    const formattedDepartureDayDate = departureDate ? format(parseISO(departureDate), "iiii, MMM d") : 'N/A';
    const flightDuration = duration ? duration.replace("PT", "").replace("H", "h ").replace("M", "m") : 'N/A';
    const stopsLabel = stops === "0" ? "Non Stop" : `${stops} Stop${parseInt(stops || "0") > 1 ? 's' : ''}`;

    const airportNames: { [key: string]: { name: string, city: string, terminal?: string } } = {
        "DEL": { name: "Indira Gandhi International Airport", city: "New Delhi", terminal: "T1" },
        "BOM": { name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", terminal: "T2" },
        "BLR": { name: "Kempegowda International Airport", city: "Bengaluru", terminal: "T1" },
        "MAA": { name: "Chennai International Airport", city: "Chennai", terminal: "T1" },
        "MEL": { name: "Melbourne Airport", city: "Melbourne", terminal: "T2" },
        "SYD": { name: "Sydney Kingsford Smith Airport", city: "Sydney", terminal: "T1" },
    };

    const getAirportDisplayName = (iataCode: string, type: 'full' | 'city' = 'full') => {
        const airportInfo = airportNames[iataCode];
        if (airportInfo) {
            if (type === 'city') return airportInfo.city;
            return `${airportInfo.city}, ${airportInfo.name}${airportInfo.terminal ? `, Terminal ${airportInfo.terminal}` : ''}`;
        }
        return iataCode;
    };
    
    const airlineDisplayCode = segments[0]?.carrierCode || airlineName?.split(" ")[0] || "";

    const tabs = ['Flights Summary', 'Travel Insurance', 'Traveller Details', 'Seats & Meals', 'Add-ons'];
    const activeTab = 'Flights Summary';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]">
            <div className="bg-[#031f2d]/80 backdrop-blur-sm text-white py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-2xl font-semibold mb-3">Complete your booking</h1>
                    <div className="flex border-b border-white/30 space-x-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={cn(
                                    "pb-2 px-3 text-sm font-medium focus:outline-none",
                                    activeTab === tab
                                        ? "border-b-2 border-white text-white"
                                        : "text-white/70 hover:text-white"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-card/70 backdrop-blur-sm border-border text-card-foreground shadow-lg overflow-hidden">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{getAirportDisplayName(segments[0]?.departureIata || origin || "", 'city')} → {getAirportDisplayName(segments[segments.length - 1]?.arrivalIata || destination || "", 'city')}</h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formattedDepartureDayDate} <span className="mx-1">·</span> {stopsLabel} <span className="mx-1">·</span> {flightDuration}
                                        </p>
                                    </div>
                                    <Badge variant="default" className="bg-green-500 text-white text-xs px-2 py-1 font-semibold mt-1">
                                        CANCELLATION FEES APPLY
                                    </Badge>
                                </div>
                                
                                <div className="border border-border rounded-md p-3">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-primary">{airlineName?.replace(" Airlines", "") || "Airline"}</span>
                                            <span className="text-xs text-muted-foreground">{segments.map(s => `${s.carrierCode} ${s.number}`).join(', ')}</span>
                                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground">{aircraftType || "Aircraft"}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs">
                                            <span className="text-muted-foreground">Economy &gt; <span className="text-primary font-semibold">{fareName || "Fare"}</span></span>
                                            <Button variant="link" size="sm" className="text-xs text-primary hover:underline p-0 h-auto">View Fare Rules</Button>
                                        </div>
                                    </div>

                                    {segments.map((segment, idx) => (
                                        <div key={idx} className="relative pl-5 mb-3 last:mb-0 group text-sm">
                                            <div className="absolute left-0 top-[5px] w-2.5 h-2.5 bg-primary rounded-full border-2 border-background z-10 shadow"></div>
                                            {idx < segments.length - 1 && <div className="absolute left-[0.2rem] top-3 w-px h-[calc(100%-0.25rem)] bg-border group-last:hidden"></div>}
                                            
                                            <div className="flex items-baseline">
                                                <span className="font-semibold text-foreground w-12 shrink-0">{segment.departureAt ? format(parseISO(segment.departureAt), "HH:mm") : ''}</span>
                                                <span className="text-foreground/90">{getAirportDisplayName(segment.departureIata)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground ml-[3.75rem] my-0.5">
                                                {segment.duration.replace("PT","").replace("H","h ").replace("M","m")}
                                            </p>
                                            <div className="flex items-baseline">
                                                <span className="font-semibold text-foreground w-12 shrink-0">{segment.arrivalAt ? format(parseISO(segment.arrivalAt), "HH:mm") : ''}</span>
                                                <span className="text-foreground/90">{getAirportDisplayName(segment.arrivalIata)}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <Separator className="my-3 bg-border" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center"><Briefcase className="w-3.5 h-3.5 inline mr-1.5 text-primary shrink-0" />Cabin Baggage: {cabinBaggage}</div>
                                        <div className="flex items-center"><ShoppingBag className="w-3.5 h-3.5 inline mr-1.5 text-primary shrink-0" />Check-In Baggage: {checkInBaggage}</div>
                                    </div>
                                    <div className="mt-3 text-xs text-primary bg-primary/10 p-2 rounded-md flex justify-between items-center border border-primary/20">
                                        <div className="flex items-start">
                                            <Image src="https://placehold.co/20x20/64B5F6/031f2d.png?text=!" alt="info" width={16} height={16} className="inline mr-1.5 shrink-0 mt-px rounded-full" data-ai-hint="info icon"/>
                                            <span>Got excess baggage? Don't stress, buy extra check-in baggage allowance for {getAirportDisplayName(origin || "", "city")}-{getAirportDisplayName(destination || "", "city")} at fab rates!</span>
                                        </div>
                                        <Button variant="link" size="sm" className="p-0 h-auto text-primary font-semibold whitespace-nowrap ml-2 text-xs">ADD BAGGAGE</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/70 backdrop-blur-sm border-border text-card-foreground shadow-lg">
                            <CardHeader className="pb-2 pt-4 px-4 md:px-5">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base font-bold text-foreground">Cancellation & Date Change Policy</CardTitle>
                                    <Button variant="link" size="sm" className="text-primary p-0 h-auto text-xs hover:underline">View Policy</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 md:px-5 pb-4 text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                     <span className="text-sm font-bold text-primary">{airlineDisplayCode}</span>
                                     <span className="text-xs text-muted-foreground">{getAirportDisplayName(segments[0]?.departureIata || origin || "", 'city')} - {getAirportDisplayName(segments[segments.length - 1]?.arrivalIata || destination || "", 'city')}</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs text-muted-foreground">Cancellation Penalty :</span>
                                    <span className="text-sm font-semibold text-foreground">₹ {cancellationFeeNow !== null ? cancellationFeeNow.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0}) : '...'}</span>
                                </div>
                                <div className="my-4">
                                    <div className="relative h-1.5 bg-muted rounded-full">
                                        <div className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full w-full"></div>
                                        <div className="absolute top-1/2 -translate-y-1/2 left-[2%] w-2.5 h-2.5 bg-background border-2 border-green-500 rounded-full z-10"></div>
                                        <div className="absolute top-1/2 -translate-y-1/2 left-[60%] w-2.5 h-2.5 bg-background border-2 border-yellow-500 rounded-full z-10"></div>
                                        <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%-0.625rem)] w-2.5 h-2.5 bg-background border-2 border-red-500 rounded-full z-10"></div>

                                        <div className="absolute -top-4 left-[calc(60%-1.5rem)] text-center w-12 text-xs font-semibold text-foreground">
                                            ₹{cancellationFeeNow !== null ? cancellationFeeNow.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0}) : '...'}
                                        </div>
                                         <div className="absolute -top-4 right-[0.5rem] text-center w-12 text-xs font-semibold text-foreground">
                                            ₹{cancellationFeeLater !== null ? cancellationFeeLater.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0}) : '...'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xxs text-muted-foreground mt-1.5 px-1">
                                        <span className="font-medium">Now</span>
                                        <span className="text-center">{departureDate ? format(parseISO(departureDate), "d MMM") : ''}<br/>{departureDate ? format(parseISO(departureDate), "HH:mm") : ''}</span>
                                        <span className="text-center">{departureDate ? format(parseISO(departureDate), "d MMM") : ''}<br/>{departureDate ? format(parseISO(departureDate), "HH:mm") : ''}</span>
                                    </div>
                                     <p className="text-xxs text-muted-foreground/80 mt-2">Cancel Between (IST)</p>
                                </div>
                                 <p className="text-xs text-muted-foreground mt-2">Note: These are airline charges. Horizon Stays convenience fee is non-refundable.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-card/70 backdrop-blur-sm border-border text-card-foreground shadow-lg sticky top-24"> {/* Adjusted top value */}
                            <CardHeader className="pb-3 pt-4">
                                <CardTitle className="text-base font-bold text-foreground">Fare Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm pb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center"><PlusCircle className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground/70" />Base Fare</span>
                                    <span className="font-medium text-foreground">₹ {clientBaseFare !== null ? clientBaseFare.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '...'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center"><PlusCircle className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground/70" />Taxes and Surcharges</span>
                                    <span className="font-medium text-foreground">₹ {clientTaxesAndSurcharges !== null ? clientTaxesAndSurcharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '...'}</span>
                                </div>
                                <Separator className="my-3 bg-border" />
                                <div className="flex justify-between text-base">
                                    <span className="font-semibold text-foreground">Total Amount</span>
                                    <span className="font-bold text-foreground">₹ {clientTotalFare !== null ? clientTotalFare.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '...'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/70 backdrop-blur-sm border-border text-card-foreground shadow-lg">
                            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 p-3 rounded-t-lg">
                                <CardTitle className="text-base flex items-center gap-2 font-bold text-primary-foreground">
                                    <Image src="https://placehold.co/24x24/FFFFFF/031f2d.png?text=🎁" alt="coupons" width={20} height={20} className="rounded-sm" data-ai-hint="giftbox present"/> Coupons and Offers
                                </CardTitle>
                            </div>
                            <CardContent className="pt-4 pb-4 rounded-b-lg">
                                <div className="relative">
                                    <Input type="text" placeholder="Enter coupon code" className="mb-2 pr-20 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary text-sm" />
                                    <Button variant="link" className="absolute right-1 top-1/2 -translate-y-1/2 h-auto p-1.5 text-primary font-semibold text-xs">APPLY</Button>
                                </div>
                                <Button variant="link" size="sm" className="text-primary p-0 h-auto w-full justify-start text-xs hover:underline">
                                    VIEW ALL COUPONS <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                                </Button>
                            </CardContent>
                        </Card>
                        <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base shadow-md">
                            Continue
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ReviewBookingPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63]">
                <Plane className="w-16 h-16 text-primary animate-pulse mb-4" />
                <h2 className="text-xl font-semibold text-primary-foreground mb-2">Loading Your Booking Details...</h2>
                <p className="text-muted-foreground">Just a moment, please.</p>
            </div>
        }>
            <ReviewBookingContent />
        </Suspense>
    )
}
