import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Select from 'react-select';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import { 
    getSearchFieldValue, search_multi_field, 
    search_multi_field_catalog, 
    search_multi_field_catalog_DataSteward,
    search_multi_field_catalog_DataDomain,
    search_ItemsLineage_joined_Entity_Domain, 
    search_composite_DATA_STEWARD_DOMAIN, 
    search_composite_CATALOG_ENTITY_DOMAIN ,
    search_CATALOG_ENTITIES_JOINED_DOMAIN
} from '../../sql_statements';
import { 
    select_all_etl_tables,
    select_all_DATA_STEWARD_DOMAIN,
    select_all_CATALOG_ENTITY_DOMAIN,
    select_all_multi_field_catalog,
    select_all_multi_field_catalog_with_Extra_columns_joined
} from '../../SQL_Operations/selectAll';

import '../../../css/searchModal.scss';
import '../../../css/mymodal.scss';
import '../DataCatalog/customStyleDropdown.js';

import { ETLF_tables } from '../../context/FieldTypesConfig';

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
        columnsLoaded,
        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);

    const [show, setShow] = useState(false);
    // console.log("search columns: " + searchFieldsFromDropdownArr);
    const [remainingColumns, setRemainingColumns] = useState([]);
    const [currentSearchObj, setCurrentSearchObj] = useState({});
    const [options, setOptions] = useState({});

    const caseAdmin = `'READ/WRITE' as PRIVILEGE`;
    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;
    const caseOperator = `CASE
        WHEN AA.USERNAME IS NOT NULL
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let privilegeLogic = ``;

    useEffect(()=>{
        if(debug){
            // console.log(username);
            // console.log(currentSearchObj);
            console.log(table);
            console.table(columns);
        }
        if(columnsLoaded){
            // console.log("COLUMN LOADED!!!!!!");
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

            // if(table !== 'ETLF_EXTRACT_CONFIG' && table !== 'ETLF_CUSTOM_CODE' && table !== 'ETLFCALL'){
            //     setShow(shown);
            // }
            setShow(shown);
        }else{
            console.log("column not yet loaded in config...")
        }
    }, [columnsLoaded]);

    // useEffect(() =>{
    //     if( remainingColumns.length > 0){
    //         console.log("remaining columns:...");
    //         console.table(remainingColumns)
            
    //     }
    // }, [remainingColumns]);

    // useEffect(() =>{
    //     let searchFieldsFromDropdownArr = (Object.keys(compositeTables)).indexOf(table) < 0
    //     ? columns.map(column => column.name)
    //     : columns;

    //     if(table === 'CATALOG_ENTITY_DOMAIN' || table === 'CATALOG_ENTITIES'
    //         || table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'
    //     ){
    //         if(searchFieldsFromDropdownArr.indexOf("TARGET_TABLE") < 0)
    //             searchFieldsFromDropdownArr.unshift('TARGET_TABLE');
    //         if(searchFieldsFromDropdownArr.indexOf("TARGET_SCHEMA") < 0)
    //             searchFieldsFromDropdownArr.unshift('TARGET_SCHEMA');
    //         if(searchFieldsFromDropdownArr.indexOf("TARGET_DATABASE") < 0) 
    //             searchFieldsFromDropdownArr.unshift('TARGET_DATABASE');
    //         if(searchFieldsFromDropdownArr.indexOf("DOMAIN") < 0)
    //             searchFieldsFromDropdownArr.unshift('DOMAIN');
    //         if(searchFieldsFromDropdownArr.indexOf('CATALOG_ENTITIES') > -1)
    //             searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf('CATALOG_ENTITIES'),1);
    //     }
        
    //     for(let item of nonSearchableColumns){
    //         if(searchFieldsFromDropdownArr.indexOf(item) > -1)
    //             searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf(item),1);
    //     }

    //     setRemainingColumns(searchFieldsFromDropdownArr);
    // }, [])

    // if(searchFieldsFromDropdownArr.indexOf("PRIVILEGE") > -1)
    //     searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf("PRIVILEGE"),1);
    // if(searchFieldsFromDropdownArr.indexOf("CREATEDDATE") > -1)
    //     searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf("CREATEDDATE"),1);
    // if(searchFieldsFromDropdownArr.indexOf("LASTMODIFIEDDATE") > -1)
    //     searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf("LASTMODIFIEDDATE"),1);

    // useEffect(() =>{
    //     if( (Object.keys(currentSearchObj) !== 0)){
    //         console.log("setting current search criteria... in Search modal")
    //         setCurrentSearchCriteria(Object.keys(currentSearchObj));
    //     }
    // }, [currentSearchObj]);

    const handleAddSearchField = value => {
        //remove a primary keys fron the list of remaining columns
        // let currentSearchKeys = Object.keys(currentSearchObj);
        // currentSearchKeys.push(value);

        setRemainingColumns(remainingColumns.filter(item => item !== value));
        setCurrentSearchObj({ ...currentSearchObj, [value]: '' });
        setOptions(options.filter(item => item.value != value));
    }

    const assignValueToSearchField = (field, event) => {
        setCurrentSearchObj({...currentSearchObj, [field]: event.target.value.toUpperCase().trim()});
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

    function verifySearchObj() {
        return true;
    }

    const multiSearch = () => {
        let start = 0;
        let end = 100;
        // const searchTable = 'ETLF_SYSTEM_CONFIG';
        console.log(table);
        // if (verifySearchObj()) {
        setCurrentSearchCriteria(currentSearchObj);

        console.log(currentSearchObj);
        // return;

        let uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];
        let multiSearchSqlStatement = '';
        if(ETLF_tables.indexOf(table) >= 0){
            // console.log("table is in ETLF Framework");
            if(table === 'ETLF_CUSTOM_CODE'){
                multiSearchSqlStatement = `SELECT EEC.SOURCE_TABLE, EC.*, COALESCE (EAA.PRIVILEGE, 'READ ONLY') AS PRIVILEGE
                FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE" EC
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EEC
                ON (EC.EXTRACT_CONFIG_ID = EEC.EXTRACT_CONFIG_ID)
                LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" EAA
                ON (EEC.GROUP_ID = EAA.APP_ID)
                WHERE ` + getSearchFieldValue(currentSearchObj);
            }
            else if(table === 'ETLFCALL' && ('GROUP_ID' in currentSearchObj) ){

                //update 'GROUP_ID'  to 'WORK_GROUP_ID' in searchObject
                let newSearchObj = {}
                Object.keys(currentSearchObj).map(col => col !== 'GROUP_ID' 
                    ? newSearchObj[col] = currentSearchObj[col]
                    : newSearchObj['WORK_GROUP_ID'] = currentSearchObj[col]
                )

                multiSearchSqlStatement = search_multi_field(username, database, schema, table, groupIDColumn, newSearchObj, start, end);
            }else{
                multiSearchSqlStatement = search_multi_field(username, database, schema, table, groupIDColumn, currentSearchObj, start, end);
            }
        }else if(table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else if(isSteward){
                privilegeLogic = caseSteward;
            }else{
                privilegeLogic = caseOperator;
            }
            multiSearchSqlStatement = search_ItemsLineage_joined_Entity_Domain(privilegeLogic, table, currentSearchObj); 
        }else if(table === 'DATA_STEWARD_DOMAIN'){
            multiSearchSqlStatement = search_composite_DATA_STEWARD_DOMAIN(currentSearchObj);
        }else if(table === 'CATALOG_ENTITY_DOMAIN'){
            multiSearchSqlStatement = search_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
        }else if(table === 'CATALOG_ENTITIES'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else if(isSteward){
                privilegeLogic = caseSteward;
            }else{
                privilegeLogic = caseOperator;
            }
            multiSearchSqlStatement = search_CATALOG_ENTITIES_JOINED_DOMAIN(privilegeLogic, currentSearchObj);
        }else if(table === 'DATA_STEWARD'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else{
                privilegeLogic = `CASE
                    WHEN ec.EMAIL = UPPER(TRIM('` + username + `'))
                    THEN 'READ/WRITE'
                    ELSE 'READ ONLY'
                END AS PRIVILEGE`;
            }
            multiSearchSqlStatement = search_multi_field_catalog_DataSteward(privilegeLogic, database, schema, table, currentSearchObj, start, end);
        }else if(table === 'DATA_DOMAIN'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else{
                privilegeLogic = caseSteward;
            }
            multiSearchSqlStatement = search_multi_field_catalog_DataDomain(privilegeLogic, database, schema, table, currentSearchObj, start, end);
        }
        // else{
        //     multiSearchSqlStatement = search_multi_field_catalog(privilegeLogic, database, schema, table, currentSearchObj, start, end);
        // }
            
        debug && console.log(multiSearchSqlStatement);

        // console.log(primaryKey);
        axiosCallToGetTableRows( multiSearchSqlStatement , uniqueKeysToSeparateRows );
        setShow(false);
        // }
    }

    const selectAll = () => {
        setCurrentSearchCriteria({});
        let start = 0;
        let end = 100;
        // const searchTable = 'ETLF_SYSTEM_CONFIG';
        console.log(table);
        if (verifySearchObj()) {
            let uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];
            let selectAllStmt = '';

            if(ETLF_tables.indexOf(table) >= 0){
                // console.log("table is in ETLF Framework");
                selectAllStmt = select_all_etl_tables(username, database, schema, table, groupIDColumn, currentSearchObj, start, end)
            }
            else if(table === 'CATALOG_ENTITIES'){

                if(isAdmin){
                    privilegeLogic = caseAdmin;
                }else if(isSteward){
                    privilegeLogic = caseSteward;
                }else{
                    privilegeLogic = caseOperator;
                }
                // selectAllStmt = select_all_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
                // searchStmt = sql_linking_catalogEntities_To_dataDomain(searchObj);\

                //------should be data stewards AND operators
                selectAllStmt = `SELECT C.DOMAIN, C.DATA_DOMAIN_ID, E.*, ` + privilegeLogic + `
                FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
                ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION AA
                ON (AA.DOMAIN = C.DOMAIN)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
                ON (DSD.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
                ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID);`;
            }else if( table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE' ){

                if(isAdmin){
                    privilegeLogic = caseAdmin;
                }else if(isSteward){
                    privilegeLogic = caseSteward;
                }else{
                    privilegeLogic = caseOperator;
                }

                selectAllStmt = `SELECT C.DOMAIN, E.TARGET_DATABASE, E.TARGET_SCHEMA, E.TARGET_TABLE, I.*, ` + privilegeLogic + `
                FROM SHARED_TOOLS_DEV.ETL.` + table + ` I
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
                ON (I.CATALOG_ENTITIES_ID = E.CATALOG_ENTITIES_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
                ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION AA
                ON (AA.DOMAIN = C.DOMAIN)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
                ON (DSD.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
                ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID);`;
            }
            //---------------------------------ONLY ADMIN---------------------------------------
            else if(table === 'DATA_STEWARD'){
                // console.log("table NOTTTTTT in ETLF Framework");
                if(isAdmin){
                    privilegeLogic = caseAdmin;
                }else{
                    privilegeLogic = caseSteward;
                }

                selectAllStmt = `SELECT DS.*, ` + privilegeLogic + `
                FROM "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD" DS;`;
            }
            //---------------------------------STEWARD---------------------------------------
            else if(table === 'DATA_DOMAIN'){

                if(isAdmin){
                    privilegeLogic = caseAdmin;
                }else{
                    privilegeLogic = caseSteward;
                }

                selectAllStmt = `SELECT DD.*, ` + privilegeLogic + `
                FROM "SHARED_TOOLS_DEV"."ETL"."DATA_DOMAIN" DD
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
                ON (DSD.DATA_DOMAIN_ID = DD.DATA_DOMAIN_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
                ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID);`

                // CASE
                //     WHEN '` + username +`' IN (
                //         // SELECT EMAIL
                //         // FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD
                //         SELECT EMAIL FROM
                //         (
                //             SELECT EMAIL FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD
                //             UNION
                //             SELECT USERNAME FROM SHARED_TOOLS_DEV.ETL.DATCAT_ADMIN
                //         )
                //     ) THEN 'READ/WRITE'
                //     ELSE 'READ ONLY'
                // END AS PRIVILEGE
            }else if(table === 'DATA_STEWARD_DOMAIN'){
                selectAllStmt = select_all_DATA_STEWARD_DOMAIN;
            }else if(table === 'CATALOG_ENTITY_DOMAIN'){
                selectAllStmt = select_all_CATALOG_ENTITY_DOMAIN;
            }
                
            // debug && console.log(selectAllStmt);

            // console.log(primaryKey);
            axiosCallToGetTableRows( selectAllStmt , uniqueKeysToSeparateRows );
            setShow(false);
        }
    }

    // useEffect(() => {
    //     // debug && console.log(currentSearchObj);
    //     // debug && console.log(remainingColumns);
    // }, [remainingColumns]);

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

                            {/* <DropdownButton
                                id="dropdown-basic-button"
                                size="sm"
                                title={'Select Search Field'}
                                disabled={!remainingColumns.length}
                            >
                                {remainingColumns.map(val => (
                                    <Dropdown.Item 
                                        as="button" 
                                        key={val}
                                        onSelect={()=>{handleAddSearchField(val.value)}}
                                    >
                                        {val}
                                    </Dropdown.Item>
                                )
                                )}
                            </DropdownButton> */}

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
                                        console.log(val);
                                        handleAddSearchField(val.value);
                                    }}
                                />
                            </div>

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
                                        
                                        {/* <a onClick={() => handleRemoveSearchField(field)}>
                                            <img src={xIcon} />
                                        </a> */}
                                    </li>
                                )}
                            </div>
                            
                            <div style={{'display': 'flex'}}>
                                {Object.keys(currentSearchObj).length > 0
                                    // ? <button
                                    //     className="search-button btn btn-primary"
                                    //     onClick={multiSearch}
                                    // >
                                    //     Search
                                    // </button>
                                    ? <div style={{
                                        'marginLeft': 'auto',
                                        'marginRight': 'auto'
                                    }}>
                                    <Button 
                                        variant="outline-primary"
                                        onClick={multiSearch}
                                    >
                                        Search
                                    </Button>
                                </div>
                                : ""}
                            </div>
                            
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SearchModal;


// res += `AND UPPER(TRIM(' + 'ec.` + item + `)) LIKE UPPER('%` + surroundWithQuotesIfString(currentSearchObj[item]) + `%'`;