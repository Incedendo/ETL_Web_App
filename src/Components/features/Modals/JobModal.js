import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import JobForm from '../FormComponents/JobForm';

const JobModal = ({ data, uniqueCols, dataTypes }) => {
    const [show, setShow] = useState(false);

    // console.log(dataTypes);

    return (
        <div style={{ 'float': 'left', 'marginLeft': '10px', 'marginRight': '10px' }} className="job-modal">
            <Button 
                // className="button-margin"
                variant="outline-primary"
                onClick={() => setShow(true)}>
                Create Job
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
                        Schedule a Job
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <JobForm 
                        data={data}
                        uniqueCols={uniqueCols}
                        dataTypes={dataTypes}
                        setShow={setShow}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default JobModal;