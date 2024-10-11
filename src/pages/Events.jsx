import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users, MapPin, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

// Mock functions to simulate backend services
const fetchEvents = async () => {
  // Simulating API call
  return [
    { id: 1, title: 'Public Event 1', date: '2024-03-15', time: '14:00', location: 'Main Hall', participants: 50, isPublic: true, organizer: 'University', description: 'A public event for all students' },
    { id: 2, title: 'Club Event 1', date: '2024-03-16', time: '15:30', location: 'Club Room A', participants: 20, isPublic: false, organizer: 'Chess Club', description: 'Chess tournament for club members' },
    { id: 3, title: 'Public Event 2', date: '2024-03-17', time: '10:00', location: 'Auditorium', participants: 100, isPublic: true, organizer: 'Student Council', description: 'Annual student gathering' },
  ];
};

const isUserInClub = (eventId) => eventId % 2 === 0; // Mock function

const joinEvent = async (eventId) => {
  // Mock implementation
  console.log(`Joined event with ID: ${eventId}`);
  // In a real implementation, this would make an API call to join the event
};

const searchEvents = async (query) => {
  // Mock implementation
  const allEvents = await fetchEvents();
  return allEvents.filter(event => 
    event.title.toLowerCase().includes(query.toLowerCase()) ||
    event.description.toLowerCase().includes(query.toLowerCase())
  );
};

const EventCard = ({ event, onJoin }) => (
  <Card className="mb-4 p-4">
    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
    <p className="text-gray-600 mb-2">{event.description}</p>
    <div className="flex items-center text-gray-600 mb-2">
      <CalendarIcon className="mr-2 h-4 w-4" />
      <span>{event.date} at {event.time}</span>
    </div>
    <div className="flex items-center text-gray-600 mb-2">
      <MapPin className="mr-2 h-4 w-4" />
      <span>{event.location}</span>
    </div>
    <div className="flex items-center text-gray-600 mb-2">
      <Users className="mr-2 h-4 w-4" />
      <span>{event.participants} participants</span>
    </div>
    <div className="text-gray-600 mb-4">
      Organizer: {event.organizer}
    </div>
    <Button onClick={() => onJoin(event.id)}>Join Event</Button>
  </Card>
);

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['events', searchQuery],
    queryFn: () => searchQuery ? searchEvents(searchQuery) : fetchEvents(),
  });

  const handleJoinEvent = async (eventId) => {
    await joinEvent(eventId);
    refetch(); // Refetch events to update the UI
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Event Timeline</h2>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full"
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      <div className="space-y-6">
        {events.map(event => (
          (event.isPublic || isUserInClub(event.id)) && (
            <EventCard key={event.id} event={event} onJoin={handleJoinEvent} />
          )
        ))}
      </div>
    </div>
  );
};

export default Events;