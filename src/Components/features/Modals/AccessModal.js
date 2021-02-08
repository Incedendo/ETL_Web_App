import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Formik, Field } from 'formik';
import * as yup from 'yup'; // for everything
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import '../../../css/mymodal.scss';

const AccessModal = () => {

    const {
        debug, username,
    } = useContext(WorkspaceContext);

    const [show, setShow] = useState(false);
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        if(validating){
            //send an email to Group Admin requesting New ReadWrite Access.
            // make use of ServiceNow APIs to create a service now ticket if possible
        }
    }, [validating])


    const accessSchema = yup.object().shape({
        appID: yup.string().required()
    });

    return (
        <>
            <Button className="plus-button"
                variant="outline-primary"
                onClick={() => setShow(true)}>
                +
            </Button>

            <Modal
                show={show}
                onHide={() => setShow(false)}
                dialogClassName="modal-150w"
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        Request New Read/Write Access
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        validationSchema={accessSchema}
                        //destructure the action obj into {setSubmitting}
                        onSubmit={(values, { resetForm, setErrors, setSubmitting }) => {
                            debug && console.log('values: ', values);
                            setValidating(true);
                            // setShow(false);
                        }}
                        initialValues={{
                            appID: []
                        }}
                    >
                        {({
                            handleSubmit, isSubmitting,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            isInvalid,
                            errors,
                        }) => (
                                <Form
                                    noValidate
                                    onSubmit={handleSubmit}
                                >
                                    

                                    <Form.Group  controlId="exampleForm.ControlSelect1">
                                        <Form.Label>App IDs*:</Form.Label>
                                        <Form.Control
                                            name="appID"
                                            placeholder="enter 1 or many App IDs separated by commas"
                                            onChange={(e) => {
                                                handleChange(e);
                                            }}
                                            isValid={touched.appID && !errors.appID}
                                            isInvalid={touched.appID && !!errors.appID}
                                        
                                        ></Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.appID}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    
                                    <div className="central-spinning-div">
                                        <Button
                                            // variant="primary"
                                            type="submit" disabled={isSubmitting}
                                        >

                                            {validating &&
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            }

                                            {!validating
                                                ? <span style={{ 'marginLeft': '5px' }}>Request</span>
                                                : <span style={{ 'marginLeft': '5px' }}>Requesting...</span>
                                            }
                                        </Button>
                                    </div>
                                </Form>
                            )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default AccessModal;