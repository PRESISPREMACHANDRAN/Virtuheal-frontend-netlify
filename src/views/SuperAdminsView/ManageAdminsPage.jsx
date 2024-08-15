import {useState, useEffect} from "react";
import {
    Button, Modal, Form, Table, Container, Spinner, Toast, ToastContainer, InputGroup, Alert
} from "react-bootstrap";
import styles from "./ManageAdminsPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";
import {EMAIL_REGEX, NAME_REGEX} from "@utils/validations/regex.js";

function ManageAdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const [adminForRemoval, setAdminForRemoval] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isValidName, setIsValidName] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const {setTitle} = useTopBar();
    setTitle("Manage Care Home Admins");

    useEffect(() => {
        fetchAdmin();
    }, []);

    useEffect(() => {
        if (selectedAdmin) {
            setIsValidName(NAME_REGEX.test(selectedAdmin.name));
            setIsValidEmail(EMAIL_REGEX.test(selectedAdmin.email));
        }
    }, [selectedAdmin]);

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
        } finally {
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
        setSuccessMessage("");
        setErrorMessage("");
        setEditLoading(true);
        try {
            await axiosPrivate.put(`/auth/users/${selectedAdmin.id}/`, {
                name: selectedAdmin.name, email: selectedAdmin.email,
            });
            setAdmins((prevAdmins) => prevAdmins.map((admin) => admin.id === selectedAdmin.id ? selectedAdmin : admin));
            setShowEditModal(false);
            setSuccessMessage("Successfully updated admin details.");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");
        setDeleteLoading(true);
        try {
            if (adminForRemoval === null) {
                setErrorMessage("Please select an admin to delete!");
                return;
            }
            await axiosPrivate.delete(`/auth/users/${adminForRemoval}/`);
            setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== adminForRemoval));
            setSuccessMessage("Successfully deleted Care Home admin.");
        } catch (error) {
            if (error.response.status === 500) {
                setErrorMessage("Cannot remove admin. Admin already has care homes assigned to him.");
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        } finally {
            setLoading(false);
            setDeleteLoading(false);
            toggleConfirmRemoveModal();
        }
    };

    const toggleConfirmRemoveModal = () => {
        if (showConfirmRemoveModal) {
            setAdminForRemoval(null);
        }
        setShowConfirmRemoveModal(!showConfirmRemoveModal);
    };

    return (<>
        {loading ? (<Container fluid className="text-center m-3 p-5 rounded-4 border">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            <h2 className="m-3">Loading...</h2>
        </Container>) : <Container fluid className="m-3 p-4 border rounded-4">
            {admins?.length ? <Table responsive hover className={styles.carehomeItem}>
                    <thead className="p-3">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {admins.map((admin, index) => (<tr key={index}>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>
                            <Button
                                className={styles.fixButton}
                                variant="success"
                                onClick={() => handleShowEditModal(admin)}
                                disabled={deleteLoading}
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
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (<Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />) : "Delete"}
                            </Button>
                        </td>
                    </tr>))}
                    </tbody>
                </Table>
                :
                <Alert variant="info" className="rounded-4 border shadow-sm p-3">
                    <h2 className="p-3 text-center">No admin users have been registered. <span
                        className="material-symbols-rounded align-text-top">person_off</span></h2>
                </Alert>}

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="text"
                                    value={selectedAdmin?.name || ""}
                                    onChange={(e) => setSelectedAdmin({
                                        ...selectedAdmin, name: e.target.value,
                                    })}
                                    isValid={isValidName}
                                    isInvalid={selectedAdmin?.name && !isValidName}
                                    required
                                />
                                <Form.Control.Feedback type="valid">
                                    Looks good!
                                </Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Name must be at least 3 characters long. (Only alphabets are allowed)
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="email"
                                    value={selectedAdmin?.email || ""}
                                    onChange={(e) => setSelectedAdmin({
                                        ...selectedAdmin, email: e.target.value,
                                    })}
                                    isValid={isValidEmail}
                                    isInvalid={selectedAdmin?.email && !isValidEmail}
                                    required
                                />
                                <Form.Control.Feedback type="valid">
                                    Looks good!
                                </Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please enter a valid email.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        <Button
                            variant={!isValidName || !isValidEmail ? "outline-danger" : "primary"}
                            type="submit"
                            disabled={editLoading || !isValidName || !isValidEmail}
                        >
                            {editLoading ? (<Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />) : "Save Changes"}
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
                    Are you sure you want to delete this admin user? This action is permanent and cannot be
                    undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setAdminForRemoval(null);
                        toggleConfirmRemoveModal();
                    }}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        {deleteLoading ? (<Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />) : "Remove"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer
                className="p-3"
                position="bottom-end"
                style={{zIndex: 1}}
            >
                <Toast
                    show={!!errorMessage}
                    bg="danger"
                    className="shadow"
                    onClose={() => setErrorMessage("")}
                >
                    <Toast.Header>
                        <h1 className="me-auto">Error!</h1>
                    </Toast.Header>
                    <Toast.Body
                        className="text-light p-3"
                    >
                        <h2>
                            {errorMessage}
                        </h2>
                    </Toast.Body>
                </Toast>

                <Toast
                    show={!!successMessage}
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
        </Container>}
    </>);
}

export default ManageAdminsPage;
