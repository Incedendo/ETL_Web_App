import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';

import axios from 'axios';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

import DisplayField from './DisplayField'; 
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';

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
    if('metaData' in row) route = row.metaData.route;
    //remove PRIVILEGE from row:
    let modifiedRow = {...row};
    if('id' in modifiedRow) delete modifiedRow.id;
    if('metaData' in modifiedRow) delete modifiedRow.metaData;
    // delete modifiedRow.PRIVILEGE;

    let originalColumns = Object.keys(row).filter(key => ['id', 'PRIVILEGE', 'metaData'].indexOf(key) < 0);

    let row_without_metadata = {}
    Object.keys(row).map( key => {
        if(key !== 'metaData') row_without_metadata[key] = row[key]
    })
    
    const [state, setState] = useState(row_without_metadata);
    const [changed, setChanged] = useState(false)
    const [isLoading, setLoading] = useState(false);
    const [editMessage, setEditMessage] = useState('');
    const [editMessageClassname, setEditMessageClassname] = useState('');

    const primaryKeys = row['metaData']['primaryKeys'];

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
                testLocalUpdate();
                performUpdate(isSubscribed);
            }
        }

        //unsubscribe to the promise so if the component is unmounted while waiting for the promise
        //to revolve then it will not setState to unmounted component
        return () => isSubscribed = false;
    }, [isLoading, setEditMessage])

    debug && console.log(state);

    const testLocalUpdate = () => {

    }

    const performUpdate = (isSubscribed) =>{

        applyChanges();

        let update_status = "FAILURE";
        const sqlMergeStatement = generateMergeStatement(
            row['metaData'].database, 
            row['metaData'].schema, 
            row['metaData'].table, 
            row['metaData'].primaryKeys, 
            originalColumns, 
            state
        );

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
                                setEditMessage('Success Update');
                                setEditMessageClassname('successSignal');
                                update_status = 'SUCCESS';
                            }
                            else if (response.data[0]['number of rows updated'] === 0) {
                                setEditMessage('Error: Failed to update record');
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
                        setEditMessage(err.message);
                        setEditMessageClassname('errorSignal');
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

    const LoadableUpdateButton = () => (
        <button className="loadable-button"
            disabled={isLoading}
            onClick={!isLoading ? () => setLoading(true) : null} >
            {isLoading ? 'Updating...' : 'Update'}
        </button>
    )

    const ErrorMessage = () => (
        <div>
            {editMessage !== '' &&
                <div className={editMessageClassname}>
                <h4 >Status: </h4> {editMessage}
                </div>
            }
        </div>
    )

    const codeFields = fieldTypesConfigs[row['metaData'].table]['codeFields'];
    const unmodifiedDropdownFields = fieldTypesConfigs[row['metaData'].table]['dropdownFields'];

    debug && console.log(unmodifiedDropdownFields);
    return (
        <div key={row.id}>
            <ErrorMessage />
            <div className="row-expansion-button-div">
                {(editMessage === '' && changed && row['PRIVILEGE'] !== 'READ ONLY') ? <LoadableUpdateButton /> : ""}
            </div>
            
            <div className="detail-div">
                {Object.entries(modifiedRow).map((key, index) =>
                    key[0] !== 'metaData'
                        ? <DisplayField
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
                        : null
                )}
            </div>
        </div>
    )
}

export default GenericRowExpansion;