import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, MapPin, Search, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock functions to simulate backend services
const fetchEvents = async () => {
  // Simulating API call
  // return [
  //   {
  //     id: '507f1f77bcf86cd799439011',
  //     title: 'Public Event 1',
  //     description: 'A public event for all students',
  //     datetime: '2024-03-15T14:00:00Z',
  //     location: 'Main Hall',
  //     maxParticipation: 100,
  //     curParticipation: 50,
  //     clubId: null,
  //     createdBy: 'admin123',
  //     createdAt: '2024-02-01T10:00:00Z',
  //     updatedAt: '2024-02-01T10:00:00Z'
  //   },
  //   {
  //     id: '507f1f77bcf86cd799439012',
  //     title: 'Club Event 1',
  //     description: 'Chess tournament for club members',
  //     datetime: '2024-03-16T15:30:00Z',
  //     location: 'Club Room A',
  //     maxParticipation: 30,
  //     curParticipation: 20,
  //     clubId: 'chess123',
  //     createdBy: 'chesspresident',
  //     createdAt: '2024-02-02T11:00:00Z',
  //     updatedAt: '2024-02-02T11:00:00Z'
  //   },
  // ];
  try {
    const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/events`);
    return events.data.events
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error
  }
};

const isUserInClub = (clubId) => clubId === 'chess123'; // Mock function

const joinEvent = async (eventId) => {
  // Mock implementation
  console.log(`Joined event with ID: ${eventId}`);
  // In a real implementation, this would make an API call to join the event
};

const leaveEvent = async (eventId) => {
  // Mock implementation
  console.log(`Left event with ID: ${eventId}`);
  // In a real implementation, this would make an API call to leave the event
};

const searchEvents = async (query) => {
  // Mock implementation
  const allEvents = await fetchEvents();
  return allEvents.filter(event =>
    event.title.toLowerCase().includes(query.toLowerCase()) ||
    event.description.toLowerCase().includes(query.toLowerCase())
  );
};

const EventCard = ({ event, onJoin, onLeave, isParticipant }) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const eventDate = new Date(event.datetime);
  const isClubEvent = !!event.clubId;

  const handleActionClick = () => {
    if (isParticipant) {
      setShowLeaveDialog(true);
    } else {
      onJoin(event.id);
    }
  };

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
        <span>{event.cur_participation || 0} / {event.max_participation} participants</span>
      </div>
      {isClubEvent && (
        <div className="text-purple-600 mb-2">
          Club: {event.clubId}
        </div>
      )}
      <div className="text-gray-600 mb-4">
        Created by: {event.created_by}
      </div>
      <Button
        onClick={handleActionClick}
        disabled={!isParticipant && event.curParticipation >= event.maxParticipation}
        className={isClubEvent ? 'bg-purple-600 hover:bg-purple-700' : ''}
      >
        {!isParticipant && event.curParticipation >= event.maxParticipation ? 'Event Full' :
          isParticipant ? 'Leave Event' : 'Join Event'}
      </Button>
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You may not be able to rejoin if the event becomes full.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onLeave(event.id)}>Leave Event</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userEvents, setUserEvents] = useState([]);  // In a real app, this would be fetched from the backend
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', searchQuery],
    queryFn: () => searchQuery ? searchEvents(searchQuery) : fetchEvents(),
  });

  const joinMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: (data, eventId) => {
      setUserEvents([...userEvents, eventId]);
      queryClient.invalidateQueries(['events']);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveEvent,
    onSuccess: (data, eventId) => {
      setUserEvents(userEvents.filter(id => id !== eventId));
      queryClient.invalidateQueries(['events']);
    },
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleJoinEvent = (eventId) => {
    joinMutation.mutate(eventId);
  };

  const handleLeaveEvent = (eventId) => {
    leaveMutation.mutate(eventId);
  };

  // Add loading and error states
  if (isLoading) {
    return <div>Loading events...</div>; // Loading indicator
  }

  if (error) {
    return <div>Error loading events: {error.message}</div>; // Error handling
  }

  if (!events || events.length === 0) {
    return <div>No events found.</div>; // No events handling
  }

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
          <EventCard
            key={event.id}
            event={event}
            onJoin={handleJoinEvent}
            onLeave={handleLeaveEvent}
            isParticipant={userEvents.includes(event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Events;
