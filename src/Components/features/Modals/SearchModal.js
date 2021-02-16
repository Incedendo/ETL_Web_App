import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Select from 'react-select';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, ETLF_tables } from '../../context/FieldTypesConfig';
import { steps } from '../../context/privilege';
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
    select_all_etl_tables_body, selectAllFromSQL,
    select_all_DATA_STEWARD_DOMAIN,
    select_all_CATALOG_ENTITY_DOMAIN,
    select_all_multi_field_catalog,
    select_all_multi_field_catalog_with_Extra_columns_joined
} from '../../SQL_Operations/selectAll';

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

const startingLo = 1;
const startingHi = steps;

const SearchModal = ({ groupIDColumn, shown, setCurrentSearchCriteria}) => {
    
    const {
        debug,
        username,
        database, schema, table, 
        columns,
        axiosCallToGetTableRows,
        axiosCallToGetCountsAndTableRows, 
        clearLoHi, setSelectAllStmtEveryX
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);

    const [show, setShow] = useState(false);
    // console.log("search columns: " + searchFieldsFromDropdownArr);
    const [remainingColumns, setRemainingColumns] = useState([]);
    const [currentSearchObj, setCurrentSearchObj] = useState({});
    const [options, setOptions] = useState({});
    

    const selectCount = `SELECT COUNT(*) as COUNT`;
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
        setShow(shown);
    }, [table, columns]);

    const handleAddSearchField = value => {

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
        clearLoHi();
        let start = 0;
        let end = 0;
        // const searchTable = 'ETLF_SYSTEM_CONFIG';
        console.log(table);
        // if (verifySearchObj()) {
        setCurrentSearchCriteria(currentSearchObj);

        console.log(currentSearchObj);

        let uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];
        let getRowsCount = '';
        let multiSearchSqlStatement = '';
        let multiSearchSqlStatementFirstX = '';
        let bodySQL = ``;
        let selectCriteria = ``;
        
        if(ETLF_tables.indexOf(table) >= 0){
            // console.log("table is in ETLF Framework");
            if(table === 'ETLF_CUSTOM_CODE'){
                bodySQL = `
                FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE" EC
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EEC
                ON (EC.EXTRACT_CONFIG_ID = EEC.EXTRACT_CONFIG_ID)
                LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" EAA
                ON (EEC.GROUP_ID = EAA.APP_ID)
                WHERE ` + getSearchFieldValue(currentSearchObj);

                selectCriteria = `SELECT EEC.SOURCE_TABLE, EC.*, COALESCE (EAA.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, row_number() OVER(ORDER BY EC.CUSTOM_CODE_ID ASC) rn`;
            }
            else if(table === 'ETLFCALL' && ('GROUP_ID' in currentSearchObj) ){

                //update 'GROUP_ID'  to 'WORK_GROUP_ID' in searchObject
                let newSearchObj = {}
                Object.keys(currentSearchObj).map(col => col !== 'GROUP_ID' 
                    ? newSearchObj[col] = currentSearchObj[col]
                    : newSearchObj['WORK_GROUP_ID'] = currentSearchObj[col]
                )

                bodySQL = search_multi_field(username, database, schema, table, groupIDColumn, newSearchObj, start, end);
                selectCriteria = `SELECT ec.*, ec.WORK_GROUP_ID AS GROUP_ID, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
                row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn`;
            }else{
                bodySQL = search_multi_field(username, database, schema, table, groupIDColumn, currentSearchObj, start, end);
                selectCriteria = `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
                row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn`;
            }
        }else if(table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else if(isSteward){
                privilegeLogic = caseSteward;
            }else{
                privilegeLogic = caseOperator;
            }

            bodySQL = search_ItemsLineage_joined_Entity_Domain(privilegeLogic, table, currentSearchObj)
            selectCriteria = `SELECT J.DOMAINS AS DOMAIN, J.*`;            

            // multiSearchSqlStatement = search_ItemsLineage_joined_Entity_Domain(privilegeLogic, table, currentSearchObj); 
        }else if(table === 'DATA_STEWARD_DOMAIN'){
            bodySQL = search_composite_DATA_STEWARD_DOMAIN(currentSearchObj);
            selectCriteria = `SELECT C1.FNAME, C1.LNAME, C1.EMAIL, C1.DATA_STEWARD_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, row_number() OVER(ORDER BY C1.DATA_STEWARD_ID ASC) RN`;
        }else if(table === 'CATALOG_ENTITY_DOMAIN'){
            bodySQL = search_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
            selectCriteria = `SELECT C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, row_number() OVER(ORDER BY C1.CATALOG_ENTITIES_ID ASC) RN`;
        }else if(table === 'CATALOG_ENTITIES'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else if(isSteward){
                privilegeLogic = caseSteward;
            }else{
                privilegeLogic = caseOperator;
            }

            bodySQL = search_CATALOG_ENTITIES_JOINED_DOMAIN(privilegeLogic, currentSearchObj);
            selectCriteria = `SELECT J.DOMAINS AS DOMAIN, J.*`
            
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
            bodySQL = search_multi_field_catalog_DataSteward(privilegeLogic, currentSearchObj);
            selectCriteria = `SELECT *`;
        }else if(table === 'DATA_DOMAIN'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else{
                privilegeLogic = caseSteward;
            }
            bodySQL = search_multi_field_catalog_DataDomain(privilegeLogic, currentSearchObj);
            selectCriteria = `SELECT *`;
        }
        // else{
        //     multiSearchSqlStatement = search_multi_field_catalog(privilegeLogic, database, schema, table, currentSearchObj, start, end);
        // }
            
        // debug && console.log(multiSearchSqlStatement);

        //------------------------new logic with X rows---------------------------------------------
        //
        getRowsCount = selectCount + bodySQL;
        multiSearchSqlStatement = `SELECT * FROM (
            ` + selectCriteria + `
            ` + bodySQL + `    
        )
        `;
        setSelectAllStmtEveryX(multiSearchSqlStatement);
        multiSearchSqlStatementFirstX = multiSearchSqlStatement +`
        WHERE RN >= ` + startingLo +` AND RN <= ` + startingHi;

        console.log(getRowsCount);
        console.log(multiSearchSqlStatementFirstX);

        axiosCallToGetCountsAndTableRows(getRowsCount, multiSearchSqlStatementFirstX, uniqueKeysToSeparateRows);
        setShow(false);

        //------------------------OLD LOGIC---------------------------------------------
        // console.log(primaryKey);
        // axiosCallToGetTableRows( multiSearchSqlStatement , uniqueKeysToSeparateRows );
        // setShow(false);
        // }
    }



    const selectAll = () => {
        setCurrentSearchCriteria({});
        clearLoHi();
        let start = 0;
        let end = 100;
        // const searchTable = 'ETLF_SYSTEM_CONFIG';
        console.log(table);
        if (verifySearchObj()) {
            let uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];
            let selectAllStmtFirstX = '';
            let selectAllFrom = ``;
            let selectCountAllStmt = ``;
            let bodySQL = ``;
            
            if(ETLF_tables.indexOf(table) >= 0){
                // console.log("table is in ETLF Framework");
                bodySQL = select_all_etl_tables_body(username, database, schema, table, groupIDColumn, currentSearchObj);
                selectAllFrom = selectAllFromSQL(username, database, schema, table, groupIDColumn, currentSearchObj);
                // setSelectAllStmtEveryX(selectAllFrom);
                // // console.log(selectAllFrom);

                // // selectAllStmtFirstX = select_all_etl_tables(username, database, schema, table, groupIDColumn, currentSearchObj);
                // selectCountAllStmt = selectCount + bodySQL;
                // selectAllStmtFirstX = selectAllFrom +`
                // WHERE RN >= ` + startingLo +` AND RN <= ` + startingHi;
                
                // console.log(selectCountAllStmt);
                // console.log(selectAllStmtFirstX);
                // axiosCallToGetCountsAndTableRows(selectCountAllStmt, selectAllStmtFirstX, uniqueKeysToSeparateRows);
                // axiosCallToGetTableRows( selectAllStmtFirstX , uniqueKeysToSeparateRows );
            }
            else{
                
                if(table === 'CATALOG_ENTITIES'){

                    if(isAdmin){
                        privilegeLogic = caseAdmin;
                    }else if(isSteward){
                        privilegeLogic = caseSteward;
                    }else{
                        privilegeLogic = caseOperator;
                    }
                    // selectAllStmtFirstX = select_all_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
                    // searchStmt = sql_linking_catalogEntities_To_dataDomain(searchObj);\
    
                    //------should be data stewards AND operators
    
                    bodySQL = `
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
                    ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)`;
                    
                    selectAllFrom = `SELECT * FROM (
                        SELECT C.DOMAIN, C.DATA_DOMAIN_ID, E.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY E.CATALOG_ENTITIES_ID ASC) RN` 
                        + bodySQL +`
                    )`;
                }else if( table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE' ){
    
                    if(isAdmin){
                        privilegeLogic = caseAdmin;
                    }else if(isSteward){
                        privilegeLogic = caseSteward;
                    }else{
                        privilegeLogic = caseOperator;
                    }
                    const tableKey = table === 'CATALOG_ITEMS' ? 'CATALOG_ITEMS_ID' : 'CATALOG_ENTITY_LINEAGE_ID'
                    bodySQL = `
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
                    ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)`;

                    selectAllFrom = `SELECT * FROM (
                        SELECT C.DOMAIN, E.TARGET_DATABASE, E.TARGET_SCHEMA, E.TARGET_TABLE, I.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY I.`+ tableKey +` ASC) RN`
                        + bodySQL +`
                    )`;
                }
                //---------------------------------ONLY ADMIN---------------------------------------
                else if(table === 'DATA_STEWARD'){
                    // console.log("table NOTTTTTT in ETLF Framework");
                    if(isAdmin){
                        privilegeLogic = caseAdmin;
                    }else{
                        privilegeLogic = caseSteward;
                    }
                    
                    bodySQL = `
                    FROM "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD" DS`;
                    
                    selectAllFrom = `SELECT * FROM (
                        SELECT DS.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DS.DATA_STEWARD_ID ASC) RN` 
                        + bodySQL + `
                    )`;
                }
                //---------------------------------STEWARD---------------------------------------
                else if(table === 'DATA_DOMAIN'){
    
                    if(isAdmin){
                        privilegeLogic = caseAdmin;
                    }else{
                        privilegeLogic = caseSteward;
                    }
    
                    bodySQL = `
                    FROM "SHARED_TOOLS_DEV"."ETL"."DATA_DOMAIN" DD
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
                    ON (DSD.DATA_DOMAIN_ID = DD.DATA_DOMAIN_ID)
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
                    ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)`;
    
                    selectAllFrom = `SELECT * FROM (
                        SELECT DD.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN`
                        + bodySQL + `
                    )`;
    
                }else if(table === 'DATA_STEWARD_DOMAIN'){
    
                    bodySQL = `
                    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN E
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD B 
                    ON (E.DATA_STEWARD_ID = B.DATA_STEWARD_ID)  
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                    ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)`;
                    
                    selectAllFrom = `SELECT * FROM (
                        SELECT C.DOMAIN, B.FNAME, B.LNAME, B.EMAIL, E.*, row_number() OVER(ORDER BY E.DATA_STEWARD_ID ASC) RN`
                        + bodySQL + `
                    )`;
    
                }else if(table === 'CATALOG_ENTITY_DOMAIN'){
    
                    bodySQL = `
                    FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN E
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES B 
                    ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                    ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)`;

                    selectAllFrom = `SELECT * FROM (
                        SELECT C.DOMAIN, B.TARGET_DATABASE, B.TARGET_SCHEMA, B.TARGET_TABLE, E.*, row_number() OVER(ORDER BY E.CATALOG_ENTITIES_ID ASC) RN`
                        + bodySQL + `
                    )`;
                }
            } 
            selectCountAllStmt = selectCount + bodySQL;
            setSelectAllStmtEveryX(selectAllFrom);

            selectAllStmtFirstX = selectAllFrom +`
            WHERE RN >= ` + startingLo +` AND RN <= ` + startingHi;

            console.log(selectAllStmtFirstX);
            axiosCallToGetCountsAndTableRows(selectCountAllStmt, selectAllStmtFirstX, uniqueKeysToSeparateRows);
            
            setShow(false);
            // debug && console.log(selectAllStmtFirstX);

            // console.log(primaryKey);
            
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