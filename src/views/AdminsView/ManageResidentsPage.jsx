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
import styles from "./ManageResidentsPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";
import {NAME_REGEX} from "@utils/validations/regex.js";

function ManageResidentsPage() {
    const [associates, setAssociates] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAssociate, setSelectedAssociate] = useState(null);
    const [associateForRemoval, setAssociateForRemoval] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isValidName, setIsValidName] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const {setTitle} = useTopBar();
    setTitle("Manage residents");

    useEffect(() => {
        setLoading(true);
        fetchAssociates().finally(() => setLoading(false))
    }, []);

    useEffect(() => {
        console.log(selectedAssociate);
        if (selectedAssociate?.name) {
            setIsValidName(NAME_REGEX.test(selectedAssociate?.name));
        }
    }, [selectedAssociate]);

    const fetchAssociates = async () => {
        try {
            const associateData = await fetchAllAssociates();
            setAssociates(associateData);
        } catch (error) {
            setErrorMessage("Failed to fetch residents. Please try again later.")
        }
    };

    const fetchAllAssociates = async (url = `/associates`) => {
        let allAssociates = [];
        try {
            const response = await axiosPrivate.get(url);
            //console.log(response);
            const filteredAssociates = response?.data?.results
            allAssociates = [...filteredAssociates];

            if (response?.data?.next) {
                const nextPageAssociates = await fetchAllAssociates(response?.data?.next);
                allAssociates = [...allAssociates, ...nextPageAssociates];
            }
        } catch (error) {
            setErrorMessage("Failed to fetch residents. Please try again later.")
        }
        return allAssociates;
    };

    const handleShowEditModal = (associate) => {
        setSelectedAssociate(associate);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setEditLoading(true);
        try {
            // Replace PUT with PATCH
            await axiosPrivate.patch(selectedAssociate.url, {
                name: selectedAssociate.name,
                //date_of_birth: selectedAssociate.date_of_birth,
            });
            setAssociates((prevAssociates) =>
                prevAssociates.map((associate) =>
                    associate.id === selectedAssociate.id ? selectedAssociate : associate
                )
            );
            setSuccessMessage("Successfully updated resident details.");
        } catch (error) {
            setErrorMessage("Failed to update resident details.");
        } finally {
            setEditLoading(false);
            setShowEditModal(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        setDeleteLoading(true);
        try {
            if (associateForRemoval === null) {
                setErrorMessage("Please select a resident to delete!");
                return;
            }
            await axiosPrivate.delete(`/associates/${associateForRemoval}/`);
            setAssociates((prevAssociates) =>
                prevAssociates.filter((associate) => associate.id !== associateForRemoval)
            );
            setSuccessMessage("Successfully deleted resident details.");
        } catch (error) {
            if (error.response.status === 500) {
                setErrorMessage(
                    "Cannot remove resident. Resident has existing feedback records."
                );
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
            setAssociateForRemoval(null);
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
                {associates?.length ?
                    <Table responsive hover className={styles.carehomeItem}>
                        <thead className="p-3">
                        <tr>
                            <th>Name</th>
                            <th>Date of Birth</th>
                            <th>CareHome</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {associates.map((associate, index) => (
                            <tr key={index}>
                                <td>{associate.name}</td>
                                <td>{associate.date_of_birth}</td>
                                <td>{associate.care_home.name}</td>
                                <td>
                                    <Button
                                        className={styles.fixButton}
                                        variant="success"
                                        onClick={() => handleShowEditModal(associate)}
                                        disabled={deleteLoading}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className={styles.fixButton}
                                        variant="danger"
                                        onClick={() => {
                                            setAssociateForRemoval(associate.id);
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
                        <h2 className="p-3 text-center">No resident data has been registered.<span
                            className="material-symbols-rounded align-text-top">person_off</span></h2>
                    </Alert>
                }

                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Associate</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        type="text"
                                        value={selectedAssociate?.name || ""}
                                        onChange={(e) =>
                                            setSelectedAssociate({
                                                ...selectedAssociate,
                                                name: e.target.value,
                                            })
                                        }
                                        isValid={selectedAssociate?.name && isValidName}
                                        isInvalid={selectedAssociate?.name && !isValidName}
                                        required
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Looks good!
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a valid name.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Button
                                variant={!isValidName ? "outline-danger" : "primary"}
                                type="submit"
                                disabled={editLoading || !isValidName}
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
                        Are you sure you want to delete the resident? This action is permanent and cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            toggleConfirmRemoveModal();
                            setAssociateForRemoval(null);
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
            </Container>
        }
    </>
}

export default ManageResidentsPage;
