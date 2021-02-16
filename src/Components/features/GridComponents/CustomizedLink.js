import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, TABLES_NON_EDITABLE_COLUMNS, DATA_CATALOG_TABLE } from '../../context/FieldTypesConfig';
import { Link } from "react-router-dom";
// import LinkLogo16 from '../../../media/LinkIcon/link16x16.svg';
import LinkLogo12 from '../../../media/LinkIcon/link12x12.svg';
import { getSearchFieldValueExact } from '../../sql_statements';
import { steps } from '../../context/privilege';
const startingLo = 1;
const startingHi = steps;

const selectCount = `SELECT COUNT(*) as COUNT`;
const caseAdmin = `'READ/WRITE' as PRIVILEGE`;
    
const caseOperator = `CASE
    WHEN AA.USERNAME IS NOT NULL
    THEN 'READ/WRITE'
    ELSE 'READ ONLY'
END AS PRIVILEGE`;

const getPrivilege3cases = (isAdmin, isSteward, username) => {
    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let privilegeLogic = ``;
    if(isAdmin){
        privilegeLogic = caseAdmin;
    }else if(isSteward){
        privilegeLogic = caseSteward;
    }else{
        privilegeLogic = caseOperator;
    }

    return privilegeLogic;
}

const getPrivilege2cases = (isAdmin, username) => {
    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let privilegeLogic = ``;
    if(isAdmin){
        privilegeLogic = caseAdmin;
    }else{
        privilegeLogic = caseSteward;
    }

    return privilegeLogic;
}

const getPrivilegeItemsLineage = (isAdmin, isSteward, username) => {
    const caseSteward = `CASE
        WHEN J.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    const caseOperator = `CASE
        WHEN J.USERNAME IS NOT NULL
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let privilegeLogic = ``;
    if(isAdmin){
        privilegeLogic = caseAdmin;
    }else if(isSteward){
        privilegeLogic = caseSteward;
    }else{
        privilegeLogic = caseOperator;
    };

    return privilegeLogic;
}

const sql_linking_Lineage_To_ETLF_Extract_Config = (value) => {
    const sql = `SELECT EC.*, COALESCE(A.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, row_number() OVER(ORDER BY EC.ETLF_EXTRACT_CONFIG ASC) RN
    FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EC
    LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" A
    ON EC.GROUP_ID = A.APP_ID
    WHERE UPPER(TRIM(EC.EXTRACT_CONFIG_ID)) = UPPER(TRIM('`+ value + `'));`;
    // ` + getSearchFieldValueExact(searchObj) + `;`

    const body = `
    FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EC
    LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" A
    ON EC.GROUP_ID = A.APP_ID
    WHERE UPPER(TRIM(EC.EXTRACT_CONFIG_ID)) = UPPER(TRIM('`+ value + `'))`;

    return body
}

const sql_linking_dataSteward_To_dataDomain = (isAdmin, username, value) => {
    console.log('sql_linking_dataSteward_To_dataDomain...');
    console.log(value);

    let privilegeLogic = getPrivilege2cases(isAdmin, username);

    const sql = `SELECT DD.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON DSD.DATA_STEWARD_ID = DS.DATA_STEWARD_ID
    WHERE UPPER(TRIM(DS.DATA_STEWARD_ID)) = UPPER(TRIM('` + value + `'));`

    const body = `
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON DSD.DATA_STEWARD_ID = DS.DATA_STEWARD_ID
    WHERE UPPER(TRIM(DS.DATA_STEWARD_ID)) = UPPER(TRIM('` + value + `'))
    `
    // console.log(sql);

    return body;
}

const sql_linking_dataDomain_To_dataSteward = (isAdmin, username, value) => {
    console.log('sql_linking_dataDomain_To_dataSteward...');
    console.log(value);

    let privilegeLogic = getPrivilege2cases(isAdmin, username);

    const sql = `SELECT DS.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DS.DATA_STEWARD_ID ASC) RN
    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    WHERE UPPER(TRIM(DD.DATA_DOMAIN_ID)) = UPPER(TRIM('` + value + `'))
    ;`

    const body = `
    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    WHERE UPPER(TRIM(DD.DATA_DOMAIN_ID)) = UPPER(TRIM('` + value + `'))
    `;

    console.log(body);

    return body;
}

const sql_linking_dataDomain_To_catalogEntities = (isAdmin, isSteward, username, value) => {
    console.log('sql_linking_dataDomain_To_catalogEntities...');
    console.log(value);
    
    let privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);

    const sql = `FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
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
    WHERE UPPER(TRIM(C.DATA_DOMAIN_ID)) = UPPER(TRIM('` + value + `'));`

    const body = `
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
    WHERE UPPER(TRIM(C.DATA_DOMAIN_ID)) = UPPER(TRIM('` + value + `'))`

    // console.log(sql);

    return body;
}

const sql_linking_catalogEntities_To_dataDomain = (isAdmin, username, value) => {
    console.log('sql_linking_catalogEntities_To_dataDomain...');
    console.log(value);

    let privilegeLogic = getPrivilege2cases(isAdmin, username);

    const sql = `SELECT DD.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    ON (DD.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES C
    ON (B.CATALOG_ENTITIES_ID = C.CATALOG_ENTITIES_ID )
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
    ON (DSD.DATA_DOMAIN_ID = DD.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)
    WHERE UPPER(TRIM(C.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'));`

    const body = `
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DDsql_linking_catalogEntities_To_dataDomain
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    ON (DD.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES C
    ON (B.CATALOG_ENTITIES_ID = C.CATALOG_ENTITIES_ID )
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
    ON (DSD.DATA_DOMAIN_ID = DD.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)
    WHERE UPPER(TRIM(C.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'))`;

    console.log(body);

    return body;
}

//missing domain
const sql_linking_catalogEntities_To_Item_Lineage = (isAdmin, isSteward, username, value, destination) => {
    console.log('sql_linking_catalogEntities_To_catalogItems...');
    console.log(value);

    let privilegeLogic = getPrivilegeItemsLineage(isAdmin, isSteward, username);

    const sql = `SELECT C2.*, D.*, row_number() OVER(ORDER BY D.CATALOG_ENTITIES_ID ASC) RN 
    FROM SHARED_TOOLS_DEV.ETL.` + destination + ` D
    INNER JOIN (
        SELECT J.DOMAINS AS DOMAIN, J.TARGET_DATABASE, J.TARGET_SCHEMA, J.TARGET_TABLE, J.CATALOG_ENTITIES_ID, ` + privilegeLogic + ` 
        FROM (
            SELECT NVL(C.DOMAIN, '') DOMAINS, E.*, DS.EMAIL, AA.USERNAME 
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
            WHERE UPPER(TRIM(E.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'))
        ) J
    )C2
    ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE C2.CATALOG_ENTITIES_ID = '` + value + `';`

    const body = ` 
    FROM SHARED_TOOLS_DEV.ETL.` + destination + ` D
    INNER JOIN (
        SELECT J.DOMAINS AS DOMAIN, J.TARGET_DATABASE, J.TARGET_SCHEMA, J.TARGET_TABLE, J.CATALOG_ENTITIES_ID, ` + privilegeLogic + ` 
        FROM (
            SELECT NVL(C.DOMAIN, '') DOMAINS, E.*, DS.EMAIL, AA.USERNAME 
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
            WHERE UPPER(TRIM(E.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'))
        ) J
    )C2
    ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE C2.CATALOG_ENTITIES_ID = '` + value + `'`

    return body;
}

const sql_linking_ItemsLineage_To_CatalogEntities = (isAdmin, isSteward, username, value) => {
    console.log('sql_linking_catalogItems_To_catalogEntities...');
    console.log(value);

    let privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);

    const sql = `
    FROM (
        SELECT NVL(C.DOMAIN, '') DOMAINS, E.*, ` + privilegeLogic + `  
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
        WHERE UPPER(TRIM(E.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'))
    ) J`;
    
    return sql;
}

const sql_linking_ETLF_Extract_Config_To_catalogEntityLineage = (isAdmin, isSteward, username, value) => {
    console.log('sql_linking_ETLF_Extract_Config_To_catalogEntityLineage...');
    console.log(value);

    let privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);

    const sql = `SELECT D.DOMAIN, D.TARGET_DATABASE, D.TARGET_SCHEMA, D.TARGET_TABLE, A.*, D.PRIVILEGE, , row_number() OVER(ORDER BY D.CATALOG_ENTITIES_ID ASC) RN
    FROM "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITY_LINEAGE" A
    INNER JOIN (
        SELECT J.DOMAINS AS DOMAIN, J.TARGET_DATABASE, J.TARGET_SCHEMA, J.TARGET_TABLE, J.CATALOG_ENTITIES_ID, J.PRIVILEGE  
        FROM (
            SELECT NVL(C.DOMAIN, '') DOMAINS, E.*, ` + privilegeLogic + `
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
        ) J
    ) D
    ON A.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(A.EXTRACT_CONFIG_ID)) = UPPER(TRIM('` + value + `'));`

    const body = `
    FROM "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITY_LINEAGE" A
    INNER JOIN (
        SELECT J.DOMAINS AS DOMAIN, J.TARGET_DATABASE, J.TARGET_SCHEMA, J.TARGET_TABLE, J.CATALOG_ENTITIES_ID, J.PRIVILEGE  
        FROM (
            SELECT NVL(C.DOMAIN, '') DOMAINS, E.*, ` + privilegeLogic + `
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
        ) J
    ) D
    ON A.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(A.EXTRACT_CONFIG_ID)) = UPPER(TRIM('` + value + `'))`

    return body;
}

const getLinkSearchStmt = (isAdmin, isSteward, username, table, destinationTable, value) => {
    let searchStmt = '';
    // console.log("table: " + table);

    if(table === 'ETLF_EXTRACT_CONFIG'){
        searchStmt = sql_linking_ETLF_Extract_Config_To_catalogEntityLineage(isAdmin, isSteward, username, value);
    }if(table === 'ETLF_CUSTOM_CODE'){
        searchStmt = sql_linking_Lineage_To_ETLF_Extract_Config(value);
    }else if(table === 'DATA_STEWARD'){
        
        searchStmt = sql_linking_dataSteward_To_dataDomain(isAdmin, username, value);
    }else if(table === 'DATA_STEWARD_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD')
        
            searchStmt = sql_linking_dataDomain_To_dataSteward(isAdmin, username, value);
        else if(destinationTable === 'DATA_DOMAIN' )
        
            searchStmt = sql_linking_dataSteward_To_dataDomain(isAdmin, username, value);
    }else if(table === 'CATALOG_ENTITY_DOMAIN'){
        if(destinationTable === 'DATA_DOMAIN')
        
            searchStmt = sql_linking_catalogEntities_To_dataDomain(isAdmin, username, value);
        else if(destinationTable === 'CATALOG_ENTITIES' )
        
            searchStmt = sql_linking_dataDomain_To_catalogEntities(isAdmin, isSteward, username, value); //!!!!!!!!!!!!!!!!!!! add DOMAIN
    }else if(table === 'DATA_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD')
        
            searchStmt = sql_linking_dataDomain_To_dataSteward(isAdmin, username, value);
        else if(destinationTable === 'CATALOG_ENTITIES' )
        
            searchStmt = sql_linking_dataDomain_To_catalogEntities(isAdmin, isSteward, username, value);
    }else if(table === 'CATALOG_ENTITIES'){
        if(destinationTable === 'CATALOG_ITEMS') 
        
            searchStmt =  sql_linking_catalogEntities_To_Item_Lineage(isAdmin, isSteward, username, value, 'CATALOG_ITEMS'); //!!!!!!!!!!!!!!!!!!!
        else if(destinationTable === 'CATALOG_ENTITY_LINEAGE')
        
            searchStmt = sql_linking_catalogEntities_To_Item_Lineage(isAdmin, isSteward, username, value, 'CATALOG_ENTITY_LINEAGE') //!!!!!!!!!!!!!!!!!!!
        else if(destinationTable === 'DATA_DOMAIN')
        
            searchStmt = sql_linking_catalogEntities_To_dataDomain(isAdmin, username, value);
    }else if(table === 'CATALOG_ITEMS'){
        
        searchStmt = sql_linking_ItemsLineage_To_CatalogEntities(isAdmin, isSteward, username, value);
    }else if(table === 'CATALOG_ENTITY_LINEAGE'){
        if(destinationTable === 'CATALOG_ENTITIES') 
            searchStmt = sql_linking_ItemsLineage_To_CatalogEntities(isAdmin, isSteward, username, value);
        else if(destinationTable === 'ETLF_EXTRACT_CONFIG')
            searchStmt = sql_linking_Lineage_To_ETLF_Extract_Config(value);
    }

    console.log(searchStmt);
    // setSelectAllStmtEveryX();
    // multiSearchSqlStatementFirstX = multiSearchSqlStatement +`
    // WHERE RN >= ` + startingLo +` AND RN <= ` + startingHi;

    return searchStmt;
}


const getBodyAndSelectCriteria = (isAdmin, isSteward, username, table, destinationTable, value) => {
    let privilegeLogic = '';
    let selectCriteria = '';
    let body = '';
    let searchStmt='';
    // console.log("table: " + table);

    if(table === 'ETLF_EXTRACT_CONFIG'){
        // privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);
        selectCriteria = 'SELECT D.DOMAIN, D.TARGET_DATABASE, D.TARGET_SCHEMA, D.TARGET_TABLE, A.*, D.PRIVILEGE, row_number() OVER(ORDER BY A.CATALOG_ENTITY_LINEAGE_ID ASC) RN'
        body = sql_linking_ETLF_Extract_Config_To_catalogEntityLineage(isAdmin, isSteward, username, value);
    }if(table === 'ETLF_CUSTOM_CODE'){
        selectCriteria = '';
        body = sql_linking_Lineage_To_ETLF_Extract_Config(value);
    }else if(table === 'DATA_STEWARD'){
        privilegeLogic = getPrivilege2cases(isAdmin, username);
        selectCriteria = 'SELECT DD.*, ' + privilegeLogic + ', row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN ';
        body = sql_linking_dataSteward_To_dataDomain(isAdmin, username, value);
        //
    }else if(table === 'DATA_STEWARD_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD'){
            privilegeLogic = getPrivilege2cases(isAdmin, username);
            selectCriteria = `SELECT DS.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DS.DATA_STEWARD_ID ASC) RN`;
            body = sql_linking_dataDomain_To_dataSteward(isAdmin, username, value);
            //
        }else if(destinationTable === 'DATA_DOMAIN' ){
            privilegeLogic = getPrivilege2cases(isAdmin, username);
            selectCriteria = 'SELECT DD.*, ' + privilegeLogic + ', row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN ';
            body = sql_linking_dataSteward_To_dataDomain(isAdmin, username, value);
        }   //
    }else if(table === 'CATALOG_ENTITY_DOMAIN'){
        if(destinationTable === 'DATA_DOMAIN'){
            privilegeLogic = getPrivilege2cases(isAdmin, username);
            selectCriteria = `SELECT DD.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN`
            body = sql_linking_catalogEntities_To_dataDomain(isAdmin, username, value);
            //
        }else if(destinationTable === 'CATALOG_ENTITIES' ){
            privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);
            selectCriteria = `SELECT C.DOMAIN, E.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY E.CATALOG_ENTITIES_ID ASC) RN`
            body = sql_linking_dataDomain_To_catalogEntities(isAdmin, isSteward, username, value); 
            //
        }
    }else if(table === 'DATA_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD'){
            privilegeLogic = getPrivilege2cases(isAdmin, username);
            selectCriteria = `SELECT DS.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DS.DATA_STEWARD_ID ASC) RN`;
            body = sql_linking_dataDomain_To_dataSteward(isAdmin, username, value);
            //
        }
        else if(destinationTable === 'CATALOG_ENTITIES' ){
            privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);
            selectCriteria = `SELECT C.DOMAIN, E.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY E.CATALOG_ENTITIES_ID ASC) RN`
            body = sql_linking_dataDomain_To_catalogEntities(isAdmin, isSteward, username, value);
            //
        }
    }else if(table === 'CATALOG_ENTITIES'){
        if(destinationTable === 'CATALOG_ITEMS'){
            // privilegeLogic = getPrivilegeItemsLineage(isAdmin, isSteward, username);
            selectCriteria = `SELECT C2.*, D.*, row_number() OVER(ORDER BY D.CATALOG_ENTITIES_ID ASC) RN`;
            body =  sql_linking_catalogEntities_To_Item_Lineage(isAdmin, isSteward, username, value, 'CATALOG_ITEMS'); 
            //
        }else if(destinationTable === 'CATALOG_ENTITY_LINEAGE'){
            // privilegeLogic = getPrivilegeItemsLineage(isAdmin, isSteward, username);
            selectCriteria = `SELECT C2.*, D.*, row_number() OVER(ORDER BY D.CATALOG_ENTITIES_ID ASC) RN`;
            body = sql_linking_catalogEntities_To_Item_Lineage(isAdmin, isSteward, username, value, 'CATALOG_ENTITY_LINEAGE') //!!!!!!!!!!!!!!!!!!!
            //
        }else if(destinationTable === 'DATA_DOMAIN'){
            privilegeLogic = getPrivilege2cases(isAdmin, username);
            selectCriteria = `SELECT DD.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN`
            body = sql_linking_catalogEntities_To_dataDomain(isAdmin, username, value);
            //
        }
    }else if(table === 'CATALOG_ITEMS'){
        // privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);
        selectCriteria = `SELECT J.DOMAINS AS DOMAIN, J.*, row_number() OVER(ORDER BY J.CATALOG_ENTITIES_ID ASC) RN`;
        body = sql_linking_ItemsLineage_To_CatalogEntities(isAdmin, isSteward, username, value);
        //
    }else if(table === 'CATALOG_ENTITY_LINEAGE'){
        if(destinationTable === 'CATALOG_ENTITIES'){
            // privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);
            selectCriteria = `SELECT J.DOMAINS AS DOMAIN, J.*, row_number() OVER(ORDER BY J.CATALOG_ENTITIES_ID ASC) RN`;
            body = sql_linking_ItemsLineage_To_CatalogEntities(isAdmin, isSteward, username, value);
            //
        }else if(destinationTable === 'ETLF_EXTRACT_CONFIG'){
            selectCriteria = `SELECT EC.*, COALESCE(A.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, row_number() OVER(ORDER BY EC.EXTRACT_CONFIG_ID ASC) RN`;
            body = sql_linking_Lineage_To_ETLF_Extract_Config(value);
        }
    }

    const res = {
        selectCriteria: selectCriteria,
        bodySQL: body
    }

    return res;
}


const CustomizedLink = ({ row }) => {
    const {
        debug, username , table, setSelectAllStmtEveryX
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);

    const linkedTablesObject = fieldTypesConfigs[table]['links'];

    const getLinkedValue = () => {
        let value = ''
        console.log(row);
        switch(table){
            case 'ETLF_EXTRACT_CONFIG':
                value = row['EXTRACT_CONFIG_ID'];
                break;
            case 'DATA_DOMAIN':
                value = row['DOMAIN'];
                break;
            case 'DATA_STEWARD':
                value = row['FNAME'] + ' ' + row['LNAME'] + ': ' + row['EMAIL'];
                break;
            case 'DATA_STEWARD_DOMAIN':
                break;
            case 'CATALOG_ENTITY_DOMAIN':
                value = row['DOMAIN'] + ' - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'];
                break;
            case 'CATALOG_ENTITIES':
                value = row['DOMAIN'] + ' - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'];
                break;
            case 'CATALOG_ITEMS':
                value = row['DOMAIN'] + ' - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'] + ' - ' + row['COLUMN_NAME'];
                break;
            case 'CATALOG_ENTITY_LINEAGE':
                value = 'EXTRACT_CONFIG_ID - ' + row['EXTRACT_CONFIG_ID'];
                break;
            default:
                break;
        }

        console.log(value);
        return value;
    }

    return(
        <div style={{'marginTop': '30px'}}>
            {(Object.keys(linkedTablesObject)).map(destinationTable => {
                // console.log("linked table: " + destinationTable)
                const criteria = linkedTablesObject[destinationTable];
                // console.log("search columns: " + criteria);

                let searchObj = {};
                searchObj[criteria] = row[criteria];
                console.log(searchObj);

                
                // let searchStmt = getLinkSearchStmt(isAdmin, isSteward, username, table, destinationTable, row[criteria]);
                
                //new CODE
                const bodyAndSelectCriteria = getBodyAndSelectCriteria(isAdmin, isSteward, username, table, destinationTable, row[criteria]);
                const selectCriteria = bodyAndSelectCriteria['selectCriteria'];
                const bodySQL = bodyAndSelectCriteria['bodySQL'];  

                const getRowsCountStmt = selectCount + bodySQL;
                const linkingSqlStatement = `SELECT * FROM (
                    ` + selectCriteria + `
                    ` + bodySQL + `    
                )
                `;
                setSelectAllStmtEveryX(linkingSqlStatement);
                const linkingSqlStatementFirstX = linkingSqlStatement +`
                WHERE RN >= ` + startingLo +` AND RN <= ` + startingHi;
                //also had to join 3 tables entities to domain
                
                console.log(getRowsCountStmt);
                console.log(linkingSqlStatementFirstX);
                console.log("\n***************************************************************\n")

                return(
                    <div style={{'marginBottom': '10px'}}>
                        <Link 
                            to={{
                                // pathname: '/datacataloglinked',
                                pathname: DATA_CATALOG_TABLE.indexOf(destinationTable) >= 0 ? '/datacatalog' : '/etlframework',
                                state: {
                                    'table': destinationTable,
                                    // 'searchStmt': searchStmt,
                                    'countStmt': getRowsCountStmt,
                                    'searchStmt': linkingSqlStatementFirstX,
                                    'filterState': {
                                        'table': table,
                                        'value': getLinkedValue()
                                    }
                                }
                            }}
                        >
                            <img 
                                style={{'float': 'left'}} 
                                src={LinkLogo12} 
                                alt="React Logo" 
                                title={'This will link to table ' + destinationTable}
                            /> Link to table {destinationTable}
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}

export default CustomizedLink;