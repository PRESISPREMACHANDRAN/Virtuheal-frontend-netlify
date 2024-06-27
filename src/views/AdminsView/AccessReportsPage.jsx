import AssociateSearch from '@components/AssociateSearch';
import {Route, Routes} from 'react-router-dom';
import AccessReportsView from "@components/AccessReports/AccessReportsView.jsx";
import useTopBar from "@hooks/useTopBar.jsx";

const AccessReportsPage = () => {
    const {setTitle} = useTopBar()
    setTitle("View Activity Reports");
    return (
        <Routes>
            <Route path="/" element={<AssociateSearch/>}/>
            <Route path="/:associateName" element={<AccessReportsView/>}/>
        </Routes>
    );
};

export default AccessReportsPage;
