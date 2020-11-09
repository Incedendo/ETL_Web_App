import React from 'react';

const PrimaryKeyField = ({ row, primaryKeys, fieldArray }) => {
    // console.log('non-editable Comp: ', fieldArray)
    return (
        <div key={fieldArray} style={{ "textAlign": "left", "color": "red" }}>
            <span style={{ "fontWeight": "bold" }}>{fieldArray[0]}: </span>
            {fieldArray[1]}
        </div>
    )
}

export default PrimaryKeyField;