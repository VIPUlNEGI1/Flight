
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayoutDashboard, UsersIcon, HotelIcon as HotelBuildingIcon, FileCheckIcon, Trash2Icon, LineChartIcon, DollarSignIcon, ListChecks, ShieldCheckIcon } from "lucide-react";

export default function SuperAdminDashboardPage() {
  // Placeholder data
  const totalUsers = 150;
  const pendingApprovals = 5;
  const totalListings = 75; // Hotels + Flights
  const monthlyRevenue = 25000;

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
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Hotels awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">Active hotels & flights</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
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
        </AlertDescription>
      </Alert>
    </div>
  );
}
