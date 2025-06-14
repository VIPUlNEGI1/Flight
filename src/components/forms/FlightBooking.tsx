
"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Plane, Building, Home as HomeIcon, Palmtree, Car, ChevronDown, Search, ArrowLeftRight, ChevronLeft, ChevronRight, Calendar as CalendarIconLucide } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"; // Added Label import

interface Location { city: string; code: string; airport: string; }
interface PassengerCounts { adults: number; children: number; infants: number; }

const services = [
  { icon: Plane, label: "Flights", active: true, hasNew: false },
  { icon: Building, label: "Hotels", active: false, hasNew: false },
  { icon: HomeIcon, label: "Homestays", active: false, hasNew: false },
  { icon: Palmtree, label: "Packages", active: false, hasNew: false },
  { icon: Car, label: "Cabs", active: false, hasNew: false },
];

const popularCities: Location[] = [
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji International Airport" },
  { city: "New Delhi", code: "DEL", airport: "Indira Gandhi International Airport" },
  { city: "Bangkok", code: "BKK", airport: "Bangkok" },
  { city: "Bengaluru", code: "BLR", airport: "Bengaluru International Airport" },
  { city: "Pune", code: "PNQ", airport: "Pune Airport" },
  { city: "Chennai", code: "MAA", airport: "Chennai International Airport" },
  { city: "Kolkata", code: "CCU", airport: "Netaji Subhas Chandra Bose International Airport" },
  { city: "Hyderabad", code: "HYD", airport: "Rajiv Gandhi International Airport" },
];

const travelClasses = ["Economy", "Premium Economy", "Business", "First Class"];

const specialFares = [
    { id: "regular", label: "Regular", subLabel: "Regular fares" },
    { id: "student", label: "Student", subLabel: "Extra discounts" },
    { id: "senior", label: "Senior Citizen", subLabel: "Up to ₹600 off" },
    { id: "armedforces", label: "Armed Forces", subLabel: "Up to ₹600 off" },
    { id: "doctors", label: "Doctors/Nurses", subLabel: "Up to ₹600 off" },
];

const mockPrices: Record<string, number> = {
  "2025-06-01": 7790, "2025-06-02": 8270, "2025-06-03": 6952, "2025-06-04": 6373, "2025-06-05": 6952,
  "2025-06-06": 6373, "2025-06-07": 7790, "2025-06-08": 6373, "2025-06-09": 6365, "2025-06-10": 6263,
  "2025-06-11": 6200, "2025-06-12": 6200, "2025-06-13": 6373, "2025-06-14": 6739, "2025-06-15": 6200,
  "2025-06-16": 5985, "2025-06-17": 5985, "2025-06-18": 5564, "2025-06-19": 6126, "2025-06-20": 5985,
  "2025-06-21": 5546, "2025-06-22": 5985, "2025-06-23": 5985, "2025-06-24": 5564, "2025-06-25": 5564,
  "2025-06-26": 6126, "2025-06-27": 6126, "2025-06-28": 5378, "2025-06-29": 4962, "2025-06-30": 4962,
};

export function FlightBooking() {
  const initialDepartureDate = new Date("2025-06-03"); // Design shows 3 Junyy, let's use a real date
  const [state, setState] = useState({
    tripType: "oneWay" as "oneWay" | "roundTrip" | "multiCity",
    from: popularCities.find(c => c.code === "DEL") || popularCities[1],
    to: popularCities.find(c => c.code === "BLR") || popularCities[3],
    departure: initialDepartureDate,
    return: undefined as Date | undefined,
    travellers: 1,
    travelClass: "Economy",
    specialFare: "regular",
    fromOpen: false,
    toOpen: false,
    departureOpen: false,
    returnOpen: false,
    travellersOpen: false,
    fromSearch: "",
    toSearch: "",
    passengers: { adults: 1, children: 0, infants: 0 } as PassengerCounts,
    currentMonth: new Date(initialDepartureDate.getFullYear(), initialDepartureDate.getMonth(), 1),
  });

  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (state.departure < today) {
        const nextValidDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        updateState({
            departure: nextValidDate,
            currentMonth: new Date(nextValidDate.getFullYear(), nextValidDate.getMonth(), 1)
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const updateState = (updates: Partial<typeof state>) => setState((prev) => ({ ...prev, ...updates }));

  const handleSwap = () => updateState({ from: state.to, to: state.from });

  const handleCity = (loc: Location, type: "from" | "to") =>
    updateState({ [type]: loc, [`${type}Open`]: false, [`${type}Search`]: "" });

  const handleDate = (date: Date | undefined, type: "departure" | "return") => {
    if (date) {
        const updates: Partial<typeof state> = { [type]: date, [`${type}Open`]: false };
        if (type === "departure") {
            updates.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            if (state.return && date > state.return) {
                updates.return = undefined;
            }
        }
        updateState(updates);
    }
  }

  const getPrice = (date: Date): number | undefined => mockPrices[format(date, "yyyy-MM-dd")] || undefined;


  const totalPassengers = () => state.passengers.adults + state.passengers.children + state.passengers.infants;

  const applyTravellers = () => {
    const total = totalPassengers();
    if (total > 0) updateState({ travellers: total, travelClass: state.travelClass, travellersOpen: false });
  };

  const filteredCities = (type: "from" | "to") =>
    popularCities.filter((c) =>
      [c.city, c.code, c.airport].some((v) => v.toLowerCase().includes(state[`${type}Search`].toLowerCase()))
    );

  const mapClass = (c: string) =>
    ({ "Premium Economy": "PREMIUM_ECONOMY", Business: "BUSINESS", "First Class": "FIRST" }[c] || "ECONOMY");

  const search = () => {
    if (!state.from || !state.to || !state.departure) return alert("Please fill in all required fields.");
    if (state.tripType === "roundTrip" && !state.return) return alert("Please select a return date.");
    if (state.tripType === "multiCity") return alert("Multi-city search is not supported yet.");

    const params = new URLSearchParams({
      originLocationCode: state.from.code.toUpperCase(),
      destinationLocationCode: state.to.code.toUpperCase(),
      departureDate: format(state.departure, "yyyy-MM-dd"),
      adults: state.passengers.adults.toString(),
      children: state.passengers.children.toString(),
      infants: state.passengers.infants.toString(),
      travelClass: mapClass(state.travelClass),
      // nonStop query param removed as per previous user actions, confirm if needed
    });

    if (state.tripType === "roundTrip" && state.return) {
      params.append("returnDate", format(state.return, "yyyy-MM-dd"));
    }
    router.push(`/flights/search?${params.toString()}`);
  };
  
  const handleMonthChange = (direction: "prev" | "next") => {
    const newMonth = new Date(state.currentMonth);
    if (direction === "prev") {
        newMonth.setMonth(state.currentMonth.getMonth() - 1);
    } else {
        newMonth.setMonth(state.currentMonth.getMonth() + 1);
    }
    
    const today = new Date();
    const firstDayOfCurrentDisplayMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if ( (state.departureOpen || (state.tripType === "roundTrip" && state.returnOpen && !state.departure)) && newMonth < firstDayOfCurrentDisplayMonth) {
        return;
    }
    
    if (state.returnOpen && state.departure) {
      const firstDayOfDepartureMonth = new Date(state.departure.getFullYear(), state.departure.getMonth(), 1);
      if (newMonth < firstDayOfDepartureMonth) {
        return;
      }
    }
    updateState({ currentMonth: newMonth });
  };


  if (!isClient) {
    return (
        <div className="absolute -top-24 left-0 w-full max-w-[150rem] p-2 sm:p-4 md:-top-16">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-16"></div>
                <div className="p-4 md:p-6 space-y-6">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="h-20 bg-gray-200 rounded"></div> 
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                     <div className="h-20 bg-gray-200 rounded w-full"></div> {/* Placeholder for special fares */}
                    <div className="flex justify-center mt-6">
                        <div className="h-12 bg-gray-300 rounded w-full max-w-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  const LocationPopover = ({ type }: { type: "from" | "to" }) => (
    <Popover open={state[`${type}Open`]} onOpenChange={(open) => updateState({ [`${type}Open`]: open })}>
      <PopoverTrigger asChild>
        <button className="border border-gray-300 rounded-lg p-2 hover:border-blue-500 flex-1 text-left w-full h-[76px] bg-white">
          <div className="text-xs text-gray-500 mb-0.5">{type === "from" ? "From" : "To"}</div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-sm text-gray-900 truncate">{state[type].city}</div>
              <div className="text-xs text-gray-600 truncate">{state[type].code}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h3 className="text-base font-semibold text-blue-600 mb-2">{type === "from" ? "From" : "To"}</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search city/airport/code"
              value={state[`${type}Search`]}
              onChange={(e) => updateState({ [`${type}Search`]: e.target.value })}
              className="pl-8 text-sm h-10"
            />
          </div>
        </div>
        <div className="p-3">
          <h4 className="text-xs text-gray-500 mb-2 font-medium">Popular Cities</h4>
          <ScrollArea className="h-48">
            {filteredCities(type).length ? (
              filteredCities(type).map((city) => (
                <button
                  key={city.code}
                  className="flex justify-between p-2 hover:bg-gray-50 rounded w-full text-left items-center"
                  onClick={() => handleCity(city, type)}
                >
                  <div>
                    <div className="font-medium text-sm">{city.city}</div>
                    <div className="text-xs text-gray-500">{city.airport}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{city.code}</div>
                </button>
              ))
            ) : (
              <div className="text-xs text-gray-500 p-2">No cities found</div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );

  const DatePopover = ({ type }: { type: "departure" | "return" }) => (
    <Popover open={state[`${type}Open`]} onOpenChange={(open) => updateState({ [`${type}Open`]: open })}>
      <PopoverTrigger asChild>
        <button className="border border-gray-300 rounded-lg p-2 hover:border-blue-500 text-left w-full h-[76px] bg-white">
          <div className="text-xs text-gray-500 mb-0.5">{type === "departure" ? "Departure" : "Return"}</div>
          <div className="flex justify-between items-center">
            <div>
              {type === "return" && !state.return ? (
                <div className="text-sm text-gray-400">Tue</div> 
              ) : (
                <>
                  <div className="font-bold text-sm text-gray-900">
                    {/* Design shows "3 Junyy", using formatted date */}
                    {format(state[type]!, "d MMM").split(' ')[0]} <span className="font-normal text-sm">{format(state[type]!, "MMM")}</span> 
                  </div>
                  <div className="text-xs text-gray-600">{format(state[type]!, "EEE")}</div>
                </>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => handleMonthChange("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-base font-semibold">
              {format(state.currentMonth, "MMMM yyyy")}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => handleMonthChange("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={state[type]}
            onSelect={(date) => handleDate(date, type)}
            month={state.currentMonth}
            onMonthChange={(month) => updateState({ currentMonth: month })}
            initialFocus
            disabled={(date) => {
                const today = new Date();
                today.setHours(0,0,0,0);
                if (type === "departure") return date < today;
                if (type === "return") return state.departure ? date < state.departure : date < today;
                return false;
            }}
            components={{
              Day: ({ date, displayMonth }) => {
                 if (state.currentMonth && displayMonth.getMonth() !== state.currentMonth.getMonth()) {
                     return <div className="p-1.5 w-10 h-10 flex flex-col items-center justify-center"></div>;
                 }
                const price = getPrice(date);
                const isSelected = state[type] && format(state[type]!, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                const today = new Date(); today.setHours(0,0,0,0);
                let isDisabled = false;
                if (type === "departure") isDisabled = date < today;
                else if (type === "return") {
                    isDisabled = state.departure ? date < state.departure : date < today;
                }
                return (
                  <button
                    className={cn(
                      "relative p-1.5 rounded w-10 h-10 flex flex-col items-center justify-center",
                      !isDisabled && "hover:bg-gray-100",
                      isSelected && !isDisabled && "bg-blue-500 text-white hover:bg-blue-600", // Blue for selected
                      isDisabled && "text-gray-400 cursor-not-allowed"
                    )}
                    onClick={() => !isDisabled && handleDate(date, type)}
                    disabled={isDisabled}
                  >
                    <div className={cn("text-sm font-medium", isSelected && !isDisabled && "text-white")}>{format(date, "d")}</div>
                    {price && !isDisabled && (
                      <div className={cn("text-[10px] font-medium mt-0.5", isSelected ? "text-white/80" : "text-green-600")}>
                        ₹{price} 
                      </div>
                    )}
                  </button>
                );
              },
            }}
          />
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => updateState({ [`${type}Open`]: false })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="absolute -top-24 left-0 w-full max-w-[150rem] p-2 sm:p-4 md:-top-16">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-[#031f2d] via-[#0c4d52] to-[#155e63] flex justify-center px-4 py-3"> {/* Reduced py */}
          <div className="flex overflow-x-auto scrollbar-hide space-x-4">
            {services.map((s, i) => {
              const IconComponent = s.icon;
              return (
                <button
                  key={i}
                  className={cn(
                    "px-3 py-1.5 transition-all rounded-md", // Reduced padding
                    s.active ? "border-b-2 border-white text-white bg-[#ffffff1a]" : "text-gray-300 hover:text-white hover:bg-[#ffffff10]"
                  )}
                  disabled={!s.active} 
                >
                  <div className="flex items-center space-x-1.5">
                    <div className="relative">
                      <IconComponent className="w-4 h-4" /> {/* Reduced icon size */}
                      {s.hasNew && (
                        <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] px-1 py-0.5 rounded-full leading-none">
                          new
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium">{s.label}</span> {/* Reduced text size */}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="space-y-5"> {/* Increased base space-y */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-3">
                {["oneWay", "roundTrip", "multiCity"].map((type) => (
                  <label key={type} className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-100">
                    <input
                      type="radio"
                      name="tripType"
                      value={type}
                      checked={state.tripType === type}
                      onChange={(e) => updateState({ tripType: e.target.value as typeof state.tripType })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-1.5 text-sm font-medium text-gray-800">{type === "oneWay" ? "One Way" : type === "roundTrip" ? "Round Trip" : "Multi City"}</span>
                  </label>
                ))}
              </div>
              <span className="text-sm text-gray-700">Book Flights</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr] gap-3 items-end"> {/* Adjusted grid for swap button */}
              <LocationPopover type="from" />
                <Button variant="ghost" size="icon" onClick={handleSwap} className="p-2 hover:bg-gray-100 rounded-full h-10 w-10 shrink-0 mx-auto self-center">
                    <ArrowLeftRight className="w-4 h-4 text-gray-600" />
                </Button>
              <LocationPopover type="to" />
              <DatePopover type="departure" />
              {state.tripType === "roundTrip" ? <DatePopover type="return" /> : <div className="hidden lg:block"></div>} 

              <Popover open={state.travellersOpen} onOpenChange={(open) => updateState({ travellersOpen: open })}>
                <PopoverTrigger asChild>
                  <button className="border border-gray-300 rounded-lg p-2 hover:border-blue-500 text-left w-full h-[76px] bg-white">
                    <div className="text-xs text-gray-500 mb-0.5">Travellers & Class</div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{state.travellers} Traveller{state.travellers > 1 ? "s" : ""}</div>
                        <div className="text-xs text-gray-600 truncate">{state.travelClass}</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0">
                  <div className="p-4 space-y-4">
                    {[
                        {key: "adults", label: "ADULTS (12y +)", options: [1, 2, 3, 4, 5, 6, 7, 8, 9]},
                        {key: "children", label: "CHILDREN (2y - 12y)", options: [0, 1, 2, 3, 4, 5, 6]},
                        {key: "infants", label: "INFANTS (below 2y)", options: [0, 1, 2, 3, 4]}
                    ].map((item) => (
                      <div key={item.key} className="space-y-2">
                        <div className="font-semibold text-sm text-gray-700">{item.label}</div>
                        <ScrollArea className="h-14">
                            <div className="flex gap-2 flex-wrap pb-2">
                            {item.options.map((num) => (
                                <button
                                key={num}
                                onClick={() =>
                                    updateState({
                                    passengers: {
                                        ...state.passengers,
                                        [item.key as keyof PassengerCounts]: num,
                                    },
                                    })
                                }
                                className={cn(
                                    "w-8 h-8 rounded text-xs font-medium border",
                                    state.passengers[item.key as keyof PassengerCounts] === num
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800"
                                )}
                                >
                                {num}
                                </button>
                            ))}
                            </div>
                        </ScrollArea>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <div className="font-semibold text-sm text-gray-700">TRAVEL CLASS</div>
                      <div className="grid grid-cols-2 gap-2">
                        {travelClasses.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateState({ travelClass: c })}
                            className={cn(
                              "px-3 py-1.5 rounded text-xs font-medium border",
                              state.travelClass === c ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={applyTravellers}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded-md text-sm"
                        disabled={totalPassengers() === 0}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Special Fares Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Special Fares</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Save</span>
                </div>
                <RadioGroup
                    value={state.specialFare}
                    onValueChange={(value) => updateState({ specialFare: value })}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
                >
                    {specialFares.map((fare) => (
                    <Label
                        key={fare.id}
                        htmlFor={`fare-${fare.id}`}
                        className={cn(
                        "border rounded-md p-3 text-center cursor-pointer transition-all duration-200",
                        state.specialFare === fare.id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm"
                        )}
                    >
                        <RadioGroupItem value={fare.id} id={`fare-${fare.id}`} className="sr-only peer" />
                        <div className="font-medium text-sm text-gray-900 peer-data-[state=checked]:text-blue-700">{fare.label}</div>
                        <div className="text-xs text-gray-500 peer-data-[state=checked]:text-blue-600">{fare.subLabel}</div>
                    </Label>
                    ))}
                </RadioGroup>
            </div>


            <div className="flex justify-center pt-3">
              <Button
                onClick={search}
                className="w-full max-w-xs h-12 bg-[#0c4d52] hover:bg-[#0a3f44] text-white px-8 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
