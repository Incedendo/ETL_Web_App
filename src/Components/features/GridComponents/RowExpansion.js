import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import GenericTableModal from '../Modals/GenericTableModal';
import DisplayField from '../GenericTable/DisplayField';
import axios from 'axios';
import { getDataType } from '../FormComponents/FormUtils';
import { generateMergeStatement, generateAuditStmt } from '../../SQL_Operations/Insert';
import '../../../css/rowExpansion.scss';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';

// const url = "https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/update";
const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
const UPDATE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/update';

const options = {
    headers: {
        'Content-Type': 'application/json'
    },
}

const RowExpansion = ({ row }) => {

    const { authState } = useOktaAuth();

    const {
        debug,
        database, schema, table, appIDs, 
        rows, setRows,
        primaryKeys, searchCriteria, columnDataTypes,
        setEditSuccess, setEditError,
        setReloadTable,

        setGenericTableDataTypeObj,
        routeConfigs,

        system_configs,
        codeFields,

        performAuditOperation,

        ARN_APIGW_GET_TABLE_SNOWFLAKE
    } = useContext(WorkspaceContext);

    debug && console.log(row);
    // debug && console.log(fieldTypesConfigs);
    debug && console.log(table);
    const [state, setState] = useState(row);
    const [oldtates, setOldStates] = useState({});
    const [updatedStates, setUpdatedStates] = useState({});
    const [changed, setChanged] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const[diff, setDiff] = useState({});
    
    const [route, setRoute] = useState("");
    const [action, setAction] = useState("");
    const [routeCode, setRouteCode] = useState("");
    const [dropdownFields, setDropdownFields] = useState(fieldTypesConfigs[table]['dropdownFields']);
    // const [customCodeDataTypeObj, setCustomCodeDataTypeObj] = useState({});

    const initialValue = 1;
    // const semaphore = new Semaphore(initialValue);

    const table_configs = {
        "ETLF_EXTRACT_CONFIG": "GROUP_ID",
        "ETLFCALL": "WORK_GROUP_ID"
    }

    useEffect(()=>{
        let differenceBetweenRowAndState = Object.keys(state).reduce((diff, key) => {
            if (row[key] === state[key]) return diff
            return {
                ...diff,
                [key]: state[key]
            }
        }, {});
        delete differenceBetweenRowAndState['ID'];
        differenceBetweenRowAndState['EXTRACT_CONFIG_ID'] = state['EXTRACT_CONFIG_ID']

        setDiff(differenceBetweenRowAndState);
        console.log(differenceBetweenRowAndState);
    }, [state]);

    useEffect(()=>{
        updateDropdownFields(table_configs[table], appIDs);
        debug && console.log(dropdownFields);
    }, [dropdownFields]);

    // console.log("Imported DropdownFields from Context: ", dropdownFields);

    useEffect(() => {
        debug && console.log(routeConfigs);
        if (system_configs!== undefined){
            Object.keys(routeConfigs).map(key => {
                if (routeConfigs[key].id === row['ROUTE_ID']) {
                    setRoute(key);
                    
                    //get the Action from routeConfig Obj:
                    const actions = routeConfigs[key].actions;
                    Object.keys(actions).map(action => {
                        if(actions[action]['ACTION_ID']=== row['ACTION_ID']){
                            setAction(action);
                            setRouteCode(routeConfigs[key]['actions'][action]['code']);
                        }
                    })

                    if (routeConfigs[key].source !== null){
                        getSystemIDs(key, 'source');
                    }else{
                        updateDropdownFields('SOURCE_SYSTEM_ID', []);
                    }

                    if (routeConfigs[key].target !== null){
                        getSystemIDs(key, 'target');
                    } else {
                        updateDropdownFields('TARGET_SYSTEM_ID', []);
                    }
                }
            });
        }
    }, [system_configs]);

    useEffect(() => {
        switch (routeCode) {
            case "R1A1":
                updateDropdownFields('TGT_TABLE_ACTION', ['RECREATE', 'TRUNCATE']);
                break;
            case "R1A2":
                updateDropdownFields('TGT_TABLE_ACTION', ['RECREATE', 'TRUNCATE']);
                break;
            case "R1A3":
                updateDropdownFields('TGT_TABLE_ACTION', ['RECREATE', 'TRUNCATE']);
                break;
            case "R4A1":
                updateDropdownFields('TGT_TABLE_ACTION', ['RECREATE']);
                break;
            case "R6A2":
                updateDropdownFields('TGT_TABLE_ACTION', ['RECREATE', 'TRUNCATE', 'INSERT']);
                break;
            default:
                updateDropdownFields('TGT_TABLE_ACTION', []);
                break;
        }
    }, [routeCode]);

    function getSystemIDs(route, system_type) {
        //system_type is either 'source' or 'target'
        const target = system_type === 'source' ? 'SOURCE_SYSTEM_ID' : 'TARGET_SYSTEM_ID'

        //set Target_SYSTEM_ID
        const system = routeConfigs[route][system_type].toLowerCase(); //'Oracle' or 'Snowflake' or 'Salesforce'
        const system_data = system_configs[system];
        let system_id_desc;

        debug && console.log(system_data);
        if(system_data!== undefined){
            system_id_desc = Object.values(system_data).map(value =>
                value.ETLF_SYSTEM_CONFIG_ID + ' - ' + value.SYSTEM_CONFIG_DESCRIPTION
            );

            // Update the Dropdown fields for the following Form based on Route and Action
            updateDropdownFields(target, system_id_desc);
        }
    }

    function updateDropdownFields(target, values) {
        fieldTypesConfigs[table]['dropdownFields'][target] = values;
        setDropdownFields(fieldTypesConfigs[table]['dropdownFields']);
    }

    useEffect(() => {
        debug && console.log('columnDataTypes Obj: ', columnDataTypes);
    }, [columnDataTypes]);

    useEffect(() => {
        if (row.PRIVILEGE !== "READ ONLY"){
            const abortController = new AbortController();
            const { accessToken } = authState;

            // const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
            axios.get(TABLESNOWFLAKE_URL, {
                    headers: {
                        'type': 'TOKEN',
                        'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
                        'authorizorToken': accessToken
                    },
                    params: { //params maps to event.queryStringParameters
                        sql_statement: "SELECT * FROM DUAL;",
                        database: "SHARED_TOOLS_DEV",
                        schema: 'ETL',
                        tableName: "ETLF_CUSTOM_CODE",
                    }
                })
                //have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    const columnsInfo = response.data.columns;
                    //derive an array of types of item in above array.
                    let dataTypeObj = {}
                    for (let id in columnsInfo) {
                        let column_name = columnsInfo[id].COLUMN_NAME;
                        let column_type = columnsInfo[id].DATA_TYPE;
                        dataTypeObj[column_name] = getDataType(column_type);
                    }

                    // debug && console.log(dataTypeObj)

                    debug && console.log('Data types OBJ of columns in table: ', dataTypeObj);
                    setGenericTableDataTypeObj(dataTypeObj);
                });

            return () => {
                abortController.abort();
            };
        }
    }, [])

    const performUpdate = (isSubscribed) => {
        const diffCols = Object.keys(diff);
        const sqlMergeStatement = generateMergeStatement(database, schema, table, primaryKeys, diffCols, diff);
        
        // console.log(database);
        // console.log(schema);
        // console.log(table);
        // console.log(primaryKeys);
        console.log("EXTRACT_CONFIG_ID: "+ row['EXTRACT_CONFIG_ID']);

        console.log(row);
        console.log(state);

        let newRows = rows.map(obj => obj['EXTRACT_CONFIG_ID'] === state['EXTRACT_CONFIG_ID'] ? state : obj);
        setRows(newRows);

        console.log(diffCols);
        console.log(diff);

        let update_status = "FAILURE";
        // Can't use performEditOperation in Context
        // bc need to ASYNCHRONOUSLY setLoading to false
        // after AXIOS call
        const data = {
            sqlUpdateStatement: sqlMergeStatement,
        };

        const userConfirmed = " Please confirm Update SQL statement: " + sqlMergeStatement;

        if (window.confirm(userConfirmed)) {
            axios.put(UPDATE_URL, data, options)
                .then(response => {
                    if (isSubscribed) {
                        // returning the data here allows the caller to get it through another .then(...)
                        debug && console.log(response.data);
                        debug && console.log(response.status);
                        if (response.status === 200) {
                            if (response.data[0]['number of rows updated'] > 0) {
                                setEditSuccess(true);
                                setEditError('');
                                update_status = 'SUCCESS';
                            }
                            else if (response.data[0]['number of rows updated'] === 0) {
                                setEditSuccess(false);
                                setEditError('Failed to update record');
                            }
                        }
                    } else {
                        return null;
                    }
                })
                .catch(err => {
                    if (isSubscribed) {
                        debug && console.log(err);
                        setEditError(err.message);
                        setEditSuccess(false);
                    } else {
                        return null;
                    }
                })
                .finally(() => {
                    if (isSubscribed) {
                        // setReloadTable(true);
                        
                        setLoading(false);
                        setChanged(false);

                        performAuditOperation('UPDATE', primaryKeys, state, sqlMergeStatement, update_status)
                    } else {
                        return null;
                    }
                });
        } else {
            setLoading(false);
        }

    }

    //make api call to UPDATE everytime isLoading changes
    useEffect( () => {
        let isSubscribed = true;

        if (isLoading) {
            if (primaryKeys.length === 0) {
                setEditError('Error: No Primary Key on table');
                setEditSuccess(false);
                setLoading(false);
                return;
            } else {
                performUpdate(isSubscribed);
            }
        }

        //unsubscribe to the promise so if the component is unmounted while waiting for the promise
        //to revolve then it will not setState to unmounted component
        return () => isSubscribed = false;
    }, [isLoading])

    debug && console.log(state);

    const LoadableUpdateButton = () => (
        <button className="loadable-button"
            disabled={isLoading}
            onClick={!isLoading ? () => {
                setLoading(true);
                // applyChanges();
            } : null} 
        >
            {isLoading ? 'Updating...' : 'Update'}
        </button>
    )

    return (
        <>
            <div className="row-expansion-button-div">
                {table === "ETLF_EXTRACT_CONFIG" &&
                    <div>
                        {/* this is the Linked Items button */}
                        <GenericTableModal
                            modalName={'ETLF_CUSTOM_CODE'}
                            tableName={'ETLF_CUSTOM_CODE'}
                            data={row}
                            uniqueCols={[]}
                            routeCode={routeCode}
                            route={route}
                        />
                    </div>
                }

                {(changed && row['PRIVILEGE'] !=='READ ONLY') ? <LoadableUpdateButton /> : ""}
            </div>

            <div className="detail-div">
                {table === 'ETLF_EXTRACT_CONFIG' &&
                    <>
                        <span style={{ 'fontWeight': "bold" }}>Route: {route}</span>
                        <span> | </span>
                        <span style={{ 'fontWeight': "bold" }}>Action: {action}</span>
                    </>
                }

                {Object.entries(row).map((key, index) =>
                        <DisplayField
                            setState={setState}
                            setChanged={setChanged}
                            key={index}
                            row={row}
                            primaryKeys={primaryKeys}
                            //key in (key, index) is a 2-element array with format [field, value] 
                            //where field is the attribute of the object
                            //and value is the actual value of the attribute.
                            fieldArray={key}
                            columnDataTypes={columnDataTypes}
                            setEditMessage={setEditError}
                            codeFields={codeFields}
                            dropdownFields={dropdownFields}
                            route={route}
                        />)
                }
            </div>
        </>
    )
}

export default RowExpansion;