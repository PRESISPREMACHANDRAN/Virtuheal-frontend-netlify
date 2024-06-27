import {Alert, Button, Container, Form, Spinner} from "react-bootstrap";
import {useRef, useState} from "react";
import useAxiosPrivate from "@hooks/useAxiosPrivate";
import useTopBar from "@hooks/useTopBar.jsx";

function AddCareHomesPage() {
    const nameRef = useRef("");
    const addressRef = useRef("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const {setTitle} = useTopBar()
    setTitle("New Care Home Details");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        try {
            const response = await axiosPrivate.post(`/carehomes/`,
                JSON.stringify({
                    name: nameRef.current.value,
                    address: addressRef.current.value,
                }),
            );
            setSuccessMessage(`Care Home details has been successfully added. The ID is ${response?.data?.code}`)
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("An error occurred while adding carehome");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mx-3 p-3">
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        ref={nameRef}
                        placeholder="Enter name"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="address"
                        ref={addressRef}
                        placeholder="Enter address"
                        required
                    />
                </Form.Group>
                <Button
                    variant="primary"
                    className="mb-5"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className="sr-only">Loading...</span>
                        </>
                    ) : (
                        "Submit"
                    )}
                </Button>
                {errorMessage && (
                    <Alert>
                        <Alert.Heading>Error!</Alert.Heading>
                        {errorMessage}
                    </Alert>
                )}
                {successMessage && (
                    <Alert>
                        <Alert.Heading>Success!</Alert.Heading>
                        {successMessage}
                    </Alert>
                )}
            </Form>
        </Container>
    );
}

export default AddCareHomesPage;
