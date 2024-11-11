import axios from 'axios';
export const fetchEvents = async (joined_club_ids) => {
    try {
        const events = await axios.post(`${process.env.REACT_APP_EVENT_ROUTE}/events`, { joined_club_ids }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        // Extract public and joined club events
        const { public_events, joined_club_events } = events.data;

        // Combine both arrays
        const allEvents = [...public_events, ...joined_club_events];

        // Filter out events that are in the past
        const futureEvents = allEvents.filter(event => new Date(event.datetime) > new Date());

        // Sort the remaining future events by `datetime` in ascending order (nearest event first)
        const sortedEvents = futureEvents.sort((a, b) => {
            // Convert `datetime` strings to Date objects for comparison
            const dateA = new Date(a.datetime);
            const dateB = new Date(b.datetime);
            return dateA - dateB; // Sort in ascending order (nearest first)
        });

        return sortedEvents; // Return the sorted array
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};
export const createEvent = async (eventData) => {
    return axios.post(`${process.env.REACT_APP_EVENT_ROUTE}/event`, eventData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
};
export const updateEvent = async (eventId, eventData) => {
    return axios.put(`${process.env.REACT_APP_EVENT_ROUTE}/event/${eventId}`, eventData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
};
export const deleteEvent = async (eventId) => {
    return axios.delete(`${process.env.REACT_APP_EVENT_ROUTE}/event/${eventId}`, {
        withCredentials: true,
    });
};
export const joinEvent = async ({ eventId, user_id }) => {
    return axios.post(
        `${process.env.REACT_APP_EVENT_ROUTE}/event/${eventId}/join`,
        { user_id },
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};
export const leaveEvent = async ({ eventId, user_id }) => {
    return axios.post(
        `${process.env.REACT_APP_EVENT_ROUTE}/event/${eventId}/leave`,
        { user_id },
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};
export const searchEvents = async (query, userClubs) => {
    const allEvents = await fetchEvents(userClubs);
    return allEvents.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
    );
};
export const fetchHostedEvents = async (userId) => {
    try {
        const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/user/${userId}/events`);
        // console.log("participated events:", events.data.events)
        // Filter out events that are in the past
        const futureEvents = events.data.events.filter(event => new Date(event.datetime) > new Date());

        // Sort the remaining future events by `datetime` in ascending order (nearest event first)
        const sortedEvents = futureEvents.sort((a, b) => {
            // Convert `datetime` strings to Date objects for comparison
            const dateA = new Date(a.datetime);
            const dateB = new Date(b.datetime);
            return dateA - dateB; // Sort in ascending order (nearest first)
        });
        return sortedEvents
    } catch (error) {
        console.error("Error fetching all participated-events:", error);
        throw error
    }
};
export const fetchParticipatedEvents = async (userId) => {
    try {
        const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/user/${userId}/participated-events`);
        // console.log("participated events:", events.data.events)
        // Filter out events that are in the past
        const futureEvents = events.data.events.filter(event => new Date(event.datetime) > new Date());

        // Sort the remaining future events by `datetime` in ascending order (nearest event first)
        const sortedEvents = futureEvents.sort((a, b) => {
            // Convert `datetime` strings to Date objects for comparison
            const dateA = new Date(a.datetime);
            const dateB = new Date(b.datetime);
            return dateA - dateB; // Sort in ascending order (nearest first)
        });
        return sortedEvents
    } catch (error) {
        console.error("Error fetching all participated-events:", error);
        throw error
    }
};
export const fetchClubEvents = async (clubId) => {
    try {
        const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/club/${clubId}/events`);
        // Filter out events that are in the past
        const futureEvents = events.data.events.filter(event => new Date(event.datetime) > new Date());

        // Sort the remaining future events by `datetime` in ascending order (nearest event first)
        const sortedEvents = futureEvents.sort((a, b) => {
            // Convert `datetime` strings to Date objects for comparison
            const dateA = new Date(a.datetime);
            const dateB = new Date(b.datetime);
            return dateA - dateB; // Sort in ascending order (nearest first)
        });
        return sortedEvents
    } catch (error) {
        console.error("Error fetching club events:", error);
        throw error;
    }
};

export const searchClubEvents = async (clubId, query) => {
    const allEvents = await fetchClubEvents(clubId);
    return allEvents.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
    );
};