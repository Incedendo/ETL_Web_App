import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import GenericTableModal from '../Modals/GenericTableModal';
import CustomizedLink from './CustomizedLink';
import DisplayField from '../GenericTable/DisplayField';
import axios from 'axios';
import { getDataType, getFieldType } from '../FormComponents/FormUtils';
import { generateMergeStatement, 
    generateMergeUpdateStatement,
    generateAuditStmt } from '../../SQL_Operations/Insert';
import '../../../css/rowExpansion.scss';
import { fieldTypesConfigs, HIDDEN_FIELDS_IN_ROW_EXPANSION, DATA_CATALOG_TABLE } from '../../context/FieldTypesConfig';
import { 
    merge_update_data_steward,
    merge_update_data_domain,
    merge_update_catalog_items,
    merge_update_catalog_entities,
    merge_catalog_entity_lineage
} from '../DataCatalog/datcatsql/datcat_merge_update';
import { SELECT_URL, ARN_APIGW_GET_SELECT} from '../../context/URLs';

import PrimaryKeyField from '../GenericTable/PrimaryKeyField';
import CodeField from '../GenericTable/CodeField';
import DropdownField from '../GenericTable/DropdownField';

import '../../../css/rowExpansion.scss';

const UPDATE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/update';


const options = {
    headers: {
        'Content-Type': 'application/json'
    },
}

const RowExpansion = React.memo(({ row }) => {

    const { authState } = useOktaAuth();

    const {
        isAdmin, isSteward, isDomainOperator
    } = useContext(AdminContext);

    const {
        debug,
        database, schema, table, appIDs, 
        rows, setRows,
        nonEditableColumns,
        primaryKeys, columnDataTypes,
        editSuccess, setEditSuccess,
        editError, setEditError,

        routeOptions,
        routeConfigs,

        system_configs,
        codeFields,

        privilegeTables,

        performAuditOperation,
    } = useContext(WorkspaceContext);

    debug && console.log(row);
    // debug && console.log(fieldTypesConfigs);
    debug && console.log(table);
    
    const [state, setState] = useState(row);
    const [changed, setChanged] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [editMessageClassname, setEditMessageClassname] = useState('');
    const [editable, setEditable] = useState(false);

    const[diff, setDiff] = useState({});
    
    const [route, setRoute] = useState("Route Not in List");
    const [action, setAction] = useState("");
    const [dropdownFields, setDropdownFields] = useState(fieldTypesConfigs[table]['dropdownFields']);

    const table_configs = {
        "ETLF_EXTRACT_CONFIG": "GROUP_ID",
        "ETLFCALL": "WORK_GROUP_ID"
    }

    useEffect(()=> {
        setEditError('');
    }, []);

    const checkIfTableIsPrivileged = (getTableNameSQL, mounted) => {
        axios.get(SELECT_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                'authorizorToken': accessToken
            },
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: getTableNameSQL,
            }
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                if(response.data.length > 1){
                    console.log("MORE THAN 1 TABLE for this RECORD!!!!!!")
                    return;
                }
                console.log(response.data);
                const table = response.data[0].TARGET_TABLE;
                if(privilegeTables.indexOf(table) >= 0 && mounted){
                    setEditable(true);
                }
            })
            .catch(err => debug && console.log("error from loading", err.message))
    }

    useEffect(() =>{
        let mounted = true;
        if(['ETLF_EXTRACT_CONFIG', 'ETLFCALL', 'ETLF_CUSTOM_CODE'].indexOf(table) >= 0){
            if(row.PRIVILEGE === 'READ/WRITE')
                setEditable(true)
        }else{
            if(isAdmin){
                setEditable(true);
                return;
            }

            const { accessToken } = authState;

            if(table === 'CATALOG_ENTITIES'){
                const table = row.TARGET_TABLE;
                if(privilegeTables.indexOf(table) >= 0){
                    setEditable(true);
                }
            }
            if(table === 'CATALOG_ITEMS'){
                let getTableNameSQL = `SELECT B.TARGET_TABLE FROM
                "SHARED_TOOLS_DEV"."ETL"."CATALOG_ITEMS" A
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITIES" B
                ON(A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
                WHERE A.CATALOG_ITEMS_ID = '` + row.CATALOG_ITEMS_ID + `';`;

                console.log(getTableNameSQL);

                checkIfTableIsPrivileged(getTableNameSQL, mounted);
            }
            if(table === 'CATALOG_ENTITY_LINEAGE'){
                let getTableNameSQL = `SELECT B.TARGET_TABLE FROM
                "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITY_LINEAGE" A
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITIES" B
                ON(A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
                WHERE A.CATALOG_ENTITY_LINEAGE_ID = '` + row.CATALOG_ENTITY_LINEAGE_ID + `';`;

                checkIfTableIsPrivileged(getTableNameSQL, mounted);
            }
    
            // if(table === 'DATA_STEWARD'){
            //     if(isSteward)
            // }
            if(table === 'DATA_DOMAIN'){
                
            }
        }
        
        return () => mounted = false;
    }, [])

    // useEffect(()=>{
    //     if(editSuccess){
    //         setEditError('Success Update');
    //         setEditMessageClassname('successSignal');
    //     }else{
    //         setEditError('Failed to update record');
    //         setEditMessageClassname('errorSignal');
    //     }
    // }, [editSuccess])

    useEffect(() => {
        if(editError !== '') {
            setTimeout(() => {
                setEditError('');
            }, 1000);
        }
    }, [editError])

    useEffect(()=>{
        let differenceBetweenRowAndState = Object.keys(state).reduce((diff, key) => {
            if (row[key] === state[key]) return diff
            return {
                ...diff,
                [key]: state[key]
            }
        }, {});
        // delete differenceBetweenRowAndState['ID'];
        if('EXTRACT_CONFIG_ID' in state){
            differenceBetweenRowAndState['EXTRACT_CONFIG_ID'] = state['EXTRACT_CONFIG_ID']
        }
        else if(table ==='ETLFCALL'){
            differenceBetweenRowAndState['ETLFCALL_ID'] = state['ETLFCALL_ID'];
            differenceBetweenRowAndState['SOURCE_TABLE'] = state['SOURCE_TABLE'];
            differenceBetweenRowAndState['WORK_GROUP_ID'] = state['WORK_GROUP_ID'];
        }else if(table === 'ETLF_CUSTOM_CODE'){
            differenceBetweenRowAndState['CUSTOM_CODE_ID'] = state['CUSTOM_CODE_ID'];
        }
        

        setDiff(differenceBetweenRowAndState);
        debug && console.log(differenceBetweenRowAndState);
    }, [state, table]);

    useEffect(()=>{
        updateDropdownFields(table_configs[table], appIDs);
        debug && console.log(dropdownFields);
    }, [dropdownFields]);

    // console.log("Imported DropdownFields from Context: ", dropdownFields);

    useEffect(() => {
        if(table === 'ETLF_EXTRACT_CONFIG'){
            const ACTION_ID = row.ACTION_ID;
            const ROUTE_ID = row.ROUTE_ID;

            //extract the route from sw: i.e: Oracle to Snowflake????
            let route_name = ''
            Object.values(routeOptions).map(item =>{
                if(item.ROUTE_ID === ROUTE_ID){
                    route_name = (item.ROUTE_NAME).trim();
                    setRoute(route_name);
                }
            })

            //extract the list of required fields of a specific route and action
            debug && console.log(route_name);
            
            setAction(ACTION_ID);
        }
    }, []);

    useEffect(() => {
        debug && console.log(routeConfigs);
        if (table === 'ETLF_EXTRACT_CONFIG' 
            && route !== 'Route Not in List' && route !== ''
            && row.PRIVILEGE === 'READ/WRITE'
        ){
            debug && console.log("Route: " + route);
            if (routeConfigs[route].SRC_TECH !== 'File'){
                getSystemIDs(route, 'SRC_TECH');
            }else{
                updateDropdownFields('SOURCE_SYSTEM_ID', []);
            }

            if (routeConfigs[route].TGT_TECH !== 'File'){
                getSystemIDs(route, 'TGT_TECH');
            } else {
                updateDropdownFields('TARGET_SYSTEM_ID', []);
            }
        }
    }, [route]);
    

    function getSystemIDs(route, system_type) {
        //system_type is either 'source' or 'target'
        const target = system_type === 'SRC_TECH' ? 'SOURCE_SYSTEM_ID' : 'TARGET_SYSTEM_ID'

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

    const getUpdateStatementForDataCatalog = (row, diff) => {
        let updateStatement = '';
        // let primaryKey = TABLES_NON_EDITABLE_COLUMNS[table][0];

        debug && console.log(row); // row is the old record
        debug && console.log(state); // state is the updated record
        debug && console.log(diff); // diff is the object to be updated

        if(table === 'DATA_STEWARD'){
            updateStatement = merge_update_data_steward(row, diff);
            
        }
        if(table === 'DATA_DOMAIN'){
            updateStatement = merge_update_data_domain(row, diff);
        }else if(table === 'CATALOG_ENTITIES'){
            
            updateStatement = merge_update_catalog_entities(row, diff);
        }else if(table === 'CATALOG_ENTITY_LINEAGE'){

            updateStatement = merge_catalog_entity_lineage(row, diff);
        }else if(table === 'CATALOG_ITEMS'){
            updateStatement = merge_update_catalog_items(row, diff);
        }
        
        debug && console.log(updateStatement);

        return updateStatement;
    }

    const performUpdate = (isSubscribed) => {
        //get the ID columns in the array of non_editable columns:
        debug && console.log('perform update...');
        debug && console.log('table: ', table);

        let primaryKey = fieldTypesConfigs[table]['primaryKeys'][0];
        let sqlMergeStatement = '';
        const diffCols = Object.keys(diff);

        if(DATA_CATALOG_TABLE.indexOf(table) >= 0){
            debug && console.log("generate update for DATCAT");
            sqlMergeStatement = getUpdateStatementForDataCatalog(row, diff);
        }else{
            
            if(table === 'ETLFCALL'){
                debug && console.log("generate update for ETLFCALL");
                let primaryKeysForETLFCALL = ['ETLFCALL_ID', 'SOURCE_TABLE', 'WORK_GROUP_ID'];
                
                sqlMergeStatement = generateMergeUpdateStatement(database, schema, table, primaryKeysForETLFCALL, diffCols, diff);
            }else if(table === 'ETLF_CUSTOM_CODE'){
                debug && console.log("generate update for ETLF_CUSTOM_CODE");
                const primaryKeysForCustomCode = ['CUSTOM_CODE_ID'];
                //this is a temporary fix for a bug: (table is somehow still )
                const editedDiff = {
                    ...diff,
                    'CUSTOM_CODE_ID': state['CUSTOM_CODE_ID']
                };
                const editedDiffCols = Object.keys(editedDiff);

                sqlMergeStatement = generateMergeUpdateStatement(database, schema, table, primaryKeysForCustomCode, editedDiffCols, editedDiff);
            }else{
                debug && console.log("generate update for ETLF");
                sqlMergeStatement = generateMergeStatement(database, schema, table, primaryKeys, diffCols, diff);
            }
        }
        
        if(debug){
            debug && console.log(sqlMergeStatement);
            debug && console.log(row);
            debug && console.log(state);
            debug && console.log(diffCols);
            debug && console.log(diff);
        }
        

        let update_status = "FAILURE";
        // Can't use performEditOperation in Context
        // bc need to ASYNCHRONOUSLY setLoading to false
        // after AXIOS call
        const data = {
            sqlUpdateStatement: sqlMergeStatement,
        };

        const userConfirmed = " Please confirm Update SQL statement: " + sqlMergeStatement;

        if (window.confirm(userConfirmed)) {
            // let newRows = rows.map(obj => obj['EXTRACT_CONFIG_ID'] === state['EXTRACT_CONFIG_ID'] ? state : obj);
            let newRows = [];
            // if(table === 'CATALOG_ITEMS'){
            //     newRows = rows.map(obj => obj[id] === state[id] ? state : obj);
            // }else{
            //     newRows = rows.map(obj => obj[primaryKey] === state[primaryKey] ? state : obj);
            // }
            // newRows = rows.map(row => row[primaryKey] === state[primaryKey] ? state : row);
            newRows = rows.map(row => row['id'] === state['id'] ? state : row);
            
            setRows(newRows);

            axios.put(UPDATE_URL, data, options)
                .then(response => {
                    if (isSubscribed) {
                        // returning the data here allows the caller to get it through another .then(...)
                        debug && console.log(response.data);
                        debug && console.log(response.status);
                        if (response.status === 200) {
                            if (response.data[0]['number of rows updated'] > 0
                                ||response.data[0]['number of rows inserted'] > 0
                            ) {
                                setEditSuccess(true);
                                setEditError('Success Update');
                                setEditMessageClassname('successSignal');
                                update_status = 'SUCCESS';
                            }
                            else {
                                setEditSuccess(false);
                                setEditError('Failed to update record');
                                setEditMessageClassname('errorSignal');
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
                        setEditMessageClassname('errorSignal');
                    } else {
                        return null;
                    }
                })
                .finally(() => {
                    if (isSubscribed) {
                        
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

    const submitJob = () => {
        setShowPending(true);
        let primaryKey = fieldTypesConfigs[table]['primaryKeys'][0];
        let sqlMergeStatement = `UPDATE SHARED_TOOLS_DEV.ETL.ETLFCALL
        SET 
        INGESTION_STATUS = 'PENDING',
        LAST_UPDATE_DATE = CURRENT_TIMESTAMP(0)::TIMESTAMP_NTZ
        WHERE UPPER(TRIM(ETLFCALL_ID)) = UPPER(TRIM('` + row['ETLFCALL_ID'] + `'));`;
        let newRows = rows.map(obj => obj[primaryKey] === state[primaryKey] ? state : obj);
        
        setRows(newRows);


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
                    // returning the data here allows the caller to get it through another .then(...)
                    debug && console.log(response.data);
                    debug && console.log(response.status);
                    if (response.status === 200) {
                        setEditSuccess(true);
                        setEditError('');
                        update_status = 'SUCCESS';
                    }else {
                        setEditSuccess(false);
                        setEditError('Failed to Schedule job');
                    }
                })
                .catch(err => {
                    debug && console.log(err);
                    setEditError('Failed to Schedule job');
                    setEditSuccess(false);
                })
                .finally(() => {
                    
                    setLoading(false);
                    setChanged(false);

                    performAuditOperation('UPDATE', primaryKeys, state, sqlMergeStatement, update_status)
                    
                });
        } else {
            setLoading(false);
        }
    }

    const renderFieldByType = () =>{
        
        debug && console.log(row);
        debug && console.log(nonEditableColumns);

        let modifiedRowBasedOnRouteAndAction = {}

        if(table === 'ETLF_EXTRACT_CONFIG' && (route in routeConfigs)){
            // if(route in routeConfigs){}
            let fieldConfigs = routeConfigs[route][row.ACTION_ID];
            debug && console.log(fieldConfigs);
            //display only required = 'Y' or 'O' fields for this route-action
            if(fieldConfigs !== undefined){
                fieldConfigs.map(item => {
                    if(item.REQUIRED !== 'N'){
                        modifiedRowBasedOnRouteAndAction[item.COLUMN_NAME] = row[item.COLUMN_NAME]
                    }
                });
            }
        }else{
            modifiedRowBasedOnRouteAndAction = {...row};
        }

        let primaryGroups = {};
        let dropdownGroups = {};
        let codeGroups = {};

        Object.entries(modifiedRowBasedOnRouteAndAction).map((key, index) =>{
            console.log(key);
            const field = key[0];
            if (HIDDEN_FIELDS_IN_ROW_EXPANSION.indexOf(field) < 0) {
                
                const fieldType = getFieldType(field, Object.keys(codeFields), Object.keys(dropdownFields));
                debug && console.log(field + ": " + fieldType);

                if(nonEditableColumns.indexOf(field) >= 0){
                    primaryGroups[field] = key[1];
                }else{
                    if(fieldType === "dropdown" ){
                        // dropdownGroups[field] = key[1];
                        dropdownGroups[field] = ((key[1] !== null) && (key[1] !== undefined) && (typeof key[1] !== 'string')) ? key[1].toString() : key[1];
                    }else{
                        // codeGroups[field] = key[1];
                        codeGroups[field] = ((key[1] !== null) && (key[1] !== undefined) && (typeof key[1] !== 'string')) ? key[1].toString() : key[1];
                    }
                } 
            }
            
        });

        primaryGroups = Object.fromEntries(Object.entries(primaryGroups).sort());
        dropdownGroups = Object.fromEntries(Object.entries(dropdownGroups).sort());
        codeGroups = Object.fromEntries(Object.entries(codeGroups).sort());

        // Object.entries(dropdownGroups).map((key, index) => console.log(key));

        return(
            <div>
                {Object.entries(primaryGroups).map((key, index) =>     
                    <div>
                        <PrimaryKeyField 
                            fieldArray={key}
                            pending={showPending}
                        />
                        {key[0] === 'INGESTION_STATUS' &&
                            <button 
                                onClick={submitJob}
                                disabled={ key[1]=== 'PENDING' || showPending || row.PRIVILEGE === 'READ ONLY'}
                            >
                                Schedule Job
                            </button>
                        }
                    </div>
                )}

                {Object.entries(codeGroups).map((key, index) => 
                    <CodeField 
                        key={key[0]}
                        setState={setState}
                        setChanged={setChanged}
                        fieldArray={key}
                        columnDataTypes={columnDataTypes}
                        disabled={row.PRIVILEGE === 'READ ONLY'}
                        setEditMessage={setEditError}
                    />
                        
                )}

                {Object.entries(dropdownGroups).map((key, index) => 
                    <DropdownField
                        key={key[0]}
                        field={key[0]}
                        value={key[1]}
                        setState={setState}
                        setChanged={setChanged}
                        dropdownFields={dropdownFields}
                        route={route}
                        disabled={row.PRIVILEGE === 'READ ONLY'}
                    />  
                )}
            </div>
        )
    }

    return (
        <>
            <div className="row-expansion-button-div">
                {table === "ETLF_EXTRACT_CONFIG" &&
                    <div>
                        {/* this is the Linked Items button */}
                        <GenericTableModal
                            modalName={'ETLF_CUSTOM_CODE'}
                            tableName={'ETLF_CUSTOM_CODE'}
                            route={route}
                            EXTRACT_CONFIG_ID={row['EXTRACT_CONFIG_ID']}
                            privilege={row['PRIVILEGE']}
                        />
                    </div>}

                {(changed && row['PRIVILEGE'] !=='READ ONLY') ? <LoadableUpdateButton /> : ""}
            </div>

            <div className="detail-div-customCode">
                {editError !== '' &&
                    <div className={editMessageClassname}>
                        Status: {editError}
                    </div>
                }

                {table === 'ETLF_EXTRACT_CONFIG' &&
                    <>
                        <span style={{ 'fontWeight': "bold", 'marginLeft': '0px'}}>Route: </span>
                        <span style={{ 'fontWeight': "bold", 'marginLeft': '0px', 'color': 'green'}}>{route}</span>
                        <span style={{marginLeft: '5px', marginRight: '5px'}}>|</span>
                        <span style={{ 'fontWeight': "bold", 'marginLeft': '0px'}}>Action: </span>
                        <span style={{ 'fontWeight': "bold", 'marginLeft': '0px', 'color': 'green'}}>{action}</span>
                    </>
                }

                {/* make sure */}
                {table === 'ETLF_EXTRACT_CONFIG' 
                ? ( (routeConfigs !== undefined && route !=='') 
                        ? renderFieldByType() 
                        : <div>loading route configurations...</div>
                )
                : renderFieldByType()}

                <CustomizedLink row = {row}/>
            </div>
        </>
    )
});

export default RowExpansion;

            