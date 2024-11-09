import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, MapPin, Clock, Pencil, Trash2 } from 'lucide-react';
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

const EventCard = ({
    event,
    onJoin,
    onLeave,
    onEdit,
    onDelete,
    isParticipant,
    currentUserId
}) => {
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const eventDate = new Date(event.datetime);
    const isClubEvent = !!event.clubId;
    const isCreator = currentUserId === event.created_by_id;
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
                <div className="flex gap-2 items-center">
                    {isClubEvent && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            Club Event
                        </Badge>
                    )}
                    {isCreator && (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                                onClick={() => onEdit(event)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
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
            {currentUserId && (currentUserId !== event.created_by_id) && (
                <Button
                    onClick={handleActionClick}
                    disabled={!isParticipant && event.curParticipation >= event.max_participation}
                    className={
                        !isParticipant && event.curParticipation >= event.max_participation
                            ? ''  // Default style for "Event Full"
                            : isParticipant
                                ? 'bg-red-600 hover:bg-red-500'  // Red color for "Leave Event"
                                : isClubEvent
                                    ? 'bg-purple-600 hover:bg-purple-500'  // Purple color for club events
                                    : ''  // Default style for "Join Event"
                    }
                >
                    {!isParticipant && event.curParticipation >= event.max_participation ? 'Event Full' :
                        isParticipant ? 'Leave Event' : 'Join Event'}
                </Button>
            )}
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
                        <AlertDialogAction className='bg-red-600 hover:bg-red-500' onClick={() => onLeave(event.id)}>Leave Event</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete(event.id);
                                setShowDeleteDialog(false);
                            }}
                            className="bg-red-600 hover:bg-red-500"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};
export default EventCard;