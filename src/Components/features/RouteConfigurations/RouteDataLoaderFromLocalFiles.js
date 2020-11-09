import React, { useState, useEffect, useContext } from 'react';
import { Formik } from 'formik';
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

const RouteDataLoader = ({ setActionModalShow }) => {
    const {
        appIDs, table,
        routeConfigs, //object of route linked to routeCode and corresponding actions
        etlRowConfigs, //KIET_EXTRACT_CONFIG_REQUIREMENTS
        system_configs,
    } = useContext(WorkspaceContext);

    const [helper_route, setHelperRoute] = useState('Oracle to Snowflake');
    const [action, setAction] = useState(Object.keys(routeConfigs[helper_route]['actions'])[0]);
    const [sourceID, setSourceID] = useState(0);
    const [targetID, setTargetID] = useState(0);

    const [extractConfigID, setExtractConfigID] = useState(0);
    const [routeCode, setRouteCode] = useState('R1A1');
    const [dropdownFields, setDropdownFields] = useState({});

    useEffect(() => {
        console.log(routeConfigs);
        // console.log(etlRowConfigs);
        console.log(system_configs);
    }, []);
    
    const [initialStates, setInitialStates] = useState({});
    const [verified, setVerified] = useState(false);

    //ETLF Framework
    const [validationSchema, setValidationSchema] = useState([]);
    const [fields, setFields] = useState([]);
    const [requiredFields, setRequiredFields] = useState({});

    let route_schema = yup.object().shape({
        route: yup.string().required(),
        action: yup.string().required()
    });

    useEffect(() => {
        console.log("states updated: ", initialStates);
    }, [initialStates]);

    useEffect(()=>{
        updateDropdownFields('GROUP_ID', appIDs);
    }, [appIDs]);

    //fetch the latest extract_Config_ID from database
    useEffect(() => {
        // console.log('Making API call to fetch Extract Config')
        // const abortController = new AbortController();
        const source = axios.CancelToken.source();

        const proposed_get_statenent = `SELECT (
  SELECT MAX(EXTRACT_CONFIG_ID)
  FROM SHARED_TOOLS_DEV.ETL.ETLF_EXTRACT_CONFIG
) as EXTRACT_CONFIG_ID;`
        const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';

        axios.get(getURL, {
            //params maps to event.queryStringParameters in lambda
            params: {
                sql_statement: proposed_get_statenent,
                tableName: 'ETLF_EXTRACT_CONFIG',
                database: "SHARED_TOOLS_DEV",
                schema: "ETL",
            },
            cancelToken: source.token
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // console.log(response.data);
                setExtractConfigID(response.data.rows[0]['EXTRACT_CONFIG_ID'] * 1 + 1);
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    // request cancelled
                } else {
                    throw error;
                }
            });

        return () => {
            source.cancel();
        };
    }, []);

    //update ExtractCOnfigID field inside the initialState Object after it's loaded.
    useEffect(()=>{
        // if(extractConfigID >0) 
            getInitialValuesForRouteCode();
    }, [extractConfigID]);

    useEffect(() => {
        console.log("Route: ", helper_route);

        getSystemIDs(helper_route, 'source', setSourceID);
        getSystemIDs(helper_route, 'target', setTargetID);

        let actionIDs = [];
        Object.values(routeConfigs[helper_route]['actions']).map(val =>{
            actionIDs.push(val.ACTION_ID);
        })

        // console.log("actions dropdown: " + actionIDs);
        updateDropdownFields('ACTION_ID', actionIDs);

        let actions = Object.keys(routeConfigs[helper_route]['actions']);
            
        let default_action = actions[0];
        // console.log("expected new action: " + action);
        setAction(default_action);

    }, [helper_route]);

    useEffect(() => {
        if(action !== ''){
            console.log("Current action: ", action);
            console.log("Expected action ID: ", routeConfigs[helper_route]['actions'][action]['ACTION_ID']);

            setRouteCode(routeConfigs[helper_route]['actions'][action]['code']);
        }

    }, [action]);

    let required_Fields_Obj = {};
    let formValidationsInfo = [];
    let yup_schema = {};

    // Create a Route-Acion specific set of Fields and Required Fields based on
    // routeCode chosen from the etlRowConfigs Object (from Requirement table)
    useEffect(() => {
        const abortController = new AbortController();
        // console.log('Snowflake Config: ', snowflake_configs);
        // console.log('etlRowConfigs: ', etlRowConfigs);
        // console.log("Route Code: " + routeCode);
        let target_table_actions = [];
        switch(routeCode){
            case "R1A1":
                target_table_actions = ['RECREATE', 'TRUNCATE'];
                break;
            case "R1A2":
                target_table_actions = ['RECREATE', 'TRUNCATE'];
                break;
            case "R1A3":
                target_table_actions = ['RECREATE', 'TRUNCATE'];
                break;
            case "R4A1":
                target_table_actions = ['RECREATE'];
                break;
            case "R6A2":
                target_table_actions = ['RECREATE', 'TRUNCATE', 'INSERT'];
                break;
            default:
                break;
        }
        updateDropdownFields('TGT_TABLE_ACTION', target_table_actions);

        // reset the object to empty
        required_Fields_Obj = {};
        let temp_fields = [];
        // let required_fields = [];
        let required_fields = {};
        etlRowConfigs.map(row => {
            let field_name = row.COLUMN_NAME;

            required_Fields_Obj[field_name] = {
                required: row[routeCode],
                type: row.DATA_TYPE,
            }

            //avoid duplicate values
            if (temp_fields.indexOf(field_name) < 0) {
                temp_fields.push(field_name);
            }

            if (row[routeCode] === 'Y' ) {
                required_fields[field_name] = 'Y';
            }
            if (row[routeCode] === 'O') {
                required_fields[field_name] = 'O';
            }
        });

        console.log(required_fields);
        setRequiredFields(required_fields);
        setFields(temp_fields);
        console.log(required_Fields_Obj);

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
            }
            if (required_Fields_Obj[key].required === 'O') {
                custom_config.validationType = required_Fields_Obj[key]['type'] === 'NUMBER' ? 'number' : 'string';
            }

            //array
            formValidationsInfo.push(custom_config);
        })

        // console.log('Form Validation: ', formValidationsInfo);
        // setValidationObject(formValidationsInfo);

        let temp_schema = formValidationsInfo.reduce(createYupSchema, {});
        // console.log('Form Validation After reduce: ', formValidationsInfo);
        // console.log('temp_schema from reduce: ', temp_schema)

        yup_schema = yup.object().shape(temp_schema);

        //have to use setState here to FORCE UPDATE the object in the form
        setValidationSchema(yup_schema);
        getInitialValuesForRouteCode();
        setVerified(true);

        return () => {
            abortController.abort();
        };
    }, [routeCode]);

    function getSystemIDs(route, system_type, setTargetID) {
        const target = system_type === 'source' ? 'SOURCE_SYSTEM_ID' : 'TARGET_SYSTEM_ID';
        let system_id_desc = [];
        if (routeConfigs[route][system_type] !== null) {
            //system_type is either 'source' or 'target'

            //set Target_SYSTEM_ID
            const system = routeConfigs[route][system_type].toLowerCase(); //'Oracle' or 'Snowflake' or 'Salesforce'
            const system_data = system_configs[system];

            system_id_desc = Object.values(system_data).map(value =>
                value.ETLF_SYSTEM_CONFIG_ID + ' - ' + value.SYSTEM_CONFIG_DESCRIPTION
            );

            setTargetID((system_id_desc[0].split('-')[0]) *1);

            // Update the Dropdown fields for the following Form based on Route and Action
            // updateDropdownFields(target, system_id_desc);
            console.log("set Id for route: ", route, " ,system_type: ", system_type);
        } else {
            setTargetID(0);
            console.log('Null Targer to setIDs dropdowns');
        }

        updateDropdownFields(target, system_id_desc);
    }

    function updateDropdownFields(target, values) {
        // let updatedDropdownFields = fieldTypesConfigs[table]['dropdownFields'];
        // updatedDropdownFields[target] = values;
        // console.log("Updated Dropdown Fields:", updatedDropdownFields);
        // setDropdownFields(updatedDropdownFields);

        fieldTypesConfigs[table]['dropdownFields'][target] = values;
        setDropdownFields(fieldTypesConfigs[table]['dropdownFields']);
    }

    function getInitialValuesForRouteCode(){
        // console.log("State's Action_ID:", routeConfigs[helper_route]['actions'][action]['ACTION_ID']);

        let initialStateForRouteCode = {
            ROUTE_ID: routeConfigs[helper_route]['id'],
            ACTION_ID: routeConfigs[helper_route]['actions'][action]['ACTION_ID'],
            ACTIVE: 'Y',
            DIEONMISMATCH: 'N',
            NOTIFICATIONEMAILS: 'kiet.nguyen@aig.com',
            GROUP_ID: appIDs[0],
            ROUTE_ID: routeConfigs[helper_route]['id'],
            ACTION_ID: routeConfigs[helper_route]['actions'][action]['ACTION_ID'],
            SOURCE_SYSTEM_ID: sourceID,
            TARGET_SYSTEM_ID: targetID,
            EXTRACT_CONFIG_ID: extractConfigID,
        }

        switch(routeCode){
            case "R1A1":
                initialStateForRouteCode['CURSOR_SIZE'] = 1000;
                initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
                break;
            case "R1A2":
                initialStateForRouteCode['CURSOR_SIZE'] = 1000;
                initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
                break;
            case "R1A3":
                initialStateForRouteCode['CURSOR_SIZE'] = 1000;
                initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
                initialStateForRouteCode['PX_PARALLELEXECNUM'] = fieldTypesConfigs[table]['dropdownFields']['PX_PARALLELEXECNUM'][0];
                initialStateForRouteCode['PX_SPLITNUM'] = fieldTypesConfigs[table]['dropdownFields']['PX_SPLITNUM'][0];
                break;
            case "R2A2":
                break;
            case "R4A1":
                initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
                initialStateForRouteCode['SOURCE_FILE_TYPE'] = fieldTypesConfigs[table]['dropdownFields']['SOURCE_FILE_TYPE'][0];
                break;
            case "R5A2":
                break;
            case "R6A2":
                initialStateForRouteCode['TGT_TABLE_ACTION'] = 'RECREATE';
                break;
            case "R12A1":
                break;
            default:
                break;
        }

        // console.log("Update the Initial State Object in RouteDataLoader....")
        setInitialStates(initialStateForRouteCode);
    }

    return (
        <div>
            <Formik
                validationSchema={route_schema}

                //destructure the action obj into {setSubmitting}
                // onSubmit={(values, errors) => {
                //     getInitialValuesForRouteCode();
                //     // console.log("Route code: ", routeCode);
                // }}

                initialValues={{
                    route: helper_route,
                    action: action,
                }}
            // validate={validate_R1A1}
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

                            <Row>
                                <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                    <Form.Label>Route:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="route"
                                        onChange={e => {
                                            handleChange(e);
                                            setHelperRoute(e.target.value);
                                            setAction("");
                                            setVerified(false);
                                        }}
                                        isValid={touched.route && !errors.route}
                                        isInvalid={touched.route && !!errors.route}
                                    // disabled={!fields.length}
                                    >
                                        {Object.keys(routeConfigs).map(route =>
                                            <option key={route}>
                                                {route}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.route}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                
                                <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                    <Form.Label>Action:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="action"
                                        onChange={(e) => {
                                            handleChange(e);
                                            let action = e.target.value;
                                            setAction(action);
                                            setVerified(false);
                                            // setRouteCode(routeConfigs[helper_route]['actions'][action]['code']);
                                        }}
                                        value={action}
                                        isValid={touched.action && !errors.action}
                                        isInvalid={touched.action && !!errors.action}
                                        // disabled={!fields.length}
                                        // defaultValue={routes_config['Oracle to Snowflake'][0]}
                                    >
                                        {Object.keys(routeConfigs[helper_route]['actions']).map(action => <option key={action} >{action}</option>)}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.action}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                
                            </Row>

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
            
            {/* <button onClick={() => console.log(verified)}>Print verified</button> */}
            {extractConfigID > 0 && 
            // (Object.keys(initialStates).length >0) && 
            // (fields.length > 0) &&
            verified &&    
                <RouteForm
                    routeCode={routeCode}
                    extractConfigID={extractConfigID}
                    states={initialStates}
                    requiredFields={requiredFields}
                    fields={fields}
                    validationSchema={validationSchema}
                    helper_route={helper_route}
                    setShow={setActionModalShow}
                    dropdownFields={dropdownFields}
                />
            }
        </div>
    )
}

export default RouteDataLoader;