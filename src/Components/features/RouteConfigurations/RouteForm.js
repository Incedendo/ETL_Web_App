import React, { useState, useContext, useEffect, useRef } from 'react';
import { Formik } from 'formik';
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import FormField from '../FormComponents/FormField';
import SubmitButton from '../FormComponents/SubmitButton';
import { WorkspaceContext } from '../../context/WorkspaceContext';
// import { createYupSchema } from "./yupSchemaCreator";
import { generateMergeStatement } from '../../SQL_Operations/Insert';
import axios from 'axios';
import '../../../css/forms.scss';

const TEST_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/test';

const RouteForm = ({ 
    routeOptions, route, states,
    requiredFields, optionalFields, validationSchema, setShow, dropdownFields
}) => {

    const {
        debug,
        appIDs,
        database,
        schema,
        table,
        insertUsingMergeStatement,
        columnDataTypes,
        routeConfigs,
        codeFields,
    } = useContext(WorkspaceContext);

    const [validating, setValidating] = useState(false);
    const [insertMessage, setInsertMessage] = useState('');
    const [showOptional, toggleOptional] = useState(false);

    const mounted = useRef(true);

    useEffect(()=>{
        if(debug){
            console.log("current states: ", states);
            console.log("routeOptions: ", routeOptions);
            console.log(requiredFields);
            console.log(optionalFields);
        }
    }, []);

    useEffect(()=>{
        mounted.current = true;
        
        if(validating){

        }

        return () => mounted.current = false;
    }, [validating])

    function getMergeStatement(values) {
        debug && console.log(values);
        values['CREATEDDT'] = "CURRENT_TIMESTAMP::timestamp_ntz";
        values['LASTMODIFIEDDT'] = "CURRENT_TIMESTAMP::timestamp_ntz";

        if (routeOptions[route]['SRC_TECH'] !== null){
            if (typeof(values.SOURCE_SYSTEM_ID) === 'string'){
                values.SOURCE_SYSTEM_ID = values.SOURCE_SYSTEM_ID.split('-')[0].trim()*1;
            }
        }
            
        if (routeOptions[route]['TGT_TECH'] !== null){
            if (typeof (values.TARGET_SYSTEM_ID) === 'string'){
                values.TARGET_SYSTEM_ID = values.TARGET_SYSTEM_ID.split('-')[0].trim()*1;
            }
        }
        
        const primaryKeys = ['SOURCE_TABLE', 'EXTRACT_CONFIG_ID'];
        const columns = Object.keys(values);
        const sqlInsertStatement = generateMergeStatement(
            database,
            schema,
            table,
            primaryKeys,
            columns,
            values)
        debug && console.log(sqlInsertStatement);
        return sqlInsertStatement;
    }

    const test_UniqueKeys_For_Insert_ETLF_EXTRACT_CONFIG = async values => {
        // const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/test';

        // console.log("Source table is: ", values['SOURCE_TABLE']);
        // if (updatedValues['SOURCE_TABLE'] === undefined) {
        //     updatedValues['SOURCE_TABLE'] = '';
        // };

        const test_statement =
            `SELECT
            (
                SELECT COUNT(1) FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG"
                WHERE GROUP_ID = ` + values['GROUP_ID'] + `
                AND '` + values['SOURCE_TABLE'] + `' = NVL(SOURCE_TABLE,'')
            ) as Combi;`;

        debug && console.log('Test sql: ', test_statement);

        const test_result = await axios.get(TEST_URL, {
            //params maps to event.queryStringParameters in lambda
            params: {
                sql_statement: test_statement,
            }
        })

        // console.log(test_result.data);
        debug && console.log(values);
        if (test_result.data[0]['COMBI'] === 0) {
            debug && console.log('Proceed to Insert');
            insertUsingMergeStatement(getMergeStatement(values), values, setValidating, true);
            if(mounted.current){
                setInsertMessage("");
                setShow(false);
            }
            
        } else {
            debug && console.log('Insert Error: WORK_GROUP_ID and SOURCE_TABLE already exist');
            if(mounted.current){
                setInsertMessage("Insert Error: WORK_GROUP_ID and SOURCE_TABLE already exist");
                setValidating(false);
            }
        }
    };

    const allFieldsFromDataLoader = (Object.keys(requiredFields)).sort();
    const orderedRequiredFields = allFieldsFromDataLoader.filter(col => col !== 'ACTION_ID' && col !== 'ROUTE_ID');

    return (
        <>
            {!appIDs.length && <div style={{color:'red', textAlign:'center'}}>You are not in any groups. Please contact admin for access to GroupIDs</div>}
            {insertMessage !== '' && 
                <div className="errorSignal">
                    {insertMessage}
                    <br />
                    --------------------------------------------------------------
                </div>
            }
              
            <Formik
                //destructure the action obj into {setSubmitting}
                onSubmit={(values, { resetForm, setErrors, setSubmitting }) => {
                    //have to update the values manually here:
                    setValidating(true);
                    
                    //merge values into states bc states has the latest updates
                    const updatedValues = {
                        ...states, ...values
                    };

                    updatedValues["EXTRACT_CONFIG_ID"] = states["EXTRACT_CONFIG_ID"];
                    debug && console.log('updatedValues: ', updatedValues);
                    if('SOURCE_TABLE' in updatedValues){
                        test_UniqueKeys_For_Insert_ETLF_EXTRACT_CONFIG(updatedValues);
                    }else{
                        insertUsingMergeStatement(getMergeStatement(values), values, setValidating, true);
                        if(mounted.current){
                            setInsertMessage("");
                            setShow(false);
                        }
                    }
                }}
                validationSchema={validationSchema}
                enableReinitialize={true}
                initialValues={states}
            >
                {({
                    handleSubmit, 
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    errors,
                }) => (
                        <Form
                            noValidate
                            onSubmit={handleSubmit}>

                            {Object.keys(errors).length > 0 && <span className="error-span">* Please fill in ALL required fields.</span>}

                            {orderedRequiredFields.map(field =>
                                <FormField
                                    key={field}
                                    field={field}
                                    required={requiredFields[field]}
                                    requiredFields={Object.keys(requiredFields)}
                                    values={values}
                                    dataTypes={columnDataTypes}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    touched={touched}
                                    errors={errors}
                                    disabled={validating}
                                    codeFields={codeFields}
                                    dropdownFields={dropdownFields}
                                />
                            )}
                            
                            {route !=='Select Route' &&
                                <>  
                                    <Form.Group as={Col} controlId="formBasicCheckbox">
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Optional Fields" 
                                            onChange={()=>toggleOptional(!showOptional)}
                                        />
                                    </Form.Group>
                                    {showOptional && Object.keys(optionalFields).map(field =>
                                        <FormField
                                            key={field}
                                            field={field}
                                            required={requiredFields[field]}
                                            requiredFields={Object.keys(requiredFields)}
                                            values={values}
                                            dataTypes={columnDataTypes}
                                            handleChange={handleChange}
                                            handleBlur={handleBlur}
                                            touched={touched}
                                            errors={errors}
                                            disabled={validating}
                                            codeFields={codeFields}
                                            dropdownFields={dropdownFields}
                                        />
                                    )}

                                    {Object.keys(errors).length > 0 && <span className="error-span">* Please fill in ALL required fields.</span>}

                                    <SubmitButton 
                                        validating={validating}
                                        errors={errors}
                                        touched={touched}
                                        defaultName={'Save Configuration'}
                                        SpinningName={'Validating Configuration...'}
                                    />
                                </>
                            }
                        </Form>
                    )}
            </Formik>
        </>
    )
}

export default RouteForm;