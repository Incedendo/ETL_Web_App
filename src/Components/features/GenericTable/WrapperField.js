import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import { WorkspaceContext } from '../../context/WorkspaceContext';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

import CodeField from './CodeField';
import DropdownField from './DropdownField';
import PrimaryKeyField from './PrimaryKeyField';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';

const WrapperField = ({
    type, field, value,
    setState, setChanged, row, fieldArray, columnDataTypes, disabled, setEditMessage
    , dropdownFields, route
}) => {
    const {
        debug,
        table,
    } = useContext(WorkspaceContext);


    //perform on the spot type validation for each field
    console.log("[type: " + type + "] key: " + field);
    console.log(row);

    const fieldsWithLinks = Object.keys(fieldTypesConfigs[table]['links'])

    const linksArr = fieldTypesConfigs[table]['links'][field];
    console.log(linksArr);

    return(
        <div style={{
            "textAlign": "left"
        }}>
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
                </div>
            }

            {type === 'dropdown' && 
                <DropdownField
                    key={field}
                    field={field}
                    value={value}
                    dropdownFields={dropdownFields}
                    setChanged={setChanged}
                    setState={setState}
                    route={route}
                />
            }

            {type === 'code' &&
                <CodeField 
                    key={field}
                    setState={setState}
                    setChanged={setChanged}
                    fieldArray={fieldArray}
                    columnDataTypes={columnDataTypes}
                    disabled={disabled}
                    setEditMessage={setEditMessage}
                />
            }

            {type === 'primaryKey' && 
                <PrimaryKeyField 
                    fieldArray={fieldArray} 
                />
            }
        </div>
    )
}

export default WrapperField;