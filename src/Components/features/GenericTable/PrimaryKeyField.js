import React from 'react';

const PrimaryKeyField = ({  
    fieldArray 
}) => {
    console.log('non-editable Comp: ', fieldArray)
    return (
        <div key={fieldArray} style={{ 
            'display': 'inline', 'marginRight': '10px',
            "textAlign": "left", "color": "red" 
        }}>
            <span style={{ "fontWeight": "bold" }}>{fieldArray[0]}: </span>
            {fieldArray[1]}
        </div>
    )
}

export default PrimaryKeyField;