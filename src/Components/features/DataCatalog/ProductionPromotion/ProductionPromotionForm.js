import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import {WorkspaceContext} from '../../../context/WorkspaceContext';
import { AdminContext } from '../../../context/AdminContext';
import { fieldTypesConfigs } from '../../../context/FieldTypesConfig';
import { generateMergeStatement } from '../../../SQL_Operations/Insert';
import { Formik, connect, getIn } from 'formik';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import FormField from '../../FormComponents/FormField';
import MultiSelectField from '../../FormComponents/MultiSelectField';
import SubmitButton from '../../FormComponents/SubmitButton';

import { SELECT_URL, ARN_APIGW_GET_SELECT, UPDATE_URL } from '../../../context/URLs';

const ProductionPromotionForm = ({ setShow }) => {

    const { authState } = useOktaAuth();

    const {
        debug, username,
        insertSuccess, setInsertSuccess,
        insertUsingMergeStatement
    } = useContext(WorkspaceContext);

    const {
        isAdmin, isSteward, isDomainOperator
    } = useContext(AdminContext);

    const [target, setTarget] = useState('');
    const [domains, setDomains] = useState([]);
    const [tables, setTables] = useState([]);
    const [loadingDomain, setLoadingDomain] = useState(true);
    const [loadingTable, setLoadingTable] = useState(false);

    const [validating, setValidating] = useState(false);
    const [insertMessage, setInsertMessage] = useState('');
    const [insertMessageClassname, setInsertMessageClassname] = useState('');

    const schema = yup.object({
        table: yup.string().required(),
        domain: yup.string().required()
    });

    //GET LIST OF DOMAINS BASED ON USER'S PRIVILEGE
    useEffect(()=>{
        let mounted = true;
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            let sql = '';

            if(isAdmin){
                sql = `SELECT DOMAIN FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN;`;
            }else{
                sql = `SELECT DOMAIN FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD_DOMAIN" DSD
                ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD" DS
                ON DSD.DATA_STEWARD_ID = DS.DATA_STEWARD_ID
                WHERE DS.EMAIL = UPPER(TRIM('` + username + `'))
                UNION
                SELECT DOMAIN FROM SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION
                WHERE USERNAME = UPPER(TRIM('` + username + `'));`
            }
            // else if(isSteward){
            //     sql = `SELECT DOMAIN FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
            //     INNER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD_DOMAIN" DSD
            //     ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
            //     INNER JOIN "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD" DS
            //     ON DSD.DATA_STEWARD_ID = DS.DATA_STEWARD_ID
            //     WHERE DS.EMAIL = UPPER(TRIM('` + username + `'));`;
            // }else if(isDomainOperator){
            //     sql = `SELECT DOMAIN FROM SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION
            //     WHERE USERNAME = UPPER(TRIM('` + username + `'));`
            // }

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
                // debug && console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);

                if(mounted){
                    const data = response.data.map(item => item.DOMAIN)
                    setDomains(['Select Domain', ...data]);
                    setLoadingDomain(false);
                }
            })
        }

        return ()=> mounted = false;
    }, []);

    useEffect(()=>{
        let mounted = true;
        if(target === 'SELECT DOMAIN'){
            setTables([]);
            setLoadingTable(false);
            return ()=> mounted = false;
        }

        if(authState.isAuthenticated && username !== '' && target !== '') {

            const { accessToken } = authState;
            let sql = `SELECT E.CATALOG_ENTITIES_ID, E.TARGET_TABLE
            FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
            LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
            ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
            LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
            ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
            WHERE DOMAIN = '` + target + `' AND IN_PRODUCTION = 'NO';`;

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
                    setTables(response.data);
                    setLoadingTable(false);
                }
            })
        }

        return ()=> mounted = false;
    }, [target]);

    function promoteTablesToProd(values){
        // console.log(values);
        // console.log(tables);

        const tableNames = values['table'];
        let entitiesIDs = []
        
        tableNames.map(name => {
            tables.map(pair =>{
                if(pair.TARGET_TABLE === name){
                    entitiesIDs.push(pair.CATALOG_ENTITIES_ID);
                }
            })
        })

        // console.log(tableNames);
        // console.log(entitiesIDs);

        // const updateSQL = `MERGE INTO "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITIES" TT
        // USING (
        //     SELECT ID, DOMAIN
        //     FROM
        //         (SELECT 
        //              UPPER(TRIM(table1.value)) as DOMAIN,
        //              ROW_NUMBER() OVER(ORDER BY DOMAIN) AS RowNumber
    
        //          FROM table(strtok_split_to_table('` + tableNames + `', ',')) as table1
        //         ) AS t1
        //         FULL OUTER JOIN
        //         (SELECT
        //              UPPER(TRIM(table2.value)) as ID,
        //              ROW_NUMBER() OVER (ORDER BY ID) RowNumber
        //         from table(strtok_split_to_table('` + entitiesIDs + `', ',')) as table2
        //         ) AS t2
        //         ON t1.RowNumber = t2.RowNumber
        // ) ST 
        // ON (TT.CATALOG_ENTITIES_ID = ST.ID)
        // WHEN matched THEN
        // UPDATE SET TT.IN_PRODUCTION = 'YES';`
        
        const updateSQL = `MERGE INTO "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITIES" TT
        USING (
            SELECT
                UPPER(TRIM(table1.value)) as ID
            from table(strtok_split_to_table('` + entitiesIDs + `', ',')) as table1
        ) ST 
        ON (TT.CATALOG_ENTITIES_ID = ST.ID)
        WHEN matched THEN
        UPDATE SET TT.IN_PRODUCTION = 'YES';`           

        debug && console.log(updateSQL);

        const data = {
            sqlUpdateStatement: updateSQL,
        };

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
        }

        axios.put(UPDATE_URL, data, options)
            .then(response => {
                
                // returning the data here allows the caller to get it through another .then(...)
                debug && console.log(response.data);
                debug && console.log(response.status);
                // if (response.status === 200) {
                //     if (response.data[0]['number of rows updated'] > 0
                //         ||response.data[0]['number of rows inserted'] > 0
                //     ) {
                //         setEditSuccess(true);
                //         setEditError('Success Update');
                //         setEditMessageClassname('successSignal');
                //         update_status = 'SUCCESS';
                //     }
                //     else {
                //         setEditSuccess(false);
                //         setEditError('Failed to update record');
                //         setEditMessageClassname('errorSignal');
                //     }
                // }
                
            })
            .catch(err => {
                debug && console.log(err);
                // setEditError(err.message);
                // setEditSuccess(false);
                // setEditMessageClassname('errorSignal');
            })
            .finally(() => {
                setValidating(false);
                setShow(false);
            });
    }

    return(
        <div>

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
                    promoteTablesToProd(values);
                    setValidating(true);
                    resetForm();
                }}
                initialValues={{
                    domain: '',
                    table: ''
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
                            <Form.Group >
                                <Form.Label>Domains</Form.Label>
                                {loadingDomain && <span style={{marginLeft: '10px'}}>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                </span>
                                }

                                {(!loadingDomain && domains.length > 0) &&
                                    <>
                                        <Form.Control
                                            as="select"
                                            name="domain"
                                            onChange={e => {
                                                handleChange(e);
                                                setTarget(e.target.value);
                                                setLoadingTable(true);
                                            }}
                                            isValid={touched.domain && !errors.domain}
                                            isInvalid={touched.domain && !!errors.domain}
                                        >
                                            {domains.map(domain =>
                                                <option key={domain} value={domain}>
                                                    {domain}
                                                </option>
                                            )}
                                        </Form.Control>
                                    
                                        <Form.Control.Feedback type="invalid">
                                            {errors.domain}
                                        </Form.Control.Feedback>
                                    </>
                                }
                            </Form.Group>     
                            
                            <Form.Group>
                                <Form.Label>Tables:</Form.Label>
                                {loadingTable && <span style={{marginLeft: '10px'}}>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                </span>
                                }

                                {(!loadingTable && tables.length > 0)
                                && <MultiSelectField 
                                        field={'table'}
                                        isDatCatForm={false}
                                        dropdownFields={tables.map(item => item.TARGET_TABLE)}
                                        placeholderButtonLabel={'Select abc xyz'}
                                        touched={touched}
                                        errors={errors}
                                    />
                                }

                                {(!loadingTable && tables.length === 0 && target !== '' && target !== 'Select Domain')
                                && <span style={{marginLeft: '10px', color: 'red'}}>This Domain currently has no eligible tables to promote</span>
                                } 
                                <Form.Control.Feedback type="invalid">
                                    {errors['table']}
                                </Form.Control.Feedback>
                            </Form.Group>
                            
                            <SubmitButton 
                                validating={validating}
                                errors={errors}
                                touched={touched}
                                defaultName={'Promote to Prod'}
                                SpinningName={'Promoting...'}
                            />

                        </Form>
                    )}
            </Formik>
        </div>
    )    
}

export default ProductionPromotionForm;