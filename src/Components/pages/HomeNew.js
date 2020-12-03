import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../context/WorkspaceContext';

const redirectUri = `${window.location.origin}/home`;

const HomeNew = () => {
  const { debug } = useContext(WorkspaceContext);
  const { authService, authState } = useOktaAuth();

  debug && console.log(authState);

  const login = async () => { authService.login('/'); };
  const logout = async () => {
    const ISSUER =`https://devaigtech.oktapreview.com/oauth2/default`;
    const REDIRECT_URI = `${window.location.origin}/logged_out`;
    const idToken = authState.idToken;
    
    await authService.logout('/');

    // Clear remote session
    window.location.href = `${ISSUER}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI}`;
  }

  if(authState.isPending) { 
    return <div>Loading...</div>;
  }

  if (authState.isAuthenticated === null) return null;

  const mainContent = authState.isAuthenticated ? (
    <div>
      <p className="lead">
        You have entered the <Link to="/workspace">Work space</Link> portal,{' '}
      </p>

      <button className="btn btn-light btn-lg" onClick={logout}>
        Logout
      </button>
    </div>
  ) : (
    <div>
      <p className="lead">
        If you have snowflake account, please get your credentials from your
        DB Administrator
      </p>
      <button className="btn btn-dark btn-lg" onClick={login}>
        Login
      </button>
    </div>
  );

  return (
    <div className="jumbotron">
      <h1 className="display-4">ETL Framework Portal</h1>
      {mainContent}
    </div>
  );  
}

export default HomeNew;

