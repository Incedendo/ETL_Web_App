import React from 'react';

const PrimaryKeyField = ({  
    fieldArray, pending 
}) => {

    console.log('non-editable Comp: ', fieldArray)
    return (
        <div key={fieldArray} style={{ 
            'display': 'inline', 'marginRight': '10px',
            "textAlign": "left", 
            // "color": "red"
            'color': 'black' 
        }}>
            <span style={{ "fontWeight": "bold", 'color': '#007bff' }}>{fieldArray[0]}: </span>
            {fieldArray[0] === 'INGESTION_STATUS' 
                && (pending ? 'PENDING' : fieldArray[1])
            }

            {fieldArray[0] !== 'INGESTION_STATUS' && (
                fieldArray[1] !== '' ? fieldArray[1] : 'Not Assigned'
            )}
        </div>
    )
}

export default PrimaryKeyField;