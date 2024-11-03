// useFetchUser.js
import { useEffect, useState } from 'react';
import axios from 'axios';

async function fetchUser() {
    try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(`${process.env.GOOGLE_OAUTH_ROUTE}/auth/validate`);
        return response.data; // assuming the user data is in response.data
    } catch (error) {
        // console.error("Error fetching user:", error);
        return null; // return null if there’s an error
    }
}

export function useFetchUser() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function getUser() {
            const userData = await fetchUser();
            setUser(userData);
        }
        getUser();
    }, []);

    return [user, setUser];
}

