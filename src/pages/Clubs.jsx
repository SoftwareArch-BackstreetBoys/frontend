import React, { useState, useEffect } from 'react';
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
import ClubCard from '@/components/club/ClubCard';
import ClubForm from '@/components/club/ClubForm';
import SearchBar from '@/components/event/SearchBar';
import * as clubService from '@/services/clubService';
const Clubs = () => {
  const [user] = useFetchUser();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userClubs, setUserClubs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const initialFormData = {
    name: '',
    description: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  useEffect(() => {
    const initializeUserClubs = async () => {
      if (!user?.id) return
      try {
        const clubs = await clubService.fetchUserClubs(user.id);
        const clubIds = clubs.map((club) => club.id);
        setUserClubs(clubIds);
      } catch (error) {
        console.error("Error initializing user clubs:", error);
      }
    };
    initializeUserClubs();
  }, [user]);

  const { data: clubs, isLoading, error } = useQuery({
    queryKey: ['clubs', searchQuery],
    queryFn: () => searchQuery ? clubService.searchClubs(searchQuery) : clubService.fetchClubs(),
  });
  const createClubMutation = useMutation({
    mutationFn: clubService.createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Club created successfully!",
        description: "Your club has been created.",
      });
      setDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({
        title: "Error creating club",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const updateClubMutation = useMutation({
    mutationFn: ({ id, data }) => clubService.updateClub(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Club updated successfully!",
        description: "Your club has been updated.",
      });
      setDialogOpen(false);
      setEditingClub(null);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({
        title: "Error updating club",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const deleteClubMutation = useMutation({
    mutationFn: clubService.deleteClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Club deleted successfully!",
        description: "The club has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting club",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const joinMutation = useMutation({
    mutationFn: clubService.joinClub,
    onSuccess: (data, { clubId }) => {
      setUserClubs([...userClubs, clubId]);
      queryClient.invalidateQueries(['clubs']);
    },
  });
  const leaveMutation = useMutation({
    mutationFn: clubService.leaveClub,
    onSuccess: (data, { clubId }) => {
      setUserClubs(userClubs.filter(id => id !== clubId));
      queryClient.invalidateQueries(['clubs']);
    },
  });
  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };
  const handleEditClub = (club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
    });
    setDialogOpen(true);
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clubData = {
      ...formData,
      created_by_id: user?.id,
      created_by_name: user?.fullName,
    };
    if (editingClub) {
      updateClubMutation.mutate({ id: editingClub.id, data: clubData });
    } else {
      createClubMutation.mutate(clubData);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  if (isLoading) {
    if (!user?.id) return (
      <div>You must Login to view Clubs</div>
    );
    return <div>Loading clubs...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Clubs</h2>
      <div className="mb-6">
        <SearchBar
          option='club'
          value={searchInput}
          onChange={handleSearchInput}
          onSearch={handleSearch}
        />
      </div>
      {error && <div className="text-red-500 mb-4">Error loading clubs: {error.message}</div>}
      {clubs?.length === 0 && !isLoading && !error && (
        <div className="text-gray-500">No clubs found. Please try a different search.</div>
      )}
      <div className="space-y-6">
        {clubs?.map((club) => (
          <ClubCard
            key={club.id}
            club={club}
            onJoin={() => joinMutation.mutate({ clubId: club.id, user_id: user?.id })}
            onLeave={() => leaveMutation.mutate({ clubId: club.id, user_id: user?.id })}
            onEdit={handleEditClub}
            onDelete={deleteClubMutation.mutate}
            isMember={userClubs.includes(club.id)}
            isCreator={user?.id === club.created_by_id}
            currentUserId={user?.id}
          />
        ))}
      </div>
      {user && (
        <div>
          <Button
            className="fixed bottom-8 right-8 shadow-lg rounded-full py-6 bg-green-500 hover:bg-green-400"
            onClick={() => {
              setEditingClub(null);
              setFormData(initialFormData);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-6 w-6 mr-2" />
            New Club
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="mb-2">
                  {editingClub ? 'Edit Club' : 'Create New Club'}
                </DialogTitle>
              </DialogHeader>
              <ClubForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleFormSubmit}
                isSubmitting={createClubMutation.isPending || updateClubMutation.isPending}
                submitText={editingClub ? 'Update Club' : 'Create Club'}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};
export default Clubs;