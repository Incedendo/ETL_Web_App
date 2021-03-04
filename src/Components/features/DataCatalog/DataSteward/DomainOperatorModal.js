import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import DomainOperatorForm from './DomainOperatorForm';

const DomainOperatorModal = () => {

    const [show, setShow] = useState(false);
    
    return (
        <div style={{float: "left", marginTop: '10px',marginLeft: "10px", marginRight: "10px"}}>
            <Button className=""
                variant="outline-primary"
                onClick={() => {
                    setShow(true);
                }}>
                Set Domain Admin
            </Button>

            <Modal
                show={show}
                onHide={() => setShow(false)}
                dialogClassName="modal-150w"
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                    Domain Admin
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DomainOperatorForm/>
                </Modal.Body>
            </Modal>

        </div>
    )
}

export default DomainOperatorModal;