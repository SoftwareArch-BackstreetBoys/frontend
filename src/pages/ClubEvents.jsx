import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
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
import { getClubInfo } from '@/services/clubService';

const ClubEvents = () => {
    const { clubId } = useParams();
    const [user] = useFetchUser();
    const [clubInfo, setClubInfo] = useState();
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [userEvents, setUserEvents] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    useEffect(() => {
        const fetchClubInfo = async () => {
            try {
                const data = await getClubInfo(clubId);
                setClubInfo(data);
            } catch (err) {
                console.error("Failed to fetch club info: ", err);
            }
        };
        fetchClubInfo();
    }, [clubId]);

    const initialFormData = {
        title: '',
        description: '',
        datetime: '',
        location: '',
        max_participation: 0,
        club_id: clubId, // Pre-fill the club_id
    };
    const [formData, setFormData] = useState(initialFormData);

    const { data: events, isLoading, error, refetch: refetchEvents } = useQuery({
        queryKey: ['clubEvents', clubId, searchQuery],
        queryFn: async () => {
            try {
                // Ensure clubId is valid
                if (!clubId) {
                    console.error('Invalid clubId');
                    return []; // Return empty array if clubId is invalid
                }

                // Handle empty searchQuery and fetch all events
                if (!searchQuery || searchQuery.trim() === '') {
                    // console.log('Search query is empty, fetching all club events');
                    const allClubEvents = await eventService.fetchClubEvents(clubId);
                    return allClubEvents || []; // Return empty array if no events are found
                }

                // Search for events using searchQuery
                const searchedClubEvents = await eventService.searchClubEvents(clubId, searchQuery);
                return searchedClubEvents || []; // Return empty array if no events match the search query
            } catch (error) {
                console.error('Error loading club events:', error);
                return []; // Return empty array on error to prevent undefined
            }
        },
    });


    const createEventMutation = useMutation({
        mutationFn: eventService.createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({
                title: "Event created successfully!",
                description: "Your event has been added to the timeline.",
            });
            refetchEvents();
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
            refetchEvents();
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
            refetchEvents();
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
            refetchEvents();
            console.log(userEvents)
        },
    });

    const leaveMutation = useMutation({
        mutationFn: eventService.leaveEvent,
        onSuccess: (data, { eventId }) => {
            setUserEvents(userEvents.filter(id => id !== eventId));
            refetchEvents();
            queryClient.invalidateQueries(['events']);
        },
    });

    const handleSearchInput = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    // const handleSearch = (e) => {
    //   console.log("ping:", e.target.value)
    //   setSearchQuery(e.target.value);
    // };

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
            <h2 className="text-2xl font-bold mb-6">{clubInfo?.name} Events</h2>
            <div className="mb-6">
                <SearchBar
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={() => setSearchQuery(searchInput)}
                />
            </div>

            {error && <div className="text-red-500 mb-4">Error loading events: {error.message}</div>}
            {events?.length === 0 && !isLoading && !error && (
                <div className="text-gray-500">No events found.</div>
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

            {user && (
                <Button
                    className="fixed bottom-8 right-8 shadow-lg rounded-full py-6 bg-green-500 hover:bg-green-400"
                    onClick={() => {
                        setEditingEvent(null);
                        setFormData(initialFormData);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className="h-6 w-6 mr-2" />
                    New Club Event
                </Button>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="mb-2">
                            {editingEvent ? 'Edit Event' : 'Create New Club Event'}
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
    );
};

export default ClubEvents;