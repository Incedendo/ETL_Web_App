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
    let sql_statement = 
    // `SELECT * FROM(
    `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
    row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn,
    COUNT(*) OVER() total_num_rows
    FROM "`+  db + `"."` + schema + `"."` +  table + `" ec
    JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
    ON ec.` + groupIDColumn + ` = auth.APP_ID AND auth.USERNAME = '`
            + username.toLowerCase() + `'
    WHERE ` + getSearchFieldValue(currentSearchObj) + `
    ;`;
// WHERE rn BETWEEN `+ start + ` AND ` + end;

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

export const search_multi_field_catalog_with_Extra_columns_joined = (
    db, schema, table, 
    currentSearchObj, 
    joinedTable, joinedColumms, joinedCriterion
) => {
    console.log(currentSearchObj);
    console.log(joinedColumms);
    // SELECT joined.TARGET_DATABASE, joined.TARGET_SCHEMA, joined.TARGET_TABLE, ec.*, 'READ ONLY' AS PRIVILEGE

    let extraJoinedColumns = '';
    joinedColumms.map(col => extraJoinedColumns += 'joined.' + col + ', ');
    console.log(extraJoinedColumns);

    let sql_statement = `SELECT ` + extraJoinedColumns + ` ec.*, 'READ ONLY' AS PRIVILEGE
    FROM "`+ db + `"."` + schema + `"."` + table + `" ec ` + `
    JOIN "`+ db + `"."` + schema + `"."` + joinedTable + `" joined ` + `
    ON ec.` + joinedCriterion + ' = joined.' + joinedCriterion + `
    WHERE ` + getSearchFieldValue(currentSearchObj) + 
    `ORDER BY joined.TARGET_DATABASE, joined.TARGET_SCHEMA, joined.TARGET_TABLE;`;
    
    return sql_statement;
}

export const search_composite_DATA_STEWARD_DOMAIN = currentSearchObj =>{
    console.log(currentSearchObj);

    let sql_statement = `SELECT C1.EMAIL, C1.DATA_STEWARD_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C1.CREATEDDATE, C1.LASTMODIFEDDATE, 'READ ONLY' AS PRIVILEGE
    FROM
    (SELECT A.FNAME, A.LNAME, A.EMAIL, B.DATA_STEWARD_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFEDDATE
      FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD A
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
      ON A.DATA_STEWARD_ID = B.DATA_STEWARD_ID
      WHERE ` + getCompositeValue(currentSearchObj, 'A', 'EMAIL') + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    WHERE ` + getCompositeValue(currentSearchObj, 'C', 'DOMAIN') + ';';
    return sql_statement;
}

export const search_composite_CATALOG_ENTITY_DOMAIN = currentSearchObj =>{
    console.log(currentSearchObj);

    let sql_statement = `SELECT C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C1.CREATEDDATE, C1.LASTMODIFEDDATE
    FROM
    (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFEDDATE
      FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
      INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
      ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      WHERE ` + getMultiCompositeValues(currentSearchObj, 'A', ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE']) + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    WHERE ` + getCompositeValue(currentSearchObj, 'C', 'DOMAIN') + ';';
    return sql_statement;
}
           

export const getSearchFieldValue = (currentSearchObj) => {
    let res = ''
    for (let item in currentSearchObj){
        if(Object.keys(currentSearchObj).indexOf(item) > 0){
            res += `AND UPPER(TRIM(ec.` + item + `)) LIKE UPPER('%` + currentSearchObj[item] + `%')
            `;
        }else{
            res += `UPPER(TRIM(ec.` + item + `)) LIKE UPPER('%` + currentSearchObj[item] + `%')
            `;
        }
    }
    return res;
}

const getMultiCompositeValues = (currentSearchObj, table, items) => {
    let res = '';
    for (let item in currentSearchObj){
        //item is the column
        let value = items.indexOf(item) >= 0 ? currentSearchObj[item] : '';
        if(Object.keys(currentSearchObj).indexOf(item) > 0){
            res += `AND UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER('%` + value + `%')
            `;
            // res += 'AND ' + 'ec.' + item + '=' + surroundWithQuotesIfString(currentSearchObj[item]) + `
            // `;
        }else{
            res += `UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER('%` + value + `%')
            `;
            // res += 'ec.' + item + '=' + surroundWithQuotesIfString(currentSearchObj[item]) + `
            // `;
        }
    }
    return res;
}

const getCompositeValue = (currentSearchObj, table, item) => {
    let value = item in currentSearchObj ? currentSearchObj[item] : '';
    return  `UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER('%` + value + `%')`;
}
