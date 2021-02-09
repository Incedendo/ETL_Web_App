import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { ISSUER_UAT, REDIRECT_URI_logout, REDIRECT_URI_HOME } from '../../Components/context/OKTA';
const redirectUri = `${window.location.origin}/home`;

const HomeNew = () => {
  const { debug } = useContext(WorkspaceContext);
  const { authService, authState } = useOktaAuth();

  useEffect(()=>{
    debug && console.log(authState);
  }, [])
  

  const login = async () => { authService.login('/'); };
  
  const logout = async () => {
    const REDIRECT_URI = `${window.location.origin}/logged_out`;
    const idToken = authState.idToken;
    
    await authService.logout('/');

    // Clear remote session
    // window.location.href = `${ISSUER}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI}`;
    window.location.href = `${ISSUER_UAT}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${REDIRECT_URI_HOME}`;
  }

  if(authState.isPending) { 
    return <div>Authenticating...</div>;
  }

  if (authState.isAuthenticated === null) return null;

  const mainContent = authState.isAuthenticated ? (
    <div>
      <p className="lead">
        You have entered the Work space portal
      </p>

      <p className="lead">
        You can start with <Link to="/etlframework">ETL Framework</Link> or <Link to="/datacatalog">Data Catalog</Link> 
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

