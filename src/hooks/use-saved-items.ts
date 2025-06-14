"use client";

import type { Flight, Hotel } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const FLIGHTS_STORAGE_KEY = 'horizonStays_savedFlights';
const HOTELS_STORAGE_KEY = 'horizonStays_savedHotels';

export function useSavedItems() {
  const [savedFlights, setSavedFlights] = useState<Flight[]>([]);
  const [savedHotels, setSavedHotels] = useState<Hotel[]>([]);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFlights = localStorage.getItem(FLIGHTS_STORAGE_KEY);
      if (storedFlights) {
        setSavedFlights(JSON.parse(storedFlights));
      }
      const storedHotels = localStorage.getItem(HOTELS_STORAGE_KEY);
      if (storedHotels) {
        setSavedHotels(JSON.parse(storedHotels));
      }
      setIsLocalStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLocalStorageLoaded && typeof window !== 'undefined') {
      localStorage.setItem(FLIGHTS_STORAGE_KEY, JSON.stringify(savedFlights));
    }
  }, [savedFlights, isLocalStorageLoaded]);

  useEffect(() => {
    if (isLocalStorageLoaded && typeof window !== 'undefined') {
      localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(savedHotels));
    }
  }, [savedHotels, isLocalStorageLoaded]);

  const addFlightToSaved = useCallback((flight: Flight) => {
    setSavedFlights((prev) => {
      if (prev.find(f => f.id === flight.id)) return prev;
      return [...prev, flight];
    });
  }, []);

  const removeFlightFromSaved = useCallback((flightId: string) => {
    setSavedFlights((prev) => prev.filter((f) => f.id !== flightId));
  }, []);

  const isFlightSaved = useCallback((flightId: string) => {
    return savedFlights.some((f) => f.id === flightId);
  }, [savedFlights]);

  const addHotelToSaved = useCallback((hotel: Hotel) => {
    setSavedHotels((prev) => {
      if (prev.find(h => h.id === hotel.id)) return prev;
      return [...prev, hotel];
    });
  }, []);

  const removeHotelFromSaved = useCallback((hotelId: string) => {
    setSavedHotels((prev) => prev.filter((h) => h.id !== hotelId));
  }, []);

  const isHotelSaved = useCallback((hotelId: string) => {
    return savedHotels.some((h) => h.id === hotelId);
  }, [savedHotels]);

  return {
    savedFlights,
    savedHotels,
    addFlightToSaved,
    removeFlightFromSaved,
    isFlightSaved,
    addHotelToSaved,
    removeHotelFromSaved,
    isHotelSaved,
    isLoading: !isLocalStorageLoaded,
  };
}
