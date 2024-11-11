import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFetchUser } from '@/utils/useFetchUser';
import { useToast } from "@/components/ui/use-toast";
import EventCard from '@/components/event/EventCard';
import EventForm from '@/components/event/EventForm';
import ClubForm from '../club/ClubForm';
import ClubCard from '../club/ClubCard';
import * as eventService from '@/services/eventService';
import { fetchUserClubs, leaveClub, updateClub } from '@/services/clubService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


const UserActivities = () => {
  const [user] = useFetchUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [dialogClubOpen, setDialogClubOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const initialFormData = {
    title: '',
    description: '',
    datetime: '',
    location: '',
    max_participation: 0,
    club_id: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const initialClubFormData = {
    name: '',
    description: '',
  };
  const [clubFormData, setClubFormData] = useState(initialClubFormData);

  const { data: hostedEvents = [], isLoading: hostedEventsLoading, error: errHostedEvent, refetch: refetchHostedEvents } = useQuery({
    queryKey: ['hostedEvents'],
    queryFn: () => eventService.fetchHostedEvents(user.id),
  });

  const { data: participatedEvents = [], isLoading: participatedEventsLoading, error: errParticipatedEvent, refetch: refetchParticipatedEvents } = useQuery({
    queryKey: ['participatedEvents'],
    queryFn: () => eventService.fetchParticipatedEvents(user.id),
  });

  const { data: userClubs = [], isLoading: clubsLoading, error: errClub, refetch: refetchClubs } = useQuery({
    queryKey: ['userClubs'],
    queryFn: () => fetchUserClubs(user.id),
  });

  // Event Mutation
  const leaveEventMutation = useMutation({
    mutationFn: eventService.leaveEvent,
    onSuccess: () => {
      // Refetch events after leaving an event
      refetchHostedEvents();
      refetchParticipatedEvents();
    },
    onError: (error) => {
      console.error("Error leaving event:", error);
    },
  });
  const deleteEventMutation = useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostedEvents'] });
      toast({
        title: "Event deleted successfully",
        description: "The event has been removed.",
      });
    },
  });
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => eventService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event updated successfully!",
        description: "Your event has been updated.",
      });
      refetchHostedEvents();
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

  // Club Mutation
  const leaveClubMutation = useMutation({
    mutationFn: leaveClub,
    onSuccess: (data, { clubId }) => {
      refetchClubs();
    },
  });
  const updateClubMutation = useMutation({
    mutationFn: ({ id, data }) => updateClub(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Club updated successfully!",
        description: "Your club has been updated.",
      });
      setDialogClubOpen(false);
      setEditingClub(null);
      setClubFormData(initialClubFormData);
      refetchClubs();
    },
    onError: (error) => {
      toast({
        title: "Error updating club",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Event Handle
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
      // createEventMutation.mutate(eventData);
    }
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Club Handle
  const handleClubFormSubmit = (e) => {
    e.preventDefault();
    const clubData = {
      ...clubFormData,
      created_by_id: user?.id,
      created_by_name: user?.fullName,
    };
    if (editingClub) {
      updateClubMutation.mutate({ id: editingClub.id, data: clubData });
    } else {
      // createClubMutation.mutate(clubData);
    }
  };
  const handleClubChange = (e) => {
    const { name, value } = e.target;
    setClubFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleEditClub = (club) => {
    setEditingClub(club);
    setClubFormData({
      name: club.name,
      description: club.description,
    });
    setDialogClubOpen(true);
  };

  // Loading...
  if (hostedEventsLoading && participatedEventsLoading && clubsLoading) {
    return <div className='mt-10'>Loading your activities...</div>;
  }

  const hasNoContent =
    (!errHostedEvent && (!hostedEvents || hostedEvents.length === 0)) &&
    (!errParticipatedEvent && (!participatedEvents || participatedEvents.length === 0)) &&
    (!errClub && (!userClubs || userClubs.length === 0));

  if (hasNoContent) {
    return <div className='mt-10'>No activities found.</div>;
  }

  const renderEventSection = (title, events, isLoading, error, isHosted = false) => (
    <div className="mb-2">
      {isLoading ? (
        <div className="text-gray-500">Loading events...</div>
      ) : error ? (
        <div className="text-red-500">Error loading events: {error.message}</div>
      ) : events.length > 0 ? (
        events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onJoin={() => { }}
            onLeave={() => leaveEventMutation.mutate({ eventId: event.id, user_id: user?.id })}
            onEdit={isHosted ? handleEditEvent : () => undefined}
            onDelete={isHosted ? (id) => deleteEventMutation.mutate(id) : undefined}
            isParticipant={true}
            currentUserId={user?.id}
          />
        ))
      ) : (
        <div className="text-gray-500">No events found</div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Activities</h2>
      <Accordion type="multiple" defaultValue={["hosted", "participated", "clubs"]} className="w-full space-y-4">
        <AccordionItem value="hosted">
          <AccordionTrigger className="text-xl font-semibold">
            Hosted Events
            {hostedEventsLoading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
          </AccordionTrigger>
          <AccordionContent>
            {renderEventSection(
              "",
              hostedEvents,
              hostedEventsLoading,
              errHostedEvent,
              true
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="participated">
          <AccordionTrigger className="text-xl font-semibold">
            Participated Events
            {participatedEventsLoading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
          </AccordionTrigger>
          <AccordionContent>
            {renderEventSection(
              "",
              participatedEvents,
              participatedEventsLoading,
              errParticipatedEvent
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="clubs">
          <AccordionTrigger className="text-xl font-semibold">
            Clubs
            {clubsLoading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
          </AccordionTrigger>
          <AccordionContent>
            {errClub ? (
              <div className="text-red-500 mb-4">Error loading clubs: {errClub.message}</div>
            ) : clubsLoading ? (
              <div className="text-gray-500 mb-4">Loading clubs...</div>
            ) : userClubs?.length > 0 ? (
              userClubs.map(club => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onJoin={() => { }}
                  onLeave={() => leaveClubMutation.mutate({ clubId: club.id, user_id: user?.id })}
                  onEdit={handleEditClub}
                  isMember={true}
                  isCreator={user?.id === club.created_by_id}
                />
              ))
            ) : (
              <div className="text-gray-500 mb-4">No clubs found.</div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* Edit Event Dialog */}
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
            isSubmitting={updateEventMutation.isPending}
            submitText={editingEvent ? 'Update Event' : 'Create Event'}
          />
        </DialogContent>
      </Dialog>
      {/* Edit Club Dialog */}
      <Dialog open={dialogClubOpen} onOpenChange={setDialogClubOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="mb-2">
              {editingClub ? 'Edit Club' : 'Create New Club'}
            </DialogTitle>
          </DialogHeader>
          <ClubForm
            formData={clubFormData}
            handleChange={handleClubChange}
            handleSubmit={handleClubFormSubmit}
            isSubmitting={updateClubMutation.isPending}
            submitText={editingClub ? 'Update Club' : 'Create Club'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserActivities;

