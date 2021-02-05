import React, { useState, useEffect, useContext } from 'react';
import {
    useOktaAuth
} from '@okta/okta-react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { WorkspaceContext } from '../context/WorkspaceContext';
import { AdminContext } from '../context/AdminContext';
import Welcome from '../features/Welcome';
import WorkTab from '../features/Tabs/WorkTab';
import PlaygroundTab from '../features/Tabs/PlaygroundTab';
import AdminTabs from '../features/Admin/AdminTabs';
import IDAssignmentForm from '../features/Admin/IDAssignmentForm';
import { getSearchFieldValue } from '../sql_statements';

import '../../App.css';
import '../../css/dropdown.scss';
import '../../css/home.css';
import '../../css/workspace.scss';
import '../../css/etlframework.scss';

const ETLFrameworkUseAuthOKTA = ( props ) => {

    const {
        debug,
        username, setUsername,
        setAccessToken,
        name, setName,
        setScopes,
        appIDs,

        table, setTable, 
        setTableLoaded, tableLoading,
        tableLoaded, 
        tableSearching,

        editMode,

        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);

    const {
        isAdmin
    } = useContext(AdminContext);

    console.log(props);

    const { authState, authService } = useOktaAuth();
    const [loadingAppIDs, setLoadingAppIDs] = useState(false);
    const [etlTabClicked, setEtlTabClicked] = useState(false);
    const [shownModalUponChangingTable, setShownModalUponChangingTable] = useState(false);

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
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

    // useEffect(()=>{
    //     if(etlTabClicked)
    //         setShownModalUponChangingTable(true);
    // }, [table])


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

            let searchStmt = linkedState['searchStmt'];
            console.log(searchStmt);

            axiosCallToGetTableRows(searchStmt, ["EXTRACT_CONFIG_ID"])
        }
    }, [etlTabClicked])

    if (authState.isPending) {
        return <div> Loading... </div>;
    }

    return authState.isAuthenticated ?
        <div className="App container">
            <>  
                <Welcome />
                <h4>ETL Job Configurations</h4>
                {/* <small>You are running this app in <b>{process.env.NODE_ENV}</b> mode </small> 
                <small>You are running this app in <b>{process.env.REACT_APP_ENV}</b> mode </small>  */}
                

                <Tabs defaultActiveKey="Configuration" transition={false} id="noanim-tab-example"
                    onSelect={(eventKey)=>{
                        if (eventKey ==="Configuration"){
                            debug && console.log("Config Tab");
                            setTable("ETLF_EXTRACT_CONFIG");
                        } else if (eventKey === "Schedule Jobs"){
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
                    <Tab eventKey="Schedule Jobs" title="Schedule Jobs" disabled = {tableLoading}>
                        <WorkTab
                            shownModalUponChangingTable={shownModalUponChangingTable}
                        />
                    </Tab>
                    {/* <Tab eventKey="Test" title="Test" disabled = {tableLoading}>
                        <PlaygroundTab />
                    </Tab> */}

                    {isAdmin && 
                        <Tab eventKey="admin" title="Admin" disabled = {tableLoading}>
                            <AdminTabs />
                        </Tab>
                    }
            
                    
                </Tabs>
            </>
        </div> 
        :
        <button onClick={login}>Login</button>;

}

export default ETLFrameworkUseAuthOKTA;
