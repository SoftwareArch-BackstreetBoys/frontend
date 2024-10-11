import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from 'lucide-react';

// Mock functions to simulate backend services
const fetchClubs = async () => {
  // Simulating API call
  return [
    { id: 'club1', name: 'Chess Club', description: 'For chess enthusiasts' },
    { id: 'club2', name: 'Debate Society', description: 'Improve your public speaking skills' },
    { id: 'club3', name: 'Robotics Club', description: 'Build and program robots' },
  ];
};

const joinClub = async (clubId) => {
  // Mock implementation
  console.log(`Joined club with ID: ${clubId}`);
  // In a real implementation, this would make an API call to join the club
};

const leaveClub = async (clubId) => {
  // Mock implementation
  console.log(`Left club with ID: ${clubId}`);
  // In a real implementation, this would make an API call to leave the club
};

const searchClubs = async (query) => {
  // Mock implementation
  const allClubs = await fetchClubs();
  return allClubs.filter(club => 
    club.name.toLowerCase().includes(query.toLowerCase()) ||
    club.description.toLowerCase().includes(query.toLowerCase())
  );
};

const ClubCard = ({ club, onJoin, onLeave, isMember }) => {
  return (
    <Card className="mb-4 p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold">{club.name}</h3>
      </div>
      <p className="text-gray-600 mb-4">{club.description}</p>
      <Button 
        onClick={() => isMember ? onLeave(club.id) : onJoin(club.id)}
        className={isMember ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
      >
        {isMember ? 'Leave Club' : 'Join Club'}
      </Button>
    </Card>
  );
};

const Clubs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userClubs, setUserClubs] = useState([]);  // In a real app, this would be fetched from the backend
  const queryClient = useQueryClient();

  const { data: clubs, isLoading, error } = useQuery({
    queryKey: ['clubs', searchQuery],
    queryFn: () => searchQuery ? searchClubs(searchQuery) : fetchClubs(),
  });

  const joinMutation = useMutation({
    mutationFn: joinClub,
    onSuccess: (data, clubId) => {
      setUserClubs([...userClubs, clubId]);
      queryClient.invalidateQueries(['clubs']);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveClub,
    onSuccess: (data, clubId) => {
      setUserClubs(userClubs.filter(id => id !== clubId));
      queryClient.invalidateQueries(['clubs']);
    },
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleJoinClub = (clubId) => {
    joinMutation.mutate(clubId);
  };

  const handleLeaveClub = (clubId) => {
    leaveMutation.mutate(clubId);
  };

  if (isLoading) return <div>Loading clubs...</div>;
  if (error) return <div>Error loading clubs: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Clubs</h2>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full"
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      <div className="space-y-6">
        {clubs.map(club => (
          <ClubCard 
            key={club.id} 
            club={club} 
            onJoin={handleJoinClub} 
            onLeave={handleLeaveClub}
            isMember={userClubs.includes(club.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Clubs;