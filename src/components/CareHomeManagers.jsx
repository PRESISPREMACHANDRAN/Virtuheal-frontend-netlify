import {useState, useEffect} from 'react';
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import {
    Card, Button, Modal, ListGroup, Alert, Badge, Container, Spinner, Row, Col,
} from 'react-bootstrap';

const CareHomeManagers = () => {
    const [carehomes, setCarehomes] = useState([]);
    const [selectedCarehome, setSelectedCarehome] = useState(null);
    const [unassignedManagers, setUnassignedManagers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [managersLoading, setManagersLoading] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState({});
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        fetchCarehomeManagers();
    }, []);

    const fetchCarehomeManagers = async () => {
        try {
            setError("");
            setLoading(true);
            const allCarehomesResponse = await axiosPrivate.get('/carehomes/');
            const allCarehomesData = allCarehomesResponse?.data?.results;

            const response = await axiosPrivate.get('/carehome-managers/');
            const carehomeManagersData = response?.data;

            const carehomesData = allCarehomesData.map(carehome => {
                const managers = carehomeManagersData
                    .filter(cm => cm.carehome.id === carehome.id)
                    .map(cm => ({...cm.manager, carehomeManagerId: cm.id}));
                return {
                    ...carehome, managers
                };
            });

            setCarehomes(carehomesData);
        } catch (error) {
            setError('Failed to fetch carehomes and managers.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedManagers = async () => {
        try {
            setError("");
            setManagersLoading(true);
            const response = await axiosPrivate.get('/carehome-managers/?type=unassigned');
            setUnassignedManagers(response.data);
        } catch (error) {
            setError('Failed to fetch unassigned managers.');
        } finally {
            setManagersLoading(false);
        }
    };

    const handleShowModal = (carehome) => {
        setSelectedCarehome(carehome);
        fetchUnassignedManagers()
            .catch((error) => console.log(error));
        setShowModal(true);
    };

    const handleHideModal = () => {
        setShowModal(false);
        setSelectedCarehome(null);
        setSelectedManager(null);
    };


    const handleSelectManager = (managerId) => {
        setSelectedManager(managerId); // Update the selected manager state
    };

    const handleAssignManager = async () => {
        try {
            setError("");
            setAssigning(true);
            await axiosPrivate.post('/carehome-managers/', {
                carehome_id: selectedCarehome.id, manager_id: selectedManager,
            });
            fetchCarehomeManagers()
                .catch((error) => console.log(error));
            handleHideModal();
        } catch (error) {
            setError('Failed to assign manager.');
            console.log(error);
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveManager = async (carehomeManagerId) => {
        try {
            setError("");
            setRemoving(prevState => ({...prevState, [carehomeManagerId]: true}));
            await axiosPrivate.delete(`/carehome-managers/${carehomeManagerId}/`);
            fetchCarehomeManagers()
                .catch((error) => console.log(error));
        } catch (error) {
            setError('Failed to remove manager.');
        } finally {
            setRemoving(prevState => ({...prevState, [carehomeManagerId]: false}));
        }
    };

    return (<Container fluid className="border rounded-4 p-3">
        <h1 className="text-center mt-5 mb-4">Carehomes and Managers</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Container className="mt-5 mb-5">
            {loading ? (<div className="text-center">
                <Spinner className="my-5" animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <h2>Please wait</h2><h3>Loading Care Homes...</h3>
            </div>) : carehomes.length ? <Row>
                {carehomes.map(carehome => (<Col key={carehome.id} className="mb-4">
                    <Card className="shadow-sm rounded-3" style={{minWidth: "25vw"}}>
                        <Card.Header className="bg-primary text-white">
                            <h2 className="m-3 py-2 text-center">{carehome.name}<span
                                className="material-symbols-rounded text-align-top ms-3">home_work</span></h2>
                        </Card.Header>
                        <Card.Body>
                            <Card.Subtitle className="mt-3 mb-4 px-3 text-muted">
                                <h3>
                                    Address: {carehome.address}
                                </h3>
                            </Card.Subtitle>
                            <Card className="mb-3 shadow-sm border">
                                <Card.Header className="bg-secondary text-white">
                                    <h3 className="m-2">Assigned Managers</h3>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup as="ul" variant="flush">
                                        {carehome.managers.length ? (carehome.managers.map(manager => (
                                            <ListGroup.Item
                                                key={manager.carehomeManagerId}
                                                className="d-flex justify-content-between align-items-center"
                                                as="li"
                                            >
                                                <div className="d-flex align-items-center">
                                                                    <span
                                                                        className="material-symbols-rounded me-2">person</span>
                                                    <h3 className="m-0">{manager.name}</h3>
                                                </div>
                                                <Button
                                                    variant="outline-danger"
                                                    className="p-2 shadow"
                                                    onClick={() => handleRemoveManager(manager.carehomeManagerId)}
                                                    disabled={removing[manager.carehomeManagerId]}
                                                >
                                                    {removing[manager.carehomeManagerId] ?
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                        :
                                                        "Unassign"
                                                    }
                                                </Button>
                                            </ListGroup.Item>))) : (
                                            <ListGroup.Item className="text-center">
                                                <Alert variant="warning" className="rounded-4 border shadow-sm p-3">
                                                    <span className="material-symbols-rounded me-2">warning</span>
                                                    <h3 className="p-2 text-center">No managers assigned.</h3>
                                                </Alert>
                                            </ListGroup.Item>)}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                        <Card.Footer className="text-center">
                            {carehome.managers.length < 5 && (<Button
                                className="p-2 m-3"
                                variant="success"
                                onClick={() => handleShowModal(carehome)}
                            >
                                Assign Manager<span
                                className="material-symbols-rounded align-text-top ms-3">person_add</span>
                            </Button>)}
                        </Card.Footer>
                    </Card>
                </Col>))}
            </Row> : <Alert variant="info" className="rounded-4 border shadow-sm p-3">
                <h2 className="text-center p-3">There are no Care Homes currently assigned. <span
                    className="material-symbols-rounded align-text-top">domain_disabled</span></h2>

            </Alert>
            }

            <Modal show={showModal} onHide={handleHideModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Manager</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {assigning ? (
                        <div className="text-center m-3 p-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Assigning...</span>
                            </Spinner>
                            <h2>Assigning...</h2>
                            <h3>Please wait</h3>
                        </div>
                    ) : (managersLoading ? (
                        <div className="text-center m-2 p-3">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading managers...</span>
                            </Spinner>
                            <h2>Please wait</h2>
                            <h3>Loading managers list...</h3>
                        </div>
                    ) : (
                        unassignedManagers?.length ?
                            <>
                                <h2 className="mb-3">Select a manager</h2>
                                <ListGroup>
                                    {unassignedManagers.map(manager => (
                                        <ListGroup.Item
                                            key={manager.id}
                                            className={`d-flex justify-content-between align-items-center ${selectedManager === manager.id ? 'bg-dark-subtle border shadow-sm' : ''}`} // Apply class if selected
                                            action
                                            onClick={() => handleSelectManager(manager.id)}
                                        >
                                            <span className="material-symbols-rounded me-2">person</span>
                                            {selectedManager === manager.id &&
                                                <Badge className="shadow-sm border p-2">
                                                    Selected
                                                </Badge>
                                            }
                                            <h3>{manager.name}</h3>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </>
                            : <Container>
                                <Alert variant="info" className="rounded-4 border shadow-sm p-3">
                                    <span className="material-symbols-rounded me-2">person_off</span>
                                    <h3 className="p-2 text-center">No unassigned managers found.</h3>
                                </Alert>
                            </Container>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHideModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAssignManager} disabled={!selectedManager}>
                        Assign Manager
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    </Container>);
};

export default CareHomeManagers;
