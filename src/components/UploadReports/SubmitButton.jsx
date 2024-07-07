import Button from 'react-bootstrap/Button';
import './SubmitButton.css';

function SubmitButton({onSubmit, isSubmitting, hasValidDate, hasValidFile}) {
    return (
        <div className="button-container">
            <Button variant={!hasValidDate || !hasValidFile ? "outline-danger":"primary"} size="lg" className="submit-button" onClick={onSubmit}
                    disabled={isSubmitting || !hasValidDate || !hasValidFile}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
        </div>
    );
}

export default SubmitButton;
