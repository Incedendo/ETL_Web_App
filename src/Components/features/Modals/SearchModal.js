import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import { search_multi_field, 
    search_multi_field_catalog, 
    search_ItemsLineage_joined_Entity_Domain, 
    search_composite_DATA_STEWARD_DOMAIN, 
    search_composite_CATALOG_ENTITY_DOMAIN ,
    search_CATALOG_ENTITIES_JOINED_DOMAIN
} from '../../sql_statements';
import { 
    select_all_etl_tables,
    select_all_composite_DATA_STEWARD_DOMAIN,
    select_all_composite_CATALOG_ENTITY_DOMAIN,
    select_all_multi_field_catalog,
    select_all_multi_field_catalog_with_Extra_columns_joined
} from '../../SQL_Operations/selectAll';
import '../../../css/mymodal.scss';

import { ETLF_tables } from '../../context/FieldTypesConfig';
import { compositeTables } from '../../context/FieldTypesConfig';

const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';

const nonSearchableColumns = [
    'PRIVILEGE','CREATEDDATE','LASTMODIFIEDDATE',
    'DATA_STEWARD_ID', "DATA_DOMAIN_ID", 'CATALOG_ENTITIES_ID',
    'CATALOG_ITEMS_ID', 'CATALOG_ENTITY_LINEAGE_ID'
];

const SearchModal = ({database, schema, table, groupIDColumn, username, columns, shown, setCurrentSearchCriteria}) => {

    // const { authState, authService } = useOktaAuth();
    
    const {
        debug,
        // database, schema,  username,
        // columns,
        // axiosCallToGetTable,
        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);


    // console.log(groupIDColumn);

    const [show, setShow] = useState(false);

    useEffect(()=>{
        if(table !== 'ETLF_EXTRACT_CONFIG' && table !== 'ETLF_CUSTOM_CODE' && table !== 'ETLFCALL'){
            setShow(shown);
        }
    }, []);

    useEffect(() =>{
        let searchFieldsFromDropdownArr = (Object.keys(compositeTables)).indexOf(table) < 0
        ? columns.map(column => column.name)
        : columns;

        if(table === 'CATALOG_ENTITY_DOMAIN' || table === 'CATALOG_ENTITIES'
            || table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'
        ){
            if(searchFieldsFromDropdownArr.indexOf("TARGET_TABLE") < 0)
                searchFieldsFromDropdownArr.unshift('TARGET_TABLE');
            if(searchFieldsFromDropdownArr.indexOf("TARGET_SCHEMA") < 0)
                searchFieldsFromDropdownArr.unshift('TARGET_SCHEMA');
            if(searchFieldsFromDropdownArr.indexOf("TARGET_DATABASE") < 0) 
                searchFieldsFromDropdownArr.unshift('TARGET_DATABASE');
            if(searchFieldsFromDropdownArr.indexOf("DOMAIN") < 0)
                searchFieldsFromDropdownArr.unshift('DOMAIN');
            if(searchFieldsFromDropdownArr.indexOf('CATALOG_ENTITIES') > -1)
                searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf('CATALOG_ENTITIES'),1);
        }
        
        for(let item of nonSearchableColumns){
            if(searchFieldsFromDropdownArr.indexOf(item) > -1)
                searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf(item),1);
        }

        setRemainingColumns(searchFieldsFromDropdownArr);
    }, [])

    // if(searchFieldsFromDropdownArr.indexOf("PRIVILEGE") > -1)
    //     searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf("PRIVILEGE"),1);
    // if(searchFieldsFromDropdownArr.indexOf("CREATEDDATE") > -1)
    //     searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf("CREATEDDATE"),1);
    // if(searchFieldsFromDropdownArr.indexOf("LASTMODIFIEDDATE") > -1)
    //     searchFieldsFromDropdownArr.splice(searchFieldsFromDropdownArr.indexOf("LASTMODIFIEDDATE"),1);
    
    // console.log("search columns: " + searchFieldsFromDropdownArr);
    const [remainingColumns, setRemainingColumns] = useState([]);
    const [currentSearchObj, setCurrentSearchObj] = useState({});
    const [errors, setErrors] = useState({});

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
            setCurrentSearchCriteria(currentSearchObj);
            let uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];
            let multiSearchSqlStatement = '';
            if(ETLF_tables.indexOf(table) >= 0){
                // console.log("table is in ETLF Framework");
                multiSearchSqlStatement = search_multi_field(username, database, schema, table, groupIDColumn, currentSearchObj, start, end)
            }else if(table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'){
                //item and lineage tables
                // const joinedTable = joinedTableDataCatalog[table]['joinedTable'];
                // const joinedColumms = joinedTableDataCatalog[table]['joinedColumns'];
                // const joinedCriterion = joinedTableDataCatalog[table]['joinedCriterion'];

                // multiSearchSqlStatement = search_multi_field_catalog_with_Extra_columns_joined(database, schema, table, currentSearchObj, joinedTable, joinedColumms, joinedCriterion); 
                multiSearchSqlStatement = search_ItemsLineage_joined_Entity_Domain(table, currentSearchObj); 
                
            }else if((Object.keys(compositeTables)).indexOf(table) >= 0){
                if(table === 'DATA_STEWARD_DOMAIN'){
                    multiSearchSqlStatement = search_composite_DATA_STEWARD_DOMAIN(currentSearchObj);
                }else if(table === 'CATALOG_ENTITY_DOMAIN'){
                    multiSearchSqlStatement = search_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
                }
            }else if(table === 'CATALOG_ENTITIES'){
                multiSearchSqlStatement = search_CATALOG_ENTITIES_JOINED_DOMAIN(currentSearchObj);
            }   
            else{
                // console.log("table NOTTTTTT in ETLF Framework");
                multiSearchSqlStatement = search_multi_field_catalog(database, schema, table, currentSearchObj, start, end);
            }
                
            // debug && console.log(multiSearchSqlStatement);

            // console.log(primaryKey);
            axiosCallToGetTableRows( multiSearchSqlStatement , uniqueKeysToSeparateRows );
            setShow(false);
        }
    }

    const selectAll = () => {
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
                // selectAllStmt = select_all_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
                // searchStmt = sql_linking_catalogEntities_To_dataDomain(searchObj);
                selectAllStmt = `SELECT C.DOMAIN, C.DATA_DOMAIN_ID, E.*, 'READ/WRITE' AS PRIVILEGE 
                FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
                ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID);`
            }
            // else if(table === 'CATALOG_ITEMS'){
            //     searchStmt = sql_linking_catalogItems_To_catalogEntities(searchObj);
            // }else if(table === 'CATALOG_ENTITY_LINEAGE'){
            //     searchStmt = sql_linking_catalogEntityLineage_To_catalogEntities(searchObj);
            // }
            // else if((Object.keys(joinedTableDataCatalog)).indexOf(table) >= 0){
            
                // const joinedTable = joinedTableDataCatalog[table]['joinedTable'];
                // const joinedColumms = joinedTableDataCatalog[table]['joinedColumns'];
                // const joinedCriterion = joinedTableDataCatalog[table]['joinedCriterion'];
                // selectAllStmt = select_all_multi_field_catalog_with_Extra_columns_joined(database, schema, table, joinedTable, joinedColumms, joinedCriterion); 
            else if( table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE' ){
                selectAllStmt = `SELECT C.DOMAIN, E.TARGET_DATABASE, E.TARGET_SCHEMA, E.TARGET_TABLE, I.*, 'READ/WRITE' AS PRIVILEGE 
                FROM SHARED_TOOLS_DEV.ETL.` + table + ` I
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
                ON (I.CATALOG_ENTITIES_ID = E.CATALOG_ENTITIES_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
                ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID);`;

            }else if((Object.keys(compositeTables)).indexOf(table) >= 0){
                if(table === 'DATA_STEWARD_DOMAIN'){
                    // selectAllStmt = select_all_composite_DATA_STEWARD_DOMAIN(currentSearchObj);
                    selectAllStmt = `SELECT C.DOMAIN, B.FNAME, B.LNAME, B.EMAIL, E.*, 'READ/WRITE' AS PRIVILEGE
                    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN E
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD B 
                    ON (E.DATA_STEWARD_ID = B.DATA_STEWARD_ID)  
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                    ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID);`
                }else if(table === 'CATALOG_ENTITY_DOMAIN'){
                    // selectAllStmt = select_all_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
                    selectAllStmt = `SELECT C.DOMAIN, B.TARGET_DATABASE, B.TARGET_SCHEMA, B.TARGET_TABLE, E.*, 'READ/WRITE' AS PRIVILEGE 
                    FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN E
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES B 
                    ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
                    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
                    ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID);`
                }
            }else{
                // console.log("table NOTTTTTT in ETLF Framework");
                selectAllStmt = select_all_multi_field_catalog(database, schema, table);
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
        <div style={{float: "left", marginLeft: "10px", marginRight: "10px"}}>
            <Button className=""
                variant="primary"
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
                        Multi-Field Search 
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

                            <DropdownButton
                                id="dropdown-basic-button"
                                size="sm"
                                title={'Select Search Field'}
                            >
                                {remainingColumns.map(val => (
                                    <Dropdown.Item 
                                        as="button" 
                                        key={val}
                                        onSelect={()=>{handleAddSearchField(val)}}
                                    >
                                        {val}
                                    </Dropdown.Item>
                                )
                                )}
                            </DropdownButton>

                            <div className="search-count">
                                {/* Search Criteria ({Object.keys(currentSearchObj).length} items) */}
                                Total columns remaining: ({remainingColumns.length} items)
                            </div>

                            <div 
                                style={{
                                    'position': 'absolute',
                                    'right': '18px'
                                }}>
                                <Button onClick={selectAll}>Search All</Button>
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
        </div>
    );
}

export default SearchModal;


// res += `AND UPPER(TRIM(' + 'ec.` + item + `)) LIKE UPPER('%` + surroundWithQuotesIfString(currentSearchObj[item]) + `%'`;