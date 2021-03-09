
import { surroundWithQuotesIfString } from './Edit';

const isNumber = (input) => {
    return /^[0-9\b]+$/.test(input);
}

// primaryKeys = ['ID', 'date', 'UUID']
export const  isUnique = (rows, primaryKeys, insertObj, setInsertError) => {
     
    const values = Object.values(insertObj)
    const keys = Object.keys(insertObj)
    for(let id in values){
        if (isNumber(values[id])){
            insertObj[keys[id]] = parseInt(values[id])
        }
    }

    for(let id in rows){
        const row = rows[id];
        console.log('CUrrent row: ', row);
        for(let keyID in primaryKeys){
            let primaryKey = primaryKeys[keyID]
            console.log('Checking Primary key: ', primaryKey)
            if (insertObj[primaryKey] === row[primaryKey]){
                const errMsg = 'Duplicate Primary Key Value: ' + 
                    'Primary key ' + primaryKeys[keyID] + ' already contains value ' + insertObj[primaryKey];
                console.log(errMsg);
                setInsertError(errMsg)
                return false
            }
            console.log('Row ', id, ' has primary key val: ', row[primaryKey])
        }
        
    }

    setInsertError('')
    return true;
}

export const validateNumberOfFieldsForNewRow = (newRow, InsertColumnHeaders, setInsertError) => {

    //Error Case 1: empty fields
    if (Object.entries(newRow).length === 0 && newRow.constructor === Object) {
        console.log('empty object');

        setInsertError('Insert Error: Have to fill in all fields for Insert Command.');
        return false;
    }

    ////Error Case 2: any of the field is not filled out
    let arrayOfValuesOfInsertedRecord = Object.keys(newRow).map(key => newRow[key])
    if (arrayOfValuesOfInsertedRecord.length !== InsertColumnHeaders.length) {
        console.log("Expected length of Record: ", InsertColumnHeaders.length);
        console.log("Actual length of Record: ", arrayOfValuesOfInsertedRecord.length);

        setInsertError('One or more fields for Insert Command are empty. ');
        return false;
    }

    setInsertError('');
    return true;
}

export const validatedDatatypesNewRow = (addedRow, columnDataTypes, setInsertError) => {
    console.log('Added Row: ', addedRow); // addedRow is an object

    const newRecordDatatypeObj = getRecordTypesUsingRegexNumericTest(addedRow);
    console.log(newRecordDatatypeObj)
    console.log(columnDataTypes)
    for (let key in newRecordDatatypeObj) {
        if (newRecordDatatypeObj[key] !== columnDataTypes[key]) {
            const errMsg = '[Insert] Expecting a <' + columnDataTypes[key] + '> from [' + key +
                '] but user enter a <' + newRecordDatatypeObj[key] + '>'
            console.log(errMsg)
            setInsertError(errMsg);
            return false;
        }
    }

    setInsertError('')
    return true;
}

/* 
    @param: an object containing the newly added key-value pairs
    @return:
        an object {
            key: value 
        }

        where: 
            -key is the name of the column in the database
            -value is the data type of that column
*/
export const getRecordTypesUsingRegexNumericTest = (addedRow) => {
    let sampleDataObj = {}
    for (let key in addedRow) {
        if (key !== 'PRIVILEGE') {
            /^[0-9\b]+$/.test(addedRow[key]) ?
                sampleDataObj[key] = 'number' :
                sampleDataObj[key] = 'string'
        }
    }

    return sampleDataObj;
}

/*

*/
export const generateMergeStatement = (database, schema, table, primaryKeys, columns, rowOjb) => {
    console.log(columns);
    
    const selectClause = getSelectClause(rowOjb, columns);
    const updateClause = getUpdateClause(columns);

    const insertCols = getInsertCols(columns);
    const insertValues = getInsertValues(columns);
    const primarykeyClause = getPrimaryKeysClause(primaryKeys);

    const sqlMergeStmt = `
    merge into ` + database + '.' + schema + '.' + table + ` tt
    using (
        select ` + selectClause
    +    
    `
       from dual
    ) st on (` + primarykeyClause + `)
    when matched then
    update set ` + updateClause
    + 
    ` 
    when not matched then
    insert (
    ` + insertCols + `
    ) 
    values 
    (
        ` + insertValues + `
    );`

    console.log('SQL merge Statement: ', sqlMergeStmt)

    return sqlMergeStmt
}

export const generateMergeUpdateStatement = (database, schema, table, primaryKeys, columns, rowOjb) => {
    const selectClause = getSelectClause(rowOjb, columns);
    const updateClause = getUpdateClause(columns);

    // const insertCols = getInsertCols(columns);
    // const insertValues = getInsertValues(columns);
    const primarykeyClause = getPrimaryKeysClause(primaryKeys);

    const sqlMergeStmt = `
    MERGE INTO ` + database + '.' + schema + '.' + table + ` tt
    USING (
        SELECT ` + selectClause
    +    
    `
    FROM DUAL
    ) st ON (` + primarykeyClause + `)
    WHEN matched THEN
    UPDATE SET 
    ` + updateClause + `;`

    console.log('SQL merge Statement: ', sqlMergeStmt)

    return sqlMergeStmt
}

// export const generateMergeStatementDataCatalog = (database, schema, table, columns, rowOjb) => {
//     const selectClause = getSelectClause(rowOjb, columns);
//     const updateClause = getUpdateClause(columns);

//     const insertCols = getInsertCols(columns);
//     const insertValues = getInsertValues(columns);
//     const primarykeyClause = getPrimaryKeysClause(primaryKeys);

//     const sqlMergeStmt = `
//     merge into ` + database + '.' + schema + '.' + table + ` tt
//     using (
//         select ` + selectClause
//     +    
//     `
//        from dual
//     ) st on (` + primarykeyClause + `)
//     when matched then
//     update set ` + updateClause
//     + 
//     ` 
//     when not matched then
//     insert (
//     ` + insertCols + `
//     ) 
//     values 
//     (
//         ` + insertValues + `
//     );`

//     console.log('SQL merge Statement: ', sqlMergeStmt)

//     return sqlMergeStmt
// }

const getPrimaryKeysClause = (primaryKeys) => {
    let primarykeyClause = ''
    for(let id in primaryKeys){
        primarykeyClause += `UPPER(tt.` + primaryKeys[id] + ') = UPPER(st.' + primaryKeys[id] + ')'

        if(id < primaryKeys.length - 1){
            primarykeyClause += ' AND '
        }
    }  

    return primarykeyClause;
}

const getSelectClause = (rowOjb, columns) => {
    console.log(rowOjb);
    let values = []
    for (let id in columns) {
        let value = rowOjb[columns[id]]
        console.log(columns[id], ': ', value);
        if(value === 'null value' || value === ''){
            value = null;
        }
        if (value !== null 
            && !isNumber(value) 
            && (['GR_DEV.USER_SPACE.KIET_ETL_EXTRACT_ID_SEQ.NEXTVAL','CURRENT_TIMESTAMP::timestamp_ntz'].indexOf(value) < 0)
        ){
            let checkedSingleQuoteValue = value.replace(/'/g, "\\'");
            value = surroundWithQuotesIfString(checkedSingleQuoteValue);
        }
        
        values.push(value);
    }
    
    let selectClause = ''
    for (let id in columns){
        let value = isNaN(values[id]) ? values[id].toUpperCase().trim() : values[id];
        selectClause += value + ' as ' + columns[id];
        if (id < columns.length - 1){
            selectClause += `, 
                  `;
        }
    }
    return selectClause
}

const getUpdateClause = (columns) => {
    let updateClause = '';
    for (let id in columns) {
        updateClause += 'tt.' + columns[id] + ' = st.' + columns[id] + ', \n';
    }

    updateClause += 'tt.LASTMODIFIEDDT = CURRENT_TIMESTAMP(0)::TIMESTAMP_NTZ';
    return updateClause;
}

const getInsertValues = (columns) => {
    let values = ''
    for (let id in columns){
        values += 'st.' + isNaN(columns[id]) ? columns[id].toUpperCase().trim() : columns[id]
        if (id < columns.length - 1){
            values += ', ';
        }
    }

    console.log('Process Values of Merge Statement: ', values)
    return values;
}

const getInsertCols = (columns) => {
    let cols = ''
    for (let id in columns) {
        cols += columns[id]
        if (id < columns.length - 1) {
            cols += ', '
        }
    }

    console.log('Columns of Merge Statement: ', cols)
    return cols;
}

//-----------------------------------------------------

export const generateAuditStmt = values => {
    const find = "'";
    const re = new RegExp(find, 'g');

    let stmt = `INSERT INTO SHARED_TOOLS_DEV.ETL.ETL_AUDIT 
(USERNAME, ACTION, TABLE_NAME, PRIMARY_KEY, SQL_CODE, STATUS )
SELECT `+ 
        "UPPER(TRIM('" + values.USERNAME +"')), " +
        "UPPER(TRIM('" + values.ACTION +"')), " +
        "UPPER(TRIM('" + values.TABLE_NAME +"')), " +
        " parse_json('" + JSON.stringify(values.PRIMARY_KEY) + "'), " +
        "UPPER(TRIM('" + values.SQL_CODE.replace(re, "''") +"')), " +
        "UPPER(TRIM('" + values.STATUS +"'));";

    console.log("audit statement: ", stmt);
    return stmt;
}



