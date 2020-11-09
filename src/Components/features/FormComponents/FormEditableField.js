import React, { useState, useContext } from 'react';
import {  Field } from 'formik';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import { WorkspaceContext } from '../../context/WorkspaceContext';

import '../../../css/CodeEditor.scss';

const FormEditableField = ({ field, value, touched, errors }) => {

    const {
        debug
    } = useContext(WorkspaceContext)

    const [code, setCode] = useState(value);

    // useEffect(() => {
    //     console.log('Touched: ', touched[field]);
    // }, [errors[field]]);

    // useEffect(() => {
    //     console.log('Touched: ', touched[field]);
    // }, [touched[field]]);

    // let errorTextAreaClassname = ( errors[field] === undefined) ? '' : 'custom-is-invalid';
    // let validatedTextAreaClassname = (errors[field] === undefined || errors[field] ==='') ? 'custom-is-valid' : '';

    //perform on the spot type validation for each field
    return (
        <Field 
            name={field} 
            id={field}
            key={field}
            style={{
                "textAlign": "left"
            }}
        >
            {({ field: { value }, form: { setFieldValue } }) => (
                // <div className={errorTextAreaClassname + " " + validatedTextAreaClassname}>
                // <div className={errorTextAreaClassname}>
                <>
                    <Editor
                        value={code}
                        onValueChange={code => {
                            setCode(code);
                            setFieldValue(field, code)
                            debug && console.log(code);
                        }}
                        highlight={code => highlight(code, languages.js, 'javascript')}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 12,
                        }}
                    />

                    {/* <div className='custom-invalid-feedback'> */}
                    <div className='custom-invalid-feedback'>
                        {errors[field] !== '' && errors[field]}
                    </div>
                    
                </>
                
            )}
            
        </Field>
    )
}

export default FormEditableField;