import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import DataStewardEditor from './DataStewardEditor';

const tableItems = {
    "DATA_STEWARD": 'Steward', 
    "DATA_DOMAIN": 'Domain',
    "CATALOG_ENTITIES": 'Entity',
    "CATALOG_ENTITY_LINEAGE": 'Lineage',
    "CATALOG_ITEMS": 'Item', 
    'DATA_STEWARD_DOMAIN': 'Steward-Domain',
    'CATALOG_ENTITY_DOMAIN': 'Entity-Domain'
}

const DataCatalogModal = ({ 
    table, fields, schema, loadedConfig, 
    codeFields, dropdownFields, dropdownObject, setInsertError 
}) => {
    const [show, setShow] = useState(false);
    const [item, setItem] = useState("");

    const {
        isAdmin, isSteward
    } = useContext(AdminContext);

    useEffect(()=>{
        setItem(tableItems[table]);
    }, [table]);

    // console.log(table);    

    return (
        <div style={{ 'float': 'left' }}>
            <Button className="button-margin"
                variant="primary"
                onClick={()=>setShow(true)}
                disabled={
                    (table === 'DATA_STEWARD'  && !isAdmin)
                    || ( (table === 'DATA_STEWARD_DOMAIN' 
                            || table === 'DATA_DOMAIN' 
                            || table === 'CATALOG_ENTITY_DOMAIN'
                        ) && !isSteward)
                }
            >
                Add {item}
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