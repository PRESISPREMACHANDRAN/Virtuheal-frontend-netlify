import {useLocation, Navigate, Outlet} from "react-router-dom";
import useAuth from "@hooks/useAuth.jsx";

const PrivateRoute = () => {
    const {auth} = useAuth();
    const location = useLocation();
    return auth?.email ? <Outlet/> : <Navigate to="/login" state={{from: location}} replace/>;
};

export default PrivateRoute;
