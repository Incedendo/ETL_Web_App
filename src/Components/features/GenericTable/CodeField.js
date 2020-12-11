import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';

const CodeField = ({ setState, setChanged, fieldArray, columnDataTypes, disabled, setEditMessage }) => {

    const {
        debug,
        routeConfigs,
    } = useContext(WorkspaceContext);

    // debug && console.log(etlColumnConfigs);
    // debug && console.log(etlRowConfigs);

    const field = fieldArray[0]
    let checked_val = fieldArray[1];

    if (fieldArray[1] === null) {
        checked_val = 'null value'
    }

    const [value, setValue] = useState(checked_val);

    // debug && console.log(field, ": ", value)
    if(field === "ROUTE_ID"){
        let current_route_id = fieldArray[1];
        Object.values(routeConfigs).map( route =>{
            if(current_route_id === route.id.toString()){
                debug && console.log("Route code: ", route.code);
                debug && console.log("Route source: ", route.source);
                debug && console.log("Route target: ", route.target);
            }
            return;
        })
    }

    useEffect(() => {
        setState(prevState => {
            // Object.assign would also work
            return { ...prevState, [field]: value };
        });
    }, [value])


    const validate_job_field = (value) => {
        debug && console.log(columnDataTypes);
        const expected_type = columnDataTypes[field];

        // let derivedType;
        // /^[0-9\b]+$/.test(value)
        //     ? derivedType = 'number'
        //     : derivedType = 'string'

        // if (derivedType === columnDataTypes[field]) {
        if (expected_type === 'number' && !/^[0-9\b]+$/.test(value)){
            const errMsg = 'Expect type ' + columnDataTypes[field] + ' for field ' + field
            setEditMessage(errMsg);
        }
        else {
            setValue(value);
            setChanged(true);
            setEditMessage('');
        }
    }

    //perform on the spot type validation for each field
    return (

        <div
            key={fieldArray}
            style={{
                "textAlign": "left"
            }}>

            <div style={{ "marginTop": "20px", "fontWeight": "bold" }}>
                {fieldArray[0]}:
            </div>

            <Editor
                value={value}
                onValueChange={
                    value => validate_job_field(value)
                }
                disabled={disabled}
                highlight={code => highlight(code, languages.js, 'javascript')}
                padding={10}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 15,
                }}
            />

        </div>
    )
}

export default CodeField;