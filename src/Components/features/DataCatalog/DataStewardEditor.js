import React, { useState, useEffect, useContext } from 'react';
// import { useOktaAuth } from '@okta/okta-react';
import {WorkspaceContext} from '../../context/WorkspaceContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import { Formik, connect, getIn } from 'formik';
import { generateMergeStatement } from '../../SQL_Operations/Insert';
// import axios from 'axios';
import Form from 'react-bootstrap/Form';
import FormField from '../FormComponents/FormField';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import SubmitDatCatButton from '../FormComponents/SubmitDatCatButton';

import { 
    merge_data_steward,
    merge_data_domain,
    merge_data_steward_domain,
    merge_catalog_entity_domain,
    merge_catalog_items,
    merge_catalog_entities,
    merge_catalog_entity_lineage
} from './datcatsql/datcat_merge';

// const SELECT_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/select';
// const ARN_APIGW_GET_SELECT = 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select';


const DataStewardEditor = ({ 
    table, fields, schema, loadedConfig, 
    codeFields, dropdownFields, dropdownObject, 
    setShow, setInsertError }) => {

    // const { authState, authService } = useOktaAuth();

    const {
        debug, username,
        insertSuccess, setInsertSuccess,
        insertUsingMergeStatement
    } = useContext(WorkspaceContext);

    const [validating, setValidating] = useState(false);
    const [inserting, setInserting] = useState(false);
    const [initialStates, setInitialStates] = useState({});

    console.log(fields);
    console.log(dropdownFields);
    console.log(dropdownObject);

    useEffect(()=>{
        let state = {};
        Object.keys(dropdownFields).map( dropdownField => {
            state[dropdownField] = 'select a value'
        })
        setInitialStates(state);
    }, [])

    useEffect(()=>{
        if(dropdownFields !== null){
            let state = {};
            (Object.keys(dropdownFields)).map( dropdownField => {
                if(dropdownFields[dropdownField].length > 0)
                    state[dropdownField] = dropdownFields[dropdownField][0]
            })
            setInitialStates(state);
        }
        
    }, [dropdownFields])

    useEffect(() => {
        debug && console.log("initialStates.....", initialStates);
    }, [initialStates]);

    useEffect(() => {
        console.log('Inserting: ' + inserting);
        if(!inserting && insertSuccess){
            debug && console.log("insert success");
            setInsertSuccess(false);
            setShow(false);
        }
           
    }, [inserting]);

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

    const handleSubmitCustom = values => {
        console.log('values: ', values);
        console.log(dropdownObject);
        let mergeStmt = "";
        console.log(table);

        if(table === 'DATA_STEWARD'){
            console.log("reaching data_Steward table");
            mergeStmt = merge_data_steward(values, fields);
            console.log(values);

            insertUsingMergeStatement(mergeStmt, values, setInserting, false);
        }else if(table === 'DATA_DOMAIN'){
            console.log("reaching data_Steward table");
            mergeStmt = merge_data_domain(values, fields);
            console.log(values);

            insertUsingMergeStatement(mergeStmt, values, setInserting, false);
        }
        else if(table === 'DATA_STEWARD_DOMAIN'){
            console.log('reach DATA_STEWARD_DOMAIN');

            let selectedDomainIDs = values.DOMAIN.map(domain => dropdownObject['DOMAIN'][domain]);

            let submitedValues = {
                'DATA_DOMAIN_ID': selectedDomainIDs,
                'DATA_STEWARD_ID': dropdownObject['EMAIL'][values['EMAIL']]
            }
            console.log(submitedValues);

            mergeStmt = merge_data_steward_domain(submitedValues);
            insertUsingMergeStatement(mergeStmt, submitedValues, setInserting, false);
        }else if(table === 'CATALOG_ENTITY_DOMAIN'){
            console.log(values);

            // let submitedValues = {
            //     'DATA_DOMAIN_ID': dropdownObject['DOMAIN'][values['DOMAIN']],
            //     'CATALOG_ENTITIES_ID': dropdownObject['CATALOG_ENTITIES'][values['CATALOG_ENTITIES']]
            // }

            let entitiesID = values['CATALOG_ENTITIES'].map(entity => dropdownObject['CATALOG_ENTITIES'][entity])
            // const entitiesString = entitiesID
            let submitedValues = {
                'DATA_DOMAIN_ID': dropdownObject['DOMAIN'][values['DOMAIN']],
                'CATALOG_ENTITIES_ID': entitiesID
            }
            console.log(submitedValues);

            mergeStmt = merge_catalog_entity_domain(submitedValues);
            insertUsingMergeStatement(mergeStmt, submitedValues, setInserting, false);
        }else if(table === 'CATALOG_ENTITIES'){
            
            let submitedValues = {...values};
            mergeStmt = merge_catalog_entities(submitedValues);
            insertUsingMergeStatement(mergeStmt, values, setInserting, false);

        }else if(table === 'CATALOG_ENTITY_LINEAGE'){

            let submitedValues = {...values};
            
            submitedValues['CATALOG_ENTITIES_ID'] = dropdownObject['CATALOG_ENTITIES'][values['CATALOG_ENTITIES']]
            delete submitedValues['CATALOG_ENTITIES'];

            mergeStmt = merge_catalog_entity_lineage(submitedValues, fields);

            console.log(submitedValues);
            insertUsingMergeStatement(mergeStmt, submitedValues, setInserting, false);
        }else if(table === 'CATALOG_ITEMS'){
            let submitedValues = {...values};
            submitedValues['CATALOG_ENTITIES_ID'] = dropdownObject['CATALOG_ENTITIES'][values['CATALOG_ENTITIES']];
            // console.log(submitedValues);

            mergeStmt = merge_catalog_items(submitedValues, fields);
            insertUsingMergeStatement(mergeStmt, submitedValues, setInserting, false);
        }else{
            mergeStmt = getMergeStatement(values);
        }

        setValidating(false);

        debug && console.log(mergeStmt);
        // setShow(false);
    }

    return (
        fields.length > 0 
        // && loadedConfig 
        ? 
        <Formik
            validationSchema={schema}
            onSubmit={values => {
                setInserting(true);
                handleSubmitCustom(values)
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
                            
                        {fields.sort().map(field =>
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

                        {Object.keys(errors).length > 0 && <span className="error-span">* Please fill in ALL required fields.</span>}

                        <SubmitDatCatButton 
                            table={table}
                            isSubmitting={isSubmitting}
                            validating={validating}
                            inserting={inserting}
                            errors={errors}
                            touched={touched}
                        />
                
                    </Form>
                )}
        </Formik>
        : <div> loading fields...</div>
    )
        
}

export default DataStewardEditor;