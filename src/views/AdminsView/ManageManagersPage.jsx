import {useState, useEffect} from "react";
import {
    Button,
    Modal,
    Form,
    Table,
    Container,
    Spinner,
    Toast,
    ToastContainer,
    InputGroup,
    Alert
} from "react-bootstrap";
import styles from "./ManageManagersPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";
import {EMAIL_REGEX, NAME_REGEX} from "@utils/validations/regex.js";

function ManageManagersPage() {
    const [managers, setManagers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [managerForRemoval, setManagerForRemoval] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isValidName, setIsValidName] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const {setTitle} = useTopBar();
    setTitle("Manage Care Home Managers");

    useEffect(() => {
        setLoading(true);
        fetchManager().finally(() => setLoading(false))
    }, []);

    useEffect(() => {
        if (selectedManager) {
            setIsValidName(NAME_REGEX.test(selectedManager.name));
            setIsValidEmail(EMAIL_REGEX.test(selectedManager.email));
        }
    }, [selectedManager]);

    const fetchManager = async () => {
        try {
            const managerData = await fetchAllManager();
            setManagers(managerData);
        } catch (error) {
            setErrorMessage("Failed to fetch some managers. Please try again later.")
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
            setErrorMessage("Failed to fetch managers. Please try again later.")
        }
        return allManager;
    };

    const handleShowEditModal = (manager) => {
        setSelectedManager(manager);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setEditLoading(true);
        try {
            await axiosPrivate.put(`/auth/users/${selectedManager.id}/`, {
                name: selectedManager.name,
                email: selectedManager.email,
            });
            setManagers((prevManager) =>
                prevManager.map((manager) =>
                    manager.id === selectedManager.id ? selectedManager : manager
                )
            );
            setShowEditModal(false);
            setSuccessMessage("Successfully updated manager details.");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        setDeleteLoading(true);
        try {
            if (managerForRemoval === null) {
                setErrorMessage("Please select a manager to delete!");
                return;
            }
            await axiosPrivate.delete(`/auth/users/${managerForRemoval}/`);
            setManagers((prevManager) =>
                prevManager.filter((manager) => manager.id !== managerForRemoval)
            );
            setSuccessMessage("Successfully deleted manager details.");
        } catch (error) {
            if (error.response.status === 500) {
                setErrorMessage(
                    "Cannot remove manager. Manager already has care homes assigned to him."
                );
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        } finally {
            toggleConfirmRemoveModal();
            setLoading(false);
            setDeleteLoading(false);
        }
    };

    const toggleConfirmRemoveModal = () => {
        if (showConfirmRemoveModal) {
            setManagerForRemoval(null);
        }
        setShowConfirmRemoveModal(!showConfirmRemoveModal);
    };


    return <>
        {loading ?
            (<Container fluid className="text-center rounded-4 border m-3 p-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <h2 className="m-3">Loading...</h2>
            </Container>)
            :
            <Container fluid className="m-3 border rounded-4 p-4">
                {managers?.length ?
                    <Table responsive hover className={styles.carehomeItem}>
                        <thead className="p-3">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {managers.map((manager, index) => (
                            <tr key={index}>
                                <td>{manager.name}</td>
                                <td>{manager.email}</td>
                                <td>
                                    <Button
                                        className={styles.fixButton}
                                        variant="success"
                                        onClick={() => handleShowEditModal(manager)}
                                        disabled={deleteLoading}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className={styles.fixButton}
                                        variant="danger"
                                        onClick={() => {
                                            setManagerForRemoval(manager.id);
                                            toggleConfirmRemoveModal();
                                        }}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        ) : "Delete"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table> :
                    <Alert variant="info" className="rounded-4 border shadow-sm p-3">
                        <h2 className="p-3 text-center">No Care Home manager users have been registered. <span
                            className="material-symbols-rounded align-text-top">person_off</span></h2>
                    </Alert>}

                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Manager</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        type="text"
                                        value={selectedManager?.name || ""}
                                        onChange={(e) =>
                                            setSelectedManager({
                                                ...selectedManager,
                                                name: e.target.value,
                                            })
                                        }
                                        isValid={isValidName}
                                        isInvalid={selectedManager?.name && !isValidName}
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
                                        value={selectedManager?.email || ""}
                                        onChange={(e) =>
                                            setSelectedManager({
                                                ...selectedManager,
                                                email: e.target.value,
                                            })
                                        }
                                        isValid={isValidEmail}
                                        isInvalid={selectedManager?.email && !isValidEmail}
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
                                {editLoading ? (
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                ) : "Save Changes"}
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
                        Are you sure you want to delete the manager? This action is permanent and cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            toggleConfirmRemoveModal();
                            setManagerForRemoval(null);
                        }}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Confirm Removal
                        </Button>
                    </Modal.Footer>
                </Modal>
                <ToastContainer
                    className="p-3"
                    position="bottom-end"
                    style={{zIndex: 1}}
                >
                    <Toast
                        show={errorMessage}
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
