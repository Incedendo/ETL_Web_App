import React, { useState, useEffect, useContext } from 'react';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import { Formik, Field } from 'formik';
import * as yup from 'yup'; // for everything
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import FormField from '../FormComponents/FormField';
import Button from 'react-bootstrap/Button';

const DataStewardEditor = ({ table }) => {

    const [schema, setSchema] = useState([]);
    const [validating, setValidating] = useState(false);
    const [initialStates, setInitialStates] = useState({});

    const dataTypes = {
        'FNAME': 'text',
        'LNAME': 'text',
        'EMAIL': 'text',
    }

    // console.log(table);

    const fields = Object.keys(fieldTypesConfigs[table]["codeFields"]);
    console.log(fields);

    useEffect(()=>{
        let formValidationsInfo = [];
        fields.map(col => {
            let custom_config = {};
            custom_config.id = col;
            custom_config.placeholder = "this field is required";
            custom_config.validationType = 'text';
            custom_config.validations = [{
                type: "required",
                params: ["this field is required"]
            }];
            formValidationsInfo.push(custom_config);
        });

        let temp_schema = formValidationsInfo.reduce(createYupSchema, {});
        let yup_schema = yup.object().shape(temp_schema);

        //have to use setState here to FORCE UPDATE the object in the form
        setSchema(yup_schema);
    }, []);

    useEffect(() => {
        console.log("submit pressed....validating.....");
    }, [validating])

    return (
        <Formik
            validationSchema={schema}
            // validationSchema={yup_schema}

            //destructure the action obj into {setSubmitting}
            onSubmit={(values, touched ) => {
                debug && console.log('values: ', values);
                debug && console.log('Touched Object: ', touched);
                setValidating(true);
                
                //all fields in values obj will be inserted to DB
                // test_UniqueKeys_For_Insert_JobForm(values);
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
                                // required={requiredFields[field]}
                                requiredFields={fields}
                                values={values}
                                dataTypes={dataTypes}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                touched={touched}
                                errors={errors}
                                disabled={false}
                                codeFields={fields}
                                dropdownFields={[]}
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
                                ? <span style={{ 'marginLeft': '5px' }}>Adding Data Steward</span>
                                : <span style={{ 'marginLeft': '5px' }}>Validating Data...</span>
                            }
                        </Button>

                    </Form>
                )}
        </Formik>
    )
}

export default DataStewardEditor;