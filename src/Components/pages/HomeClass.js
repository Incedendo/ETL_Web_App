import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withAuth } from '@okta/okta-react';

const issuer = `https://dev-441324.okta.com/oauth2/default`;
const redirectUri = `${window.location.origin}/logged_out`;

export default withAuth(
  class Home extends Component {
    state = { 
      authenticated: null,
      userinfo: null,
      idtoken: null,
      accesstoken: null,
    };

    checkAuthentication = async () => {
      const authenticated = await this.props.auth.isAuthenticated();
      if (authenticated !== this.state.authenticated) {
        this.setState({ authenticated });
      }

      if (authenticated && !this.state.userinfo) {
        const userinfo = await this.props.auth.getUser();
        const idtoken = await this.props.auth.getIdToken();
        const accesstoken = await this.props.auth.getAccessToken();
        
        this.setState({ userinfo, idtoken, accesstoken });
        console.log(this.state);
      }
    };

    async componentDidMount() {
      this.checkAuthentication();
    }

    async componentDidUpdate() {
      this.checkAuthentication();
    }

    login = async () => {
      this.props.auth.login('/');
    };

    logout = async () => {
      // Read idToken before local session is cleared
      const idToken = await this.props.auth.getIdToken();

      // Clear local session
      await this.props.auth.logout('/').catch(err => {
        // Silently ignore no such session errors
        if (err.errorCode !== "E0000007") {
          throw err;
        }
      });

      // Clear remote session
      window.location.href = `${issuer}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`;
    };

    render() {
      if (this.state.authenticated === null) return null;

      const mainContent = this.state.authenticated ? (
        <div>
          {this.state.userinfo !== null &&
            <div>
              <p>Welcome back, {this.state.userinfo.name}!</p>
            </div>
          }
          <p className="lead">
            You have entered the Workspace portal,{' '}
            <Link to="/workspace">click here</Link>
          </p>
          <button className="btn btn-light btn-lg" onClick={this.logout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p className="lead">
            If you have snowflake account, please get your credentials from your
            DB Administrator
          </p>
          <button className="btn btn-dark btn-lg" onClick={this.login}>
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
  }
);
