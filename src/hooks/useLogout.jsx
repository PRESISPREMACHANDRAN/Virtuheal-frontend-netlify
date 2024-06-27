import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import useAuth from "./useAuth";

/**
 * Custom hook to handle user logout.
 *
 * @returns {Function} - A function to log out the user.
 */
const useLogout = () => {
    const { setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    /**
     * Logs out the user by clearing authentication state and making a logout request.
     */
    return async () => {
        setAuth({});
        try {
            await axiosPrivate.post('/auth/logout/', {
                withCredentials: true
            });
        } catch (err) {
            console.error(err);
        }
    };
}

export default useLogout;
