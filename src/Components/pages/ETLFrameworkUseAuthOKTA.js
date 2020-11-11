import React, { useState, useEffect, useContext } from 'react';
import {
    useOktaAuth
} from '@okta/okta-react';

import '../../App.css';
import '../../css/dropdown.scss';
import '../../css/home.css';
import '../../css/workspace.scss';
import '../../css/etlframework.scss';

import { WorkspaceContext } from '../context/WorkspaceContext';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import CustomAutoCompleteComp from '../features/GridComponents/CustomAutoCompleteComp';
import WorkTab from '../features/Tabs/WorkTab';
import ConfigTab from '../features/Tabs/ConfigTab';
import JobTab from '../features/Tabs/JobTab';
import PlaygroundTab from '../features/Tabs/PlaygroundTab';
import PlaygroundTab2 from '../features/Tabs/PlaygroundTab2';
import axios from 'axios';

const ETLFrameworkUseAuthOKTA = () => {

    const { authState, authService } = useOktaAuth();

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
    }

    const logout = async () => {
        // Redirect to '/' after logout
        authService.logout('/');
    }

    const [loadingAppIDs, setLoadingAppIDs] = useState(false);

    const {
        debug,
        username, setUsername,
        setAccessToken,
        name, setName,
        setScopes,
        appIDs,

        setTable, 
        tableLoading,
        tableLoaded, 
        tableSearching,

        editMode, 
    } = useContext(WorkspaceContext);

    useEffect(() => {
        setLoadingAppIDs(false);
        debug && console.log('APP IDs', appIDs);
    }, [appIDs])

    // useEffect(() => {
    //     debug && console.log('Update Button Clicked, editMode: ', editMode);
    // }, [editMode])

    // const testCors = () => {
    //     const { accessToken } = authState;
    //     const proposed_get_statenent = 'SELECT ETLF_SYSTEM_CONFIG_ID, SYSTEM_CONFIG_TYPE, SYSTEM_CONFIG_DESCRIPTION, SYSTEM_CONFIG_JSON FROM SHARED_TOOLS_DEV.ETL.ETLF_SYSTEM_CONFIG;';

    //     // const getURL = 'https://qkn5syfrye.execute-api.us-east-1.amazonaws.com/Dev/select';
    //     const getURL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/select';
        
    //     axios.get(getURL, {
    //         headers: {
    //             'type': 'TOKEN',
    //             'methodArn': 'arn:aws:execute-api:us-east-1:902919223373:jda1ch7sk2/*/GET/select',
    //             'authorizorToken': accessToken
    //         },
    //         params: {
    //             sql_statement: proposed_get_statenent,
    //             tableName: "ETLF_SYSTEM_CONFIG",
    //             database: "SHARED_TOOLS_DEV",
    //             schema: "ETL",
    //         }
    //     })
    //         //have to setState in .then() due to asynchronous opetaions
    //         .then(response => {
    //             debug && console.log("Result from TEST CORS:", response.data);
    //         })
    //         .catch(err => debug && console.log("error from loading ETLF_ACCESS_AUTHORIZATION:", err.message))
    // }

    const AccessControlInfo = () => (
        <div className="userInfo">
            <div>
                <h5>Welcome, {name.split(',')[1]} ({username}) </h5>
                <Button 
                    style={{
                        "position": "relative",
                        "float": "right",
                    }}
                    onClick={logout}>
                    Log out
                </Button>
                {/* <button onClick={testCors}>Test CORS</button> */}
            </div>

            {/* <div>
                <h6>Read-Write Access:</h6>
                { appIDs.length !== 0 
                ? <span className="span-border">{appIDs.toString()}</span>
                : <span>[no read/write access assigned to user]</span>
                }
            </div>

            <h6>Authenticated: {authState.isAuthenticated ? 'true' : 'false'}</h6> */}

            {/* <AccessModal /> */}
        </div>
    )

    if (authState.isPending) {
        return <div> Loading... </div>;
    }

    return authState.isAuthenticated ?
        <div className="App container">
                <>
                    {/* <small>You are running this app in <b>{process.env.NODE_ENV}</b> mode </small> 
                    <small>You are running this app in <b>{process.env.REACT_APP_ENV}</b> mode </small>  */}
                    <AccessControlInfo />

                    <Tabs defaultActiveKey="Configuration" transition={false} id="noanim-tab-example"
                        onSelect={(eventKey)=>{
                            if (eventKey ==="Configuration"){
                                debug && console.log("Config Tab");
                                setTable("ETLF_EXTRACT_CONFIG");
                            } else if (eventKey === "Jobs"){
                                debug && console.log("Configuration Tab");
                                setTable("ETLFCALL");
                            } 
                        }}
                    >
                        < Tab eventKey = "Configuration" title = "Configuration" disabled = {tableLoading}>
                            <WorkTab />
                        </Tab>
                        <Tab eventKey="Jobs" title="Jobs" disabled = {tableLoading}>
                            <WorkTab />
                        </Tab>
                
                        
                    </Tabs>
                </>
        </div> 
        :
        <button onClick={login}>Login</button>;

}

export default ETLFrameworkUseAuthOKTA;
