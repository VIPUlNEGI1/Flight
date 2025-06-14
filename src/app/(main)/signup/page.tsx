
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlusIcon, BriefcaseIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("guest"); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: "Passwords do not match!",
      });
      return;
    }
    
    if (typeof window !== "undefined") {
      const newUser = { fullName, email, role, password }; 

      let usersDB = [];
      const existingUsersString = localStorage.getItem("usersDB");
      if (existingUsersString) {
        try {
          usersDB = JSON.parse(existingUsersString);
        } catch (err) {
          console.warn("Error parsing usersDB from localStorage", err);
        }
      }
      usersDB.push(newUser);
      localStorage.setItem("usersDB", JSON.stringify(usersDB));
      
      localStorage.setItem("currentUser", JSON.stringify({ fullName, email, role }));
      window.dispatchEvent(new CustomEvent('authChange')); // Dispatch event
      
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
      router.refresh(); 
      toast({
        title: "Signup Successful!",
        description: `Welcome, ${fullName}! Your account has been created.`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[calc(100vh-128px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserPlusIcon className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join Hotel&Tour to find amazing stays or list your property.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Sign up as</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <BriefcaseIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="hotel_owner">Hotel Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
