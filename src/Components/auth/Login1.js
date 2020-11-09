import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import SignInWidget from './Signin';
import { withOktaAuth  } from '@okta/okta-react';

const Login1 = (props) => {
  const [authenticated, setAuthenticated] = useState(null);

  const checkAuthentication = async () => {
    console.log('waiting for props.auth.isAuth...')
    const propsAuthenticated = await props.auth.isAuthenticated();
    console.log('done waitng....PropsAuthenticated: '.propsAuthenticated)
    if (propsAuthenticated !== authenticated) {
      setAuthenticated(propsAuthenticated);
      console.log('set Authenticated')
    }
  }

  useEffect(() => {
    checkAuthentication();
  }, [authenticated])

  const onSuccess = (res) => {
    // return this.props.auth.redirect({
    //     sessionToken: res.session.token
    //   });

    if (res.status === 'SUCCESS') {
      return props.auth.redirect({
        sessionToken: res.session.token
      });
    } else {
      // The user can be in another authentication state that requires further action.
      // For more information about these states, see:
      //   https://github.com/okta/okta-signin-widget#rendereloptions-success-error
    }
  }

  const onError = (err) => {
    console.log('error logging in', err);
  }

  if (authenticated === null) return null;

  const output = authenticated ?
    <Redirect to={{ pathname: '/etlframework' }} /> :
    <SignInWidget
      baseUrl={props.baseUrl}
      onSuccess={onSuccess}
      onError={onError} />;

  return output;
}

export default withOktaAuth(Login1);