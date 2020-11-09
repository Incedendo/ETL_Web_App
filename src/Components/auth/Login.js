// src/Login.js

import React, {} from 'react';
import { Redirect } from 'react-router-dom';
// import OktaSignInWidget from './OktaSignInWidget';
import SignInWidget from './Signin';
import { withOktaAuth } from '@okta/okta-react';

const Login = (props) => {
  console.log(props);

  const onSuccess = res => {
    if (res.status === 'SUCCESS') {
      return props.authService.redirect({
        sessionToken: res.session.token
      });
   } else {
    // The user can be in another authentication state that requires further action.
    // For more information about these states, see:
    //   https://github.com/okta/okta-signin-widget#rendereloptions-success-error
    }
  }

  const onError = err => {
    console.log('error logging in', err);
  }

  if (props.authState.isPending) return null;


  return props.authState.isAuthenticated ?
    <Redirect to={{ pathname: '/etlframework' }}/> :
    <SignInWidget
      baseUrl={props.baseUrl}
      onSuccess={onSuccess}
      onError={onError}/>;
  
};

export default withOktaAuth(Login);