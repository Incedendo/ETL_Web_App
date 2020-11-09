import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import { WorkspaceContext } from '../../context/WorkspaceContext';

import '../../../css/mymodal.scss';

const PkEditModal = () => {
    const {
        searchCriteria,
        setPrimaryKeys,
        primaryKeys,
    } = useContext(WorkspaceContext);

    const [show, setShow] = useState(false);

    const temp_arr = [...searchCriteria]
    const [remainingColumns, setRemainingColumns] = useState([])

    // First check if table already has Primary keys,
    // If so, do not include that in the auto suggest options 
    useEffect(() => {
        setRemainingColumns(temp_arr.filter(item => primaryKeys.indexOf(item) < 0))
    }, [])

    const handleAddNewPK = value => {
        //remove a primary keys fron the list of remaining columns
        setRemainingColumns(remainingColumns.filter(item => item !== value));
        setPrimaryKeys([...primaryKeys, value])
    }
    
    const handleRemovePK = value => {
        setPrimaryKeys(primaryKeys.filter(primaryKey => primaryKey !== value))
        setRemainingColumns([...remainingColumns, value]);
    }

    const RenderList = () => (
        <>
            {primaryKeys.map(col =>
                <div key={col} className="display-flex">
                    <button
                        className="remove-button "
                        onClick={() => handleRemovePK(col)}
                    >
                        x
                        </button>
                    <div>
                        {col}
                    </div>

                </div>
            )}
        </>
    )

    return (
        <>
            <Button className="plus-button"
                variant="primary"
                onClick={() => setShow(true)}>
                +
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
                        Primary Keys Configuration
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="body-height">
                        <div className="display-flex">
                            <CustomAutoCompleteComponent
                                list={remainingColumns}
                                setTarget={val => handleAddNewPK(val)}
                                autoSuggestModalClassName="auto-suggest-box-modal"
                            />

                            <div style={{ 'marginLeft': '10px' }}>
                                <span style={{ 'fontWeight': 'bold' }}>Primary Keys ({primaryKeys.length} items):</span>
                                {primaryKeys.length > 0 ? <RenderList /> : <div>For Update/Delete Operation, please pick at least 1 primary key</div>}
                            </div>
                        </div>
                    </div>

                </Modal.Body>
            </Modal>
        </>
    );
}

export default PkEditModal;