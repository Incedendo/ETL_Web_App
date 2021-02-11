import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import '../../../css/rowExpansion.scss';

const SubmitButton = ({ validating, errors, touched, defaultName, SpinningName }) => {

    const [variant, setVariant] = useState('outline-primary');

    useEffect(() => {
        console.log(touched);
        if(Object.keys(touched).length){
            Object.keys(errors).length ? setVariant('outline-danger') : setVariant('outline-success');
        }
    }, [errors, touched]);

    return (
        <div className="central-spinning-div">
            <Button
                variant={variant}
                type="submit" 
                disabled={validating || Object.keys(errors).length}
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
                    ? <span style={{ 'marginLeft': '5px' }}>{defaultName}</span>
                    : <span style={{ 'marginLeft': '5px' }}>{SpinningName}</span>
                }
            </Button>
        </div>
    )
}

export default SubmitButton;