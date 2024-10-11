import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const Register = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add registration logic here
    console.log('Registration submitted');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account to join Meet and Feat</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input type="text" placeholder="Full Name" required />
              <Input type="email" placeholder="Email" required />
              <Input type="password" placeholder="Password" required />
              <Input type="password" placeholder="Confirm Password" required />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Register</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;