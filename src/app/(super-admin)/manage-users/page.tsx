
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCogIcon, EditIcon, Trash2Icon, SearchIcon, Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DisplayUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsersString = localStorage.getItem("usersDB");
      let loadedUsers: DisplayUser[] = [];
      if (storedUsersString) {
        try {
          const rawUsers = JSON.parse(storedUsersString);
          if (Array.isArray(rawUsers)) {
            loadedUsers = rawUsers.map((user: any, index: number) => ({
              id: user.email || `user-${index}`, // Use email as ID, fallback to index
              fullName: user.fullName || 'N/A',
              email: user.email || 'N/A',
              role: user.role || 'guest',
            }));
          }
        } catch (error) {
          console.error("Error parsing usersDB from localStorage:", error);
        }
      }
      // Add Super Admin if not in localStorage (as it's from .env)
      const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
      if (superAdminEmail && !loadedUsers.find(u => u.email === superAdminEmail)) {
        loadedUsers.unshift({
          id: superAdminEmail,
          fullName: "Super Admin",
          email: superAdminEmail,
          role: "super_admin"
        });
      }
      setUsers(loadedUsers);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center">
          <UserCogIcon className="mr-3 h-8 w-8 text-primary" /> Manage Users
        </h1>
        <p className="text-muted-foreground">View, edit, or suspend user accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            Showing {users.length} registered user(s).
            {/* TODO: Add search/filter inputs here */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <Alert>
              <SearchIcon className="h-4 w-4" />
              <AlertTitle>No Users Found</AlertTitle>
              <AlertDescription>There are no registered users on the platform yet.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'hotel_owner' ? 'secondary' : 'outline'}
                             className={user.role === 'super_admin' ? 'border-primary text-primary font-semibold' : ''}
                      >
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" disabled={user.role === 'super_admin' && user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL}>
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only">Edit User</span>
                      </Button>
                      {/* Prevent deleting the main super admin from .env for safety */}
                      {!(user.role === 'super_admin' && user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2Icon className="h-4 w-4" />
                          <span className="sr-only">Delete User</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
