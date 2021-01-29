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

export const select_all_composite_DATA_STEWARD_DOMAIN = currentSearchObj =>{
    console.log(currentSearchObj);

    let sql_statement = `SELECT C1.FNAME, C1.LNAME, C1.EMAIL, C1.DATA_STEWARD_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    FROM
    (SELECT A.FNAME, A.LNAME, A.EMAIL, B.DATA_STEWARD_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
      FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD A
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
      ON A.DATA_STEWARD_ID = B.DATA_STEWARD_ID
      WHERE ` + getCompositeValue(currentSearchObj, 'A', 'EMAIL') + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID;`;
    return sql_statement;
}

export const select_all_composite_CATALOG_ENTITY_DOMAIN = currentSearchObj =>{
    console.log(currentSearchObj);

    let sql_statement = `SELECT C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    FROM
    (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
      FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
      INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
      ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      WHERE ` + getMultiCompositeValues(currentSearchObj, 'A', ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE']) + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID;`
    return sql_statement;
}

export const select_all_multi_field_catalog = (db, schema, table) => {
    let sql_statement = `SELECT * FROM(
    SELECT ec.*, 'ADMIN' AS PRIVILEGE
    FROM "`+
        db + `"."` +
        schema + `"."` +
        table + `" ec 
    );`;
    
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