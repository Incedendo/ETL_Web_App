import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import CustomCodeForm from '../FormComponents/CustomCodeForm';
import { WorkspaceContext } from '../../context/WorkspaceContext';

const CustomCodeModal = ({ table, EXTRACT_CONFIG_ID, privilege, uniqueCols, routeCode, insertUsingMergeStatement }) => {
    const {
        debug
    } = useContext(WorkspaceContext);

    const [show, setShow] = useState(false);

    debug && console.log(EXTRACT_CONFIG_ID);

    return (
        <div className="job-modal">
            <div className="central-spinning-div">
                <Button 
                    className="button-margin"
                    variant="primary"
                    disabled={privilege === 'READ ONLY' }
                    onClick={() => setShow(true)}
                >
                    New Custom Code
                </Button>
            </div>

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
                        Custom Code
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CustomCodeForm
                        table={table}
                        EXTRACT_CONFIG_ID={EXTRACT_CONFIG_ID}
                        setShow={setShow}
                        routeCode={routeCode}
                        insertUsingMergeStatement={insertUsingMergeStatement}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default CustomCodeModal;