import React from 'react';
import { useOktaAuth } from '@okta/okta-react';
import Welcome from '../features/Welcome';
import DatCat_ControlPanel from '../features/DataCatalog/DatCat_ControlPanel';

const DataCatalog = (props) => {

    const { authState, authService } = useOktaAuth();

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
    }

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