import React, {useEffect, useContext} from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import Welcome from '../features/Welcome';
import DatCat_ControlPanel from '../features/DataCatalog/DatCat_ControlPanel';

const DataCatalog = (props) => {

    const { authState, authService } = useOktaAuth();

    const {
        setTable
    } = useContext(WorkspaceContext);

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
    }

    // useEffect(()=>{
    //     //upon clicking the ETL Framework Tab, set the table to ETLF by default??????
    //     setTable("DATA_DOMAIN");
    // }, []);

    return authState.isAuthenticated ?
        <div className="App container">
            <Welcome />
            <h4>Data Catalog Management</h4>

            <DatCat_ControlPanel 
                linkState={props.location.state}
            />
            
        </div>
        :
        <button onClick={login}>Log In</button>;
}

export default DataCatalog;