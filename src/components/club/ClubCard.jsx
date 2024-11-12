import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
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
import { Pencil, ArrowUpRight } from 'lucide-react';

const ClubCard = ({
    club,
    onJoin,
    onLeave,
    onEdit,
    onDelete,
    isMember,
    isCreator,
    currentUserId
}) => {
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleActionClick = () => {
        if (isMember) {
            setShowLeaveDialog(true);
        } else {
            onJoin(club.id);
        }
    };

    return (
        <Card className={`mb-4 p-4 ${isCreator ? 'bg-purple-50 border-purple-200' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">
                    {club.name}
                </h3>
                {isCreator && (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit?.(club)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            <p className="text-gray-600 mb-4">{club.description}</p>
            {currentUserId &&
                <div className={`flex items - center ${!isCreator ? 'justify-between' : 'justify-start'} `}>
                    {isMember && (
                        <Link to={`/ clubs / ${club.id} `}>
                            <Button
                                // variant="link"
                                size="lg"
                                className="flex items-center gap-2 px-4"
                            >
                                View Club Events
                                <ArrowUpRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    {!isCreator && (
                        <Button
                            onClick={handleActionClick}
                            className={isMember ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                        >
                            {isMember ? 'Leave Club' : 'Join Club'}
                        </Button>
                    )}
                </div>
            }
            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to leave this club? <br />
                            <strong>{club.name}</strong></AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. You'll need to rejoin if you change your mind.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => onLeave(club.id)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Leave Club
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Club <br />
                            <strong>{club.name}</strong></AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this club?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete?.(club.id);
                                setShowDeleteDialog(false);
                            }}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default ClubCard;