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
import WorkTab from '../features/Tabs/WorkTab';
import { getSearchFieldValue } from '../sql_statements';

const ETLFrameworkUseAuthOKTA = ( props ) => {
    const ISSUER =`https://devaigtech.oktapreview.com/oauth2/default`;
    const ISSUER_UAT = `https://uataigtech.oktapreview.com/oauth2/default`;
    const REDIRECT_URI = `${window.location.origin}/logged_out`;

    const {
        debug,
        username, setUsername,
        setAccessToken,
        name, setName,
        setScopes,
        appIDs,

        setTable, 
        setTableLoaded, tableLoading,
        tableLoaded, 
        tableSearching,

        editMode,

        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);

    console.log(props);

    const { authState, authService } = useOktaAuth();
    const [loadingAppIDs, setLoadingAppIDs] = useState(false);
    const [etlTabClicked, setEtlTabClicked] = useState(false);
    const [shownModalUponChangingTable, setShownModalUponChangingTable] = useState(false);

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
    }

    const logout = async () => {

        const idToken = authState.idToken;
        await authService.logout('/');

        // Clear remote session
        window.location.href = `${ISSUER}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI}`;
        // window.location.href = `${ISSUER_UAT}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI}`;
    }    

    useEffect(() => {
        setLoadingAppIDs(false);
        debug && console.log('APP IDs', appIDs);
    }, [appIDs]);

    useEffect(() => {
        console.log('[ETL Framework] shownModalUponChangingTable: '+ shownModalUponChangingTable);
    }, [shownModalUponChangingTable]);

    useEffect(()=>{
        //upon clicking the ETL Framework Tab, set the table to ETLF by default??????
        setTable("ETLF_EXTRACT_CONFIG");
    }, [])

    useEffect(()=>{
        if(etlTabClicked || props['location']['state'] === undefined){
            // setShownModalUponChangingTable(true);
            setTableLoaded(false);
            // setCommingFromLink(false);
        }else if(props['location']['state'] !== undefined ){

            console.log("COming from Linked Component, what to do now???")

            const linkedState = props['location']['state'];
            console.log(linkedState);

            setTable(linkedState['table']);
            
            let currentSearchObj=  linkedState['searchObj'];

            console.log("use search sstatement to fetch only target value")
            
            // let searchStmt = 
            // `SELECT ec.*
            // , COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
            // row_number() OVER(ORDER BY ec.`+ 'GROUP_ID' +` ASC) rn,
            // COUNT(*) OVER() total_num_rows
            // FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" ec
            // JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
            // ON ec.` + 'GROUP_ID' + ` = auth.APP_ID AND auth.USERNAME = '`
            //         + username.toLowerCase() + `'
            // WHERE ` + getSearchFieldValue(currentSearchObj) + `
            // ;`;

            let searchStmt = 
            `SELECT ec.*, 'READ ONLY' AS PRIVILEGE
            FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" ec
            WHERE ` + getSearchFieldValue(currentSearchObj) + `
            ;`;

            console.log(searchStmt);

            axiosCallToGetTableRows(searchStmt, ["EXTRACT_CONFIG_ID"])
        }
    }, [etlTabClicked])

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
                            setEtlTabClicked(true);
                            setTableLoaded(false);
                        }}
                    >
                        < Tab eventKey = "Configuration" title = "Configuration" disabled = {tableLoading}>
                            <WorkTab
                                shownModalUponChangingTable={shownModalUponChangingTable}
                            />
                        </Tab>
                        <Tab eventKey="Jobs" title="Jobs" disabled = {tableLoading}>
                            <WorkTab
                                shownModalUponChangingTable={shownModalUponChangingTable}
                            />
                        </Tab>
                
                        
                    </Tabs>
                </>
        </div> 
        :
        <button onClick={login}>Login</button>;

}

export default ETLFrameworkUseAuthOKTA;
