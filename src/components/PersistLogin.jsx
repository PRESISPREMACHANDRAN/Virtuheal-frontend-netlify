import {Outlet} from "react-router-dom";
import {useState, useEffect} from "react";
import useRefreshToken from '@hooks/useRefreshToken';
import useAuth from '@hooks/useAuth';
import LoadingSplashScreen from "@components/LoadingSplashScreen.jsx";
import useLocalStorage from "@hooks/useLocalStorage.jsx";

const PersistLogin = () => {
    const refresh = useRefreshToken();
    const {auth} = useAuth();
    const [persist] = useLocalStorage("persist", false)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (err) {
                console.error(err);
            } finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false);

        return () => {
            isMounted = false;
        }
    }, [])

    return (
        <>
            {!persist
                ? <Outlet/>
                : isLoading
                    ? <LoadingSplashScreen/>
                    : <Outlet/>
            }
        </>
    )
}

export default PersistLogin