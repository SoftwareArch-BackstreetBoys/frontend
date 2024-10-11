import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users, MapPin } from 'lucide-react';

// Mock function to fetch events (replace with actual API call)
const fetchEvents = async () => {
  // Simulating API call
  return [
    { id: 1, title: 'Public Event 1', date: '2024-03-15', time: '14:00', location: 'Main Hall', participants: 50, isPublic: true },
    { id: 2, title: 'Club Event 1', date: '2024-03-16', time: '15:30', location: 'Club Room A', participants: 20, isPublic: false },
    { id: 3, title: 'Public Event 2', date: '2024-03-17', time: '10:00', location: 'Auditorium', participants: 100, isPublic: true },
    // Add more mock events as needed
  ];
};

// Mock function to check if user is in a club (replace with actual logic)
const isUserInClub = (eventId) => {
  // Simulating club membership check
  return eventId % 2 === 0; // For demo, assume user is in clubs with even IDs
};

const EventCard = ({ event }) => (
  <Card className="mb-4 p-4">
    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
    <div className="flex items-center text-gray-600 mb-2">
      <CalendarIcon className="mr-2 h-4 w-4" />
      <span>{event.date} at {event.time}</span>
    </div>
    <div className="flex items-center text-gray-600 mb-2">
      <MapPin className="mr-2 h-4 w-4" />
      <span>{event.location}</span>
    </div>
    <div className="flex items-center text-gray-600 mb-4">
      <Users className="mr-2 h-4 w-4" />
      <span>{event.participants} participants</span>
    </div>
    <Button>Join Event</Button>
  </Card>
);

const Events = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Event Timeline</h2>
      <div className="space-y-6">
        {events.map(event => (
          (event.isPublic || isUserInClub(event.id)) && (
            <EventCard key={event.id} event={event} />
          )
        ))}
      </div>
    </div>
  );
};

export default Events;