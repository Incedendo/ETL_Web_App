import React, { useState, useEffect } from 'react';
import auth from '../../Helper/auth';
import '../css/LandingPage.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const LandingPage = (props) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (isLoading) {
      auth.authenticateUser(username, password, () =>{
        if(auth.isAuthenticated){
          // console.log('authenticated');
          props.history.push('/home');
        }
        // else{
        //   if(auth.pressedLogin){
        //     setLoginError('Incorrect Username or Password');
        //     console.log('loginError');
        //     setLoading(false);
        //   }
        // }
        setLoading(false);
      })
    }
  }, [isLoading]);

  const validateUserInput = () => {
    // console.log('validating input');
    if(username !== '' && password !== '' ){
      setLoading(true);
    }
  }

  const handleSubmit = event => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  return(
    <div className="centerPage">
        <h1 className="landingPageDiv">ETL Framework Landing Page</h1>
        {loginError && <div style={{"color": "red", "font-weight": "bold"}}>{loginError}</div>}


        <div className="credLayout">
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group controlId="validationCustom01">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  required
                  onChange={(event) => setUsername(event.target.value)}/>
                <Form.Control.Feedback type="invalid">
                  Please enter username.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  required
                  onChange={(event) => setPassword(event.target.value) }/>
                <Form.Control.Feedback type="invalid">
                  Please enter password.
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                onClick={!isLoading ? validateUserInput : null}
              >
                {isLoading ? 'Loading…' : 'Login'}
              </Button>
            </Form>
        </div>
    </div>
  )
}
