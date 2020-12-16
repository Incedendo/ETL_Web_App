import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import { WorkspaceContext } from '../../context/WorkspaceContext';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import LinkLogo16 from '../../../media/LinkIcon/link16x16.svg';
import LinkLogo12 from '../../../media/LinkIcon/link12x12.svg';
import '../../../css/codeField.scss';
// import '../../../css/'

const CodeField = ({ setState, setChanged, fieldArray, columnDataTypes, disabled, setEditMessage }) => {

    const {
        debug,
        routeConfigs,
        table
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
    const fieldsWithLinks = Object.keys(fieldTypesConfigs[table]['links'])

    const linksArr = fieldTypesConfigs[table]['links'][field];
    console.log(linksArr);

    return (

        <div
            key={fieldArray}
            style={{
                "textAlign": "left"
            }}>
            
            <div>
                
                {fieldsWithLinks.indexOf(field) >= 0 
                 && <div style={{'float': 'left'}}>
                    <Dropdown as={ButtonGroup}>
                        {/* <Button variant="success">Split Button</Button> */}

                        <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

                        <Dropdown.Menu>
                            {linksArr.map(linkObject => 
                                <Dropdown.Item 
                                    // bsPrefix='link-dropdown'
                                >
                                    <Link 
                                        to={{
                                            pathname: linkObject['LINK'],
                                            state: {
                                                'table': linkObject['TABLE'],
                                                'searchObj':{
                                                    [field]: checked_val
                                                }
                                            }
                                        }}
                                    >
                                        <img 
                                            style={{'float': 'left'}} 
                                            src={LinkLogo12} 
                                            alt="React Logo" 
                                            title={'This will link to table ' + linkObject['TABLE']}
                                        />
                                    </Link>
                                </Dropdown.Item>
                                
                            )}
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* <Link 
                        to={{
                            pathname: fieldTypesConfigs[table]['links'][field][0]['LINK'],
                            state: {
                                [field]: checked_val
                            }
                        }}
                    >
                        <img 
                            style={{'float': 'left'}} 
                            src={LinkLogo12} 
                            alt="React Logo" 
                            title={'This will link to table ' + fieldTypesConfigs[table]['links'][field][0]['TABLE']}
                        />
                    </Link> */}
                </div>}
                <div style={{ "marginTop": "20px", "fontWeight": "bold" }}>
                    {fieldArray[0]}:
                </div>
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
                    fontSize: 25,
                }}
            />

            

        </div>
    )
}

export default CodeField;