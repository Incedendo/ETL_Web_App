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
import IDAssignmentForm from '../features/Admin/AddAdminForm';
import { getSearchFieldValue } from '../sql_statements';

import '../../App.css';
import '../../css/dropdown.scss';
import '../../css/home.css';
import '../../css/workspace.scss';
import '../../css/etlframework.scss';

const ETLFrameworkUseAuthOKTA = ( props ) => {

    const {
        debug,
        appIDs,
        table, setTable, 
        setTableLoaded, tableLoading,
        columnsLoaded,
        axiosCallToGetTableRows,
        axiosCallToGetCountsAndTableRows
    } = useContext(WorkspaceContext);

    const {
        isAdmin
    } = useContext(AdminContext);

    console.log(props);

    const { authState, authService } = useOktaAuth();
    // const [loadingAppIDs, setLoadingAppIDs] = useState(false);

    // const [shownModalUponChangingTable, setShownModalUponChangingTable] = useState(false);

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
    }
 
    // useEffect(() => {
    //     setLoadingAppIDs(false);
    //     debug && console.log('APP IDs', appIDs);
    // }, [appIDs]);

    useEffect(()=>{
        //upon clicking the ETL Framework Tab, set the table to ETLF by default??????
        setTable("ETLF_EXTRACT_CONFIG");
    }, []);

    useEffect(() => {
        if(columnsLoaded && props['location']['state'] !== undefined){
            const linkState = props['location']['state'];

            const countStmt = linkState['countStmt'];
            const searchStmt = linkState['searchStmt'];
            axiosCallToGetCountsAndTableRows(countStmt, searchStmt,  ["EXTRACT_CONFIG_ID"]);
        }
        
    }, [columnsLoaded]);

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
                        }else if (eventKey === "Schedule Jobs"){
                            debug && console.log("Configuration Tab");
                            setTable("ETLFCALL");
                        } 

                        setTableLoaded(false);
                    }}
                >
                    < Tab eventKey = "Configuration" title = "Configuration" disabled = {tableLoading}>
                        <WorkTab
                            id={'ETLF_EXTRACT_CONFIG'}
                            linkState={props['location']['state']}
                        />
                    </Tab>
                    <Tab eventKey="Schedule Jobs" title="Schedule Jobs" disabled = {tableLoading}>
                        <WorkTab
                            id={'ETLFCALL'}
                            linkState={props['location']['state']}
                        />
                    </Tab>
                    
                    {isAdmin && 
                        <Tab eventKey="admin" title="Admin" disabled = {tableLoading}>
                            <AdminTabs />
                        </Tab>
                    }

                    {/* <Tab eventKey="Test" title="Test" disabled = {tableLoading}>
                        <PlaygroundTab />
                    </Tab> */}
                    
                </Tabs>
            </>
        </div> 
        :
        <button onClick={login}>Login</button>;

}

export default ETLFrameworkUseAuthOKTA;
