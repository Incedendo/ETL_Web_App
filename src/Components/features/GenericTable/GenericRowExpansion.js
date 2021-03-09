import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';

import axios from 'axios';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

import DisplayField from './DisplayField'; 
import PrimaryKeyField from '../GenericTable/PrimaryKeyField';
import CodeField from '../GenericTable/CodeField';
import DropdownField from '../GenericTable/DropdownField';

import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import { getDataType, getFieldType } from '../FormComponents/FormUtils';

import { generateMergeStatement } from '../../SQL_Operations/Insert';
import '../../../css/rowExpansion.scss';

// const url = "https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/update"
const UPDATE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/update';

const options = {
    headers: {
        'Content-Type': 'application/json'
    },
}

const GenericRowExpansion = ({ row, ...rest }) => {

    const {
        debug,
        genericTableDataTypeObj,
        performAuditOperation
    } = useContext(WorkspaceContext);

    const {
        processValueChange,
        applyChanges,
        cancelChanges,
      } = rest;

    debug && console.log(row);

    let route = '';
    
    //remove PRIVILEGE from row:
    // let modifiedRow = {...row};
    // if('id' in modifiedRow) delete modifiedRow.id;
    // if('metaData' in modifiedRow) delete modifiedRow.metaData;
    // delete modifiedRow.PRIVILEGE;

    let originalColumns = Object.keys(row).filter(key => ['id', 'PRIVILEGE', 'metaData'].indexOf(key) < 0);

    let row_without_metadata = {}
    Object.keys(row).map( key => {
        if(key !== 'metaData') row_without_metadata[key] = row[key];
    })

    debug && console.log(row_without_metadata)
    
    const [state, setState] = useState(row_without_metadata);
    const [changed, setChanged] = useState(false)
    const [isLoading, setLoading] = useState(false);
    const [editMessage, setEditMessage] = useState('');
    const [editMessageClassname, setEditMessageClassname] = useState('');

    useEffect(() => {
        if(editMessage !== '') {
            setTimeout(() => {
                setEditMessage('');
            }, 1000);
        }
    }, [editMessage])
    
    const [primaryKeys, setPrimaryKeys] = useState(row['metaData']['primaryKeys'] );

    const nonEditableColumns = row['metaData'] !== undefined 
                        ? row['metaData']['primaryKeys'] 
                        : ['CUSTOM_CODE_ID'];

    const codeFields = row['metaData'] !== undefined 
                        ? fieldTypesConfigs[row['metaData'].table]['codeFields']
                        : {
                            'CODE': 'Enter your code here...',
                        };

    const unmodifiedDropdownFields = row['metaData'] !== undefined 
                        ? fieldTypesConfigs[row['metaData'].table]['dropdownFields']
                        : {
                            'ACTIVE': ['Y', 'N'],
                            'CODE_TYPE': ['ADHOC_QUERY', 'BLOCK_FORMATION']
                        };

    // useEffect(() => {
    //     debug && console.log('New State Obj: ', state);
    // }, [state]);

    // useEffect(() => {
    //     debug && console.log(row);
    //     debug && console.log('Data Type object for Edit Row: ', genericTableDataTypeObj);
    // }, [genericTableDataTypeObj]);

    useEffect(() => {
        let isMounted = true;
        
        if (editMessage.includes('Expect type')){
            setEditMessageClassname('errorSignal')
        }

        return (() => isMounted = false)
    }, [editMessage])

    //make api call to UPDATE everytime isLoading changes
    useEffect(() => {
        let isSubscribed = true;

        if (isLoading) {
            if (primaryKeys.length === 0) {
                setEditMessage('Error: No Primary Key on table');
                setEditMessageClassname('errorSignal');
                setLoading(false);
                return;
            } else {
                // testLocalUpdate();
                performUpdate(isSubscribed);
            }
        }

        //unsubscribe to the promise so if the component is unmounted while waiting for the promise
        //to revolve then it will not setState to unmounted component
        return () => isSubscribed = false;
    }, [isLoading, setEditMessage])

    debug && console.log(state);

    const performUpdate = (isSubscribed) =>{
        let update_status = "FAILURE";
        const primaryKey = 'CUSTOM_CODE_ID';
        let sqlMergeStatement = '';
        if('metaData' in row){
            sqlMergeStatement = generateMergeStatement(
                row['metaData'].database, 
                row['metaData'].schema, 
                row['metaData'].table, 
                row['metaData'].primaryKeys, 
                originalColumns, 
                state
            );
        }else{
            sqlMergeStatement = generateMergeStatement(
                'SHARED_TOOLS_DEV', 
                'ETL', 
                'ETLF_CUSTOM_CODE', 
                primaryKey, 
                originalColumns, 
                state
            );
        }

        // Can't use performEditOperation in Context
        // bc need to ASYNCHRONOUSLY setLoading to false
        // after AXIOS call
        const data = {
            sqlUpdateStatement: sqlMergeStatement,
        };

        const userConfirmed = " Please confirm Update SQL statement: " + sqlMergeStatement;

        if (window.confirm(userConfirmed)) {
            // let newRows = rows.map(obj => obj['EXTRACT_CONFIG_ID'] === state['EXTRACT_CONFIG_ID'] ? state : obj);
            // let newRows = rows.map(obj => obj[primaryKey] === state[primaryKey] ? state : obj);
            // setRows(newRows);

            let reloadOnSuccess = false;

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
                                setEditMessage('Success Update');
                                setEditMessageClassname('successSignal');
                                update_status = 'SUCCESS';

                                reloadOnSuccess = true;
                            }
                            // else if (response.data[0]['number of rows inserted'] > 0) {
                            //     setEditMessage('Error: Failed to update record');
                            //     setEditMessageClassname('errorSignal');
                            // }
                        }
                    } else {
                        return null;
                    }
                })
                .catch(err => {
                    if (isSubscribed) {
                        debug && console.log(err);
                        setEditMessage(err.message);
                        setEditMessageClassname('errorSignal');
                    } else {
                        return null;
                    }
                })
                .finally(() => {
                    if (isSubscribed) {
                        setLoading(false);
                        setChanged(false);
                        if(reloadOnSuccess){
                            // axiosCallToGetTable(sqlGetStmt);
                        }
                        performAuditOperation('UPDATE', primaryKeys, state, table, sqlMergeStatement, update_status)
                    } else {
                        return null;
                    }
                });
        } else {
            setLoading(false);
        }
    }

    const LoadableUpdateButton = () => (
        <button className="generic-loadable-button"
            disabled={isLoading}
            onClick={!isLoading ? () => setLoading(true) : null} >
            {isLoading ? 'Updating...' : 'Update'}
        </button>
    )

    const ErrorMessage = () => (
        <div>
            {editMessage !== '' &&
                <div className={editMessageClassname}>
                    Status: {editMessage}
                </div>
            }
        </div>
    )

    

    debug && console.log(unmodifiedDropdownFields);
    
    const excludedFields = ['CREATEDDT', 'LASTMODIFIEDDT', 'EXTRACT_CONFIG_ID', 'id', 'metaData', 'PRIVILEGE'];

    const renderFieldByType = () => {

        debug && console.log("renderFieldByType for NON ETLF EXTRACT CONFIG")
        let primaryGroups = {};
        let dropdownGroups = {};
        let codeGroups = {};
        let allDisplayedKeys = [];

        debug && console.log(nonEditableColumns);
        // debug && console.log(codeFields);
        // debug && console.log(dropdownFields);
        
        debug && console.log(row);
        Object.entries(row).map((key, index) =>{
            debug && console.log(key);
            const field = key[0];
            if ( excludedFields.indexOf(field) < 0) {
                
                const fieldType = getFieldType(field, Object.keys(codeFields), Object.keys(unmodifiedDropdownFields));
                debug && console.log(field + ": " + fieldType);

                if(nonEditableColumns.indexOf(field) >= 0){
                    primaryGroups[field] = key[1];
                }else{
                    if(fieldType === "dropdown" ){
                        // dropdownGroups[field] = key[1];
                        dropdownGroups[field] = ((key[1] !== null) && (typeof key[1] !== 'string')) ? key[1].toString() : key[1];
                    }else{
                        // codeGroups[field] = key[1];
                        codeGroups[field] = ((key[1] !== null) && (typeof key[1] !== 'string')) ? key[1].toString() : key[1];
                    }
                } 

                allDisplayedKeys.push(field);
            }
            
        });

        Object.fromEntries(Object.entries(primaryGroups).sort());
        Object.fromEntries(Object.entries(dropdownGroups).sort());
        Object.fromEntries(Object.entries(codeGroups).sort());

        debug && console.log(primaryGroups);
        // debug && console.log(dropdownGroups);
        // debug && console.log(codeGroups);

        return(
            <>
                {Object.entries(primaryGroups).sort().map((key, index) =>      
                    <div>
                        <PrimaryKeyField 
                            fieldArray={key}
                            pending={false}
                        />
                    
                    </div>
                    
                )}

                {Object.entries(codeGroups).sort().map((key, index) => 
                    <CodeField 
                        key={key[0]}
                        setState={setState}
                        setChanged={setChanged}
                        fieldArray={key}
                        columnDataTypes={genericTableDataTypeObj}
                        disabled={row.PRIVILEGE === 'READ ONLY'}
                        setEditMessage={setEditMessage}
                    />
                        
                )}

                {Object.entries(dropdownGroups).map((key, index) => 
                    <DropdownField
                        key={key[0]}
                        field={key[0]}
                        value={key[1]}
                        setState={setState}
                        setChanged={setChanged}
                        dropdownFields={unmodifiedDropdownFields}
                        route={route}
                        disabled={row.PRIVILEGE === 'READ ONLY'}
                    />  
                )}
            </>
        )
    }

    return (
        <div key={row.id}>
            <div className="row-expansion-button-div">
                {(editMessage === '' && changed && row['PRIVILEGE'] !== 'READ ONLY') ? <LoadableUpdateButton /> : ""}
            </div>
            
            <div className="detail-div">
                <ErrorMessage />
                {/* {Object.entries(modifiedRow).map((key, index) =>
                    (key[0] !== 'metaData' && excludedFields.indexOf(key[0]) < 0)
                        && <DisplayField
                            setState={setState}
                            setChanged={setChanged}
                            key={index}
                            row={modifiedRow}
                            primaryKeys={primaryKeys}
                            //key in (key, index) is a 2-element array with format [field, value] 
                            //where field is the attribute of the object
                            //and value is the actual value of the attribute.
                            fieldArray={key}
                            columnDataTypes={genericTableDataTypeObj}
                            setEditMessage={setEditMessage}
                            codeFields={codeFields}
                            dropdownFields={unmodifiedDropdownFields}
                            route={route}
                        />
                )} */}
                {renderFieldByType()}
            </div>
        </div>
    )
}

export default GenericRowExpansion;