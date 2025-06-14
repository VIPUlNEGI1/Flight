
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign, TrendingUpIcon, FileTextIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder data
const totalEarnings = 7850.50;
const lastMonthEarnings = 1200.00;
const pendingPayout = 350.25;

export default function EarningsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
          <DollarSign className="mr-3 h-8 w-8 text-primary" /> Earnings & Payouts
        </h1>
        <p className="text-muted-foreground">Track your revenue and manage payouts for your properties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time net revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${lastMonthEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2% from previous month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPayout.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Next payout scheduled soon</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Review your past payouts.</CardDescription>
        </CardHeader>
        <CardContent>
            <Alert>
                <FileTextIcon className="h-4 w-4"/>
                <AlertTitle>No Payouts Yet</AlertTitle>
                <AlertDescription>Your payout history will appear here once payouts are processed.</AlertDescription>
            </Alert>
            {/* Placeholder for table of payouts */}
            {/* <div className="mt-4">
                <Button variant="outline">
                    <DownloadIcon className="mr-2 h-4 w-4" /> Download Statement
                </Button>
            </div> */}
        </CardContent>
      </Card>

      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Earnings Reports Placeholder</AlertTitle>
        <AlertDescription>
          Detailed earnings reports and transaction history will be available here. This section is currently a placeholder.
        </AlertDescription>
      </Alert>
    </div>
  );
}
