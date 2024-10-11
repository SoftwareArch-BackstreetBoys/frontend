import React from 'react';
import { Button } from "@/components/ui/button";

const Register = () => {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <Button className="w-full">Register with Google</Button>
      {/* Add more registration logic here */}
    </div>
  );
};

export default Register;