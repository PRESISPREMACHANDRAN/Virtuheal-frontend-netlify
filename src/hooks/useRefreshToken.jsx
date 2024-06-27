import axios from '@/api/axios';
import useAuth from './useAuth';

/**
 * Custom hook to refresh the user's access token.
 *
 * @returns {Function} - A function to refresh the access token.
 */
const useRefreshToken = () => {
    const { auth, setAuth } = useAuth();

    /**
     * Retrieves user information using the provided access token.
     *
     * @param {string} accessToken - The access token used for authentication.
     * @returns {Promise<object>} - An object containing user information.
     */
    const getUserInfo = async (accessToken) => {
        if (!accessToken) {
            console.error('Access token not found.');
        }
        try {
            const response = await axios.get('/auth/user/', {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return {
                accessToken,
                name: response?.data?.name,
                email: response?.data?.email,
                isSuperAdmin: response?.data?.is_superadmin,
                isAdmin: response?.data?.is_admin,
                isManager: response?.data?.is_manager
            };
        } catch (error) {
            if (!error?.response) {
                console.log('No Server Response!');
            } else if (error.response?.status === 401) {
                console.log('Unauthorised');
            } else {
                console.log('Getting user info failed!');
            }
        }
    };

    /**
     * Refreshes the access token and updates the authentication state.
     *
     * @returns {Promise<string>} - The new access token.
     */
    return async () => {
        const response = await axios.post('/auth/token/refresh/', {}, {
            withCredentials: true
        });
        setAuth(prev => {
            return { ...prev, accessToken: response?.data?.access };
        });
        if (!auth?.name) {
            await setAuth(await getUserInfo(response?.data?.access));
        }
        return response.data.access;
    };
};

export default useRefreshToken;
