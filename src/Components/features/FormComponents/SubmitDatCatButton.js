import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import '../../../css/rowExpansion.scss';

const SubmitDatCatButton = ({ table, isSubmitting, validating, inserting, errors, touched }) => {

    const [variant, setVariant] = useState('outline-primary');

    useEffect(() => {
        console.log(touched);
        if(Object.keys(touched).length){
            Object.keys(errors).length ? setVariant('outline-danger') : setVariant('outline-success');
        }
    }, [errors, touched]);


    return (
        <>
            <Button
                variant={variant}
                // variant={errors.length ? 'outline-danger' : 'outline-success'}
                type="submit" 
                disabled={isSubmitting || validating || inserting}
                style={{
                    'marginLeft': 'auto',
                    'display': 'block',
                    'marginRight': 'auto'
                }}
            >
                
                {inserting &&
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                }

                {!inserting
                    ? <span style={{ 'marginLeft': '5px' }}>Add {table} item</span>
                    : <span style={{ 'marginLeft': '5px' }}>Inserting Data...</span>
                }
            </Button>
        </>
    )
}

export default SubmitDatCatButton;