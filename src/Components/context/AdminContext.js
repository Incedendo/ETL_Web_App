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

    useEffect(() =>{
        console.log("this is the admin context...");
    }, []);

    useEffect(() => {
        
        // if(username !== '' && accessToken !== ''){
        if (authState.isAuthenticated && username !== '') {
            const { accessToken } = authState;
            // debug && console.log("ACcess token ETLF_ACCESS_AUTHORIZATION: ", accessToken);
            debug && console.log("Access token from authState: ", accessToken);
            
            const getAdminSQL = "SELECT COUNT(*) AS COUNT FROM SHARED_TOOLS_DEV.ETL.DATCAT_ADMIN WHERE UPPER(USERNAME) = '"
                + username.toUpperCase() + "';";
            
            debug && console.log(getAdminSQL);
            
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: getAdminSQL,
                }
            })
                //have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    debug && console.log("Admin count:", response.data);
                    if(response.data[0].COUNT == 1){
                        setAdmin(true);
                    }
                })
                .catch(err => debug && console.log("error from loading SHARED_TOOLS_DEV.ETL.DATCAT_ADMIN:", err.message))

            const getStewardSQL = "SELECT COUNT(*) AS COUNT FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD WHERE UPPER(EMAIL) = '"
            + username.toUpperCase() + "';";
            axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    // 'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
                    'authorizorToken': accessToken
                },
                //params maps to event.queryStringParameters in lambda
                params: {
                    sqlStatement: getStewardSQL,
                }
            })
                //have to setState in .then() due to asynchronous opetaions
                .then(response => {
                    debug && console.log("Steward count:", response.data);
                    if(response.data[0].COUNT == 1){
                        setSteward(true);
                    }
                })
                .catch(err => debug && console.log("error from loading SHARED_TOOLS_DEV.ETL.DATCAT_ACCESS_AUTHORIZATION:", err.message))    
        }
        
    }, [authState, username]);
    
    const usersContext = { isAdmin, isSteward };
    
    return (
        <AdminContext.Provider value={usersContext}>
            {props.children}
        </AdminContext.Provider>
    )
}