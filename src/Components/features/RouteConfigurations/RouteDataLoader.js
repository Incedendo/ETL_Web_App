import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Formik, setIn } from 'formik';
import * as yup from 'yup'; // for everything
import axios from 'axios';
import { createYupSchema } from "./yupSchemaCreator";
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import RouteForm from './RouteForm';
import Spinner from 'react-bootstrap/Spinner';

import '../../../css/forms.scss';

const SELECT_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/select';
const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
const ARN_APIGW_GET_SELECT = 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select';
const ARN_APIGW_GET_TABLE_SNOWFLAKE = 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/table-snowflake';

const SELECT_ROUTE = `SELECT DISTINCT
CONCAT(route_name,' : Route ',route_id,' - ', 'Action ',action_id) choice_option,
        route_id,
        action_id
FROM ETLF_ROUTE_COLUMNS
ORDER BY 1 `;

const target_table_actions_list = {
    "R1A1": ['RECREATE', 'TRUNCATE'],
    "R1A2": ['RECREATE', 'TRUNCATE'],
    "R1A3": ['RECREATE', 'TRUNCATE'],
    "R4A1": ['RECREATE'],
    "R6A2": ['RECREATE', 'TRUNCATE', 'INSERT']
}

const RouteDataLoader = ({ setActionModalShow }) => {
    const { authState } = useOktaAuth();

    const {
        debug, username,
        appIDs, table,
        routeOptions, setRouteOptions,
        routeConfigs, //object of route linked to routeCode and corresponding actions
        etlRowConfigs, //KIET_EXTRACT_CONFIG_REQUIREMENTS
        system_configs,
        // ARN_APIGW_GET_TABLE_SNOWFLAKE
    } = useContext(WorkspaceContext);

    
    const [loadingRouteConfig, setLoadingRouteConfig] = useState(false);

    const [helper_route, setHelperRoute] = useState('Oracle to Snowflake');
    const [route, setRoute] = useState('Select Route');
    // const [action, setAction] = useState(Object.keys(routeConfigs[helper_route]['actions'])[0]);
    
    const [routeID, setRouteID] = useState(null);
    const [actionID, setActionID] = useState(null);
    
    const [sourceID, setSourceID] = useState();
    const [targetID, setTargetID] = useState();

    const [extractConfigID, setExtractConfigID] = useState(null);
    const [routeCode, setRouteCode] = useState('R1A1');
    const [dropdownFields, setDropdownFields] = useState({});

    useEffect(() => {
        debug && console.log(routeConfigs);
        debug && console.log(etlRowConfigs);
        debug && console.log(system_configs);
    }, []);
    
    const [initialStates, setInitialStates] = useState({
        ROUTE_ID: routeID,
        ACTION_ID: actionID,
        ACTIVE: 'Y',
        DIEONMISMATCH: 'N',
        NOTIFICATIONEMAILS: username,
        GROUP_ID: appIDs[0],
        // EXTRACT_CONFIG_ID: extractConfigID,
    });
    const [verified, setVerified] = useState(false);

    //ETLF Framework
    const [validationSchema, setValidationSchema] = useState([]);
    const [fields, setFields] = useState([]);
    const [requiredFields, setRequiredFields] = useState({});
    const [optionalFields, setOptionalFields] = useState({});

    let route_schema = yup.object().shape({
        route: yup.string().required(),
        action: yup.string().required()
    });

    useEffect(() => {
        debug && console.log("states updated: ", initialStates);
    }, [initialStates]);

    useEffect(()=>{
        updateDropdownFields('GROUP_ID', appIDs);
    }, [appIDs]);

    useEffect(() => {
        setRequiredFields({});
        setOptionalFields({});
        setFields([]);
        if(route !== 'Select Route'){
            console.log("current route: ", route);

            const currentRoute = (route.split(':'))[1].trim();

            let routeID = routeOptions[route].ROUTE_ID;
            let actionID = routeOptions[route].ACTION_ID;

            setRouteID(routeID);
            setActionID(actionID);
            console.log("Rout ID: ", routeID, ", Action ID: " + actionID);
            console.log("required fields for this route-action: ", routeConfigs[currentRoute][actionID]);
            setInitialStates()
            // getSystemIDs(routeOptions[value].SRC_TECH, 'source', setSourceID);
            // getSystemIDs(routeOptions[value].TGT_TECH, 'target', setTargetID);

            getSystemIDs(routeConfigs[currentRoute].SRC_TECH, 'source', setSourceID);
            getSystemIDs(routeConfigs[currentRoute].TGT_TECH, 'target', setTargetID);

            prepareRequiredFields(routeConfigs[currentRoute][actionID]);

            setLoadingRouteConfig(false);
        }else{
            // setRoute('Select Route');
            setRouteID(0);
        }
    }, [route]);


    //fetch the latest extract_Config_ID from database
    useEffect(() => {
        // debug && console.log('Making API call to fetch Extract Config')
        // const abortController = new AbortController();
        const { accessToken } = authState;

        const source = axios.CancelToken.source();

        const proposed_get_statenent = `SELECT (
  SELECT MAX(EXTRACT_CONFIG_ID)
  FROM SHARED_TOOLS_DEV.ETL.ETLF_EXTRACT_CONFIG
) as EXTRACT_CONFIG_ID;`
        
        debug && console.time("Pulling config for RouteDataLoader");
        // debug && console.log("accessToken: " + accessToken);

        axios.get(TABLESNOWFLAKE_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
                'authorizorToken': accessToken
            },
            //params maps to event.queryStringParameters in lambda
            params: {
                sql_statement: proposed_get_statenent,
                tableName: 'ETLF_EXTRACT_CONFIG',
                database: "SHARED_TOOLS_DEV",
                schema: "ETL",
            },
            // cancelToken: source.token
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // debug && console.log(response.data);
                setExtractConfigID(response.data.rows[0]['EXTRACT_CONFIG_ID'] * 1 + 1);
                
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    // request cancelled
                } else {
                    throw error;
                }
            })
            .finally(() => {
                debug && console.timeEnd("Pulling config for RouteDataLoader");
            });

        return () => {
            source.cancel();
        };
    }, []);

    

    // useEffect(() => {
    //     debug && console.log("Route: ", helper_route);

        // getSystemIDs(helper_route, 'source', setSourceID);
        // getSystemIDs(helper_route, 'target', setTargetID);

    //     let actionIDs = [];
    //     Object.values(routeConfigs[helper_route]['actions']).map(val =>{
    //         actionIDs.push(val.ACTION_ID);
    //     })

    //     // debug && console.log("actions dropdown: " + actionIDs);
    //     updateDropdownFields('ACTION_ID', actionIDs);

    //     let actions = Object.keys(routeConfigs[helper_route]['actions']);
            
    //     let default_action = actions[0];
    //     // debug && console.log("expected new action: " + action);
    //     setAction(default_action);

    // }, [helper_route]);

    // useEffect(() => {
    //     if(action !== ''){
    //         debug && console.log("Current action: ", action);
    //         debug && console.log("Expected action ID: ", routeConfigs[helper_route]['actions'][action]['ACTION_ID']);

    //         setRouteCode(routeConfigs[helper_route]['actions'][action]['code']);
    //     }

    // }, [action]);

    //update ExtractCOnfigID field inside the initialState Object after it's loaded.
    useEffect(()=>{
        setInitialStates(prevState => {
            return { 
              ...prevState, 
              'EXTRACT_CONFIG_ID': extractConfigID
            }
        })
    }, [extractConfigID]);

    useEffect(() => {
        if(routeID !== 0){
            setInitialStates(prevState => {
                return { 
                  ...prevState, 
                  'ROUTE_ID': routeID
                }
            })
        }
        console.log(routeID);
    }, [routeID]);

    useEffect(() => {
        if(routeID !== 0){
            setInitialStates(prevState => {
                return { 
                  ...prevState, 
                  'ACTION_ID': actionID
                }
            })
        }
        console.log(actionID);

    }, [actionID]);


    // useEffect(() => {
    //     if(routeID !== 0){
    //         setInitialStates(prevState => {
    //             return { 
    //               ...prevState, 
    //               'ROUTE_ID': routeID,
    //               'ACTION_ID': actionID,
    //               'SOURCE_SYSTEM_ID': sourceID,
    //               'TARGET_SYSTEM_ID': targetID
    //             }
    //         })
    //     }
    //     console.log(routeID);
    //     console.log(actionID);
    //     console.log(sourceID);
    //     console.log(targetID);

    // }, [routeID,actionID,sourceID,targetID]);

    let required_Fields_Obj = {};
    let formValidationsInfo = [];
    let yup_schema = {};

    

    // Create a Route-Acion specific set of Fields and Required Fields based on
    // routeCode chosen from the etlRowConfigs Object (from Requirement table)
    // useEffect(() => {
    //     const abortController = new AbortController();
    //     // debug && console.log('Snowflake Config: ', snowflake_configs);
    //     // debug && console.log('etlRowConfigs: ', etlRowConfigs);
    //     // debug && console.log("Route Code: " + routeCode);
    //     // let target_table_actions = [];
    //     let target_table_actions = target_table_actions_list[routeCode];
    //     // switch(routeCode){
    //     //     case "R1A1":
    //     //         target_table_actions = ['RECREATE', 'TRUNCATE'];
    //     //         break;
    //     //     case "R1A2":
    //     //         target_table_actions = ['RECREATE', 'TRUNCATE'];
    //     //         break;
    //     //     case "R1A3":
    //     //         target_table_actions = ['RECREATE', 'TRUNCATE'];
    //     //         break;
    //     //     case "R4A1":
    //     //         target_table_actions = ['RECREATE'];
    //     //         break;
    //     //     case "R6A2":
    //     //         target_table_actions = ['RECREATE', 'TRUNCATE', 'INSERT'];
    //     //         break;
    //     //     default:
    //     //         break;
    //     // }
    //     updateDropdownFields('TGT_TABLE_ACTION', target_table_actions);

    //     // reset the object to empty
    //     required_Fields_Obj = {};
    //     let temp_fields = [];
    //     // let required_fields = [];
    //     let required_fields = {};
    //     let optional_fields = {};
    //     etlRowConfigs.map(row => {
    //         let field_name = row.COLUMN_NAME;

    //         required_Fields_Obj[field_name] = {
    //             required: row[routeCode],
    //             type: row.DATA_TYPE,
    //         }

    //         //avoid duplicate values
    //         if (temp_fields.indexOf(field_name) < 0) {
    //             temp_fields.push(field_name);
    //         }

    //         if (row[routeCode] === 'Y' ) {
    //             required_fields[field_name] = 'Y';
    //         }
    //         if (row[routeCode] === 'O') {
    //             // required_fields[field_name] = 'O';
    //             optional_fields[field_name] = 'O';
    //         }
    //     });

    //     debug && console.log(required_fields);
    //     setRequiredFields(required_fields);
    //     setOptionalFields(optional_fields);
    //     setFields(temp_fields);
    //     debug && console.log(required_Fields_Obj);

    //     //dynamically generate the VALIDATION requirement as formValidationsInfo
    //     Object.keys(required_Fields_Obj).map(key => {
    //         let custom_config = {};
    //         custom_config.id = key;
    //         if (required_Fields_Obj[key].required === 'Y') {
    //             // custom_config.isRequired = 'Y';
    //             // console.log('Type for field ', key, ' is ', required_Fields_Obj[key]['type']);

    //             // TARGET_SYSTEM_ID and TARGET_SYSTEM_ID are NUMBER in snowflake
    //             if (key === 'TARGET_SYSTEM_ID' || key === 'SOURCE_SYSTEM_ID') {
    //                 custom_config.validationType = 'string';
    //             }
    //             else {
    //                 custom_config.validationType = required_Fields_Obj[key]['type'] === 'NUMBER' ? 'number' : 'string';
    //             }

    //             custom_config.validations = [{
    //                 type: "required",
    //                 params: ["this field is required"]
    //             }];

    //             if(key === 'NOTIFICATIONEMAILS'){
    //                 custom_config.validations.push({
    //                     type: "email",
    //                     params: ["Please enter a valid email"]
    //                 })
    //             }
    //         }
    //         if (required_Fields_Obj[key].required === 'O') {
    //             custom_config.validationType = required_Fields_Obj[key]['type'] === 'NUMBER' ? 'number' : 'string';
    //         }

    //         //array
    //         formValidationsInfo.push(custom_config);
    //     })

    //     // debug && console.log('Form Validation: ', formValidationsInfo);
    //     // setValidationObject(formValidationsInfo);

    //     let temp_schema = formValidationsInfo.reduce(createYupSchema, {});
    //     // debug && console.log('Form Validation After reduce: ', formValidationsInfo);
    //     // debug && console.log('temp_schema from reduce: ', temp_schema)

    //     yup_schema = yup.object().shape(temp_schema);

    //     //have to use setState here to FORCE UPDATE the object in the form
    //     setValidationSchema(yup_schema);
    //     getInitialValuesForRouteCode();
    //     setVerified(true);

    //     return () => {
    //         abortController.abort();
    //     };
    // }, [routeCode]);

    // function getSystemIDs(route, system_type, setTargetID) {
    //     const target = system_type === 'source' ? 'SOURCE_SYSTEM_ID' : 'TARGET_SYSTEM_ID';
    //     let system_id_desc = [];

    //     if (routeConfigs[route][system_type] !== null && routeConfigs[route][system_type] !== 'DELIMITED_FILE') {
    //         //system_type is either 'source' or 'target'

    //         //set Target_SYSTEM_ID
    //         const system = routeConfigs[route][system_type].toLowerCase(); //'Oracle' or 'Snowflake' or 'Salesforce'
    //         const system_data = system_configs[system];

    //         system_id_desc = Object.values(system_data).map(value =>
    //             value.ETLF_SYSTEM_CONFIG_ID + ' - ' + value.SYSTEM_CONFIG_DESCRIPTION
    //         );

    //         setTargetID((system_id_desc[0].split('-')[0]) *1);

    //         // Update the Dropdown fields for the following Form based on Route and Action
    //         // updateDropdownFields(target, system_id_desc);
    //         debug && console.log("set Id for route: ", route, " ,system_type: ", system_type);
    //     } else {
    //         setTargetID(0);
    //         debug && console.log('Null Target to setIDs dropdowns');
    //     }

    //     updateDropdownFields(target, system_id_desc);
    // }

    function getSystemIDs(systemName, system_type, setTargetID) {
        const target = system_type === 'source' ? 'SOURCE_SYSTEM_ID' : 'TARGET_SYSTEM_ID';
        if(systemName !== 'FILE'){            
            let system_id_desc = [];
            console.log("system name: " + systemName);
            // if ( !== null && routeConfigs[route][system_type] !== 'DELIMITED_FILE') {
                //system_type is either 'source' or 'target'

                //set Target_SYSTEM_ID
                // const system = routeConfigs[route][system_type].toLowerCase(); //'Oracle' or 'Snowflake' or 'Salesforce'
                const system_data = system_configs[systemName.toLowerCase()];

                system_id_desc = Object.values(system_data).map(value =>
                    value.ETLF_SYSTEM_CONFIG_ID + ' - ' + value.SYSTEM_CONFIG_DESCRIPTION
                );

                setTargetID((system_id_desc[0].split('-')[0]) * 1);

            updateDropdownFields(target, system_id_desc);
        }else{
            setTargetID(0);
            updateDropdownFields(target, []);
        }
        
    }

    function updateDropdownFields(target, values) {
        // let updatedDropdownFields = fieldTypesConfigs[table]['dropdownFields'];
        // updatedDropdownFields[target] = values;
        // debug && console.log("Updated Dropdown Fields:", updatedDropdownFields);
        // setDropdownFields(updatedDropdownFields);

        fieldTypesConfigs[table]['dropdownFields'][target] = values;
        setDropdownFields(fieldTypesConfigs[table]['dropdownFields']);
    }

    // function getInitialValuesForRouteCode(){
    //     // debug && console.log("State's Action_ID:", routeConfigs[helper_route]['actions'][action]['ACTION_ID']);

    //     let initialStateForRouteCode = {
    //         ROUTE_ID: routeConfigs[helper_route]['id'],
    //         ACTION_ID: routeConfigs[helper_route]['actions'][action]['ACTION_ID'],
    //         ACTIVE: 'Y',
    //         DIEONMISMATCH: 'N',
    //         NOTIFICATIONEMAILS: username,
    //         GROUP_ID: appIDs[0],
    //         ROUTE_ID: routeConfigs[helper_route]['id'],
    //         ACTION_ID: routeConfigs[helper_route]['actions'][action]['ACTION_ID'],
    //         SOURCE_SYSTEM_ID: sourceID,
    //         TARGET_SYSTEM_ID: targetID,
    //         EXTRACT_CONFIG_ID: extractConfigID,
    //     }

    //     switch(routeCode){
    //         case "R1A1":
    //             initialStateForRouteCode['CURSOR_SIZE'] = 1000;
    //             initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
    //             break;
    //         case "R1A2":
    //             initialStateForRouteCode['CURSOR_SIZE'] = 1000;
    //             initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
    //             break;
    //         case "R1A3":
    //             initialStateForRouteCode['CURSOR_SIZE'] = 1000;
    //             initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
    //             initialStateForRouteCode['PX_PARALLELEXECNUM'] = fieldTypesConfigs[table]['dropdownFields']['PX_PARALLELEXECNUM'][0];
    //             initialStateForRouteCode['PX_SPLITNUM'] = fieldTypesConfigs[table]['dropdownFields']['PX_SPLITNUM'][0];
    //             break;
    //         case "R2A2":
    //             break;
    //         case "R4A1":
    //             initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
    //             initialStateForRouteCode['SOURCE_FILE_TYPE'] = fieldTypesConfigs[table]['dropdownFields']['SOURCE_FILE_TYPE'][0];
    //             break;
    //         case "R5A2":
    //             break;
    //         case "R6A2":
    //             initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
    //             break;
    //         case "R12A1":
    //             break;
    //         default:
    //             break;
    //     }

    //     // debug && console.log("Update the Initial State Object in RouteDataLoader....")
    //     setInitialStates(initialStateForRouteCode);
    // }

    const updateFormRequiredColumns = value => {
        console.log(routeConfigs);
        console.log(routeOptions);
        console.log(value);

        setRequiredFields({});
        setOptionalFields({});
        setFields([]);
        // setVerified(false);
        // setLoadingRouteConfig(true);

        if(value === 'Select Route'){
            setRoute('Select Route');
            setRouteID(0);
            return;
        }
    
        const { accessToken } = authState;

        console.log(value);

        const route = (value.split(':'))[1].trim();

        let routeID = routeOptions[value].ROUTE_ID;
        let actionID = routeOptions[value].ACTION_ID;

        setRouteID(routeID);
        setActionID(actionID);

        // getSystemIDs(routeOptions[value].SRC_TECH, 'source', setSourceID);
        // getSystemIDs(routeOptions[value].TGT_TECH, 'target', setTargetID);

        getSystemIDs(routeConfigs[route].SRC_TECH, 'source', setSourceID);
        getSystemIDs(routeConfigs[route].TGT_TECH, 'target', setTargetID);

        prepareRequiredFields(routeConfigs[route][actionID]);
        console.log(routeConfigs[route][actionID]);

        const SELECT_REQUIRED_FIELDS_SQL = `SELECT A.COLUMN_NAME, B.DATA_TYPE, A.REQUIRED, A.CHECK_STR 
        FROM SHARED_TOOLS_DEV.ETL.ETLF_ROUTE_COLUMNS A
        INNER JOIN (
            SELECT COLUMN_NAME, DATA_TYPE FROM "SHARED_TOOLS_DEV"."INFORMATION_SCHEMA"."COLUMNS"
            WHERE TABLE_SCHEMA = 'ETL'
            AND TABLE_NAME='ETLF_EXTRACT_CONFIG'
        ) B
        ON A.COLUMN_NAME = B.COLUMN_NAME
        WHERE ROUTE_ID = `+ routeID +` AND ACTION_ID = ` + actionID +';';
            
        debug && console.log(SELECT_REQUIRED_FIELDS_SQL);
        
        axios.get(SELECT_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                'authorizorToken': accessToken
            },
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: SELECT_REQUIRED_FIELDS_SQL,
            }
        })
        //have to setState in .then() due to asynchronous opetaions
        .then(response => {
            console.log('Required fields for route: ', response.data);
            prepareRequiredFields(response.data);
            setLoadingRouteConfig(false);
        })
        .catch(err => debug && console.log("error from loading required columns:", err.message))
        
    }

    const prepareRequiredFields = data => {
        console.log("Calling prepareRequiredFields when route changed....")
        console.log(data);
        required_Fields_Obj = {};
        let temp_fields = [];
        // let required_fields = [];
        let required_fields = {};
        let optional_fields = {};

        let modifiedData = data.filter(item => item.COLUMN_NAME !== 'ROUTE_ID' && item.COLUMN_NAME !== 'ACTION_ID')

        console.log(modifiedData);

        modifiedData.map(item => {
            let field_name = item.COLUMN_NAME;

            required_Fields_Obj[field_name] = {
                required: item.REQUIRED,
                type:  item.DATA_TYPE,
            }

            //avoid duplicate values
            if (temp_fields.indexOf(field_name) < 0) {
                temp_fields.push(field_name);
            }

            if (item.REQUIRED === 'Y' ) {
                required_fields[field_name] = 'Y';
            }
            if (item.REQUIRED === 'O') {
                // required_fields[field_name] = 'O';
                optional_fields[field_name] = 'O';
            }
        });

        debug && console.log(required_fields);
        setRequiredFields(required_fields);
        setOptionalFields(optional_fields);
        setFields(temp_fields);
        debug && console.log(required_Fields_Obj);

        createYupSchemaForRoute(required_Fields_Obj);
    }

    function createYupSchemaForRoute(required_Fields_Obj){
        //dynamically generate the VALIDATION requirement as formValidationsInfo
        Object.keys(required_Fields_Obj).map(key => {
            let custom_config = {};
            custom_config.id = key;
            if (required_Fields_Obj[key].required === 'Y') {
                // custom_config.isRequired = 'Y';
                // console.log('Type for field ', key, ' is ', required_Fields_Obj[key]['type']);

                // TARGET_SYSTEM_ID and TARGET_SYSTEM_ID are NUMBER in snowflake
                if (key === 'TARGET_SYSTEM_ID' || key === 'SOURCE_SYSTEM_ID') {
                    custom_config.validationType = 'string';
                }
                else {
                    custom_config.validationType = required_Fields_Obj[key]['type'] === 'NUMBER' ? 'number' : 'string';
                }

                custom_config.validations = [{
                    type: "required",
                    params: ["this field is required"]
                }];

                if(key === 'NOTIFICATIONEMAILS'){
                    custom_config.validations.push({
                        type: "email",
                        params: ["Please enter a valid email"]
                    })
                }
            }
            if (required_Fields_Obj[key].required === 'O') {
                custom_config.validationType = required_Fields_Obj[key]['type'] === 'NUMBER' ? 'number' : 'string';
            }

            //array
            formValidationsInfo.push(custom_config);
        })

        // debug && console.log('Form Validation: ', formValidationsInfo);
        // setValidationObject(formValidationsInfo);

        let temp_schema = formValidationsInfo.reduce(createYupSchema, {});
        // debug && console.log('Form Validation After reduce: ', formValidationsInfo);
        // debug && console.log('temp_schema from reduce: ', temp_schema)

        yup_schema = yup.object().shape(temp_schema);

        console.log("Yup Schema: ", yup_schema);

        //have to use setState here to FORCE UPDATE the object in the form
        setValidationSchema(yup_schema);
    }

    const selectRouteOptions = Object.keys(routeOptions);
    selectRouteOptions.unshift('Select Route');

    return (
        <div>
            <Formik
                validationSchema={route_schema}
                initialValues={{
                    'route': ''
                }}
            >
                {({
                    handleSubmit, isSubmitting,
                    handleChange,
                    values,
                    touched,
                    isValid,
                    isInvalid,
                    errors,
                    status
                }) => (
                        <Form
                            noValidate
                            onSubmit={handleSubmit}>

                            <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                <Form.Label>Route Option:</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="route"
                                    onChange={e => {
                                        handleChange(e);
                                        setRoute(e.target.value);
                                    }}
                                    isValid={touched.route && !errors.route}
                                    isInvalid={touched.route && !!errors.route}
                                // disabled={!fields.length}
                                >
                                    {routeOptions !== undefined && selectRouteOptions.map(route =>
                                        <option key={route}>
                                            {route}
                                        </option>
                                    )}
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.route}
                                </Form.Control.Feedback>
                            </Form.Group>                            

                            {extractConfigID === 0 && 
                                <div className="central-spinning-div">
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span style={{'marginLeft': '5px'}}>Fetching Extract Config ID...</span>
                                </div>
                            }
                        </Form>
                    )}
            </Formik>

            {loadingRouteConfig && route !== 'Select Route' &&
                <div style={{'display': 'flex', 'justifyContent': 'center'}}>Loading configurations...</div>
            }

            {/* <div style={{'display': 'flex', 'justifyContent': 'center'}}>Loading configurations...</div> */}
            
            {/* <button onClick={() => debug && console.log(verified)}>Print verified</button> */ }
            { (extractConfigID > 0 && !loadingRouteConfig) &&    
                <RouteForm
                    routeOptions={routeOptions}
                    route={route}
                    states={initialStates}
                    requiredFields={requiredFields}
                    optionalFields={optionalFields}
                    fields={fields}
                    validationSchema={validationSchema}
                    setShow={setActionModalShow}
                    dropdownFields={dropdownFields}
                />
            }
        </div>
    )
}

export default RouteDataLoader;