
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayoutDashboard, DollarSign, BedDoubleIcon, ListOrdered } from "lucide-react";

export default function HotelOwnerDashboardPage() {
  // Placeholder data - in a real app, fetch from backend
  const totalHotels = 1;
  const totalRevenue = 12500.75;
  const upcomingBookings = 5;
  const occupancyRate = 75; // Percentage

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
          <LayoutDashboard className="mr-3 h-8 w-8 text-primary" /> Hotel Owner Dashboard
        </h1>
        <p className="text-muted-foreground">Overview of your hotel properties and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
            <BedDoubleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHotels}</div>
            <p className="text-xs text-muted-foreground">Managed properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">In the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Across all properties</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <LayoutDashboard className="h-4 w-4" />
        <AlertTitle>Analytics Placeholder</AlertTitle>
        <AlertDescription>
          Detailed charts and reports will be displayed here. This section is currently a placeholder.
        </AlertDescription>
      </Alert>
      
      {/* TODO: Add charts for revenue trends, booking sources, etc. */}
    </div>
  );
}
