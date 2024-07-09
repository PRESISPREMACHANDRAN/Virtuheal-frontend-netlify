import {useEffect, useRef, useState} from "react";
import useAuth from "@hooks/useAuth.jsx";
import {
    Alert,
    Button,
    Card,
    Col,
    Container,
    Form,
    Row,
    Spinner,
} from "react-bootstrap";
import {useNavigate, useLocation} from "react-router-dom";
import axios from "@/api/axios.js";
import Inclusys_Neuro_Org_nobg from "@assets/Inclusys_Neuro_Org_nobg.png";
import Punarjeeva_efx from "@assets/Punarjeeva_efx.png";
import useLocalStorage from "@hooks/useLocalStorage.jsx";
import styles from "./LoginPage.module.scss";

const LOGIN_ENDPOINT = "/auth/token/";

function LoginPage() {
    const [email, setEmail] = useState("");
    const emailRef = useRef("");
    const [password, setPassword] = useState("");

    const [persist, setPersist] = useLocalStorage("persist", false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const {auth, setAuth} = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    useEffect(() => {
        emailRef.current.focus();
        document.title = "Virtuheal Administration";
    }, []);

    useEffect(() => {
        setErrorMessage("");
    }, [email, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(
                LOGIN_ENDPOINT,
                JSON.stringify({email, password}),
                {
                    headers: {"Content-Type": "application/json"},
                    withCredentials: true,
                },
            );
            const accessToken = response?.data?.access;
            const name = response?.data?.name;
            const isAdmin = response?.data?.is_admin;
            const isSuperAdmin = response?.data?.is_superadmin;
            const isManager = response?.data?.is_manager;
            if (!isManager) {
                setAuth({
                name,
                email,
                password,
                isSuperAdmin,
                isAdmin,
                accessToken,
            });
            navigate(from, {replace: true});
            setEmail("");
            setPassword("");
            } else {
                setErrorMessage("Unauthorized. Manager accounts are not allowed.")
            }
        } catch (error) {
            if (!error?.response) {
                setErrorMessage("No Server Response");
            } else if (error.response?.status === 400) {
                setErrorMessage("Missing Email or Password");
            } else if (error.response?.status === 401) {
                setErrorMessage("Incorrect Email or Password");
            } else {
                setErrorMessage("Login Failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (e) => {
        setPersist(e.target.checked);
    };

    return (
        <section className="container-fluid d-flex align-items-center justify-content-center vh-100 vw-100">
            <Container className="row justify-content-center mt-5">
                <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4} className="mt-5 pt-5">
                    <Card className="border border-light-subtle rounded-3 shadow-sm">
                        <Card.Body className="p-3 p-md-4 p-xl-5">
                            <div className="text-center mb-3">
                                <a href="#">
                                    <img src={Inclusys_Neuro_Org_nobg} alt="Inclusys Logo"/>
                                </a>
                            </div>
                            <h1 className="fs-3 fw-normal text-center mb-4">
                                Virtuheal Administration
                            </h1>
                            <h2 className="fs-6 fw-normal text-center text-secondary mb-4">
                                Sign in to your account
                            </h2>
                            <Form onSubmit={handleSubmit}>
                                <Row className="gy-2 overflow-hidden">
                                    <Col xs={12}>
                                        <Form.Group className="mb-3" controlId="email">
                                            <Form.Floating>
                                                <Form.Control
                                                    type="email"
                                                    ref={emailRef}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    value={email}
                                                    placeholder="name@example.com"
                                                    required
                                                />
                                                <label htmlFor="email">Email</label>
                                            </Form.Floating>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Group className="mb-3" controlId="password">
                                            <Form.Floating>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <label htmlFor="password">Password</label>
                                            </Form.Floating>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        {errorMessage && (
                                            <Alert variant="danger" className="mb-3">
                                                {errorMessage}
                                            </Alert>
                                        )}
                                        <div className="d-flex gap-2 justify-content-center">
                                            <Form.Check
                                                type="checkbox"
                                                id="rememberMe"
                                                label="Keep me logged in"
                                                checked={persist}
                                                onChange={handleCheckboxChange}
                                                className="text-secondary"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12}>
                                        <div className="d-grid my-3">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                variant="primary"
                                            >
                                                {loading ? <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="mx-3"
                                                    />
                                                    Logging in...
                                                </> : (
                                                    "Log in"
                                                )}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Row>
                    <Col>
                        <img
                            className={styles.logo}
                            src={Punarjeeva_efx}
                            alt="punarjeeva-logo"
                        />
                    </Col>
                </Row>
            </Container>
        </section>
    );
}

export default LoginPage;
