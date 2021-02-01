import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Formik, Field } from 'formik';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { createYupSchema } from "../../RouteConfigurations/yupSchemaCreator";
import { INSERT_URL } from '../../../context/URLs';

import { WorkspaceContext } from '../../../context/WorkspaceContext';

const DomainOperatorForm = ({ }) => {
    
    const { authState } = useOktaAuth();

    const {
        debug
    } = useContext(WorkspaceContext);


    //Jobs Configurations
    // const [schema, setSchema] = useState([]);

    const schema = yup.object({
        email: yup.string().email().required(),
        domains: yup.string().required()
    });

    const [validating, setValidating] = useState(false);
    const [insertMessage, setInsertMessage] = useState('');
    const [insertMessageClassname, setInsertMessageClassname] = useState('');

    useEffect(()=>{
        if(insertMessage !== ''){
            setTimeout(()=>{
                setInsertMessage('');
            }, 2000);
        }
    }, [insertMessage]);

    useEffect(()=>{
        debug && console.log(validating)
    }, [validating])

    const assignOperatorToDomainsSQL = (email, domains) =>{
        let sql = `MERGE INTO "SHARED_TOOLS_DEV"."ETL"."DOMAIN_AUTHORIZATION" TT
        USING (
            select 
                ABS(HASH( UPPER(TRIM('` + email + `')),UPPER(TRIM(table1.value)) )) as DOMAIN_AUTHORIZATION_ID,
                UPPER(TRIM('` + email +`')) AS USERNAME, 
                UPPER(TRIM(table1.value)) as DOMAIN
            from table(strtok_split_to_table('`+ domains +`', ',')) as table1
        ) st 
        ON (TT.DOMAIN_AUTHORIZATION_ID = ST.DOMAIN_AUTHORIZATION_ID)
        WHEN NOT matched THEN
        INSERT (
            DOMAIN_AUTHORIZATION_ID, USERNAME, DOMAIN
        ) 
        VALUES 
        (
            st.DOMAIN_AUTHORIZATION_ID, st.USERNAME, st.DOMAIN
        );`

        console.log(sql);
    
        return sql;
    } 

    function assignOperatorToDomains(values) {

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
        }

        axios.post(INSERT_URL, {
            'sqlStatement': assignOperatorToDomainsSQL(values.email, values.domains)
        }, options)
        .then(response => {
            console.log(response);
            setInsertMessage("Insert Success");
            setInsertMessageClassname('successSignal');
        })
        .catch(err => {
            console.log(err.message);
            setInsertMessage("Insert Failed");
            setInsertMessageClassname('errorSignal');
        })
        .finally(() => setValidating(false));
    }

    return (
        <div style={{'textAlign': 'left'}}>

            {insertMessage !== '' &&
                <div className={insertMessageClassname}>
                    Status: {insertMessage}
                </div>
            }

            <Formik
                validationSchema={schema}

                //destructure the action obj into {setSubmitting}
                onSubmit={(values, { resetForm, setErrors, setSubmitting }) => {
                    console.log('values: ', values);
                    assignOperatorToDomains(values);
                    setValidating(true);
                }}
                initialValues={{
                    email: '',
                    domains: ''
                }}
            >
                {({
                    handleSubmit, 
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
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>User Email:</Form.Label>
                                <Form.Control
                                    type="text"
                                    // id={field}
                                    name='email'
                                    value={values['email']}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    // placeholder={required === 'Y' ? "required " + dataTypes[field] : "optional " + dataTypes[field]}
                                    // placeholder={requiredFields.indexOf(field) >= 0 ? "required " + dataTypes[field] : "optional " + dataTypes[field]}
                                    // disabled={disabled}
                                    isValid={touched['email'] && !errors['email']}
                                    isInvalid={errors['email']}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors['email']}
                                </Form.Control.Feedback>
                            </Form.Group> 
                            <Form.Group controlId="exampleForm.ControlSelect1">
                                <Form.Label>Domains:</Form.Label>
                                <Form.Control
                                    type="text"
                                    // id={field}
                                    name='domains'
                                    value={values['domains']}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    // placeholder={required === 'Y' ? "required " + dataTypes[field] : "optional " + dataTypes[field]}
                                    // placeholder={requiredFields.indexOf(field) >= 0 ? "required " + dataTypes[field] : "optional " + dataTypes[field]}
                                    // disabled={disabled}
                                    isValid={touched['domains'] && !errors['domains']}
                                    isInvalid={errors['domains']}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors['domains']}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <div className="central-spinning-div">
                                <Button
                                    // variant="primary"
                                    type="submit" 
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
                                        ? <span style={{ 'marginLeft': '5px' }}>Add</span>
                                        : <span style={{ 'marginLeft': '5px' }}>Adding...</span>
                                    }
                                </Button>
                            </div>
                        </Form>
                    )}
            </Formik>
        </div>
        
    )
}

export default DomainOperatorForm;

 