import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
// import { Router, Route, Link, Switch, Redirect } from "react-router-dom";
import { Security, SecureRoute,  ImplicitCallback, LoginCallback, Auth } from '@okta/okta-react';
import { WorkspaceProvider } from './Components/context/WorkspaceContext';

import Navbar from './Components/layout/Navbar';
import Home from './Components/pages/Home';
import HomeNew from './Components/pages/HomeNew';
import ETLFramework from './Components/pages/ETLFramework';
import ETLFrameworkUseAuthOKTA from './Components/pages/ETLFrameworkUseAuthOKTA';
import Login from './Components/auth/Login';
import Login1 from './Components/auth/Login1';
import Logout from './Components/pages/Logout';
import './App.css';

//--------------------------AIG OKTA------------------------------
const CLIENT_ID = '0oao1og6ygsQEgZP00h7' || process.env.CLIENT_ID;
const ISSUER = `https://devaigtech.oktapreview.com/oauth2/default`;
//------------------------------------------------------------------

const CALLBACK_PATH = '/implicit/callback';
// const CALLBACK_PATH = '/index.html';
const HOST = window.location.host;
const ORIGIN = window.location.origin;

const REDIRECT_URI = ORIGIN + '/implicit/callback';
// const REDIRECT_URI = ORIGIN + '/etlframework';
const SCOPES = 'openid profile email';

const onAuthRequired = ({ history }) => {
  history.push('/login');
}

const config = {
  issuer: ISSUER,
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  onAuthRequired: onAuthRequired,
  pkce: true
  // scope: SCOPES.split(/\s+/),
};

const App = () => {
  console.log(ORIGIN);
  console.log(REDIRECT_URI);

  return (
    <Router>
      <Security
        issuer={ISSUER}
        clientId={CLIENT_ID}
        pkce={true}
        redirectUri={REDIRECT_URI}
      >
        <WorkspaceProvider>
          <div className="App">
            <Navbar />
            <Switch>
              <Route exact={true} path="/" component={HomeNew} />
              <SecureRoute exact path = "/etlframework" component = {ETLFrameworkUseAuthOKTA} />
              <Route path='/login' render={() => <Login baseUrl='https://devaigtech.oktapreview.com' />} />
              <Route path='/logged_out' component={Logout} />
              <Route path='/implicit/callback' component={LoginCallback} />
            </Switch> 
          </div>
        </WorkspaceProvider>
      </Security>
    </Router>
  );
}

export default App;
