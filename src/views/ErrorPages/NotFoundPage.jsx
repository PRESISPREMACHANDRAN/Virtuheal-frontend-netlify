import {Container, Row, Col, Button, Card} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    return (
        <Container className="text-center p-5 m-5">
            <Row className="mx-5 align-items-center">
                <Col>
                    <Card bg="light">
                        <Card.Title>
                            <h1 className="display-1 mx-5 p-5">404 Not Found!</h1>
                        </Card.Title>
                        <Card.Body>
                        </Card.Body>
                        <Card.Text>
                            <p className="lead mb-5">Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
                        </Card.Text>
                        <Card.Footer>
                            <Button
                                className="p-3 m-5"
                                variant="primary"
                                onClick={handleGoHome}
                            >
                                Go to Dashboard
                            </Button>
                        </Card.Footer>
                    </Card>

                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;
