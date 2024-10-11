import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, MapPin, Search, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";

// Mock functions to simulate backend services
const fetchEvents = async () => {
  // Simulating API call
  return [
    { 
      id: '507f1f77bcf86cd799439011',
      title: 'Public Event 1',
      description: 'A public event for all students',
      datetime: '2024-03-15T14:00:00Z',
      location: 'Main Hall',
      maxParticipation: 100,
      curParticipation: 50,
      clubId: null,
      createdBy: 'admin123',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z'
    },
    { 
      id: '507f1f77bcf86cd799439012',
      title: 'Club Event 1',
      description: 'Chess tournament for club members',
      datetime: '2024-03-16T15:30:00Z',
      location: 'Club Room A',
      maxParticipation: 30,
      curParticipation: 20,
      clubId: 'chess123',
      createdBy: 'chesspresident',
      createdAt: '2024-02-02T11:00:00Z',
      updatedAt: '2024-02-02T11:00:00Z'
    },
  ];
};

const isUserInClub = (clubId) => clubId === 'chess123'; // Mock function

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

const EventCard = ({ event, onJoin }) => {
  const eventDate = new Date(event.datetime);
  const isClubEvent = !!event.clubId;

  return (
    <Card className={`mb-4 p-4 ${isClubEvent ? 'bg-purple-50 border-purple-200' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        {isClubEvent && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Club Event
          </Badge>
        )}
      </div>
      <p className="text-gray-600 mb-2">{event.description}</p>
      <div className="flex items-center text-gray-600 mb-2">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>{eventDate.toLocaleDateString()}</span>
      </div>
      <div className="flex items-center text-gray-600 mb-2">
        <Clock className="mr-2 h-4 w-4" />
        <span>{eventDate.toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center text-gray-600 mb-2">
        <MapPin className="mr-2 h-4 w-4" />
        <span>{event.location}</span>
      </div>
      <div className="flex items-center text-gray-600 mb-2">
        <Users className="mr-2 h-4 w-4" />
        <span>{event.curParticipation} / {event.maxParticipation} participants</span>
      </div>
      {isClubEvent && (
        <div className="text-purple-600 mb-2">
          Club: {event.clubId}
        </div>
      )}
      <div className="text-gray-600 mb-4">
        Created by: {event.createdBy}
      </div>
      <Button 
        onClick={() => onJoin(event.id)}
        disabled={event.curParticipation >= event.maxParticipation}
        className={isClubEvent ? 'bg-purple-600 hover:bg-purple-700' : ''}
      >
        {event.curParticipation >= event.maxParticipation ? 'Event Full' : 'Join Event'}
      </Button>
    </Card>
  );
};

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
          (!event.clubId || isUserInClub(event.clubId)) && (
            <EventCard key={event.id} event={event} onJoin={handleJoinEvent} />
          )
        ))}
      </div>
    </div>
  );
};

export default Events;