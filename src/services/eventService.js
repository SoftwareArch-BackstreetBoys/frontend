import axios from 'axios';
export const fetchEvents = async () => {
    try {
        const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/events`);
        return events.data.events;
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
export const searchEvents = async (query) => {
    const allEvents = await fetchEvents();
    return allEvents.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
    );
};
export const fetchUserEvents = async (userId) => {
    try {
        const events = await axios.get(`${process.env.REACT_APP_EVENT_ROUTE}/user/${userId}/participated-events`);
        // console.log("participated events:", events.data.events)
        return events.data.events
    } catch (error) {
        console.error("Error fetching all participated-events:", error);
        throw error
    }
};