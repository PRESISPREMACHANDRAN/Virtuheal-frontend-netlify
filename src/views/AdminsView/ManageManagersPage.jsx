import {useState, useEffect} from "react";
import {Button, Modal, Form, Table, Container, Spinner, Toast, ToastContainer} from "react-bootstrap";
import styles from "./ManageManagersPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";

function ManageManagersPage() {
    const [manager, setManager] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const {setTitle} = useTopBar();
    setTitle("Manage Care Home Managers");

    useEffect(() => {
        setLoading(true);
        fetchManager().finally(() => setLoading(false))
    }, []);

    const fetchManager = async () => {
        try {
            const managerData = await fetchAllManager();
            setManager(managerData);
        } catch (error) {
            setError("Failed to fetch some managers. Please try again later.")
        }
    };

    const fetchAllManager = async (url = `/auth/users/`) => {
        let allManager = [];
        try {
            const response = await axiosPrivate.get(url, {
                params: {type: "manager"},
            });
            const filteredManager = response?.data?.results
            allManager = [...filteredManager];

            if (response?.data?.next) {
                const nextPageManager = await fetchAllManager(response?.data?.next);
                allManager = [...allManager, ...nextPageManager];
            }
        } catch (error) {
            setError("Failed to fetch managers. Please try again later.")
        }
        return allManager;
    };

    const handleShowEditModal = (manager) => {
        setSelectedManager(manager);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);
        try {
            await axiosPrivate.put(`/auth/users/${selectedManager.id}/`, {
                name: selectedManager.name,
                email: selectedManager.email,
            });
            setManager((prevManager) =>
                prevManager.map((Manager) =>
                    Manager.id === selectedManager.id ? selectedManager : Manager
                )
            );
            setShowEditModal(false);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
            setSuccessMessage("Successfully updated manager details.");
        }
    };

    const handleDelete = async (managerId) => {
        setLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            await axiosPrivate.delete(`/auth/users/${managerId}/`);
            setManager((prevManager) =>
                prevManager.filter((manager) => manager.id !== managerId)
            );
            setSuccessMessage("Successfully deleted manager details.");
        } catch (error) {
            if (error.response.status === 500) {
                setError(
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

    return <>
        {loading ?
            (<Container fluid className="text-center m-5 p-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <h2 className="m-3">Loading...</h2>
            </Container>)
            :
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
                    {manager.map((manager, index) => (
                        <tr key={index}>
                            <td>{manager.name}</td>
                            <td>{manager.email}</td>
                            <td>
                                <Button
                                    className={styles.fixButton}
                                    variant="success"
                                    onClick={() => handleShowEditModal(manager)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    className={styles.fixButton}
                                    variant="danger"
                                    onClick={() => handleDelete(manager.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>

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
                                    value={selectedManager?.name || ""}
                                    onChange={(e) =>
                                        setSelectedManager({
                                            ...selectedManager,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={selectedManager?.email || ""}
                                    onChange={(e) =>
                                        setSelectedAdmin({
                                            ...selectedManager,
                                            email: e.target.value,
                                        })
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
                <ToastContainer
                    className="p-3"
                    position="bottom-end"
                    style={{zIndex: 1}}
                >
                    <Toast
                        show={error}
                        bg="danger"
                        className="shadow"
                        onClose={() => setError("")}
                    >
                        <Toast.Header>
                            <h1 className="me-auto">Error!</h1>
                        </Toast.Header>
                        <Toast.Body
                            className="text-light p-3"
                        >
                            <h2>
                                {error}
                            </h2>
                        </Toast.Body>
                    </Toast>

                    <Toast
                        show={successMessage}
                        bg="primary"
                        className="shadow"
                        onClose={() => setSuccessMessage("")}
                    >
                        <Toast.Header>
                            <h1 className="me-auto">Success!</h1>
                        </Toast.Header>
                        <Toast.Body
                            className="text-light p-3"
                        >
                            <h2>
                                {successMessage}
                            </h2>
                        </Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        }
    </>
}

export default ManageManagersPage;