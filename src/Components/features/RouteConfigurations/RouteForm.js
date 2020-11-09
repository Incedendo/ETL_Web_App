import React, { useState, useContext } from 'react';
import { Formik } from 'formik';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import FormField from '../FormComponents/FormField';
import { WorkspaceContext } from '../../context/WorkspaceContext';
// import { createYupSchema } from "./yupSchemaCreator";
import { generateMergeStatement } from '../../SQL_Operations/Insert';
import axios from 'axios';
import '../../../css/forms.scss';

const TEST_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/test';

const RouteForm = ({ 
    routeCode, extractConfigID, states,
    requiredFields, validationSchema, 
    helper_route, 
    setShow,
    dropdownFields 
}) => {

    const {
        debug,
        database,
        schema,
        table,
        insertUsingMergeStatement,
        columnDataTypes,
        routeConfigs,
        codeFields,
        appIDs
    } = useContext(WorkspaceContext);

    // console.log("R1A1: current Action: ",states['ACTION_ID']);
    debug && console.log("current RouteCode: ", routeCode);
    debug && console.log("Extract Config ID: ", extractConfigID);
    debug && console.log(requiredFields);

    const [validating, setValidating] = useState(false);
    const [insertMessage, setInsertMessage] = useState('');

    function getMergeStatement(values) {
        debug && console.log(values);
        debug && console.log(helper_route);
        debug && console.log(routeConfigs[helper_route]);
        values['CREATEDDT'] = "CURRENT_TIMESTAMP::timestamp_ntz";
        values['LASTMODIFIEDDT'] = "CURRENT_TIMESTAMP::timestamp_ntz";
        
        if (routeConfigs[helper_route]['source'] !== null){
            if (typeof(values.SOURCE_SYSTEM_ID) === 'string'){
                values.SOURCE_SYSTEM_ID = values.SOURCE_SYSTEM_ID.split('-')[0].trim()*1;
            }
        }
            
        if (routeConfigs[helper_route]['target'] !== null){
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
            insertUsingMergeStatement(getMergeStatement(values), values, setValidating);
            setInsertMessage("");
            setShow(false);
        } else {
            debug && console.log('Insert Error: WORK_GROUP_ID and SOURCE_TABLE already exist');
            setInsertMessage("Insert Error: WORK_GROUP_ID and SOURCE_TABLE already exist");
            setValidating(false);
        }
    };


    return (
        <div>
            {insertMessage !== '' && 
                <div className="errorSignal">
                    {insertMessage}
                    <br />
                    --------------------------------------------------------------
                </div>
            } 

            {/* <div>
                <button onClick={()=>{console.log(states)}}>Print States</button>
                <button onClick={()=>console.log(routeCode)}>Print routecode</button>
            </div> */}
            
            {!Object.keys(requiredFields).length
                ?
                <div>Loading configurations...</div>
                :
                <Formik
                    validationSchema={validationSchema}

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
                        test_UniqueKeys_For_Insert_ETLF_EXTRACT_CONFIG(updatedValues);
                    }}
                    initialValues={states}
                >
                    {({
                        handleSubmit, isSubmitting,
                        handleChange,
                        handleBlur,
                        values,
                        touched,
                        errors,
                    }) => (
                            <Form
                                noValidate
                                onSubmit={handleSubmit}>

                                {Object.keys(requiredFields).map(field =>
                                    <FormField
                                        routeCode={routeCode}
                                        key={field}
                                        field={field}
                                        required={requiredFields[field]}
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
                                <div className="central-spinning-div">
                                    <Button
                                        // variant="primary"
                                        type="submit" disabled={isSubmitting}
                                        disabled={validating}
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
                                            ? <span style={{ 'marginLeft': '5px' }}>Add Configuration</span>
                                            : <span style={{ 'marginLeft': '5px' }}>Validating Configuration...</span>
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

export default RouteForm;