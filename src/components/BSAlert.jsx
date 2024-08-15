import Alert from 'react-bootstrap/Alert';

function BSAlert({variant, heading, body, trigger, setTrigger}) {

    return (
        <Alert dismissible variant={variant} show={trigger} onClose={() => setTrigger("")}>
            <Alert.Heading>{heading}</Alert.Heading>
            <h4>
                {body}
            </h4>
        </Alert>
    );
}

export default BSAlert;