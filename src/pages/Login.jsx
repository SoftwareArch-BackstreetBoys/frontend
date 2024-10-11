import React from 'react';
import { Button } from "@/components/ui/button";

const Login = () => {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <Button className="w-full">Login with Google</Button>
      {/* Add more login logic here */}
    </div>
  );
};

export default Login;