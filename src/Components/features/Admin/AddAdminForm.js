import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Formik, Field } from 'formik';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import SubmitButton from '../FormComponents/SubmitButton';
import { INSERT_URL } from '../../context/URLs';
// import '../../../css/forms.scss';
import '../../../css/rowExpansion.scss';

import { WorkspaceContext } from '../../context/WorkspaceContext';

const AddAdminForm = () => {
    
    const { authState } = useOktaAuth();

    const {
        debug, username,
        performAuditOperation
    } = useContext(WorkspaceContext);

    const schema = yup.object({
        email: yup.string().required()
    });

    const [validating, setValidating] = useState(false);
    const [insertMessage, setInsertMessage] = useState('');
    const [insertMessageClassname, setInsertMessageClassname] = useState('');

    useEffect(()=>{
        let mounted = true;
        if(insertMessage !== ''){
            if(mounted){
                setTimeout(()=>{
                    setInsertMessage('');
                }, 2000);
            }
        }

        return () => mounted = false;
    }, [insertMessage]);

    useEffect(()=>{
        debug && console.log(validating);
    }, [validating]);


    //email is a comma-separated string containing multiple emails
    const addAdminSQL = (email) =>{
        let sql = `MERGE INTO "SHARED_TOOLS_DEV"."ETL"."DATCAT_ADMIN" TT
        USING ( 
            select UPPER(TRIM(table1.value)) as USERNAME
            from table(strtok_split_to_table('`+ email + `', ',')) as table1
        ) st 
        ON (TT.USERNAME = ST.USERNAME)
        WHEN NOT matched THEN
        INSERT ( USERNAME ) VALUES ( UPPER(TRIM(st.USERNAME)) );`

        debug && console.log(sql);
    
        return sql;
    } 

    function addAdmin(values) {
        if (authState.isAuthenticated  && username !== '') {
            const options = {
                headers: {
                    'Content-Type': 'application/json'
                },
            };

            let insert_status = 'FAILURE';
            const sqlMergeStatement = addAdminSQL(values.email);
            
            axios.post(INSERT_URL, {
                'sqlStatement': sqlMergeStatement
            }, options)
            .then(response => {
                debug && console.log(response);
                setInsertMessage("Insert Success");
                setInsertMessageClassname('successSignal');
                insert_status = 'SUCCESS';
            })
            .catch(err => {
                debug && console.log(err.message);
                setInsertMessage("Insert Failed");
                setInsertMessageClassname('errorSignal');
            })
            .finally(() => {
                setValidating(false);
                performAuditOperation('INSERT', ['email'], values, 'DATCAT_ADMIN', sqlMergeStatement, insert_status);
            });
        }
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
                    debug && console.log('values: ', values);
                    addAdmin(values);
                    setValidating(true);
                    resetForm();
                }}
                initialValues={{
                    email: ''
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
                            <Form.Row>
                                <Form.Group as={Col} controlId="formBasicEmail">
                                    <Form.Label>Username:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        // id={field}
                                        name='email'
                                        value={values['email']} onChange={handleChange}
                                        // value={email}
                                        // onChange={ e => {
                                        //     handleChange(e);
                                        //     setEmail(e.target.value);
                                        // }}
                                        onBlur={handleBlur}
                                        placeholder={'i.e: john.doe@aig.com'}
                                        disabled={validating}
                                        isValid={touched['email'] && !errors['email']}
                                        isInvalid={errors['email']}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors['email']}
                                    </Form.Control.Feedback>
                                </Form.Group> 
                            </Form.Row>
                              
                            <SubmitButton 
                                validating={validating}
                                errors={errors}
                                touched={touched}
                                defaultName={'Add'}
                                SpinningName={'Adding...'}
                            />

                        </Form>
                    )}
            </Formik>
        </div>
        
    )
}

export default AddAdminForm;

 