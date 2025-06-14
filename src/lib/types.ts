
export interface Flight {
  id: string;
  airline: string;
  airlineLogoUrl?: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  // Additional details
  departureAirport: string;
  arrivalAirport: string;
  aircraftType?: string;
  amenities?: string[];
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number; // 1-5
  pricePerNight: number;
  thumbnailUrl?: string;
  thumbnailHint?: string; // Hint for the thumbnail image
  images?: string[];
  imageHints?: string[]; // Hints for the corresponding images in the images array
  amenities: string[];
  description?: string;
  checkInTime?: string;
  checkOutTime?: string;
  roomTypes?: { name: string; price: number; features: string[] }[];
  ownerEmail?: string; // Email of the Hotel Owner
  isApproved?: boolean; // Approval status by Super Admin
}

export interface SavedItemContextType {
  savedFlights: Flight[];
  savedHotels: Hotel[];
  addFlightToSaved: (flight: Flight) => void;
  removeFlightFromSaved: (flightId: string) => void;
  isFlightSaved: (flightId: string) => boolean;
  addHotelToSaved: (hotel: Hotel) => void;
  removeHotelFromSaved: (hotelId: string) => void;
  isHotelSaved: (hotelId: string) => boolean;
}

export interface Booking {
  id: string; // Unique booking ID, e.g., timestamp or UUID
  userId: string; // Email of the user who booked
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  hotelOwnerEmail?: string;
  checkInDate: string; // ISO Date string
  checkOutDate: string; // ISO Date string
  guests: number;
  totalPrice: number;
  bookedAt: string; // ISO DateTime string
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

// --- Amadeus API Types (Simplified) ---
export interface AmadeusFlightSegment {
  id: string;
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string; // Flight number
  aircraft?: { code: string };
  duration: string; // e.g., PT2H30M
  // Potentially add more fields as needed, e.g., operatingCarrierCode
}

export interface AmadeusItinerary {
  duration: string;
  segments: AmadeusFlightSegment[];
}

export interface AmadeusTravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: {
    segmentId: string;
    cabin: string; // e.g., ECONOMY, BUSINESS
    fareBasis: string;
    class: string; // Booking class, e.g., Y, J
    includedCheckedBags?: {
      quantity?: number;
      weight?: number;
      weightUnit?: string;
    };
  }[];
}

export interface FlightOffer {
  id: string;
  type: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: AmadeusItinerary[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees?: { amount: string; type: string }[];
    grandTotal?: string;
    // billingCurrency?: string; // If different from display currency
  };
  pricingOptions: {
    fareType: string[]; // e.g., ["PUBLISHED"]
    includedOneWayFares: boolean;
    refundableTax?: boolean; // Optional based on API version/response
    noRestrictionFare?: boolean;
    noPenaltyFare?: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: AmadeusTravelerPricing[];
}

export interface FlightOffersResponse {
  meta?: {
    count: number;
    links?: { self: string };
  };
  data: FlightOffer[];
  dictionaries?: {
    locations?: Record<string, { cityCode: string; countryCode: string }>;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    carriers?: Record<string, string>; // Airline codes to names
  };
}

// --- End of Amadeus API Types ---
