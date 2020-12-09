import React, { useState, useEffect, useContext } from 'react';
import PrimaryKeyField from './PrimaryKeyField';
import CodeField from './CodeField';
import DropdownField from './DropdownField';
import { getDataType, getFieldType } from '../FormComponents/FormUtils';
import { WorkspaceContext } from '../../context/WorkspaceContext';

const DisplayField = ({ 
    setState, setChanged, row, primaryKeys, fieldArray, columnDataTypes, setEditMessage,
    codeFields, dropdownFields, route,
}) => {

    const {
        debug
    } = useContext(WorkspaceContext);
    
    //do not load id field of the row record
    const excludedFields = [
        "PRIVILEGE", "RN", "TOTAL_NUM_ROWS", "id", 
        // "ROUTE_ID", 'ACTION_ID'
    ];

    const field = fieldArray[0];
    const fieldType = getFieldType(field, codeFields, dropdownFields);

    if (excludedFields.indexOf(field) < 0) {
        const privi = row.PRIVILEGE;
        //Only allow edit for NON-PRIMARY KEYS fields 
        if (primaryKeys.indexOf(field) < 0
            // && typeof fieldArray[1] === 'string'
        ) {
            // debug && console.log("%c Field: ", "color: orange, font-weight:bold");
            // debug && console.log(field, ": ", privi);
            if (fieldArray[1] !== null && typeof fieldArray[1] !== 'string') {
                fieldArray[1] = fieldArray[1].toString();
            }
            if (privi !== 'READ ONLY') {
                // debug && console.log('Not Primary Key - Allow Edit');
                return fieldType === "dropdown" 
                    ? <DropdownField
                            field={field}
                            value={fieldArray[1]}
                            dropdownFields={dropdownFields}
                            setChanged={setChanged}
                            setState={setState}
                            route={route}
                        />
                    : <CodeField key={field}
                        setState={setState}
                        setChanged={setChanged}
                        fieldArray={fieldArray}
                        columnDataTypes={columnDataTypes}
                        disabled={false}
                        setEditMessage={setEditMessage}
                    />
            }
            else{
                return <CodeField key={field}
                    setState={setState}
                    setChanged={setChanged}
                    fieldArray={fieldArray}
                    columnDataTypes={columnDataTypes}
                    disabled={true}
                    setEditMessage={setEditMessage}
                />
            }
            
        }

        //For PRIMARY keys - do not allow edit
        else {
            return <PrimaryKeyField key={field}
                row={row}
                primaryKeys={primaryKeys}
                fieldArray={fieldArray} />
        }
    }

    return null;
}

export default DisplayField;