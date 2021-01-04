import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import {
    useOktaAuth
} from '@okta/okta-react';

import Table from '../features/GenericTable/Table';
import ConfigurationGrid from '../features/GridComponents/Grids/ConfigurationGrid';
import DatCat_ControlPanelLinked from '../features/DataCatalog/DatCat_ControlPanelLinked';


const DataCatalogLinkable = (props) => {
    console.log(props);
    const ISSUER =`https://devaigtech.oktapreview.com/oauth2/default`;
    const REDIRECT_URI = `${window.location.origin}/logged_out`;

    const { authState, authService } = useOktaAuth();
    // const [table, setTable] = useState('CATALOG_ENTITY_LINEAGE');
    // const [tableList, setTableList] = useState([]);

    const {
        tableLoaded
    } = useContext(WorkspaceContext);

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
            DataCatalogLinkable
            {/* <Table
                privilege={"READ ONLY"}
                tableName={'CATALOG_ENTITY_LINEAGE'}
                route={"Test"}
                isDataCatalog={true}
                linkState={props.location.state}
            /> */}

            <div>   
                <DatCat_ControlPanelLinked linkState={props.location.state}/>
                { tableLoaded && <ConfigurationGrid/> }
            </div>

            {/* <button onClick={logout}>Log Out</button> */}
        </div>
        :
        <button onClick={login}>Log In</button>;
}

export default DataCatalogLinkable;