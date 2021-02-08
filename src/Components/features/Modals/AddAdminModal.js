import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import AddAdminForm from '../Admin/AddAdminForm';
import '../../../css/mymodal.scss';
import '../../../css/forms.scss';

const AddAdminModal = (props) => {
    const [show, setShow] = useState(false);

    return (
        <div style={{displat: 'float', float: 'left', marginRight: '20px'}}>
            <Button 
                // className="button-margin"
                variant="outline-primary"
                onClick={() => setShow(true)}>
                Add New Admin
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
                        Add New Admin
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddAdminForm />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default AddAdminModal;