
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LineChartIcon, DollarSignIcon, DownloadIcon, BarChartIcon, TrendingUpIcon } from "lucide-react";

// Placeholder data
const totalPlatformRevenue = 125670.50;
const averageBookingValue = 350.75;
const revenueLast30Days = 15230.00;

export default function RevenueReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
          <LineChartIcon className="mr-3 h-8 w-8 text-primary" /> Revenue Reports
        </h1>
        <p className="text-muted-foreground">Track platform earnings, booking values, and financial trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPlatformRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time gross revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Last 30 Days)</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueLast30Days.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8.1% from previous period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageBookingValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all bookings</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detailed Financial Report</CardTitle>
          <CardDescription>Download comprehensive financial statements.</CardDescription>
        </CardHeader>
        <CardContent>
            <Alert>
                <DownloadIcon className="h-4 w-4"/>
                <AlertTitle>Report Generation Placeholder</AlertTitle>
                <AlertDescription>Functionality to generate and download CSV/PDF reports will be implemented here.</AlertDescription>
            </Alert>
            <div className="mt-4">
                <Button variant="outline">
                    <DownloadIcon className="mr-2 h-4 w-4" /> Download Monthly Statement (Placeholder)
                </Button>
            </div>
        </CardContent>
      </Card>

      <Alert>
        <LineChartIcon className="h-4 w-4" />
        <AlertTitle>Revenue Charts Placeholder</AlertTitle>
        <AlertDescription>
          Interactive charts showing revenue trends, revenue by source (hotels/flights), and commission breakdowns will be available here.
        </AlertDescription>
      </Alert>
    </div>
  );
}
