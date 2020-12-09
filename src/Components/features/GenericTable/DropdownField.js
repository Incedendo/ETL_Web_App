import React, { useState, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const DropdownField = ({ 
    privilege, field, value, dropdownFields, setChanged, setState, route,
}) => {

    const {
        debug,
        routeConfigs,
    } = useContext(WorkspaceContext)

    const [currentVal, setCurrentVal] = useState(value);

    let updated_dropdownFields = { ...dropdownFields };
    
    if (route === 'Snowflake to Snowflake'
        || route === 'Oracle to Oracle'
    ){
        updated_dropdownFields['CODE_TYPE'] = ['BLOCK FORMATION']
    }

    // debug && console.log(updated_dropdownFields);

    return (
        <div>
            <div style={{ 
                "fontWeight": "bold"
            }}>
                {field}:
            </div>
            {/* {privilege !== 'READ ONLY' && */}
                <DropdownButton
                    id="dropdown-basic-button"
                    size="sm"
                    title={!currentVal ? 'Select' : currentVal}
                    disabled={
                        field === "ROUTE_ID" 
                        || field === 'ACTION_ID' 
                        // || (field === 'CODE_TYPE' && route === 'Snowflake to Snowflake') 
                    }
                >
                    {updated_dropdownFields[field].map(val =>
                        <Dropdown.Item as="button" key={val}
                            onClick={() => {

                                if (currentVal === null || val.toString() !== currentVal.toString()) {
                                    debug && console.log(routeConfigs);
                                    setCurrentVal(val);
                                    
                                    setState(prevState => {
                                        if(field === 'SOURCE_SYSTEM_ID' || field === 'TARGET_SYSTEM_ID'){
                                            return { ...prevState, [field]: (val.split('-')[0].trim())*1 };
                                        }
                                        
                                        return { ...prevState, [field]: val };
                                    });
                                }

                                if (val.toString() === value) setChanged(false);
                                else setChanged(true);
                            }}
                        >
                            {val}
                        </Dropdown.Item>
                    )}

                </DropdownButton>
            {/* } */}

            {/* {privilege === 'READ ONLY'
                && <p className="readOnly">{value}</p>
            } */}
        </div>
    )
}

export default DropdownField;