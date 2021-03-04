import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
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
    codeFields, dropdownFields, dropdownObject
}) => {
    const [show, setShow] = useState(false);
    const [item, setItem] = useState("");

    const {
        isAdmin, isSteward, isDomainOperator
    } = useContext(AdminContext);

    useEffect(()=>{
        setItem(tableItems[table]);
    }, [table]);

    // console.log("isSteward: " + isSteward);   
    // console.log("isDomainOperator: " + isDomainOperator);  
    // console.log("can operate 3 last table: " + (!isDomainOperator && !isSteward)) ;

    return (
        <div style={{ 'float': 'left' }}>
            <Button className="button-margin"
                variant="outline-primary"
                onClick={()=>setShow(true)}
                disabled={
                    ( ['DATA_DOMAIN', 'DATA_STEWARD', 'DATA_STEWARD_DOMAIN' ].indexOf(table) >= 0 
                        && !isAdmin)
                    || ( table === 'CATALOG_ENTITY_DOMAIN'
                         && !isSteward && !isAdmin) 
                    || (['CATALOG_ENTITIES', 'CATALOG_ENTITY_LINEAGE', 'CATALOG_ITEMS'].indexOf(table) >= 0 
                        && !isDomainOperator && !isSteward && !isAdmin
                    )
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
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default DataCatalogModal;