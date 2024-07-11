import React, {Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {Alert} from "react-bootstrap";
import DashboardPage from "@views/DashboardPage.jsx";
import AddAdminsPage from "@views/SuperAdminsView/AddAdminsPage.jsx";
import TopBar from "@components/TopBar.jsx";
import ManageAdminsPage from "@views/SuperAdminsView/ManageAdminsPage.jsx";
import AddCareHomesPage from "@views/SuperAdminsView/AddCareHomesPage.jsx";
import ManageCareHomesPage from "@views/SuperAdminsView/ManageCareHomesPage.jsx";
import AccessFeedbacksPage from "@views/AdminsView/AccessFeedbacksPage.jsx";
import UploadReportsPage from "@views/AdminsView/UploadReportsPage.jsx";
import AccessReportsPage from "@views/AdminsView/AccessReportsPage.jsx";
import useAuth from "@hooks/useAuth.jsx";
import NotFoundPage from "@views/ErrorPages/NotFoundPage.jsx";
import "./MainContent.scss";
import AddManagersPage from "@views/AdminsView/AddManagersPage.jsx";
import ManageManagersPage from "@views/AdminsView/ManageManagersPage.jsx";
import ManageResidentsPage from "@views/AdminsView/ManageResidentsPage.jsx";

const MainContent = () => {
    const {auth} = useAuth();
    return (
        <main>
            <TopBar/>
            <Suspense fallback={<Alert type="info">Loading...</Alert>}>
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage/>}/>
                    {auth?.isSuperAdmin && (
                        <>
                            <Route path="/admins">
                                <Route path="add" element={<AddAdminsPage/>}/>
                                <Route path="manage" element={<ManageAdminsPage/>}/>
                            </Route>
                            <Route path="/carehomes">
                                <Route path="add" element={<AddCareHomesPage/>}/>
                                <Route path="manage" element={<ManageCareHomesPage/>}/>
                            </Route>
                        </>
                    )}

                    {auth?.isAdmin && (
                        <>
                            <Route path="/feedbacks">
                                <Route path="view/*" element={<AccessFeedbacksPage/>}/>
                            </Route>
                            <Route path="/residents">
                                <Route path="manage" element={<ManageResidentsPage/>}/>
                            </Route>
                            <Route path="/managers">
                                <Route path="add" element={<AddManagersPage/>}/>
                                <Route path="manage" element={<ManageManagersPage/>}/>
                            </Route>
                            <Route path="/reports">
                                <Route path="add/*" element={<UploadReportsPage/>}/>
                                <Route path="view/*" element={<AccessReportsPage/>}/>
                            </Route>
                        </>
                    )}
                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </Suspense>
        </main>
    )
}

export default React.memo(MainContent)