import React, { useContext } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormEditableField from './FormEditableField';
import { getFieldType } from './FormUtils';

import { WorkspaceContext } from '../../context/WorkspaceContext';

const sm_left = "2";
const sm_right = "10";

const FormField = ({  field, required, values, dataTypes, handleChange, handleBlur, touched, errors, disabled, codeFields, dropdownFields }) => {

    //get the field type to determine what Component of Field to render
    let fieldType = getFieldType(field, codeFields, dropdownFields);

    // if (field === 'ROUTE_ID' || field === 'ACTION_ID') console.log("RouteID: ", values[field])

    return (
        <Form.Group key={field} as={Row} controlId={"formGroup" + field}>
            <Form.Label column sm={sm_left}>{field}{required === 'Y' ? "*" : ""} </Form.Label>
            <Col sm={sm_right}>

                {(fieldType === "text") &&
                    <Form.Control
                        type="text"
                        // id={field}
                        name={field}
                        value={values[field]}
                        onChange={e => {
                            handleChange(e);
                        }}
                        onBlur={handleBlur}
                        placeholder={required === 'Y' ? "required " + dataTypes[field] : "optional " + dataTypes[field]}
                        disabled={disabled}
                        isValid={touched[field] && !errors[field]}
                        isInvalid={errors[field]}
                    />
                }

                {(fieldType === 'dropdown') &&
                    <Form.Control
                        as="select"
                        name={field}
                        value={values[field]}
                        onChange={(e) => {
                            handleChange(e);
                            // if (field === "WORK_GROUP_ID") {
                            //     let temp = sourceTableList.filter(item => item['GROUP_ID'].toString() === e.target.value);
                            //     let tables = temp.map(item => item['SOURCE_TABLE'])
                            //     // tables.unshift('Select Source Table');
                            //     setSourceTables(tables);
                            // }
                        }}
                        onBlur={handleBlur}
                        //Only RECREATE for TGT_TABLE_ACTION in R4A1
                        // disabled={disabled || (field === 'TGT_TABLE_ACTION' && routeCode === 'R4A1')}
                        disabled={disabled}
                        isValid={touched[field] && !errors[field]}
                        isInvalid={errors[field]}
                    >
                        {dropdownFields[field].map(groupID => <option key={groupID} value={groupID} >{groupID}</option>)}
                    </Form.Control>
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
            </Col>
        </Form.Group>
    )
}

export default FormField;