
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FileCheckIcon, HotelIcon as HotelBuildingIcon, SearchIcon, CheckCircle2Icon, XCircleIcon, EyeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Placeholder data for hotels awaiting approval
const pendingHotels = [
  { id: "pht001", name: "The Cozy Corner Inn", ownerEmail: "owner1@example.com", submittedDate: "2024-07-15", location: "Mountain View, CA" },
  { id: "pht002", name: "Urban Chic Boutique", ownerEmail: "owner2@example.com", submittedDate: "2024-07-18", location: "Downtown, NY" },
];

export default function ApproveHotelsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
          <FileCheckIcon className="mr-3 h-8 w-8 text-primary" /> Approve Hotel Registrations
        </h1>
        <p className="text-muted-foreground">Review and approve or reject new hotel submissions.</p>
      </div>

      {pendingHotels.length === 0 ? (
        <Alert>
          <SearchIcon className="h-4 w-4" />
          <AlertTitle>No Pending Approvals</AlertTitle>
          <AlertDescription>
            There are currently no new hotel registrations awaiting approval. Great job, or maybe it's quiet!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {pendingHotels.map((hotel) => (
            <Card key={hotel.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-xl flex items-center">
                      <HotelBuildingIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                      {hotel.name}
                    </CardTitle>
                    <CardDescription>Location: {hotel.location}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="mt-2 sm:mt-0">Pending Approval</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">Submitted by: {hotel.ownerEmail}</p>
                <p className="text-sm text-muted-foreground mb-4">Submission Date: {hotel.submittedDate}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm">
                    <CheckCircle2Icon className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button variant="destructive" size="sm">
                    <XCircleIcon className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button variant="outline" size="sm">
                    <EyeIcon className="mr-2 h-4 w-4" /> View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
