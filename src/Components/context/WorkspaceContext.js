import React, { useState, useEffect, createContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import axios from 'axios';
import { get_custom_table } from '../sql_statements';
import { NumberEditor } from '../features/GridComponents/Grids/GridHelperClass';
import { fieldTypesConfigs } from './FieldTypesConfig';
import { generateAuditStmt } from '../SQL_Operations/Insert';
export const WorkspaceContext = createContext();

const table_primaryKeys = {
    "ETLF_EXTRACT_CONFIG": ["EXTRACT_CONFIG_ID"],
    "ETLFCALL": ["ETLFCALL_ID"],
    "DATA_STEWARD": ["DATA_STEWARD_ID"],
    "DATA_DOMAIN": ["DATA_DOMAIN_ID"],
    "DATA_STEWARD_DOMAIN": [],
    "CATALOG_ENTITY_DOMAIN": [],
    "CATALOG_ENTITIES": ["CATALOG_ENTITIES_ID"],
    "CATALOG_ENTITY_LINEAGE": ["CATALOG_ENTITY_LINEAGE_ID"],
    "CATALOG_ITEMS": ["CATALOG_ITEMS_ID"]
}

const SELECT_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/select';
const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
const UPDATE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/update';
const INSERT_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/insert';

const ARN_APIGW_GET_SELECT = 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select';
const ARN_APIGW_GET_TABLE_SNOWFLAKE = 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/table-snowflake';

export const WorkspaceProvider = (props) => {
    const { authState, authService } = useOktaAuth();
    
    const [gridConfigs, setGridConfigs] = useState({});

    const [debug, setDebug] = useState(false);
    
    const [accessToken, setAccessToken] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [scopes, setScopes] = useState([]);
    const [appIDs, setAppIDs] = useState([]);

    const [database, setDatabase] = useState('SHARED_TOOLS_DEV');
    const [schema, setSchema] = useState('ETL');
    const [tablelist, setTablelist] = useState([])

    const [reloadTable, setReloadTable] = useState(false)
    const [table, setTable] = useState('ETLF_EXTRACT_CONFIG');
    const [tableLoading, setTableLoading] = useState(false)
    const [tableLoaded, setTableLoaded] = useState(false)
    const [tableSearching, setTableSeaching] = useState(false)

    const [dbTableRows, setDBTableRows] = useState([]);
    const [dbTableColumns, setDBTableColumns] = useState([]);

    const [editMode, setEditMode] = useState(false)
    const [insertMode, setInsertMode] = useState(false)
    const [deleteMode, setDeleteMode] = useState(false)

    const [insertSuccess, setInsertSuccess] = useState(false);
    const [insertError, setInsertError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);
    const [editError, setEditError] = useState('');

    const [isNewClicked, setIsNewClicked] = useState(false);
    const [isSaveClicked, setIsSaveClicked] = useState(false);
    // const[isCancelClicked, setIsCancelClicked] = useState(false);

    //update
    const [enabledEdit, setEnabledEdit] = useState(false);
    const [primaryKeys, setPrimaryKeys] = useState([]);
    const [remainingPrimaryKeys, setRemainingPrimaryKeys] = useState([]);

    //for Search Box:
    const [searchCriteria, setSearchCriteria] = useState([]);
    const [columnID, setColumnID] = useState('');
    const [searchValue, setSearchValue] = useState('');

    //unique columns
    const [uniqueCols, setUniqueCols] = useState([]);
    const [uniqueColumnsObj, setUniqueColumnsObj] = useState({});

    //filtering numeric values for Grid's filter feature
    const [numberColumns, setNumberColumns] = useState([]);

    //React Xtreme dev Grid
    const [headers, setHeaders] = useState([]);
    const [columns, setColumns] = useState([]);
    const [columnsLoaded, setColumnsLoaded] = useState(false);
    const [rows, setRows] = useState([]);
    const [addedRows, setAddedRows] = useState([]);
    const [privilege, setPrivilege] = useState([]);
    const [editingStateColumnExtensions, setEditingStateColumnExtensions] = useState([]);

    const [tableColumnExtensions, setTableColumnExtensions] = useState([]);
    const [sortingStates, setSortingStates] = useState([{columnName: "GROUP_ID", direction: "asc"}]);
    const [columnDataTypes, setColumnDataTypes] = useState({});
    const [columnWidths, setColumnWidths] = useState([]);
    
    //Prepare data for the 'Configure Route' Modal in ETLFramework Comp
    const [system_configs, setSystem_configs] = useState({});
    
    const [etlColumnConfigs, setColumnEtlConfigs] = useState([]);
    const [etlRowConfigs, setRowEtlConfigs] = useState([]);
    const [routeConfigs, setRouteConfigs] = useState({});
    const [actionConfigs, setActionConfigs] = useState({});

    //Generic Table Row Expansion
    const [genericTableDataTypeObj, setGenericTableDataTypeObj] = useState({});

    const [codeFields, setCodeFields] = useState({});

    useEffect(() => {
        if(process.env.NODE_ENV === 'development') setDebug(true);
    }, [process.env.NODE_ENV]);

    useEffect(() => {
        debug && console.log("Type of routeConfigs: ", routeConfigs.constructor === Object)
    },[]);

    useEffect(()=>{
        debug && console.log(authState);
        if(authState.isAuthenticated){
            setAccessToken(authState.accessToken);
            
            const idTokens = JSON.parse(localStorage.getItem('okta-token-storage'));
            setUsername(idTokens.idToken.claims.email);
            setName(idTokens.idToken.claims.name);
            setScopes(idTokens.idToken.scopes);
        }
    }, [authState]);

    useEffect(()=>{
        debug && console.log(authState);
        if(authState.isAuthenticated)
            load_ETFL_System_Config_Using_TableSnowflakeAPI();
    }, [authState]);

    useEffect(()=>{
        debug && console.log(authState);
        if(authState.isAuthenticated)
            load_ETL_ROUTE_METADATA_Using_TableSnowflakeAPI();
    
    }, [authState]);

    useEffect(()=>{
        debug && console.log(authState);
        if(authState.isAuthenticated)
            load_ETLF_EXTRACT_CONFIG_REQUIREMENTS_Using_SelectAPI();
        
    }, [authState]);

    useEffect(() => {
        // if(username !== '' && accessToken !== ''){
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            // debug && console.log("ACcess token ETLF_ACCESS_AUTHORIZATION: ", accessToken);
            debug && console.log("Access token from authState: ", accessToken);
            
            const proposed_get_statenent = "SELECT APP_ID FROM SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION WHERE LOWER(USERNAME) = '"
                + username.toLowerCase() + "';";
            
            debug && console.log(proposed_get_statenent);
            
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: proposed_get_statenent,
                }
            })
                //have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    debug && console.log("Group IDs from ETLF_ACCESS_AUTHORIZATION:", response.data);
                    setAppIDs(response.data.map(item => item.APP_ID))
                })
                .catch(err => debug && console.log("error from loading ETLF_ACCESS_AUTHORIZATION:", err.message))
        }
        
    }, [username, authState]);

    useEffect(() => {
        let isMounted = true;

        debug && console.log('Current Table: ', table)
        // if (accessToken !== '' && table !== '' && username !== '') {
        if (authState.isAuthenticated && table !== '' && username !== '') {
            setTableLoaded(false);
            setColumnsLoaded(false);
            // Use Username to generate Get Statement Inner Join
            // with Authorization table.
            let sqlGetColumnsStmt =
                    "SELECT COLUMN_NAME, DATA_TYPE, IS_IDENTITY FROM " + database + ".INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + schema + "' AND TABLE_NAME = '"
                    + table + "';";
            
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: sqlGetColumnsStmt,
                }
            })
                //have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    debug && console.log("column list for ETLF_EXTRACT_CONFIG:", response.data);
                    prepareGridConfig(response.data);
                    setColumnsLoaded(true);
                })
                .catch(err => debug && console.log("error from loading column list for ETLF_EXTRACT_CONFIG:", err.message))
                
        } 

        return () => {
            isMounted = false;
        };

    }, [authState, username, table]);

    //get the Data Type of each columns in the row for Route Configuration in ETL Framework Job Configuration
    //
    //      for JOB TAB => dropdown
    //
    // useEffect(() => {
    //     if(appIDs['Read-Write'] !== undefined && table !== ''){
    //         update_GroupID_DropdownFields();
    //     }
        
    // }, [appIDs, table]);

    // function update_GroupID_DropdownFields(){
    //     //------------------Update GROUP ID for Row Expansion and Form---------------------------------------
    //     let updatedDropdownFields = fieldTypesConfigs[table]['dropdownFields'];
    //     let groupID = "GROUP_ID"; //default table is ETLF_EXTRACT_CONFIG

    //     if(table === "ETLFCALL") groupID = "WORK_GROUP_ID";

    //     updatedDropdownFields[groupID] = appIDs['Read-Write'];
    //     console.log("Updated Dropdown Fields:", updatedDropdownFields);

    //     setDropdownFields(updatedDropdownFields);
    // }


    // useEffect(() => {
    //     let isMounted = true;

    //     debug && console.log('Current Table: ', table)
    //     // if (accessToken !== '' && table !== '' && username !== '') {
    //     if (authState.isAuthenticated && table !== '' && username !== '') {
    //         // Use Username to generate Get Statement Inner Join
    //         // with Authorization table.
    //         let proposed_get_statenent = get_custom_table(
    //             database, schema,
    //             table,
    //             username,
    //             0, 100
    //         )
    //         axiosCallToGetTable(isMounted, proposed_get_statenent);
            
    //     } else {
    //         setTableLoaded(false);
    //         setColumns([]);
    //         setRows([]);
    //         setSearchCriteria([]);
    //     }

    //     return () => {
    //         isMounted = false;
    //     };

    // }, [authState, username, table]);

    useEffect(() => {
        debug && console.log("Primary keys: ", primaryKeys);
    }, [primaryKeys])

    // useEffect(() => {
    //     let isMounted = true;
    //     if (reloadTable) {
    //         debug && console.log('Current Table: ', table)
    //         if (table !== '') {
    //             // Use Username to generate Get Statement Inner Join
    //             // with Authorization table.
    //             let proposed_get_statenent = get_custom_table(
    //                 database, schema,
    //                 table,
    //                 username,
    //                 0, 100
    //             )
                
    //             // axiosCallToReloadTable(isMounted, proposed_get_statenent);
    //             axiosCallToGetTable(isMounted, proposed_get_statenent);
    //         }
    //         setReloadTable(false);
    //     }

    //     return () => {
    //         isMounted = false;
    //     };
    // }, [reloadTable]);

    useEffect(() => {
        console.log("Current Gridconfigs: ", gridConfigs);
        reloadGridConfig();
        // if (gridConfigs[table]) {
        //     setHeaders(gridConfigs[table]["headers"]);
        //     setColumns(gridConfigs[table]["columns"]);
        //     setColumnWidths(gridConfigs[table]["columnWidths"]);
        //     setTableColumnExtensions(gridConfigs[table]["tableColumnExtensions"]);
        //     // setSortingStates(gridConfigs[table]["sortingStates"]);
        //     setNumberColumns(gridConfigs[table]["numericColumns"]);
        //     setColumnDataTypes(gridConfigs[table]["dataTypeObj"]);
        // }
    }, [gridConfigs]);

    const reloadGridConfig = () => {
        if (gridConfigs[table]) {
            setHeaders(gridConfigs[table]["headers"]);
            setColumns(gridConfigs[table]["columns"]);
            setColumnWidths(gridConfigs[table]["columnWidths"]);
            setTableColumnExtensions(gridConfigs[table]["tableColumnExtensions"]);
            // setSortingStates(gridConfigs[table]["sortingStates"]);
            setNumberColumns(gridConfigs[table]["numericColumns"]);
            setColumnDataTypes(gridConfigs[table]["dataTypeObj"]);
        }
    }

    const loadTableRows = (dbTableRows) => {

        setPrivilege(dbTableRows.map(row => row.PRIVILEGE));
        setRows([]);
        setRows(
            dbTableRows.map((row, index) => ({
                id: row['EXTRACT_CONFIG_ID'],
                ...row
            }))
        );
    }

    useEffect(() => {
        setPrivilege(dbTableRows.map(row => row.PRIVILEGE));
        setRows(
            dbTableRows.map(row => ({
                id: row['EXTRACT_CONFIG_ID'],
                ...row
            })));
        
        // if (dbTableRows.length !== 0){
        //     debug && console.log('%c Table content:', 'color: orange; font-weight: bold');
        //     debug && console.log(dbTableRows);
            
        //     //the data pulled from database still contain PRIVILEGE field

        //     setPrivilege(dbTableRows.map(row => row.PRIVILEGE))

        //     // console.log("b4: ", dbTableRows);
        //     // dbTableRows.map(row => row.PRIVILEGE === 'rw' ? row.PRIVILEGE = "READ/WRITE" : row.PRIVILEGE = "READ ONLY")
        //     // console.log("after mapping: ", dbTableRows);
        //     // setRows(dbTableRows);
        //     setRows(
        //         dbTableRows.map((row, index) => ({
        //             id: row['ID'],
        //             ...row
        //         })));
        // }
        // //empty table
        // else {
        //     //reset all fields from previous table load
        //     // setColumns([]);
        //     setRows([]);
        //     // setSearchCriteria([]);
        // }
    }, [dbTableRows]);

    //*********************************************************************************************************************************************/
    // List of all functions to call when Authstate is updated in useEffect()
    const load_ETFL_System_Config_Using_TableSnowflakeAPI = () => {
        const proposed_get_statenent = 'SELECT ETLF_SYSTEM_CONFIG_ID, SYSTEM_CONFIG_TYPE, SYSTEM_CONFIG_DESCRIPTION, SYSTEM_CONFIG_JSON FROM SHARED_TOOLS_DEV.ETL.ETLF_SYSTEM_CONFIG;';
        const ETLF_SYSTEM_CONFIG = 'ETLF_SYSTEM_CONFIG';
        const { accessToken } = authState;
        
        axios.get(TABLESNOWFLAKE_URL, {
            // headers: {
            //     'type': 'TOKEN',
            //     'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
            //     'authorizorToken': accessToken
            // },
            //params maps to event.queryStringParameters in lambda
            params: {
                sql_statement: proposed_get_statenent,
                tableName: ETLF_SYSTEM_CONFIG,
                database: "SHARED_TOOLS_DEV",
                schema: "ETL",
            }
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                debug && console.log(response.data.rows);
                const systemConfigs = response.data.rows;

                const system_types = systemConfigs.map(value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type);

                let temp_system_configs = {};

                // Create a MASTER system_types object:
                //      Each key is a database system, value is all the configs belonging
                //      to that BD system aggregated into an array
                system_types.map(type => {
                    temp_system_configs[type] = systemConfigs.filter(
                        value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === type);
                    return;
                })

                setSystem_configs(temp_system_configs);
                debug && console.log(temp_system_configs);
            })
            .catch(err => debug && console.log("error from loading ETLF_SYSTEM_CONFIG:", err.message))
    }

    // have to prepare the Route and Action Configs objects
    // in Workspace context to load beforehand,
    // otherwise RouteDataLoader Component won't show the right options
    const load_ETL_ROUTE_METADATA_Using_TableSnowflakeAPI = () => {
        //Dynamic table that stores all Route and Action Combinations to populate framework Form 
        const proposed_get_statenent = 'SELECT * FROM SHARED_TOOLS_DEV.ETL.ETLF_ROUTE_METADATA;'
        const ETL_ROUTE_METADATA = 'ETL_ROUTE_METADATA';

        const { accessToken } = authState;
        axios.get(TABLESNOWFLAKE_URL, {
            // headers: {
            //     'type': 'TOKEN',
            //     'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
            //     'authorizorToken': accessToken
            // },
            //params maps to event.queryStringParameters in lambda
            params: {
                sql_statement: proposed_get_statenent,
                tableName: ETL_ROUTE_METADATA,
                database: "GR_DEV",
                schema: "USER_SPACE",
            }
        })
        //have to setState in .then() due to asynchronous opetaions
        .then(response => {
            debug && console.log('ROUTE METADATA: ', response.data);
            generateRouteConfigs(response.data.rows);
            // generateActionConfigs(response.data.rows);
        })
        .catch(err => debug && console.log("error from loading ETLF_ROUTE_METADATA:", err.message))
    }

    const load_ETLF_EXTRACT_CONFIG_REQUIREMENTS_Using_SelectAPI = () => {
        const proposed_get_statenent = 'SELECT * FROM SHARED_TOOLS_DEV.ETL.ETLF_EXTRACT_CONFIG_REQUIREMENTS;';        
        const { accessToken } = authState;
            // debug && console.log("ACcess token ETLF_EXTRACT_CONFIG_REQUIREMENTS: ", accessToken);
            axios.get(SELECT_URL, {
                    // headers: {
                    //     'type': 'TOKEN',
                    //     'methodArn': ARN_APIGW_GET_SELECT,
                    //     'authorizorToken': accessToken
                    // },
                    //params maps to event.queryStringParameters in lambda
                    params: {
                        sqlStatement: proposed_get_statenent,
                    }
                })
                //have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    debug && console.log(response.data);
                    setRowEtlConfigs(response.data);
                })
                .catch(err => debug && console.log("error from loading ETLF_EXTRACT_CONFIG_REQUIREMENTS:", err.message))
    }

    //*********************************************************************************************************************************************/
    //
    //  Prepare the Route Config Object from the GR_DEV.USER_SPACE.KIET_ETL_ROUTE_METADATA table
    //
    function generateRouteConfigs(data) {
        debug && console.log(data);
        let routes_config = {}

        //track array routes
        let routes = [];
        data.map(row => {
            // console.log(row.ROUTE);
            
            // only add unique Route 
            if (routes.indexOf(row.ROUTE) < 0) {
                routes.push(row.ROUTE);
                routes_config[row.ROUTE] = {
                    'source': row.SOURCE,
                    'target': row.TARGET,
                    // 'code': row.RT_CODE,
                    'id': row.ROUTE_ID,
                    // 'actions': ['Select Action'],
                    'actions': {
                        [row.ACTION]: {
                            'ACTION_ID': row.ACTION_ID,
                            'code': row.RT_CODE,
                        }
                    }
                }
            }else{
                // console.log(row.ROUTE + " : "+ row.ACTION);
                routes_config[row.ROUTE]['actions'][row.ACTION] = {
                    'ACTION_ID': row.ACTION_ID,
                    'code': row.RT_CODE,
                }
            }
        })

        debug && console.log(routes_config);
        setRouteConfigs(routes_config);
    }

    //
    //  Prepare the ACTION Config Object from the GR_DEV.USER_SPACE.KIET_ETL_ROUTE_METADATA table
    //
    // function generateActionConfigs(data) {
    //     let action_configs = {
    //         'Select Action': 'NA',
    //     };
    //     let actions = []
    //     data.map(row => {
    //         if (actions.indexOf(row.ACTION) < 0) {
    //             actions.push(row.ACTION)
    //             action_configs[row.ACTION] = row.ACTION_ID;
    //         }
    //     })

    //     setActionConfigs(action_configs);
    // }

    // const regex_float = /^[0-9]*\.?[0-9]*$/;
    const regex_num = /^[0-9\b]+$/;

    const loadTableNamesInAdvance = (list_sqlstatement, target, setList, setLoading) => {
        setLoading(true)
        // const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/select';

        debug && console.log("ACcess token: ", accessToken);
        axios.get(SELECT_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                'authorizorToken': accessToken
            },
            params: {
                sqlStatement: list_sqlstatement,
            }
        })
            .then(response => {
                debug && console.log(response.data);
                if (target === 'APP_ID') {
                    const user_privilege = []
                    for (let index in response.data) {
                        let item = response.data[index];
                        // user_privilege['all_access'].push(item.APP_ID);
                        // // console.log(item);
                        // if (item.PRIVILEGE === 'rw') {
                        //     user_privilege['Read-Write'].push(item.APP_ID);
                        // } else if (item.PRIVILEGE === 'r') {
                        //     user_privilege['Read-Only'].push(item.APP_ID);
                        // }
                        
                        // console.log(item);
                        if (item.PRIVILEGE === 'rw') {
                            user_privilege['Read-Write'].push(item.APP_ID);
                        } else {
                            user_privilege['Read-Only'].push(item.APP_ID);
                        }
                    }

                    debug && console.log(user_privilege);
                    setList(user_privilege);
                }
                else {
                    const namelist = response.data.map(item => item[target]);
                    debug && console.log('List of ', target, 's: ', namelist);
                    setList(namelist);
                }
            })
            .catch(error => {
                debug && console.log(error);
            })
    }

    const disableColumnsContainingPK = () => {
        let columnDisabledArr = [
            { columnName: 'PRIVILEGE', editingEnabled: false },
        ]

        for (let key in primaryKeys) {
            debug && console.log("primary key: ", primaryKeys[key])
            columnDisabledArr.push({
                columnName: primaryKeys[key], editingEnabled: false
            })
        }

        debug && console.log('>>>>>>>>Disabled Columns>>>>>>>>>>>', columnDisabledArr);
        setEditingStateColumnExtensions(columnDisabledArr)
    }

    useEffect(() => disableColumnsContainingPK(), [primaryKeys])

    // const getCustomColumns = (columns, field, condition) => {
    //     let result = []
    //     columns.map(row => {
    //         if (row[field] === condition) {
    //             result.push(row.COLUMN_NAME)
    //         }
    //     })

    //     return result;
    // }

    //saving configs 
    const prepareGridConfig = (data) => {
        if(data.length != 0){
            let headers = data.map(row => row.COLUMN_NAME)
            //add PRIVILEGE Column to array of headers (because the row contains a JOIN with AUTHORIZATION table)
            headers.push("PRIVILEGE")
            if(headers.length === 0 )
                return;
            const columns = headers.map(header => ({
                name: header,
                title: header
            }))

            const columnWidths = headers.map(header => ({
                columnName: header,
                width: 150
            }))

            const tableColumnExtensions = headers.map(header => ({
                columnName: header,
                align: 'center'
            }))

            const sortingStates = headers.map(header => ({
                columnName: header,
                direction: 'asc'
            }))

            const numericColumns = data.map(row => {
                if (row.DATA_TYPE === 'NUMBER') return row.COLUMN_NAME;
            })

            //derive an array of types of item in above array.
            let dataTypeObj = {}
            for (let id in data) {
                let column_name = data[id].COLUMN_NAME
                let column_type = data[id].DATA_TYPE
                if (column_type === 'TEXT') {
                    dataTypeObj[column_name] = "string"
                } else if (column_type === 'TIMESTAMP_NTZ') {
                    dataTypeObj[column_name] = "timestamp"
                } else {
                    dataTypeObj[column_name] = "number"
                }
            }

            const tableGridConfig = {
                headers,
                columns,
                columnWidths,
                tableColumnExtensions,
                sortingStates,
                numericColumns,
                dataTypeObj,
            }

            let tableName = table;
            console.log("current table to set Config:", table);
            setGridConfigs({
                ...gridConfigs,
                [table]: tableGridConfig
            })
        }
    } 

    // const axiosCallToReloadTable = (isMounted, proposed_get_statenent) => {

    //     const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';

    //     debug && console.log("%c SQL for /table-snowflake method AxiosCallToGetTable", "color: red; font-weight:bold");
    //     debug && console.log(proposed_get_statenent);
    //     setTableLoaded(false);
    //     setTableLoading(true);

    //     setTableSeaching(false);
    //     setColumnID('');
    //     setSearchValue('');

    //     setEditMode(false);
    //     setInsertMode(false);

    //     setEditError('');
    //     setInsertError('');

    //     debug && console.log('Propose GET sql statement: ', proposed_get_statenent);
    //     debug && console.log('Table name:', table);

    //     debug && console.log('%c Counting time axios call:', 'color: orange; font-weight: bold');
    //     debug && console.time("calling API to REload table");
    //     axios.get(getURL, {
    //             headers: {
    //                 'type': 'TOKEN',
    //                 'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
    //                 'authorizorToken': accessToken
    //             },
    //             params: { //params maps to event.queryStringParameters
    //                 sql_statement: proposed_get_statenent,
    //                 database: database,
    //                 schema: schema,
    //                 tableName: table,
    //             }
    //         })
    //         //have to setState in .then() due to asynchronous opetaions
    //         .then(response => {
    //             // returning the data here allows the caller to get it through another .then(...)
    //             // console.log('---------GET RESPONSE-----------');
    //             debug && console.log(response.data);
    //             setDBTableRows(response.data.rows);
                
    //             debug && console.log(`%c Loading talbe with : ${response.data.columns.length} columns and ${response.data.rows.length} rows`, 'color: orange; font-weight: bold');
    //         })
    //         .catch(error => {
    //             debug && console.log(error);
    //             setColumns([]);
    //             setRows([]);
    //             setSearchCriteria([]);
    //             setTable('');
    //         })
    //         .finally(() => {
    //             setTableLoaded(true);
    //             setTableLoading(false);

    //             debug && console.timeEnd("calling API to REload table");
    //         });
    // }

    const axiosCallToGetTableRows = (get_statenent) => {
        if(Object.keys(table_primaryKeys).indexOf(table) > 0)
            setPrimaryKeys(table_primaryKeys[table]);
        setCodeFields(fieldTypesConfigs[table]['codeFields']);

        console.log(gridConfigs);

        debug && console.log(headers);

        debug && console.log("%c SQL AxiosCallToGetTable", "color: red; font-weight:bold");
        debug && console.log(get_statenent);
        setTableLoaded(false);
        setTableLoading(true);

        setTableSeaching(true);
        setColumnID('');
        setSearchValue('');

        setEditMode(false);
        setInsertMode(false);

        setEditError('');
        setInsertError('');

        debug && console.log('Table name:', table);
        
        debug && console.log('%c Counting time axios call:', 'color: orange; font-weight: bold');
        debug && console.time("calling API to load table");
        axios.get(SELECT_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                'authorizorToken': accessToken
            },
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: get_statenent,
            }
        })//have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);
                loadTableRows(response.data); 
            })
            .catch(error => {
                debug && console.log(error);
                setRows([]);
                setSearchCriteria([]);
                setTable('');
            })
            .finally(() => {
                setTableLoaded(true);
                setTableLoading(false);
                setTableSeaching(false);
                debug && console.timeEnd("calling API to load table");
            });
    }

    const axiosCallToGetTable = (isMounted, proposed_get_statenent) => {
        if(Object.keys(table_primaryKeys).indexOf(table) > 0)
            setPrimaryKeys(table_primaryKeys[table]);
        setCodeFields(fieldTypesConfigs[table]['codeFields']);

        console.log(gridConfigs);

        const getURL = (reloadTable || table in gridConfigs)
            ? SELECT_URL
            : TABLESNOWFLAKE_URL;

        debug && console.log("get URL: ", getURL);

        const headers = {
            'type': 'TOKEN',
            'methodArn': (reloadTable || table in gridConfigs) ? ARN_APIGW_GET_SELECT: ARN_APIGW_GET_TABLE_SNOWFLAKE,
            // 'authorizorToken': accessToken
            'authorizorToken': authState.accessToken
        }

        const params = (reloadTable || table in gridConfigs)
        ? { //params maps to event.queryStringParameters
            sqlStatement: proposed_get_statenent
        }
        : { //params maps to event.queryStringParameters
            sql_statement: proposed_get_statenent,
            database: database,
            schema: schema,
            tableName: table,
        }

        debug && console.log(headers);

        debug && console.log("%c SQL AxiosCallToGetTable", "color: red; font-weight:bold");
        debug && console.log(proposed_get_statenent);
        setTableLoaded(false);
        setTableLoading(true);

        setTableSeaching(false);
        setColumnID('');
        setSearchValue('');

        setEditMode(false);
        setInsertMode(false);

        setEditError('');
        setInsertError('');

        debug && console.log('Table name:', table);
        
        debug && console.log('%c Counting time axios call:', 'color: orange; font-weight: bold');
        debug && console.time("calling API to load table");
        axios.get(getURL, {
            // headers,
            params
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);
                
                if (!reloadTable && !gridConfigs[table]) {
                    debug && console.log("saving new config for Table ", table);
                    debug && console.log(`%c Loading talbe with : ${response.data.columns.length} columns and ${response.data.rows.length} rows`, 'color: orange; font-weight: bold');
                    prepareGridConfig(response.data.columns);
                    loadTableRows(response.data.rows);
                }else{
                    // !reloadTable && setDBTableColumns(response.data.columns);
                    reloadGridConfig();
                    loadTableRows(response.data);
                    debug && console.log(`%c Loading talbe with : ${response.data.length} rows`, 'color: orange; font-weight: bold');
                }                
            })
            .catch(error => {
                debug && console.log(error);
                setColumns([]);
                setRows([]);
                setSearchCriteria([]);
                setTable('');
            })
            .finally(() => {
                setTableLoaded(true);
                setTableLoading(false);
                
                debug && console.timeEnd("calling API to load table");
            });
    }

    const insertNewAuditRecord = sqlInsertAuditStmt => {
        const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/insert';

        const data = {
            sqlStatement: sqlInsertAuditStmt
        }

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
        }

        axios.post(INSERT_URL, data, options)
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                debug && console.log(response.data);
                debug && console.log(response.status);
            });
    }

    const performAuditOperation = (action, primaryKeys, state, sqlMergeStatement, update_status) => {
        let primaryKeysObj = {}
        primaryKeys.map(key => {
            primaryKeysObj[key] = state[key]
        })
        //perform audit Insert
        let auditObj = {
            USERNAME: username,
            ACTION: action,
            TABLE_NAME: sqlMergeStatement.trim().split(" ")[2],
            PRIMARY_KEY: primaryKeysObj,
            SQL_CODE: sqlMergeStatement.trim(),
            STATUS: update_status
        }
        // console.log(auditObj);
        insertNewAuditRecord(generateAuditStmt(auditObj));
    }

    const insertUsingMergeStatement = (sqlMergeStatement, values, setValidating, performReload) => {

        // const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/insert';

        // Can't use performEditOperation in Context
        // bc need to ASYNCHRONOUSLY setLoading to false
        // after AXIOS call 

        //data maps to event.body in lambda
        const data = {
            sqlStatement: sqlMergeStatement,
        };

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
        }

        const userConfirmedMsg = " Please confirm Insert Merge SQL statement: " + sqlMergeStatement;

        if (window.confirm(userConfirmedMsg)) {
            let insert_status = "FAILURE";
            axios.post(INSERT_URL, data, options)
                .then(response => {
                    // returning the data here allows the caller to get it through another .then(...)
                    debug && console.log(response.data);
                    debug && console.log(response.status);
                    if (response.status === 200) {
                        if (response.data[0]['number of rows inserted'] > 0) {
                            setInsertSuccess(true);
                            setInsertError('');
                            // if(performReload) setReloadTable(true);
                            console.log(values);
                            values['PRIVILEGE'] = 'READ/WRITE';
                            
                            let newRows = [...rows];
                            newRows.push(values);
                            setRows(newRows);

                            insert_status = "SUCCESS";
                        }
                        else if (response.data[0]['number of rows inserted'] === 0 && table !=='ETLF_CUSTOM_CODE') {
                            debug && console.log("Insert Error: App ID ", values.GROUP_ID, " has no WRITE Privilege");
                            setInsertSuccess(false);
                            setInsertError("Insert Error: App ID ", values.GROUP_ID, " has no WRITE Privilege");
                        }
                    }
                })
                .catch(err => {
                    debug && console.log(err.message);
                    setInsertSuccess(false);
                    setInsertError(err.message);
                })
                .finally(() => {
                    performAuditOperation('INSERT', primaryKeys, values, sqlMergeStatement, insert_status)
                })
        }else{
            setValidating(false);
        }
    }

    const performEditOperation = (sqlUpdateStatement, performReload) => {
        // const url = "https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/update"

        const data = {
            sqlUpdateStatement: sqlUpdateStatement,
        };

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
        }

        axios.put(UPDATE_URL, data, options)
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                debug && console.log(response.data);
                debug && console.log(response.status);
                if (response.status === 200) {
                    debug && console.log(response.data)
                    setEditSuccess(true)
                    setEditError('')
                    if(performReload) setReloadTable(true);
                }
            })
            .catch(err => {
                debug && console.log(err);
                setEditError(err.message);
                setEditSuccess(false)
            })
            .finally(
                () => setReloadTable(true)
            )
    }

    // Make the context object:
    const usersContext = {
        debug, setDebug,
        username, setUsername,
        name, setName,
        scopes, setScopes,
        appIDs, setAppIDs,

        database, setDatabase,
        schema, setSchema,
        tablelist, setTablelist,

        table, setTable,
        tableLoading, setTableLoading,
        tableLoaded, setTableLoaded,
        tableSearching, setTableSeaching,
        setReloadTable,

        insertMode, setInsertMode,
        insertSuccess, setInsertSuccess,
        insertError, setInsertError,

        editMode, setEditMode,
        editSuccess, setEditSuccess,
        editError, setEditError,

        deleteMode, setDeleteMode,

        isNewClicked, setIsNewClicked,
        isSaveClicked, setIsSaveClicked,

        enabledEdit, setEnabledEdit,

        primaryKeys, setPrimaryKeys,
        remainingPrimaryKeys, setRemainingPrimaryKeys,

        searchCriteria, setSearchCriteria,
        columnID, setColumnID,
        searchValue, setSearchValue,

        numberColumns,
        uniqueCols, setUniqueCols,
        uniqueColumnsObj, setUniqueColumnsObj,

        headers, setHeaders,
        columns, setColumns,
        columnsLoaded,
        rows, setRows,
        addedRows, setAddedRows,
        privilege, setPrivilege,
        editingStateColumnExtensions, setEditingStateColumnExtensions,

        tableColumnExtensions, setTableColumnExtensions,
        sortingStates, setSortingStates,
        columnDataTypes, setColumnDataTypes,
        columnWidths, setColumnWidths,

        //functions
        

        //API calls
        axiosCallToGetTable,
        axiosCallToGetTableRows,
        loadTableNamesInAdvance, 
        insertUsingMergeStatement,
        performAuditOperation,
        performEditOperation,

        //ETL Configurataions
        system_configs,
        etlColumnConfigs, etlRowConfigs,
        routeConfigs, actionConfigs,
        //Generic Table Row Expansion
        genericTableDataTypeObj, setGenericTableDataTypeObj,

        codeFields, setCodeFields,
        // dropdownFields, setDropdownFields,

        //ARN resources
        ARN_APIGW_GET_SELECT,
        ARN_APIGW_GET_TABLE_SNOWFLAKE,
    };

    return (
        <WorkspaceContext.Provider value={usersContext}>
            {props.children}
        </WorkspaceContext.Provider>
    )
}
