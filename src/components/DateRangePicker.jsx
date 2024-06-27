import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {Form, Row, Col} from 'react-bootstrap';

const DateRangePicker = ({startDate, endDate, setStartDate, setEndDate}) => {
    return (
        <Form>
            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label className="px-3">Start Date</Form.Label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            className="form-control mb-3"
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label className="px-3">End Date</Form.Label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            className="form-control mb-3"
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default DateRangePicker;
