import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useFetchUser } from '../utils/useFetchUser';

const Navbar = () => {
  const [user, setUser] = useFetchUser();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${process.env.GOOGLE_OAUTH_ROUTE}/auth/logout`);

      if (response.status === 200) {
        // Logout successful, clear the token
        // alert('Logged out successfully');

        // Redirect to root path
        setUser(null)
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Unauthorized: You may already be logged out.');
      } else {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
      }
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-pink-600">Meet and Feat</Link>
          <div className="space-x-4">
            <Link to="/events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link to="/clubs">
              <Button variant="ghost">Clubs</Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            {!user ? (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            )}
            {/* <Link to="/register">
              <Button>Register</Button>
            </Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;