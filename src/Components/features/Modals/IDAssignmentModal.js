import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import IDAssignmentForm from '../Admin/IDAssignmentForm';
import '../../../css/mymodal.scss';
import '../../../css/forms.scss';

const IDAssignmentModal = (props) => {
    const [show, setShow] = useState(false);

    return (
        <div style={{displat: 'float', float: 'left', marginRight: '20px'}}>
            <Button 
                // className="button-margin"
                variant="outline-primary"
                onClick={() => setShow(true)}>
                Assign Group IDs to user
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
                        Add GroupIds to User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <IDAssignmentForm 
                        setShow={setShow}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default IDAssignmentModal;