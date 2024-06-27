import {Spinner, Container, Row, Col} from "react-bootstrap";

const LoadingSplashScreen = () => {
    return (

        <Container fluid
                   className="d-flex flex-column justify-content-center align-items-center vh-100 vw-100"
                   style={{height: "100vh"}}
        >
            <Row>
                <Col className="text-center">
                    <div style={{position: "relative", display: "inline-block"}}>
                        <Spinner
                            animation="border"
                            role="status"
                            style={{width: "5rem", height: "5rem"}}
                        ></Spinner>
                    </div>
                    <div className="mt-3">Please wait...</div>
                </Col>
            </Row>
        </Container>

    );
};

export default LoadingSplashScreen;
