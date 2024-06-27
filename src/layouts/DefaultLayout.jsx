import Sidebar from "@components/Sidebar.jsx";
import MainContent from "@components/MainContent.jsx";
import {TopBarProvider} from "@contexts/TopBarContext.jsx";

function DefaultLayout() {
    return (
        <>
            <TopBarProvider>
                <Sidebar/>
                <MainContent/>
            </TopBarProvider>
        </>
    );
}

export default DefaultLayout;