import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import {  Field } from 'formik';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

const MultiSelectField = ({ field, isDatCatForm, dropdownFields, placeholder, touched, errors, submitted }) => {

    useEffect(() => {
        let mounted = true;
        console.log(dropdownFields);
        let selectOptions = [];
        if(isDatCatForm){
            dropdownFields[field].map(field =>{
                // console.log(field);
                selectOptions.push({
                    'label': field,
                    'value': field,
                });
            }) 
        }
        else{
            dropdownFields.map(field =>{
                // console.log(field);
                selectOptions.push({
                    'label': field,
                    'value': field,
                });
            }) 
        }
        // console.log(selectOptions);
        if(mounted) 
            setOptions(selectOptions);

        return () => mounted = false;
    }, []);

    const [options, setOptions] = useState([]);

    const printChange = (values, setFieldValue, field) =>{
        // console.log(values);
        let selectedOptions = [];
        values.map(option => selectedOptions.push(option['label']));

        console.log(`Field ${field} is: ${selectedOptions}`);
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
                console.log('changing groupID dropdown');
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
                        {errors[field] !== '' && errors[field]}
                    </div>
                    
                </>
                
            )}
            
        </Field>
    )
}

export default MultiSelectField;