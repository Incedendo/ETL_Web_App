// SHARED_TOOLS_DEV.ETL.ETLF_EXTRACT_CONFIG will have GROUP_ID
// SHARED_TOOLS_DEV.ETL.etlfcall will have WORK_GROUP_ID

import { surroundWithQuotesIfString } from './SQL_Operations/Edit';

export const get_custom_table = (db, schema, table, username, start, end) => {
    let group_ID_col = "";
    switch(table){
        case "ETLF_EXTRACT_CONFIG":
            group_ID_col = "GROUP_ID";
            break;
        case "ETLFCALL":
            group_ID_col = "WORK_GROUP_ID";
            break;
        default:
            group_ID_col = "GROUP_ID";
    }

    let sql_statement = `SELECT * FROM(
    SELECT ec.*, IFNULL(auth.PRIVILEGE, 'READ ONLY') PRIVILEGE,
    row_number() OVER(ORDER BY ec.` + group_ID_col +` ASC) id,
    COUNT(*) OVER() total_num_rows
    FROM "`+ 
    db + `"."`+ 
    schema +`"."` + 
    table + `" ec
    FULL OUTER JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
    ON ec.` + group_ID_col + ` = auth.APP_ID AND auth.USERNAME = '`
    + username.toLowerCase() + `'
);`;
// WHERE rn BETWEEN `+ start + ` AND ` + end + ';';

    // console.log(sql_statement);

    return sql_statement
}

export const search_multi_field = (username, db, schema, table, groupIDColumn, currentSearchObj, start, end) => {
    let sql_statement = `SELECT * FROM(
    SELECT ec.*, auth.PRIVILEGE,
    row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn,
    COUNT(*) OVER() total_num_rows
    FROM "`+
        db + `"."` +
        schema + `"."` +
        table + `" ec
    JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
    ON ec.` + groupIDColumn + ` = auth.APP_ID AND auth.USERNAME = '`
            + username.toLowerCase() + `'
    WHERE ` + getSearchFieldValue(currentSearchObj) + `
    )
WHERE rn BETWEEN `+ start + ` AND ` + end;

    return sql_statement;
}

export const search_multi_field_catalog = (db, schema, table, currentSearchObj, start, end) => {
    let sql_statement = `SELECT * FROM(
    SELECT ec.*, 'READ ONLY' AS PRIVILEGE
    FROM "`+
        db + `"."` +
        schema + `"."` +
        table + `" ec
    WHERE ` + getSearchFieldValue(currentSearchObj) + `
    );`;
    
return sql_statement;
}

function getSearchFieldValue(currentSearchObj){
    let res = ''
    for (let item in currentSearchObj){
        if(Object.keys(currentSearchObj).indexOf(item) > 0){
            res += 'AND ' + 'ec.' + item + '=' + surroundWithQuotesIfString(currentSearchObj[item]) + `
            `;
        }else{
            res += 'ec.' + item + '=' + surroundWithQuotesIfString(currentSearchObj[item]) + `
            `;
        }
    }
    return res;
}