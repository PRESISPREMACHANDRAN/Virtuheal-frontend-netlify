import UploadReportPage from '@components/UploadReports/UploadReportPage.jsx';
import SearchUser from "@components/Search/SearchUser.jsx";
import {Route, Routes} from "react-router-dom";
import useTopBar from "@hooks/useTopBar.jsx";

function UploadReportsPage() {
    const {setTitle} = useTopBar()
    setTitle("Upload Report");
    return (
        <div>
            <Routes>
                <Route path="/" element={<SearchUser/>}/>
                <Route path="/upload/" element={<UploadReportPage/>}/>
            </Routes>
        </div>
    );
}

export default UploadReportsPage;
