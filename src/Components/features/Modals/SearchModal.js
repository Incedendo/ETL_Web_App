import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';

import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, ETLF_tables } from '../../context/FieldTypesConfig';
import { startingLo, selectCount } from '../../context/privilege';
import { getSelectAllObjDatCat } from '../../sql_statements';
import { select_all_etl_tables_body, selectAllFromSQL } from '../../SQL_Operations/selectAll';

import '../../../css/searchModal.scss';
import '../../../css/mymodal.scss';
import '../DataCatalog/customStyleDropdown.js';

// import makeAnimated from 'react-select/animated';

const nonSearchableColumns = [
    'EDITABLE','PRIVILEGE','CREATEDDATE','LASTMODIFIEDDATE',
    'DATA_STEWARD_ID', "DATA_DOMAIN_ID", 'CATALOG_ENTITIES_ID',
    'CATALOG_ITEMS_ID', 'CATALOG_ENTITY_LINEAGE_ID', 'CATALOG_ENTITIES',
    'CUSTOM_CODE_ID', 'CREATEDDT', 'LASTMODIFIEDDT'
];

const SearchModal = ({ groupIDColumn, shown, setCurrentSearchCriteria}) => {
    
    const {
        debug,
        username,
        database, schema, table, 
        columns,
        axiosCallToGetCountsAndTableRows, 
        steps, setSteps,
        clearLoHi, setSelectAllStmtEveryX, 
        multiSearch,
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);

    const [show, setShow] = useState(false);
    // debug && console.log("search columns: " + searchFieldsFromDropdownArr);
    const [remainingColumns, setRemainingColumns] = useState([]);
    const [currentSearchObj, setCurrentSearchObj] = useState({});
    const [options, setOptions] = useState({});

    
    const [error, setError] = useState('');

    useEffect(()=>{
        if(debug){
            console.log(table);
            console.log(columns);
        }

        let searchFieldsFromDropdownArr = columns.map(column => column.name)

        // console.table(searchFieldsFromDropdownArr);
        
        for(let item of nonSearchableColumns){
            if(searchFieldsFromDropdownArr.indexOf(item) > -1)
                searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf(item),1);
        }

        if(table === 'ETLF_CUSTOM_CODE'){
            searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf('SOURCE_TABLE'),1);
        }

        // console.table(searchFieldsFromDropdownArr);

        setRemainingColumns([]);
        setRemainingColumns(searchFieldsFromDropdownArr);

        let colOptions = []
        searchFieldsFromDropdownArr.map(col => colOptions.push({
            value: col,
            label: col
        }))

        setOptions(colOptions);

        if(shown) setShow(shown);
    }, [table, columns]);


    const handleAddSearchField = value => {

        setRemainingColumns(remainingColumns.filter(item => item !== value));
        setCurrentSearchObj({ ...currentSearchObj, [value]: '' });
        setOptions(options.filter(item => item.value != value));
    }

    const assignValueToSearchField = (field, event) => {
        setCurrentSearchObj({...currentSearchObj, [field]: event.target.value.toUpperCase()});
    }

    const handleRemoveSearchField = field => {
        setRemainingColumns([...remainingColumns, field]);
        // setCurrentSearchObj(currentSearchObj.filter(field => field !== value));

        let temp = { ...currentSearchObj }
        delete (temp[field])
        debug && console.log(temp)
        setCurrentSearchObj(temp);

        setOptions([...options, {
            value: field,
            label: field
        }]);
    }   

    const selectAll = () => {
        
        clearLoHi();
        setCurrentSearchCriteria({});
        debug && console.log(table);

        let uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];
        let selectAllStmtFirstX = '';
        let selectAllFrom = ``;
        let selectCountAllStmt = ``;
        let bodySQL = ``;
        
        if(ETLF_tables.indexOf(table) >= 0){
            // debug && console.log("table is in ETLF Framework");
            bodySQL = select_all_etl_tables_body(username, database, schema, table, groupIDColumn, currentSearchObj);
            selectAllFrom = selectAllFromSQL(username, database, schema, table, groupIDColumn, currentSearchObj);
        }
        else{
            const selectAllObj = getSelectAllObjDatCat(isAdmin, isSteward, username, table);
            bodySQL = selectAllObj.bodySQL;
            selectAllFrom = selectAllObj.selectAllFrom;
        } 
        selectCountAllStmt = selectCount + bodySQL;
        setSelectAllStmtEveryX(selectAllFrom);

        selectAllStmtFirstX = selectAllFrom +`
        WHERE RN >= ` + startingLo +` AND RN <= ` + steps;

        debug && console.log(selectAllStmtFirstX);
        axiosCallToGetCountsAndTableRows(selectCountAllStmt, selectAllStmtFirstX, uniqueKeysToSeparateRows);
        
        setShow(false); 
    }

    const CriteriaDropdownSelect = () => {
        return(
            // <DropdownButton
            //     id="dropdown-basic-button"
            //     size="sm"
            //     title={'Select Search Field'}
            //     disabled={!remainingColumns.length}
            // >
            //     {remainingColumns.map(val => (
            //         <Dropdown.Item 
            //             as="button" 
            //             key={val}
            //             onSelect={()=>{handleAddSearchField(val.value)}}
            //         >
            //             {val}
            //         </Dropdown.Item>
            //     )
            //     )}
            // </DropdownButton>

            <div className="criteriaDropDown">
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    // components={animatedComponents}
                    defaultValue={options[0]}
                    name="color"
                    // isMulti
                    options={options}
                    onChange={(val)=>{
                        debug && console.log(val);
                        handleAddSearchField(val.value);
                    }}
                />
            </div>
        ) 
    }

    const ShowAllButton = () => {
        return(
            <div 
                style={{
                    'position': 'absolute',
                    'right': '18px'
                }}>
                <Button variant="outline-warning" 
                    onClick={selectAll}>
                        Show All
                </Button>
            </div>
        )
    }

    const RemoveSearchFieldButton = ({field}) => {
        return (
            <div className="closeButtonDiv">
                <Button 
                    style={{
                        position: 'relative',
                        height: '1.85rem',
                        width: '1.85rem',
                        borderRadius: '0px 4px 4px 0px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '25px',
                        marginLeft: '-1px',
                        borderColor: '#cccccc',
                    }}
                    variant="outline-danger" 
                    onClick={() => handleRemoveSearchField(field)}
                >
                    {/* <img src={xIcon} /> */}
                    <span className="closeSpan">x</span>
                </Button>
            </div>
        )
    }

    const SearchButton = () => {
        return(
            <div style={{'display': 'flex'}}>
                {Object.keys(currentSearchObj).length > 0
                    ? <div style={{
                        'marginLeft': 'auto',
                        'marginRight': 'auto'
                    }}>
                    <Button 
                        variant="outline-primary"
                        onClick={() => {
                            multiSearch(isAdmin, isSteward, groupIDColumn, currentSearchObj, setCurrentSearchCriteria);
                            setShow(false);
                        }}
                    >
                        Search
                    </Button>
                </div>
                : ""}
            </div>
        )
    }

    const SearchSizeComp = () => { 

        return(
            <div>
                <li key={'searchIncrement'} className="field-div">
                    <span className="mr-10 field-width">
                        Search in increments of: 
                    </span>
                    <input
                        className="searchInput"
                        placeholder={'enter a number here'} 
                        value={localSteps} 
                        onChange={e => setLocalSteps(e.target.value)} 
                    />
                    <div className="closeButtonDiv">
                        <Button 
                            style={{
                                position: 'relative',
                                height: '1.85rem',
                                width: '1.85rem',
                                borderRadius: '0px 4px 4px 0px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '25px',
                                marginLeft: '-1px',
                                borderColor: '#cccccc',
                                fontSize: '15px',
                            }}
                            variant="outline-danger" 
                            disabled={error!==''}
                            onClick={() => setSteps(parseInt(localSteps))}
                        >
                            {/* <img src={xIcon} /> */}
                            <span className="closeSpan">Set</span>
                        </Button>
                    </div>
                </li>
                {error !== '' && <span style={{color: 'red', fontWeight: 'bold'}}>Please enter only numeric value</span>}
            </div>
        )
    }

    return (
        <div style={{float: "left", marginRight: "20px"}}>
            <Button className=""
                variant="outline-primary"
                onClick={() => {
                    setShow(true);
                }}>
                Search
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
                        Multi-Field Search for table {table}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="body-height">
                        <div className="display-flex">
                            {/* <CustomAutoCompleteComponent
                                list={remainingColumns}
                                setTarget={val => handleAddSearchField(val)}
                                autoSuggestModalClassName="auto-suggest-box-modal"
                            /> */}

                            <div className="search-count">
                                {/* Search Criteria ({Object.keys(currentSearchObj).length} items) */}
                                {/* Total columns remaining: ({remainingColumns.length} items) */}
                                Select search criteria ({remainingColumns.length} items) from list:
                            </div>

                            <CriteriaDropdownSelect />

                            <ShowAllButton />

                        </div>

                        <div className="searchModal-div">
                            <div className="searchFieldsDiv">
                                {Object.keys(currentSearchObj).map(field =>
                                    <li key={field} className="field-div">
                                        <span className="mr-10 field-width">
                                            {field}: 
                                        </span>
                                        <input
                                            className="searchInput"
                                            placeholder={'enter search value here'} 
                                            value={currentSearchObj[field]} 
                                            onChange={(e) => assignValueToSearchField(field, e)} 
                                        />
                                        <RemoveSearchFieldButton field={field} />
                                        
                                    </li>
                                )}
                            </div>

                            <SearchButton />
                            
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SearchModal;


// res += `AND UPPER(TRIM(' + 'ec.` + item + `)) LIKE UPPER('%` + surroundWithQuotesIfString(currentSearchObj[item]) + `%'`;