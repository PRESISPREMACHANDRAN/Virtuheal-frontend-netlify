import {useState, useEffect} from "react";
import {
    Button,
    Modal,
    Table,
    Form,
    Container,
    Spinner,
    ListGroup,
    Alert,
    Toast,
    ToastContainer,
    ButtonGroup
} from "react-bootstrap";
import styles from "./ManageCareHomesPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";

function ManageCareHomesPage() {
    const [careHomeElements, setCareHomeElements] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [adminNames, setAdminNames] = useState({});
    const [selectedCareHomeUrl, setSelectedCareHomeUrl] = useState(null);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [selectedCareHome, setSelectedCareHome] = useState(null);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [assigningAdmin, setAssigningAdmin] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    let allAdmins = [];
    const [error, setError] = useState("");
    const {setTitle} = useTopBar()
    setTitle("Manage Care Home Details");

    useEffect(() => {
        getCareHomes();
    }, []);

    const getCareHomes = async () => {
        try {
            const careHomes = await fetchAllCareHomes();
            setCareHomeElements(careHomes);
            careHomes.forEach((careHome) => {
                if (careHome.admin) {
                    fetchAdminName(careHome.admin);
                }
            });
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchAllCareHomes = async (
        url = `/carehomes/`,
        accumulatedResults = []
    ) => {
        try {
            const response = await axiosPrivate.get(url);
            const results = accumulatedResults.concat(response?.data?.results);
            if (response?.data?.next) {
                return fetchAllCareHomes(response?.data?.next, results);
            }
            return results.flat();
        } catch (error) {
            console.error("Error:", error);
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

    const fetchAllAdmins = async (url = `/auth/users/`) => {
        setLoadingAdmins(true);
        setAdmins([]);
        try {
            const response = await axiosPrivate.get(url);
            const filteredAdmins = response?.data?.results.filter(
                (admin) => admin.is_admin
            );
            allAdmins = [...allAdmins, ...filteredAdmins];
            setAdmins(allAdmins);
            if (response?.data?.next) {
                fetchAllAdmins(response?.data?.next);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingAdmins(false);
            console.log(admins)
        }
    };

    const handleShowAssignModal = (careHomeUrl) => {
        setSelectedCareHomeUrl(careHomeUrl);
        fetchAllAdmins();
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
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

    const handleDelete = async (careHomeUrl) => {
        try {
            await axiosPrivate.delete(careHomeUrl);
            setCareHomeElements((prevElements) =>
                prevElements.filter((elm) => elm.url !== careHomeUrl)
            );
            getCareHomes();
        } catch (error) {
            if (error.response.status === 500) {
                setError("Cannot remove Care Home. Care Home already has residents.");
            }
            console.error("Error:", error);
        }
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        const updatedCareHome = {
            name: event.target.name.value,
            address: event.target.address.value,
        };

        try {
            await axiosPrivate.put(
                selectedCareHome.url,
                JSON.stringify(updatedCareHome)
            );
            setCareHomeElements((prevElements) =>
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
            console.error("Error:", error);
        }
    };

    const assignAdmin = async (careHomeUrl, admin) => {
        setAssigningAdmin(true);
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
            getCareHomes();
            handleCloseAssignModal();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setAssigningAdmin(false);
        }
    };

    const toggleConfirmRemoveModal = () => {
        setShowConfirmRemoveModal(!showConfirmRemoveModal);
    };

    const handleremove = async () => {
        if (!selectedCareHomeUrl) return;
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
            getCareHomes();
            toggleConfirmRemoveModal();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <Container fluid className="mx-5">
            <Table responsive hover>
                <thead>
                <tr>
                    <th className={styles.fixedWidthColumn}>Name</th>
                    <th className={styles.fixedWidthColumn}>Code</th>
                    <th className={styles.fixedWidthColumn}>Address</th>
                    <th className={styles.fixedWidthColumn}>Admin</th>
                    <th className={styles.fixedWidthColumn}>Action</th>
                </tr>
                </thead>
                <tbody>
                {careHomeElements.map((result) => (
                    <tr key={result.url}>
                        <td className={styles.fixedWidthColumn}>{result.name}</td>
                        <td className={styles.fixedWidthColumn}>{result.code}</td>
                        <td className={styles.fixedWidthColumn}>{result.address}</td>
                        <td>
                            {result.admin ? (
                                <ButtonGroup>
                                    <Button variant="outline-light" className="px-3 text-black shadow">{adminNames[result.admin]}</Button>
                                    <Button
                                        variant="danger"
                                        className="shadow"
                                        onClick={() => {
                                            setSelectedCareHomeUrl(result.url);
                                            toggleConfirmRemoveModal();
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
                                onClick={() => handleDelete(result.url)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select an Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingAdmins ? (
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
                                    className="d-flex justify-content-between align-items-center"
                                >
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
                        <p>No admins available</p>
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
                    <Button variant="secondary" onClick={toggleConfirmRemoveModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleremove}>
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
            </ToastContainer>
        </Container>
    );
}

export default ManageCareHomesPage;
