import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import DataStewardEditor from './DataStewardEditor';

const DataCatalogModal = ({ table }) => {
    const [show, setShow] = useState(false);

    console.log(table);

    return (
        <div className="job-modal">
            <Button className="button-margin"
                variant="primary"
                onClick={() => setShow(true)}>
                Add
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
                        Add new Data Steward
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DataStewardEditor 
                        table={table}
                        setShow={setShow}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default DataCatalogModal;