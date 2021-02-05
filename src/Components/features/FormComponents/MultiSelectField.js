import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import {  Field } from 'formik';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

const MultiSelectField = ({ field, isDatCatForm, dropdownFields, placeholderButtonLabel, touched, errors, submitted }) => {

    // useEffect(()=>{
    //     if(submitted){
    //         console.log("form is subbmited");
    //     }
    // }, [submitted]);

    useEffect(() => {
        console.log(dropdownFields);
        let selectOptions = [];
        if(isDatCatForm){
            dropdownFields['CATALOG_ENTITIES'].map(field =>{
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
        setOptions(selectOptions);
    }, []);

    const [options, setOptions] = useState([]);

    const printChange = (values, setFieldValue, field) =>{
        // console.log(values);
        let selectedOptions = [];
        values.map(option => selectedOptions.push(option['label']));
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
                        placeholderButtonLabel={placeholderButtonLabel}
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