import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import {
    useOktaAuth
} from '@okta/okta-react';

import ConfigurationGrid from '../features/GridComponents/Grids/ConfigurationGrid';
import DatCat_ControlPanel from '../features/DataCatalog/DatCat_ControlPanel';

const DataCatalog = () => {
    const ISSUER =`https://devaigtech.oktapreview.com/oauth2/default`;
    const REDIRECT_URI = `${window.location.origin}/logged_out`;

    const {
        table, setTable,
        tableLoaded,setTableLoaded,
    } = useContext(WorkspaceContext);

    const { authState, authService } = useOktaAuth();
    // const [table, setTable] = useState('CATALOG_ENTITY_LINEAGE');
    // const [tableList, setTableList] = useState([]);

    useEffect(()=> {
        setTable('CATALOG_ENTITY_LINEAGE');
    }, []);

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

            <div>
                <DatCat_ControlPanel/>
            </div>

            { tableLoaded && 
                <>
                    <div style={{
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