import React from 'react';

const PrimaryKeyField = ({  
    fieldArray, pending 
}) => {

    console.log('non-editable Comp: ', fieldArray)
    return (
        <div key={fieldArray} style={{ 
            'display': 'inline', 'marginRight': '10px',
            "textAlign": "left", "color": "red" 
        }}>
            <span style={{ "fontWeight": "bold" }}>{fieldArray[0]}: </span>
            {fieldArray[0] === 'INGESTION_STATUS' 
                && (pending ? 'PENDING' : fieldArray[1])
            }

            {fieldArray[0] !== 'INGESTION_STATUS' && fieldArray[1]}
        </div>
    )
}

export default PrimaryKeyField;