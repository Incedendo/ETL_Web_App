import React, { useState, useEffect, useContext } from 'react';
import { withOktaAuth  } from '@okta/okta-react';
import { useOktaAuth } from '@okta/okta-react';

import '../../App.css';
import '../../css/dropdown.scss';
import '../../css/home.css';
import '../../css/workspace.scss';
import '../../css/etlframework.scss';

import { WorkspaceContext } from '../context/WorkspaceContext';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import CustomAutoCompleteComp from '../features/GridComponents/CustomAutoCompleteComp';
import WorkTab from '../features/Tabs/WorkTab';
import ConfigTab from '../features/Tabs/ConfigTab';
import JobTab from '../features/Tabs/JobTab';
import PlaygroundTab from '../features/Tabs/PlaygroundTab';
import PlaygroundTab2 from '../features/Tabs/PlaygroundTab2';


const ETLFramework = (props) => {

    const logout = async () => {
        props.auth.logout('/');
    };

    const [loadingAppIDs, setLoadingAppIDs] = useState(false);
    // const [isTokenVerified, setTokenVerified] = useState(false);
    const [cloudDB, setCloudDB] = useState('');
    const [tableList, setTableList] = useState([]);


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

    // // fetch messages
    // useEffect(() => {
    //     if (authState.isAuthenticated) {
    //         const {
    //             accessToken
    //         } = authState;
    //         console.log(accessToken);
    //     }
    // }, [authState]);

    const checkAuthentication = async () => {
        debug && console.log('awaiting authentication....')
        const isAuthenticated = await props.auth.isAuthenticated();
        if (isAuthenticated !== authenticated) {
            debug && console.log('set authentication....', isAuthenticated)
            setAuthenticated(isAuthenticated);
        }
    };

    // -------componentDidMount and componentDidUpdate
    // useEffect(() => {
    //     checkAuthentication();
    // });

    useEffect(() => {
        switch (cloudDB) {
            case 'Oracle':
                setTableList(['Dummy table'])
                break;
            case 'Snowflake':
                setTableList(['KIET_ETLF_EXTRACT_CONFIG']);
                break;
            default:
                break;
        }
    }, [cloudDB])

    useEffect(() => {
        setLoadingAppIDs(false);
        debug && console.log('APP IDs', appIDs);
    }, [appIDs])

    useEffect(() => {
        debug && console.log('Update Button Clicked, editMode: ', editMode);
    }, [editMode])

    //load once when componentDidMount
    useEffect(() => {
        const idTokens = JSON.parse(localStorage.getItem('okta-token-storage'));
        const idToken = idTokens.idToken;
        const accessToken = idTokens.accessToken;

        setAccessToken(accessToken.accessToken);
        setUsername(idTokens.idToken.claims.email);
        setName(idTokens.idToken.claims.name);
        setScopes(idTokens.idToken.scopes);

        // const okta_url = "https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/authorize";

        // axios.get(okta_url, {
        //     params: {
        //         accessTokenString: accessToken.accessToken,
        //         expectedAud: idToken.claims.aud,
        //     }
        // })
        //     .then(response => {
        //         // returning the data here allows the caller to get it through another .then(...)
        //         debug && console.log(response.data);
        //         setTokenVerified(true);
        //     })
        //     .catch(err => {
        //         debug && console.log(err);
        //         setTokenVerified(false);
        //     })

        // setTokenVerified(true);

    }, []);

    const DropDown = ({ target, currentVal, menus, setState }) => {
        return (
            <div className="InlineDiv">
                <DropdownButton
                    id="dropdown-item-button"
                    title={!currentVal ? 'Select a ' + target : currentVal}
                    disabled={tableSearching || tableLoading}
                >
                    {menus.map(item => (
                        <Dropdown.Item as="button" key={item}
                            onSelect={() => {
                                if (item !== cloudDB) {
                                    setState(item)
                                }
                            }}
                        >
                            {item}
                        </Dropdown.Item>

                    )
                    )}
                </DropdownButton>
            </div>
        )
    }

    const AccessControlInfo = () => (
        <div className="userInfo">
            <div>
                <h5>Welcome, {name.split(',')[1]} ({username}) </h5>
                <button onClick={logout}>Log out</button>
            </div>

            <div>
                <h6>Read-Write Access:</h6>
                { appIDs.length !== 0 
                ? <span className="span-border">{appIDs.toString()}</span>
                : <span>[no read/write access assigned to user]</span>
                }
            </div>

            {/* <AccessModal /> */}
        </div>
    )

    const DatabaseOptions = () => (
        <div style={{ 'height': '90px' }}>
            <div className="InlineDiv db-div">
                <div className="label-text db-text">Database:</div>
                <DropDown target='Database' currentVal={cloudDB} menus={['Snowflake', 'Oracle']} setState={setCloudDB} />
            </div>

            <div className="InlineDiv auto-complete-outerDiv">
                <div className="auto-complete-div-margin">
                    <div className="label-text">Table:</div>
                    <CustomAutoCompleteComp
                        list={tableList}
                        setTarget={setTable}
                        autoSuggestModalClassName="auto-suggest-box" />
                </div>
            </div>
        </div>
    )

    return (
        <div className="App container">
            {
                // isTokenVerified && 
                !loadingAppIDs ?
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
                            <ConfigTab />
                        </Tab>
                        <Tab eventKey="Jobs" title="Jobs" disabled = {tableLoading}>
                            <JobTab />
                        </Tab>
                        <Tab eventKey="Playground1" title="Playground 1">
                            <PlaygroundTab />
                        </Tab>
                        <Tab eventKey="Playground2" title="Playground 2">
                            <PlaygroundTab2 />
                        </Tab>
                        
                    </Tabs>
                </>
                : <div>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span style={{ 'marginLeft': '5px' }}>Preparing data...</span>
                </div>
            }
        </div>
    );
}

export default withOktaAuth(ETLFramework);
// export default ETLFramework;
