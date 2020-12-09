import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import CustomCodeModal from './CustomCodeModal';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import Table from '../GenericTable/Table';

const GenericTableModal = ({ modalName, tableName, data, uniqueCols, routeCode, route }) => {
    const {
        debug
    } = useContext(WorkspaceContext);
    
    const [show, setShow] = useState(false);
    debug && console.log("route code: ", routeCode);
    debug && console.log("route: ", route);
    debug && console.log("data: ", data);
    
    const ID = 'EXTRACT_CONFIG_ID';

    let proposed_get_statenent = 'SELECT * FROM SHARED_TOOLS_DEV.ETL.ETLF_CUSTOM_CODE WHERE EXTRACT_CONFIG_ID = '
            + data['EXTRACT_CONFIG_ID'] + ';'; 

    return (
        <div className="job-modal">
            <Button className="button-margin"
                variant="primary"
                onClick={() => setShow(true)}>
                Linked Items
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
                        {modalName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CustomCodeModal
                        table={tableName}
                        data={data}
                        uniqueCols={[]}
                        routeCode={routeCode}
                        // customCodeDataTypeObj={customCodeDataTypeObj}
                    />

                    {data !== undefined &&
                        <Table
                            // propData={data}
                            privilege={data['PRIVILEGE']}
                            getStatement={proposed_get_statenent}
                            tableName={tableName}
                            route={route}
                        />
                    }
                    
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default GenericTableModal;