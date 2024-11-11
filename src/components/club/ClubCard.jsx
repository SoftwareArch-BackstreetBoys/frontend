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
import { Pencil, Trash2 } from 'lucide-react';

const ClubCard = ({
    club,
    onJoin,
    onLeave,
    onEdit,
    onDelete,
    isMember,
    isCreator
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
        <Card className="mb-4 p-4">
            <div className="flex justify-between items-start mb-2">
                <Link to={`/clubs/${club.id}`}>
                    <h3 className="text-xl font-semibold hover:underline cursor-pointer">
                        {club.name}
                    </h3>
                </Link>
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
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button> */}
                    </div>
                )}
            </div>
            <p className="text-gray-600 mb-4">{club.description}</p>
            {!isCreator && (
                <Button
                    onClick={handleActionClick}
                    className={isMember ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                >
                    {isMember ? 'Leave Club' : 'Join Club'}
                </Button>
            )}
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