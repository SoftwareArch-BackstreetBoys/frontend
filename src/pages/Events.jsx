import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, MapPin, Search, Clock, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useFetchUser } from '@/utils/useFetchUser';

// Mock functions to simulate backend services
const fetchEvents = async () => {
  try {
    const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/events`);
    return events.data.events
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error
  }
};

const isUserInClub = (clubId) => clubId === 'chess123'; // Mock function

const joinEvent = async (payload) => {
  const [user] = useFetchUser();
  payload.userId = user.id
  return axios.post("http://34.57.95.175:8000/event/event/${eventId}", payload, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });
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

const CreateEventDialog = ({ open, onOpenChange }) => {
  const [user] = useFetchUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: '',
    location: '',
    max_participation: 0,
    club_id: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: async (newEvent) => {
      newEvent.max_participation = parseInt(newEvent.max_participation)
      newEvent.created_by_id = user.id
      newEvent.created_by_name = user.sub.fullName
      console.log('Creating event:', newEvent);
      return axios.post(`${process.env.REACT_APP_EVENT_ROUTE}/event`, newEvent, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event created successfully!",
        description: "Your event has been added to the timeline.",
      });
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        datetime: '',
        location: '',
        max_participation: 0,
        club_id: '',
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createEventMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="mb-2">Create New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="datetime">Date and Time</Label>
              <Input
                id="datetime"
                name="datetime"
                type="datetime-local"
                value={formData.datetime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max_participation">Maximum Participants</Label>
              <Input
                id="max_participation"
                name="max_participation"
                type="number"
                min="1"
                value={formData.max_participation}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="mt-2" type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EventCard = ({ event, onJoin, onLeave, isParticipant }) => {
  const [user] = useFetchUser();
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
        Created by: {event.created_by_name}
      </div>
      {user && (user.id !== event.created_by_id) &&
        <Button
          onClick={handleActionClick}
          disabled={!isParticipant && event.curParticipation >= event.max_participation}
          className={isClubEvent ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          {!isParticipant && event.curParticipation >= event.max_participation ? 'Event Full' :
            isParticipant ? 'Leave Event' : 'Join Event'}
        </Button>
      }

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
  const [user] = useFetchUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [createEventOpen, setCreateEventOpen] = useState(false);
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
      {/* Floating Action Button */}
      {
        user &&
        <div>
          <Button
            className="fixed bottom-8 right-8 shadow-lg rounded-full py-6 bg-green-500 hover:bg-green-400"
            onClick={() => setCreateEventOpen(true)}
          >
            <Plus className="h-6 w-6 mr-2" />
            New Event
          </Button>
          {/* Create Event Dialog */}
          <CreateEventDialog
            open={createEventOpen}
            onOpenChange={setCreateEventOpen}
          />
        </div>
      }
    </div>
  );
};

export default Events;
