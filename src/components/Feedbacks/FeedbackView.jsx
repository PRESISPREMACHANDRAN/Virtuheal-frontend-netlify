import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Button, Spinner, Container, Table, Tabs, Tab, Accordion, Alert, Card, Badge} from 'react-bootstrap';
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import DateRangePicker from '@components/DateRangePicker';
import styles from './FeedbackView.module.scss';

const FeedbackView = () => {
    const {state} = useLocation();
    const associateId = state?.associateId;
    const associateName = state?.associateName;
    const [alertMessage, setAlertMessage] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const fetchFeedbacks = async () => {
        let allResults = [];
        let nextUrl = "/feedbacks/";
        console.log(startDate.toISOString(), endDate.toISOString());
        console.log(startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],);
        try {
            const {data} = await axiosPrivate.get(nextUrl, {
                params: {
                    associate: associateId,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                }
            });
            nextUrl = data.next;
            allResults = [...allResults, ...data.results];
        } catch (error) {
            console.log(error);
        }
        while (nextUrl) {
            try {
                const {data} = await axiosPrivate.get(nextUrl);
                nextUrl = data.next;
                allResults = [...allResults, ...data.results];
            } catch (error) {
                console.log(error);
                break;
            }
        }
        return allResults;
    };

    const handleFetchFeedbacks = () => {
        if (!startDate || !endDate) {
            alert('Please select a date range.');
            return;
        }
        setLoading(true);
        setAlertMessage("");
        fetchFeedbacks()
            .then((results) => {
                setFeedbacks(results);
            })
            .then(() => {
                if (!feedbacks?.length) {
                    setAlertMessage("No feedbacks found in the given date range. Please try a different date range.")
                }
            })
            .catch((error) => console.log(error))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        setAlertMessage("");
    }, [startDate, endDate]);

    const calculateAverages = () => {
        const totals = feedbacks.reduce((acc, feedback) => {
            acc.engagement += parseInt(feedback.engagement_level);
            acc.satisfaction += parseInt(feedback.satisfaction);
            acc.physical += parseInt(feedback.physical_impact);
            acc.cognitive += parseInt(feedback.cognitive_impact);
            return acc;
        }, {engagement: 0, satisfaction: 0, physical: 0, cognitive: 0});

        const count = feedbacks.length;
        return {
            engagement: (totals.engagement / count).toFixed(2),
            satisfaction: (totals.satisfaction / count).toFixed(2),
            physical: (totals.physical / count).toFixed(2),
            cognitive: (totals.cognitive / count).toFixed(2)
        };
    };

    const renderStarRating = (rating) => {
        return [...Array(5)].map((_, index) => (
            <span key={index} className={index < rating ? "text-warning" : "text-muted"}>
                ★
            </span>));
    };

    return (<Container fluid className="m-3 rounded-4 border px-5 text-center">
        <Container fluid className="border rounded-4 shadow-sm my-5 mx-3 py-4">

            <h2 className="text-center mt-4 mb-3">Feedback for resident: </h2>
            <h1 className="mt-3 mb-5 text-center">{associateName}</h1>
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />
            <Button
                onClick={handleFetchFeedbacks}
                className="my-4 py-2 mx-5"
                style={{width: '25%'}}
            >View Feedbacks
            </Button>
        </Container>
        {loading ? <Container> <Spinner animation="border" className="my-3"/>
        </Container> : (startDate && endDate && feedbacks?.length && !loading ? <>
            <Container fluid className={styles.FeedBackViewContainer}>
                <Card className="my-3 rounded-4 shadow-sm">
                    <Card.Header className="display-6 text-center">Average Ratings</Card.Header>
                    <Card.Body>
                        <ul className="align-items-center text-center rounded-5 border">
                            <li>Engagement Level: {renderStarRating(calculateAverages().engagement)}</li>
                            <li>Satisfaction: {renderStarRating(calculateAverages().satisfaction)}</li>
                            <li>Physical Impact: {renderStarRating(calculateAverages().physical)}</li>
                            <li>Cognitive Impact: {renderStarRating(calculateAverages().cognitive)}</li>
                        </ul>
                    </Card.Body>
                </Card>
                <Card className="my-3 rounded-4 shadow-sm">
                    <Card.Header className="display-6 text-center">Feedback Records</Card.Header>
                    <Card.Body>
                        <Tabs defaultActiveKey={feedbacks[0].session_date} id="feedback-tabs" fill>
                            {feedbacks.map(feedback => (
                                <Tab eventKey={feedback.id} key={feedback.id}
                                     title={feedback?.session_date.split("-").reverse().join("-")}>
                                    <div className="mb-5 p-2">
                                        <h1 className="mt-5 mb-3">Emotional overview</h1>
                                        <Badge
                                            bg="light"
                                            className="text-dark border my-3 mx-5 rounded-5"
                                        >
                                            <h3 className="text-center">VR Experience: {feedback.vr_experience}</h3>
                                        </Badge>
                                        <br/>
                                        <Badge
                                            bg="light"
                                            className="text-dark my-3 mx-5 border rounded-5"
                                        >
                                            <h3 className="text-center">Emotional
                                                Response: {feedback.emotional_response}</h3>
                                        </Badge>
                                        <h1 className="mt-5 mb-3">Recorded Details</h1>
                                        <Table striped bordered hover responsive
                                               className="shadow-sm"
                                        >
                                            <thead>
                                            <tr>
                                                <th>Engagement Level</th>
                                                <th>Satisfaction</th>
                                                <th>Physical Impact</th>
                                                <th>Cognitive Impact</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>{renderStarRating(feedback.engagement_level)}</td>
                                                <td>{renderStarRating(feedback.satisfaction)}</td>
                                                <td>{renderStarRating(feedback.physical_impact)}</td>
                                                <td>{renderStarRating(feedback.cognitive_impact)}</td>
                                            </tr>
                                            </tbody>
                                        </Table>
                                        <Accordion
                                            className="shadow-sm rounded m-4"
                                        >
                                            <Accordion.Item eventKey={feedback.id}>
                                                <Accordion.Header>
                                                    <h2>
                                                        Additional Notes
                                                    </h2>
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    <h3 className="m-3">
                                                        {feedback.feedback_notes}
                                                    </h3>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    </div>
                                </Tab>))}
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>
        </> : (startDate && endDate && !feedbacks?.length ? (
            <Alert show={alertMessage} variant="info" className="mt-3 mx-5">
                <Container style={{width:"20vw"}}>
                    <span className="material-symbols-rounded">feedback</span>
                </Container>
                <h3>{alertMessage}</h3>
            </Alert>) : null))}
    </Container>);
};

export default FeedbackView;
