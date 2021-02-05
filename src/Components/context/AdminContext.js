import React, { useState, useEffect, useContext, createContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from './WorkspaceContext';
import axios from 'axios';
import { SELECT_URL, ARN_APIGW_GET_SELECT } from './URLs';

export const AdminContext = createContext();

export const AdminProvider = (props) => {

    const { authState, authService } = useOktaAuth();

    const { debug, username } = useContext(WorkspaceContext);

    const [isAdmin, setAdmin] = useState(false);
    const [isSteward, setSteward] = useState(false);
    const [isDomainOperator, setDomainOperator] = useState(false);
    const [allGroupIDs, setAllGroupIDs] = useState([]);

    useEffect(() =>{
        console.log("this is the admin context...");
    }, []);

    useEffect(() =>{
        if(allGroupIDs.length > 0){
            console.log("allGroupIDs...", allGroupIDs);
        }
    }, [allGroupIDs]);

    useEffect(() => {
        let mounted = true;
        // if(username !== '' && accessToken !== ''){
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            // debug && console.log("ACcess token ETLF_ACCESS_AUTHORIZATION: ", accessToken);
            debug && console.log("Access token from authState: ", accessToken);

            const headers =  {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                'authorizorToken': accessToken
            };

            const getAdminSQL = "SELECT COUNT(*) AS COUNT FROM SHARED_TOOLS_DEV.ETL.DATCAT_ADMIN WHERE UPPER(USERNAME) = '"
                + username.toUpperCase() + "';";
            const getStewardSQL = "SELECT COUNT(*) AS COUNT FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD WHERE UPPER(EMAIL) = '"
                + username.toUpperCase() + "';";
            const getDomainOperatorSQL = "SELECT COUNT(*) AS COUNT FROM SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION WHERE UPPER(USERNAME) = '"
                + username.toUpperCase() + "';";
            const getAllGroupIDsSQL = `select DISTINCT GROUP_ID from "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG";`

            const getAdmin = axios.get(SELECT_URL, {
                headers,
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: getAdminSQL,
                }
            });
            const getSteward = axios.get(SELECT_URL, {
                headers,
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: getStewardSQL,
                }
            });
            const getDomainOperator = axios.get(SELECT_URL, {
                headers,
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: getDomainOperatorSQL,
                }
            });
            const getAllGroupIDs = axios.get(SELECT_URL, {
                headers,
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: getAllGroupIDsSQL,
                }
            })
            
            axios
                .all([getAdmin, getSteward, getDomainOperator, getAllGroupIDs])
                .then(axios.spread((...responses) => {
                    const responseOne = responses[0];
                    const responseTwo = responses[1];
                    const responesThree = responses[2];
                    const responesFour = responses[3];

                    // debug && console.log(responseOne);
                    // debug && console.log(responseTwo);
                    // debug && console.log(responesThree);
                    debug && console.log(responesFour);

                    if(responseOne.data[0].COUNT == 1){
                        debug && console.log('set admin');
                        setAdmin(true);
                    }
                    if(responseTwo.data[0].COUNT == 1){
                        debug && console.log('set steward');
                        setSteward(true);
                    }
                    if(responesThree.data[0].COUNT > 0){
                        debug && console.log('set Domain Operator');
                        setDomainOperator(true);
                    }

                    // const allGroupsID = 
                    setAllGroupIDs(responesFour.data.map(row => row.GROUP_ID));
                    // use/access the results 
                }))
                .catch(errors => {
                    // react on errors.
                    debug && console.log(errors.response)
                })
            
            // axios.get(SELECT_URL, {
            //     headers: {
            //         'type': 'TOKEN',
            //         'methodArn': ARN_APIGW_GET_SELECT,
            //         // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
            //         'authorizorToken': accessToken
            //     },
            //     //params maps to event.queryStringParameters in lambda
            //     params: {
            //         sqlStatement: getAdminSQL,
            //     }
            // })
            //     //have to setState in .then() due to asynchronous opetaions
            //     .then(response => {
            //         debug && console.log("Admin count:", response.data);
            //         if(response.data[0].COUNT == 1){
            //             setAdmin(true);
            //         }
            //     })
            //     .catch(err => debug && console.log("error from loading SHARED_TOOLS_DEV.ETL.DATCAT_ADMIN:", err.message))

            
            // axios.get(SELECT_URL, {
            //     headers: {
            //         'type': 'TOKEN',
            //         'methodArn': ARN_APIGW_GET_SELECT,
            //         // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
            //         'authorizorToken': accessToken
            //     },
            //     //params maps to event.queryStringParameters in lambda
            //     params: {
            //         sqlStatement: getStewardSQL,
            //     }
            // })
            //     //have to setState in .then() due to asynchronous opetaions
            //     .then(response => {
            //         debug && console.log("Steward count:", response.data);
            //         if(response.data[0].COUNT == 1){
            //             setSteward(true);
            //         }
            //     })
            //     .catch(err => debug && console.log("error from loading SHARED_TOOLS_DEV.ETL.DATCAT_ACCESS_AUTHORIZATION:", err.message))    
        }
        
    }, [authState, username]);
    
    const usersContext = { isAdmin, isSteward, isDomainOperator, allGroupIDs };
    
    return (
        <AdminContext.Provider value={usersContext}>
            {props.children}
        </AdminContext.Provider>
    )
}