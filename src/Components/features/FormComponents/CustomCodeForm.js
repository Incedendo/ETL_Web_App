import React, { useState, useEffect, useContext } from 'react';
import { Formik, Field } from 'formik';
import * as yup from 'yup'; // for everything
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
// import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import FormField from './FormField';
import { fieldTypesConfigs, autofilledFields } from '../../context/FieldTypesConfig';
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import '../../../css/forms.scss';

import { WorkspaceContext } from '../../context/WorkspaceContext';

const CustomCodeForm = ({ table, EXTRACT_CONFIG_ID,  routeCode, setShow ,insertUsingMergeStatement }) => {

    const {
        debug,
        // insertUsingMergeStatement, 
        genericTableDataTypeObj
    } = useContext(WorkspaceContext);

    const codeFields = fieldTypesConfigs[table]['codeFields'];
    const [dropdownFields, setDropdownFields] = useState(fieldTypesConfigs[table]['dropdownFields']);
    
    debug && console.log(dropdownFields);

    //Jobs Configurations
    const [schema, setSchema] = useState([]);
    const [initialStates, setInitialStates] = useState({
        ACTIVE: 'Y',
        EXTRACT_CONFIG_ID: EXTRACT_CONFIG_ID, 
        CODE_TYPE: 'ADHOC_QUERY',
        EXEC_SEQ: 1,
        CODE_DESCRIPTION: '',
    });
    const [fields, setFields] = useState([]);
    const [validating, setValidating] = useState(false);
    const [requiredFields, setRequiredFields] = useState({});

    // const requiredFields = {
    //     "CODE_DESCRIPTION": "Y",
    //     "CODE": "Y",
    //     "EXEC_SEQ": "Y",
    // }

    useEffect(() => {
        debug && console.log("open CustomCOdeForm, reset DropdownFields");
        if (routeCode === 'R2A1' || routeCode === 'R12A1'){
            setDropdownFields({ ...dropdownFields,
                ['CODE_TYPE']: ['BLOCK_FORMATION']
            })
            debug && console.log(dropdownFields);

            setInitialStates({
                ...initialStates,
                'CODE_TYPE': 'BLOCK_FORMATION'
            })
        }

    }, []);

    useEffect(()=>{
        debug && console.log(validating)
    }, [validating])

    // get the Data Type of each columns in the row.
    useEffect(() => {
        debug && console.log(genericTableDataTypeObj);
        if(Object.keys(genericTableDataTypeObj).length > 0){
            let all_fields = Object.keys(genericTableDataTypeObj);
            let fields = all_fields.filter(col => Object.keys(autofilledFields).indexOf(col) < 0);
            debug && console.log(fields);
            setFields(fields);

            const required = fields.reduce((o, field) =>({...o, [field]: "Y"}), {});

            debug && console.log(required);
            setRequiredFields(required);

            let formValidationsInfo = [];
            fields.map(col => {
                let custom_config = {};
                custom_config.id = col;
                custom_config.placeholder = "this field is required";
                custom_config.validationType = genericTableDataTypeObj[col];
                custom_config.validations = [{
                    type: "required",
                    params: ["this field is required"]
                }];
                formValidationsInfo.push(custom_config);
                return;
            });

            debug && console.log(fields);
            debug && console.log(formValidationsInfo);

            let temp_schema = formValidationsInfo.reduce(createYupSchema, {});
            let yup_schema = yup.object().shape(temp_schema);

            //have to use setState here to FORCE UPDATE the object in the form
            setSchema(yup_schema);

        }
    }, [genericTableDataTypeObj]);

    function getInsertValues(table_fields, values){
        let res = [];
        table_fields.map(field => {
            let temp = '';
            if (Object.keys(autofilledFields).indexOf(field) < 0){
                if (genericTableDataTypeObj[field] === 'string') {
                    temp += "'" + values[field] + "'";
                } else {
                    temp += values[field];
                }
            }else{
                temp += autofilledFields[field];
            }
            res.push(temp);
            return;
        })

        return res.toString();
    }


    function insertCustomCode(values) {

        const table_fields = Object.keys(genericTableDataTypeObj);

        const insert_values = getInsertValues(table_fields, values);

        const sqlInsertStatement = 
        'INSERT INTO SHARED_TOOLS_DEV.ETL.ETLF_CUSTOM_CODE ('
            + table_fields.toString() +') VALUES ('
            + insert_values + ");";
        
        debug && console.log(sqlInsertStatement);

        insertUsingMergeStatement(sqlInsertStatement, { GROUP_ID: 'Not Applicable' }, setValidating, true);
        setShow(false);
    }

    return (
        <div>
            {!fields.length
                ?
                <div>Loading Custom Code Form...</div>
                :
                <Formik
                    validationSchema={schema}

                    //destructure the action obj into {setSubmitting}
                    onSubmit={(values, { resetForm, setErrors, setSubmitting }) => {
                        console.log('values: ', values);
                        insertCustomCode(values);
                        setValidating(true);
                        // setShow(false);
                    }}
                    initialValues={initialStates}
                >
                    {({
                        handleSubmit, isSubmitting,
                        handleChange,
                        handleBlur,
                        values,
                        touched,
                        isValid,
                        isInvalid,
                        errors,
                    }) => (
                            <Form
                                noValidate
                                onSubmit={handleSubmit}>

                                {fields.map(field =>
                                    <FormField
                                        key={field}
                                        field={field}
                                        required = {requiredFields[field]}
                                        values={values}
                                        dataTypes={genericTableDataTypeObj}
                                        handleChange={handleChange}
                                        handleBlur={handleBlur}
                                        touched={touched}
                                        errors={errors}
                                        disabled={field==='EXTRACT_CONFIG_ID'}
                                        codeFields={codeFields}
                                        dropdownFields={dropdownFields}
                                    />
                                )}

                                <div className="central-spinning-div">
                                    <Button
                                        // variant="primary"
                                        type="submit" disabled={isSubmitting}
                                    >
                                        
                                        {validating &&
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        }

                                        {!validating
                                            ? <span style={{ 'marginLeft': '5px' }}>Add</span>
                                            : <span style={{ 'marginLeft': '5px' }}>Adding...</span>
                                        }
                                    </Button>
                                </div>
                            </Form>
                        )}
                </Formik>
            }
        </div>
    )
}

export default CustomCodeForm;