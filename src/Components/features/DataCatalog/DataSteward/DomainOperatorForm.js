import React, { useState, useEffect, useContext, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Formik, Field } from 'formik';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import MultiSelectField from '../../FormComponents/MultiSelectField';
import SubmitButton from '../../FormComponents/SubmitButton';

import { WorkspaceContext } from '../../../context/WorkspaceContext';
import { AdminContext } from '../../../context/AdminContext';
import { SELECT_URL, ARN_APIGW_GET_SELECT, INSERT_URL } from '../../../context/URLs';

const DomainOperatorForm = ({ }) => {

    const mounted = useRef(true);
    
    const { authState } = useOktaAuth();

    const {
        debug, username,
        performAuditOperation
    } = useContext(WorkspaceContext);

    const {
        isAdmin, isSteward
    } = useContext(AdminContext);


    const [domains, setDomain] = useState([]);
    const [loading, setLoading] = useState(true);

    //Jobs Configurations
    // const [schema, setSchema] = useState([]);

    const schema = yup.object({
        email: yup.string().required(),
        domains: yup.string().required()
    });

    const [validating, setValidating] = useState(false);
    const [insertMessage, setInsertMessage] = useState('');
    const [insertMessageClassname, setInsertMessageClassname] = useState('');

    useEffect(()=>{
        mounted.current = true;
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            let sql = '';

            if(isAdmin){
                sql = `SELECT DOMAIN FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN;`;
            }
            else if(isSteward){
                sql = `SELECT DOMAIN FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD_DOMAIN" DSD
                ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD" DS
                ON DSD.DATA_STEWARD_ID = DS.DATA_STEWARD_ID
                WHERE DS.EMAIL = UPPER(TRIM('` + username + `'));`;
            }

            debug && console.log(sql);

            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: sql,
                }
            })//have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);

                if(mounted){
                    setDomain(response.data.map(item => item.DOMAIN));
                    setLoading(false);
                }
            })
        }

        return ()=> mounted.current = false;
    }, [])

    useEffect(()=>{
        mounted.current = true;
        
        if(insertMessage !== ''){
            setTimeout(()=>{
                if(mounted)
                    setInsertMessage('');
            }, 2000);
        }

        return () => mounted.current = false;
    }, [insertMessage]);

    useEffect(()=>{
        debug && console.log(validating)
    }, [validating])

    const assignOperatorToDomainsSQL = (email, domains) =>{

        domains = domains.map(domain => domain.replace(/'/g, "\\'"));

        let sql = `MERGE INTO "SHARED_TOOLS_DEV"."ETL"."DOMAIN_AUTHORIZATION" TT
        USING (
            select 
                ABS(HASH( UPPER(TRIM(table2.value)),UPPER(TRIM(table1.value)) )) as DOMAIN_AUTHORIZATION_ID,
                UPPER(TRIM(table2.value)) AS USERNAME, 
                UPPER(TRIM(table1.value)) as DOMAIN
            from 
                table(strtok_split_to_table('`+ domains +`', ',')) as table1,
                table(strtok_split_to_table('`+ email +`', ',')) as table2
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

        debug && console.log(sql);
    
        return sql;
    } 

    function assignOperatorToDomains(values) {
        if (authState.isAuthenticated  && username !== '') {
            const options = {
                headers: {
                    'Content-Type': 'application/json'
                },
            }

            // const users = values.email.split(",");
            // const sqls = users.map(user => assignOperatorToDomainsSQL(user.trim(), values.domains));
            // console.log(sqls);

            // const postRequests = sqls.map(sql =>
            //     axios.post(
            //         INSERT_URL, 
            //         {
            //             'sqlStatement': sql
            //         }, 
            //         options
            //     )
            // );

            // let insert_status = 'FAILURE';
            // axios.all(postRequests)
            // .then(axios.spread((...responses) => {
            //     // const responseOne = responses[0]
            //     // const responseTwo = responses[1]
            //     // const responesThree = responses[2]
            //     // use/access the results 
                
            //     if(mounted.current) {
            //         setInsertMessage("Insert Success");
            //         setInsertMessageClassname('successSignal');
            //         insert_status = 'SUCCESS';
            //     }
            // })).catch(errors => {
            //     // react on errors.
            //     if(mounted.current) {
            //         setInsertMessage("Insert Failed");
            //         setInsertMessageClassname('errorSignal');
            //     }
            // }).finally(() => {
            //     if(mounted.current) {
            //         setValidating(false);
            //         performAuditOperation('INSERT', ['email', 'domains'], values, 'DOMAIN_AUTHORIZATION', sqlMergeStatement, insert_status);
            //         // setShow(false);
            //     }
            // });

            
            const sqlMergeStatement = assignOperatorToDomainsSQL(values.email, values.domains);

            let insert_status = 'FAILURE';
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
                performAuditOperation('INSERT', ['email', 'domains'], values, 'DOMAIN_AUTHORIZATION', sqlMergeStatement, insert_status);
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
                    assignOperatorToDomains(values);
                    setValidating(true);
                    resetForm();
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
                            onSubmit={handleSubmit}
                        >
                            
                            <Form.Group controlId="exampleForm.ControlSelect1">
                                <Form.Label>Domains:</Form.Label>
                                {loading && <span style={{marginLeft: '10px'}}>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                </span>
                                }

                                {(!loading && domains.length > 0)
                                && <MultiSelectField 
                                        field={'domains'}
                                        isDatCatForm={false}
                                        dropdownFields={domains}
                                        placeholderButtonLabel={'Select Domains      '}
                                        touched={touched}
                                        errors={errors}
                                    />
                                }

                                {(!loading && domains.length===0)
                                && <span style={{marginLeft: '10px', color: 'red'}}>You own zero Domains</span>
                                }   
                                {/* <Form.Control
                                    as="select"
                                    name='domains'
                                    value={values['domains']}
                                    onChange={(e) => {
                                        // console.log(e.target.value);
                                        // console.log(domains);
                                        // console.log(values);
                                        handleChange(e);
                                    }}
                                    onBlur={handleBlur}
                                    placeholder={'use comma to assign multiple Domain Operators'}// disabled={disabled}
                                    isValid={touched['domains'] && !errors['domains']}
                                    isInvalid={errors['domains']}
                                >   
                                    {domains.map(item => <option key={item} value={item} >{item}</option>)}
                                </Form.Control> */}
                                <Form.Control.Feedback type="invalid">
                                    {errors['domains']}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>User Email:</Form.Label>
                                <Form.Control
                                    type="text"
                                    // id={field}
                                    name='email'
                                    value={values['email']}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={'i.e: john.doe@aig.com (use "," to separate multiple emails)'}
                                    disabled={validating}
                                    isValid={touched['email'] && !errors['email']}
                                    isInvalid={errors['email']}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors['email']}
                                </Form.Control.Feedback>
                            </Form.Group> 
                            
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

export default DomainOperatorForm;

 