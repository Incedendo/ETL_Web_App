import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { search_multi_field, search_multi_field_catalog } from '../../sql_statements';
import '../../../css/mymodal.scss';
import axios from 'axios';

import { ETLF_tables } from '../../context/FieldTypesConfig';

const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';

const SearchModal = ({database, schema, table, groupIDColumn, username, columns}) => {

    const { authState, authService } = useOktaAuth();
    
    const {
        debug,
        // database, schema, table, username,
        // columns,
        // axiosCallToGetTable,
        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);


    // console.log(groupIDColumn);

    const [show, setShow] = useState(false);

    let temp_arr = columns.map(column => column.name);
    // delete temp_arr["PRIVILEGE"];

    temp_arr.splice(temp_arr.indexOf("PRIVILEGE"),1)
    const [remainingColumns, setRemainingColumns] = useState(temp_arr);
    const [currentSearchObj, setCurrentSearchObj] = useState({});
    const [errors, setErrors] = useState({});

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
        // const searchTable = 'ETLF_SYSTEM_CONFIG';
        console.log(table);
        if (verifySearchObj()) {
            let multiSearchSqlStatement = '';
            if(ETLF_tables.indexOf(table) >= 0){
                // console.log("table is in ETLF Framework");
                multiSearchSqlStatement = search_multi_field(username, database, schema, table, groupIDColumn, currentSearchObj, start, end)
            }
            else{
                // console.log("table NOTTTTTT in ETLF Framework");
                multiSearchSqlStatement = search_multi_field_catalog(database, schema, table, currentSearchObj, start, end);
            }
                
            debug && console.log(multiSearchSqlStatement);
            axiosCallToGetTableRows( multiSearchSqlStatement );
        }
    }

    useEffect(() => {
        // debug && console.log(currentSearchObj);
        debug && console.log(remainingColumns);
    }, [remainingColumns]);

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