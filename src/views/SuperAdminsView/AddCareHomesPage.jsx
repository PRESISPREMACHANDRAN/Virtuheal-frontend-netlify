import {Alert, Button, Container, Form, Row, Col, InputGroup, Spinner} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";
import {NAME_REGEX} from "@utils/validations/regex.js";

const STREET_REGEX = /^[A-Za-z0-9\s,.'-]{3,}$/;
const CITY_REGEX = /^[A-Za-z\s]{3,}$/;
const STATE_REGEX = /^[A-Za-z\s]{2,}$/;
const ZIP_REGEX = /^\d{5,}(-\d{4})?$/

function AddCareHomesPage() {
    const {setTitle} = useTopBar();
    setTitle("New Care Home Details");

    const nameRef = useRef("");

    const [name, setName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");

    const [isValidName, setIsValidName] = useState(false);
    const [isValidStreet, setIsValidStreet] = useState(false);
    const [isValidCity, setIsValidCity] = useState(false);
    const [isValidState, setIsValidState] = useState(false);
    const [isValidZip, setIsValidZip] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        nameRef.current.focus();
    }, []);

    useEffect(() => {
        setIsValidName(NAME_REGEX.test(name));
    }, [name])

    useEffect(() => {
        setIsValidStreet(STREET_REGEX.test(street));
    }, [street]);

    useEffect(() => {
        setIsValidCity(CITY_REGEX.test(city));
    }, [city]);

    useEffect(() => {
        setIsValidState(STATE_REGEX.test(state));
    }, [state]);

    useEffect(() => {
        setIsValidZip(ZIP_REGEX.test(zipCode));
    }, [zipCode]);

    useEffect(() => {
        setErrorMessage("");
    }, [name, street, city, state, zipCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const address = `${street}, ${city}, ${state}, ${zipCode}`;
            const response = await axiosPrivate.post(`/carehomes/`, JSON.stringify({
                name,
                address,
            }));
            setName("");
            setStreet("");
            setCity("");
            setState("");
            setZipCode("");
            setSuccessMessage(`Care Home details have been successfully added. The ID is ${response?.data?.code}`);
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            if (!error?.response) {
                setErrorMessage("No server response. Are you connected to the internet?");
            } else if (error.response?.status === 400) {
                if (error.response?.data[0] === "A care home with the same name and address already exists.") {
                    setErrorMessage("A Care Home with the given details already exists. Try again with different Care Home details.");
                    setName("");
                    setStreet("");
                    setCity("");
                    setState("");
                    setZipCode("");
                    setTimeout(() => setErrorMessage(""), 5000);
                } else {
                    setErrorMessage("A Care Home with the given details cannot be added. Try again with different Care Home details.");
                }
            } else {
                setErrorMessage("An error occurred while adding Care Home. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="m-3 border rounded-4 p-5">
            <Form noValidate onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group className="position-relative">
                        <Form.Label>Name</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                autoComplete="off"
                                ref={nameRef}
                                placeholder="Enter Care Home name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isValid={isValidName}
                                isInvalid={name && !isValidName}
                                required
                            />
                            <Form.Control.Feedback type="valid">
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                Name must be atleast 3 characters long. (Only alphabets are allowed)
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} className="position-relative">
                        <Form.Label>Street</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                placeholder="Enter street"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                isValid={isValidStreet}
                                isInvalid={street && !isValidStreet}
                                required
                            />
                            <Form.Control.Feedback type="valid">
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                Street must be at least 3 characters long.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} className="position-relative">
                        <Form.Label>City</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                placeholder="Enter city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                isValid={isValidCity}
                                isInvalid={city && !isValidCity}
                                required
                            />
                            <Form.Control.Feedback type="valid">
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                City must be at least 3 characters long.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} className="position-relative">
                        <Form.Label>State</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                placeholder="Enter state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                isValid={isValidState}
                                isInvalid={state && !isValidState}
                                required
                            />
                            <Form.Control.Feedback type="valid">
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                State must be at least 2 characters long.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} className="position-relative">
                        <Form.Label>Zip Code</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                placeholder="Enter zip code"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                isValid={isValidZip}
                                isInvalid={zipCode && !isValidZip}
                                required
                            />
                            <Form.Control.Feedback type="valid">
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid zip code.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>
                <Button
                    variant="primary"
                    className="mb-5"
                    type="submit"
                    disabled={loading || !isValidStreet || !isValidCity || !isValidState || !isValidZip}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="mx-3"
                            />
                            <span className="sr-only">Adding details...</span>
                        </>
                    ) : ("Submit")}
                </Button>
                {errorMessage && (
                    <Alert variant="danger">
                        <Alert.Heading>Error!</Alert.Heading>
                        {errorMessage}
                    </Alert>
                )}
                {successMessage && (
                    <Alert variant="success">
                        <Alert.Heading>Success!</Alert.Heading>
                        {successMessage}
                    </Alert>
                )}
            </Form>
        </Container>
    );
}

export default AddCareHomesPage;