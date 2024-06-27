import {useState, useEffect} from 'react';
import {Button, Spinner, Container, Card, Tabs, Tab, Accordion, Alert} from 'react-bootstrap';
import {useQuery} from '@tanstack/react-query';
import {useLocation} from 'react-router-dom';
import DateRangePicker from '@components/DateRangePicker';
import useAxiosPrivate from '@hooks/useAxiosPrivate';

const AccessReportsView = () => {
    const {state} = useLocation();
    const associateId = state?.associateId;
    const associateName = state?.associateName;
    const [selectedAssociate, setSelectedAssociate] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        setSelectedAssociate({name: associateName});
    }, [associateName]);


    const fetchReports = async (associateName, startDate, endDate) => {
        console.log('Fetching reports...');
        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);
        let allReports = [];
        let nextUrl = `/reports/`;
        try {
            while (nextUrl) {
                const {data} = await axiosPrivate.get(nextUrl, {
                    params: {
                        associate: associateId,
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0],
                    }
                });
                console.log('Fetched data:', data);
                nextUrl = data.next;
                allReports = [...allReports, ...data.results];
            }
            console.log('All reports:', allReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
        return allReports;
    };

    const reportQuery = useQuery({
        queryKey: ["reports", associateName, startDate, endDate],
        queryFn: () => fetchReports(associateName, startDate, endDate),
        enabled: false
    });

    const handleFetchReports = async () => {
        if (!startDate || !endDate) {
            alert('Please select a date range.');
            return;
        }
        await reportQuery.refetch()
            .catch((error) => console.log(error));
        console.log(reportQuery.data)
    };

    return (
        <Container fluid className="mx-3 p-3">
            <h1 className="mx-3 mt-2 mb-5">Reports for {associateName}</h1>
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />
            <Button
                onClick={handleFetchReports}
                className="my-4 py-2 mx-5"
                style={{width: '95%'}}
            >Get Reports
            </Button>
            {reportQuery.isLoading && <Spinner animation="border"/>}
            {reportQuery.isSuccess && (
                <Card>
                    <Card.Header className="text-center">
                        <h1 className="my-2">Report Records</h1>
                    </Card.Header>
                    <Card.Body>
                        {reportQuery?.data?.length ? (
                            <Tabs defaultActiveKey={0} id="report-tabs">
                                {reportQuery?.data?.map((reportItem) => (
                                    <Tab eventKey={reportItem.id} key={reportItem.id}
                                         title={reportItem.report_month || "No Date"}>
                                        <div className="mb-5 p-2">
                                            <h3>Recorded Details</h3>
                                            <Accordion>
                                                <Accordion.Item eventKey={reportItem.id}>
                                                    <Accordion.Header>Report</Accordion.Header>
                                                    <Accordion.Body>
                                                        <Button onClick={() => window.open(reportItem.pdf, '_blank')}>
                                                            View Report
                                                        </Button>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>


                                        </div>
                                    </Tab>
                                ))}
                            </Tabs>
                        ) : (
                            <Alert variant="info" className="mt-3">No reports found in the given date range!</Alert>
                        )}
                    </Card.Body>
                </Card>
            )}
            {reportQuery.isError && (
                <Alert variant="danger" className="mt-3">An error occurred while fetching the reports.</Alert>
            )}
        </Container>
    );
};

export default AccessReportsView;
