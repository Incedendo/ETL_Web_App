import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import {
    useOktaAuth
} from '@okta/okta-react';
import Spinner from 'react-bootstrap/Spinner';
import ConfigurationGrid from '../features/GridComponents/Grids/ConfigurationGrid';
import DatCat_ControlPanel from '../features/DataCatalog/DatCat_ControlPanel';

const DataCatalog = (props) => {
    const ISSUER =`https://devaigtech.oktapreview.com/oauth2/default`;
    const REDIRECT_URI = `${window.location.origin}/logged_out`;

    const {
        table, setTable,
        tableLoading, tableLoaded,setTableLoaded,
    } = useContext(WorkspaceContext);

    const { authState, authService } = useOktaAuth();
    // const [table, setTable] = useState('CATALOG_ENTITY_LINEAGE');
    // const [tableList, setTableList] = useState([]);

    // useEffect(()=> {
    //     if(props.location.state !== undefined){

    //     }else{
    //         setTable('CATALOG_ENTITY_LINEAGE');
    //     }
        
    // }, []);

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
    }

    const logout = async () => {

        const idToken = authState.idToken;
        await authService.logout('/');

        // Clear remote session
        window.location.href = `${ISSUER}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI}`;
    }

    return authState.isAuthenticated ?
        <div className="App container">
           
            {/* <Table
                privilege={"READ ONLY"}
                tableName={'CATALOG_ENTITY_LINEAGE'}
                route={"Test"}
                isDataCatalog={true}
            /> */}

            <DatCat_ControlPanel linkState={props.location.state}/>
            

            {tableLoading && 
                <div style={{
                    "position":"relative",
                    "display": "inline-block",
                    "alignItems": "center",
                }}>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span style={{ 'marginLeft': '5px' }}>loading Table {table}...</span>
                </div>
            }

            { tableLoaded && 
                <>
                    <div style={{
                        'fontWeight': 'bold',
                        "textAlign": "left",
                        "marginBottom": "10px"
                    }}>
                        Table: {table}
                    </div>
                    <ConfigurationGrid/> 
                </>
            }

            {/* <button onClick={logout}>Log Out</button> */}
        </div>
        :
        <button onClick={login}>Log In</button>;
}

export default DataCatalog;