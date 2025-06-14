
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2Icon, ShieldAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header'; // Assuming super admin might want a consistent header

interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user: CurrentUser = JSON.parse(storedUser);
          setCurrentUser(user);
          if (user.role === 'super_admin') {
            setIsAuthorized(true);
          } else {
            // Not a super admin, redirect to home
            router.replace('/'); 
          }
        } catch (e) {
          console.error("Failed to parse currentUser for super admin layout", e);
          localStorage.removeItem("currentUser");
          router.replace(`/login?redirect=${pathname}`);
        }
      } else {
        // No user logged in, redirect to login
        router.replace(`/login?redirect=${pathname}`);
      }
      setIsLoading(false);
    }
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAuthorized && !isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Alert variant="destructive" className="max-w-md text-center">
                <ShieldAlertIcon className="h-6 w-6 mx-auto mb-2" />
                <AlertTitle className="text-xl font-bold">Access Denied</AlertTitle>
                <AlertDescription>
                You do not have permission to view this page. This area is restricted to Super Administrators.
                </AlertDescription>
                <Button asChild className="mt-4">
                    <Link href="/">Return to Homepage</Link>
                </Button>
            </Alert>
        </div>
    );
  }

  // User is authorized as super_admin
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-grow">{children}</main>
      <footer className="bg-muted/50 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          Super Admin Panel - © {new Date().getFullYear()} Hotel&Tour
        </div>
      </footer>
    </div>
  );
}
