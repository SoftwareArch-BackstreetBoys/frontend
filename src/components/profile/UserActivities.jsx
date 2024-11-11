import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CalendarIcon, Users } from 'lucide-react';
import { useFetchUser } from '@/utils/useFetchUser';
import { useToast } from "@/components/ui/use-toast";
import EventCard from '@/components/event/EventCard';
import EventForm from '@/components/event/EventForm';
import ClubForm from '../club/ClubForm';
import ClubCard from '../club/ClubCard';
import * as eventService from '@/services/eventService';
import { fetchUserClubs, leaveClub } from '@/services/clubService';
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

// const EventCard = ({ event, onLeave }) => {
//   const [showLeaveDialog, setShowLeaveDialog] = useState(false);
//   const eventDate = new Date(event.datetime);
//   return (
//     <Card className="mb-4 p-4">
//       <div className="flex justify-between items-start mb-2">
//         <h3 className="text-xl font-semibold">{event.title}</h3>
//       </div>
//       <div className="flex items-center text-gray-600 mb-2">
//         <CalendarIcon className="mr-2 h-4 w-4" />
//         <span>{eventDate.toLocaleDateString()} {eventDate.toLocaleTimeString()}</span>
//       </div>
//       <Button onClick={() => onLeave(event)} className="bg-red-500 hover:bg-red-600">
//         Leave Event
//       </Button>
//     </Card>
//   );
// };

// const ClubCard = ({ club, onLeave }) => {
//   return (
//     <Card className="mb-4 p-4">
//       <div className="flex justify-between items-start mb-2">
//         <Link to={`/clubs/${club.id}`}>
//           <h3 className="text-xl font-semibold hover:underline cursor-pointer">
//             {club.name}
//           </h3>
//         </Link>      </div>
//       <p className="text-gray-600 mb-4">{club.description}</p>
//       <Button onClick={() => onLeave(club)} className="bg-red-500 hover:bg-red-600">
//         Leave Club
//       </Button>
//     </Card>
//   );
// };

const UserActivities = () => {
  const [user] = useFetchUser();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null); // To track selected event/club
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const leaveClubMutation = useMutation({
    mutationFn: leaveClub,
    onSuccess: (data, { clubId }) => {
      refetchClubs();
    },
  });

  const handleLeaveConfirm = () => {
    if (selectedActivity.type === 'event') {
      leaveEventMutation.mutate({ eventId: selectedActivity.id, user_id: user?.id });
    } else if (selectedActivity.type === 'club') {
      leaveClubMutation.mutate({ clubId: selectedActivity.id, user_id: user?.id })
    }
    setShowLeaveDialog(false);
  };

  // if (hostedEventsLoading || participatedEventsLoading || clubsLoading) return <div className='mt-10'>Loading your activities...</div>;

  // if (errHostedEvent) return <div className='mt-10'>Error loading hosted events: {errHostedEvent.message}</div>;

  // if (errParticipatedEvent) return <div className='mt-10'>Error loading participated events: {errParticipatedEvent.message}</div>;

  // if (errClub) return <div className='mt-10'>Error loading clubs: {errClub.message}</div>;

  // if ((!hostedEvents || hostedEvents.length === 0) && (!participatedEvents || participatedEvents.length === 0) && (!userClubs || userClubs.length === 0)) {
  //   return <div className='mt-10'>No activities found.</div>;
  // }
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
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
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
            onEdit={isHosted ? () => { } : undefined}
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
      {renderEventSection(
        "Hosted Events",
        hostedEvents,
        hostedEventsLoading,
        errHostedEvent,
        true
      )}

      {renderEventSection(
        "Participated Events",
        participatedEvents,
        participatedEventsLoading,
        errParticipatedEvent
      )}
      {/* Club */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Clubs</h3>
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
              isMember={true}
              isCreator={user?.id === club.created_by_id}
            />
          ))
        ) : (
          <div className="text-gray-500 mb-4">No clubs found.</div>
        )}
      </div>

      {/* AlertDialog for leaving event/club */}
      {/* <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedActivity?.type === 'event' ? (
                <>
                  Are you sure you want to leave this event? <br />
                  <strong>{selectedActivity?.title}</strong>
                </>
              ) : (
                <>
                  Are you sure you want to leave the club? <br />
                  <strong>{selectedActivity?.name}</strong>
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You may not be able to rejoin if the event becomes full.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className='bg-red-600 hover:bg-red-500' onClick={handleLeaveConfirm}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
};

export default UserActivities;

