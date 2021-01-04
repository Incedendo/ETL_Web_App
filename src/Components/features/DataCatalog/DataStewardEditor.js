import React, { useState, useEffect, useContext } from 'react';
// import { useOktaAuth } from '@okta/okta-react';
import {WorkspaceContext} from '../../context/WorkspaceContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import { Formik, Field } from 'formik';
import * as yup from 'yup'; // for everything
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import { generateMergeStatement } from '../../SQL_Operations/Insert';
// import axios from 'axios';
import Form from 'react-bootstrap/Form';
import FormField from '../FormComponents/FormField';
import Button from 'react-bootstrap/Button';

// const SELECT_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/select';
// const ARN_APIGW_GET_SELECT = 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select';


const DataStewardEditor = ({ 
    table, fields, schema, loadedConfig, 
    codeFields, dropdownFields, dropdownObject, 
    setShow, setInsertError }) => {

    // const { authState, authService } = useOktaAuth();

    const {
        debug, username,
        insertUsingMergeStatement
    } = useContext(WorkspaceContext);

    const [validating, setValidating] = useState(false);
    const [initialStates, setInitialStates] = useState({});

    console.log(fields);

    useEffect(() => {
        if(validating)
            debug && console.log("submit pressed....validating.....");
    }, [validating]);

    function getMergeStatement(values) {
        // debug && console.log(values);
        values['CREATEDDATE'] = "CURRENT_TIMESTAMP::timestamp_ntz";
        values['LASTMODIFIEDDATE'] = "CURRENT_TIMESTAMP::timestamp_ntz";
        
        const primaryKeys = fieldTypesConfigs[table]["primaryKeys"];
        // console.log(primaryKeys);
        const columns = Object.keys(values);
        const sqlInsertStatement = generateMergeStatement(
            'SHARED_TOOLS_DEV',
            'ETL',
            table,
            primaryKeys,
            columns,
            values);

        // debug && console.log(sqlInsertStatement);
        return sqlInsertStatement;
    }

    return (
        fields.length > 0 
        // && loadedConfig 
        ? 
        <Formik
            validationSchema={schema}

            //destructure the action obj into {setSubmitting}
            onSubmit={(values, touched ) => {
                console.log('values: ', values);
                console.log(dropdownObject);
                // debug && 
                console.log('Touched Object: ', touched);
                // setValidating(true);
                
                //all fields in values obj will be inserted to DB
                // test_UniqueKeys_For_Insert(values);
                if(table === 'DATA_STEWARD_DOMAIN'){
                    let submitedValues = {
                        'DATA_DOMAIN_ID': dropdownObject['DATA_DOMAIN'][values['DATA_DOMAIN']],
                        'DATA_STEWARD_ID': dropdownObject['DATA_STEWARD'][values['DATA_STEWARD']]
                    }
                    console.log(submitedValues);

                    const mergeStmt = getMergeStatement(submitedValues);
                }else if(table === 'CATALOG_ENTITY_DOMAIN'){
                    
                    let submitedValues = {
                        'DATA_DOMAIN_ID': dropdownObject['DATA_DOMAIN'][values['DATA_DOMAIN']],
                        'CATALOG_ENTITIES_ID': dropdownObject['CATALOG_ENTITIES'][values['CATALOG_ENTITIES']]
                    }
                    console.log(submitedValues);

                    const mergeStmt = getMergeStatement(submitedValues);
                }else if(table === 'CATALOG_ENTITY_LINEAGE'){

                    let submitedValues = {...values};
                    
                    submitedValues['CATALOG_ENTITIES_HASH'] = dropdownObject['CATALOG_ENTITIES'][values['CATALOG_ENTITIES']]
                    delete submitedValues['CATALOG_ENTITIES'];
                    console.log(submitedValues);

                    const mergeStmt = getMergeStatement(submitedValues);
                }else{
                    const mergeStmt = getMergeStatement(values);
                }

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
                                // required={requiredFields[field]}
                                requiredFields={fields}
                                values={values}
                                dataTypes={fieldTypesConfigs[table]["dataTypes"]}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                touched={touched}
                                errors={errors}
                                disabled={false}
                                codeFields={codeFields}
                                dropdownFields={dropdownFields}
                            />
                        )}  

                        <Button
                            // variant="primary"
                            type="submit" 
                            disabled={isSubmitting || validating}
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
                                ? <span style={{ 'marginLeft': '5px' }}>Add {table} item</span>
                                : <span style={{ 'marginLeft': '5px' }}>Validating Data...</span>
                            }
                        </Button>

                    </Form>
                )}
        </Formik>
        : <div> loading fields...</div>
    )
        
}

export default DataStewardEditor;