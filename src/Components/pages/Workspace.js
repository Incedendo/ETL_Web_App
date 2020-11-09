import React, { useState, useEffect, useContext } from 'react';
import { withAuth } from '@okta/okta-react';
import axios from 'axios';

import '../../App.css';
import '../../css/dropdown.scss';
import '../../css/home.css';
import '../../css/workspace.scss';

import { WorkspaceContext } from '../context/WorkspaceContext';

import TableDropdownMenu from '../features/GridComponents/TableDropdownMenu';
import ConfigurationGrid from '../features/GridComponents/Grids/ConfigurationGrid';
import SearchComp from '../features/GridComponents/SearchComp';
import Edit_Insert_Delete_ToggleComp from '../features/GridComponents/Edit_Insert_Delete_ToggleComp';
import EditPrimaryKeysComp from '../features/GridComponents/EditPrimaryKeysComp';

import UniqueColumnsModal from '../features/Modals/UniqueColumnsModal';
import PkEditModal from '../features/Modals/PkEditModal';
import SearchModal from '../features/Modals/SearchModal';


const Workspace = (props) => {

  const [loadingAppIDs, setLoadingAppIDs] = useState(false);
  const [isTokenVerified, setTokenVerified] = useState(false);
  const [etl_data, setEtl_data] = useState({});
  const [loaded, setLoaded] = useState(false)
 
  const {
    username, setUsername,
    name, setName,
    scopes, setScopes,
    appIDs, setAppIDs,

    table, setTable,
    tableLoading,
    tableLoaded, setTableLoaded,
    tableSearching,

    insertError, insertMode,
    editMode, editSuccess, editError,
    isSaveClicked,
    primaryKeys,
    uniqueCols,

    authenticated, setAuthenticated,

    //API calls
    loadTableNamesInAdvance,
  } = useContext(WorkspaceContext);

  useEffect(() => {
    const proposed_get_statenent = 'SELECT * FROM GR_DEV.USER_SPACE.KIET_EXTRACT_CONFIG_REQUIREMENTS'
    const dynamicallyLoadedTableName = 'KIET_EXTRACT_CONFIG_REQUIREMENTS';
    const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/table';

    axios.get(getURL, {
      //params maps to event.queryStringParameters in lambda
      params: {
        sql_statement: proposed_get_statenent,
        tableName: dynamicallyLoadedTableName,
        database: 'GR_DEV',
        schema: 'USER_SPACE',
        // username: db_username,
        // password: db_password,
      }
    })
    //have to setState in .then() due to asynchronous opetaions
      .then(response => setEtl_data(response.data))
      .then(() => setLoaded(true));
  }, []);

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
    setLoadingAppIDs(false);
    console.log('APP IDs', appIDs);
  }, [appIDs])

  useEffect(() => {
    console.log('Edit Mode Changed to: ', editMode);
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
        // username: db_username,
        // password: db_password,
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

  return (
    <div className="App container">
      {isTokenVerified && !loadingAppIDs ?
        <>
          <div className="left-text userInfo">
            <h5>Welcome, {name.split(',')[1]} ({username}) </h5>

            <div>
              <h6 className="inlineDiv">Read-Only Access:</h6>
              <span className="inlineDiv">{appIDs['Read-Only'].toString()}</span>
            </div>

            <div>
              <h6 className="inlineDiv">Read-Write Access:</h6>
              <span className="inlineDiv">{appIDs['Read-Write'].toString()}</span>
            </div>
          </div>

          {/* <div className="container" > */}

          <TableDropdownMenu />

          {tableLoading && <div>Loading...</div>}

          {tableLoaded &&
            <div
              className={"card " + editMode ? "expanded-height" : "base-height"}
              style={{
                'background': '#337d9942'
              }}
            >
              
              <SearchModal />
              
              <div className="tableName-SearchBox-Div">

                <div className="row">
                  <div className="column">
                    <div>
                      <span className="header">Table:</span> {table}
                    </div>
                    <Edit_Insert_Delete_ToggleComp />

                  </div>

                  <div className="column">
                    <span className="header">Primary key:</span> <PkEditModal />
                    {primaryKeys.map(pk => <div key={pk}> {pk} </div>)}
                  </div>

                  {/* <div className="column">
                    <span className="header" style={{
                      // 'marginRight': '5px'
                    }}>Custom Unique Column:</span> <UniqueColumnsModal />
                    {uniqueCols.map(col => <div key={col}> {col} </div>)}
                  </div> */}
                </div>

              </div>
            </div>
          }

          {tableLoaded && isSaveClicked && insertError !== '' && <span className='errorSignal'>{insertError}</span>}

          {tableSearching && <div>seaching...</div>}

          {tableLoaded && editError !== '' &&
            <div className='errorSignal'>
              <h4 >Update Status: {editSuccess}</h4>
              {editError}
            </div>
          }

          <div>
            {tableLoaded && !tableSearching && <ConfigurationGrid />}
          </div>

        </>
        :
        <> Preparing data... </>
      }
    </div>

  );
}

export default withAuth(Workspace);
