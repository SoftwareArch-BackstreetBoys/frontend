import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users } from 'lucide-react';
import { useFetchUser } from '@/utils/useFetchUser';
import axios from 'axios';

// Mock functions to fetch user's joined events and clubs
const fetchUserEvents = async (userId) => {
  try {
    const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/user/${userId}/participated-events`);
    // console.log("participated events:", events.data.events)
    return events.data.events
  } catch (error) {
    console.error("Error fetching all participated-events:", error);
    throw error
  }
};

const fetchUserClubs = async () => {
  // Simulating API call
  return [
    { id: 'club1', name: 'Chess Club' },
    { id: 'club2', name: 'Debate Society' },
  ];
};

const EventCard = ({ event, onLeave }) => {
  const eventDate = new Date(event.datetime);
  return (
    <Card className="mb-4 p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold">{event.title}</h3>
      </div>
      <div className="flex items-center text-gray-600 mb-2">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>{eventDate.toLocaleDateString()} {eventDate.toLocaleTimeString()}</span>
      </div>
      <Button onClick={() => onLeave(event.id)} className="bg-red-500 hover:bg-red-600">
        Leave Event
      </Button>
    </Card>
  );
};

const ClubCard = ({ club, onLeave }) => {
  return (
    <Card className="mb-4 p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold">{club.name}</h3>
      </div>
      <Button onClick={() => onLeave(club.id)} className="bg-red-500 hover:bg-red-600">
        Leave Club
      </Button>
    </Card>
  );
};

const UserActivities = () => {
  const [user] = useFetchUser();
  const { data: userEvents, isLoading: eventsLoading, errEvent } = useQuery({
    queryKey: ['userEvents'],
    queryFn: () => fetchUserEvents(user.id),
  });

  const { data: userClubs, isLoading: clubsLoading, errClub } = useQuery({
    queryKey: ['userClubs'],
    queryFn: fetchUserClubs,
  });

  const handleLeaveEvent = (eventId) => {
    // Implement leave event logic
    console.log(`Leaving event with ID: ${eventId}`);
  };

  const handleLeaveClub = (clubId) => {
    // Implement leave club logic
    console.log(`Leaving club with ID: ${clubId}`);
  };

  if (eventsLoading || clubsLoading) return <div className='mt-10'>Loading your activities...</div>;

  if (errEvent) return <div className='mt-10'>Error loading events: {errEvent.message}</div>;

  if (!userEvents || userEvents.length === 0) return <div className='mt-10'>No events found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Activities</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Events</h3>
        {userEvents.map(event => (
          <EventCard key={event.id} event={event} onLeave={handleLeaveEvent} />
        ))}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Clubs</h3>
        {userClubs.map(club => (
          <ClubCard key={club.id} club={club} onLeave={handleLeaveClub} />
        ))}
      </div>
    </div>
  );
};

export default UserActivities;