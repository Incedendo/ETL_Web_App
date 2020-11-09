function isNumber(input) {
    return /^[0-9\b]+$/.test(input);
}

//Determine if a string is a number or not, if not, append double quotes around it.
export const surroundWithQuotesIfString = (input) => {
    let res = ""

    if (isNumber(input)) {
        console.log(input + " is a number")
        res = input
    } else {
        console.log(input + " is NOT number")
        res = "'" + input + "'"
    }

    return res
}

/* 
@params:
    keys: array
    values: array
@return:
    a string in format "key1 = 'val1', key2 = 'val2', etc"
*/

const generateUpdatePhrase = (keys, values) => {
    let val = values[0].replace(/'/g, "\\'")
    val = surroundWithQuotesIfString(val)
    let clause = keys[0] + " = " + val
    for (let key = 1; key < keys.length; key++) {
        val = values[key].replace(/'/g, "\\'")
        val = surroundWithQuotesIfString(val)
        clause += ', ' + keys[key] + " = " + val
    }

    return clause;
}

export const generateUpdateSQLStatement = (
    database, schema, table, primaryKeys,
    changedObject, changedRow,
    ) => {
    // Prepareing UPDATE statemtent
    console.log('Changed Object: ', changedObject);

    let keys = Object.keys(changedObject);
    let values = Object.values(changedObject);
    let updateClause = generateUpdatePhrase(keys, values)
    
    //Generate a key=value string for the WHERE clause, no modification made to primary keys
    let val = changedRow[primaryKeys[0]]
    val = surroundWithQuotesIfString(val);
    let conditionClause = primaryKeys[0] + " = " + val;
    for (let key = 1; key < primaryKeys.length; key++) {
        val = changedRow[primaryKeys[key]]
        val = surroundWithQuotesIfString(val)
        conditionClause += ' AND ' + primaryKeys[key] + " = " + val
    }

    let sqlUpdateStatement = "UPDATE " + database + "." + schema + "." + table +
        " SET " + updateClause +
        " WHERE " + conditionClause + ";";

    console.log("----Update Statement----", sqlUpdateStatement);
    return sqlUpdateStatement
}

