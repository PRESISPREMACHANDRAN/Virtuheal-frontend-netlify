import {useState, useEffect} from "react";
import {
    Button,
    Modal,
    Table,
    Form,
    Container,
    Spinner,
    ListGroup,
    Toast,
    ToastContainer,
    ButtonGroup, Badge, Alert
} from "react-bootstrap";
import styles from "./ManageCareHomesPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";

function ManageCareHomesPage() {
    const [careHomes, setCareHomes] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [adminNames, setAdminNames] = useState({});
    const [selectedCareHomeUrl, setSelectedCareHomeUrl] = useState(null);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [selectedCareHome, setSelectedCareHome] = useState(null);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [loadingAssignableAdmins, setLoadingAssignableAdmins] = useState(false);
    const [assigningAdmin, setAssigningAdmin] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const [showConfirmUnassignModal, setShowConfirmUnassignModal] = useState(false);
    const [showConfirmDeletionModal, setShowConfirmDeletionModal] = useState(false);
    const [careHomeForRemoval, setCareHomeForRemoval] = useState(null);
    let allAdmins = [];
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const {setTitle} = useTopBar()
    const [isLoading, setIsLoading] = useState(false);
    setTitle("Manage Care Home Details");

    useEffect(() => {
        getCareHomes();
    }, []);

    const getCareHomes = async () => {
        try {
            const careHomes = await fetchAllCareHomes();
            setCareHomes(careHomes);
            careHomes.forEach((careHome) => {
                if (careHome.admin) {
                    fetchAdminName(careHome.admin);
                }
            });
        } catch (error) {
            setErrorMessage("An error occurred while getting some Care Home details. Please try again later.");
        }
    };

    const fetchAllCareHomes = async (
        url = `/carehomes/`,
        accumulatedResults = []
    ) => {
        try {
            setIsLoading(true);
            const response = await axiosPrivate.get(url);
            const results = accumulatedResults.concat(response?.data?.results);
            if (response?.data?.next) {
                return fetchAllCareHomes(response?.data?.next, results);
            }
            return results.flat();
        } catch (error) {
            setErrorMessage("An error occurred while getting Care Home details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdminName = async (url) => {
        try {
            const response = await axiosPrivate.get(url);
            setAdminNames((prevNames) => ({
                ...prevNames,
                [url]: response?.data?.name,
            }));
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchAllAdmins = async () => {

        setAdmins([]);
        try {
            const response = await axiosPrivate.get("/auth/users/", {
                params: {
                    type: "admin"
                }
            });
            const filteredAdmins = response?.data?.results;
            allAdmins = [...allAdmins, ...filteredAdmins];
            setAdmins(allAdmins);
            if (response?.data?.next) {
                await fetchAllAdmins(response?.data?.next);
            }
        } catch (error) {
            setErrorMessage("An error occurred while getting admin details. Please try again later.");
        }
    };

    const handleShowAssignModal = (careHomeUrl) => {
        setSelectedCareHomeUrl(careHomeUrl);
        setLoadingAssignableAdmins(true);
        fetchAllAdmins().finally(() => setLoadingAssignableAdmins(false));
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setSelectedAdmin(null);
    };

    const handleShowEditModal = (careHome) => {
        setSelectedCareHome(careHome);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const handleSelectAdmin = (admin) => {
        setSelectedAdmin(admin);
    };

    const handleDeleteCareHome = async () => {
        setErrorMessage("");
        setSuccessMessage("");
        try {
            if (careHomeForRemoval === null) {
                setErrorMessage("Please select a CareHome for removal.");
                return;
            }
            await axiosPrivate.delete(careHomeForRemoval).then(() => setSuccessMessage("Successfully deleted Care Home."))
            setCareHomes((prevElements) =>
                prevElements.filter((elm) => elm.url !== careHomeForRemoval)
            );
            await getCareHomes();
        } catch (error) {
            setErrorMessage("Cannot remove Care Home. Care Home either has a manager assigned or already has residents.");
        } finally {
            toggleConfirmDeletionModal();
        }
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        const updatedCareHome = {
            name: event.target.name.value,
            address: event.target.address.value,
        };

        try {
            await axiosPrivate.put(
                selectedCareHome.url,
                JSON.stringify(updatedCareHome)
            ).then(() => setSuccessMessage("Successfully updated Care Home details."))
            setCareHomes((prevElements) =>
                prevElements.map((elm) =>
                    elm.url === selectedCareHome.url
                        ? {
                            ...elm,
                            name: updatedCareHome.name,
                            address: updatedCareHome.address,
                        }
                        : elm
                )
            );
            handleCloseEditModal();
        } catch (error) {
            setErrorMessage("Failed to update Care Home details. Please try again later.");
        }
    };

    const assignAdmin = async (careHomeUrl, admin) => {
        setAssigningAdmin(true);
        setErrorMessage("");
        setSuccessMessage("")
        try {
            const careHome = await axiosPrivate.get(careHomeUrl);
            await axiosPrivate.put(
                careHomeUrl,
                JSON.stringify({
                    name: careHome?.data?.name,
                    address: careHome?.data?.address,
                    admin,
                })
            );
            await getCareHomes();
            setSuccessMessage("Successfully assigned Care Home admin.");
            handleCloseAssignModal();
        } catch (error) {
            setErrorMessage("Failed to assign admin. Please try again later.");
        } finally {
            setAssigningAdmin(false);
        }
    };

    const toggleConfirmUnassignModal = () => {
        setShowConfirmUnassignModal(!showConfirmUnassignModal);
    };

    const toggleConfirmDeletionModal = () => {
        if (showConfirmDeletionModal) {
            setCareHomeForRemoval(null);
        }
        setShowConfirmDeletionModal(!showConfirmDeletionModal);
    };

    const handleUnassignAdmin = async () => {
        if (!selectedCareHomeUrl) {
            setErrorMessage("Please select an admin for removal.");
            return;
        }
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const careHome = await axiosPrivate.get(selectedCareHomeUrl);
            await axiosPrivate.put(
                selectedCareHomeUrl,
                JSON.stringify({
                    name: careHome?.data?.name,
                    address: careHome?.data?.address,
                    admin: null,
                })
            );
            await getCareHomes();
            setSuccessMessage("Successfully unassigned Care Home admin.");
        } catch (error) {
            setErrorMessage("Failed to assign admin. Please try again later.");
        } finally {
            toggleConfirmUnassignModal();
        }
    };

    return <>
        {
            isLoading ?
                (<Container fluid className="text-center m-3 p-5 border rounded-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <h2 className="m-3">Loading...</h2>
                </Container>)
                :
                <Container fluid className="m-3 p-4 border rounded-4">
                    {careHomes?.length ?
                        <Table responsive hover
                               className="shadow"
                        >
                            <thead>
                            <tr>
                                <th className={styles.fixedWidthColumn}>Name</th>
                                <th className={styles.fixedWidthColumn}>Code</th>
                                <th className={styles.fixedWidthColumn}>Address</th>
                                <th className={styles.fixedWidthColumn}>Admin</th>
                                <th className={styles.fixedWidthColumn}>Action</th>
                            </tr>
                            </thead>
                            <tbody
                                className="rounded-4 border"
                            >
                            {careHomes.map((result) => (
                                <tr key={result.url}>
                                    <td className={styles.fixedWidthColumn}>{result.name}</td>
                                    <td className={styles.fixedWidthColumn}>{result.code}</td>
                                    <td className={styles.fixedWidthColumn}>{result.address}</td>
                                    <td>
                                        {result.admin ?
                                            (loadingAdmins ?
                                                    <Spinner animation="border" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </Spinner>
                                                    :
                                                    <ButtonGroup>
                                                        <Button variant="outline-light"
                                                                className="px-3 text-black shadow">{adminNames[result.admin]}</Button>
                                                        <Button
                                                            variant="danger"
                                                            className="shadow"
                                                            onClick={() => {
                                                                setSelectedCareHomeUrl(result.url);
                                                                toggleConfirmUnassignModal();
                                                            }}
                                                        >
                                                            <span className="material-symbols-rounded">delete</span>
                                                        </Button>
                                                    </ButtonGroup>
                                            ) : (
                                                <Button
                                                    onClick={() => handleShowAssignModal(result.url)}
                                                >
                                                    Assign Admin
                                                </Button>
                                            )}
                                    </td>
                                    <td className={styles.fixedWidthColumn}>
                                        <Button
                                            className="shadow p-2"
                                            variant="success"
                                            onClick={() => handleShowEditModal(result)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className="shadow mx-3 p-2"
                                            variant="danger"
                                            onClick={() => {
                                                setCareHomeForRemoval(result.url);
                                                toggleConfirmDeletionModal();
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table> :
                        <Alert variant="info" className="rounded-4 border shadow-sm p-3">
                            <h2 className="p-3 text-center">No Care Home data have been registered. <span
                                className="material-symbols-rounded align-text-top">domain_disabled</span></h2>
                        </Alert>
                    }

                    <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Select an Admin</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {loadingAssignableAdmins ? (
                                <div className="text-center">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : admins.length ? (
                                <ListGroup>
                                    {admins.map((admin) => (
                                        <ListGroup.Item
                                            key={admin.id}
                                            className={`d-flex justify-content-between align-items-center ${selectedAdmin?.id === admin.id ? 'bg-dark-subtle border shadow-sm' : ''}`} // Apply class if selected
                                            action
                                        >
                                            <span className="material-symbols-rounded me-2">person</span>
                                            {selectedAdmin?.id === admin.id &&
                                                <Badge className="shadow-sm border p-2">
                                                    Selected
                                                </Badge>
                                            }
                                            <h3>{admin.name}</h3>
                                            <Button
                                                variant="primary"
                                                onClick={() => handleSelectAdmin(admin)}
                                            >
                                                Select
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Container>
                                    <Alert variant="info" className="rounded-4 border shadow-sm p-3">
                                        <span className="material-symbols-rounded me-2">person_off</span>
                                        <h3 className="p-2 text-center">Looks like there are no assignable admins.</h3>
                                    </Alert>
                                </Container>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseAssignModal}>
                                Close
                            </Button>
                            {selectedAdmin && (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        assignAdmin(selectedCareHomeUrl, selectedAdmin.url)
                                    }
                                    disabled={assigningAdmin}
                                >
                                    {assigningAdmin ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="mx-2"
                                            />{" "}
                                            Assigning...
                                        </>
                                    ) : (
                                        "Assign"
                                    )}
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Care Home</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedCareHome ? (
                                <Form onSubmit={handleEditSubmit}>
                                    <Form.Group controlId="name">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedCareHome.name}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="code">
                                        <Form.Label>Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedCareHome.code}
                                            disabled
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="address">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedCareHome.address}
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Save changes
                                    </Button>
                                </Form>
                            ) : (
                                <div className="text-center">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseEditModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal
                        show={showConfirmUnassignModal}
                        onHide={toggleConfirmUnassignModal}
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
                            <Button variant="secondary" onClick={toggleConfirmUnassignModal}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleUnassignAdmin}>
                                Confirm Removal
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal
                        show={showConfirmDeletionModal}
                        onHide={toggleConfirmDeletionModal}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Warning</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete the carehome? This action is permanent and cannot be undone.
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setCareHomeForRemoval(null);
                                toggleConfirmDeletionModal();
                            }}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDeleteCareHome}>
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

export default ManageCareHomesPage;