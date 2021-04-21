import React, { useState, useEffect, useContext } from 'react';

//---------------Contexts----------------------
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';

import { models, Report, Embed, service, Page } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';

import { useOktaAuth } from '@okta/okta-react';
import { Formik, Field } from 'formik';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../../../css/forms.scss';
import * as msal from "@azure/msal-browser";
import { SELECT_URL, ARN_APIGW_GET_SELECT, } from '../../context/URLs';
import { readString, CSVReader } from 'react-papaparse';



const PlaygroundTab = () => {
    //-------------------------------------AZURE-------------------------
    const authorityHostUrl = "https://login.microsoftonline.com/common/v2.0";
    const tenant = '9b893b67-6443-4d66-89db-071299e7a04d';
    // let authorityUrl = authorityHostUrl + '/' + tenant;
    let authorityUrl = "https://login.microsoftonline.com/"+tenant+"common/v2.0/authorize";
    const clientId = '5794e0d8-1fe0-43f5-bb0d-d9151e49f416';
    const clientSecret = 'm73-088ZCi1J4z3i.qD9.8FvfdRvi_.LrO';
    const resource = 'api://5794e0d8-1fe0-43f5-bb0d-d9151e49f416';
    const workspaceId = "e03acc2e-8490-4cf6-a3ce-803645dc258c";
    const reportId = "2702a5a5-f78e-42e9-9ade-3f2db647904c";
    const scope = "https://analysis.windows.net/powerbi/api";
//----------------------------------------------
    const {
        debug,
        insertSuccess, insertError, setInsertError,
        axiosCallToGetCountsAndTableRows
    } = useContext(WorkspaceContext);

    const { authState, authService } = useOktaAuth();

    const [loading, setLoading] = useState(false);

    const schema = yup.object().shape({
        applicationID: yup.string().required(),
        workspaceID: yup.string().required(),
        reportID: yup.string().required(),
        AADAuthorityUrl: yup.string().required()
    });

    const [initialStates, setInitialStates] = useState({
        applicationID: "5794e0d8-1fe0-43f5-bb0d-d9151e49f416",
        workspaceID: "e03acc2e-8490-4cf6-a3ce-803645dc258c",
        reportID: "2702a5a5-f78e-42e9-9ade-3f2db647904c",
        AADAuthorityUrl: ""
    });

    const fields = ["applicationID", "workspaceID", "reportID", "AADAuthorityUrl"];

    const [validating, setValidating] = useState(false);

    const [domains, setDomains] = useState([]);
    const [selectedDomains, setSelectedDomains] = useState([]);

    useEffect(() =>{
        const { accessToken } = authState;
        const DATA_DOMAIN_SQL = `SELECT DOMAIN,DATA_DOMAIN_ID  FROM "SHARED_TOOLS_DEV"."ETL"."DATA_DOMAIN";`;
        
        axios.get(SELECT_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                'authorizorToken': accessToken
            },
            //params maps to event.queryStringParameters in lambda
            params: {
                sqlStatement: DATA_DOMAIN_SQL,
            }
        })//have to setState in .then() due to asynchronous opetaions
        .then(response => {
            // returning the data here allows the caller to get it through another .then(...)
            // console.log('---------GET RESPONSE-----------');
            
            
            const domainObj = response.data.map(item => ({
                'label': item.DOMAIN,
                'value': item.DATA_DOMAIN_ID
            }));

            debug && console.log(domainObj);

            setDomains(domainObj)
        });
    }, [])

    // const [report, setReport] = useState();
    // const [sampleReportConfig, setReportConfig] = useState({
	// 	type: 'report',
	// 	embedUrl: 'https://app.powerbi.com/groups/e03acc2e-8490-4cf6-a3ce-803645dc258c/reports/384be44b-c142-4b73-9ada-5d2494caaa9b/ReportSection',
	// 	tokenType: models.TokenType.Embed,
	// 	accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvOWI4OTNiNjctNjQ0My00ZDY2LTg5ZGItMDcxMjk5ZTdhMDRkLyIsImlhdCI6MTYxNzEyOTkyMCwibmJmIjoxNjE3MTI5OTIwLCJleHAiOjE2MTcxMzM4MjAsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBU1FBMi84VEFBQUFFeVNRTVhhOUlXY0IvRUhrWWJNSjh5K0tQL3FEUWJiWTJwK2lZYWxMNmY0PSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiJlYTA2MTZiYS02MzhiLTRkZjUtOTViOS02MzY2NTlhZTUxMjEiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6Ik5ndXllbiIsImdpdmVuX25hbWUiOiJLaWV0IiwiaXBhZGRyIjoiNzQuMTA3LjEzNi41MCIsIm5hbWUiOiJOZ3V5ZW4sIEtpZXQgTSIsIm9pZCI6ImNhZTk3YTM1LTQzN2ItNDIxNS1hNGRmLTU4M2UwZmVjZjJkNiIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS04MjU3NTAxNDctMTU1MzA5NjUwNi0zODk1OTg3ODM2LTEyMTc3NDUiLCJwdWlkIjoiMTAwMzNGRkZBMUMxMzUwMyIsInJoIjoiMC5BUmdBWnp1Sm0wTmtaazJKMndjU21lZWdUYm9XQnVxTFlfVk5sYmxqWmxtdVVTRVlBRDQuIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiSDFpam9fWUhMczA3Szlib1FaVDJVM0NyX0I2X3Mwd0tNSmt4RDJkRGlzTSIsInRpZCI6IjliODkzYjY3LTY0NDMtNGQ2Ni04OWRiLTA3MTI5OWU3YTA0ZCIsInVuaXF1ZV9uYW1lIjoiS2lldC5OZ3V5ZW5AYWlnLmNvbSIsInVwbiI6IktpZXQuTmd1eWVuQGFpZy5jb20iLCJ1dGkiOiJUSGxLZDJnbGVFS29HQUFndlhmdUFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXX0.oZY644VH6TTKWkkjeIdQ96GHAxJQaVapkZdA2d31096cdEYwHa8UknKM2M6t1nYFlTW_dpp_awMMPyFIR3RZM-I0LoLcwT2AHWCa4dLVewXhjVS9ilNpngduBayy03lJnoBWO4sDFEPzYat3ITMrs4_M-g1S5POqtm8ITNigeL2h_JHPga8UQc5hq_1Ng-CXA-GcRs7kURAUmiw27BBki7eT0CQ2nu49q8sWS_6B9W7nk2JEr0O6_OSHxPa-9NawGTZjBqhXFp4cWOq7QC9syXLscGSQJduf4e-_F06X7uXlisfxZanIRhyLsExtCVBZf7ob0pD7imhic6HOdvCvPw',
	// 	settings: undefined,
	// });

    useEffect(() => {
        //MSAL
        const msalConfig = {
            auth: {
              clientId: clientId, // pls add api permission with azure key vault
              authority: authorityUrl,
              redirectUri: "http://localhost:3000/",
            },
            cache: {
              cacheLocation: "sessionStorage", // This configures where your cache will be stored
              storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
            }
          };

        const tokenRequest = {
            scopes: [scope]
        };  

        // const myMSALObj = new msal.UserAgentApplication(msalConfig);
        
        //at first, I used scope like ["openid", "profile", "User.Read", "https://vault.azure.net/user_impersonation"]
        //but with this accesstoken, I got the same error as yours
        //and I try to use the scope below, and it worked 
        //I decode the token with jwt, when I get error, the token didn't contains correct scope
        // const loginRequest = {
        //     scopes: ["openid", "profile", "https://vault.azure.net/user_impersonation"],
        // };
        
        // getAccessToken(tokenRequest);
        
        function getAccessToken(){
            getTokenPopup(loginRequest)
                  .then(response => {
                    $("#accessToken").text(response.accessToken);
                  }).catch(error => {
                    console.log(error);
                  });
        }
        
        function getTokenPopup(request) {
          return myMSALObj.acquireTokenSilent(request)
            .catch(error => {
              console.log(error);
              console.log("silent token acquisition fails. acquiring token using popup");
        
              // fallback to interaction when silent call fails
                return myMSALObj.acquireTokenPopup(request)
                  .then(tokenResponse => {
                    return tokenResponse;
                  }).catch(error => {
                    console.log(error);
                  });
            });
        }
    }, []);

    const handleOnLoaded = (data) => {
        console.log("Files loaded....");
        console.log(data);
        const headers = data[0].data;
        console.log(headers);

        const rows = data.slice(1);

        //item[0]: DB, item[1]: schema, item[2]: table_name
        // const tables = data.filter(item => item.data[3] === "");
        let tables = [];
        data.map(item => {
            if(item.data[3] === "")
                tables.push(item.data);
        });
        addTablesToDomains(tables);

        //item[0]: DB, item[1]: schema, item[2]: table_name, item[3]: column
        const columns = data.filter(item => item.data[3] !== "");

        // console.log(tables);
    }

    const addTablesToDomains = (tables) => {
        console.log(tables);
        console.log(selectedDomains);

        let catalogEntitiesIDs = '';
        tables.map(item => 
            catalogEntitiesIDs += 'ABS(HASH(UPPER(TRIM(\''+ item[0] +'\')), UPPER(TRIM(\''+ item[1] +'\')), UPPER(TRIM(\''+ item[2] +'\')) ));'
        );

        // const catalogEntitiesIDsSQL = `SELECT * FROM 
        // table(strtok_split_to_table('` + catalogEntitiesIDs + `', ';')) as table1;`

        // console.log(catalogEntitiesIDsSQL);

        let sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN TT
        USING (
            select UPPER(TRIM(table1.value)) as CATALOG_ENTITIES_ID, UPPER(TRIM('` + selectedDomains + `')) AS DATA_DOMAIN_ID
            from table(strtok_split_to_table('` + catalogEntitiesIDs + `', ';')) as table1
        ) st 
        ON (TT.DATA_DOMAIN_ID = ST.DATA_DOMAIN_ID AND TT.CATALOG_ENTITIES_ID = ST.CATALOG_ENTITIES_ID)
        WHEN NOT matched THEN
        INSERT (
            DATA_DOMAIN_ID, CATALOG_ENTITIES_ID
        ) 
        VALUES 
        (
            st.DATA_DOMAIN_ID, st.CATALOG_ENTITIES_ID
        );`;

        console.log(sql);
    }

    const handleOnDrop = () => {
        console.log("On Drop....");
    }

    const handleOnRemoveFile = () => {
        console.log("remove files....");
    }

    const printChange = (values) =>{
        let selectedOptions = [];
        values.map(option => selectedOptions.push(option['value']));;

        console.log(selectedOptions);
        setSelectedDomains(selectedOptions);
    }

    return(
        <div>
            <h4>Welcome to Playground</h4> 

            <ReactMultiSelectCheckboxes
                placeholderButtonLabel={"hello world"}
                onChange={values => printChange(values)}
                options={domains} 
            />

            {selectedDomains.length > 0 && 
                <CSVReader 
                    onFileLoad={
                        handleOnLoaded
                    }
                    // onDrop={handleOnDrop}
                    // onError={this.handleOnError}
                    // noDrag
                    addRemoveButton
                    onRemoveFile={handleOnRemoveFile}
                    >
                    <span>Click to upload.</span>
                    
                </CSVReader>
            }

            {/* <iframe width="800" height="600" src="https://app.powerbi.com/rdlEmbed?reportId=2702a5a5-f78e-42e9-9ade-3f2db647904c&autoAuth=true&ctid=9b893b67-6443-4d66-89db-071299e7a04d" frameborder="0" allowFullScreen="true"></iframe>

            <Formik
                validationSchema={schema}

                //destructure the action obj into {setSubmitting}
                onSubmit={(values, { resetForm, setErrors, setSubmitting }) => {
                    setSubmitting(true);
                    console.log('values: ', values);
                    // setValidating(true);
                    // setShow(false);
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

                            {fields.map(field => 
                                <Form.Group key={field} as={Row} controlId={"formGroupappID"}>
                                    <Form.Label column sm="2">{field}</Form.Label>
                                    <Col sm="10">
                                        <Form.Control
                                            type="text"
                                            name={field}
                                            value={values[field]}
                                            onChange={e => {
                                                handleChange(e);
                                            }}
                                            onBlur={handleBlur}
                                            isValid={touched[field] && !errors[field]}
                                            isInvalid={errors[field]}
                                        />
                                    </Col>
                                    
                                    <Form.Control.Feedback type="invalid"> {errors["appID"]} </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            

                            <div className="central-spinning-div">
                                <Button
                                    // variant="primary"
                                    type="submit" 
                                    disabled={isSubmitting}
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
                                        ? <span style={{ 'marginLeft': '5px' }}>Get Report</span>
                                        : <span style={{ 'marginLeft': '5px' }}>Fetching...</span>
                                    }
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik> */}

            
        </div>
    )
}

export default PlaygroundTab;