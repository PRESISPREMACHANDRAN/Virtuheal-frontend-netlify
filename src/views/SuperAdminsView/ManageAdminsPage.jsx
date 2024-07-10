import {useState, useEffect} from "react";
import {Button, Modal, Form, Table, Container, Alert, Spinner} from "react-bootstrap";
import styles from "./ManageAdminsPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";

function ManageAdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const [adminForRemoval, setAdminForRemoval] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const {setTitle} = useTopBar();
    setTitle("Manage Care Home Admins");

    useEffect(() => {
        fetchAdmin();
    }, []);

    const fetchAdmin = async () => {
        try {
            const adminsData = await fetchAllAdmins();
            setAdmins(adminsData);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchAllAdmins = async (url = `/auth/users/`) => {
        setLoading(true);
        let allAdmins = [];
        try {
            const response = await axiosPrivate.get(url, {
                params: {type: "admin"},
            });
            const filteredAdmins = response?.data?.results;
            allAdmins = [...allAdmins, ...filteredAdmins];
            if (response?.data?.next) {
                await fetchAllAdmins(response?.data?.next);
            }
        } catch (error) {
            console.error("Error:", error);
        }
        finally {
            setLoading(false);
        }
        return allAdmins;
    };

    const handleShowEditModal = (admin) => {
        setSelectedAdmin(admin);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);
        try {
            await axiosPrivate.put(`/auth/users/${selectedAdmin.id}/`, {
                name: selectedAdmin.name,
                email: selectedAdmin.email,
            });
            setAdmins((prevAdmins) =>
                prevAdmins.map((admin) =>
                    admin.id === selectedAdmin.id ? selectedAdmin : admin
                )
            );
            setShowEditModal(false);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            if (adminForRemoval === null) {
                setErrorMessage("Please select an admin to delete!");
                return;
            }
            await axiosPrivate.delete(`/auth/users/${adminForRemoval}/`);
            setAdmins((prevAdmins) =>
                prevAdmins.filter((admin) => admin.id !== adminForRemoval)
            );
        } catch (error) {
            if (error.response.status === 500) {
                setErrorMessage(
                    "Cannot remove admin. Admin already has care homes assigned to him."
                );
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleConfirmRemoveModal = () => {
        if (showConfirmRemoveModal) {
            setAdminForRemoval(null);
        }
        setShowConfirmRemoveModal(!showConfirmRemoveModal);
    };

    return (
        <>
            {loading ?
                (<Container fluid className="text-center m-3 p-5 rounded-4 border">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <h2 className="m-3">Loading...</h2>
                </Container>)
                :
                <Container fluid className="m-3 p-4 border rounded-4">
                    <Table responsive hover className={styles.carehomeItem}>
                        <thead className="p-3">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {admins.map((admin, index) => (
                            <tr key={index}>
                                <td>{admin.name}</td>
                                <td>{admin.email}</td>
                                <td>
                                    <Button
                                        className={styles.fixButton}
                                        variant="success"
                                        onClick={() => handleShowEditModal(admin)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className={styles.fixButton}
                                        variant="danger"
                                        onClick={() => {
                                            setAdminForRemoval(admin.id);
                                            toggleConfirmRemoveModal();
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    {errorMessage && (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{errorMessage}</p>
                        </Alert>
                    )}

                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Admin</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleEditSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedAdmin?.name || ""}
                                        onChange={(e) =>
                                            setSelectedAdmin({...selectedAdmin, name: e.target.value})
                                        }
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={selectedAdmin?.email || ""}
                                        onChange={(e) =>
                                            setSelectedAdmin({...selectedAdmin, email: e.target.value})
                                        }
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    Save Changes
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                    <Modal
                        show={showConfirmRemoveModal}
                        onHide={toggleConfirmRemoveModal}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Warning</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to remove the assigned admin from this care
                            home?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={()=> {
                                setAdminForRemoval(null);
                                toggleConfirmRemoveModal();
                            }}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDelete}>
                                Confirm Removal
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>}
        </>
    );
}

export default ManageAdminsPage;