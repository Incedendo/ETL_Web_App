export { getDataType, getFieldType };

function getDataType(type){
    let data_type = 'string';
    switch (type) {
        case 'TEXT':
            // console.log('Found a String');
            data_type = 'string';
            break;
        case 'NUMBER':
            // console.log('Found a number');
            data_type = 'number';
            break;
        default:
            break;
    }
    return data_type;
}

// This function check if the fields is found in the codeFields array or dropdownFields Object
// and return the type to display a Code Field or DropDown field in the Form
const getFieldType = (field, codeFields, dropdownFields) => {
    let type = 'text';

    // if (codeFields.indexOf(field) > -1) {
    //     type = 'code';
    // }
    if (Object.keys(codeFields).indexOf(field) > -1) {
        type = 'code';
    } else if (Object.keys(dropdownFields).indexOf(field) > -1) {
        type = 'dropdown';
    }

    return type;
}

// function getSystemIDs(route, system_type, setDropdownFields) {
//     //system_type is either 'source' or 'target'

//     //set Target_SYSTEM_ID
//     const system = routeConfigs[route][system_type].toLowerCase(); //'Oracle' or 'Snowflake' or 'Salesforce'
//     const system_data = system_configs[system];

//     // const system_id_desc = ['Select ID'].concat(Object.values(system_data).map(value =>
//     //     value.ETLF_SYSTEM_CONFIG_ID + ' - ' + value.SYSTEM_CONFIG_DESCRIPTION
//     // ));
//     const system_id_desc = Object.values(system_data).map(value =>
//         value.ETLF_SYSTEM_CONFIG_ID + ' - ' + value.SYSTEM_CONFIG_DESCRIPTION
//     );

//     let target;
//     if (system_type === 'source') {
//         target = 'SOURCE_SYSTEM_ID';
//     } else {
//         target = 'TARGET_SYSTEM_ID';
//     }

//     // Update the Dropdown fields for the following Form based on Route and Action
//     updateDropdownFields(target, system_id_desc, setDropdownFields);
// }

// function updateDropdownFields(target, values, setDropdownFields) {
//     //------------------Update GROUP ID for Row Expansion and Form---------------------------------------
//     let updatedDropdownFields = fieldTypesConfigs[table]['dropdownFields'];
//     updatedDropdownFields[target] = values;
//     console.log("Updated Dropdown Fields:", updatedDropdownFields);

//     setDropdownFields(updatedDropdownFields);
// }