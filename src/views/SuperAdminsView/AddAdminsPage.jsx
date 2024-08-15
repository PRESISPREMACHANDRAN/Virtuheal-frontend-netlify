import {Button, Container, Form, Row, Col, InputGroup, Spinner} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import styles from "@views/SuperAdminsView/AddAdminsPage.module.scss";
import BSAlert from "@components/BSAlert.jsx";
import {EMAIL_REGEX, NAME_REGEX, PWD_REGEX} from "@utils/validations/regex.js";
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import useTopBar from "@hooks/useTopBar.jsx";


const ADD_ADMIN_ENDPOINT = '/auth/users/';

function AddAdminsPage() {
    const {setTitle} = useTopBar()
    setTitle("New Admin Registration");

    const nameRef = useRef("");

    const [name, setName] = useState("");
    const [isValidName, setIsValidName] = useState(false);

    const [email, setEmail] = useState("");
    const [isValidEmail, setIsValidEmail] = useState(false);

    const [passwd, setPasswd] = useState("");
    const [isValidPasswd, setIsValidPasswd] = useState(false);

    const [passwdConfirm, setPasswdConfirm] = useState("");
    const [isValidPasswdMatch, setIsValidPasswdMatch] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();


    useEffect(() => {
        nameRef.current.focus();
    }, [])

    useEffect(() => {
        setIsValidName(NAME_REGEX.test(name));
    }, [name])

    useEffect(() => {
        setIsValidEmail(EMAIL_REGEX.test(email));
    }, [email])

    useEffect(() => {
        setIsValidPasswd(PWD_REGEX.test(passwd));
        setIsValidPasswdMatch(passwd === passwdConfirm);
    }, [passwd, passwdConfirm])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");
        setLoading(true);
        try {

            const response = await axiosPrivate.post(ADD_ADMIN_ENDPOINT,
                JSON.stringify({name, email, password: passwd}),
                {
                    params: {
                        type: "admin"
                    },
                }
            );
            const data = response?.data;
            setSuccessMessage(`${data.name} has been successfully registered as new Admin.`);
            setTimeout(() => setSuccessMessage(""), 8000);
            setName('');
            setEmail("")
            setPasswd('');
            setPasswdConfirm('');
        } catch (error) {
            if (!error?.response) {
                setErrorMessage('No Server Response. Are you connected to internet?');
            } else if (error?.response?.status === 400) {
                console.log(error.response);
                if (error.response?.data?.email[0] === "interface user with this email already exists.") {
                    setErrorMessage("An admin account with this email already exists. Try adding with another email.")
                    setTimeout(() => setErrorMessage(""), 8000);
                    setName('');
                    setEmail("")
                    setPasswd('');
                    setPasswdConfirm('');
                }
            } else {
                setErrorMessage('An error occurred while adding admin');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="m-3 border rounded-4 p-5">
            <Form className={styles.addAdminForm} noValidate onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group className="position-relative">
                        <Form.Label>Name</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                autoComplete="off"
                                ref={nameRef}
                                placeholder="Enter name"
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
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                autoComplete="off"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isValid={isValidEmail}
                                isInvalid={email && !isValidEmail}
                                required
                            />
                            <Form.Control.Feedback type="valid">
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid email.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>

                <Row className="mb-3">
                    <Form.Group md="4" as={Col} className="position-relative">
                        <Form.Label>Password</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={passwd}
                                onChange={(e) => setPasswd(e.target.value)}
                                isValid={isValidPasswd}
                                isInvalid={passwd && !isValidPasswd}
                                required
                            />
                            <Form.Control.Feedback>
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                <p>
                                    8 to 24 characters.<br/>
                                    Must include uppercase and lowercase letters, a number and a special character.<br/>
                                    Allowed special characters: !,@,#,$,%
                                </p>
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group md="4" as={Col} className="position-relative">
                        <Form.Label>Confirm password</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="password"
                                placeholder="Confirm password"
                                value={passwdConfirm}
                                onChange={(e) => setPasswdConfirm(e.target.value)}
                                isValid={isValidPasswd && isValidPasswdMatch}
                                isInvalid={passwd && passwdConfirm && !isValidPasswdMatch}
                                required
                            />
                            <Form.Control.Feedback>
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                Passwords do not match!
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>
                <Button
                    variant="primary"
                    className="mt-3 mb-4"
                    type="submit"
                    disabled={loading || !isValidName || !isValidEmail || !isValidPasswd || !isValidPasswdMatch}
                >
                    {loading ? "" : "Add Admin"}
                    {loading && (<Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />)}
                </Button>
                <BSAlert
                    variant="danger"
                    heading="Error!"
                    body={errorMessage}
                    trigger={errorMessage}
                    setTrigger={setErrorMessage}
                />
                <BSAlert
                    variant="success"
                    heading="Success!"
                    body={successMessage}
                    trigger={successMessage}
                    setTrigger={setSuccessMessage}
                />
            </Form>
        </Container>
    );
}

export default AddAdminsPage;
