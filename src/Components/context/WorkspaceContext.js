import React, { useState, useEffect, createContext, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import axios from 'axios';
import { fieldTypesConfigs, TABLES_NON_EDITABLE_COLUMNS, ETLF_tables } from './FieldTypesConfig';
import { steps, startingLo, startingHi, caseAdmin, caseOperator, selectCount } from '../context/privilege';
import { generateAuditStmt } from '../SQL_Operations/Insert';
export const WorkspaceContext = createContext();
import { SELECT_URL,
    TABLESNOWFLAKE_URL,
    UPDATE_URL,
    INSERT_URL,
    ARN_APIGW_GET_SELECT,
    ARN_APIGW_GET_TABLE_SNOWFLAKE 
} from './URLs';

import { getMultiSearchObj } from '../sql_statements';

export const WorkspaceProvider = (props) => {
    const { authState, authService } = useOktaAuth();

    // const {
    //     isAdmin, isSteward
    // } = useContext(AdminContext);

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

    // const [dbTableRows, setDBTableRows] = useState([]);
    // const [dbTableColumns, setDBTableColumns] = useState([]);

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

    const [nonEditableColumns, setNonEditableColumns] = useState([]);

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
    const [gridConfigs, setGridConfigs] = useState({});
    const [headers, setHeaders] = useState([]);
    const [columns, setColumns] = useState([]);
    const [columnsLoaded, setColumnsLoaded] = useState(false);
    const [rows, setRows] = useState([]);
    
    const [addedRows, setAddedRows] = useState([]);
    const [privilege, setPrivilege] = useState([]);
    const [editingStateColumnExtensions, setEditingStateColumnExtensions] = useState([]);
    const [columnDataTypes, setColumnDataTypes] = useState({});
    const [columnWidths, setColumnWidths] = useState([]);
    const [tableColumnExtensions, setTableColumnExtensions] = useState([]);
    const [sortingStates, setSortingStates] = useState([{columnName: "GROUP_ID", direction: "asc"}]);    
    
    // Search Info States
    const [selectAllCounts, setAllCounts] = useState(0);
    const [lo, setLo] = useState(1);
    const [hi, setHi] = useState(steps);
    const [selectAllStmtEveryX, setSelectAllStmtEveryX] = useState('');

    //Prepare data for the 'Configure Route' Modal in ETLFramework Comp
    const [routeOptions, setRouteOptions] = useState({});
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

    // useEffect(() => {
    //     debug && console.log("Type of routeConfigs: ", routeConfigs.constructor === Object)
    // },[]);

    useEffect(()=>{
        debug && console.log(authState);
        if(authState.isAuthenticated){
            setAccessToken(authState.accessToken);
            
            const idTokens = JSON.parse(localStorage.getItem('okta-token-storage'));
            setUsername((idTokens.idToken.claims.email).toUpperCase());
            setName(idTokens.idToken.claims.name);
            setScopes(idTokens.idToken.scopes);
        }
    }, [authState]);

    useEffect(()=>{
        debug && console.log(authState);
        if(authState.isAuthenticated)
            load_ETFL_System_Config_Using_TableSnowflakeAPI();
    }, [authState]);

    // useEffect(()=>{
    //     debug && console.log(authState);
    //     if(authState.isAuthenticated)
    //         load_ETL_ROUTE_METADATA_Using_TableSnowflakeAPI();
    
    // }, [authState]);

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
            // debug && console.log("Access token from authState: ", accessToken);
            
            const proposed_get_statenent = "SELECT APP_ID FROM SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION WHERE UPPER(USERNAME) = '"
                + username.toUpperCase() + "';";
            
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
                    // debug && console.log("Group IDs from ETLF_ACCESS_AUTHORIZATION:", response.data);
                    setAppIDs(response.data.map(item => item.APP_ID))
                })
                .catch(err => debug && console.log("error from loading ETLF_ACCESS_AUTHORIZATION:", err.message))
        }
        
    }, [username, authState]);

    useEffect(() => {
        // if(username !== '' && accessToken !== ''){
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            // debug && console.log("ACcess token ETLF_ACCESS_AUTHORIZATION: ", accessToken);
            // debug && console.log("Access token from authState: ", accessToken);
            
            const SELECT_ROUTE = `SELECT DISTINCT
CONCAT('Route ',ROUTE_ID,' - ', 'Action ',ACTION_ID, ': ', ROUTE_NAME) CHOICE_OPTION,
        ROUTE_NAME,
        ROUTE_ID,
        ACTION_ID,
        SRC_TECH,
        TGT_TECH
FROM ETLF_ROUTE_COLUMNS
ORDER BY ROUTE_ID, ACTION_ID `;
            
            // debug && console.log(SELECT_ROUTE);
            
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: SELECT_ROUTE,
                }
            })
                //have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    // console.log('ROute options: ', response.data);
                    let routes = {};
                    response.data.map(route =>{
                        routes[route.CHOICE_OPTION] = {
                            'ROUTE_NAME': route.ROUTE_NAME,
                            'ROUTE_ID': route.ROUTE_ID,
                            'ACTION_ID': route.ACTION_ID,
                            'SRC_TECH': route.SRC_TECH,
                            'TGT_TECH': route.TGT_TECH
                        }
                    })
                    // console.log(routes);
                    setRouteOptions(routes);
                })
                .catch(err => debug && console.log("error from loading ETLF_ACCESS_AUTHORIZATION:", err.message))
        }
        
    }, [username, authState]);

    //prepare columns config with UseEffect
    useEffect(() => {
        let isMounted = true;

        // debug && console.log('Current Table: ', table)
        // if (accessToken !== '' && table !== '' && username !== '') {
        if (authState.isAuthenticated && table !== '' && username !== '') {

            clearCurrentConfig();

            setTableLoaded(false);
            setColumnsLoaded(false);
            setPrimaryKeys(TABLES_NON_EDITABLE_COLUMNS[table]);
            setNonEditableColumns(TABLES_NON_EDITABLE_COLUMNS[table]);
            // Use Username to generate Get Statement Inner Join
            // with Authorization table.



            let sqlGetColumnsStmt =
            "SELECT COLUMN_NAME, DATA_TYPE, IS_IDENTITY FROM " + database + ".INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + schema + "' AND TABLE_NAME = '"
            + table + "' ORDER BY ORDINAL_POSITION ASC;";
            // console.log(sqlGetColumnsStmt);

            if(table in gridConfigs){
                // debug && console.log("table already in gridconfig => reloadConfig()")
                reloadGridConfig();
            }else{

                
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
                    .then(response => prepareGridConfig(response.data))
                    .catch(err => debug && console.log("error from loading column list for ETLF_EXTRACT_CONFIG:", err.message))
            }
        } 

        return () => {
            isMounted = false;
        };

    }, [authState, username, table]);

    useEffect(() => {
        debug && console.log("Primary keys: ", primaryKeys);
    }, [primaryKeys])

    useEffect(() => {
        console.log("Current Gridconfigs: ", gridConfigs);
        if(table in gridConfigs){
            clearCurrentConfig();
            console.log("gridConfig for table " + table + ": " + gridConfigs[table]);

            reloadGridConfig();
        }
        
    }, [gridConfigs]);

    useEffect(() =>{
        if(columnsLoaded){
            debug && console.log("Columns loaded in WorkSpace Context for table: " + table);
        }
    }, [columnsLoaded])

    const clearCurrentConfig = () => {
        
        console.log("CLEARING existing gridconfig for table: " + table);
        setHeaders([]);
        setColumns([]);
        setColumnWidths([]);
        setTableColumnExtensions([]);
        // setSortingStates(gridConfigs[table]["sortingStates"]);
        setNumberColumns([]);
        setColumnDataTypes([]);
    }

    const reloadGridConfig = () => {
        
        console.log("only reloading existing gridconfig for table: " + table);
        console.log(gridConfigs);
        setHeaders(gridConfigs[table]["headers"]);
        setColumns(gridConfigs[table]["columns"]);
        setColumnWidths(gridConfigs[table]["columnWidths"]);
        setTableColumnExtensions(gridConfigs[table]["tableColumnExtensions"]);
        // setSortingStates(gridConfigs[table]["sortingStates"]);
        setNumberColumns(gridConfigs[table]["numericColumns"]);
        setColumnDataTypes(gridConfigs[table]["dataTypeObj"]);
        
        setColumnsLoaded(true);
    }

    //saving configs 
    const prepareGridConfig = (data) => {
        console.log(data);
        if(data.length != 0){
            console.log("prepareGridConfig() for table: "+ table);
            // console.log(data);
            let headers = []
            data.map(row => headers.push(row.COLUMN_NAME));

            //add PRIVILEGE Column to array of headers (because the row contains a JOIN with AUTHORIZATION table)
            // headers.push("PRIVILEGE");
            if(table !== 'CATALOG_ENTITY_DOMAIN' && table !== 'DATA_STEWARD_DOMAIN'){
                headers.push("EDITABLE");
            }
            if(headers.indexOf('CATALOG_ENTITIES_HASH') > -1 ){
                // console.log("row contains 'CATALOG_ENTITIES_HASH', removed...");
                headers.splice(headers.indexOf('CATALOG_ENTITIES_HASH'), 1);
            }
            if(headers.length === 0 )
                return;


            // console.log("header b4 appending: " + headers);
            if(table === 'ETLFCALL'){
                headers[headers.indexOf('WORK_GROUP_ID')] = 'GROUP_ID';
            }else if(table === 'ETLF_CUSTOM_CODE'){
                headers.unshift('SOURCE_TABLE');
            }//add extra columns to the grid for these tables
            else if(table === 'DATA_STEWARD_DOMAIN'){
                headers.unshift('FNAME');
                headers.unshift('LNAME');
                headers.unshift('DOMAIN');
                headers.unshift('EMAIL');
            }else if(table === 'CATALOG_ENTITIES'){
                headers.unshift('DOMAIN');
            }else if(['CATALOG_ENTITY_DOMAIN', 'CATALOG_ITEMS', 'CATALOG_ENTITY_LINEAGE'].indexOf(table) >= 0 ){
                headers.unshift('TARGET_TABLE');
                headers.unshift('TARGET_SCHEMA');
                headers.unshift('TARGET_DATABASE');
                headers.unshift('DOMAIN');
            }
            
            // console.log("header after appending: " + headers);
            let columns = []; 
            headers.map(header => columns.push({
                name: header,
                title: header
            }))

            // console.log(columns);
            // console.log(headers);

            const columnWidths = headers.map(header => ({
                columnName: header,
                width: 180
            }))

            const tableColumnExtensions = headers.map(header => ({
                columnName: header,
                // align: 'center'
                align: 'left'
            }))

            const sortingStates = headers.map(header => ({
                columnName: header,
                direction: 'asc'
            }))

            let numericColumns = data.map(row => 
                row.DATA_TYPE === 'NUMBER' ? row.COLUMN_NAME : ''
            )

            if(table === 'ETLFCALL'){
                numericColumns[headers.indexOf('WORK_GROUP_ID')] = 'GROUP_ID';
            }

            //derive an array of types of item in above array.
            let dataTypeObj = {}
            for (let id in data) {
                let column_name = data[id].COLUMN_NAME
                if(column_name === 'WORK_GROUP_ID') column_name = 'GROUP_ID';
                
                let column_type = data[id].DATA_TYPE
                
                if (column_type === 'TEXT') {
                    dataTypeObj[column_name] = "string"
                } else if (column_type === 'TIMESTAMP_NTZ') {
                    dataTypeObj[column_name] = "timestamp"
                } else {
                    dataTypeObj[column_name] = "number"
                }
            }

            // clearCurrentConfig();

            // setHeaders(headers);
            // setColumns(columns);
            // setColumnWidths(columnWidths);
            // setTableColumnExtensions(tableColumnExtensions);
            // // setSortingStates(gridConfigs[table]["sortingStates"]);
            // setNumberColumns(numericColumns);
            // setColumnDataTypes(dataTypeObj);

            const tableGridConfig = {
                headers,
                columns,
                columnWidths,
                tableColumnExtensions,
                sortingStates,
                numericColumns,
                dataTypeObj,
            }

            debug && console.log(tableGridConfig);

            // console.log("current table to set Config:", table);
            setGridConfigs({
                ...gridConfigs,
                [table]: tableGridConfig
            })
        }
    }

    //'EXTRACT_CONFIG_ID'
    const loadTableRows = (dbTableRows, primaryKey) => {
        debug && console.log('1st column to distinguish rows in results: ' + primaryKey[0]);
        debug && console.log('Rows to set rows: ', dbTableRows);

        setPrivilege(dbTableRows.map(row => row.PRIVILEGE));
        setRows([]);

        const compositeKeys = primaryKey[0].split(',');
        
        compositeKeys.length === 1
        ? setRows(
            dbTableRows.map((row, index) => ({
                // id: row[primaryKey],
                id: index,
                EDITABLE: row.PRIVILEGE === 'READ/WRITE' ? 'YES' : 'NO',
                ...row
            }))
        )
        : setRows(
            dbTableRows.map((row, index) => ({
                // id: row[compositeKeys[0]] + row[compositeKeys[1]],
                id: index,
                ...row
            }))
        )
    }

    // useEffect(() => {
    //     setPrivilege(dbTableRows.map(row => row.PRIVILEGE));
    //     setRows(
    //         dbTableRows.map(row => ({
    //             id: row['EXTRACT_CONFIG_ID'],
    //             ...row
    //         })));
    // }, [dbTableRows]);

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
                // debug && console.log(response.data.rows);
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
                // debug && console.log(temp_system_configs);
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
            // debug && console.log('ROUTE METADATA: ', response.data);
            generateRouteConfigs(response.data.rows);
            // generateActionConfigs(response.data.rows);
        })
        .catch(err => debug && console.log("error from loading ETLF_ROUTE_METADATA:", err.message))
    }

    const load_ETLF_EXTRACT_CONFIG_REQUIREMENTS_Using_SelectAPI = () => {

        const getRouteNamesSQL = `SELECT DISTINCT ROUTE_NAME, SRC_TECH, TGT_TECH, ROUTE_ID
        FROM SHARED_TOOLS_DEV.ETL.ETLF_ROUTE_COLUMNS A;`

        let routeConfigs = {};

        axios.get(SELECT_URL, {
            // headers: {
            //     'type': 'TOKEN',
            //     'methodArn': ARN_APIGW_GET_SELECT,
            //     'authorizorToken': accessToken
            // },
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: getRouteNamesSQL,
            }
        })
        //have to setState in .then() due to asynchronous opetaions
        .then(response => {
            debug && console.log(response.data);
            response.data.map(item => routeConfigs[item.ROUTE_NAME] = {
                'SRC_TECH': item.SRC_TECH,
                'TGT_TECH': item.TGT_TECH
            });
        })

        debug && console.log(routeConfigs);

        const proposed_get_statenent = `SELECT A.*, B.DATA_TYPE
        FROM SHARED_TOOLS_DEV.ETL.ETLF_ROUTE_COLUMNS A
        INNER JOIN (
            SELECT COLUMN_NAME, DATA_TYPE FROM "SHARED_TOOLS_DEV"."INFORMATION_SCHEMA"."COLUMNS"
            WHERE TABLE_SCHEMA = 'ETL'
            AND TABLE_NAME='ETLF_EXTRACT_CONFIG'
        ) B
        ON A.COLUMN_NAME = B.COLUMN_NAME;`;        
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

                response.data.map(item =>{
                    const routeName = item.ROUTE_NAME;
                    const routeID = item.ROUTE_ID;
                    const actionID = item.ACTION_ID;
                    if(actionID in routeConfigs[routeName]){
                        routeConfigs[routeName][actionID].push({
                            'COLUMN_NAME': item.COLUMN_NAME,
                            'DATA_TYPE': item.DATA_TYPE,
                            'REQUIRED': item.REQUIRED,
                            'CHECK_STR': item.CHECK_STR
                        });
                    }else{
                        routeConfigs[routeName][actionID] = [];
                        routeConfigs[routeName][actionID].push({
                            'COLUMN_NAME': item.COLUMN_NAME,
                            'DATA_TYPE': item.DATA_TYPE,
                            'REQUIRED': item.REQUIRED,
                            'CHECK_STR': item.CHECK_STR
                        });
                    }
                    
                })

                console.log(routeConfigs);
                setRouteConfigs(routeConfigs);
            })
            .catch(err => debug && console.log("error from loading ETLF_EXTRACT_CONFIG_REQUIREMENTS:", err.message))
    }

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

    const clearLoHi = () =>{
        setLo(1);
        setHi(steps);
    }


    //for Search All
    const axiosCallToGetCountsAndTableRows = (getCountsSQL, getRowsSQL, primaryKey) => {
        console.log(getCountsSQL);
        console.log(getRowsSQL);
        
        console.log("calling axiosCallToGetTableRows on table: ", table);
        
        setCodeFields(fieldTypesConfigs[table]['codeFields']);

        console.log(gridConfigs);

        const headers =  {
            'type': 'TOKEN',
            'methodArn': ARN_APIGW_GET_SELECT,
            // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
            'authorizorToken': accessToken
        };

        debug && console.log(headers);

        debug && console.log("%c SQL AxiosCallToGetTable", "color: red; font-weight:bold");
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

        const getCounts = axios.get(SELECT_URL, {
            headers,
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: getCountsSQL,
            }
        });
        const getRows = axios.get(SELECT_URL, {
            headers,
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: getRowsSQL,
            }
        });
        
        debug && console.log('%c Counting time axios call:', 'color: orange; font-weight: bold');
        debug && console.time("calling API to load table");
        axios
            .all([getCounts, getRows])
            .then(axios.spread((...responses) => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                const counts = responses[0].data;
                console.log("COunt for Entities: " + counts[0].COUNT);
                setAllCounts(counts[0].COUNT);
                const rows = responses[1].data;
                
                debug && console.log(rows);
                
                // if(rows.length > 0 && (Object.keys(rows[0])).indexOf('CATALOG_ENTITIES_HASH') > -1){
                //     rows = rows.map(row => {
                //         let newObj ={...rows};
                //         delete newObj['CATALOG_ENTITIES_HASH']
                //         return newObj;
                //     });
                // }

                loadTableRows(rows, primaryKey); 
            }))
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

    const axiosCallToGetTableRows = (get_statenent, primaryKey) => {
        console.log("calling axiosCallToGetTableRows on table: ", table);
        
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
            // headers: {
            //     'type': 'TOKEN',
            //     'methodArn': ARN_APIGW_GET_SELECT,
            //     // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
            //     'authorizorToken': accessToken
            // },
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: get_statenent,
            }
        })//have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                
                const rows = response.data;
                //this wont work when you click next20 it will reset the count to 20
                // setAllCounts(rows.length);
                debug && console.log(rows);
                
                // if(rows.length > 0 && (Object.keys(rows[0])).indexOf('CATALOG_ENTITIES_HASH') > -1){
                //     rows = rows.map(row => {
                //         let newObj ={...rows};
                //         delete newObj['CATALOG_ENTITIES_HASH']
                //         return newObj;
                //     });
                // }

                loadTableRows(rows, primaryKey); 
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

    const axiosCallToGetTable = ( proposed_get_statenent, primaryKey) => {

        console.log("calling axiosCallToGetTable on table: ", table);

        if(Object.keys(TABLES_NON_EDITABLE_COLUMNS).indexOf(table) > 0){
            setPrimaryKeys(TABLES_NON_EDITABLE_COLUMNS[table]);
            setNonEditableColumns(TABLES_NON_EDITABLE_COLUMNS[table]);
        }
        setCodeFields(fieldTypesConfigs[table]['codeFields']);

        console.log(gridConfigs);

        const getURL = TABLESNOWFLAKE_URL;

        debug && console.log("get URL: ", getURL);

        const headers = {
            'type': 'TOKEN',
            'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
            // 'authorizorToken': accessToken
            'authorizorToken': authState.accessToken
        }

        const params = { //params maps to event.queryStringParameters
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
        axios.get(TABLESNOWFLAKE_URL, {
            // headers,
            params
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);
                
                // if (!reloadTable && !gridConfigs[table]) {
                if (table in gridConfigs) {
                    reloadGridConfig();
                    loadTableRows(response.data, primaryKey);
                    debug && console.log(`%c Loading talbe with : ${response.data.length} rows`, 'color: orange; font-weight: bold');
                }else{
                    debug && console.log("saving new config for Table ", table);
                    debug && console.log(`%c Loading talbe with : ${response.data.columns.length} columns and ${response.data.rows.length} rows`, 'color: orange; font-weight: bold');
                    prepareGridConfig(response.data.columns);
                    loadTableRows(response.data.rows, primaryKey);
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

    const multiSearch = (isAdmin, isSteward, groupIDColumn, currentSearchObj, setCurrentSearchCriteria) => {
        
        clearLoHi();
        setCurrentSearchCriteria(currentSearchObj);
        let uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];
        let getRowsCount = '';
        let multiSearchSqlStatement = '';
        let multiSearchSqlStatementFirstX = '';

        const multiSearchSQLObj = getMultiSearchObj(isAdmin, isSteward, username, database, schema, table, groupIDColumn, currentSearchObj);
        const bodySQL = multiSearchSQLObj.bodySQL;
        const selectCriteria = multiSearchSQLObj.selectCriteria;

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
        
        if(debug){
            console.log(table);
            console.log(currentSearchObj);
            console.log(getRowsCount);
            console.log(multiSearchSqlStatementFirstX);
        }

        axiosCallToGetCountsAndTableRows(getRowsCount, multiSearchSqlStatementFirstX, uniqueKeysToSeparateRows);
        
    }

    const insertNewAuditRecord = sqlInsertAuditStmt => {
       
        const data = {
            'sqlStatement': sqlInsertAuditStmt
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

    const insertUsingMergeStatement = (sqlMergeStatement, values, setInserting, performReload) => {

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
            console.log(values);
            axios.post(INSERT_URL, data, options)
                .then(response => {
                    // returning the data here allows the caller to get it through another .then(...)
                    debug && console.log(response);
                    debug && console.log(response.data);
                    debug && console.log("Status: ", response.status);
                    if (response.status === 200) {
                        if (response.data[0]['number of rows inserted'] > 0) {
                            debug && console.log("insert success...");
                            setInsertSuccess(true);
                            setInsertError('');

                            let newRows = [...rows];
                            if(table === 'DATA_STEWARD_DOMAIN'){
                                let insertedRows = []
                                values['DATA_DOMAIN_ID'].map(domainID => {
                                    insertedRows.push({
                                        'DATA_DOMAIN_ID': domainID,
                                        'DATA_STEWARD_ID': values['DATA_STEWARD_ID']
                                    })
                                }) 
                                newRows = [...newRows, ...insertedRows];
                                console.log(insertedRows);
                            }
                            else if(table === 'CATALOG_ENTITY_DOMAIN'){
                                let insertedRows = []
                                values['CATALOG_ENTITIES_ID'].map(entityID => {
                                    insertedRows.push({
                                        'CATALOG_ENTITIES_ID': entityID,
                                        'DATA_DOMAIN_ID': values['DATA_DOMAIN_ID']
                                    })
                                }) 
                                newRows = [...newRows, ...insertedRows];
                                console.log(insertedRows);
                            }else{
                                // if(performReload) setReloadTable(true);
                                values['EDITABLE'] = 'YES';       
                                                            
                                //CONVER ALL NON-NUMERIC VAL TO UPPER CASE B4 SAVING:    
                                (Object.keys(values)).map(col => {
                                    if(isNaN(values[col]))
                                        values[col] = values[col].toUpperCase().trim();
                                })
                                console.log(values);
                                newRows.push(values);
                            }
                            
                            setRows(newRows);

                            insert_status = "SUCCESS";
                        }
                        // else if (response.data[0]['number of rows inserted'] === 0 && table !=='ETLF_CUSTOM_CODE') {
                        //     debug && console.log("Insert Error: App ID ", values.GROUP_ID, " has no WRITE Privilege");
                        //     setInsertSuccess(false);
                        //     setInsertError("Insert Error: App ID ", values.GROUP_ID, " has no WRITE Privilege");
                        // }
                    }else{
                        console.log("status is not 200");
                    }
                })
                .catch(err => {
                    debug && console.log(err.message);
                    setInsertSuccess(false);
                    setInsertError(err.message);
                })
                .finally(() => {
                    performAuditOperation('INSERT', primaryKeys, values, sqlMergeStatement, insert_status);
                    setInserting(false);
                })
        }else{
            setInsertSuccess(true);
            setInsertError('');
            setInserting(false);
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
        nonEditableColumns, setNonEditableColumns,
        remainingPrimaryKeys, setRemainingPrimaryKeys,

        searchCriteria, setSearchCriteria,
        columnID, setColumnID,
        searchValue, setSearchValue,

        numberColumns,
        uniqueCols, setUniqueCols,
        uniqueColumnsObj, setUniqueColumnsObj,

        headers, setHeaders,
        columns, setColumns,
        columnsLoaded, setColumnsLoaded,
        rows, setRows,
        addedRows, setAddedRows,
        privilege, setPrivilege,
        editingStateColumnExtensions, setEditingStateColumnExtensions,
        gridConfigs,

        tableColumnExtensions, setTableColumnExtensions,
        sortingStates, setSortingStates,
        columnDataTypes, setColumnDataTypes,
        columnWidths, setColumnWidths,

        //search Info States
        selectAllCounts,
        lo, setLo,
        hi, setHi,
        clearLoHi,
        selectAllStmtEveryX, setSelectAllStmtEveryX,
        //functions
        multiSearch,

        //API calls
        axiosCallToGetTable,
        axiosCallToGetTableRows,
        axiosCallToGetCountsAndTableRows,
        loadTableNamesInAdvance, 
        insertUsingMergeStatement,
        performAuditOperation,
        performEditOperation,

        //ETL Configurataions
        routeOptions, setRouteOptions,
        system_configs,
        etlColumnConfigs, etlRowConfigs,
        routeConfigs, actionConfigs,
        //Generic Table Row Expansion
        genericTableDataTypeObj, setGenericTableDataTypeObj,

        codeFields, setCodeFields,
        // dropdownFields, setDropdownFields,
    };

    return (
        <WorkspaceContext.Provider value={usersContext}>
            {props.children}
        </WorkspaceContext.Provider>
    )
}
