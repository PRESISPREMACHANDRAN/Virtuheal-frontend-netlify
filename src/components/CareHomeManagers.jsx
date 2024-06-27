import {useState, useEffect} from 'react';
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import {
    Card,
    Button,
    Modal,
    ListGroup,
    Alert,
    Badge,
    Container,
    Spinner,
    Row,
    Col,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CareHomeManagers = () => {
    const [carehomes, setCarehomes] = useState([]);
    const [carehomeManagers, setCarehomeManagers] = useState({});
    const [selectedCarehome, setSelectedCarehome] = useState(null);
    const [unassignedManagers, setUnassignedManagers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [managersLoading, setManagersLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState({});
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        fetchCarehomes();
    }, []);

    const fetchCarehomes = async () => {
        try {
            setError("");
            setLoading(true);
            const response = await axiosPrivate.get('/carehomes/');
            const carehomes = response?.data?.results;

            const managerPromises = carehomes.map(carehome =>
                axiosPrivate.get(`/carehome-managers/?carehome=${carehome.id}`)
            );

            const managersResponses = await Promise.all(managerPromises);
            const carehomeManagers = {};

            for (const [index, managerResponse] of managersResponses.entries()) {
                const managerDetailsPromises = managerResponse.data.map(manager =>
                    axiosPrivate.get(manager.manager)
                );

                const managerDetailsResponses = await Promise.all(managerDetailsPromises);

                carehomeManagers[carehomes[index].id] = managerDetailsResponses.map(response => ({
                    ...managerResponse.data.find(manager => manager.manager === response.config.url),
                    managerDetails: response.data,
                }));
            }

            setCarehomes(carehomes);
            setCarehomeManagers(carehomeManagers);
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
    };

    const handleAssignManager = async (managerUrl) => {
        try {
            setError("");
            setAssigning(true);
            await axiosPrivate.post('/carehome-managers/', {
                carehome: selectedCarehome.url,
                manager: managerUrl,
            });
            fetchCarehomes()
                .catch((error) => console.log(error));
            handleHideModal();
        } catch (error) {
            setError('Failed to assign manager.');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveManager = async (managerId) => {
        try {
            setError("");
            setRemoving(prevState => ({...prevState, [managerId]: true}));
            await axiosPrivate.delete(`/carehome-managers/${managerId}/`);
            fetchCarehomes()
                .catch((error) => console.log(error));
        } catch (error) {
            setError('Failed to remove manager.');
        } finally {
            setRemoving(prevState => ({...prevState, [managerId]: false}));
        }
    };

    return (
        <>
            <h1 className="text-center mt-5 mb-4">Carehomes and Managers</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Container className="mt-5">
                {loading ? (
                    <div className="text-center">
                        <Spinner className="my-5" animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <h2>Please wait</h2><h3>Loading Care Homes...</h3>
                    </div>
                ) : (
                    <Row>
                        {carehomes.map(carehome => (
                            <Col md={6} lg={4} key={carehome.id} className="mb-4">
                                <Card className="shadow-sm">
                                    <Card.Header className="bg-primary text-white">
                                        <h2 className="m-3">{carehome.name}</h2>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Subtitle className="mt-3 mb-4 px-3 text-muted">
                                            Address: {carehome.address}
                                        </Card.Subtitle>
                                        <Card className="mb-3">
                                            <Card.Header className="bg-secondary text-white">
                                                <h3 className="m-2">Assigned Managers</h3>
                                            </Card.Header>
                                            <Card.Body>
                                                <ListGroup as="ul" variant="flush">
                                                    {carehomeManagers[carehome.id]?.length ? (
                                                        carehomeManagers[carehome.id]?.map(manager => (
                                                            <ListGroup.Item
                                                                key={manager.id}
                                                                className="d-flex justify-content-between align-items-center"
                                                                as="li"
                                                            >
                                                                <div>
                                                                    <Badge bg="secondary" className="shadow border">
                                                                        <h3 className="m-3">{manager.managerDetails.name}</h3>
                                                                    </Badge>
                                                                </div>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    className="p-3 shadow"
                                                                    onClick={() => handleRemoveManager(manager.id)}
                                                                    disabled={removing[manager.id]}
                                                                >
                                                                    {removing[manager.id] ? (
                                                                        <Spinner
                                                                            as="span"
                                                                            animation="border"
                                                                            size="sm"
                                                                            role="status"
                                                                            aria-hidden="true"
                                                                        />
                                                                    ) : (
                                                                        'Remove'
                                                                    )}
                                                                </Button>
                                                            </ListGroup.Item>
                                                        ))
                                                    ) : (
                                                        <ListGroup.Item className="text-center">
                                                            No managers assigned
                                                        </ListGroup.Item>
                                                    )}
                                                </ListGroup>
                                            </Card.Body>
                                        </Card>
                                    </Card.Body>
                                    <Card.Footer className="text-center">
                                        {carehomeManagers[carehome.id]?.length < 5 && (
                                            <Button
                                                className="p-2 m-3"
                                                variant="success"
                                                onClick={() => handleShowModal(carehome)}>
                                                Assign Manager
                                            </Button>
                                        )}
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

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
                        ) : (
                            managersLoading ? (

                                <div className="text-center m-2 p-3">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading managers...</span>
                                    </Spinner>
                                    <h2>Please wait</h2>
                                    <h3>Loading managers list...</h3>
                                </div>
                            ) : (
                                <>
                                    <h2 className="mb-3">Select a manager</h2>
                                    <ListGroup>
                                        {unassignedManagers.map(manager => (
                                            <ListGroup.Item
                                                key={manager.id}
                                                className="d-flex justify-content-between align-items-center"
                                                action
                                                onClick={() => handleAssignManager(manager.url)}
                                            >
                                                <h3>{manager.name}</h3>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </>
                            )
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleHideModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
};

export default CareHomeManagers;
