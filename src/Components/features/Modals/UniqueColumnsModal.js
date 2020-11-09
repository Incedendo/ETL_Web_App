import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import { WorkspaceContext } from '../../context/WorkspaceContext';

import '../../../css/mymodal.scss';

const UniqueColumnsModal = () => {
    const {
        debug,
        searchCriteria,
        rows,
        primaryKeys,
        uniqueCols, setUniqueCols,
        uniqueColumnsObj, setUniqueColumnsObj,
    } = useContext(WorkspaceContext);

    const temp_arr = [...searchCriteria]
    debug && console.log(temp_arr)

    const [show, setShow] = useState(false);
    const [remainingColumns, setRemainingColumns] = useState([])
    debug && console.log('remaining columns: ', remainingColumns);

    useEffect(() => {
        setRemainingColumns(temp_arr.filter(item => primaryKeys.indexOf(item) < 0))
    }, [primaryKeys])

    //a function that checks if an array contains all unique values
    const getUniqueValsFromColumn = (column) => {
        debug && console.log('getting unique vals from column: ', column);
        return [...new Set(rows.map(row => row[column]))];
    }

    const handleAddNewColumn = value => {
        //remove a column name fron the list of remaining columns
        setRemainingColumns(remainingColumns.filter(item => item !== value));
        setUniqueCols([...uniqueCols, value])

        //shallow copy of uniqueColumnsObj and add a new value element
        // setUniqueColumnsObj({...uniqueColumnsObj, value: [])}
        
        //deep copy of uniqueColumnsObj and add a new value element
        const newObj = Object.assign({}, uniqueColumnsObj)
        newObj[value] = getUniqueValsFromColumn(value)
        setUniqueColumnsObj(newObj)
    }

    const handleRemoveItem = value => {
        setUniqueCols(uniqueCols.filter(item => item !== value))
        setRemainingColumns([...remainingColumns, value]);
        
        const newObj = Object.assign({}, uniqueColumnsObj)
        if(delete newObj[value]){
            setUniqueColumnsObj(newObj)
        }

        // [failed code]: tried to change the state directly
        // setUniqueColumnsObj(prevState => {
        //     delete prevState[value];
        //     return prevState;
        // })
    }

    const RenderList = () => (
        <>
            {uniqueCols.map(col =>
                <div key={col} className="display-flex">
                    <button
                        className="remove-button"
                        onClick={() => handleRemoveItem(col)}
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
                        Unique Columns Configuration
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="body-height">
                        <div className="display-flex">
                            <CustomAutoCompleteComponent
                                list={remainingColumns}
                                setTarget={column => handleAddNewColumn(column)}
                                autoSuggestModalClassName="auto-suggest-box-modal"
                            />
                            
                            <div style={{ 'marginLeft': '10px' }}>
                                <span style={{ 'fontWeight': 'bold' }}>Unique Column ({uniqueCols.length} items):</span>
                                {uniqueCols.length > 0 ? <RenderList /> : <div>Enter a column name in the box to activate</div>}
                            </div>
                        </div>
                    </div>

                </Modal.Body>
            </Modal>
        </>
    );
}

export default UniqueColumnsModal;