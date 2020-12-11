import React, { useState, useEffect, useContext } from 'react';
import { Formik, Field } from 'formik';
import * as yup from 'yup'; // for everything
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

import FormField from './FormField';
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import { getDataType } from './FormUtils';
import '../../../css/forms.scss';

import { WorkspaceContext } from '../../context/WorkspaceContext';
// import { createYupSchema } from "./yupSchemaCreator";
import { generateMergeStatement } from '../../SQL_Operations/Insert';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';

const JobForm = ({ data, uniqueCols, dataTypes, setShow }) => {

    const {
        debug,
        appIDs, table, tableLoaded, columnsLoaded,
        columnDataTypes, sourceTableList,
        setInsertError,
        insertUsingMergeStatement,
        codeFields,
    } = useContext(WorkspaceContext);

    //Jobs Configurations
    const [schema, setSchema] = useState([]);
    const [initialStates, setInitialStates] = useState({
        ETLFCALL_ID: "",
        JSON_PARAM: "",
        WAREHOUSE: "WH_GR_GP_XS",
        RUN_MODE: "C",
        WORK_GROUP_ID: appIDs[0],
        INGESTION_STATUS: 'submitted'
    });
    const [fields, setFields] = useState([]);
    const [validating, setValidating] = useState(false);
    const [dropdownFields, setDropdownFields] = useState(fieldTypesConfigs[table]['dropdownFields']);

    //NOT DISPLAYING the following fields on the Job Form
    const excludedFields = [
        "CREATED_DATE", "LAST_UPDATE_DATE", "INGESTION_STATUS"
    ]

    const requiredFieldsObj = {
        "RUN_MODE": "Y",
        "ETLFCALL_ID": "Y",
        "JSON_PARAM": "N",
        "WORK_GROUP_ID": "Y",
        "WAREHOUSE": "Y",
        "SOURCE_TABLE": "N"
    }

    const requiredFields = [
        "RUN_MODE",
        "ETLFCALL_ID",
        "WORK_GROUP_ID",
        "WAREHOUSE"
    ]

    useEffect(() => {
        debug && console.log(codeFields);
        debug && console.log(dropdownFields);
        debug && console.log(columnDataTypes);
    }, [])

    useEffect(() => {
        fieldTypesConfigs[table]['dropdownFields']['WORK_GROUP_ID'] = appIDs;
        setDropdownFields(fieldTypesConfigs[table]['dropdownFields']);
    }, [appIDs]);

    //Customize this for each form to set up Type of fields
    // const codeFields = {
    //     JSON_PARAM: 'Enter your code here...'
    // };
    // const dropdownFields = {
    //     WORK_GROUP_ID: ['Select ID'].concat(rw_appIDs),
    //     // SOURCE_TABLE: ['Select Source Table'].concat(sourceTables),
    //     INGESTION_STATUS: ['PENDING']
    // };

    // set up the validation object for YupSchema for Form Validation.
    useEffect(() => {
        // if (tableLoaded) {
        if (columnsLoaded) {
            debug && console.log(columnDataTypes);
            let all_fields = Object.keys(columnDataTypes);
            let fields = all_fields.filter(col => excludedFields.indexOf(col) < 0);
            debug && console.log(fields);
            setFields(fields);

            let formValidationsInfo = [];
            fields.map(col => {

                let custom_config = {};
                custom_config.id = col;
                custom_config.placeholder = "this field is required";
                custom_config.validationType = getDataType(columnDataTypes[col]);

                //Set up NON-REQUIRED fields for Job Form (still displayed on the form)
                if ( ["SOURCE_TABLE", "JSON_PARAM"].indexOf(col) < 0 ){
                    custom_config.validations = [{
                        type: "required",
                        params: ["this field is required"]
                    }];
                }

                if (col === "ETLFCALL_ID"){
                    custom_config.validations = custom_config.validations.concat([
                        {
                            type: "min",
                            params: [1, "ETLFCALL_ID cannot be less than 1 character"]
                        },
                        {
                            type: "max",
                            params: [10, "ETLFCALL_ID cannot be more than 10 characters"]
                        }
                    ])
                }

                formValidationsInfo.push(custom_config);
            });

            debug && console.log(fields);
            debug && console.log(formValidationsInfo);

            let temp_schema = formValidationsInfo.reduce(createYupSchema, {});
            let yup_schema = yup.object().shape(temp_schema);

            //have to use setState here to FORCE UPDATE the object in the form
            setSchema(yup_schema);

            // set Initial States for App IDs
            // setInitialStates({ ...setInitialStates, ['APP_ID']: appIDs['Read-Write'] });
        }
    }, [columnsLoaded]);
    // }, [ tableLoaded]);

    //have to Account for field that were intentionally leave out of the form
    function getMergeStatement(values) {
        // debug && console.log(values);
        values['CREATED_DATE'] = "CURRENT_TIMESTAMP::timestamp_ntz";
        values['LAST_UPDATE_DATE'] = "CURRENT_TIMESTAMP::timestamp_ntz";
        
        const primaryKeys = ['ETLFCALL_ID'].concat(uniqueCols);
        const columns = Object.keys(values);
        const sqlInsertStatement = generateMergeStatement(
            'SHARED_TOOLS_DEV',
            'ETL',
            'ETLFCALL',
            primaryKeys,
            columns,
            values);

        debug && console.log(sqlInsertStatement);
        return sqlInsertStatement;
    }
    
    // @params:
    //      values: Formik Values Object
    //
    // This method performs 2 tests:
    //      1) test for ETLFCALL_ID, if unique then:
    //      2) test for WORK_GROUP_ID and SOURCE_TABLE, if unique then:
    //      => proceed to insert new record. 
    const test_UniqueKeys_For_Insert_JobForm = async values => {
        // const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/test';
        const url = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/test';

        debug && console.log("Source table is: ", values['SOURCE_TABLE']);
        if (values['SOURCE_TABLE'] === undefined){
            values['SOURCE_TABLE'] = '';
        };

        const test_statement = 
        `SELECT 
            (
                select COUNT(1) from SHARED_TOOLS_DEV.ETL.ETLFCALL where ETLFCALL_ID = '`
                + values['ETLFCALL_ID'] + `' limit 1
            ) as ETLF_ID,
            (
                SELECT COUNT(1) FROM "SHARED_TOOLS_DEV"."ETL"."ETLFCALL"
                WHERE WORK_GROUP_ID = ` + values['WORK_GROUP_ID'] + `
                AND '` + values['SOURCE_TABLE']+ `' = NVL(SOURCE_TABLE,'')
            ) as Combi;`;

        debug && console.log('Test sql: ', test_statement);

        const test_result = await axios.get(url, {
            //params maps to event.queryStringParameters in lambda
            params: {
                sql_statement: test_statement,
            }
        })

        debug && console.log(test_result.data);

        if (test_result.data[0]['ETLF_ID'] === 0 && test_result.data[0]['COMBI'] === 0) {
            debug && console.log('Proceed to Insert');
            insertUsingMergeStatement(getMergeStatement(values), values, setValidating, true);
            setInsertError("");
        }else{
            if (test_result.data[0]['ETLF_ID'] === 1){
                debug && console.log('Insert Error: ETLFCALL_ID already exists');
                setInsertError("Insert Error: ETLFCALL_ID already exists");
            } else if (test_result.data[0]['COMBI'] === 1){
                debug && console.log('Insert Error: WORK_GROUP_ID and SOURCE_TABLE already exist');
                setInsertError("Insert Error: WORK_GROUP_ID and SOURCE_TABLE already exist");
            }
        }

        setShow(false);
    };


    return (
        <div>
            {!fields.length
                ?
                <div>Loading jobs...</div>
                :
                <Formik
                    validationSchema={schema}
                    // validationSchema={yup_schema}

                    //destructure the action obj into {setSubmitting}
                    onSubmit={(values, touched ) => {
                        debug && console.log('values: ', values);
                        debug && console.log('Touched Object: ', touched);
                        setValidating(true);
                        
                        //all fields in values obj will be inserted to DB
                        test_UniqueKeys_For_Insert_JobForm(values);
                    }}
                    initialValues={initialStates}
                // validate={validate_R1A1}
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
                                        required = {requiredFieldsObj[field]}
                                        requiredFields = {requiredFields}
                                        values={values}
                                        dataTypes={dataTypes}
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
                                        ? <span style={{ 'marginLeft': '5px' }}>Create Job</span>
                                        : <span style={{ 'marginLeft': '5px' }}>Validating Job...</span>
                                    }
                                </Button>

                            </Form>
                        )}
                </Formik>
            }
        </div>
    )
}

export default JobForm;