import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CalendarIcon, Users } from 'lucide-react';
import { useFetchUser } from '@/utils/useFetchUser';
import { useToast } from "@/components/ui/use-toast";
// import EventCard from '@/components/event/EventCard';
import EventForm from '@/components/event/EventForm';
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

const EventCard = ({ event, onLeave }) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
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
      <Button onClick={() => onLeave(event)} className="bg-red-500 hover:bg-red-600">
        Leave Event
      </Button>
    </Card>
  );
};

const ClubCard = ({ club, onLeave }) => {
  return (
    <Card className="mb-4 p-4">
      <div className="flex justify-between items-start mb-2">
        <Link to={`/clubs/${club.id}`}>
          <h3 className="text-xl font-semibold hover:underline cursor-pointer">
            {club.name}
          </h3>
        </Link>      </div>
      <p className="text-gray-600 mb-4">{club.description}</p>
      <Button onClick={() => onLeave(club)} className="bg-red-500 hover:bg-red-600">
        Leave Club
      </Button>
    </Card>
  );
};

const UserActivities = () => {
  const [user] = useFetchUser();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null); // To track selected event/club

  const { data: userEvents, isLoading: eventsLoading, error: errEvent, refetch: refetchEvents } = useQuery({
    queryKey: ['userEvents'],
    queryFn: () => eventService.fetchUserEvents(user.id),
  });

  const { data: userClubs, isLoading: clubsLoading, error: errClub, refetch: refetchClubs } = useQuery({
    queryKey: ['userClubs'],
    queryFn: () => fetchUserClubs(user.id),
  });

  const leaveEventMutation = useMutation({
    mutationFn: eventService.leaveEvent,
    onSuccess: () => {
      // Refetch events after leaving an event
      refetchEvents();
    },
    onError: (error) => {
      console.error("Error leaving event:", error);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveClub,
    onSuccess: (data, { clubId }) => {
      refetchClubs();
    },
  });

  const handleLeaveEvent = (event) => {
    setSelectedActivity({ type: 'event', id: event.id, title: event.title });
    setShowLeaveDialog(true);
  };

  const handleLeaveClub = (club) => {
    setSelectedActivity({ type: 'club', id: club.id, name: club.name });
    setShowLeaveDialog(true);
  };

  const handleLeaveConfirm = () => {
    if (selectedActivity.type === 'event') {
      leaveEventMutation.mutate({ eventId: selectedActivity.id, user_id: user?.id });
    } else if (selectedActivity.type === 'club') {
      leaveMutation.mutate({ clubId: selectedActivity.id, user_id: user?.id })
    }
    setShowLeaveDialog(false);
  };

  if (eventsLoading || clubsLoading) return <div className='mt-10'>Loading your activities...</div>;

  if (errEvent) return <div className='mt-10'>Error loading events: {errEvent.message}</div>;

  if (errClub) return <div className='mt-10'>Error loading clubs: {errClub.message}</div>;

  if ((!userEvents || userEvents.length === 0) && (!userClubs || userClubs.length === 0)) {
    return <div className='mt-10'>No activities found.</div>;
  }

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

      {/* AlertDialog for leaving event/club */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
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
      </AlertDialog>
    </div>
  );
};

export default UserActivities;
