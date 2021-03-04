// SHARED_TOOLS_DEV.ETL.ETLF_EXTRACT_CONFIG will have GROUP_ID
// SHARED_TOOLS_DEV.ETL.etlfcall will have WORK_GROUP_ID

import { ETLF_tables } from './context/FieldTypesConfig';
import { startingLo, startingHi, caseAdmin, selectCount } from './context/privilege';

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
    
    let sql_statement = 
    `
    FROM "`+  db + `"."` + schema + `"."` +  table + `" ec
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
    ON ec.` + groupIDColumn + ` = auth.APP_ID AND auth.USERNAME = UPPER(TRIM('`
            + username + `'))
    WHERE ` + getSearchFieldValue(currentSearchObj);

    return sql_statement;
}

export const search_multi_field_catalog = (username, db, schema, table, currentSearchObj, start, end) => {
    let sql_statement = `
    FROM (
        SELECT ec.*, 'READ/WRITE' AS PRIVILEGE
        FROM "`+
            db + `"."` +
            schema + `"."` +
            table + `" ec 
        WHERE ` + getSearchFieldValue(currentSearchObj) + `
    );`;
    
    return sql_statement;
}

export const search_multi_field_catalog_DataSteward = (username, currentSearchObj) => {
    let privilegeLogic = `CASE
            WHEN ec.EMAIL = UPPER(TRIM('` + username + `'))
            THEN 'READ/WRITE'
            ELSE 'READ ONLY'
        END AS PRIVILEGE`;

    let body = `
    FROM (
        SELECT ec.*, ` + privilegeLogic + `
        FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD EC 
        WHERE ` + getSearchFieldValue(currentSearchObj) + `
    )`;
    
    return body;
}

export const search_multi_field_catalog_DataDomain = (isAdmin, caseSteward, currentSearchObj) => {
    
    let body = `
    FROM (
        SELECT EC.*
        FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN EC
        WHERE ` + getSearchFieldValue(currentSearchObj) + `
    )`;

    // let body = isAdmin 
    // ? `
    // FROM (
    //     SELECT EC.*, 'READ/WRITE' AS PRIVILEGE
    //     FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN EC
    //     WHERE ` + getSearchFieldValue(currentSearchObj) + `
    // )`
    // : `
    // FROM (
    //     SELECT EC.*, ` + caseSteward + `
    //     FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN EC
    //     LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
    //     ON (DSD.DATA_DOMAIN_ID = EC.DATA_DOMAIN_ID)
    //     LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    //     ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)
    //     WHERE ` + getSearchFieldValue(currentSearchObj) + `
    // )`
    
    return body;
}

export const search_ItemsLineage = (table, currentSearchObj) => {
    console.log(currentSearchObj);

    let body = `
    FROM (
        SELECT I.*, E.TARGET_TABLE
        FROM SHARED_TOOLS_DEV.ETL.` + table + ` I
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
        ON (I.CATALOG_ENTITIES_ID = E.CATALOG_ENTITIES_ID)
    ) EC
    WHERE ` + getSearchFieldValue(currentSearchObj);
    
    return body;
}

export const search_CATALOG_ENTITIES_JOINED_DOMAIN = currentSearchObj =>{
    console.log(currentSearchObj);
    
    const TARGET_DATABASE = 'TARGET_DATABASE' in currentSearchObj ? currentSearchObj['TARGET_DATABASE'] : '';
    const TARGET_SCHEMA = 'TARGET_SCHEMA' in currentSearchObj ? currentSearchObj['TARGET_SCHEMA'] : '';
    const TARGET_TABLE = 'TARGET_TABLE' in currentSearchObj ? currentSearchObj['TARGET_TABLE'] : '';
    
    //EACH OF THESE CAN BE NULL SO ONLY ADD FILTER IF EXPLICITLY SEARCHED FOR
    const COMMENTS = 'COMMENTS' in currentSearchObj ? `AND UPPER(TRIM(COMMENTS)) LIKE UPPER(TRIM('%` + currentSearchObj['COMMENTS'] + `%'))` : '';

    let body = `
    FROM (
        SELECT *
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES
        WHERE UPPER(TRIM(TARGET_DATABASE)) LIKE UPPER(TRIM('%` + TARGET_DATABASE + `%'))
        AND UPPER(TRIM(TARGET_SCHEMA)) LIKE UPPER(TRIM('%` + TARGET_SCHEMA + `%'))
        AND UPPER(TRIM(TARGET_TABLE)) LIKE UPPER(TRIM('%` + TARGET_TABLE + `%'))
        ` + COMMENTS + `
    )`

    // console.log(body);

    return body;
}

export const search_composite_DATA_STEWARD_DOMAIN = ( currentSearchObj) =>{
    console.log(currentSearchObj);
    let body = `
    FROM
    (SELECT A.FNAME, A.LNAME, A.EMAIL, B.DATA_STEWARD_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
      FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD A
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
      ON A.DATA_STEWARD_ID = B.DATA_STEWARD_ID
      WHERE ` + getCompositeValue(currentSearchObj, 'A', 'EMAIL') + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    WHERE ` + getCompositeValue(currentSearchObj, 'C', 'DOMAIN');
    return body;
}

export const search_composite_CATALOG_ENTITY_DOMAIN = (currentSearchObj) =>{
    console.log(currentSearchObj);
    
    let body = `
    FROM
    (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
      FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
      INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
      ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      WHERE ` + getMultiCompositeValues(currentSearchObj, 'A', ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE']) + `) C1
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    WHERE ` + getCompositeValue(currentSearchObj, 'C', 'DOMAIN');
    return body;
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

const getSearchFieldValueExcludingColumnsOuterMostWhere = (currentSearchObj, excludedFields) => {
    
    let validColumns = (Object.keys(currentSearchObj)).filter(searchCol => excludedFields.indexOf(searchCol) < 0)

    console.log(validColumns);
    
    if(validColumns.length === 0)
        return '';
    
    let res = '';
    for(let item of validColumns){
        let value = item in currentSearchObj ? currentSearchObj[item] : '';
        res += `AND UPPER(TRIM(` + item + `)) LIKE UPPER(TRIM('%` + value + `%'))
`;
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

export const getSelectAllObjDatCat = (isAdmin, isSteward, username, table) => {
    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let selectAllFrom = ``;
    let bodySQL = ``;
    let privilegeLogic = ``;
        
    if(table === 'CATALOG_ENTITIES'){

        bodySQL = `
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES`;

        selectAllFrom = `SELECT * FROM (
            SELECT *, row_number() OVER(ORDER BY CATALOG_ENTITIES_ID ASC) RN` 
            + bodySQL +`
        )`;
    }else if( table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE' ){
       
        const tableKey = table === 'CATALOG_ITEMS' ? 'CATALOG_ITEMS_ID' : 'CATALOG_ENTITY_LINEAGE_ID'
        bodySQL = `
        FROM SHARED_TOOLS_DEV.ETL.` + table + ` I
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
        ON (I.CATALOG_ENTITIES_ID = E.CATALOG_ENTITIES_ID)`;

        selectAllFrom = `SELECT * FROM (
            SELECT I.*, E.TARGET_TABLE, row_number() OVER(ORDER BY `+ tableKey +` ASC) RN`
            + bodySQL +`
        )`;
    }
    //---------------------------------ONLY ADMIN---------------------------------------
    else if(table === 'DATA_STEWARD'){
        
        bodySQL = `
        FROM "SHARED_TOOLS_DEV"."ETL"."DATA_STEWARD" DS`;
        
        selectAllFrom = `SELECT * FROM (
            SELECT DS.*, ` + caseSteward + `, row_number() OVER(ORDER BY DS.DATA_STEWARD_ID ASC) RN` 
            + bodySQL + `
        )`;
    }
    //---------------------------------STEWARD---------------------------------------
    else if(table === 'DATA_DOMAIN'){

        bodySQL = `
        FROM "SHARED_TOOLS_DEV"."ETL"."DATA_DOMAIN" DD`;

        selectAllFrom = `SELECT * FROM (
            SELECT DD.*, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN`
            + bodySQL + `
        )`;

    }else if(table === 'DATA_STEWARD_DOMAIN'){

        bodySQL = `
        FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN E
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD B 
        ON (E.DATA_STEWARD_ID = B.DATA_STEWARD_ID)  
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)`;
        
        selectAllFrom = `SELECT * FROM (
            SELECT C.DOMAIN, B.FNAME, B.LNAME, B.EMAIL, E.*, row_number() OVER(ORDER BY E.DATA_STEWARD_ID ASC) RN`
            + bodySQL + `
        )`;

    }else if(table === 'CATALOG_ENTITY_DOMAIN'){

        bodySQL = `
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN E
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES B 
        ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)  
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON (E.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID)`;

        selectAllFrom = `SELECT * FROM (
            SELECT C.DOMAIN, B.TARGET_DATABASE, B.TARGET_SCHEMA, B.TARGET_TABLE, E.*, row_number() OVER(ORDER BY E.CATALOG_ENTITIES_ID ASC) RN`
            + bodySQL + `
        )`;
    }
    

    return {
        bodySQL: bodySQL,
        selectAllFrom: selectAllFrom
    }
}

export const getMultiSearchObj = (isAdmin, isSteward, username, database, schema, table, groupIDColumn, currentSearchObj) => {

    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let privilegeLogic = '';
    let bodySQL = ``;
    let selectCriteria = ``;

    if(ETLF_tables.indexOf(table) >= 0){
        // console.log("table is in ETLF Framework");
        if(table === 'ETLF_CUSTOM_CODE'){
            bodySQL = `
            FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE" EC
            INNER JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EEC
            ON (EC.EXTRACT_CONFIG_ID = EEC.EXTRACT_CONFIG_ID)
            LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" EAA
            ON (EEC.GROUP_ID = EAA.APP_ID)
            WHERE ` + getSearchFieldValue(currentSearchObj);

            selectCriteria = `SELECT EEC.SOURCE_TABLE, EC.*, COALESCE (EAA.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, row_number() OVER(ORDER BY EC.CUSTOM_CODE_ID ASC) rn`;
        }
        else if(table === 'ETLFCALL' && ('GROUP_ID' in currentSearchObj) ){

            //update 'GROUP_ID'  to 'WORK_GROUP_ID' in searchObject
            let newSearchObj = {}
            Object.keys(currentSearchObj).map(col => col !== 'GROUP_ID' 
                ? newSearchObj[col] = currentSearchObj[col]
                : newSearchObj['WORK_GROUP_ID'] = currentSearchObj[col]
            )

            bodySQL = search_multi_field(username, database, schema, table, groupIDColumn, newSearchObj);
            selectCriteria = `SELECT ec.*, ec.WORK_GROUP_ID AS GROUP_ID, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
            row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn`;
        }else{
            bodySQL = search_multi_field(username, database, schema, table, groupIDColumn, currentSearchObj);
            selectCriteria = `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn`;
        }
    }else if(table === 'DATA_STEWARD_DOMAIN'){
        
        bodySQL = search_composite_DATA_STEWARD_DOMAIN(currentSearchObj);
        selectCriteria = `SELECT C1.FNAME, C1.LNAME, C1.EMAIL, C1.DATA_STEWARD_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, row_number() OVER(ORDER BY C1.DATA_STEWARD_ID ASC) RN`;
    
    }else if(table === 'CATALOG_ENTITY_DOMAIN'){
        
        bodySQL = search_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
        selectCriteria = `SELECT C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, row_number() OVER(ORDER BY C1.CATALOG_ENTITIES_ID ASC) RN`;
    
    }else if(table === 'DATA_STEWARD'){
        
        bodySQL = search_multi_field_catalog_DataSteward(username, currentSearchObj);
        selectCriteria = `SELECT *, row_number() OVER(ORDER BY DATA_STEWARD_ID ASC) RN`;
    
    }else if(table === 'DATA_DOMAIN'){

        bodySQL = search_multi_field_catalog_DataDomain(isAdmin, caseSteward, currentSearchObj);
        selectCriteria = `SELECT *, row_number() OVER(ORDER BY DATA_DOMAIN_ID ASC) RN`;

    }else if(table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'){

        bodySQL = search_ItemsLineage(table, currentSearchObj)
        const tableKey = table === 'CATALOG_ITEMS' ? 'CATALOG_ITEMS_ID' : 'CATALOG_ENTITY_LINEAGE_ID'
        selectCriteria = `SELECT *, row_number() OVER(ORDER BY `+ tableKey +` ASC) RN`;            

        // multiSearchSqlStatement = search_ItemsLineage_joined_Entity_Domain(privilegeLogic, table, currentSearchObj); 
    }else if(table === 'CATALOG_ENTITIES'){

        bodySQL = search_CATALOG_ENTITIES_JOINED_DOMAIN(currentSearchObj);
        selectCriteria = `SELECT *, row_number() OVER(ORDER BY CATALOG_ENTITIES_ID ASC) RN`;
        
    }

    return {
        bodySQL: bodySQL,
        selectCriteria: selectCriteria
    }
}

// destinationTable === 'DATA_DOMAIN'