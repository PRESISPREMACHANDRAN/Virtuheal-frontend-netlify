import {useRef, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import './NoteForm.css';
import {Badge} from "react-bootstrap";

function NoteForm({note, onNoteChange}) {
    const textAreaRef = useRef(null);
    const maxChars = 500;

    useEffect(() => {
        adjustTextAreaHeight();
    }, [note]);

    const adjustTextAreaHeight = () => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
        }
    };

    const handleNoteChange = (e) => {
        onNoteChange(e);
        adjustTextAreaHeight();
    };

    return (
        <div className="m-5">
            <Form className="note-form">
                <Form.Group className="mx-5" controlId="exampleForm.ControlTextarea1">
                    <Form.Label className="form-label">Addtional notes if any</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        className="form-control mb-3"
                        value={note}
                        onChange={handleNoteChange}
                        ref={textAreaRef}
                        style={{overflow: 'hidden'}}
                        maxLength={maxChars}
                    />
                </Form.Group>
                <Badge
                    className="py-2 border rounded-4 text-dark shadow-sm" bg={"light"}>
                    {note?.length}/{maxChars} characters
                </Badge>
            </Form>
        </div>
    );
}

export default NoteForm;