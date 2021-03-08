import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FormEditableField from './FormEditableField';
import MultiSelectField from './MultiSelectField';
import { getFieldType2 } from './FormUtils';

const FormField = ({  
    field, requiredFields, values, dataTypes, 
    handleChange, handleBlur, touched, errors, disabled, 
    codeFields, dropdownFields 
}) => {

    const {
        debug,
        table
    } = useContext(WorkspaceContext);

    const [placeholder, setPlaceholder] = useState('');

    useEffect(() => {
        if(table === 'CATALOG_ENTITY_DOMAIN')
            setPlaceholder('Select a target db, schema, table combination');
        else if(table === 'DATA_STEWARD_DOMAIN')
            setPlaceholder('Select Domains');
    }, [table]);

    //get the field type to determine what Component of Field to render
    // let fieldType = getFieldType(field, Object.keys(codeFields), Object.keys(dropdownFields));

    const multiSelectArr = 'multiSelect' in fieldTypesConfigs[table] 
        ? fieldTypesConfigs[table]['multiSelect'] 
        : [];
    
    let fieldType = getFieldType2(field, codeFields, dropdownFields, multiSelectArr);

    // debug && console.log("Field type for " + field + ": " + fieldType);
    // debug && console.log(codeFields);
    // debug && console.log(values);
    // debug && console.log("field: " + field + " , has value: "+ dropdownFields[field]);

    // let dropdownOptions = ['Select an item'];
    // if(field in dropdownFields){
    //     dropdownFields[field].map(item => dropdownOptions.push(item));
    // }

    let dropdownOptions = [{
        label: 'Select an item',
        value: ''
    }];
    if(field in dropdownFields){
        dropdownFields[field].map(item => dropdownOptions.push({
            label: item,
            value: item
        }));
    }
    
    // if (field === 'ROUTE_ID' || field === 'ACTION_ID') debug && console.log("RouteID: ", values[field])

    return (
        // <Row>
            <Form.Group key={field} as={Col} controlId={"formGroup" + field}>
                {/* <Form.Label column sm={sm_left}>{field}{required === 'Y' ? "*" : ""} </Form.Label> */}
                <Form.Label>
                    {field}
                    {/* {requiredFields.indexOf(field) >= 0 ? "*" : ""}  */}
                </Form.Label>
                {/* <Col sm={sm_right}> */}

                    {(fieldType === "text") &&
                        <>
                            <Form.Control
                                type="text"
                                // id={field}
                                name={field}
                                value={values[field]}
                                onChange={e => {
                                    handleChange(e);
                                }}
                                onBlur={handleBlur}
                                // placeholder={required === 'Y' ? "required " + dataTypes[field] : "optional " + dataTypes[field]}
                                // placeholder={requiredFields.indexOf(field) >= 0 ? "required " + dataTypes[field] : "optional " + dataTypes[field]}
                                disabled={disabled || field === 'EXTRACT_CONFIG_ID'}
                                isValid={touched[field] && !errors[field]}
                                isInvalid={errors[field]}
                            />
                            <a href=''></a>
                        </>
                    }

                    {(fieldType === 'dropdown') &&
                        <Form.Control
                            as="select"
                            name={field}
                            value={values[field]}
                            onChange={(e) => {
                                debug && console.log(e.target.value);
                                debug && console.log(dropdownOptions);
                                debug && console.log(values);
                                handleChange(e);
                            }}
                            onBlur={handleBlur}
                            //Only RECREATE for TGT_TABLE_ACTION in R4A1
                            // disabled={disabled || (field === 'TGT_TABLE_ACTION' && routeCode === 'R4A1')}
                            disabled={disabled}
                            isValid={touched[field] && !errors[field]}
                            isInvalid={errors[field]}
                        >   
                            {dropdownOptions.map(item => 
                                // <option key={item} value={item} >{item}</option>
                                <option key={item.label} value={item.value} >{item.label}</option>
                            )}
                        </Form.Control>
                        
                    }

                    {(fieldType === 'multiSelect') &&
                        <MultiSelectField
                            field={field}
                            isDatCatForm={true}
                            dropdownFields={dropdownFields}
                            placeholder={placeholder}
                            touched={touched}
                            errors={errors}
                        />
                    }

                    {(fieldType === 'code') &&
                        <FormEditableField
                            field={field}
                            value={codeFields[field]}
                            touched={touched}
                            errors={errors}
                        />
                    }

                    <Form.Control.Feedback type="invalid">
                        {errors[field]}
                    </Form.Control.Feedback>
                {/* </Col> */}
            </Form.Group>
        // </Row> 
    )
}

export default FormField;