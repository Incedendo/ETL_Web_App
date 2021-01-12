import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import {  Field } from 'formik';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

const MultiSelectField = ({ field, dropdownFields, touched, errors }) => {

    useEffect(() => {
        // console.log(dropdownFields);
        let selectOptions = [];
        let option = {}
        dropdownFields['CATALOG_ENTITIES'].map(field =>{
            // console.log(field);
            selectOptions.push({
                'label': field,
                'value': field,
            });
        })

        // console.log(selectOptions);
        setOptions(selectOptions);
    }, []);

    // useEffect(() => {
    //     if(selectedOption !== null)
    //         console.log(selectedOption);
    // }, [selectedOption]);

    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState([]);

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
        >
            {({ field: { value }, form: { setFieldValue } }) => (
                // <div className={errorTextAreaClassname + " " + validatedTextAreaClassname}>
                // <div className={errorTextAreaClassname}>
                <>

                    <ReactMultiSelectCheckboxes
                        placeholderButtonLabel={'Select a target db, schema, table combination'}
                        onChange={(values) => printChange(values, setFieldValue, field)}
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