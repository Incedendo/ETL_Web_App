import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { search_multi_field } from '../../sql_statements';
import '../../../css/mymodal.scss';
import axios from 'axios';

const SearchModal = () => {
    const {
        debug,
        database, schema, table, username,
        searchCriteria,
        setTableSeaching,
        setRows,
    } = useContext(WorkspaceContext);

    const [show, setShow] = useState(false);

    const temp_arr = [...searchCriteria]
    const [remainingColumns, setRemainingColumns] = useState(temp_arr)
    const [currentSearchObj, setCurrentSearchObj] = useState({})
    const [errors, setErrors] = useState({})

    const handleAddSearchField = value => {
        //remove a primary keys fron the list of remaining columns
        setRemainingColumns(remainingColumns.filter(item => item !== value));
        setCurrentSearchObj({ ...currentSearchObj, [value]: '' });
    }

    const assignValueToSearchField = (field, event) => 
        setCurrentSearchObj({...currentSearchObj, [field]: event.target.value});
    

    const handleRemoveSearchField = field => {
        setRemainingColumns([...remainingColumns, field]);
        // setCurrentSearchObj(currentSearchObj.filter(field => field !== value));

        let temp = { ...currentSearchObj }
        delete (temp[field])
        debug && console.log(temp)
        setCurrentSearchObj(temp)
    }

    function verifySearchObj() {
        return true;
    }

    const multiSearch = () => {
        let start = 0;
        let end = 100;
        if (verifySearchObj()) {
            const multiSearchSqlStatement = search_multi_field(username, database, schema, table, currentSearchObj, start, end)
            debug && console.log(multiSearchSqlStatement)

            setTableSeaching(true);

            const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/search';

            return axios.get(url, {
                params: {
                    sql_statement: multiSearchSqlStatement,
                }
            })
                .then(response => {
                    // returning the data here allows the caller to get it through another .then(...)
                    debug && console.log('--------MULTI-FIELD SEARCH-------------');
                    debug && console.log(response.data);

                    const data = response.data.rows ? response.data.rows : response.data;
                    data.map(row => row.PRIVILEGE === 'rw' ? row.PRIVILEGE = "READ/WRITE" : row.PRIVILEGE = "READ ONLY")
                    setRows(data.map((row, index) => ({
                        id: index,
                        ...row
                    })
                    ));
                })
                .catch(err => {
                    debug && console.log(err);
                })
                .finally(()=>{
                    setTableSeaching(false);
                })
        }
    }

    useEffect(() => {
        debug && console.log(currentSearchObj);
    }, [currentSearchObj])

    return (
        <>
            <Button className=""
                variant="primary"
                onClick={() => {
                    setShow(true);

                }}>
                Advance Search
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
                        Multi-Field Search 
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="body-height">
                        <div className="display-flex">
                            <CustomAutoCompleteComponent
                                list={remainingColumns}
                                setTarget={val => handleAddSearchField(val)}
                                autoSuggestModalClassName="auto-suggest-box-modal"
                            />

                            <div className="search-count">
                                Search Criteria ({Object.keys(currentSearchObj).length} items)
                            </div>
                        </div>

                        <div className="searchModal-div">
                            {Object.keys(currentSearchObj).map(field =>
                                <li key={field} className="field-div">
                                    <button
                                        className="remove-button "
                                        onClick={() => handleRemoveSearchField(field)}
                                    >
                                        x
                                    </button>
                                    <span className="mr-10">{field}: </span>
                                    <input value={currentSearchObj[field]} onChange={(e) => assignValueToSearchField(field, e)} />
                                </li>)}
                            {Object.keys(currentSearchObj).length > 0
                                ? <button
                                    className="search-button btn btn-primary"
                                    onClick={multiSearch}
                                >
                                    Search
                                </button>
                                : ""}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default SearchModal;