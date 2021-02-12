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
    ON ec.` + group_ID_col + ` = auth.APP_ID AND auth.USERNAME = UPPER(TRIM('`
    + username + `'))
);`;
// WHERE rn BETWEEN `+ start + ` AND ` + end + ';';

    // console.log(sql_statement);

    return sql_statement
}

export const search_multi_field = (username, db, schema, table, groupIDColumn, currentSearchObj, start, end) => {
    
    // console.log(currentSearchObj);
    // if(table === 'ETLFCALL' && 'GROUP_ID' in currentSearchObj){
    //     currentSearchObj['WORK_GROUP_ID'] = currentSearchObj['GROUP_ID'];
    //     delete currentSearchObj['WORK_GROUP_ID'];
    // }
    
    let sql_statement = 
    // `SELECT * FROM(
    `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
    row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn,
    COUNT(*) OVER() total_num_rows
    FROM "`+  db + `"."` + schema + `"."` +  table + `" ec
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
    ON ec.` + groupIDColumn + ` = auth.APP_ID AND auth.USERNAME = UPPER(TRIM('`
            + username + `'))
    WHERE ` + getSearchFieldValue(currentSearchObj) + ';';
// WHERE rn BETWEEN `+ start + ` AND ` + end;

    return sql_statement;
}

export const search_multi_field_catalog = (username, db, schema, table, currentSearchObj, start, end) => {
    let sql_statement = `SELECT * FROM(
    SELECT ec.*, 'READ/WRITE' AS PRIVILEGE
    FROM "`+
        db + `"."` +
        schema + `"."` +
        table + `" ec 
    WHERE ` + getSearchFieldValue(currentSearchObj) + `
    );`;
    
    return sql_statement;
}

export const search_multi_field_catalog_DataSteward = (privilegeLogic, db, schema, table, currentSearchObj, start, end) => {
    let sql_statement = `SELECT * FROM(
    SELECT ec.*, ` + privilegeLogic + `
    FROM "`+
        db + `"."` +
        schema + `"."` +
        table + `" ec 
    WHERE ` + getSearchFieldValue(currentSearchObj) + `
    );`;
    
    return sql_statement;
}

export const search_multi_field_catalog_DataDomain = (privilegeLogic, db, schema, table, currentSearchObj, start, end) => {
    let sql_statement = `SELECT * FROM(
    SELECT ec.*, ` + privilegeLogic + `
    FROM "`+
        db + `"."` +
        schema + `"."` +
        table + `" ec 
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
    ON (DSD.DATA_DOMAIN_ID = ec.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)
    WHERE ` + getSearchFieldValue(currentSearchObj) + `
    );`;
    
    return sql_statement;
}

export const search_ItemsLineage_joined_Entity_Domain = (privilegeLogic, table, currentSearchObj) => {
    console.log(currentSearchObj);
    const DOMAIN = 'DOMAIN' in currentSearchObj ? currentSearchObj['DOMAIN'] : '';

    let sql_statement = `SELECT J.DOMAINS AS DOMAIN, J.*
    FROM (
        SELECT NVL(C.DOMAIN, '') DOMAINS, E.TARGET_DATABASE, E.TARGET_SCHEMA, E.TARGET_TABLE, I.*, ` + privilegeLogic + `
        FROM SHARED_TOOLS_DEV.ETL.` + table + ` I
        INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
        ON (I.CATALOG_ENTITIES_ID = E.CATALOG_ENTITIES_ID
            AND ` + getMultiCompositeValues(currentSearchObj, 'E', ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE']) + `)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
        ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION AA
        ON (AA.DOMAIN = C.DOMAIN)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
        ON (DSD.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
        ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)
        WHERE ` + `UPPER(TRIM(DOMAINS)) LIKE UPPER(TRIM('%` + DOMAIN + `%'))
        ` + getSearchFieldValueExcludingColumns(currentSearchObj, ['DOMAIN', 'TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE'], 'I') + `
    ) J`
    
    
    return sql_statement;
}

export const search_CATALOG_ENTITIES_JOINED_DOMAIN = (privilegeLogic, currentSearchObj) =>{
    console.log(currentSearchObj);

    const DOMAIN = 'DOMAIN' in currentSearchObj ? currentSearchObj['DOMAIN'] : '';
    const TARGET_DATABASE = 'TARGET_DATABASE' in currentSearchObj ? currentSearchObj['TARGET_DATABASE'] : '';
    const TARGET_SCHEMA = 'TARGET_SCHEMA' in currentSearchObj ? currentSearchObj['TARGET_SCHEMA'] : '';
    const TARGET_TABLE = 'TARGET_TABLE' in currentSearchObj ? currentSearchObj['TARGET_TABLE'] : '';
    const COMMENTS = 'COMMENTS' in currentSearchObj ? `AND UPPER(TRIM(E.COMMENTS)) LIKE UPPER(TRIM('%` + currentSearchObj['COMMENTS'] + `%'))` : '';
    

    // let sql_statement = `SELECT C.DOMAIN, C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    // FROM
    // (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
    //   FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
    //   INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    //   ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
    //   WHERE ` + getMultiCompositeValues(currentSearchObj, 'A', ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE']) + 
    // `) C1
    // INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    // ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    // WHERE ` + getCompositeValue(currentSearchObj, 'C', 'DOMAIN') + ';';

    let sql_statement = 
    `SELECT J.DOMAINS AS DOMAIN, J.TARGET_DATABASE, J.TARGET_SCHEMA, J.TARGET_TABLE, J.COMMENTS, J.CATALOG_ENTITIES_ID, J.CREATEDDATE, J.LASTMODIFIEDDATE, J.PRIVILEGE
    FROM (
        SELECT NVL(C.DOMAIN, '') DOMAINS, E.*,  ` + privilegeLogic + `
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
        ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID )
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DOMAIN_AUTHORIZATION AA
        ON (AA.DOMAIN = C.DOMAIN)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
        ON (DSD.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
        ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)
        WHERE UPPER(TRIM(E.TARGET_DATABASE)) LIKE UPPER(TRIM('%` + TARGET_DATABASE + `%'))
        AND UPPER(TRIM(E.TARGET_SCHEMA)) LIKE UPPER(TRIM('%` + TARGET_SCHEMA + `%'))
        AND UPPER(TRIM(E.TARGET_TABLE)) LIKE UPPER(TRIM('%` + TARGET_TABLE + `%'))
        ` + COMMENTS + `
        AND UPPER(TRIM(DOMAINS)) LIKE UPPER(TRIM('%` + DOMAIN + `%'))
    ) J;`

    console.log(sql_statement);

    return sql_statement;
}

export const search_composite_DATA_STEWARD_DOMAIN = ( currentSearchObj) =>{
    console.log(currentSearchObj);

    let sql_statement = `SELECT C1.FNAME, C1.LNAME, C1.EMAIL, C1.DATA_STEWARD_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE
    FROM
    (SELECT A.FNAME, A.LNAME, A.EMAIL, B.DATA_STEWARD_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
      FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD A
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
      ON A.DATA_STEWARD_ID = B.DATA_STEWARD_ID
      WHERE ` + getCompositeValue(currentSearchObj, 'A', 'EMAIL') + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    WHERE ` + getCompositeValue(currentSearchObj, 'C', 'DOMAIN') + ';';
    return sql_statement;
}

export const search_composite_CATALOG_ENTITY_DOMAIN = (currentSearchObj) =>{
    console.log(currentSearchObj);

    let sql_statement = `SELECT C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE
    FROM
    (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
      FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
      INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
      ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      WHERE ` + getMultiCompositeValues(currentSearchObj, 'A', ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE']) + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    WHERE ` + getCompositeValue(currentSearchObj, 'C', 'DOMAIN') + ';';
    return sql_statement;
}

export const getSearchFieldValueExact = (currentSearchObj) => {
    let res = ''
    for (let item in currentSearchObj){
        if(Object.keys(currentSearchObj).indexOf(item) > 0){
            res += `AND UPPER(TRIM(ec.` + item + `)) = UPPER(TRIM('` + currentSearchObj[item] + `'))
            `;
        }else{
            res += `UPPER(TRIM(ec.` + item + `)) = UPPER(TRIM('` + currentSearchObj[item] + `'))
            `;
        }
    }
    return res;
}

export const getSearchFieldValue = (currentSearchObj) => {
    let res = ''
    for (let item in currentSearchObj){
        if(Object.keys(currentSearchObj).indexOf(item) > 0){
            res += `AND UPPER(TRIM(ec.` + item + `)) LIKE UPPER(TRIM('%` + currentSearchObj[item] + `%'))
            `;
        }else{
            res += `UPPER(TRIM(ec.` + item + `)) LIKE UPPER(TRIM('%` + currentSearchObj[item] + `%'))
            `;
        }
    }
    return res;
}

const getSearchFieldValueExcludingColumns = (currentSearchObj, excludedFields, table) => {
    
    let validColumns = (Object.keys(currentSearchObj)).filter(searchCol => excludedFields.indexOf(searchCol) < 0)

    console.log(validColumns);
    
    if(validColumns.length === 0)
        return '';
    
    let res = '';
    for(let item of validColumns){
        let value = item in currentSearchObj ? currentSearchObj[item] : '';
        res += `AND UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + value + `%'))
`;
        // if(validColumns.indexOf(item) > 0){
        
        //     res += `AND UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + value + `%'))
        //     `;
        // }else{
        //     res += `UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + value + `%'))
        //     `;
        // }
    }

    return res;
}

export const getSearchFieldValueJoinedColumns = (currentSearchObj, excludedFields) => {
    let res = ''
    for (let item in currentSearchObj){
        if(excludedFields.indexOf(item) < 0){
            if(Object.keys(currentSearchObj).indexOf(item) > 0){
                res += `AND UPPER(TRIM(ec.` + item + `)) LIKE UPPER(TRIM('%` + currentSearchObj[item] + `%'))
                `;
            }else{
                res += `UPPER(TRIM(ec.` + item + `)) LIKE UPPER(TRIM('%` + currentSearchObj[item] + `%'))
                `;
            }
        }else{
            if(Object.keys(currentSearchObj).indexOf(item) > 0){
                res += `AND UPPER(TRIM(joined.` + item + `)) LIKE UPPER(TRIM('%` + currentSearchObj[item] + `%'))
                `;
            }else{
                res += `UPPER(TRIM(joined.` + item + `)) LIKE UPPER(TRIM('%` + currentSearchObj[item] + `%'))
                `;
            }
        }
        
    }
    return res;
}

export const getMultiCompositeValues = (currentSearchObj, table, items) => {
    let res = '';
    let dataDomainsObj = {}

    for(let item of items){
        let value = item in currentSearchObj ? currentSearchObj[item] : '';
        if(items.indexOf(item) > 0){
        
            res += `AND UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + value + `%'))
            `;
        }else{
            res += `UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + value + `%'))
            `;
        }
    }
    return res;

    // for(let item in currentSearchObj)
    //     if(items.indexOf(item) >=0)
    //         dataDomainsObj[item] = currentSearchObj[item];
    
    // // (Object.keys(currentSearchObj)).map(col => {
    // //     if(items.indexOf(col) >=0)
    // //         dataDomainsObj[item] = currentSearchObj[item];
    // // })
    // console.log(dataDomainsObj);

    // for (let item in dataDomainsObj){
    //     const value = item in dataDomainsObj ? currentSearchObj[item] : '';;
    //     if(Object.keys(dataDomainsObj).indexOf(item) > 0){
        
    //         res += `AND UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + dataDomainsObj[item] + `%'))
    //         `;
    //     }else{
    //         res += `UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + dataDomainsObj[item] + `%'))
    //         `;
    //     }
    // }
    // return res;
}

export const getCompositeValue = (currentSearchObj, table, item) => {
    let value = item in currentSearchObj ? currentSearchObj[item] : '';
    return  `UPPER(TRIM(` + table + `.` + item + `)) LIKE UPPER(TRIM('%` + value + `%'))`;
}


