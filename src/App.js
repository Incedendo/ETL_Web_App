import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
// import { Router, Route, Link, Switch, Redirect } from "react-router-dom";
import { Security, SecureRoute,  ImplicitCallback, LoginCallback, Auth } from '@okta/okta-react';
import { WorkspaceProvider } from './Components/context/WorkspaceContext';

import Navbar from './Components/layout/Navbar';
import HomeNew from './Components/pages/HomeNew';
import ETLFrameworkUseAuthOKTA from './Components/pages/ETLFrameworkUseAuthOKTA';
import DataCatalog from './Components/pages/DataCatalog';
import Login from './Components/auth/Login';
import Logout from './Components/pages/Logout';
import './App.css';

import { CLIENT_ID_UAT, ISSUER_UAT } from './Components/context/OKTA';

const HOST = window.location.host;
const ORIGIN = window.location.origin;
const REDIRECT_URI = ORIGIN + '/implicit/callback';

const App = () => {
  console.log(ORIGIN);
  console.log(REDIRECT_URI);

  return (
    <Router>
      <Security
        // issuer={ISSUER}
        // clientId={CLIENT_ID}
        issuer={ISSUER_UAT}
        clientId={CLIENT_ID_UAT}
        pkce={true}
        redirectUri={REDIRECT_URI}
      >
        <WorkspaceProvider>
          <div className="App">
            <Navbar />
            <Switch>
              <Route exact={true} path="/" component={HomeNew} />
              <SecureRoute exact path = "/etlframework" component = {ETLFrameworkUseAuthOKTA} />
              <SecureRoute exact path = "/datacatalog" component = {DataCatalog} />
              {/* <Route path='/login' render={() => <Login baseUrl='https://devaigtech.oktapreview.com' />} /> */}
              <Route path='/login' render={() => <Login baseUrl='https://uataigtech.oktapreview.com' />} />
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
