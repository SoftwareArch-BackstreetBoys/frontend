import React from 'react';
import { Button } from "@/components/ui/button";

const Login = () => {
  const handleOnClick = () => {
    const callbackUrl = window.location.origin + '/events';
    window.location.href = `${process.env.GOOGLE_OAUTH_ROUTE}/auth/login?callbackUrl=${callbackUrl}`;
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <Button onClick={handleOnClick} className="w-full">Login with Google</Button>
      {/* Add more login logic here */}
    </div>
  );
};

export default Login;