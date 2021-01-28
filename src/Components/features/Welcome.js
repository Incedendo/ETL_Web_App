import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import Button from 'react-bootstrap/Button';
import { useOktaAuth } from '@okta/okta-react';

import { ISSUER, ISSUER_UAT, REDIRECT_URI_logout } from '../context/OKTA.js';
// const REDIRECT_URI = `${window.location.origin}/logged_out`;

const Welcome = () => {
    const {
        debug, username, name, 
    } = useContext(WorkspaceContext);

    const { authState, authService, oktaAuth } = useOktaAuth();
    
    const logout = async () => {
        console.log("Redirect URI: " + REDIRECT_URI_logout);
        const idToken = authState.idToken;
        await authService.logout('/logged_out');
        // oktaAuth.signOut({ postLogoutRedirectUri: window.location.origin + '/' });
        
        // Clear remote session
        // window.location.href = `${ISSUER}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI}`;
        window.location.href = `${ISSUER_UAT}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI_logout}`;
    }  

    // const logout = async () => {
    //     oktaAuth.tokenManager.clear();
    // };

    return(
        <div className="userInfo">
            <h5>Welcome, {name.split(',')[1]} ({username}) </h5>
            <Button 
                style={{
                    "position": "relative",
                    "float": "right",
                }}
                variant="outline-warning"
                onClick={logout}
            >
                Log out
            </Button>
        </div>
    )
}

export default Welcome;