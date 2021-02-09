import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, TABLES_NON_EDITABLE_COLUMNS, DATA_CATALOG_TABLE } from '../../context/FieldTypesConfig';
import { Link } from "react-router-dom";
// import LinkLogo16 from '../../../media/LinkIcon/link16x16.svg';
import LinkLogo12 from '../../../media/LinkIcon/link12x12.svg';
import { getSearchFieldValueExact } from '../../sql_statements';

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

const getStandardSearchStmt = (destinationTable, searchObj) => {
    let sql = `SELECT ec.*, 'READ/WRITE' AS PRIVILEGE
    FROM "SHARED_TOOLS_DEV"."ETL"."` + destinationTable + `" ec
    WHERE ` + getSearchFieldValueExact(searchObj) + `
    ;`

    return sql;
}

const sql_linking_Lineage_To_ETLF_Extract_Config = (searchObj) => {
    let sql = `SELECT EC.*, COALESCE(A.PRIVILEGE, 'READ ONLY') AS PRIVILEGE
    FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EC
    LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" A
    ON EC.GROUP_ID = A.APP_ID
    WHERE ` + getSearchFieldValueExact(searchObj) + `;`

    return sql
}

const sql_linking_dataSteward_To_dataDomain = (isAdmin, username, searchObj) => {
    console.log('sql_linking_dataSteward_To_dataDomain...');
    console.log(searchObj);

    let privilegeLogic = getPrivilege2cases(isAdmin, username);

    const sql = `SELECT A.*, ` + privilegeLogic + `
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON DSD.DATA_STEWARD_ID = DS.DATA_STEWARD_ID
    WHERE UPPER(TRIM(DS.DATA_STEWARD_ID)) = UPPER(TRIM('` + searchObj['DATA_STEWARD_ID'] + `'));`

    // console.log(sql);

    return sql;
}

const sql_linking_dataDomain_To_dataSteward = (isAdmin, username, searchObj) => {
    console.log('sql_linking_dataDomain_To_dataSteward...');
    console.log(searchObj);

    let privilegeLogic = getPrivilege2cases(isAdmin, username);

    const sql = `SELECT A.*, ` + privilegeLogic + `
    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    WHERE UPPER(TRIM(DD.DATA_DOMAIN_ID)) = UPPER(TRIM('` + searchObj['DATA_DOMAIN_ID'] + `'))
    ;`

    console.log(sql);

    return sql;
}

const sql_linking_dataDomain_To_catalogEntities = (isAdmin, isSteward, username, searchObj) => {
    console.log('sql_linking_dataDomain_To_catalogEntities...');
    console.log(searchObj);
    
    let privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);

    const sql = `SELECT C.DOMAIN, E.*, ` + privilegeLogic + `
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
    WHERE UPPER(TRIM(C.DATA_DOMAIN_ID)) = UPPER(TRIM('` + searchObj['DATA_DOMAIN_ID'] + `'));`

    // console.log(sql);

    return sql;
}

const sql_linking_catalogEntities_To_dataDomain = (isAdmin, username, searchObj) => {
    console.log('sql_linking_catalogEntities_To_dataDomain...');
    console.log(searchObj);

    let privilegeLogic = getPrivilege2cases(isAdmin, username);

    const sql = `SELECT E.*, ` + privilegeLogic + `
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    ON (E.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES C
    ON (B.CATALOG_ENTITIES_ID = C.CATALOG_ENTITIES_ID )
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD
    ON (DSD.DATA_DOMAIN_ID = DD.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON (DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID)
    WHERE UPPER(TRIM(C.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + searchObj['CATALOG_ENTITIES_ID'] + `'));`

    console.log(sql);

    return sql;
}

//missing domain
const sql_linking_catalogEntities_To_Item_Lineage = (isAdmin, isSteward, username, searchObj, destination) => {
    console.log('sql_linking_catalogEntities_To_catalogItems...');
    console.log(searchObj);

    let privilegeLogic = getPrivilegeItemsLineage(isAdmin, isSteward, username);

    const sql = `SELECT C2.*, D.*  
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
            WHERE UPPER(TRIM(E.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + searchObj['CATALOG_ENTITIES_ID'] + `'))
        ) J
    )C2
    ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE C2.CATALOG_ENTITIES_ID = '` + searchObj['CATALOG_ENTITIES_ID'] + `';`

    return sql;
}

const sql_linking_ItemsLineage_To_CatalogEntities = (isAdmin, isSteward, username, searchObj) => {
    console.log('sql_linking_catalogItems_To_catalogEntities...');
    console.log(searchObj);

    let privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);

    const sql = `SELECT J.DOMAINS AS DOMAIN, J.*
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
        WHERE UPPER(TRIM(E.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + searchObj['CATALOG_ENTITIES_ID'] + `'))
    ) J`;
    
    return sql;
}


const sql_linking_catalogEntities_To_catalogEntityLineage = searchObj => {
    console.log('sql_linking_catalogEntities_To_catalogItems...');
    console.log(searchObj);

    const sql = `SELECT *, 'READ/WRITE' AS PRIVILEGE FROM (
        SELECT C.DOMAIN, C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID
        FROM
        (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.DATA_DOMAIN_ID, B.CATALOG_ENTITIES_ID
          FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
          INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
          ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
          WHERE UPPER(TRIM(A.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + searchObj['CATALOG_ENTITIES_ID'] + `')) 
        ) C1
        INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
      )C2
      INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_LINEAGE D
      ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
      WHERE C2.CATALOG_ENTITIES_ID = '` + searchObj['CATALOG_ENTITIES_ID'] + `';`

    return sql;
}

const sql_linking_catalogItems_To_catalogEntities = searchObj => {
    console.log('sql_linking_catalogItems_To_catalogEntities...');
    console.log(searchObj);

    const sql = `SELECT C2.*
    FROM(
      SELECT C.DOMAIN, C1.*, 'READ/WRITE' AS PRIVILEGE
      FROM
      (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, A.CREATEDDATE,A.LASTMODIFIEDDATE
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
        INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
        ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      ) C1
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
      ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    )C2
    INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ITEMS D
    ON D.CATALOG_ENTITIES_ID = C2.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(D.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + searchObj['CATALOG_ENTITIES_ID'] + `'));`

    return sql;
}

const sql_linking_catalogEntityLineage_To_catalogEntities = searchObj => {
    console.log('sql_linking_catalogItems_To_catalogEntityLineage...');
    console.log(searchObj);

    const sql = `SELECT C2.*
    FROM(
      SELECT C.DOMAIN, C1.*, 'READ/WRITE' AS PRIVILEGE
      FROM
      (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, A.CREATEDDATE,A.LASTMODIFIEDDATE
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
        INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
        ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      ) C1
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
      ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    )C2
    INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_LINEAGE D
    ON D.CATALOG_ENTITIES_ID = C2.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(D.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + searchObj['CATALOG_ENTITIES_ID'] + `'));`

    return sql;
}

const sql_linking_ETLF_Extract_Config_To_catalogEntityLineage = (isAdmin, isSteward, username, searchObj) => {
    console.log('sql_linking_ETLF_Extract_Config_To_catalogEntityLineage...');
    console.log(searchObj);

    let privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);

    const sql = `SELECT D.DOMAIN, D.TARGET_DATABASE, D.TARGET_SCHEMA, D.TARGET_TABLE, A.*, D.PRIVILEGE
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
    WHERE UPPER(TRIM(A.EXTRACT_CONFIG_ID)) = UPPER(TRIM('` + searchObj['EXTRACT_CONFIG_ID'] + `'));`

    return sql;
}

const getLinkSearchStmt = (isAdmin, isSteward, username, table, destinationTable, searchObj) => {
    let searchStmt = '';
    // console.log("table: " + table);
    if(table === 'ETLF_EXTRACT_CONFIG'){
        searchStmt = sql_linking_ETLF_Extract_Config_To_catalogEntityLineage(isAdmin, isSteward, username, searchObj);
    }if(table === 'ETLF_CUSTOM_CODE'){
        searchStmt = sql_linking_Lineage_To_ETLF_Extract_Config(searchObj);
    }else if(table === 'DATA_STEWARD'){
        //
        searchStmt = sql_linking_dataSteward_To_dataDomain(isAdmin, username, searchObj);
    }else if(table === 'DATA_STEWARD_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD')
        //
            searchStmt = sql_linking_dataDomain_To_dataSteward(isAdmin, username, searchObj);
        else if(destinationTable === 'DATA_DOMAIN' )
        //
            searchStmt = sql_linking_dataSteward_To_dataDomain(isAdmin, username, searchObj);
    }else if(table === 'CATALOG_ENTITY_DOMAIN'){
        if(destinationTable === 'DATA_DOMAIN')
        //
            searchStmt = sql_linking_catalogEntities_To_dataDomain(isAdmin, username, searchObj);
        else if(destinationTable === 'CATALOG_ENTITIES' )
        //
            searchStmt = sql_linking_dataDomain_To_catalogEntities(isAdmin, isSteward, username, searchObj); //!!!!!!!!!!!!!!!!!!! add DOMAIN
    }else if(table === 'DATA_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD')
        //
            searchStmt = sql_linking_dataDomain_To_dataSteward(isAdmin, username, searchObj);
        else if(destinationTable === 'CATALOG_ENTITIES' )
        //
            searchStmt = sql_linking_dataDomain_To_catalogEntities(isAdmin, isSteward, username, searchObj);
    }else if(table === 'CATALOG_ENTITIES'){
        if(destinationTable === 'CATALOG_ITEMS') 
        //
            searchStmt =  sql_linking_catalogEntities_To_Item_Lineage(isAdmin, isSteward, username, searchObj, 'CATALOG_ITEMS'); //!!!!!!!!!!!!!!!!!!!
        else if(destinationTable === 'CATALOG_ENTITY_LINEAGE')
        //
            searchStmt = sql_linking_catalogEntities_To_Item_Lineage(isAdmin, isSteward, username, searchObj, 'CATALOG_ENTITY_LINEAGE') //!!!!!!!!!!!!!!!!!!!
        else if(destinationTable === 'DATA_DOMAIN')
        //
            searchStmt = sql_linking_catalogEntities_To_dataDomain(isAdmin, username, searchObj);
    }else if(table === 'CATALOG_ITEMS'){
        //
        searchStmt = sql_linking_ItemsLineage_To_CatalogEntities(isAdmin, isSteward, username, searchObj);
    }else if(table === 'CATALOG_ENTITY_LINEAGE'){
        if(destinationTable === 'CATALOG_ENTITIES') 
        //
            searchStmt = sql_linking_ItemsLineage_To_CatalogEntities(isAdmin, isSteward, username, searchObj);
        else if(destinationTable === 'ETLF_EXTRACT_CONFIG')
            searchStmt = sql_linking_Lineage_To_ETLF_Extract_Config(searchObj);
    }

    console.log(searchStmt);
    return searchStmt;
}

const CustomizedLink = ({ row }) => {
    const {
        debug, username , table
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

                let searchStmt = getLinkSearchStmt(isAdmin, isSteward, username, table, destinationTable, searchObj);
                    
                //also had to join 3 tables entities to domain
                
                console.log(searchStmt);

                return(
                    <div style={{'marginBottom': '10px'}}>
                        <Link 
                            to={{
                                // pathname: '/datacataloglinked',
                                pathname: DATA_CATALOG_TABLE.indexOf(destinationTable) >= 0 ? '/datacatalog' : '/etlframework',
                                state: {
                                    'table': destinationTable,
                                    'searchObj': searchObj,
                                    'searchStmt': searchStmt,
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