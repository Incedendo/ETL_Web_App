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
    // const [currentSearchCriteria, setCurrentSearchCriteria] = useState({});
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

    function renderFilteredCriteria(){
        return(
            <div>
                renderFilteredCriteria dlasdjlsakdlkadkl
            </div>
        )
    }
        
        // const fields = Object.keys(currentSearchCriteria);
        // return <>
                // {fields.map(col => {
                //     if(fields.indexOf(col) > 0)
                //         return(
                //             <span 
                //                 key={col}
                //                 style={{ 'marginRight': '5px' }}
                //             >
                //                 {col} : {currentSearchCriteria[col]} |
                //             </span>
                //         )
                //     else
                //         return(
                //             <span 
                //                 key={col}
                //                 style={{ 'marginRight': '5px' }}
                //             >
                //                 {col} : {currentSearchCriteria[col]}
                //             </span>
                //         )
                // })} 
        //     </>
    // }

    return authState.isAuthenticated ?
        <div className="App container">
           
            {/* <Table
                privilege={"READ ONLY"}
                tableName={'CATALOG_ENTITY_LINEAGE'}
                route={"Test"}
                isDataCatalog={true}
            /> */}

            <DatCat_ControlPanel 
                linkState={props.location.state}
                // setCurrentSearchCriteria={setCurrentSearchCriteria}
            />
            

            {/* {tableLoading && 
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

            {renderFilteredCriteria}        

            { tableLoaded && 
                <>
                    <div style={{
                        'display': 'flex',
                        'fontWeight': 'bold',
                        "textAlign": "left",
                        "marginBottom": "10px"
                    }}>
                        Table: {table}
                    </div>

                    {Object.keys(currentSearchCriteria).length > 0 &&
                        <div style={{ 
                            'display': 'flex', 
                            'float': 'left',
                            "marginBottom": "10px"
                        }}>
                            <span style={{ 'fontWeight': 'bold', 'marginRight': '5px' }}>Filtered by: </span> 
                            {renderFilteredCriteria}


                            {Object.keys(currentSearchCriteria).map(col => {
                                if((Object.keys(currentSearchCriteria)).indexOf(col) === (Object.keys(currentSearchCriteria)).length -1 )
                                    return(
                                        <span 
                                            key={col}
                                            style={{ 'marginRight': '5px' }}
                                        >
                                            {col}: {currentSearchCriteria[col]} 
                                        </span>
                                    )
                                else
                                    return(
                                        <span 
                                            key={col}
                                            style={{ 'marginRight': '5px' }}
                                        >
                                            {col}: {currentSearchCriteria[col]} | 
                                        </span>
                                    )
                            })} 
                        </div>
                    }
                    <ConfigurationGrid/> 
                </>
            } */}

            {/* <button onClick={logout}>Log Out</button> */}
        </div>
        :
        <button onClick={login}>Log In</button>;
}

export default DataCatalog;