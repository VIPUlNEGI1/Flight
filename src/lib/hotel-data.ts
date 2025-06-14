
"use client";

import type { Hotel } from './types';
import { placeholderHotels } from './placeholder-data';

const HOTELS_DB_KEY = 'appHotelsDB';
const UNCONFIGURED_HOSTNAME = "dynamic-media-cdn.tripadvisor.com";

function filterProblematicHotels(hotels: Hotel[]): Hotel[] {
  return hotels.filter(hotel => {
    const hasProblematicThumbnail = hotel.thumbnailUrl?.includes(UNCONFIGURED_HOSTNAME);
    const hasProblematicImage = hotel.images?.some(imgUrl => imgUrl.includes(UNCONFIGURED_HOSTNAME));
    if (hasProblematicThumbnail || hasProblematicImage) {
      console.warn(`Filtering out hotel "${hotel.name}" (ID: ${hotel.id}) due to image from unconfigured hostname: ${UNCONFIGURED_HOSTNAME}`);
      return false;
    }
    return true;
  });
}

export function getHotels(): Hotel[] {
  let loadedHotels: Hotel[] = [];
  if (typeof window === 'undefined') {
    loadedHotels = [...placeholderHotels]; // Return a copy for server-side
  } else {
    const storedHotels = localStorage.getItem(HOTELS_DB_KEY);
    if (storedHotels) {
      try {
        const parsedHotels = JSON.parse(storedHotels) as Hotel[];
        // Ensure all placeholder hotels are present if DB doesn't have them by ID
        const hotelIdsInDb = new Set(parsedHotels.map(h => h.id));
        const missingPlaceholders = placeholderHotels.filter(ph => !hotelIdsInDb.has(ph.id));
        loadedHotels = [...parsedHotels, ...missingPlaceholders];
      } catch (e) {
        console.error("Error parsing hotels from localStorage, initializing with placeholders.", e);
        loadedHotels = [...placeholderHotels];
        localStorage.setItem(HOTELS_DB_KEY, JSON.stringify(loadedHotels)); // Save fresh placeholders
      }
    } else {
      // Initialize with placeholders if nothing is stored
      loadedHotels = [...placeholderHotels];
      localStorage.setItem(HOTELS_DB_KEY, JSON.stringify(loadedHotels));
    }
  }
  // Filter out hotels with images from the unconfigured hostname
  return filterProblematicHotels(loadedHotels);
}

export function saveHotels(hotels: Hotel[]): void {
  if (typeof window === 'undefined') {
    console.warn("Attempted to save hotels on server side. No operation performed.");
    return;
  }
  localStorage.setItem(HOTELS_DB_KEY, JSON.stringify(hotels));
}

export function addHotel(newHotel: Omit<Hotel, 'id'> & { id?: string }): Hotel {
  // It's important to call getHotels() here to respect any ongoing filters
  // if we were to immediately use the newly added hotel.
  // However, for adding, we work with the raw stored list and then save.
  let currentRawHotels: Hotel[] = [];
  if (typeof window !== 'undefined') {
    const storedHotels = localStorage.getItem(HOTELS_DB_KEY);
    if (storedHotels) {
      try {
        currentRawHotels = JSON.parse(storedHotels);
      } catch (e) {
        console.error("Error parsing hotels for addHotel, starting fresh if necessary.", e);
        currentRawHotels = [...placeholderHotels]; // Fallback
      }
    } else {
      currentRawHotels = [...placeholderHotels]; // Initialize if empty
    }
  } else {
    currentRawHotels = [...placeholderHotels]; // Should ideally not be called server-side for adds
  }

  const hotelToAdd: Hotel = {
    ...newHotel,
    id: newHotel.id || `hotel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    images: newHotel.images || [],
    amenities: newHotel.amenities || [],
    isApproved: newHotel.isApproved === undefined ? false : newHotel.isApproved,
  };
  const updatedHotels = [...currentRawHotels, hotelToAdd];
  saveHotels(updatedHotels);
  return hotelToAdd;
}

export function updateHotel(updatedHotel: Hotel): Hotel | undefined {
  let currentRawHotels: Hotel[] = [];
   if (typeof window !== 'undefined') {
    const storedHotels = localStorage.getItem(HOTELS_DB_KEY);
    if (storedHotels) {
      try {
        currentRawHotels = JSON.parse(storedHotels);
      } catch (e) {
         console.error("Error parsing hotels for updateHotel", e);
        return undefined; // Can't update if we can't parse
      }
    } else {
      return undefined; // Can't update if no hotels are stored
    }
  } else {
    // Server-side behavior for update might need specific definition or be disallowed
    console.warn("updateHotel called on server side.");
    return undefined;
  }

  const hotelIndex = currentRawHotels.findIndex(h => h.id === updatedHotel.id);
  if (hotelIndex > -1) {
    currentRawHotels[hotelIndex] = updatedHotel;
    saveHotels(currentRawHotels);
    return updatedHotel;
  }
  console.warn(`Hotel with id ${updatedHotel.id} not found for update.`);
  return undefined;
}

export function getHotelById(hotelId: string): Hotel | undefined {
  // getHotels() already applies the filter
  const hotels = getHotels();
  return hotels.find(h => h.id === hotelId);
}
