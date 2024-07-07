import {useRef, useState, useEffect} from "react";
import "./UploadFile.css";
import {Badge} from "react-bootstrap";

const UploadFile = ({onFileChange, reset}) => {
    const inputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (reset) {
            setSelectedFile(null);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }, [reset]);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
                onFileChange(file);
            } else {
                alert("Please upload a PDF file.");
                if (inputRef.current) {
                    inputRef.current.value = "";
                }
            }
        }
    };

    const onChooseFile = () => {
        inputRef.current.click();
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="upload-container">
            <input
                ref={inputRef}
                type="file"
                onChange={handleFileChange}
                style={{display: "none"}}
                accept="application/pdf"
            />
            {!selectedFile && (
                <button className="file-btn" onClick={onChooseFile}>
                    <span className="material-symbols-rounded">upload</span> Upload File
                </button>
            )}
            {selectedFile && (
                <div className="file-card">
                    <span className="material-symbols-rounded icon">description</span>
                    <div className="file-info">
                        <h6>{selectedFile.name}</h6>
                        <button onClick={removeFile}>
                            <span className="material-symbols-rounded">delete</span>
                        </button>
                    </div>
                </div>
            )}
            <Badge>
                <small className="py-5 mx-3">Only PDF format is allowed.</small>
            </Badge>
        </div>
    );
};

export default UploadFile;