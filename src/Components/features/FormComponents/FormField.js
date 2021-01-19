import React, { useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FormEditableField from './FormEditableField';
import MultiSelectField from './MultiSelectField';
import { getFieldType, getFieldType2 } from './FormUtils';

const sm_left = "2";
const sm_right = "10";

const FormField = ({  
    field, requiredFields, values, dataTypes, 
    handleChange, handleBlur, touched, errors, disabled, 
    codeFields, dropdownFields 
}) => {

    const {
        table
    } = useContext(WorkspaceContext);

    //get the field type to determine what Component of Field to render
    // let fieldType = getFieldType(field, Object.keys(codeFields), Object.keys(dropdownFields));

    const multiSelectArr = 'multiSelect' in fieldTypesConfigs[table] 
        ? fieldTypesConfigs[table]['multiSelect'] 
        : [];
    
    let fieldType = getFieldType2(field, codeFields, dropdownFields, multiSelectArr);

    // console.log("Field type for " + field + ": " + fieldType);
    // console.log(codeFields);
    // console.log(values);
    // console.log("field: " + field + " , has value: "+ dropdownFields[field]);

    let dropdownOptions = [<option key='base' value='' >Select an item</option>];
    if(field in dropdownFields){
        dropdownFields[field].map(item => dropdownOptions.push(<option key={item} value={item}>{item}</option>));
    }
    
    // if (field === 'ROUTE_ID' || field === 'ACTION_ID') console.log("RouteID: ", values[field])

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
                                disabled={disabled}
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
                                handleChange(e);
                            }}
                            onBlur={handleBlur}
                            //Only RECREATE for TGT_TABLE_ACTION in R4A1
                            // disabled={disabled || (field === 'TGT_TABLE_ACTION' && routeCode === 'R4A1')}
                            disabled={disabled}
                            isValid={touched[field] && !errors[field]}
                            isInvalid={errors[field]}
                        >   
                            {dropdownOptions}
                            {/* {dropdownFields[field].map(groupID => <option key={groupID} value={groupID} >{groupID}</option>)} */}
                        </Form.Control>
                        
                    }

                    {(fieldType === 'multiSelect') &&
                        <MultiSelectField
                            field={field}
                            dropdownFields={dropdownFields}
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