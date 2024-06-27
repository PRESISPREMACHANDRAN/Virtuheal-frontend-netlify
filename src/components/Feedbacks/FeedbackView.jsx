import {useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Button, Spinner, Container, Table, Tabs, Tab, Accordion, Alert, Card} from 'react-bootstrap';
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import {useQuery} from '@tanstack/react-query';
import DateRangePicker from '@components/DateRangePicker';
import styles from './FeedbackView.module.scss';

const FeedbackView = () => {
    const {state} = useLocation();
    const associateId = state?.associateId;
    const associateName = state?.associateName;
    console.log(associateId);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const axiosPrivate = useAxiosPrivate();

    const fetchFeedbacks = async () => {
        let allResults = [];
        let nextUrl = "/feedbacks/";
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

    const feedbackQuery = useQuery({
        queryKey: ["feedbacks", associateId, startDate, endDate],
        queryFn: fetchFeedbacks,
        enabled: false
    });

    const handleFetchFeedbacks = () => {
        if (!startDate || !endDate) {
            alert('Please select a date range.');
            return;
        }
        feedbackQuery.refetch()
            .then(() => {
                setFeedbacks(feedbackQuery.data);
            })
            .catch((error) => console.log(error));
    };

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
            </span>
        ));
    };

    return (
        <Container fluid className={styles.FeedBackViewContainer}>
            <h2 className="mb-5 text-center">Feedback for Associate: <h1 className="m-2">{associateName}</h1></h2>
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />
            <Button
                onClick={handleFetchFeedbacks}
                className="my-4 py-2 mx-5"
                style={{width: '95%'}}
            >Get Feedbacks
            </Button>
            {feedbackQuery.isFetching ?
                (<Spinner animation="border" className="my-3"/>) : (startDate && endDate && feedbacks?.length ? (
                    <>
                        <Card className="my-3">
                            <Card.Header className="display-6 text-center">Average Ratings</Card.Header>
                            <Card.Body>
                                <ul className="align-items-center text-center">
                                    <li>Engagement Level: {renderStarRating(calculateAverages().engagement)}</li>
                                    <li>Satisfaction: {renderStarRating(calculateAverages().satisfaction)}</li>
                                    <li>Physical Impact: {renderStarRating(calculateAverages().physical)}</li>
                                    <li>Cognitive Impact: {renderStarRating(calculateAverages().cognitive)}</li>
                                </ul>
                            </Card.Body>
                        </Card>
                        <Card className="my-3">
                            <Card.Header className="display-6 text-center">Feedback Records</Card.Header>
                            <Card.Body>
                                <Tabs defaultActiveKey={feedbacks[0].session_date} id="feedback-tabs">
                                    {feedbacks.map(feedback => (
                                        <Tab eventKey={feedback.id} key={feedback.id} title={feedback.session_date}>
                                            <div className="mb-5 p-2">
                                                <h3>VR Experience: {feedback.vr_experience}</h3>
                                                <h3 className="mb-3">Emotional
                                                    Response: {feedback.emotional_response}</h3>
                                                <h2>Recorded Details</h2>
                                                <Table striped bordered hover responsive>
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
                                                        <td>{feedback.engagement_level}</td>
                                                        <td>{feedback.satisfaction}</td>
                                                        <td>{feedback.physical_impact}</td>
                                                        <td>{feedback.cognitive_impact}</td>
                                                    </tr>
                                                    </tbody>
                                                </Table>
                                                <Accordion>
                                                    <Accordion.Item eventKey={feedback.id}>
                                                        <Accordion.Header>Notes</Accordion.Header>
                                                        <Accordion.Body>{feedback.feedback_notes}</Accordion.Body>
                                                    </Accordion.Item>
                                                </Accordion>
                                            </div>
                                        </Tab>
                                    ))}
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </>
                ) : (startDate && endDate && !feedbacks?.length ? (
                    <Alert variant="info" className="mt-3">No feedbacks found in the given date range!</Alert>
                ) : null))}
        </Container>
    );
};

export default FeedbackView;
