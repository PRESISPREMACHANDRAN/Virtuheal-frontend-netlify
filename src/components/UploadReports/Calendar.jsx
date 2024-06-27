import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Calendar.css';
import {FaCalendar} from "react-icons/fa";

function CustomInput({value, onClick}) {
    return (
        <div className="input-group">
            <input type="text" className="form-control" value={value} onClick={onClick} readOnly/>
            <div className='input-group-append'>
                <span className='input-group-text'>
                    <FaCalendar className="fa-calendar" onClick={onClick}/>
                </span>
            </div>
        </div>
    );
}

function Calendar({selectedDate, setSelectedDate}) {
    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <label className="form-label">
                        Select a Date
                    </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={date => setSelectedDate(date)}
                        customInput={<CustomInput/>}
                        className="form-control"
                        dateFormat="dd-MM-yyyy"
                    />
                </div>
            </div>
        </div>
    );
}

export default Calendar;
