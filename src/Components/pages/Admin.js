import React from 'react';
import { useOktaAuth } from '@okta/okta-react';
import Welcome from '../features/Welcome';

const Admin = ({}) => {

    const { authState, authService } = useOktaAuth();

    const login = async () => {
        // Redirect to '/' after login
        authService.login('/');
    }

    return authState.isAuthenticated ?
        <div className="App container">
            <Welcome />
            <h4>Admin Management</h4>
        </div>
        :
        <button onClick={login}>Log In</button>;
}

export default Admin;