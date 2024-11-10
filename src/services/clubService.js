import axios from 'axios';
export const fetchClubs = async () => {
    try {
        const clubs = await axios.get(`${process.env.REACT_APP_CLUB_ROUTE}/clubs`);
        return clubs.data;
    } catch (error) {
        console.error("Error fetching clubs:", error);
        throw error;
    }
};
export const createClub = async (clubData) => {
    return axios.post(`${process.env.REACT_APP_CLUB_ROUTE}/club`, clubData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
};
export const updateClub = async (clubId, clubData) => {
    return axios.patch(`${process.env.REACT_APP_CLUB_ROUTE}/club/${clubId}`, clubData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
};
export const deleteClub = async (clubId) => {
    return axios.delete(`${process.env.REACT_APP_CLUB_ROUTE}/club/${clubId}`, {
        withCredentials: true,
    });
};
export const joinClub = async ({ clubId, user_id }) => {
    return axios.post(
        `${process.env.REACT_APP_CLUB_ROUTE}/clubs/${clubId}/join`,
        { user_id },
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};
export const leaveClub = async ({ clubId, user_id }) => {
    return axios.post(
        `${process.env.REACT_APP_CLUB_ROUTE}/clubs/${clubId}/leave`,
        { user_id },
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};
export const searchClubs = async (query) => {
    const allClubs = await fetchClubs();
    return allClubs.filter((club) =>
        club.name.toLowerCase().includes(query.toLowerCase()) ||
        club.description.toLowerCase().includes(query.toLowerCase())
    );
};
export const fetchUserClubs = async (userId) => {
    try {
        const clubs = await axios.get(`${process.env.REACT_APP_CLUB_ROUTE}/clubs/user`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return clubs.data;
    } catch (error) {
        console.error("Error fetching user clubs:", error);
        throw error;
    }
};
export const getClubInfo = async (clubId) => {
    try {
        const clubs = await axios.get(`${process.env.REACT_APP_CLUB_ROUTE}/club/${clubId}`);
        return clubs.data;
    } catch (error) {
        console.error("Error getClubInfo:", error);
        throw error;
    }
}