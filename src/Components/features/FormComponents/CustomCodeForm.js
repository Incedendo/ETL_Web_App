import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Formik, Field } from 'formik';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
// import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import FormField from './FormField';
import { fieldTypesConfigs, autofilledFields } from '../../context/FieldTypesConfig';
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import { SELECT_URL, ARN_APIGW_GET_SELECT } from '../../context/URLs';
import '../../../css/forms.scss';

import { WorkspaceContext } from '../../context/WorkspaceContext';

const CustomCodeForm = ({ table, EXTRACT_CONFIG_ID,  customCodeDataTypeObj, setShow , insertUsingMergeStatement }) => {
    
    const { authState } = useOktaAuth();

    const {
        debug, appIDs,
        genericTableDataTypeObj,
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
    const [dataTypeObj, setDataTypeObj] = useState(customCodeDataTypeObj);
    const [customCodeID, setCustomCodeID] = useState(null);

    useEffect(() => {
        debug && console.log("customCodeID: " + customCodeID);
        
    }, [customCodeID]);

    useEffect(()=>{
        debug && console.log(validating)
    }, [validating])

    useEffect(()=>{
        const abortController = new AbortController();
        
        const { accessToken } = authState;
        let sql = `select SHARED_TOOLS_DEV.ETL.ETLFSEQ.NEXTVAL from dual;`;
        axios.get(SELECT_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                'authorizorToken': accessToken
            },
            params: { //params maps to event.queryStringParameters
                sqlStatement: sql,
            }
        })
        //have to setState in .then() due to asynchronous opetaions
        .then(response => {
            setCustomCodeID(response.data[0].NEXTVAL);
        });

        return () => {
            abortController.abort();
        };
    }, []);

    // get the Data Type of each columns in the row.
    useEffect(() => {
        debug && console.log(dataTypeObj);
        if(Object.keys(dataTypeObj).length > 0){
            let all_fields = Object.keys(dataTypeObj);
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
                custom_config.validationType = dataTypeObj[col];
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
    }, [dataTypeObj]);

    function getInsertValues(table_fields, values){
        let res = [];
        table_fields.map(field => {
            let temp = '';
            if (Object.keys(autofilledFields).indexOf(field) < 0){
                if (dataTypeObj[field] === 'string') {
                    let checkedStringForSingleQuote = values[field].replace(/'/g, "\\'");
                    temp += "'" + checkedStringForSingleQuote + "'";
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

        const table_fields = Object.keys(dataTypeObj);

        const insert_values = getInsertValues(table_fields, values);

        const sqlInsertStatement = 
        'INSERT INTO SHARED_TOOLS_DEV.ETL.ETLF_CUSTOM_CODE ('
            + table_fields.toString() +') VALUES ('
            + insert_values + ");";
        
        debug && console.log(sqlInsertStatement);

        let updatedValue = {...values, 'CUSTOM_CODE_ID': customCodeID}

        insertUsingMergeStatement(sqlInsertStatement, updatedValue, setValidating, true);
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
                        debug && console.log('values: ', values);
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
                                        type="submit" 
                                        disabled={isSubmitting 
                                            // || customCodeID === null
                                        }
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