import {useRef, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import './NoteForm.css';

function NoteForm({note, onNoteChange}) {
    const textAreaRef = useRef(null);

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
        <div className="form-container">
            <Form className="note-form">
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label className="form-label">Add a note</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        className="form-control"
                        value={note}
                        onChange={handleNoteChange}
                        ref={textAreaRef}
                        style={{overflow: 'hidden'}}
                    />
                </Form.Group>
            </Form>
        </div>
    );
}

export default NoteForm;
