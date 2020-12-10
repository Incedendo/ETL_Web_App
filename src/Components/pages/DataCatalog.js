import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import {
    useOktaAuth
} from '@okta/okta-react';

import Table from '../features/GenericTable/Table';

import GenericConfigurationGrid from '../features/GenericTable/GenericConfigurationGrid';

const DataCatalog = () => {
    const ISSUER =`https://devaigtech.oktapreview.com/oauth2/default`;
    const REDIRECT_URI = `${window.location.origin}/logged_out`;

    const { authState, authService } = useOktaAuth();
    const [table, setTable] = useState('CATALOG_ENTITY_LINEAGE');
    // const [tableList, setTableList] = useState([]);

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

    const proposed_get_statenent = 'SELECT * FROM ' + table + ';';

    return authState.isAuthenticated ?
        <div className="App container">
           
            <Table
                privilege={"READ ONLY"}
                getStatement={proposed_get_statenent}
                tableName={table}
                route={"Test"}
                isDataCatalog={true}
            />
        </div>
        :
        <button onClick={login}>Login</button>;
}

export default DataCatalog;