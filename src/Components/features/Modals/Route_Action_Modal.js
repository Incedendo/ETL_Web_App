import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import RouteDataLoader from '../RouteConfigurations/RouteDataLoader';
import '../../../css/mymodal.scss';
import '../../../css/forms.scss';

const Route_Action_Modal = (props) => {
    const [show, setShow] = useState(false);

    return (
        <>
            <Button 
                // className="button-margin"
                variant="primary"
                onClick={() => setShow(true)}>
                Configure New Job
            </Button>

            <Modal
                show={show}
                onHide={() => setShow(false)}
                dialogClassName="route-modal-width"
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        Route Configuration
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RouteDataLoader
                        setActionModalShow={setShow}
                    />
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Route_Action_Modal;