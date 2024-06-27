import Button from 'react-bootstrap/Button';
import './SubmitButton.css';

function SubmitButton({onSubmit, isSubmitting}) {
    return (
        <div className="button-container">
            <Button variant="outline-primary" size="lg" className="submit-button" onClick={onSubmit}
                    disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
        </div>
    );
}

export default SubmitButton;
