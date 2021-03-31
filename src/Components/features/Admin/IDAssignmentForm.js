import React, { useState, useEffect, useContext, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Formik, Field } from 'formik';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { createYupSchema } from "../RouteConfigurations/yupSchemaCreator";
import { INSERT_URL } from '../../context/URLs';

import SubmitButton from '../FormComponents/SubmitButton';
import MultiSelectField from '../FormComponents/MultiSelectField';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

// import '../../../css/forms.scss';
import '../../../css/rowExpansion.scss';

import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';

const IDAssignmentForm = ({ setShow }) => {
    
    const { authState } = useOktaAuth();

    const {
        debug, username
    } = useContext(WorkspaceContext);

    const { allGroupIDs } = useContext(AdminContext);

    const mounted = useRef(true);

    useEffect(() =>{
        if(allGroupIDs.length > 0){
            let selectOptions = [];
            debug && console.log(allGroupIDs);
            allGroupIDs.map(id =>{
                // console.log(field);
                selectOptions.push({
                    'label': id,
                    'value': id,
                });
            });
            setOptions(selectOptions);
        }
        
    }, [allGroupIDs])

    //Jobs Configurations
    const [options, setOptions] = useState([]);

    const schema = yup.object({
        email: yup.string().required(),
        groupIDs: yup.string().required()
    });

    // const [email, setEmail] = useState('');
    // const [groupIDs, setGroupIDs] = useState('');

    const [validating, setValidating] = useState(false);
    const [insertMessage, setInsertMessage] = useState('');
    const [insertMessageClassname, setInsertMessageClassname] = useState('');

    useEffect(()=>{
        mounted.current = true;
        
        if(insertMessage !== ''){
            setTimeout(()=>{
                setInsertMessage('');
            }, 2000);
        }

        return () => mounted.current = false;
    }, [insertMessage]);

    useEffect(()=>{
        debug && console.log(validating);
    }, [validating])

    const assignGroupsToUserSQL = (email, groupIDsArr) =>{

        let sql = `MERGE INTO "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" TT
        USING (
            select UPPER(TRIM('` + email + `')) AS USERNAME, table1.value as APP_ID
            from table(strtok_split_to_table('`+ groupIDsArr.toString() + `', ',')) as table1
        ) st 
        ON (TT.APP_ID = ST.APP_ID AND TT.USERNAME = ST.USERNAME)
        WHEN NOT matched THEN
        INSERT (
            USERNAME, APP_ID
        ) 
        VALUES 
        (
            st.USERNAME, st.APP_ID
        );`
    
        return sql;
    } 

    function assignGroupIDs(values) {
        if (authState.isAuthenticated  && username !== '') {
            // setValidating(true);
            const options = {
                headers: {
                    'Content-Type': 'application/json'
                },
            }

            const users = values.email.split(",");
            console.log(users);

            const sqls = users.map(user => assignGroupsToUserSQL(user.trim(), values.groupIDs));
            console.log(sqls);

            let postRequests = sqls.map(sql =>
                axios.post(
                    INSERT_URL, 
                    {
                        'sqlStatement': sql
                    }, 
                    options
                )
            );

            axios.all(postRequests)
            .then(axios.spread((...responses) => {
                // const responseOne = responses[0]
                // const responseTwo = responses[1]
                // const responesThree = responses[2]
                // use/access the results 
                if(mounted.current) {
                    setInsertMessage("Insert Success");
                    setInsertMessageClassname('successSignal');
                }
            })).catch(errors => {
                // react on errors.
                if(mounted.current) {
                    setInsertMessage("Insert Failed");
                    setInsertMessageClassname('errorSignal');
                }
            }).finally(() => {
                if(mounted.current) {
                    setValidating(false);
                    // setShow(false);
                }
            });

            // axios.post(INSERT_URL, {
            //     'sqlStatement': sql
            // }, options)
            // .then(response => {
            //     debug && console.log(response);
            //     if(mounted.current) {
            //         setInsertMessage("Insert Success");
            //         setInsertMessageClassname('successSignal');
            //     }
            // })
            // .catch(err => {
            //     debug && console.log(err.message);
            //     if(mounted.current) {
            //         setInsertMessage("Insert Failed");
            //         setInsertMessageClassname('errorSignal');
            //     }
            // })
            // .finally(() => {
            //     if(mounted.current) {
            //         setValidating(false);
            //         // setShow(false);
            //     }
            // });
            
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
                onSubmit={(values, { resetForm }) => {
                    debug && console.log('values: ', values);
                    assignGroupIDs(values);
                    resetForm();
                }}
                initialValues={{
                    email: '',
                    groupIDs: ''
                }}
            >
                {({
                    handleSubmit, 
                    handleChange,
                    handleBlur,
                    setFieldValue, 
                    values,
                    touched,
                    isValid,
                    isInvalid,
                    errors,
                }) => (
                        <Form
                            noValidate
                            onSubmit={e => {
                                handleSubmit(e);
                                // console.log("onSubmit inside form...");
                                // setFieldValue('groupIDs', '');
                            }}
                        >
                            <Form.Row>
                                <Form.Group as={Col} controlId="formBasicEmail">
                                    <Form.Label>User Email:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        // id={field}
                                        name='email'
                                        value={values['email']} 
                                        onChange={handleChange}
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

                                <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                    <Form.Label>Groups IDs:</Form.Label>
                                    {!allGroupIDs.length 
                                        ? <div>loading groupIDs</div>
                                        :
                                        <MultiSelectField 
                                            field={'groupIDs'}
                                            isDatCatForm={false}
                                            dropdownFields={allGroupIDs}
                                            placeholderButtonLabel={'Select group IDs'}
                                            touched={touched}
                                            errors={errors}
                                        />

                                        // <ReactMultiSelectCheckboxes
                                        //     placeholderButtonLabel={"hello"}
                                        //     onChange={values => {
                                        //         console.log(values);
                                        //         let selectedOptions = [];
                                        //         values.map(option => selectedOptions.push(option['label']));
                                        //         handleChange(values);
                                        //     }}
                                        //     options={options} 
                                        // />
                                    }
                                    
                                    {/* <Form.Control
                                        type="text"
                                        // id={field}
                                        name='groupIDs'
                                        value={values['groupIDs']} onChange={handleChange}
                                        // value={groupIDs}
                                        // onChange={ e => {
                                        //     handleChange(e);
                                        //     setGroupIDs(e.target.value);
                                        // }}
                                        onBlur={handleBlur}
                                        placeholder={'use comma to assign multiple Group IDs'}
                                        disabled={validating}
                                        isValid={touched['groupIDs'] && !errors['groupIDs']}
                                        isInvalid={errors['groupIDs']}
                                    /> */}
                                    <Form.Control.Feedback type="invalid">
                                        {errors['groupIDs']}
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

export default IDAssignmentForm;

 