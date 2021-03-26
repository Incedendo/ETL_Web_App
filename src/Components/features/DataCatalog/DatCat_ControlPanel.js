import React, { useState, useEffect, useContext, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';

//---------------Contexts----------------------
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';

//----------------auxilary class---------------
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import { compositeTables, DATA_CATALOG_TABLE } from '../../context/FieldTypesConfig';

import { SELECT_URL, ARN_APIGW_GET_SELECT, } from '../../context/URLs';

//-----------------react-------------------------
import Select from 'react-select';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

//---------------Components--------------------
import SearchResultInfo from '../CommonFeatures/SearchResultInfo';
import SearchSizeSlider from '../CommonFeatures/SearchSizeSlider';
import SearchModal from '../Modals/SearchModal';
import DataCatalogRefresher from './DataCatalogRefresher';
import DataCatalogModal from './DataCatalogModal';
import ProductionPromotionModal from './ProductionPromotion/ProductionPromotionModal';
import SearchFilter from './SearchFilter';
import DomainOperatorModal from './DataSteward/DomainOperatorModal';
import ConfigurationGrid from '../../features/GridComponents/Grids/ConfigurationGrid';


//---------------CSS---------------------------
import '../../../css/workspace.scss';
import '../../../css/datcat_Controlpanel.scss';

import './customStyleDropdown.js';

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
        table, setTable,
        rows,
        columnsLoaded, setColumnsLoaded,
        tableLoading,
        tableLoaded,

        insertSuccess, insertError, setInsertError,
        axiosCallToGetCountsAndTableRows
    } = useContext(WorkspaceContext);

    const {
        isAdmin, isSteward, isDomainOperator
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

    const [shownModalUponChangingTable, setShownModalUponChangingTable] = useState(false);
    const [currentSearchCriteria, setCurrentSearchCriteria] = useState([]);
    const taleOptions = [ 
        'DATA_DOMAIN',
        'DATA_STEWARD', 
        'DATA_STEWARD_DOMAIN',
        'CATALOG_ENTITY_DOMAIN',
        'CATALOG_ENTITIES',
        'CATALOG_ITEMS',
        'CATALOG_ENTITY_LINEAGE',
    ].map(table => ({
        value: table,
        label: table
    }))

    useEffect(() =>{
        if(linkState !== undefined){
            debug && console.log(linkState);
            setCommingFromLink(true);
            setShownModalUponChangingTable(false);

        }else{
            //linkstate is undefined, show default first table and show the search modal.
            debug && console.log("linkstate is undefined..., default is to set table to DATA_DOMAIN!!!");
            setTable('DATA_DOMAIN');
            
            setShownModalUponChangingTable(true);
            setCommingFromLink(false);
        }
    }, []);

    useEffect(()=>{
        if(insertError !== ''){
            setTimeout(()=>{
                setInsertError('');
            }, 2000);
        }
    }, [insertError])

    // useEffect(()=>{
    //     // if(linkState !== undefined){
    //     if(loadedConfig ){
    //         debug && console.log("Config loaded in Data Control Panels....");           
    //     }
    // }, [loadedConfig]);

    useEffect(()=>{
        // if(linkState !== undefined){
        if(loadedConfig && comingFromLink && columnsLoaded){
            debug && console.log("Immediately get linked result based on Link state's params");

            const countStmt = linkState['countStmt'];
            const searchStmt = linkState['searchStmt'];
            const primaryKey = fieldTypesConfigs[table]['primaryKeys'];

            // debug && console.log(countStmt);
            // debug && console.log(searchStmt);
            // debug && console.log(primaryKey);
            
            // axiosCallToGetTableRows(searchStmt, primaryKey);      
            
            axiosCallToGetCountsAndTableRows(countStmt, searchStmt, primaryKey);
        }
    }, [loadedConfig, comingFromLink, columnsLoaded]);

    // useEffect(() =>{
    //     debug && console.log(fields);
    // }, [fields]);

    // useEffect(() =>{
    //     debug && console.log(dropdownFields);
    //     debug && console.log(dropdownObject);
    // }, [dropdownFields,dropdownObject]);

    // Set dropdown for composite tables
    useEffect(() => {
        mounted.current = true;

        setLoadedConfig(false);
        debug && console.log(table);
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
                // debug && console.log('---------GET RESPONSE-----------');
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
                    debug && console.log(dropdownObj);

                    let dropdownCompositeFields = {
                        'DOMAIN': Object.keys(dropdownObj['DOMAIN']), 
                        'EMAIL': Object.keys(dropdownObj['EMAIL']) 
                    }
                    debug && console.log(dropdownCompositeFields);
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
            let DATA_DOMAIN_SQL = '';
            
            if(isAdmin){
                DATA_DOMAIN_SQL = `SELECT DD.DOMAIN, DD.DATA_DOMAIN_ID FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD`;
            }else{
                DATA_DOMAIN_SQL = `SELECT DISTINCT A.DOMAIN, A.DATA_DOMAIN_ID FROM "SHARED_TOOLS_DEV"."ETL"."DATA_DOMAIN" A 
                LEFT OUTER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD_DOMAIN" B
                ON (A.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID)
                LEFT OUTER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD" C
                ON (B.DATA_STEWARD_ID = C.DATA_STEWARD_ID)
                LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION DA
                ON (DA.DOMAIN = A.DOMAIN)
                WHERE C.EMAIL = UPPER(TRIM('` + username + `')) OR DA.USERNAME = UPPER(TRIM('` + username + `'));`;

            }
            
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
                    debug && console.log(dropdownObj);

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
        
        debug && console.log(table);

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
            debug && console.log(requiredFields);
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
                <div className="tableDropdown" >
                    {/* Select Catalog table: */}
                    {/* <DropDown 
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
                    /> */}
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        // components={animatedComponents}
                        defaultValue={table}
                        name="color"
                        // isMulti
                        options={taleOptions}
                        isDisabled={!columnsLoaded}
                        onChange={(val)=>{
                            // debug && console.log(val);
                            let item = val.value;
                            if (item !== table) {
                                setTable(item);
                                setShownModalUponChangingTable(true);
                                setCommingFromLink(false);
                                setColumnsLoaded(false);
                                setCurrentSearchCriteria({});
                            }
                        }}
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
                    />
                }

                {table === 'DATA_DOMAIN' && (isSteward || isAdmin) && 
                    <DomainOperatorModal/>
                }

                {table === 'CATALOG_ENTITIES' && (isSteward || isAdmin || isDomainOperator) && 
                    <ProductionPromotionModal/>
                }

                <DataCatalogRefresher />

                {}

                {!columnsLoaded &&
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
                }

                {DATA_CATALOG_TABLE.indexOf(table) >= 0  && columnsLoaded &&
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

            {insertError !== '' && insertError}

            {tableLoaded && 
                <>
                    <div style={{
                        'fontWeight': 'bold',
                        "textAlign": "left",
                        "marginBottom": "10px",
                        'color': 'green',
                    }}>
                        Table: {table}
                    </div>

                    <div 
                        style={{ 
                            'display': 'flex', 
                            "marginBottom": "10px"
                        }}
                    >
                        <div>
                            <SearchResultInfo />
                            <SearchSizeSlider/>
                            <SearchFilter 
                                currentSearchCriteria={currentSearchCriteria}
                                setCurrentSearchCriteria={setCurrentSearchCriteria}
                            />
                            {comingFromLink && Object.keys(currentSearchCriteria).length === 0 &&
                                <div style={{ 
                                    'display': 'flex', 
                                    'float': 'left',
                                    "marginBottom": "10px"
                                }}>
                                    <span style={{ 'fontWeight': 'bold', marginLeft: '0px', marginRight: '5px' }}>Linked from: </span>
                                    { linkState['filterState']['table'] } ({ linkState['filterState']['value'] })
                                </div>
                            }
                        </div>
                    </div>

                    <ConfigurationGrid/> 
                </>
            }
        </>


    )
}

export default DatCat_ControlPanel;

const DropDownSelect = ({ 
    target, currentVal, menus, table,
    setState, setShownModalUponChangingTable, 
    setCommingFromLink, setTableLoaded, setCurrentSearchCriteria,
    disabled
}) => {
    return (
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
    )
}

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

