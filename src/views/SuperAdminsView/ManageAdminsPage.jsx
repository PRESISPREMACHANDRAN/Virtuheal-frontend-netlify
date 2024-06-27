import {useState, useEffect} from "react";
import {Button, Modal, Form, Table, Container, Alert} from "react-bootstrap";
import styles from "./ManageCareHomesPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";

function ManageAdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const {setTitle} = useTopBar()
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
        let allAdmins = [];
        try {
            const response = await axiosPrivate.get(url);
            const filteredAdmins = response?.data?.results.filter(
                (admin) => admin.is_admin
            );
            allAdmins = [...filteredAdmins];

            if (response?.data?.next) {
                const nextPageAdmins = await fetchAllAdmins(response?.data?.next);
                allAdmins = [...allAdmins, ...nextPageAdmins];
            }
        } catch (error) {
            console.error("Error:", error);
        }
        return allAdmins;
    };

    const handleShowEditModal = (admin) => {
        setSelectedAdmin(admin);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError("");
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

    const handleDelete = async (adminId) => {
        setLoading(true);
        setError("");
        try {
            await axiosPrivate.delete(`/auth/users/${adminId}/`);
            setAdmins((prevAdmins) =>
                prevAdmins.filter((admin) => admin.id !== adminId)
            );
        } catch (error) {
            if (error.response.status === 500) {
                setError("Cannot remove admin. Admin already has care homes assigned to him.");
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="mx-5">
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
                                onClick={() => handleDelete(admin.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            {error && (<Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>
                    {error}
                </p>
            </Alert>)}


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
        </Container>
    );
}

export default ManageAdminsPage;
