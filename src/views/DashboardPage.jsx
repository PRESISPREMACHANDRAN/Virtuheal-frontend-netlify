import useAuth from "@hooks/useAuth.jsx";
import {Container} from "react-bootstrap";
import CareHomeManagers from "@components/CareHomeManagers.jsx";
import useTopBar from "@hooks/useTopBar.jsx";
import {useState} from "react";
import {axiosPrivate} from "@/api/axios.js";

function DashboardPage() {
    const {auth} = useAuth();
    const {setTitle} = useTopBar()
    const [numAssociates, setNumAssociates] = useState(0);
    const [numFeedbacks, setNumFeedbacks] = useState(0)
    const [numAdmins, setNumAdmins] = useState(0);
    const [numCarehomes, setNumCarehomes] = useState(0)

    const getNumAssociates = async () => {
        try {
            const response = await axiosPrivate("/associates/")
            setNumAssociates(response?.data?.count);
       } catch (error) {
            console.log("Error");
        }
    }
    if (auth?.isAdmin) {
        getNumAssociates()
    }

    const getNumFeedbacks = async () => {
        try {
            const response = await axiosPrivate("/feedbacks/")
            setNumFeedbacks(response?.data?.count);
        } catch (error) {
            console.log("Error");
        }
    }
    if (auth?.isAdmin) {
        getNumFeedbacks()
    }

    const getNumAdmins = async () => {
        try {
            const response = await axiosPrivate("/auth/users/",
                {
                    params : {
                        type: "admin"
                    }
                }
            )
            setNumAdmins(response?.data?.count);
        } catch (error) {
            console.log("Error");
        }
    }
    if (auth?.isSuperAdmin) {
        getNumAdmins()
    }

    const getNumCarehomes = async () => {
        try {
            const response = await axiosPrivate("/carehomes/")
            setNumCarehomes(response?.data?.count);
        } catch (error) {
            console.log("Error");
        }
    }
    if (auth?.isSuperAdmin) {
        getNumCarehomes()
    }
    setTitle("Dashboard");
    return (
        <>
            <Container fluid className="mx-3">
                <h1 className="mt-5 mb-3 mx-4">Welcome back {auth.name}</h1>
                {auth.isAdmin && (
                    <>
                        <div className="insights">
                            <div className="total-associates">
                                <span className="material-symbols-rounded">person</span>
                                <div className="middle">
                                    <div className="left">
                                        <h3>Total associates</h3>
                                        <h1>{numAssociates}</h1>
                                    </div>
                                    <div className="progress"></div>
                                </div>
                                <small className="text-muted">Last 24 hours</small>
                            </div>
                            <div className="total-feedbacks">
                                <span className="material-symbols-rounded">reviews</span>
                                <div className="middle">
                                    <div className="left">
                                        <h3>Total feedbacks</h3>
                                        <h1>{numFeedbacks}</h1>
                                    </div>
                                    <div className="progress"></div>
                                </div>
                                <small className="text-muted">Last 24 hours</small>
                            </div>
                        </div>
                        <CareHomeManagers/>
                    </>
                )}
                {auth.isSuperAdmin && (
                    <div className="insights">
                        <div className="total-associates">
                            <span className="material-symbols-rounded">person</span>
                            <div className="middle">
                                <div className="left">
                                    <h3>Total admins</h3>
                                    <h1>{numAdmins}</h1>
                                </div>
                                <div className="progress"></div>
                            </div>
                            <small className="text-muted">Last 24 hours</small>
                        </div>
                        <div className="total-feedbacks">
                            <span className="material-symbols-rounded">holiday_village</span>
                            <div className="middle">
                                <div className="left">
                                    <h3>Total care homes</h3>
                                    <h1>{numCarehomes}</h1>
                                </div>
                                <div className="progress"></div>
                            </div>
                            <small className="text-muted">Last 24 hours</small>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
}

export default DashboardPage;