import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useFetchUser } from '@/utils/useFetchUser';
import EventCard from '@/components/event/EventCard';
import EventForm from '@/components/event/EventForm';
import SearchBar from '@/components/event/SearchBar';
import * as eventService from '@/services/eventService';
import { fetchUserClubs } from '@/services/clubService';

const Events = () => {
  const [user] = useFetchUser();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const initializeUserEvents = async () => {
      if (!user || !user.id) return; // Wait for `user` to be available

      try {
        const events = await eventService.fetchParticipatedEvents(user.id); // Fetch full event data
        const eventIds = events.map((event) => event.id); // Extract only the IDs
        setUserEvents(eventIds); // Set userEvents to array of IDs
      } catch (error) {
        console.error("Error initializing user events:", error);
      }
    };

    initializeUserEvents();
  }, [user]); // Add `user` as a dependency to rerun when `user` changes

  useEffect(() => {
    const initializeUserClubs = async () => {
      if (!user?.id) return;
      try {
        const clubs = await fetchUserClubs(user.id);
        const clubIds = clubs.map((club) => club.id);
        console.log("CLUBIDS:", clubIds)
        setUserClubs(clubIds);
      } catch (error) {
        console.error("Error initializing user clubs:", error);
      }
    };
    initializeUserClubs();
  }, [user]);

  const initialFormData = {
    title: '',
    description: '',
    datetime: '',
    location: '',
    max_participation: 0,
    club_id: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', userClubs, searchQuery],
    queryFn: async () => {
      try {

        // If searchQuery is empty or undefined, fetch all events for user clubs
        if (!searchQuery || searchQuery.trim() === '') {
          // Fetch events for provided user clubs
          const allEvents = await eventService.fetchEvents(userClubs);
          return allEvents || []; // Return empty array if no events are found
        }

        // Otherwise, search for events based on searchQuery
        const searchedEvents = await eventService.searchEvents(searchQuery, userClubs);
        return searchedEvents || []; // Return empty array if no events match the search query
      } catch (error) {
        console.error('Error loading events:', error);
        return []; // Return empty array on error to prevent undefined
      }
    },
    enabled: true, // Ensure the query is always enabled, even if userClubs is empty
  });

  const createEventMutation = useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event created successfully!",
        description: "Your event has been added to the timeline.",
      });
      setDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error.message,
      })
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => eventService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event updated successfully!",
        description: "Your event has been updated.",
      });
      setDialogOpen(false);
      setEditingEvent(null);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event deleted successfully!",
        description: "The event has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinMutation = useMutation({
    mutationFn: eventService.joinEvent,
    onSuccess: (data, { eventId }) => {
      setUserEvents([...userEvents, eventId]);
      queryClient.invalidateQueries(['events']);
      console.log(userEvents)
    },
  });

  const leaveMutation = useMutation({
    mutationFn: eventService.leaveEvent,
    onSuccess: (data, { eventId }) => {
      setUserEvents(userEvents.filter(id => id !== eventId));
      queryClient.invalidateQueries(['events']);
    },
  });

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      datetime: event.datetime,
      location: event.location,
      max_participation: event.max_participation,
      club_id: event.club_id || '',
    });
    setDialogOpen(true);
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      max_participation: parseInt(formData.max_participation),
      created_by_id: user.id,
      created_by_name: user.fullName,
    };
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: eventData });
    } else {
      createEventMutation.mutate(eventData);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add loading and error states
  if (isLoading) {
    return <div>Loading events...</div>; // Loading indicator
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Event Timeline</h2>
      <div className="mb-6">
        <SearchBar
          option='event'
          value={searchInput}
          onChange={handleSearchInput}
          onSearch={handleSearch}
        />
        {/* <Input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full"
          icon={<Search className="h-4 w-4" />}
        /> */}
      </div>

      {/* Show error message if events failed to load or no events found */}
      {error && <div className="text-red-500 mb-4">Error loading events: {error.message}</div>}
      {events?.length === 0 && !isLoading && !error && (
        <div className="text-gray-500">No events found. Please try a different search.</div>
      )}

      <div className="space-y-6">
        {events?.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onJoin={() => joinMutation.mutate({ eventId: event.id, user_id: user?.id })}
            onLeave={() => leaveMutation.mutate({ eventId: event.id, user_id: user?.id })}
            onEdit={handleEditEvent}
            onDelete={deleteEventMutation.mutate}
            isParticipant={userEvents.includes(event.id)}
            currentUserId={user?.id}
          />
        ))}
      </div>
      {/* Floating Action Button */}
      {
        user && (
          <div>
            <Button
              className="fixed bottom-8 right-8 shadow-lg rounded-full py-6 bg-green-500 hover:bg-green-400"
              onClick={() => {
                setEditingEvent(null);
                setFormData(initialFormData);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-6 w-6 mr-2" />
              New Event
            </Button>
            {/* Create/Edit Event Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="mb-2">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </DialogTitle>
                </DialogHeader>
                <EventForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleFormSubmit}
                  isSubmitting={createEventMutation.isPending || updateEventMutation.isPending}
                  submitText={editingEvent ? 'Update Event' : 'Create Event'}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
    </div>
  );
};

export default Events;
