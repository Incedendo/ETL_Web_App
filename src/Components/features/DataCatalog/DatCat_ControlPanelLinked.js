import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import SearchModal from '../Modals/SearchModal';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Spinner from 'react-bootstrap/Spinner';
import DataCatalogModal from './DataCatalogModal';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import { getSearchFieldValue } from '../../sql_statements';

import '../../../css/workspace.scss';

const SELECT_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/select';
const ARN_APIGW_GET_SELECT = 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select';

const DropDown = ({ target, currentVal, menus, table, setState }) => {
    return (
        <DropdownButton
            id="dropdown-item-button"
            title={!currentVal ? 'Select a ' + target : currentVal}
            // disabled={tableSearching || tableLoading}
        >
            {menus.map(item => (
                <Dropdown.Item as="button" key={item}
                    onSelect={() => {
                        if (item !== table) {
                            setState(item)
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

const DatCat_ControlPanelLinked = ({ linkState } ) => {

    const {
        debug,
        username,
        database, schema,
        table, setTable,
        columns, columnsLoaded,
        tableLoaded,setTableLoaded,
        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);

    const { authState, authService } = useOktaAuth();


    const [updatedTable, setUpdatedTable] = useState(false);
    const [primaryKey, setPrimaryKeys] = useState([]);
    const [datCatSchema, setSchema] = useState([]);
    const [fields, setFields] = useState([]);
    const [codeFields, setCodeFields] = useState(fieldTypesConfigs[table]["codeFields"]);
    const [dropdownFields, setDropdownFields] = useState(fieldTypesConfigs[table]["dropdownFields"]);
    const [dropdownObject, setDropdownObject] = useState({});
    const [loadedConfig, setLoadedConfig] = useState(false);

    const [insertError, setInsertError] = useState('');

    

    useEffect(() =>{
        if(linkState !== undefined){
            const linkedTable = linkState['table'];
            const currentSearchObj=  linkState['searchObj'];
            setTable(linkedTable);
            setUpdatedTable(true);
        }
        
        
        console.log(dropdownFields);
    }, []);

    // useEffect(() =>{
    //     console.log(dropdownFields);
    // }, [dropdownFields]);

    useEffect(() =>{
        console.log(primaryKey);
    }, []);

    // Set dropdown for composite tables
    useEffect(() => {
        // if(table === linkedTable){
        if(updatedTable){
            setPrimaryKeys(fieldTypesConfigs[table]['primaryKeys']);
            if(table === 'DATA_STEWARD_DOMAIN'){
                prepareValuesForCompositeTableInsertInto_DATA_STEWARD_DOMAIN();
            }
            else if(table === 'CATALOG_ENTITY_DOMAIN'){
                prepareValuesForCompositeTableInsertInto_CATALOG_ENTITY_DOMAIN();
            }else if(table === 'CATALOG_ENTITY_LINEAGE'){
                prepareValuesForCompositeTableInsertInto_CATALOG_ENTITY_LINEAGE();
            }else{
                setLoadedConfig(true);
            }
    
            console.log(table);
    
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
                    if(table === 'DATA_STEWARD_DOMAIN' || table === 'CATALOG_ENTITY_DOMAIN'){
                        custom_config.validations = [
                            {
                                type: "required",
                                params: ["this field is required"]
                            }
                        ];
                    }
                    formValidationsInfo.push(custom_config);
                });
    
                // debug && console.log(formValidationsInfo);
                let temp_schema = formValidationsInfo.reduce(createYupSchema, {});
    
                // debug && console.log(temp_schema);
                let yup_schema = yup.object().shape(temp_schema);
    
                //have to use setState here to FORCE UPDATE the object in the form
                setSchema(yup_schema);
                setFields(Object.keys(fieldTypesConfigs[table]["dataTypes"]));
            }
        }
    }, [table, updatedTable]);

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
                dropdownObj['DATA_DOMAIN'] = domainObj;

                // 2 
                const DATA_STEWARD_SQL = 'SELECT CONCAT(FNAME, \' - \', LNAME) DATA_STEWARD,DATA_STEWARD_ID FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD;';
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
                        stewardObj[item['DATA_STEWARD']] = item['DATA_STEWARD_ID']
                    })
                    dropdownObj['DATA_STEWARD'] = stewardObj;
                })
                .catch(error => {
                    debug && console.log(error);
                }).then(()=>{
                    console.log(dropdownObj);

                    let dropdownCompositeFields = {
                        'DATA_DOMAIN': Object.keys(dropdownObj['DATA_DOMAIN']), 
                        'DATA_STEWARD': Object.keys(dropdownObj['DATA_STEWARD']) 
                    }
                    
                    setDropdownObject(dropdownObj);
                    setDropdownFields(dropdownCompositeFields);

                    setLoadedConfig(true); 
                })
            })
            .catch(error => {
                debug && console.log(error);
            })
        }
    }

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
                dropdownObj['DATA_DOMAIN'] = domainObj;

                // 2 
                const CATALOG_ENTITIES_SQL = `SELECT CONCAT(TARGET_DATABASE,\' - \', TARGET_SCHEMA,\' - \', TARGET_TABLE) ENTITY, CATALOG_ENTITIES_ID FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES ORDER BY TARGET_SCHEMA,TARGET_TABLE;`;
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
                }).then(()=>{
                    console.log(dropdownObj);

                    let dropdownCompositeFields = {
                        'DATA_DOMAIN': Object.keys(dropdownObj['DATA_DOMAIN']), 
                        'CATALOG_ENTITIES': Object.keys(dropdownObj['CATALOG_ENTITIES']) 
                    }
                    
                    setDropdownObject(dropdownObj);
                    setDropdownFields(dropdownCompositeFields);

                    setLoadedConfig(true); 
                })
            })
            .catch(error => {
                debug && console.log(error);
            })
        }
    }

    const prepareValuesForCompositeTableInsertInto_CATALOG_ENTITY_LINEAGE = () => {
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            let dropdownObj = {}
            
            //1
            const CATALOG_ENTITIES_SQL =
            `SELECT 
                CONCAT(TARGET_DATABASE,'  -  ', TARGET_SCHEMA,'  -  ', TARGET_TABLE) CATALOG_ENTITIES, 
                CATALOG_ENTITIES_HASH 
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
                    domainObj[item['CATALOG_ENTITIES']] = item['CATALOG_ENTITIES_HASH']
                })
                dropdownObj['CATALOG_ENTITIES'] = domainObj;

                let dropdownCompositeFields = {
                    'CATALOG_ENTITIES': Object.keys(dropdownObj['CATALOG_ENTITIES']) 
                }
                
                setDropdownObject(dropdownObj);
                setDropdownFields(dropdownCompositeFields);

                setLoadedConfig(true); 
            })
            .catch(error => {
                debug && console.log(error);
            })
        }
    }

    //***************************************************************************** */
    // EXPERIMENTAL FEATURE WITH LINKABLE TABLE
    //
    //
    //
    //
    //***************************************************************************** */
    useEffect(()=>{
        // if(linkState !== undefined){
        if(loadedConfig){
            console.log("use search sstatement to fetch only target value")
            
            // 

            let searchStmt = 
            `SELECT ec.*, 'READ ONLY' AS PRIVILEGE
            FROM "SHARED_TOOLS_DEV"."ETL"."` + table + `" ec
            WHERE ` + getSearchFieldValue(linkState['searchObj']) + `
            ;`;

            console.log(searchStmt);
            console.log(primaryKey);
            axiosCallToGetTableRows(searchStmt, primaryKey);
        }
    }, [loadedConfig]);

    return (
        <>
            <div style={{ 'float': 'left' }}>
                Catalog table:
                <DropDown 
                    target='Table' 
                    currentVal={table} 
                    menus={[ 
                        'DATA_STEWARD', 
                        'DATA_DOMAIN',
                        'DATA_STEWARD_DOMAIN',
                        'CATALOG_ENTITY_DOMAIN',
                        'CATALOG_ENTITIES',
                        'CATALOG_ITEMS',
                        'CATALOG_ENTITY_LINEAGE',
                    ]}
                    table={table}
                    setState={setTable} />
            </div>

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
                
            <div style={{ 'padding-top': '10px', 'float': 'left' }}>
                {!columnsLoaded ? 
                    <div style={{'padding': '5px'}}>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                        <span style={{ 'marginLeft': '5px' }}>loading...</span>
                    </div>
                    :
                    <SearchModal
                        database={database} 
                        schema={schema} 
                        table={table} 
                        groupIDColumn={'GroupID Not applicable for Catalog'}
                        username={username} 
                        columns={columns}
                    /> 
                }
            </div>

            {insertError !== '' && insertError}
        </>

    )
}

export default DatCat_ControlPanelLinked;