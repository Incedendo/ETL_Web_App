import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import {
    useOktaAuth
} from '@okta/okta-react';

import Table from '../features/GenericTable/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
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

    const DropDown = ({ target, currentVal, menus, setState }) => {
        return (
            <div className="InlineDiv">
                <DropdownButton
                    id="dropdown-item-button"
                    title={!currentVal ? 'Select a ' + target : currentVal}
                    // disabled={tableSearching || tableLoading}
                >
                    {menus.map(item => (
                        <Dropdown.Item as="button" key={item}
                            onSelect={() => {
                                if (item !== table) {
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


    const TableOptions = () => (
        <div style={{ 'height': '90px' }}>
            <div className="InlineDiv db-div">
                <div className="label-text db-text">Catalog table:</div>
                <DropDown 
                    target='Database' 
                    currentVal={table} 
                    menus={[ 
                        'DATA_STEWARD', 
                        'DATA_DOMAIN',
                        'DATA_STEWARD_DOMAIN',
                        'CATALOG_ENTITY_DOMAIN',
                        'CATALOG_ENTITIES',
                        'CATALOG_ITEMS',
                        'CATALOG_ENTITY_LINEAGE'
                    ]} 
                    setState={setTable} />
            </div>

            {/* <div className="InlineDiv auto-complete-outerDiv">
                <div className="auto-complete-div-margin">
                    <div className="label-text">Table:</div>
                    <CustomAutoCompleteComp
                        list={tableList}
                        setTarget={setTable}
                        autoSuggestModalClassName="auto-suggest-box" />
                </div>
            </div> */}
        </div>
    )

    return authState.isAuthenticated ?
        <div className="App container">
            <TableOptions/>
            <Table
                privilege={"READ ONLY"}
                getStatement={proposed_get_statenent}
                tableName={table}
                route={"Test"}
            />
        </div>
        :
        <button onClick={login}>Login</button>;
}

export default DataCatalog;