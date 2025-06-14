
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayoutDashboard, UsersIcon, HotelIcon as HotelBuildingIcon, FileCheckIcon, LineChartIcon, DollarSignIcon, ListChecks, ShieldCheckIcon, Loader2, BriefcaseIcon } from "lucide-react";
import { useState, useEffect, useCallback } from 'react';
import type { Hotel, Booking } from '@/lib/types';
import { getHotels } from '@/lib/hotel-data';

const BOOKINGS_DB_KEY = 'appBookingsDB';

export default function SuperAdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const monthlyRevenue = 25000; // Placeholder

  const loadDashboardData = useCallback(() => {
    setIsLoading(true);
    const allHotels = getHotels();
    const approvedHotels = allHotels.filter(h => h.isApproved);
    const hotelsPendingApproval = allHotels.filter(h => !h.isApproved);

    setTotalListings(approvedHotels.length);
    setPendingApprovals(hotelsPendingApproval.length);

    if (typeof window !== "undefined") {
        const usersDBString = localStorage.getItem("usersDB");
        let users = usersDBString ? JSON.parse(usersDBString) : [];
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        if (superAdminEmail && !users.find((u: any) => u.email === superAdminEmail)) {
            users.push({ email: superAdminEmail, role: "super_admin"});
        }
        setTotalUsers(users.length);

        const bookingsDBString = localStorage.getItem(BOOKINGS_DB_KEY);
        let bookings: Booking[] = [];
        if (bookingsDBString) {
            try {
                bookings = JSON.parse(bookingsDBString);
            } catch (e) { console.error("Error parsing bookings for SA dashboard", e); }
        }
        setTotalBookings(bookings.length);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary">
        <h1 className="font-headline text-2xl md:text-3xl font-bold flex items-center text-primary">
          <ShieldCheckIcon className="mr-3 h-8 w-8" /> SUPER ADMIN PLATFORM OVERVIEW
        </h1>
        <p className="text-primary/90 font-medium mt-1">This is the main dashboard for Super Administrators.</p>
      </div>

      <div className="mb-8">
        <h2 className="font-headline text-2xl md:text-3xl font-bold flex items-center">
          <LayoutDashboard className="mr-3 h-7 w-7 text-primary" /> Key Metrics
        </h2>
        <p className="text-muted-foreground">Platform overview and key statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Hotel Approvals</CardTitle>
            <FileCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Hotels awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Listings</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">Live hotels on platform</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Across all hotels</p>
          </CardContent>
        </Card>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue (Placeholder)</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated current month</p>
          </CardContent>
        </Card>
       </div>


      <Alert>
        <LineChartIcon className="h-4 w-4" />
        <AlertTitle>Advanced Analytics Placeholder</AlertTitle>
        <AlertDescription>
          Detailed charts for user growth, booking trends, and revenue streams will be displayed here.
          A view for all bookings could be added under a separate "Manage Bookings" tab for Super Admin.
        </AlertDescription>
      </Alert>
    </div>
  );
}
