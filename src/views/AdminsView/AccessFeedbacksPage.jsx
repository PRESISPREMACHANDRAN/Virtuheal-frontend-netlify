import {Route, Routes} from "react-router-dom";
import FeedbackView from "@components/Feedbacks/FeedbackView.jsx";
import AssociateSearch from "@components/AssociateSearch.jsx";
import useTopBar from "@hooks/useTopBar.jsx";


const AccessFeedbacksPage = () => {
    const {setTitle} = useTopBar()
    setTitle("View Feedback");
    return (
        <Routes>
            <Route path="/" element={<AssociateSearch/>}/>
            <Route path="/:associateName" element={<FeedbackView/>}/>
        </Routes>
    );
};

export default AccessFeedbacksPage;
