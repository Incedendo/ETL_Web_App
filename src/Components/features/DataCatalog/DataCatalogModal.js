import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import DataStewardEditor from './DataStewardEditor';


const DataCatalogModal = ({ 
    table, fields, schema, loadedConfig, 
    codeFields, dropdownFields, dropdownObject, setInsertError 
}) => {
    const [show, setShow] = useState(false);

    // console.log(table);

    return (
        <div style={{ 'float': 'left' }}>
            <Button className="button-margin"
                variant="primary"
                onClick={() => setShow(true)}>
                Add item
            </Button>

            <Modal
                show={show}
                animation={true}
                // scrollable={true}
                onHide={() => setShow(false)}
                dialogClassName="route-modal-width"
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        {table}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DataStewardEditor 
                        table={table}
                        fields={fields}
                        schema={schema}
                        loadedConfig={loadedConfig}
                        codeFields={codeFields}
                        dropdownFields={dropdownFields}
                        dropdownObject={dropdownObject}
                        setShow={setShow}
                        setInsertError={setInsertError}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default DataCatalogModal;