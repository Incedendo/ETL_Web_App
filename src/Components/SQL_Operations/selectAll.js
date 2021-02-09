import { getCompositeValue, getMultiCompositeValues } from '../sql_statements';

export const select_all_etl_tables = (username, db, schema, table, groupIDColumn, start, end) => {
    let sql_statement = 
    // `SELECT * FROM(
    `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
    row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn,
    COUNT(*) OVER() total_num_rows
    FROM "`+  db + `"."` + schema + `"."` +  table + `" ec
    JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
    ON ec.` + groupIDColumn + ` = auth.APP_ID AND auth.USERNAME = '`
            + username.toUpperCase() + `';`;

    return sql_statement;
}

// NO NEED FOR PRIVILEGE BC ALL COLUMNS ARE NOT EDITABLE WHEN EXPANDED
export const select_all_DATA_STEWARD_DOMAIN = `SELECT C.DOMAIN, B.FNAME, B.LNAME, B.EMAIL, E.*
    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN E
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD B 
    ON (E.DATA_STEWARD_ID = B.DATA_STEWARD_ID)  
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)`;

// NO NEED FOR PRIVILEGE BC ALL COLUMNS ARE NOT EDITABLE WHEN EXPANDED
export const select_all_CATALOG_ENTITY_DOMAIN = `SELECT C.DOMAIN, B.TARGET_DATABASE, B.TARGET_SCHEMA, B.TARGET_TABLE, E.*
    FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN E
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES B 
    ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID);`;

export const select_all_multi_field_catalog = (db, schema, table) => {
    let sql_statement = `SELECT ec.*, 'ADMIN' AS PRIVILEGE
    FROM "`+
        db + `"."` +
        schema + `"."` +
        table + `" ec 
    `;
    
return sql_statement;
}

export const select_all_multi_field_catalog_with_Extra_columns_joined = (
    db, schema, table, 
    joinedTable, joinedColumms, joinedCriterion
) => {
    // console.log(joinedColumms);
    // SELECT joined.TARGET_DATABASE, joined.TARGET_SCHEMA, joined.TARGET_TABLE, ec.*, 'READ ONLY' AS PRIVILEGE

    let extraJoinedColumns = '';
    joinedColumms.map(col => extraJoinedColumns += 'joined.' + col + ', ');
    console.log(extraJoinedColumns);
    
    let sql_statement = `SELECT ` + extraJoinedColumns + ` ec.*, 'READ/WRITE' AS PRIVILEGE
    FROM "`+ db + `"."` + schema + `"."` + table + `" ec ` + `
    JOIN "`+ db + `"."` + schema + `"."` + joinedTable + `" joined ` + `
    ON ec.` + joinedCriterion + ' = joined.' + joinedCriterion + `
    ORDER BY joined.TARGET_DATABASE, joined.TARGET_SCHEMA, joined.TARGET_TABLE;`;
    
    return sql_statement;
}