import styles from './TopBar.module.scss';
import useAuth from "@hooks/useAuth.jsx";
import useLogout from "@hooks/useLogout.jsx";
import {useNavigate} from "react-router-dom";
import useTopBar from "@hooks/useTopBar.jsx";

function TopBar() {

    const {auth} = useAuth();
    const logout = useLogout()
    const navigate = useNavigate();
    const {title} = useTopBar();
    const handleLogout = async () => {
        await logout();
        navigate("/login");
    }
    return (
        <div className={styles.navBox}>
            <h3 className={styles.navTitle}>{title}</h3>
            <button onClick={() => handleLogout()} className={styles.navButtonLogout}>Logout</button>
            <div className={styles.navProfileContainer}>
                <div className={styles.navTextProfile}>Logged in as<strong>{auth.isSuperAdmin ? "Super Admin" : "Admin"}
                </strong></div>
            </div>
        </div>
    );
}

export default TopBar;