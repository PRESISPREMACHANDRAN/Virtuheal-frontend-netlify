import {useEffect, useState} from 'react';
import {Alert, Button, Card, CardGroup, Container, Form, FormControl, ListGroup, Spinner} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import {useQuery} from '@tanstack/react-query';

const AssociateSearch = () => {
    const [search, setSearch] = useState('');
    const [associates, setAssociates] = useState([]);
    const [filteredAssociates, setFilteredAssociates] = useState([]);
    const [selectedAssociate, setSelectedAssociate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const fetchAssociates = async () => {
        let allResults = [];
        let nextUrl = "/associates/";
        try {
            while (nextUrl) {
                const {data} = await axiosPrivate.get(nextUrl);
                nextUrl = data.next;
                allResults = [...allResults, ...data.results];
            }
        } catch (error) {
            console.log(error);
        }
        return allResults;
    };

    const associateQuery = useQuery({
        queryKey: ["associates"], queryFn: fetchAssociates, enabled: false
    });

    useEffect(() => {
        setIsLoading(true);
        associateQuery.refetch()
            .then((result) => {
                setAssociates(result.data || []);
            })
            .catch((error) => console.log(error))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        setFilteredAssociates(associates.filter(associate => associate.name.toLowerCase().includes(search.toLowerCase())));
    }, [search, associates]);

    const handleSelect = (associate) => {
        setSelectedAssociate(associate);
        onselect(associate);
        navigate(`/reports/${associate.name}`);
    };

    const handleClearSelection = () => {
        setSelectedAssociate(null);
    };

    const handleProceed = () => {
        if (selectedAssociate) {
            const basePath = location.pathname.startsWith('/reports') ? '/reports' : '/feedbacks';
            const action = location.pathname.includes('/add') ? 'add' : 'view';
            navigate(`${basePath}/${action}/${selectedAssociate.name}`, {
                state: {
                    associateId: selectedAssociate.id, associateName: selectedAssociate.name
                }
            });
        } else {
            alert('Please select an associate.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (<Container fluid className="mx-3 p-5 border rounded-4 text-center">
        <h1 className="mt-3 mb-5">Choose a Resident</h1>
        <Form className="my-5 mb-3" onSubmit={handleSubmit}>
            <FormControl
                type="text"
                placeholder="Search"
                value={search}
                onChange={handleSearch}
                className="mr-sm-2 mx-3"
            />
        </Form>
        <section className="m-5 p-2">
            {isLoading ?
                (<Container fluid className="text-center m-5 p-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <h2 className="m-3">Loading...</h2>
                </Container>)
                :
                associates?.length ?
                    (selectedAssociate ?
                        (<>
                            <Card className="mb-3">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div className="fw-bold">
                                        {selectedAssociate.name}
                                    </div>
                                    <Button variant="danger" onClick={handleClearSelection}>Clear Selection</Button>
                                </Card.Body>
                            </Card>
                            <div className="text-center mt-3">
                                <Button variant="primary" onClick={handleProceed}>Continue</Button>
                            </div>
                        </>)
                        :
                        (<ListGroup
                            as={CardGroup}
                            variant="flush"
                        >
                            {filteredAssociates.map(associate => (<ListGroup.Item
                                className="d-flex justify-content-between align-items-start"
                                as={Card}
                                action
                                key={associate.id}
                                onClick={() => handleSelect(associate)}
                            >
                                <Card.Body className="fw-bold">
                                    <Container
                                        className="text-center align-bottom"
                                    >
                                        <span className="material-symbols-rounded">person</span>

                                        <h3 className="mx-3 pt-2">{associate.name}</h3>
                                    </Container>
                                </Card.Body>
                            </ListGroup.Item>))}
                        </ListGroup>))
                    :
                    (
                        <Alert variant="info" className="rounded-4 border shadow-sm p-3 mt-5">
                            <h2 className="p-3 text-center">No residents found. <span
                                className="material-symbols-rounded align-text-top">person_off</span></h2>
                        </Alert>
                    )}
            {associateQuery.isError && (
                <Alert variant="danger" className="mb-3">{associateQuery.error.message}</Alert>)}
        </section>
    </Container>);
};

export default AssociateSearch;
