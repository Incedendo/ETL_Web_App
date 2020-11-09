import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import CustomCodeForm from '../FormComponents/CustomCodeForm';
import { WorkspaceContext } from '../../context/WorkspaceContext';

const CustomCodeModal = ({ table, data, uniqueCols, routeCode }) => {
    const {
        debug
    } = useContext(WorkspaceContext);

    const [show, setShow] = useState(false);

    debug && console.log(data);

    return (
        <div className="job-modal">
            <div className="central-spinning-div">
                <Button 
                    className="button-margin"
                    variant="primary"
                    disabled={data.PRIVILEGE === 'READ ONLY' }
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
                        data={data}
                        uniqueCols={uniqueCols}
                        setShow={setShow}
                        routeCode={routeCode}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default CustomCodeModal;