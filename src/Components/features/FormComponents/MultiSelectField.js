import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import {  Field } from 'formik';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

const MultiSelectField = ({ field, isDatCatForm, dropdownFields, placeholder, touched, errors }) => {

    const {
        debug
    } = useContext(WorkspaceContext);

    useEffect(() => {
        let mounted = true;
        debug && console.log(dropdownFields);
        let selectOptions = [];
        if(isDatCatForm){
            dropdownFields[field].map(field =>{
                // debug && console.log(field);
                selectOptions.push({
                    'label': field,
                    'value': field,
                });
            }) 
        }
        else{
            dropdownFields.map(field =>{
                // debug && console.log(field);
                selectOptions.push({
                    'label': field,
                    'value': field,
                });
            }) 
        }
        // debug && console.log(selectOptions);
        if(mounted) 
            setOptions(selectOptions);

        return () => mounted = false;
    }, []);

    const [options, setOptions] = useState([]);

    const printChange = (values, setFieldValue, field) =>{
        debug && console.log(errors);
        let selectedOptions = [];
        values.map(option => selectedOptions.push(option['label']));

        debug && console.log(`Field ${field} is: ${selectedOptions}`);
        setFieldValue(field, selectedOptions);

    }

    return (
        <Field 
            name={field} 
            id={field}
            key={field}
            style={{
                "textAlign": "left"
            }}
            onChange={()=>{
                debug && console.log('changing groupID dropdown');
            }}
        >
            {({ field: { value }, form: { setFieldValue } }) => (
                // <div className={errorTextAreaClassname + " " + validatedTextAreaClassname}>
                // <div className={errorTextAreaClassname}>
                <>
                    <ReactMultiSelectCheckboxes
                        placeholderButtonLabel={placeholder}
                        onChange={values => printChange(values, setFieldValue, field)}
                        options={options} 
                    />

                    {/* <div className='custom-invalid-feedback'> */}
                    <div className='custom-invalid-feedback'>
                        {field in errors && errors[field] !== '' && errors[field]}
                    </div>
                    
                </>
                
            )}
            
        </Field>
    )
}

export default MultiSelectField;