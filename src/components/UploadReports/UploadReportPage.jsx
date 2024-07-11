import {useState, useEffect} from 'react';
import './UploadReportPage.css';
import Calendar from './Calendar.jsx';
import UploadFile from "./UploadFile.jsx";
import NoteForm from "./NoteForm.jsx";
import SubmitButton from "./SubmitButton.jsx";
import {useLocation, useNavigate} from 'react-router-dom';
import useAxiosPrivate from "@hooks/useAxiosPrivate.jsx";
import {Toast, ToastContainer} from "react-bootstrap";

function UploadReportPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {id, url, name} = location.state || {};

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetFileInput, setResetFileInput] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState("");

    const axiosPrivate = useAxiosPrivate();

    const handleFileChange = (file) => {
        setSelectedFile(file);
        setErrorMessage('');
    };

    const handleNoteChange = (e) => {
        setNote(e.target.value);
        setErrorMessage('');
    };

    const validateForm = () => {
        if (!selectedDate || !selectedFile) {
            setErrorMessage("Please fill in all fields before submitting.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        const formData = new FormData();
        formData.append("associate", url);
        formData.append("report_month", selectedDate.toISOString().substring(0, 10));
        formData.append("pdf", selectedFile);
        formData.append("description", note);

        try {
            const response = await axiosPrivate.post("/reports/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201 || response.status === 200) {
                setSuccessMessage('The report has been successfully uploaded.');
                setSelectedDate(null);
                setSelectedFile(null);
                setNote("");
                setResetFileInput(true);
                setTimeout(() => setResetFileInput(false), 0);
                setTimeout(() => navigate('/reports/add'), 5000);
            } else {
                const errorData = await response.data;
                setErrorMessage(errorData.message || 'Failed to upload report. Please try again.');
            }
        } catch (error) {
            setErrorMessage('An error occurred while uploading the report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (selectedDate || selectedFile || note) {
            setErrorMessage('');
        }
    }, [selectedDate, selectedFile, note]);

    return (
        <div className="container-fluid upload-report-page rounded-4 m-3 border">
            <h1>Upload Report for {name}</h1>
            <div>
                <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            </div>
            <div>
                <UploadFile onFileChange={handleFileChange} reset={resetFileInput}/>
            </div>
            <div>
                <NoteForm note={note} onNoteChange={handleNoteChange}/>
            </div>
            <div>
                <SubmitButton onSubmit={handleSubmit} isSubmitting={isSubmitting} hasValidDate={selectedDate} hasValidFile={selectedFile}/>
            </div>
            <ToastContainer
                className="p-3"
                position="bottom-end"
                style={{zIndex: 1}}
            >
                <Toast
                    show={errorMessage}
                    bg="danger"
                    className="shadow"
                    onClose={() => setErrorMessage("")}
                >
                    <Toast.Header>
                        <h1 className="me-auto">Error!</h1>
                    </Toast.Header>
                    <Toast.Body
                        className="text-light p-3"
                    >
                        <h2>
                            {errorMessage}
                        </h2>
                    </Toast.Body>
                </Toast>
                <Toast
                    show={successMessage}
                    bg="primary"
                    className="shadow"
                    onClose={() => setSuccessMessage("")}
                >
                    <Toast.Header>
                        <h1 className="me-auto">Success!</h1>
                    </Toast.Header>
                    <Toast.Body
                        className="text-light p-3"
                    >
                        <h2>
                            {successMessage}
                        </h2>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

export default UploadReportPage;