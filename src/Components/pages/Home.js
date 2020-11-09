import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { withOktaAuth , useOktaAuth } from '@okta/okta-react';
import OktaJwtVerifier from '@okta/jwt-verifier';
import { WorkspaceContext } from '../context/WorkspaceContext';

const CLIENT_ID = '0oao1og6ygsQEgZP00h7';
const ISSUER = `https://devaigtech.oktapreview.com/oauth2/default`;
// const ISSUER = `https://devaigtech.oktapreview.com/oauth2/default/v1/authorize`;
const redirectUri = `${window.location.origin}/home`;

const Home = (props) => {
  const { debug } = useContext(WorkspaceContext);
  const [authenticated, setAuthenticated] = useState(null);
  const { authState, authService } = useOktaAuth();
  // const [userInfo, setUserInfo] = useState(null);

  // useEffect(() => {
  //   if (!authState.isAuthenticated) {
  //     // When user isn't authenticated, forget any user info
  //     setUserInfo(null);
  //   } else {
  //     authService.getUser().then((info) => {
  //       setUserInfo(info);
  //     });
  //   }
  // }, [authState, authService]); // Update if authState changes

  // useEffect(() => {
  //   console.log(userInfo);
  // }, [userInfo])

  const checkAuthentication = async () => {
    debug && console.log('awaiting authentication....')
    const isAuthenticated = await props.auth.isAuthenticated();
    if (isAuthenticated !== authenticated) {
      debug && console.log('set authentication....', isAuthenticated)
      setAuthenticated(isAuthenticated);
    }
  };

  //componentDidMount and componentDidUpdate
  useEffect(() => {
    checkAuthentication();
  });

  const login = async () => {
    props.auth.login('/');
  };

  //have to enable 3rd-party to read and save cookies
  const logout = async () => {
    // Read idToken before local session is cleared
    // const idToken = await props.auth.getIdToken();

    // // Clear local session
    // await props.auth.logout('/').catch(err => {
    //   // Silently ignore no such session errors
    //   if (err.errorCode !== "E0000007") {
    //     throw err;
    //   }
    // });

    // // Clear remote session
    // window.location.href = `${issuer}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`;
    props.auth.logout('/home');
  };

  if (authenticated === null) return null;

  const mainContent = authenticated ? (
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

export default withOktaAuth(Home);
