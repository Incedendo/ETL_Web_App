import React, { useState, useEffect, useContext } from 'react';
import { withAuth } from '@okta/okta-react';
import axios from 'axios';
import * as yup from 'yup'; // for everything
import 'dotenv/config';
import { createYupSchema } from "../features/ActionForms/yupSchemaCreator";

import '../../App.css';
import '../../css/dropdown.scss';
import '../../css/home.css';
import '../../css/workspace.scss';
import '../../css/etlframework.scss';

import { WorkspaceContext } from '../context/WorkspaceContext';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs'
import CustomAutoCompleteComp from '../features/GridComponents/CustomAutoCompleteComp';

import WorkTab from '../features/Tabs/WorkTab';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const db_username = 'kiet.nguyen@aig.com';
const db_password = '$1ttdlBTPD';

const ETLFramework = (props) => {

    const [loadingAppIDs, setLoadingAppIDs] = useState(false);
    const [isTokenVerified, setTokenVerified] = useState(false);
    const [cloudDB, setCloudDB] = useState('');
    const [tableList, setTableList] = useState([]);

    const {
        username, setUsername,
        name, setName,
        scopes, setScopes,
        appIDs, setAppIDs,

        setTable, setPrimaryKeys,
        tableLoading,
        tableLoaded, setTableLoaded,
        tableSearching,

        editMode, 

        authenticated, setAuthenticated,

        //API calls
        loadTableNamesInAdvance,
    } = useContext(WorkspaceContext);

    const checkAuthentication = async () => {
        console.log('awaiting authentication....')
        const isAuthenticated = await props.auth.isAuthenticated();
        if (isAuthenticated !== authenticated) {
            console.log('set authentication....', isAuthenticated)
            setAuthenticated(isAuthenticated);
        }
    };

    //componentDidMount and componentDidUpdate
    useEffect(() => {
        checkAuthentication();
    });

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
        console.log('APP IDs', appIDs);
    }, [appIDs])

    useEffect(() => {
        console.log('Update Button Clicked, editMode: ', editMode);
    }, [editMode])

    //load once when componentDidMount
    useEffect(() => {
        const idTokens = JSON.parse(localStorage.getItem('okta-token-storage'));
        const idToken = idTokens.idToken;
        const accessToken = idTokens.accessToken;

        setUsername(idTokens.idToken.claims.email);
        setName(idTokens.idToken.claims.name);
        setScopes(idTokens.idToken.scopes);

        const okta_url = "https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/authorize";

        axios.get(okta_url, {
            params: {
                accessTokenString: accessToken.accessToken,
                expectedAud: idToken.claims.aud,
                username: db_username,
                password: db_password,
            }
        })
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                console.log(response.data);
                setTokenVerified(true);
            })
            .catch(err => {
                console.log(err);
                setTokenVerified(false);
            })

        const getAuthorizedAppIDSQLStatement = "SELECT * FROM GR_DEV.USER_SPACE.ETL_ACCESS_AUTHORIZATION WHERE LOWER(USERNAME) = '"
            + idTokens.idToken.claims.email.toLowerCase() + "';";
        
        loadTableNamesInAdvance(getAuthorizedAppIDSQLStatement, 'APP_ID', setAppIDs, setLoadingAppIDs)
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
            <h5>Welcome, {name.split(',')[1]} ({username}) </h5>

            <div>
                <h6>Read-Only Access:</h6>
                <span>{appIDs['Read-Only'].toString()}</span>
            </div>

            <div>
                <h6>Read-Write Access:</h6>
                <span className="span-border">{appIDs['Read-Write'].toString()}</span>
            </div>
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
            {isTokenVerified && !loadingAppIDs ?
                <>
                    <AccessControlInfo />

                    <Tabs defaultActiveKey="Configuration" transition={false} id="noanim-tab-example"
                        onSelect={(eventKey)=>{
                            if (eventKey ==="Configuration"){
                                console.log("Config Tab");
                                setTable("ETLF_EXTRACT_CONFIG");
                            }else{
                                console.log("Else Tab");
                                setTable("ETLFCALL");
                            }
                        }}
                    >
                        <Tab eventKey="Configuration" title="Configuration">
                            {tableLoaded 
                                ? <div>
                                    <DatabaseOptions />
                                    <WorkTab />
                                </div>
                                : <div>loading...</div>
                            }           
                        </Tab>
                        <Tab eventKey="Jobs" title="Jobs">
                            {tableLoaded
                                ? <div>
                                    <WorkTab />
                                </div>
                                : <div>loading...</div>
                            }    
                        </Tab>
                    </Tabs>
                </>
                :
                <> Preparing data... </>
            }
        </div>

    );
}

export default withAuth(ETLFramework);
