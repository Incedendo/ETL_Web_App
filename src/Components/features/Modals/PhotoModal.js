import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import routeImg from '../../../media/ETLF_ROUTER.PNG';

const PhotoModal = (props) => {
    const [show, setShow] = useState(false);

    return (
        <>
            <Button 
                // className="button-margin"
                variant="outline-primary"
                onClick={() => setShow(true)}>
                ETL Diagram
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
                        ETL Routes Diagram
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <img style={{
                                position: 'relative',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, 0%)'
                            }} 
                        src={routeImg} />
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default PhotoModal;