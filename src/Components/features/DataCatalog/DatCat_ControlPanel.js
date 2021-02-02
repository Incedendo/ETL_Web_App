import React, { useState, useEffect, useContext, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';

//---------------Contexts----------------------
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';

//---------------Components--------------------
import SearchModal from '../Modals/SearchModal';
import DataCatalogRefresher from './DataCatalogRefresher';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import DataCatalogModal from './DataCatalogModal';
import DomainOperatorModal from './DataSteward/DomainOperatorModal';
import ConfigurationGrid from '../../features/GridComponents/Grids/ConfigurationGrid';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import { getSearchFieldValue } from '../../sql_statements';
import { compositeTables } from '../../context/FieldTypesConfig';
import '../../../css/workspace.scss';
import { SELECT_URL, ARN_APIGW_GET_SELECT, } from '../../context/URLs';

// const TableOptions = () => (
//     <div style={{ 'height': '90px' }}>
//         <div className="InlineDiv db-div">
//             <div className="label-text db-text">Catalog table:</div>
//             <DropDown 
//                 target='Table' 
//                 currentVal={table} 
//                 menus={[ 
//                     'DATA_STEWARD', 
//                     'DATA_DOMAIN',
//                     'DATA_STEWARD_DOMAIN',
//                     'CATALOG_ENTITY_DOMAIN',
//                     'CATALOG_ENTITIES',
//                     'CATALOG_ITEMS',
//                     'CATALOG_ENTITY_LINEAGE'
//                 ]} 
//                 setState={setTable} />
//         </div>

//         {/* <div className="InlineDiv auto-complete-outerDiv">
//             <div className="auto-complete-div-margin">
//                 <div className="label-text">Table:</div>
//                 <CustomAutoCompleteComp
//                     list={tableList}
//                     setTarget={setTable}
//                     autoSuggestModalClassName="auto-suggest-box" />
//             </div>
//         </div> */}
//     </div>
// )

const DatCat_ControlPanel = ({ linkState }) => {

    const {
        debug,
        username,
        database, schema,
        table, setTable,
        columns, 
        setColumnsLoaded,columnsLoaded,
        tableLoading,
        tableLoaded,setTableLoaded,
        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);

    const {
        isAdmin, isSteward
    } = useContext(AdminContext);

    const mounted = useRef(true);

    const { authState, authService } = useOktaAuth();

    const [datCatSchema, setSchema] = useState([]);
    const [fields, setFields] = useState([]);
    const [codeFields, setCodeFields] = useState(fieldTypesConfigs[table]["codeFields"]);
    const [dropdownFields, setDropdownFields] = useState(fieldTypesConfigs[table]["dropdownFields"]);
    const [dropdownObject, setDropdownObject] = useState({});
    const [loadedConfig, setLoadedConfig] = useState(false);
    const [comingFromLink, setCommingFromLink] = useState(false);

    const [insertError, setInsertError] = useState('');
    const [shownModalUponChangingTable, setShownModalUponChangingTable] = useState(false);
    const [currentSearchCriteria, setCurrentSearchCriteria] = useState([]);
    

    useEffect(() =>{
        if(linkState !== undefined){
            console.log(linkState);
            setTable(linkState['table']);
            setCommingFromLink(true);

        }else{
            //linkstate is undefined, show default first table and show the search modal.
            // console.log("linkstate is undefined...");
            setTable('DATA_DOMAIN');
            setShownModalUponChangingTable(true);

            // the first time user clicks on the tab, still needs to enforce false to NOT show the result table
            setTableLoaded(false);
            setCommingFromLink(false);
        }
        
        // console.log(dropdownFields);
    }, []);

    useEffect(() =>{
        console.log(fields);
    }, [fields]);

    useEffect(() =>{
        console.log(dropdownFields);
        console.log(dropdownObject);
    }, [dropdownFields,dropdownObject]);

    

    // useEffect(() =>{
    //     if((Object.keys(currentSearchCriteria)).length == 0)
    //         setCommingFromLink(false);
    // }, [currentSearchCriteria]);

    // Set dropdown for composite tables
    useEffect(() => {
        mounted.current = true;

        setLoadedConfig(false);
        console.log(table);
        if(table === 'DATA_STEWARD_DOMAIN'){
            prepareValuesForCompositeTableInsertInto_DATA_STEWARD_DOMAIN();
        }else if(table === 'CATALOG_ENTITY_DOMAIN'){
            prepareValuesForCompositeTableInsertInto_CATALOG_ENTITY_DOMAIN();
        }else if(table === 'CATALOG_ENTITY_LINEAGE' || table === 'CATALOG_ITEMS'){
            prepareValuesFor_CATALOG_ENTITIES();
        }else{
            if(mounted.current){
                setDropdownFields({});
                setDropdownObject({});
                setLoadedConfig(true);
            }  
        }

        if(mounted.current){
            updateYupSchemaBasedOnTable();
        }
        
        return () => mounted.current = false;
    }, [table]);

    useEffect(()=>{
        // if(linkState !== undefined){
        if(loadedConfig && comingFromLink && columnsLoaded){
            console.log("Immediately get linked result based on Link state's params");

            const searchStmt = linkState['searchStmt'];
            const primaryKey = fieldTypesConfigs[table]['primaryKeys'];
            console.log(searchStmt);
            console.log(primaryKey);
            axiosCallToGetTableRows(searchStmt, primaryKey);            
        }
    }, [loadedConfig, comingFromLink, columnsLoaded]);

    const prepareValuesForCompositeTableInsertInto_DATA_STEWARD_DOMAIN = () => {
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            let dropdownObj = {}
            
            //1
            const DATA_DOMAIN_SQL = 'SELECT DOMAIN, DATA_DOMAIN_ID FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN;';
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: DATA_DOMAIN_SQL,
                }
            })//have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);

                let domainObj = {}
                response.data.map(item => {
                    domainObj[item['DOMAIN']] = item['DATA_DOMAIN_ID']
                })
                dropdownObj['DOMAIN'] = domainObj;

                // 2 
                // const DATA_STEWARD_SQL = 'SELECT CONCAT(FNAME, \' - \', LNAME) DATA_STEWARD,DATA_STEWARD_ID FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD;';
                const DATA_STEWARD_SQL = 'SELECT EMAIL ,DATA_STEWARD_ID FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD;';
                axios.get(SELECT_URL, {
                    headers: {
                        'type': 'TOKEN',
                        'methodArn': ARN_APIGW_GET_SELECT,
                        // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                        'authorizorToken': accessToken
                    },
                    //params maps to event.queryStringParameters in lambda
                    params: {
                        sqlStatement: DATA_STEWARD_SQL,
                    }
                })//have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    // returning the data here allows the caller to get it through another .then(...)
                    // console.log('---------GET RESPONSE-----------');
                    debug && console.log(response.data);
                    
                    let stewardObj = {}
                    response.data.map(item => {
                        stewardObj[item['EMAIL']] = item['DATA_STEWARD_ID']
                    })
                    dropdownObj['EMAIL'] = stewardObj;
                })
                .catch(error => {
                    debug && console.log(error);
                }).finally(()=>{
                    console.log(dropdownObj);

                    let dropdownCompositeFields = {
                        'DOMAIN': Object.keys(dropdownObj['DOMAIN']), 
                        'EMAIL': Object.keys(dropdownObj['EMAIL']) 
                    }
                    console.log(dropdownCompositeFields);
                    if(mounted.current){
                        setDropdownObject(dropdownObj);
                        setDropdownFields(dropdownCompositeFields);
                        setLoadedConfig(true); 
                    }
                })
            })
            .catch(error => {
                debug && console.log(error);
            })
        }
    }

    //prepopulate the dropdowns fields for the Modals
    const prepareValuesForCompositeTableInsertInto_CATALOG_ENTITY_DOMAIN = () => {
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            let dropdownObj = {}
            
            //1
            const DATA_DOMAIN_SQL = 'SELECT DOMAIN, DATA_DOMAIN_ID FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN;';
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: DATA_DOMAIN_SQL,
                }
            })//have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);

                let domainObj = {}
                response.data.map(item => {
                    domainObj[item['DOMAIN']] = item['DATA_DOMAIN_ID']
                })
                dropdownObj['DOMAIN'] = domainObj;

                // 2 
                const CATALOG_ENTITIES_SQL = 
                `SELECT 
                    CONCAT(TARGET_DATABASE,\' - \', TARGET_SCHEMA,\' - \', TARGET_TABLE) ENTITY, 
                    CATALOG_ENTITIES_ID 
                FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES 
                ORDER BY TARGET_SCHEMA,TARGET_TABLE;`;
                axios.get(SELECT_URL, {
                    headers: {
                        'type': 'TOKEN',
                        'methodArn': ARN_APIGW_GET_SELECT,
                        // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                        'authorizorToken': accessToken
                    },
                    //params maps to event.queryStringParameters in lambda
                    params: {
                        sqlStatement: CATALOG_ENTITIES_SQL,
                    }
                })//have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    // returning the data here allows the caller to get it through another .then(...)
                    // console.log('---------GET RESPONSE-----------');
                    debug && console.log(response.data);
                    
                    let catalogEntitiesObj = {}
                    response.data.map(item => {
                        catalogEntitiesObj[item['ENTITY']] = item['CATALOG_ENTITIES_ID']
                    })
                    dropdownObj['CATALOG_ENTITIES'] = catalogEntitiesObj;
                })
                .catch(error => {
                    debug && console.log(error);
                }).finally(()=>{
                    console.log(dropdownObj);

                    let dropdownCompositeFields = {
                        'DOMAIN': Object.keys(dropdownObj['DOMAIN']), 
                        'CATALOG_ENTITIES': Object.keys(dropdownObj['CATALOG_ENTITIES']) 
                    }
                    if(mounted.current){
                        setDropdownObject(dropdownObj);
                        setDropdownFields(dropdownCompositeFields);
                        setLoadedConfig(true);
                    }
                     
                })
            })
            .catch(error => {
                debug && console.log(error);
            })
        }
    }

    const prepareValuesFor_CATALOG_ENTITIES = () => {
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            let dropdownObj = {}
        
            const CATALOG_ENTITIES_SQL =
            `SELECT 
                CONCAT(TARGET_DATABASE,'  -  ', TARGET_SCHEMA,'  -  ', TARGET_TABLE) CATALOG_ENTITIES, 
                CATALOG_ENTITIES_ID 
            FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES
            ORDER BY TARGET_SCHEMA,TARGET_TABLE`;
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: CATALOG_ENTITIES_SQL,
                }
            })//have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);

                let domainObj = {}
                response.data.map(item => {
                    domainObj[item['CATALOG_ENTITIES']] = item['CATALOG_ENTITIES_ID']
                })
                dropdownObj['CATALOG_ENTITIES'] = domainObj;

                let dropdownCompositeFields = {
                    'CATALOG_ENTITIES': Object.keys(dropdownObj['CATALOG_ENTITIES']) 
                }

                if(mounted.current){
                    setDropdownObject(dropdownObj);
                    setDropdownFields(dropdownCompositeFields);
                    setLoadedConfig(true);
                } 
            })
            .catch(error => {
                debug && console.log(error);
            })
        }
    }

    const updateYupSchemaBasedOnTable = () => {
        
        console.log(table);

        const requiredColumns = [
            'EMAIL', 'FNAME', 'LNAME',//DATA_STEWARD
            'DOMAIN', //DATA_DOMAIN
            'TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE', // table CATALOG_ENTITIES
            'CATALOG_ENTITIES', 'COLUMN_NAME', 'DATA_TYPE', //table CATALOG_ITEMS
            'CATALOG_ENTITIES_ID', //table CATALOG_ENTITY_LINEAGE
        ];

        //table can be still ETLF_EXTRACT_CONFIG or ETLFCALL or CUSTOMCODE, hence need to make sure it's updated before fetching 
        if([ 
            'DATA_STEWARD', 
            'DATA_DOMAIN',
            'DATA_STEWARD_DOMAIN',
            'CATALOG_ENTITY_DOMAIN',
            'CATALOG_ENTITIES',
            'CATALOG_ITEMS',
            'CATALOG_ENTITY_LINEAGE',
        ].indexOf(table) >= 0){
            //check if table has code fields
            // setCodeFields(fieldTypesConfigs[table]["codeFields"]);

            //check if table has dropdown fields
            // setDropdownFields(fieldTypesConfigs[table]["dropdownFields"]);

            let formValidationsInfo = [];
            
            let requiredFields = Object.keys(fieldTypesConfigs[table]["dataTypes"]);
            console.log(requiredFields);
            requiredFields.map(col => {
                let custom_config = {};
                custom_config.id = col;
                // custom_config.placeholder = "this field is required";
                custom_config.validationType = fieldTypesConfigs[table]["dataTypes"][col];
                // if(table === 'DATA_STEWARD_DOMAIN' || table === 'CATALOG_ENTITY_DOMAIN'){
                if( (Object.keys(compositeTables)).indexOf(table) >= 0 || requiredColumns.indexOf(col) >= 0){
                    custom_config.validations = [
                        {
                            type: "required",
                            params: ["this field is required"]
                        }
                        
                    ];

                    if(col === 'EMAIL'){
                        custom_config.validations.push({
                            type: "email",
                            params: ["Please enter a valid email"]
                        })
                    }
                    
                }
                formValidationsInfo.push(custom_config);
            });

            // debug && console.log(formValidationsInfo);
            let temp_schema = formValidationsInfo.reduce(createYupSchema, {});

            // debug && console.log(temp_schema);
            let yup_schema = yup.object().shape(temp_schema);

            //have to use setState here to FORCE UPDATE the object in the form
            if(mounted.current){
                setSchema(yup_schema);
                setFields(Object.keys(fieldTypesConfigs[table]["dataTypes"]));
            }
        }
    };

    return (
        <>
            {/* DatCat_ControlPanel */}
            <div>
                <div style={{ 'float': 'left' }}>
                    Select Catalog table:
                    <DropDown 
                        target='Table' 
                        currentVal={table} 
                        menus={[ 
                            'DATA_DOMAIN',
                            'DATA_STEWARD', 
                            'DATA_STEWARD_DOMAIN',
                            'CATALOG_ENTITY_DOMAIN',
                            'CATALOG_ENTITIES',
                            'CATALOG_ITEMS',
                            'CATALOG_ENTITY_LINEAGE',
                        ]}
                        table={table}
                        setState={setTable}
                        setShownModalUponChangingTable={setShownModalUponChangingTable}
                        setCommingFromLink={setCommingFromLink}
                        setColumnsLoaded={setColumnsLoaded}
                        setTableLoaded={setTableLoaded}
                        setCurrentSearchCriteria={setCurrentSearchCriteria}
                        disabled={!columnsLoaded}
                    />
                </div>

                {loadedConfig && columnsLoaded &&
                    <DataCatalogModal
                        table={table}
                        fields={fields}
                        schema={datCatSchema}
                        loadedConfig={loadedConfig}
                        codeFields={codeFields}
                        dropdownFields={dropdownFields}
                        dropdownObject={dropdownObject}
                        setInsertError={setInsertError}
                    />
                }

                {table === 'DATA_DOMAIN' && isSteward &&
                    <DomainOperatorModal/>
                }

                <DataCatalogRefresher />

                {!columnsLoaded ?
                    <div style={{
                        height: '4rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                        {/* <span style={{ 'marginLeft': '5px' }}>loading columns...</span> */}
                    </div>
                    :
                    <div style={{ paddingTop: '10px', float: 'right' }}>
                        <SearchModal
                            groupIDColumn={'GroupID Not applicable for Catalog'}
                            shown={shownModalUponChangingTable}
                            setCurrentSearchCriteria={setCurrentSearchCriteria}
                        />
                    </div>
                }
            </div>

            {tableLoading && 
                <div style={{
                    "position":"relative",
                    "display": "inline-block",
                    "alignItems": "center",
                }}>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span style={{ 'marginLeft': '5px' }}>loading Table {table}...</span>
                </div>
            }

            { tableLoaded && 
                <>
                    <div style={{
                        'fontWeight': 'bold',
                        "textAlign": "left",
                        "marginBottom": "10px"
                    }}>
                        Table: {table}
                    </div>

                    {comingFromLink && Object.keys(currentSearchCriteria).length === 0 &&
                        <div style={{ 
                            'display': 'flex', 
                            'float': 'left',
                            "marginBottom": "10px"
                        }}>
                            <span style={{ 'fontWeight': 'bold', 'marginRight': '5px' }}>Linked from: </span>
                            { linkState['filterState']['table'] } ({ linkState['filterState']['value'] })
                        </div>
                    }

                    {Object.keys(currentSearchCriteria).length > 0 &&
                        <div style={{ 
                            'display': 'flex', 
                            'float': 'left',
                            "marginBottom": "10px"
                        }}>
                            <span style={{ 'fontWeight': 'bold', 'marginRight': '5px' }}>Filtered by: </span> 
                            {/* {renderFilteredCriteria} */}


                            {Object.keys(currentSearchCriteria).map(col => {
                                if((Object.keys(currentSearchCriteria)).indexOf(col) === (Object.keys(currentSearchCriteria)).length -1 )
                                    return(
                                        <span 
                                            key={col}
                                            style={{ 'marginRight': '5px' }}
                                        >
                                            {col}: {currentSearchCriteria[col]} 
                                        </span>
                                    )
                                else
                                    return(
                                        <span 
                                            key={col}
                                            style={{ 'marginRight': '5px' }}
                                        >
                                            {col}: {currentSearchCriteria[col]} | 
                                        </span>
                                    )
                            })} 
                        </div>
                    }

                    <ConfigurationGrid/> 
                </>
            }

            {/* {currentSearchCriteria.length > 0 &&
                <div style={{ 'float': 'left' }}>
                    <span style={{ 'fontWeight': 'bold' }}>Filtered by:</span> {currentSearchCriteria.map(col => <span key={col}>{col} |</span>)}
                </div>
            }

            {comingFromLink &&
                <div>
                    Linked from: { linkState['filterState']['table'] } : { linkState['filterState']['value'] }
                </div>
            } */}

            {insertError !== '' && insertError}
        </>


    )
}

export default DatCat_ControlPanel;

const DropDown = ({ 
    target, currentVal, menus, table,
    setState, setShownModalUponChangingTable, 
    setCommingFromLink, setTableLoaded, setCurrentSearchCriteria,
    disabled
}) => {
    return (
        <DropdownButton
            id="dropdown-item-button"
            title={!currentVal ? 'Select a ' + target : currentVal}
            disabled={disabled}
        >
            {menus.map(item => (
                <Dropdown.Item as="button" key={item} disabled={disabled}
                    onSelect={() => {
                        if (item !== table) {
                            setState(item);
                            setShownModalUponChangingTable(true);
                            setCommingFromLink(false);
                            setTableLoaded(false);
                            setCurrentSearchCriteria({});
                        }
                    }}
                >
                    {item}
                </Dropdown.Item>
            )
            )}
        </DropdownButton>
    )
}